const CategorySchema = require('../models/categorySchema')
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { downloadAndSaveFile } = require('../helper/downloadAndSaveFile');
const {getPagination} = require('../helper/utils')


const addCategory = async(req, res) => {
	try{
        const categoryApiUrl = process.env.categoryApiUrl;
        const response = await axios.get(categoryApiUrl)
    

        if(!response.data.length){
            console.log('\nNo more data to save: ')
        }
        for(const item of response.data){
            const {id, title,image } = item

            const categoryDirectory = path.join(process.cwd(), `/public/downloaded_media/category_images`)
            // const categoryImagePath = path.join(categoryDirectory, `${item.title.replace(/[\/:*?"-<>|]/g, '_')}`);

            if(!fs.existsSync(categoryDirectory)){
                fs.mkdirSync(categoryDirectory, {recursive:true})
            }

            const categoryImageExtension = path.basename(image)
            const categoryImageName = `${title.replace(/[\/:*?"-<>|]/g, "_")}_${categoryImageExtension}`
            
            try{
                const categoryImage = await downloadAndSaveFile(image,categoryDirectory, categoryImageName, 60000 ); //1min timeout
                // console.log("Category image saved: ", categoryImage)
            } catch(err){
                console.log('Error saving category image: ',err.message);
                continue;
            }

            try{
                const categoryData = new CategorySchema({
                    id,
                    title, 
                    image:categoryImageName
                })
                await categoryData.save()
            } catch(err){
                console.log('Error saving category data to the database: ',err.message)
                res.status(401).json({status:false, message:"Error saving data to the database", error:err.message})
            }
            
        }
        console.log('Category image saved successfully')
        res.status(200).json({status:true, message:"Category images/data saved successfully"})
       
	} catch(err){
		console.log('Error: ',err);
		res.status(500).json({status:false, message:"Internal server error", error: err.message})
	}
}

const getCategoryList = async(req, res) => {
    try{
        const categoryImageLocalBaseUrl = process.env.categoryLocalBaseUrl
        const liveBaseUrl = process.env.LiveServerUrl
       
      
        const findCategory = await CategorySchema.find({}).select('-_id id title image')

            
        if((!findCategory) || findCategory.length == 0){
            return res.status(404).json({status:false, message:"No data to show"})
        }
        
        const categoryList = findCategory.map((data) => ({
            id:data.id,
            title: data.title,
            //image: categoryImageLocalBaseUrl + `/image/${encodeURIComponent(data.image)}`
            image: liveBaseUrl + `category_images/${encodeURIComponent(data.image)}`
        }))
        
        res.status(200).json(categoryList)
    }catch(error){
        console.log("Error-> ",error);
        res.status(500).json({status:false, message:"Internal server error while fetching category list", error:error.message})
    }
}

const getCategoryImage = async(req, res, next) => {
    try{
        const categotyImageDirectory = path.join(process.cwd(), './public/downloaded_media/category_images')
        const image = req.params.image;

        const categoryData = await CategorySchema.findOne({image}).select('-_id id title image')
        if(!categoryData){
            return res.status(404).json({status:false, message:"Category image not found"})
        }
        const categoryImage = path.join(categotyImageDirectory, `${categoryData.image}`)
        res.status(200).sendFile(categoryImage)
    }catch(error){
        console.log('Error -> ',error)
        res.status(500).json({status:false, message: "Internal server error while fetching category image", error: error.message})
    } 
}

module.exports = { 
    addCategory ,
    getCategoryList,
    getCategoryImage
}
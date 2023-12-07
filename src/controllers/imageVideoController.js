const FileSchema = require('../models/fileSchema')
const path = require('path');
const { getPagination } = require('../helper/utils');
const fs = require('fs');
const PreviewWallSchema = require('../models/previewWallSchema');


const getImageVideoList = async(req, res) => {
      try{
        const liveBaseUrl = process.env.LiveServerUrl
        const page  = req.params.page;
        const size = req.params.size;
        const search = req.query.search;
        const { limit, offset } = getPagination(page, size || 30)

        const kind = req.query.kind;
        let query = {};
        if(kind == 'image'){
          query = {kind:'image'}
        } else if(kind == 'video'){
          query = {kind:'video'}
        }
        if(search){
          const escapedSearchName = search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$g')
          query.title = {$regex: new RegExp(escapedSearchName, "i")}
        }
        const findData = await FileSchema.find(query).skip(offset).limit(limit)
        if(!findData || findData.length === 0){
          return res.status(404).json({status:false, message:"No data to show"})
        }
        const dataObject = findData.map((data) => ({
            kind: data.kind,
            title: data.title,
            premium: data.premium,
            original: data.original,
            imageVideoUrl: liveBaseUrl +`${data.kind === 'image' ? 'jpeg' : data.kind === 'video' ? "mp4" : null}/${encodeURIComponent(data.original)}`
        }))
        return res.status(200).send(dataObject)

      }catch(err){
        console.log('Error: ',err);
        res.status(500).json({status:false, message:"Internal server error: ",error:err.message})
      } 
}

const parseIndex = (file) => {
  const [index, subIndex] = file.split('_').map(part => parseInt(part) || 0)
  return [index, subIndex]
}

const addPreviewMainImage = async(req, res) => {
  try{
      const imagesFolderPath = '/Depth/';
    const folderPath = path.join(process.cwd(), 'public',imagesFolderPath )
    const files = fs.readdirSync(folderPath);

    const sortFiles = files.sort((a,b) => {
      const [indexA, subIndexA] = parseIndex(a) ;
      const [indexB, subIndexB] = parseIndex(b) ; 
      
      if(indexA !== indexB){
        return indexA - indexB
      }
      //if indices are the same, then compare sub-indices
      return subIndexA - subIndexB
    })

    let responseObj ={}

    for(let file of sortFiles){
  
      if(file){
        if(file.includes('_')){
          responseObj.mainImage = file
          await PreviewWallSchema.create({preview_image_name:responseObj.previewImage, main_image_name: responseObj.mainImage })

        }
          responseObj.previewImage = file      
      }
    }

    return res.status(200).json({status:true, message:"Image names stored in the database."})

  }catch(err){
    console.log('Error: ',err);
    res.status(500).json({status:false, message:"Internal server error", error:err.message})
  }
}

const getPreviewMainImageList = async(req, res) => {
  try{
    const liveBaseUrl = process.env.LiveServerUrl
    const page  = req.params.page;
    const size = req.params.size;

    const { limit, offset } = getPagination(page, size || 30)
    const findWallpaper = await PreviewWallSchema.find({}).skip(offset).limit(limit);
    if(!findWallpaper || findWallpaper.length === 0){
      return res.status(404).json({status:false, message:"No data to show"})
    }

    const responseObject = findWallpaper.map((data) => {
      const preImg = data.preview_image_name;
      const mainImg = data.main_image_name

      const resObj = {
        preview_url:`${liveBaseUrl}Depth/${preImg}`,
        main_url: `${liveBaseUrl}Depth/${mainImg}`
      }
      return resObj
    })
    res.status(200).json(responseObject)
   
  }catch(err){
    console.log('Error: ',err);
    res.status(500).json({status:false, message:"Internal server error", error:err.message})
  }
}
module.exports = {
    getImageVideoList,
    addPreviewMainImage,
    getPreviewMainImageList
}
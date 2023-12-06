const FileSchema = require('../models/fileSchema')
const path = require('path');
const { getPagination } = require('../helper/utils');
const fs = require('fs');
const PreviewWallSchema = require('../models/previewWallSchema');


const getImageVideoList = async(req, res) => {
      try{
        // const baseUrl = process.env.imageVideoLocalBaseUrl
        const liveBaseUrl = process.env.LiveServerUrl
        const imagePath = path.join(process.cwd(), './public/downloaded_media/jpeg')
        const page  = req.params.page;
        const size = req.params.size;
        const totalItems = 30
        const { limit, offset } = getPagination(page, size || 30)

        const kind = req.query.kind;
        let query = {};
        if(kind == 'image'){
          query = {kind:'image'}
        } else if(kind == 'video'){
          query = {kind:'video'}
        }
        const findData = await FileSchema.find(query).skip(offset).limit(limit)
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

const AddpreviewMainImage = async(req, res) => {
  try{
    const liveBaseUrl = process.env.LiveServerUrl 
    const imagesFolderPath = '/Depth/';
    
    const imagePath = `${liveBaseUrl}Depth/`
    const folderPath = path.join(process.cwd(), 'public',imagesFolderPath )
    const files = await fs.readdirSync(folderPath);

    await Promise.all(files.map(async (file) => {
      const isPreview = file.includes('');
      const wallpaper = new PreviewWallSchema({ image_name: file, isPreview });
      await wallpaper.save();
    }));
    res.status(200).json({status:true, message:"Image names stored in the database."})

  }catch(err){
    console.log('Error: ',err);
    res.status(500).json({status:false, message:"Internal server error", error:err.message})
  }
}

const previewMainImageList = async(req, res) => {
  try{
    const liveBaseUrl = process.env.LiveServerUrl
    const page  = req.params.page;
    const size = req.params.size || 30;

    const { limit, offset } = getPagination(page, size || 30)
    const images = await PreviewWallSchema.find({}).skip(offset).limit(limit);
    const imagePairs = {};

    images.forEach(image => {
      const imageNameWithoutExtension = image.image_name.split('.')[0];

      if (imageNameWithoutExtension.includes('_')) {
        const mainImageName = imageNameWithoutExtension.split('_')[0];
        const previewImageName = imageNameWithoutExtension;

        if (!imagePairs[mainImageName]) {
          imagePairs[mainImageName] = {
            preview_url: `${process.env.LiveServerUrl}Depth/${mainImageName}.png`,
            main_url: `${process.env.LiveServerUrl}Depth/${previewImageName}.png`,
          };
        }
      }
    });

    const responseArray = Object.values(imagePairs);
    res.json(responseArray);
  }catch(err){
    console.log('Error: ',err);
    res.status(500).json({status:false, message:"Internal server error", error:err.message})
  }
}
module.exports = {
    getImageVideoList,
    AddpreviewMainImage,
    previewMainImageList
}
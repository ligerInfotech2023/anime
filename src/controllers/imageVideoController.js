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
        const findData = await FileSchema.find(query).lean()  //.skip(offset).limit(limit)
        if(!findData || findData.length === 0){
          return res.status(404).json({status:false, message:"No data to show"})
        }

        //name of images/videos that is move to the last page
        const nameToMove = [
          'Naruto_AMV_a7147f8a3cf85e91a1f0d33175892d83.mp4',
          'Anime_AMV_fe8cc20cb8ca2764b0126e71be9c73f2.mp4',
          'Tokyo_ghoul_13bc92be3a2517bf558252192e02c849.mp4',
          'Naruto_Eyes_d1f393e373957654eef5d4b6b4e7e3ee.mp4',
          'Anime_AMV_d66a5ae2f291387d642e56aaf00508b2.mp4',
          'Anime_AMV_7a17ef93f6b11ada9fa4673ffcaf636a.mp4',
          'Otsosuki_Family_e8a32e6330e9293b0ff479965ce6150f.mp4',
          'ola_star_3635115b0bbd6d40545d5f6910d47ca4.mp4',
          'Hanser_1b2a593fde678441c928cde5634f8594.mp4',
          'Anime_AMV_45fb4ca1ddc19955649c0f98188816e8.mp4',
          'Angle_Beats_7704c58dfbaaf9f5a1e3c1356e428b4f.mp4',
          'Anime_AMV_c88450aa15df9bb30cc70927749c5cd1.mp4',
          'Pokemon_8d56ab961b7bdf478151356772bbb527.mp4',
          'Anime_AMV_97c749141da4b81c63223808aa497088.mp4',
          'Death_Note_570a550aa88a6b22639c1f2fdeb734a9.mp4',
        ]
       
        const necesssaryData = findData.filter(data => !nameToMove.includes(data.original));
        const dataToMove = findData.filter(data => nameToMove.includes(data.original))
       
        const finalData = [...necesssaryData, ...dataToMove]

        if(offset >= finalData.length){
          return res.status(404).json({status:false, message:"No data to show"})
        }
        const adjustOffset = Math.min(offset, Math.max(0,finalData.length - limit))
        const paginatedData = finalData.slice(adjustOffset, adjustOffset + limit)

        const dataObject = paginatedData.map((data) => ({
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
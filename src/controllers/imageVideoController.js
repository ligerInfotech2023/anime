const FileSchema = require('../models/fileSchema')
const fs =  require('fs')
const axios = require('axios');
const path = require('path');
const downloadAndSaveFile = require('../helper/downloadAndSaveFile');
const { getPagination } = require('../helper/utils');

const apiUrl = 'https://dev.kyoani-publisher.xyz/api/wallpaper/all/created/1/p2pqlsnjHgdxX21GFRAYyLvNBe3zcsSz/16edd7cf-2525-485e-b11a-3dd35f382457/';

const apiBaseUrl = 'https://dev.kyoani-publisher.xyz/api/wallpaper/all/created/'
const apiToken = 'p2pqlsnjHgdxX21GFRAYyLvNBe3zcsSz'
const apiKey = '16edd7cf-2525-485e-b11a-3dd35f382457'



const processPage = async(pageNumber) => {
    try{
        const apiUrl = `${apiBaseUrl}${pageNumber}/${apiToken}/${apiKey}`
        const response = await axios.get(apiUrl);
        const responseData = response.data;
        // console.log('pageNumber: ',pageNumber)
        if (Array.isArray(responseData) && responseData.length > 0) {
            for (const item of responseData) {
              const { id, kind, title, premium, original } = item;
             
              // Determine the type of the file (image or video) based on the 'kind' field
            // const fileType = kind === 'image' ? 'jpeg' : kind === 'video' ? 'mp4' : null;
            const fileType = kind === 'video' ? 'mp4' : null;
            if (fileType === null) {
                console.log(`Skipping unsupported file type: ${kind}`);
                continue;
              }
              try{
                const directoryPath = `./public/downloaded_media/${fileType}`;
                const fileExtension = path.basename(original)
                const fileName = `${title.replace(/ /g, '_')}_${fileExtension}`;
     
                // Download and save the file
                const downloadedFileName = await downloadAndSaveFile(original, directoryPath,fileName,60000);
      
                const mediaItem = new FileSchema({
                    id,
                    kind,
                    title,
                    premium,
                    original: downloadedFileName, // Store the downloaded file name
                });
      
                // Save the document to the database
                await mediaItem.save();
      
                // Log success
                console.log(`File saved: ${downloadedFileName}`);
              } catch(err){
                console.error(`Error downloading/saving file: ${err.message}`);
                // If an error occurred during download/save, continue with the next item[]
                continue;
              }
            }
            
            // Process the next page
            await processPage(pageNumber + 1);
          } else {
            console.log('No more data to fetch.');
            // res.status(201).json({status: false, message: 'No more data to fetch.',});
          }
    } catch(error){
        console.log("Error fetching data:" ,error)
        console.error(`Error fetching data: ${error.message}`);
        // res.status(401).json({status: false, message: 'Failed to fetch data from the API', error: error.message });
    }
}
const addData = async(req, res) => {
    try{
      await processPage(72)
    } catch(err){
        console.log('Error: ',err);
        res.status(500).json({status: false, message: 'Internal Server Error', error: err.message });
    }
}

//function to shuffle an array randomly
const shuffleArray = async(array) => {  
    for(let i=array.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [array[i],array[j]] = [array[j], array[i]];

    }
}
const getImageVideoList = async(req, res) => {
      try{
        // const baseUrl = process.env.imageVideoLocalBaseUrl
        const liveBaseUrl = process.env.LiveServerUrl
        const imagePath = path.join(process.cwd(), './public/downloaded_media/jpeg')
        const page  = req.params.page;
        const size = req.params.size;
        const totalItems = 30
        const { limit, offset } = getPagination(page, size || 30)
        const images = await FileSchema.find({kind: 'image'} )
          .select('-_id id kind title premium original created_date');

        const videos = await FileSchema.find({kind:'video'})
          .select('-_id id kind title premium original created_date')

        const combinedData = req.query.kind === 'image' ? images : req.query.kind === 'video' ? videos : [...images, ...videos]
    
        await shuffleArray(combinedData)

        const paginatedData = combinedData.slice(offset, offset + limit)
        if((!paginatedData) || paginatedData.length == 0){
         return res.status(401).json({status:false, message: "No more data to show"})
      }

     
  
      // if (req.query.kind === 'image') {
      //   const images =  await FileSchema.find({kind:'image'})
      //   .select('-_id id kind title premium original created_date')
      //   .skip(offset)
      //   .limit(limit)

      //   return res.status(200).send(images)
      // } else if (req.query.kind === 'video') {
      //   const videos = await FileSchema.find({kind:'video'})
      //   .select('-_id id kind title premium original created_date')
      //   .skip(offset)
      //   .limit(limit)

      //   return res.status(200).send(videos)
      // }


      
      // const findData = await FileSchema.find({})
      //   .select('-_id id kind title premium original created_date')
      //   .skip(offset)
      //   .limit(limit)
        // .lean(); 
      

      // const combinedData = req.query.kind === images ? images : req.query.kind === videos ? videos : [...images, ...videos]
      // const combinedData = [...images, ...videos] ;
    

      // const resp = await shuffleArray(findData);      
      // console.log(resp);
    
      await shuffleArray(paginatedData)
        const dataObject = paginatedData.map((data) => ({
            id:data.id,
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


const getSingleImageOrVideo = async(req, res) => {
  try{
      const liveBaseUrl = process.env.imageVideoLiveServerUrl
      const original = req.params.original;
      
      const imageVideoData = await FileSchema.findOne({original}).select('-_id id kind title premium original created_date')
      if(!imageVideoData){
        return res.status(404).json({status:false, message: 'Image/Video not found' });
      }
      const imageVideoFileFolder = imageVideoData.kind === 'image' ? 'jpeg' : imageVideoData.kind === 'video' ? 'mp4' : null ;
      if(imageVideoFileFolder === "mp4"){
        res.setHeader('Content-Type', 'video/mp4')
        res.setHeader('Content-Disposition', `inline; filename="${imageVideoData.original}"`)
      }
      if(imageVideoFileFolder === "jpeg"){
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', `inline; filename="${imageVideoData.original}"`)
     }
      const imageFileFolder = path.join(process.cwd(), `./public/downloaded_media/${imageVideoFileFolder}`)

      const liveImageFileFolder = path.join(liveBaseUrl,imageVideoFileFolder )
      const imagePath = path.join(liveBaseUrl, `${liveImageFileFolder}/${imageVideoData.original}`);
      console.log(imagePath);
      res.sendFile(imagePath);
  } catch(error){
    console.error("error-> ",error);
    return res.status(500).json({status:false, message:"Internal server error", error: error.message });
  }
}   
module.exports = {
    addData,
    getImageVideoList,
    getSingleImageOrVideo
}
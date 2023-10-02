const StickerSchema = require('../models/stickerSchema');
const express = require('express')
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const {downloadAndSaveFile} = require('../helper/downloadAndSaveFile');
const { getPagination } = require('../helper/utils');

const mediaDirectory = path.join(process.cwd(), `/public/downloaded_media/trayImageAndStickerImageFile` )

const addTrayAndSticker = async(req, res) => {
    try{
        let currentPage = 26;
        let hasNext = true;
        
        while(hasNext){
            const stickerApiUrl = `${process.env.stickerApiBaseUrl}${currentPage}/${process.env.stickerApiUrlSecondPart}/${process.env.stickerApiUrlThirdPart}`
            const response = await axios.get(stickerApiUrl)
            if(!response.data.length){
                //No more data on this page, so move to the next page
                hasNext = false;
                currentPage++;
                continue;
            }
            // console.log(`\nSaving images for page -> `,currentPage);
            for(const item of response.data){
                
                const {
                        identifier, 
                        name, 
                        publisher, 
                        tray_image_file, 
                        publisher_email, 
                        publisher_website, 
                        privacy_policy_website, 
                        license_agreement_website,
                        premium,
                        animated,
                        whatsapp,
                        telegram,
                        signal,
                        signalurl,
                        telegramurl,
                        review,
                        trusted,
                        downloads,
                        size,
                        created,
                        user,
                        userid,
                        userimage,
                        stickers
                    } = item

                const entryDirectory = path.join(mediaDirectory, `${item.name.replace(/[\/:*?"<>|]/g,'_')}`);
                if(!fs.existsSync(entryDirectory)){
                    fs.mkdirSync(entryDirectory, {recursive:true})
                }

                const trayImageExtension = path.basename(tray_image_file)
              
                const trayImageFileName  =`${name.replace(/[\/:*?"<>|]/g,'_')}_tray_image_${trayImageExtension}`
               
                const trayImagePath = path.join(entryDirectory, trayImageFileName)


                try {
                   const trayImage = await downloadAndSaveFile(tray_image_file, entryDirectory,trayImageFileName, 60000); // 1min timeout
                //    console.log('\nTray Image Saved:',trayImage)
                } catch (error) {
                    // console.log('Error: ',error)
                    console.log(`Error downloading tray image: ${error.message}`);
                    continue; // Move to the next item if image download fails or times out
                }
                //create an array to store the sticker image file path
        
                const stickersDirectory = path.join(entryDirectory, `${name.replace(/[\/:*?"<>|]/g,'_')}_stickers_image_file`)
                    if(!fs.existsSync(stickersDirectory)){
                        fs.mkdirSync(stickersDirectory, { recursive: true });
                    }
                const stickerObjects  = [];

                for(const sticker of item.stickers){

                const stickerImageFileExtension = path.basename(sticker.image_file)
                const stickerImageFileName = `${name.replace(/[\/:*?"<>|]/g,'_')}_${stickerImageFileExtension}`

                    const stickerObjectDetail = {
                        image_file_thum: sticker.image_file_thum,
                        image_file: stickerImageFileName,
                        emojis: sticker.emojis
                    }
                    stickerObjects.push(stickerObjectDetail)

                    try{
                       const stickerFile =  await downloadAndSaveFile(sticker.image_file, stickersDirectory, stickerImageFileName, 60000) //set 1min timeout for saving file
                       console.log('Sticker Image Saved: ',stickerFile)

                    } catch(err){
                        console.log('Error downloading sticker image: ', err.message);
                        continue;  
                    }
                }
                const stickerData = new StickerSchema({
                    identifier, 
                    name, 
                    publisher, 
                    tray_image_file:trayImageFileName , 
                    publisher_email, 
                    publisher_website, 
                    privacy_policy_website, 
                    license_agreement_website,
                    premium,
                    animated,
                    whatsapp,
                    telegram,
                    signal,
                    signalurl,
                    telegramurl,
                    review,
                    trusted,
                    downloads,
                    size,
                    created,
                    user,
                    userid,
                    userimage,
                    stickers: stickerObjects

                })
                try{
                    await stickerData.save()
                } catch(err){
                    console.log(`Error saving sticker data to the database: ${err.message}`);
                }
            }
          
            currentPage++
        }
        res.status(200).json({status:true, message: 'Data downloaded and stored successfully' });
    } catch(error){
        console.error(error);
        res.status(500).json({status:false, message: 'Internal Server Error' });
    }
    
}

const getTrayAndStickerDataList = async(req, res) => {
    try{
        const localBaseUrl = process.env.localBaseUrl;
        const liveBaseUrl = process.env.LiveServerUrl
        const page = req.params.page;
        const size = req.params.size;

        const { limit, offset } = getPagination(page, size || 10)

        const findData = await StickerSchema.find({})
        .select('-_id')
        .skip(offset).limit(limit)

        if((!findData) || findData.length == 0 ){
            return res.status(404).json({status:false, message:"No data to show"})
        }

        const responseData = findData.map((data) => {


            return{
                identifier: data.identifier, 
                name: data.name, 
                publisher: data.publisher, 
                tray_image_file: liveBaseUrl +`tray_image_sticker_image_file/${encodeURIComponent(data.name)}/${encodeURIComponent(data.tray_image_file)}`, 
                publisher_email: data.publisher_email, 
                publisher_website: data.publisher_website, 
                privacy_policy_website: data.privacy_policy_website, 
                license_agreement_website: data.license_agreement_website,
                premium: data.premium,
                animated: data.animated,
                whatsapp: data.whatsapp,
                telegram: data.telegram,
                signal: data.signal,
                signalurl: data.signalurl,
                telegramurl: data.telegramurl,
                review: data.review,
                trusted: data.trusted,
                downloads: data.downloads,
                size: data.size,
                created: data.created,
                user: data.user,
                userid: data.userid,
                userimage: data.userimage,
                stickers:  data.stickers.map((item) => {
                    return {
                        image_file_thum: item.image_file_thum,
                        image_file: `${liveBaseUrl}tray_image_sticker_image_file/${encodeURIComponent(data.name)}/${encodeURIComponent(data.name)}_stickers_image_file/${encodeURIComponent(item.image_file)}`,
                        emojis: item.emojis,
                    }; 
                })
            }
    
//${encodeURIComponent(data.name)}/${data.name.includes(" ") ? data.name.replace(/[ \/:*?"<>|]/g,'_') :encodeURIComponent( data.name)}_stickers_image_file/${encodeURIComponent(item.image_file)}
        
        })
        res.status(200).json(responseData)
    }catch(error){
        console.log("Error -> ",error)
        res.status(500).json({status:false, message:"Internal server error while fetching tray image and sticker image data", error:error.message})
    }
}

const showTrayImage = async(req,res) =>{
    try{
        const tray_image_file = req.params.tray_image_file;

        const findTrayImage = await StickerSchema.findOne({tray_image_file})
        if((!findTrayImage) || findTrayImage.length == 0){
            return res.status(404).json({status:false, message:"Tray image not found"})
        }

        const trayImageDirectory = path.join(process.cwd(), `./public/downloaded_media/trayImageAndStickerImageFile/${findTrayImage.name}`)
        
        const trayImage = path.join(trayImageDirectory, `${findTrayImage.tray_image_file}`)
     
        res.status(200).sendFile(trayImage)
    }catch(error){
        console.log("Error-> ",error)
        res.status(500).json({status:false,message: "Internal server error while fetching tray_image", error: error.message})
    }
}

module.exports = {
    addTrayAndSticker,
    getTrayAndStickerDataList,
    showTrayImage
}
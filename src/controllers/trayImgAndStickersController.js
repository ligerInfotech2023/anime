const StickerSchema = require('../models/stickerSchema');
const {downloadAndSaveFile} = require('../helper/downloadAndSaveFile');
const { getPagination } = require('../helper/utils');


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


module.exports = {
    getTrayAndStickerDataList,
}
const FileSchema = require('../models/fileSchema')
const path = require('path');
const { getPagination } = require('../helper/utils');


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

module.exports = {
    getImageVideoList,
}
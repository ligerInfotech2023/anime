const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
    {
        id:String,
        kind:String,
        title: String,
        premium: Boolean,
        original: String 
    },
    {
        collection:"tbl_img_video_data",
        timestamps:{
            createdAt:"created_date",
            updatedAt:"updated_date"
        }
    }
);

const FileSchema = mongoose.model('tbl_img_video_data', fileSchema)

module.exports = FileSchema;
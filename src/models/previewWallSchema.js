const mongoose = require('mongoose');

const previewWallSchema = new mongoose.Schema(
    {
        preview_image_name: String,
        main_image_name: String
    },
    {
        collection:"tbl_previewImage",
        timestamps:{
            createdAt:"created_date",
            updatedAt:"updated_date"
        }
    }
);

const PreviewWallSchema = mongoose.model('tbl_previewImage', previewWallSchema);

module.exports = PreviewWallSchema;

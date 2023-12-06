const mongoose = require('mongoose');

const previewWallSchema = new mongoose.Schema(
    {
        image_name: {
            type: String,
          },
          isPreview: {
            type: Boolean,
            default: false,
          },
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

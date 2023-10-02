const mongoose = require('mongoose')

const stickerSchema = new mongoose.Schema(
    {
        identifier:Number,
        name:String,
        publisher: String,
        tray_image_file: String,
        publisher_email: String,
        publisher_website: String,
        privacy_policy_website: String,
        license_agreement_website: String,
        premium: Boolean,
        animated: Boolean,
        whatsapp: Boolean,
        telegram: Boolean,
        signal: Boolean,
        signalurl: String,
        telegramurl: String,
        review: Boolean,
        trusted: Boolean,
        downloads: String,
        size: String,
        created: String,
        user: String,
        userid: String,
        userimage: String,
        stickers: [
            {
                image_file_thum: String,
                image_file: String,
                emojis: [String]
            }
        ]
        
    },
    {
        collection:"tbl_stickers",
        timestamps:{
            createdAt: "created_date",
            updatedAt: "updated_date"
        }
    }
)

const StickerSchema = mongoose.model("tbl_stickers", stickerSchema);

module.exports = StickerSchema;
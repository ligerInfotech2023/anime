const express = require('express')
const routes = express.Router()

const {addTrayAndSticker, getTrayAndStickerDataList, showTrayImage } = require('../controllers/trayImgAndStickersController')

routes.post('/save', addTrayAndSticker)

routes.get('/all/created/:page?/:size?', getTrayAndStickerDataList )

//API for tray image
routes.get('/tray_image/:tray_image_file', showTrayImage)

//API for sticker.image_file
routes.get('/image_file/:image_file')

module.exports = routes;
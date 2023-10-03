const express = require('express')
const routes = express.Router()

const {getTrayAndStickerDataList } = require('../controllers/trayImgAndStickersController')

routes.get('/all/created/:page?/:size?', getTrayAndStickerDataList )


module.exports = routes;
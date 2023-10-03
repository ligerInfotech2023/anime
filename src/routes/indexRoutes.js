const express = require('express')
const routes = express.Router();

const imageVideoRoutes = require('./imageVideoRoutes')
const stickerRoute = require('./trayImgAndStickerRoutes')

routes.use('/wallpaper', imageVideoRoutes)
routes.use('/sticker/', stickerRoute)

module.exports = routes;
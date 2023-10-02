const express = require('express')
const routes = express.Router();

const imageVideoRoutes = require('./imageVideoRoutes')
const stickerRoute = require('./trayImgAndStickerRoutes')
const categoryRoute = require('./categoryRoute')

routes.use('/wallpaper', imageVideoRoutes)
routes.use('/sticker/', stickerRoute)
routes.use('/category', categoryRoute)

module.exports = routes;
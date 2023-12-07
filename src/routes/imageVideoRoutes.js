const express = require('express');
const routes = express.Router();
const path = require('path')

const {getImageVideoList, addPreviewMainImage, getPreviewMainImageList } = require('../controllers/imageVideoController')

routes.get('/all/created/:page/:size?', getImageVideoList)
routes.post('/add/image', addPreviewMainImage )
routes.get('/image/list/:page/:size?', getPreviewMainImageList)

module.exports = routes;
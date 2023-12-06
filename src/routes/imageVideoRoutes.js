const express = require('express');
const routes = express.Router();
const path = require('path')

const {getImageVideoList, AddpreviewMainImage, previewMainImageList } = require('../controllers/imageVideoController')

routes.get('/all/created/:page/:size?', getImageVideoList)
routes.post('/add/image', AddpreviewMainImage )
routes.get('/image/list/:page/:size?', previewMainImageList)

module.exports = routes;
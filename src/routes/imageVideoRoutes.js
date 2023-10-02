const express = require('express');
const routes = express.Router();
const path = require('path')

const {addData,getImageVideoList,getSingleImageOrVideo } = require('../controllers/imageVideoController')

routes.post('/save', addData);
routes.get('/all/created/:page/:size?', getImageVideoList)
routes.get('/images/:original',getSingleImageOrVideo)

module.exports = routes;
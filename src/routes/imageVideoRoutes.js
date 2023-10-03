const express = require('express');
const routes = express.Router();
const path = require('path')

const {getImageVideoList } = require('../controllers/imageVideoController')

routes.get('/all/created/:page/:size?', getImageVideoList)

module.exports = routes;
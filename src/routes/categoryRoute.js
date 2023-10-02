const express = require('express');

const { addCategory,getCategoryList,getCategoryImage } = require('../controllers/CategoryController')

const routes = express.Router();

routes.post('/save', addCategory);
routes.get('/all/created', getCategoryList)
routes.get('/image/:image', getCategoryImage)
module.exports = routes;
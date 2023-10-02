require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const dbURL = require('./src/config/dbConfig')
const routes = require('./src/routes/indexRoutes')

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/api', routes)
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.status(200).json({status:"Success", message:"Server Started Successfully"})
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
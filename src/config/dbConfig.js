const mongoose = require('mongoose')

// MongoDB connection
const dbConn = mongoose
  .connect(process.env.dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });


module.exports = dbConn;
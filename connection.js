// Import the dotenv library and call the config() method
// This will load environment variables from a .env file
require('dotenv').config();

// Import the Mongoose library
const mongoose = require('mongoose');

// Create a connection string using environment variables
const connectionStr = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PW}@b253-andaya.ugqjfk2.mongodb.net/E-Commerce-TechGadgets?retryWrites=true&w=majority`;

// Connect to MongoDB using the connection string and options
mongoose
  .connect(connectionStr, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Failed to connect to MongoDB', err));

// Set up an event listener for MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

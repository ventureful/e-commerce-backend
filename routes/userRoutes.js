// Define an Express router to handle incoming HTTP requests and require the User model for user data management.
const router = require('express').Router();
const User = require('../Models/User.js');
const Order = require('../Models/Order.js');

// Handle a POST request to '/signup' to create a new user.
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body; // Extract the name, email, and password from the request body.

  try {
    const user = await User.create({ name, email, password }); // Create a new user using the extracted data.
    res.json(user); // Return the new user data as a JSON response.
  } catch (e) {
    if (e.code === 11000) return res.status(400).send('Email already exists'); // If the email already exists, send a 400 error response.
    res.status(400).send(e.message); // Otherwise, send a 400 error response with the error message.
  }
});

// Handle a POST request to '/login' to authenticate a user and return their user data.
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Extract the email and password from the request body.

  try {
    const user = await User.findByCredentials(email, password); // Find a user with the provided email and password.
    res.json(user); // Return the user data as a JSON response.
  } catch (e) {
    res.status(400).send(e.message); // If there is an error (e.g. incorrect email or password), send a 400 error response with the error message.
  }
});

// Get Users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).populate('orders'); // Find all non-admin users and their associated orders.
    res.json(users); // Return the user data as a JSON response.
  } catch (e) {
    res.status(400).send(e.message); // If there is an error (e.g. database connection error), send a 400 error response with the error message.
  }
});

// Get user orders
router.get('/:id/orders', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate('orders');
    res.json(user.orders);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Update user notifications
router.post('/:id/updateNotifications', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    user.notifications.forEach((notif) => {
      notif.status = 'read';
    });
    user.markModified('notifications');
    await user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;

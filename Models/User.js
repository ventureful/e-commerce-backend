// Import the Mongoose library and extract the Schema and default modules for use in the code.
const { Schema, default: mongoose } = require('mongoose');
// Import the bcrypt library for password hashing and verification.
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'is required'], // Name field is required
    },

    email: {
      type: String,
      required: [true, 'is required'], // Email field is required
      unique: true,
      index: true,
      validate: {
        validator: function (str) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(str);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },

    password: {
      type: String,
      required: [true, 'is required'], // Password field is required
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    cart: {
      type: Object,
      default: {
        total: 0,
        count: 0,
      },
    },

    notifications: {
      type: Array,
      default: [],
    },

    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  },
  { minimize: false }
);

// Define a static method on the User model to find a user by their email and password.
UserSchema.statics.findByCredentials = async function (email, password) {
  // Find a user with the given email address.
  const user = await User.findOne({ email });

  // If no user is found, throw an error.
  if (!user) throw new Error('Invalid credentials');

  // Compare the given password with the user's hashed password using bcrypt.
  const isSamePassword = bcrypt.compareSync(password, user.password);

  // If the passwords match, return the user object.
  if (isSamePassword) return user;

  // If the passwords don't match, throw an error.
  throw new Error('Invalid Credentials');
};

// Define a method on the User model to convert a user object to a JSON object
UserSchema.methods.toJSON = function () {
  // Get the current user object
  const user = this;

  // Convert the user object to a plain JavaScript object
  const userObject = user.toObject();

  // Remove the password field from the user object
  delete userObject.password;

  // Return the updated user object as a JSON object
  return userObject;
};

// Define a pre-save middleware to hash the password before saving the User model
UserSchema.pre('save', function (next) {
  // Get the current user object
  const user = this;

  // Check if the password field has been modified before continuing
  if (!user.isModified('password')) return next();

  // Generate a salt for the bcrypt hash
  bcrypt.genSalt(10, function (err, salt) {
    // If there's an error, pass it to the next middleware
    if (err) return next(err);

    // Hash the user's password with the generated salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      // If there's an error, pass it to the next middleware
      if (err) return next(err);

      // Set the user's password to the hashed value
      user.password = hash;

      // Call the next middleware
      next();
    });
  });
});

// Define a pre-remove middleware to remove all orders owned by the user being removed
UserSchema.pre('remove', function (next) {
  // Get the current user object
  const user = this;

  // Find and remove all orders that belong to the user being removed
  this.model('Order').remove({ owner: this._id }, next);
});

// Create a new User model based on the schema
const User = mongoose.model('User', UserSchema);

// Export the User model for use in other parts of the application
module.exports = User;

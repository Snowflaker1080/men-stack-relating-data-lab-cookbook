const mongoose = require('mongoose');

// Defined foodSchema
const foodSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true,
  },
});

// Defined userSchema with embeded foodSchema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  pantry: [foodSchema], // Embedded array of foodSchema
});

// Created User model & export
const User = mongoose.model('User', userSchema);
module.exports = User;


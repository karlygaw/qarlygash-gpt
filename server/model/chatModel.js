const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  title: String,
  role: String,
  content: String,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
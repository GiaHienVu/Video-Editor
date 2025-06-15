const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/video_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

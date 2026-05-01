const express = require('express');
// const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://admin:admin123@cluster0.7igpbcm.mongodb.net/taskmanager?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

app.use(cors());
app.use(express.json());
app.use('/users', require('./routes/users'));

// mongoose.connect('mongodb://127.0.0.1:27017/taskmanager');

app.use('/auth', require('./routes/auth'));
app.use('/tasks', require('./routes/tasks'));

app.get('/', (req, res) => {
  res.send('API Running 🔥');
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
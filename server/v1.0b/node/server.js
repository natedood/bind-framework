const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
exports.app = app;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use cors middleware and allow all origins - CAREFUL - ALLOWS cross domain requests to your server 
// only use if you know what you are doing and the implications of this
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static('public'));

// handle NavBar2Events route 
require('./public/examples/NavBar2_CustomEvents/events.js');

// handle HelloWorldEvents route 
require('./public/examples/HelloWorld/HelloWorldEvents.js');

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
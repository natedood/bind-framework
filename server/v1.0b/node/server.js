const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
exports.app = app;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Middleware required to parse urlencoded bodies (e.g. form data )
app.use(bodyParser.urlencoded({ extended: true }));
// Use cors middleware and allow all origins - CAREFUL - ONLY FOR TESTING PURPOSES
app.use(cors());

// Include code from events.js example
require('./events');

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
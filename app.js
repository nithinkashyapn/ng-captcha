// We will declare all our dependencies here
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/database');
const places = require('./controllers/places');
const port = 3000;
const app = express();

mongoose.connect(config.database);
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.get('/', (req,res) => {
    res.send("Invalid page");
})

app.use('/places',places);

app.listen(port, () => {
    console.log(`Starting the server at port ${port}`);
});
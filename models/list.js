"use strict";
//Require mongoose package
const mongoose = require('mongoose');

const LocationSchema = mongoose.Schema({
    geohash: {
        type: String,
        unique: true,
        required: true
    },
    category: {
        type: Array,
        required: true,
    }
});

const Location = module.exports = mongoose.model('Location', LocationSchema );

module.exports.getAllLists = (geohash,callback) => {
    let query = {geohash: geohash};
    Location.findOne(query, callback);
}

module.exports.addList = (newList, callback) => {
    newList.save(callback);
}
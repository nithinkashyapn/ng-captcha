"use strict";
//Require the express package and use express.Router()
const express = require('express');
const router = express.Router();
const request = require("request");
const location = require('../models/list');
const key = 'AIzaSyCuke6mjLLQZIPwc-DaYQk-dxQzoWKO9pQ';
const Geohash = require('latlon-geohash');

router.post('/search',(req,res) => {
    if(req && (!req.headers.key || req.headers.key !== '4CB3CB9611E482814379B46956929')){
        res.status(400).end();
    }else{    
    let geohash = req.body.geohash;
    location.getAllLists(geohash, (err, lists)=> {
        if(err) {
            res.json({success:false, message: `Failed to load all lists. Error: ${err}`});
        }
        else {
            res.write(JSON.stringify({success: true, lists:lists},null,2));
            res.end();
        }   
    });
}
});

router.post('/nearme', (req,res,next) => {
    if(req && (!req.headers.key || req.headers.key !== '4CB3CB9611E482814379B46956929')){
        res.status(400).end();
    }else{    
    
    let options = { 
    method: 'POST',
    url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    qs: 
    { 
       location: req.body.location,
       radius: req.body.radius,
       types: req.body.types,
       name: req.body.name,
       key: key 
    }
};
  
  request(options, function (error, response, body) {
    if (error) res.status(401).json(error);
    else res.send(body);
  });
}
});

router.post('/location', (req,res,next) => {
    if(req && (!req.headers.key || req.headers.key !== '4CB3CB9611E482814379B46956929')){
        res.status(401).end();
    }else{    
    let lat = req.body.lat;
    let lon = req.body.lon;    
    let geohash = Geohash.encode(lat, lon, 7);
    
    let one = { method: 'POST',
      url: 'http://localhost:3000/places/search',
      headers: 
       { 'content-type': 'application/x-www-form-urlencoded', 'key': '4CB3CB9611E482814379B46956929'},
      form: { geohash: geohash } };
    
    request(one, function (error, response, body) {
      if (error) throw new Error(error);
      body = JSON.parse(body);
      if(body.lists == null){

            let options = { method: 'POST', url: 'http://localhost:3000/places/types',
            headers: { 'content-type': 'application/x-www-form-urlencoded', 'key': '4CB3CB9611E482814379B46956929'},
            form: { lat: lat, lon: lon } };
            
            request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                    body = JSON.parse(body);
                    let category = (body.results[1].types);
                    let two = { method: 'POST',
                    url: 'http://localhost:3000/places/add',
                    headers: { 'content-type': 'application/x-www-form-urlencoded', 'key': '4CB3CB9611E482814379B46956929' },
                    form: { geohash: geohash, category: category } };
                    request(two, function (error, response, body) {
                        if (error) res.status(401).json(error);
                        else res.send(body);            
                });
            });
      }
      else{
          res.send(body.lists);
      }
    });
    }   
});

router.post('/add', (req,res,next) => {
    if(req && (!req.headers.key || req.headers.key !== '4CB3CB9611E482814379B46956929')){
        res.status(400).end();
    }else{    
    
    let newList = new location({
        geohash: req.body.geohash,
        category: req.body.category
    });
    location.addList(newList,(err, list) => {
        if(err) {
            res.json({success: false, message: `Failed to create a new location. Error: ${err}`});
        }
        else {

            let data = Geohash.decode(req.body.geohash);
            let options = { method: 'POST',
            url: 'http://localhost:3000/places/location',
            headers: 
             { key: '4CB3CB9611E482814379B46956929', 'content-type': 'application/x-www-form-urlencoded' },
            form: { lat: data.lat, lon: data.lon } };
          
          request(options, function (error, response, body) {
            if (error) throw new Error(error);
            body = JSON.parse(body);
            res.json(body);
          });
          
        }

    });}
});

module.exports = router;

router.post('/types', (req,res,next) => {
    if(req && (!req.headers.key || req.headers.key !== '4CB3CB9611E482814379B46956929')){
        res.status(400).end();
    }else{    
    let location = req.body.lat+","+req.body.lon;    
    let options = { 
      method: 'POST',
      url: 'https://maps.googleapis.com/maps/api/geocode/json',
      qs: 
       { latlng: location,
         key: key
       }        
    };
    request(options, function (error, response, body) {
        if (error) res.status(401).json(error);
        else res.send(body);
    });}
});



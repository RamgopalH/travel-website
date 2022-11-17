const bodyParser = require('body-parser');
const express = require('express');
const Destination  = require('./public/js/db/models/destination.model');
const mongoose = require('mongoose');
const { Package } = require('./public/js/db/models/package.model');

mongoose.connect('mongodb://localhost:27017/Travel');

app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res)=> {
    res.sendFile(__dirname + "/inserter.html");
});

app.post('/destination', (req, res)=> {
    let popularity = req.body.popularity;
    const dest = new Destination( {
        name: req.body.name,
        description: req.body.description,
        popularity: req.body.popularity
    });
    dest.save().then((err)=>{
        if(err) console.log(err);
        else console.log('Destiantopn saved');
        res.redirect('/');
    });
});

app.post('/package', (req, res)=> {
    const package = new Package( {
        name: req.body.name,
        level: req.body.level,
        destination: req.body.destination,
        from: req.body.from,
        to: req.body.to,
        cost: req.body.cost,
        discount: req.body.discount
    });
    package.save().then((err)=>{
        if(err) console.log(err);
        else console.log('Package saved');
        res.redirect('/');
    });
});

app.listen(5000, ()=> {
    console.log('Inserter Active');
});
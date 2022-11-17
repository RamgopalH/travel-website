const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config()

const { User, Package, Transaction, Destination } = require('./public/js/db/models/index.model');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rg2792002@gmail.com',
        pass: 'nehpupmxpbnierpl'
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

var userTemp;
var otp;

/** MONGOOSE CONNECTION */

mongoose.connect('mongodb://localhost:27017/Travel');

/** ACTUAL APP */


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

/** LOGIN PAGE */

app.post('/login', (req, res) => {
    let input = req.body.username;
    let userId;
    let password;
    User.findOne({ $or: [{ email: input }, { mobile: input }, { username: input }] }).then((user) => {
        if (!user) {
            res.render('invalid', { error: 'Username. Please Sign Up' });
        } else {
            userId = user._id;
            password = user.password;
        }
    }).then(() => {
        if (req.body.password == password) {
            res.redirect(`../index/${userId}`);
        } else {
            res.render('invalid', { error: 'Credentials' });
        }
    });
});

/** SIGNUP PAGE */

app.get('/signup.html', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

/** HOME PAGE */

app.get('/index/:userId', (req, res) => {
    let userId = req.params.userId;
    Destination.find({}, { name: 1, description: 1, image: 1, lat: 1, lng: 1 }).sort({ popularity: -1 }).exec((err, destinations) => {
        if (err) console.log(err)
        else {
            destJSON = JSON.stringify(destinations);
            res.render('index', { userId: userId, topDestinations: destinations.slice(0, 3), destinations: destinations, destJSON: destJSON, key: process.env.API_KEY });
        }
    });
});

/** USER PROFILE PAGE */

app.get('/profile/:userId', (req, res) => {
    User.getPackages(req.params.userId).then((transactions) => {
        User.findById(req.params.userId).then((user) => {
            res.render('profile', { user: user, userId: req.params.userId, userName: user.username, transactions: transactions });
        });
    }, () => {
        res.render('invalid', { error: 'User Id' });
    });
});


/** DESTINATION PAGE */

app.post('/destination/:destinationName', (req, res) => {
    Destination.findOne({ name: req.params.destinationName }, (err, destination) => {
        if (err) res.render('invalid', { error: 'Destination not found' });
        else {
            Package.find({ destination: destination.name }, (err, packages) => {
                res.render('destination', { userId: req.body.userId, destination: destination, packages: packages });
            });
        }
    })
});

/** PACKAGE PAGE */

app.get('/package/:packageId', (req, res) => {
    Package.findOne({ _id: req.query.packageId }, (err, package) => {
        if (err) console.log(err);
        console.log(package);
        if(req.query.from) from = req.query.from;
        else from = "";
        if(req.query.to) to = req.query.to;
        else to = "";
        res.render('specific-package', { userId: req.query.userId, package: package, cost: req.query.cost, from: from, to: to});
    });
});

/** SEARCH FOR PACKAGES */

app.get('/packageSearch', (req, res) => {
    const level = req.query.level;
    Package.find({ level: level }, (err, packages) => {
        res.render('search', { level: req.query.level, userId: req.query.userId, packages: packages, from:"", to:"" });
    });
});

/** PAYMENT PAGE */

app.get('/payment', (req, res) => {
    Package.find({ _id: req.query.packageId }, (err, package) => {
        if (err) console.log(err);
        else {
            const cost = req.query.cost;
            console.log(package);
            res.render('payment', { totalProducts: 0, tax: 0.18 * cost, totalPrice: cost * 1.18, cost: req.query.cost, package: package, userId: req.query.userId, from: req.query.from, to: req.query.to });
        }
    });
});

/** SEARCH RESULTS PAGE */

app.get('/search', (req, res) => {
    Destination.find({}, (err, destinations)=> {
        Package.find({ $or:[{destination: req.query.destination}, {level: req.query.destination }] }, (err, packages) => {
            if (err) console.log(err)
            else { 
                if (packages.length == 0) {
                    res.render('search', { destination: req.query.destination, level: "Not Available", packages: packages, userId: req.query.userId, from: req.query.from, to: req.query.to});
                } else {
                    res.render('search', {  destination: req.query.destination,level: "Available", packages: packages, userId: req.query.userId, from: req.query.from, to: req.query.to});
                }
            }
        });
    });
    // res.redirect(`../index/${req.query.userId}`);
});

/** RANDOM PAGE */

app.get('/random', (req, res) => {
    Destination.find({}, (err, destinations)=>{
        if(err) console.log(err);
        User.find({ _id: req.query.userId }, (err, user) => {
            Package.find({}, (err, packages) => {
                if (err) console.log(err);
                else {
                    packages = JSON.stringify(packages);
                    res.render('random', { userId: req.query.userId, packages: packages, destinations: destinations });
                }
            });
        });
    })
});
/** FINAL TRANSACTION CONFIRMED ROUTE */

app.post('/buy', (req, res) => {
    console.log(req.body);
    Package.findOne({ _id: req.body.packageId }, (err, package) => {
        if (!package) console.log("Package not found");
        else {
            package.from = req.body.from;
            package.to = req.body.to;
            const transaction = new Transaction({
                userId: req.body.userId,
                package: package,
                cost: req.body.cost
            });
            transaction.save((err, tran) => {
                if (err) console.log(err);
                else {
                    console.log(tran);
                    const pkg = {
                        packageId: package._id,
                        transactionId: tran._id
                    }
                    User.findOneAndUpdate({ _id: tran.userId }, { $push: { packages: pkg } }, (err, doc) => {
                        if (err) console.log(err);
                        else {
                            res.redirect('/index/' + tran.userId);
                        }
                    });
                }
            })
        }
    });
});

/** ADDING USER */

app.post('/user', (req, res) => {
    console.log(otp)
    console.log(req.body.otp)
    if (req.body.otp == otp) {
        const user = new User({
            username: userTemp.username,
            email: userTemp.email,
            password: userTemp.password,
            mobile: userTemp.mobile,
            packages: []
        });
        user.save().then((userDoc) => {
            console.log(userDoc);
            res.redirect('../');
        });
    } else {
        res.render('invalid', { error: 'OTP' });
    }

});

/** OTP SENDING ROUTE */

app.post('/enterOtp', (req, res) => {
    userTemp = {
        username: req.body.username,
        password: req.body.password,
        mobile: req.body.mobile,
        email: req.body.email,
        packages: []
    }
    otp = Math.floor(Math.random() * 10000);
    const mail = {
        from: 'rg2792002@gmail.com',
        to: userTemp.email,
        subject: 'OTP',
        text: `The OTP to Sign Up to Travellers Quest is ${otp.toString()}`
    }
    transporter.sendMail(mail, (err, info) => {
        if (err) console.log(err);
        else console.log('OTP sent');
    });
    console.log(otp);
    res.render('otp');
});


app.listen(3000 || process.env.port, () => { });

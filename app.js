const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const { User, Package, Transaction, Destination } = require('./public/js/db/models/index.model');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword'
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));


var userTemp;
var otp;

mongoose.connect('mongodb://localhost:27017/Travel');

/** ACTUAL APP */


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/signup.html', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

app.get('/index/:userId', (req, res) => {
    let userId = req.params.userId;
    Destination.find({}, { name: 1, description: 1 }).sort({ popularity: -1 }).exec((err, destinations) => {
        if (err) console.log(err)
        else {
            res.render('index', { userId: userId, topDestinations: destinations.slice(0, 3), destinations: destinations });
        }
    });
});

app.get('/profile/:userId', (req, res) => {
    User.getPackages(req.params.userId).then((packages) => {
        User.findById(req.params.userId).then((user) => {
            res.render('profile', {user:user, userId: req.params.userId, userName: user.username, boughtPackages: packages });
        });
    }, () => {
        res.render('invalid', { error: 'User Id' });
    });
});

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

app.post('/user', (req, res) => {
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

app.post('/enterOtp', (req, res) => {
    userTemp = {
        username: req.body.username,
        password: req.body.password,
        mobile: req.body.mobile,
        email: req.body.email,
        packages: []
    }
    // url = 'https://api.txtlocal.com/send?';
    // params = `apiKey=NzU3NTc5NDY0MzcwMzQ3MjM4NDg0NTM4NjI2YTZlNWE=&numbers=${userTemp.code+userTemp.mob}&message=otp is ${otp}&test=true`;
    // message = `Otp is ${otp}`;
    // options = {
    //     method: "POST",
    //     apiKey: "NzU3NTc5NDY0MzcwMzQ3MjM4NDg0NTM4NjI2YTZlNWE="
    // }
    // let request = https.request(url, (resp)=> {
    //     resp.on('data', (data)=> {
    //         console.log(JSON.parse(data));
    //     })
    //     // console.log(resp);
    // });
    // request.end();
    const otp = Math.floor(Math.random() * 10000);
    const mail = {
        from: 'rg2792002@gmail.com',
        to: userTemp.email,
        subject: 'OTP',
        text: otp.toString()
    }
    transporter.sendMail(mail, (err, info) => {
        if (err) console.log(err);
        else console.log('OTP sent:' + info.repsonse);
    });
    console.log(otp);
    res.render('otp');
});

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

app.get('/packageSearch', (req, res) => {
    const level = req.query.level;
    Package.find({ level: level }, (err, packages) => {
        console.log(packages);
        console.log(level);
        res.render('search', { level: req.query.level, userId: req.query.userId, packages: packages });
        // res.redirect('/index/' + req.query.userId);
    });
});

app.post('/buy', (req, res) => {
    Package.findOne({ _id: req.body.packageId }, (err, package) => {
        if (err) console.log(err);
        console.log(package);
        const transaction = new Transaction({
            userId: req.body.userId,
            package: package,
            cost: req.body.cost
        });
        console.log(transaction);
        transaction.save((err, tran) => {
            if (err) console.log(err);
            else {
                console.log(tran);
                const pkg = {
                    packageId: package._id,
                    transactionId: tran._id
                }
                User.findOneAndUpdate({_id: tran.userId}, {$push:{ packages:pkg}}, (err, doc)=> {
                    if (err) console.log(err);
                    else {
                        res.redirect('/index/' + tran.userId);
                        console.log(doc);
                    }
                });
            }
        })
    });
});

app.get('/random', (req, res)=> {
    User.find({_id: req.query.userId}, (err, user)=> {
        Package.find({}, (err, packages)=> {
            if(err) console.log(err);
            else  {
                packages = JSON.stringify(packages);
                res.render('random', {userId: req.query.userId, packages: packages});
            }
        });
    });
});

app.get('/search', (req, res)=> {
    console.log(req.query);
    Package.find({destination: req.query.destination}, (err, packages)=> {
        if(err) console.log(err)
        else {
            packages = packages.toJSON();
            console.log(packages);
            res.render('search', {level: "Available", packages: packages, userId: req.query.userId});
        }
    });
    // res.redirect(`../index/${req.query.userId}`);
});

app.listen(3000, () => {
    console.log('3000');
});

// AIzaSyAA_A9qHIwbSXo8RLMpg3s7kXL664nmEfc
const express = require('express');
const asyncHandler = require('express-async-handler')
const passport = require('passport');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const nodemailer = require("nodemailer");

const router = express.Router();
module.exports = router;

router.post('/register', asyncHandler(register));
router.post('/verify', asyncHandler(verify));
router.post('/login', passport.authenticate('local', { session: false }), login);
router.get('/me', passport.authenticate('jwt', { session: false }), login);

async function register(req, res) {
    let user = await userCtrl.insert(req.body);
    user = user.toObject();
    delete user.hashedPassword;
    req.user = user;

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "kushinada.web@gmail.com",
            pass: "kiko123!"
        }
    });

    const link = req.get('referer').replace('register', 'login') + "?validationCode=" + user.validationCode;

    transporter.sendMail({
        from: '"Kushinada" <kushinada.web@gmail.com>',
        to: user.email,
        subject: "Please Confirm Your Account",
        text: "Please click the link to confirm your email address: " + link,
        html: "Please click the link to confirm your email address: <br><a href=" + link + ">Click here to verify</a>",
    }, function (error, response) {
        if (error) {
            console.log('Error sending verification email: ' + error);
            res.json({ error });
        } else {
            if (response.accepted.length > 0)
                res.json({ email: response.accepted[0] });
            else
            res.json({ error: 'Email ' + user.email + ' did not accept the message.' });
        }
    });
}

async function verify(req, res) {
    let user = await userCtrl.verify(req.body.validationCode);

    res.json({ status: 'success', email: user.email });
}

function login(req, res) {
    let user = req.user;
    let token = authCtrl.generateToken(user);
    res.json({ user, token });
}

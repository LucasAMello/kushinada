const express = require('express');
const asyncHandler = require('express-async-handler')
const passport = require('passport');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const nodemailer = require("nodemailer");
const config = require('../config/config');

const router = express.Router();
module.exports = router;

router.post('/register', asyncHandler(register));
router.post('/verify', asyncHandler(verify));
router.post('/forgot', asyncHandler(forgot));
router.post('/resetPassword', asyncHandler(resetPassword));
router.post('/login', passport.authenticate('local', { session: false }), login);
router.get('/me', passport.authenticate('jwt', { session: false }), login);

async function register(req, res) {
    if (config.mailUser && config.mailPass) {
        let user = await userCtrl.insert(req.body);
        user = user.toObject();
        delete user.hashedPassword;
        req.user = user;

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: config.mailUser,
                pass: config.mailPass
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
}

async function forgot(req, res) {
    if (config.mailUser && config.mailPass) {
        let user = await userCtrl.forgotPassword(req.body.email);
        if (user) {
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: config.mailUser,
                    pass: config.mailPass
                }
            });

            const link = req.get('referer').replace('login', 'forgot') + "?resetCode=" + user.resetCode;

            transporter.sendMail({
                from: '"Kushinada" <kushinada.web@gmail.com>',
                to: user.email,
                subject: "Password Reset Request for Kushinadahime.com",
                text: "Hey " + user.username + ", your password can be reset by clicking the link below. If you did not request a new password, please ignore this email. " + link,
                html: "Hey " + user.username + ", <br>your password can be reset by clicking the link below. If you did not request a new password, please ignore this email. <br><a href=" + link + ">Click here to reset your password</a>",
            }, function (error, response) {
                if (error) {
                    console.log('Error sending password reset email: ' + error);
                    res.json({ error });
                } else {
                    if (response.accepted.length > 0)
                        res.json({ email: response.accepted[0] });
                    else
                    res.json({ error: 'Email ' + user.email + ' did not accept the message.' });
                }
            });
        }
    }
}

async function resetPassword(req, res) {
    await userCtrl.resetPassword(req.body);

    res.json({ status: 'success' });
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

const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const requireAdmin = require('../middleware/require-admin');
const guideCtrl = require('../controllers/guide.controller');

const router = express.Router();
module.exports = router;

router.post('/getAll', function (req, res, next) {
    passport.authenticate('jwt', { session: false }, function (err, user, info) {
        req.body.user = user;
        next(err);
    })(req, res, next);
}, asyncHandler(getAll));
router.get('/get', function (req, res, next) {
    passport.authenticate('jwt', { session: false }, function (err, user, info) {
        req.body.user = user;
        next(err);
    })(req, res, next);
}, asyncHandler(get));
router.post('/submit', passport.authenticate('jwt', { session: false }), asyncHandler(insert));
router.post('/like', passport.authenticate('jwt', { session: false }), asyncHandler(like));
router.post('/dislike', passport.authenticate('jwt', { session: false }), asyncHandler(dislike));
router.post('/report', passport.authenticate('jwt', { session: false }), asyncHandler(report));
router.post('/approve', passport.authenticate('jwt', { session: false }), requireAdmin, asyncHandler(approve));
router.post('/delete', passport.authenticate('jwt', { session: false }), asyncHandler(remove));

async function insert(req, res) {
    try {
        let user = await guideCtrl.insert(req.body);
        res.json(user);
    } catch (e) {
        res.status(422).json(e);
    }
}

async function like(req, res) {
    try {
        let user = await guideCtrl.like(req.body);
        res.json(user);
    } catch (e) {
        res.status(422).json(e);
    }
}

async function dislike(req, res) {
    try {
        let user = await guideCtrl.dislike(req.body);
        res.json(user);
    } catch (e) {
        res.status(422).json(e);
    }
}

async function report(req, res) {
    try {
        let user = await guideCtrl.report(req.body);
        res.json(user);
    } catch (e) {
        res.status(422).json(e);
    }
}

async function getAll(req, res) {
    let guides = await guideCtrl.getAll(req.body);
    res.json(guides);
}

async function get(req, res) {
    let guides = await guideCtrl.get(req.query.id);
    res.json(guides);
}

async function approve(req, res) {
    try {
        let user = await guideCtrl.approve(req.body);
        res.json(user);
    } catch (e) {
        res.status(422).json(e);
    }
}

async function remove(req, res) {
    try {
        let user = await guideCtrl.remove(req.body, req.user);
        res.json(user);
    } catch (e) {
        res.status(422).json(e);
    }
}
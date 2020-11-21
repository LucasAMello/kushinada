const express = require('express');
const authRoutes = require('./auth.route');
const guideRoutes = require('./guide.route');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
    res.send('OK')
);

router.use('/auth', authRoutes);
router.use('/guide', guideRoutes);

module.exports = router;

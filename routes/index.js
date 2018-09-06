const express = require('express');
const path = require('path');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

router.get('/graph', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'vis.html'));
});

module.exports = router;

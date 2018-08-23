const express = require('express');
const graphController = require('../controllers/graphDatabaseController');

const router = express.Router();
// const config;

router.get('/', async (req, res) => {
  const joinha = await graphController.testNeo4j();
  res.send('Joinha');
});

module.exports = router;

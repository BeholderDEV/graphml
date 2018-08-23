const express = require('express');
const graphController = require('../controllers/graphDatabaseController');

const router = express.Router();

router.get('/', async (req, res) => {
  const joinha = await graphController.testNeo4j();
  res.send('Joinha');
});

router.post('/', async (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

module.exports = router;

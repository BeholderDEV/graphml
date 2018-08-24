const express = require('express');
const graphController = require('../controllers/graphDatabaseController');
const xmlController = require('../controllers/xmlController');

const router = express.Router();

router.get('/', async (req, res) => {
  const joinha = await graphController.testNeo4J();
  res.send('Joinha');
});

router.post('/', async (req, res) => {
  console.log(req.headers['content-type']);
  if (req.is('application/xml')) {
    
  }
  res.send(req.body);
});

module.exports = router;

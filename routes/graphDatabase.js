const express = require('express');
const graphController = require('../controllers/graphDatabaseController');
const Transformer = require('../controllers/XMLTransformer');

const router = express.Router();

router.get('/', async (req, res) => {
  const joinha = await graphController.testNeo4J();
  res.send('Joinha');
});

router.post('/', async (req, res) => {
  const transformer = new Transformer(); 
  if (req.is('application/xml')) {
    const nodes = transformer.receiveXML(req.body);
    // await graphController.deleteNodes();
    const result = await graphController.createGraph(nodes);
    res.send(result);
    return;
  }
  res.send(req.body);
});

module.exports = router;

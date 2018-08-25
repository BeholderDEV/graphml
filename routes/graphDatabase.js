const express = require('express');
const GraphController = require('../controllers/GraphDatabase');
const Transformer = require('../controllers/XMLTransformer');

const router = express.Router();

router.get('/', async (req, res) => {
  const joinha = await graphController.testNeo4J();
  res.send('Joinha');
});

router.post('/', async (req, res) => {
  if (req.is('application/xml')) {
    const transformer = new Transformer(); 
    const graphController = new GraphController();
    const nodes = transformer.receiveXML(req.body);
    const result = await graphController.createGraph(nodes, true);
    res.send(result);
    return;
  }
  res.send(req.body);
});

module.exports = router;

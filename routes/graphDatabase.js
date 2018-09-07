const express = require('express');
const GraphController = require('../controllers/GraphDatabase');
const Transformer = require('../controllers/XMLTransformer');

const router = express.Router();

router.get('/', async (req, res) => {
  const graphController = new GraphController();
  const result = await graphController.getDatabase();
  graphController.prepareGraphJSON(result);
  res.send(JSON.stringify(result));
});

router.get('/xml', async (req, res) => {
  const graphController = new GraphController();
  const transformer = new Transformer(); 
  const result = await graphController.getDatabase();
  graphController.prepareGraphJSON(result);
  const xml = transformer.transformIntoXML(result);
  res.setHeader('content-type', 'application/xml');
  res.send(xml);
});

router.post('/', async (req, res) => {
  console.log(req.headers['content-type']);
  if (req.is('application/xml')) {
    const transformer = new Transformer(); 
    const graphController = new GraphController();
    const nodes = transformer.receiveXML(req.body);
    const resultCreate = await graphController.createGraph(nodes, true);
    if (resultCreate === 'error') {
      res.send(JSON.stringify({ result: resultCreate }));
      return;
    }
    const result = await graphController.getDatabase();
    graphController.prepareGraphJSON(result);
    res.send(JSON.stringify(result));
    return;
  }
  res.send(req.body);
});

router.delete('/', async (req, res) => {
  if (req.body.nodes !== undefined) {
    const graphController = new GraphController();
    await graphController.deleteNodes(req.body.nodes);
    const result = await graphController.getDatabase();
    graphController.prepareGraphJSON(result);
    res.send(JSON.stringify(result));
    return;
  }
  res.send(JSON.stringify('No nodes found'));
});

module.exports = router;

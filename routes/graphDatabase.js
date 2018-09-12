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

router.post('/node', async (req, res) => {
  const newNode = req.body;
  const graphController = new GraphController();
  const valideNode = await graphController.ValidateNewNode(newNode.node);
  if (!valideNode){
    console.log('Fail');
    res.send(JSON.stringify('Failure'));
    return;
  }
  await graphController.createNewNode(newNode.node, newNode.root);
  const result = await graphController.getDatabase();
  graphController.prepareGraphJSON(result);
  res.send(JSON.stringify(result));
});

router.post('/edge', async (req, res) => {
  const newEdge = req.body;
  const graphController = new GraphController();
  await graphController.createNewEdge(newEdge);
  const result = await graphController.getDatabase();
  graphController.prepareGraphJSON(result);
  res.send(JSON.stringify(result));
});

router.put('/', async (req, res) => {
  if (req.body.id !== undefined) {
    const graphController = new GraphController();
    await graphController.editNode(req.body.id, req.body.info);
    const result = await graphController.getDatabase();
    graphController.prepareGraphJSON(result);
    res.send(JSON.stringify(result));
    return;
  }
  res.send(JSON.stringify('No node to edit'));
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

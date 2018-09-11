const neo4j = require('neo4j-driver').v1;
let config;

if (!process.env.heroku) {
  config = require('../config.json');
}
const loginDB = process.env.login || config.login;
const passDB = process.env.pass || config.pass;

const driver = neo4j.driver('bolt://hobby-npdiilmgppbfgbkeagkjfnbl.dbs.graphenedb.com:24786', neo4j.auth.basic(loginDB, passDB));
const wait = (time) => new Promise(resolve => setTimeout(resolve, time));

class GraphDatabase {
  
  constructor () {
    this.session;
  }

  isArray(a) {
    return (!!a) && (a.constructor === Array);
  }

  async runNeo4jCommand(command, values) {
    try {
        const result = await this.session.run(command, values);
        return result.records;
    } catch (err) {
        console.log(err);
        return 'error';
    }
  }
  
  async deleteDatabase() {
    const result = this.runNeo4jCommand('MATCH (n) DETACH DELETE n');
  }
  
  async deleteNodes (nodesId) {
    const result = await this.startConnection(async () => {
      for (let i = 0; i < nodesId.length; i++) {
        const deleteRes = await this.runNeo4jCommand('MATCH (n) WHERE Id(n) = $id DETACH DELETE n', {id: neo4j.int(nodesId[i])});
      }
      return 'Joinha'
    });
    return result;
  }

  concateAttributes(command, attributes, concatNumber) {
    const attributesNames = Object.keys(attributes);
    attributesNames.forEach((att, i) => {
      command += att + ': $' + att;
      command += concatNumber;
      command += (i !== attributesNames.length - 1) ? ', ' : ''; 
    });
    return command;
  }
  
  changeAttributesNames(att, concatNumber) {
    const obj = {...att};
    const attributesNames = Object.keys(obj);
    attributesNames.forEach((a, i) => {
      const newNameForAtt = a + concatNumber;
      obj[newNameForAtt] = obj[a];
      delete obj[a]; 
    });
    return obj;
  }
  
  async createNode(node) {
    let command = 'MERGE (n:' + node.name + ' {';
    command = this.concateAttributes(command, node.attributes, '') + '}) RETURN n';
    const result = await this.runNeo4jCommand(command, node.attributes);
    return result[0];
  }
  
  async createNodeWithRoot(node, relationName) {
    let command = 'MATCH (n:' + node.root.name + ' {';
    command = this.concateAttributes(command, node.root.attributes, 0) + '}) MERGE (n)-[rel:' + relationName + ']->(n2:' + node.name + '{';
    command = this.concateAttributes(command, node.attributes, 1) + '}) RETURN n2';
    const values = {...this.changeAttributesNames(node.root.attributes, 0), ...this.changeAttributesNames(node.attributes, 1)};
    const result = await this.runNeo4jCommand(command, values);
    return result[0];
  }
  
  async relateNodes(node1, node2, relationName) {

    let command = 'MATCH (n:' + node1.name + ' {';
    command = this.concateAttributes(command, node1.attributes, 0) + '}) MATCH (n2:' + node2.name + ' {';
    command = this.concateAttributes(command, node2.attributes, 1) + '}) MERGE (n)-[rel:' + relationName + ']->(n2) return rel';
    const values = {...this.changeAttributesNames(node1.attributes, 0), ...this.changeAttributesNames(node2.attributes, 1)};
    const result = await this.runNeo4jCommand(command, values);
    return result[0];
  }
  
  async relateNodesWithRoot(node1, node2, relationName) {
    let command = 'MATCH (n:' + node1.root.name + ' {';
    command = this.concateAttributes(command, node1.root.attributes, 0) + '})--(n2:' + node1.name + ' {';
    command = this.concateAttributes(command, node1.attributes, 1) + '}) MATCH (n3:' + node2.root.name + ' {';
    command = this.concateAttributes(command, node2.root.attributes, 2) + '})--(n4:' + node2.name + ' {';
    command = this.concateAttributes(command, node2.attributes, 3) + '}) CREATE (n2)-[rel:' + relationName + ']->(n4) return n4';
    const valuesRoot = {...this.changeAttributesNames(node1.root.attributes, 0), ...this.changeAttributesNames(node2.root.attributes, 2)};
    const valuesOriginal = {...this.changeAttributesNames(node1.attributes, 1), ...this.changeAttributesNames(node2.attributes, 3)};
    const result = await this.runNeo4jCommand(command, {...valuesRoot, ...valuesOriginal});
    return result[0];
  }
    
  async prepareRelations (relation, index, nodes, relations) {
    let i = 1;
    do {
      const rel = {node1: nodes[index - 1], node2: nodes[index + i], relationName: relation.name};
      relations.push(rel);
      i++;
    } while (nodes[index + i].root === relation)
    nodes.splice(index, i - 1);
  }
  
  async createRelations(relations) {
    for (const rel of relations) {
      await this.relateNodes(rel.node1, rel.node2, rel.relationName);
    }
  }

  async createNodes(nodes, relations) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].root === undefined) {
        await this.createNode(nodes[i]);
        continue;
      }
      if (Object.keys(nodes[i].attributes).length === 0) {
        await this.prepareRelations(nodes[i], i, nodes, relations);
        continue;
      }
      await this.createNodeWithRoot(nodes[i], 'Possui');
    }
  }

  async editNode(id, info) {
    const keys = Object.keys(info);
    const result = await this.startConnection(async () => {
      const command = 'UNWIND $props as properties Match (n) WHERE Id(n) = $id SET n = properties return n';
      const values = {props: info, id: neo4j.int(id)};
      const result = await this.runNeo4jCommand(command, values);
      return result[0];
    });
    return result;
  }

  async startConnection(cb){
    try {
      this.session = driver.session();
      const result = await cb();
      return result;
    } catch (err) {
      console.log(err);
      return 'error';
    } finally {
      this.session.close();
    }
  }
  
  async createGraph(nodes, deletePreviousNodes) {
    const relations = [];
    const result = await this.startConnection(async() => {
      if(deletePreviousNodes) this.deleteDatabase();
      await this.createNodes(nodes, relations);
      await this.createRelations(relations);
      return 'success';
    });
    return result;
  }

  async getDatabase() {
    const result = await this.startConnection(async () => {
      const nodes = await this.runNeo4jCommand('MATCH (n) WITH collect( { info: properties(n), type: labels(n), id: id(n) } ) AS nodes RETURN nodes');
      const edges = await this.runNeo4jCommand('MATCH (a)-[r]->(b) WITH collect( { source: id(a), target: id(b), label: type(r) } ) AS edges RETURN edges');
      const joined = {nodes: nodes[0].get('nodes'), edges: edges[0].get('edges')};
      return joined;
    });
    return result;
  }

  prepareDisciplinaGroup(graph, node) {
    const disciplinaEdges = graph.edges.filter(e => e.target.low === node.id && e.label === 'Possui');
    const periodo = graph.nodes.filter(n => n.id === disciplinaEdges[0].source.low || n.id.low === disciplinaEdges[0].source.low);
    node.group = periodo[0].info.num || periodo[0].type;
    if (this.isArray(node.group)) node.group = node.group[0];
  }

  prepareLabel(node, maxLabelSize) {
    let label = (node.info.nome !== undefined) ? node.info.nome : node.info[Object.keys(node.info)[0]];
    if (label.length > maxLabelSize){
      label = label.substring(0, maxLabelSize) + '...';
    }
    if(label.length < maxLabelSize) {
      const fillStr = new Array(Math.floor(maxLabelSize * 1.55) - label.length + 4).join(' ');
      const magicalNumber = Math.floor(maxLabelSize * 1.55) - label.length + 4;
      const evenCheck = (magicalNumber % 2 === 0) ? 0 : 1;
      const fill = (evenCheck) ? fillStr.substr(0, fillStr.length / 2) : fillStr.substr(0, fillStr.length / 2 + 1);
      label = (evenCheck) ? fill + label + fill : fill + label + fill.substr(0, fill.length - 1);
    }
    return label;
  }

  prepareGraphJSON(graph) {
    graph.nodes.map((node) => {
      node.label = this.prepareLabel(node, 21);
      node.type = node.type[0];
      node.id = node.id.low;
      node.mass = 25;
      node.group = node.type;
      if (node.type === 'disciplina') this.prepareDisciplinaGroup(graph, node);
      if (node.type === 'periodo') node.group = node.info.num;
      return node;
    });
    graph.edges.map((edge) => {
      edge.from = edge.source.low;
      edge.to = edge.target.low;
    });
  }
}

module.exports = GraphDatabase;
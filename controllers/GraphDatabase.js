const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://hobby-npdiilmgppbfgbkeagkjfnbl.dbs.graphenedb.com:24786', neo4j.auth.basic(process.env.login, process.env.pass));
const wait = (time) => new Promise(resolve => setTimeout(resolve, time));

class GraphDatabase {
  
  constructor () {
    this.session;
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
  
  async deleteNodes() {
    const result = this.runNeo4jCommand('MATCH (n) DETACH DELETE n');
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
  
  async createGraph(nodes, deletePreviousNodes) {
    const relations = [];
    try {
        this.session = driver.session();
        if (deletePreviousNodes) this.deleteNodes();
        await this.createNodes(nodes, relations);
        await this.createRelations(relations);
        return 'success';
    } catch (err) {
        console.log(err);
        return 'error creating graph';
    } finally {
        this.session.close();
    }
  }
}

module.exports = GraphDatabase;
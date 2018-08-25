const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://hobby-npdiilmgppbfgbkeagkjfnbl.dbs.graphenedb.com:24786', neo4j.auth.basic(process.env.login, process.env.pass));
const wait = (time) => new Promise(resolve => setTimeout(resolve, time));
let session;

exports.runNeo4jCommand = async (command, values) => {
  try {
    const session = driver.session();
    const result = await session.run(command, values);
    session.close();
    return result.records;
  } catch (err) {
    console.log(err);
    return 'error';
  }
};

exports.deleteNodes = async () => {
  const result = this.runNeo4jCommand('MATCH (n) DETACH DELETE n');
};

exports.concateAttributes = (command, attributes, concatNumber) => {
  const attributesNames = Object.keys(attributes);
  attributesNames.forEach((att, i) => {
    command += att + ': $' + att;
    command += concatNumber;
    command += (i !== attributesNames.length - 1) ? ', ' : ''; 
  });
  return command;
};

exports.changeAttributesNames = (att, concatNumber) => {
  const obj = {...att};
  const attributesNames = Object.keys(obj);
  attributesNames.forEach((a, i) => {
    const newNameForAtt = a + concatNumber;
    obj[newNameForAtt] = obj[a];
    delete obj[a]; 
  });
  return obj;
};

exports.createNode = async (node) => {
  let command = 'MERGE (n:' + node.name + ' {';
  command = this.concateAttributes(command, node.attributes, '') + '}) RETURN n';
  const result = await this.runNeo4jCommand(command, node.attributes);
  return result[0];
};

exports.createNodeWithRoot = async (node, relationName) => {
  let command = 'MATCH (n:' + node.root.name + ' {';
  command = this.concateAttributes(command, node.root.attributes, 0) + '}) MERGE (n)-[rel:' + relationName + ']->(n2:' + node.name + '{';
  command = this.concateAttributes(command, node.attributes, 1) + '}) RETURN n2';
  const values = {...this.changeAttributesNames(node.root.attributes, 0), ...this.changeAttributesNames(node.attributes, 1)};
  const result = await this.runNeo4jCommand(command, values);
  return result[0];
};

exports.relateNodes = async (node1, node2, relationName) => {
  let command = 'MATCH (n:' + node1.name + ' {';
  command = this.concateAttributes(command, node1.attributes, 0) + '}) MATCH (n2:' + node2.name + ' {';
  command = this.concateAttributes(command, node2.attributes, 1) + '}) MERGE (n)-[rel:' + relationName + ']->(n2) return rel';
  const values = {...this.changeAttributesNames(node1.attributes, 0), ...this.changeAttributesNames(node2.attributes, 1)};
  const result = await this.runNeo4jCommand(command, values);
  return result[0];
};

exports.relateNodesWithRoot = async (node1, node2, relationName) => {
  let command = 'MATCH (n:' + node1.root.name + ' {';
  command = this.concateAttributes(command, node1.root.attributes, 0) + '})--(n2:' + node1.name + ' {';
  command = this.concateAttributes(command, node1.attributes, 1) + '}) MATCH (n3:' + node2.root.name + ' {';
  command = this.concateAttributes(command, node2.root.attributes, 2) + '})--(n4:' + node2.name + ' {';
  command = this.concateAttributes(command, node2.attributes, 3) + '}) CREATE (n2)-[rel:' + relationName + ']->(n4) return n4';
  const valuesRoot = {...this.changeAttributesNames(node1.root.attributes, 0), ...this.changeAttributesNames(node2.root.attributes, 2)};
  const valuesOriginal = {...this.changeAttributesNames(node1.attributes, 1), ...this.changeAttributesNames(node2.attributes, 3)};
  const result = await this.runNeo4jCommand(command, {...valuesRoot, ...valuesOriginal});
  return result[0];
};

exports.joinDisplinaPeriodo = async (disciplina, periodo) => {
  const result = await this.runNeo4jCommand('MATCH (c:Curso {nome: $curso})--(p:Periodo) WHERE p.número = $perioNum ' +
                                            'MATCH (d:Disciplina {código: $cod}) ' +
                                            'CREATE (p)-[poss:POSSUI]->(d) return poss', {curso: periodo.curso, perioNum: periodo.num, cod: disciplina.cod});
  return result[0];
};

exports.prepareRelations = async (relation, index, nodes, relations) => {
  let i = 1;
  do {
    const rel = {node1: nodes[index - 1], node2: nodes[index + i], relationName: relation.name};
    relations.push(rel);
    i++;
  } while (nodes[index + i].root === relation)
  nodes.splice(index, i - 1);
};

exports.createRelations = async (relations) => {
  for (const rel of relations) {
    await this.relateNodes(rel.node1, rel.node2, rel.relationName);
  }
};

exports.createGraph = async (nodes) => {
  const relations = [];
  // session = driver.session();
  try {
    this.deleteNodes();
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
    await this.createRelations(relations);
    return 'sucess';
  } catch (err) {
    console.log(err);
    return 'error creating graph';
  } finally {
    // session.close();
  }
};

exports.testNeo4J = async () => {
  const curso = {name: 'Curso', attributes: {nome:'Ciência da Computação'}};
  const discp = {nome: 'Introdução à Ciência da Computação', 'créditos': '2', 'código': '2023', 'descrição': 'Conceitos básicos de Ciência da Computação. As grandes áreas da Computação. O mercado de trabalho para o profissional da área.'};
  const discp2 = {nome: 'Matemática Computacional', 'créditos': '2', 'código': '2024', 'descrição': 'Conceitos básicos de Ciência da Computação. As grandes áreas da Computação. O mercado de trabalho para o profissional da área.'};
  const perio = {name: 'Periodo', attributes: {'Nome': '1º Período'}, root: curso};
  const perio2 = {name: 'Periodo', attributes: {'Nome': '2º Período'}, root: curso};
  const root = {name: 'Disciplina', attributes: discp, root: perio};
  const node = {name: 'Disciplina', attributes: discp2, root: perio2};

  // await this.deleteNodes();
  // await this.createNode(curso);
  // await this.createNodeWithRoot(perio, 'Possui');
  // await this.createNodeWithRoot(perio2, 'Possui');
  // await this.createNodeWithRoot(root, 'Possui');
  // await this.createNodeWithRoot(node, 'Possui');
  // await this.relateNodesWithRoot(node, root, 'REQUERIMENTO');

  // await this.createNode(root);
  // await this.createNode(node);
  // await this.createNodeWithRoot(perio, 'Possui');
  // await this.relateNodes(perio, root, 'Possui');
  // await this.relateNodes(perio, node, 'Possui');
  // await this.relateNodes(root, node, 'Requisito');
};
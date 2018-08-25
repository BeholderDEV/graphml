const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://hobby-npdiilmgppbfgbkeagkjfnbl.dbs.graphenedb.com:24786', neo4j.auth.basic(process.env.login, process.env.pass));
const wait = (time) => new Promise(resolve => setTimeout(resolve, time));

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

exports.concateAttributes = (command, attributes, concatNumber) => {
  const attributesNames = Object.keys(attributes);
  attributesNames.forEach((att, i) => {
    command += att + ': $' + att;
    command += (concatNumber) ? i : '';
    command += (i !== attributesNames.length - 1) ? ', ' : ''; 
  });
  return command;
};

exports.joinNodesAttributes = (att, att2) => {
  const obj2 = {...att2};
  const attributesNames = Object.keys(obj2);
  attributesNames.forEach((a, i) => {
    const newNameForAtt = a + i;
    obj2[newNameForAtt] = obj2[a];
    delete obj2[a]; 
  });
  const joinedObj = {...att, ...obj2};
  return joinedObj;
};


exports.createNode = async (node) => {
  let command = 'MERGE (n:' + node.name + ' {';
  command = this.concateAttributes(command, node.attributes) + '}) RETURN n';
  const result = await this.runNeo4jCommand(command, node.attributes);
  return result[0];
};

exports.createNodeWithRoot = async (root, node, relationName) => {
  let command = 'MATCH (n:' + root.name + ' {';
  command = this.concateAttributes(command, root.attributes) + '}) MERGE (n)-[rel:' + relationName + ']->(n2:' + node.name + '{';
  command = this.concateAttributes(command, node.attributes, true) + '}) RETURN rel';
  const values = this.joinNodesAttributes(root.attributes, node.attributes);
  const result = await this.runNeo4jCommand(command, values);
  return result[0];
};

exports.relateNodes = async (node1, node2, relationName) => {
  let command = 'MATCH (n:' + node1.name + ' {';
  command = this.concateAttributes(command, node1.attributes) + '}) MATCH (n2:' + node2.name + ' {';
  command = this.concateAttributes(command, node2.attributes, true) + '}) MERGE (n)-[rel:' + relationName + ']->(n2) return rel';
  const values = this.joinNodesAttributes(node1.attributes, node2.attributes);
  const result = await this.runNeo4jCommand(command, values);
  return result[0];
};

exports.joinDisplinaPeriodo = async (disciplina, periodo) => {
  const result = await this.runNeo4jCommand('MATCH (c:Curso {nome: $curso})--(p:Periodo) WHERE p.número = $perioNum ' +
                                            'MATCH (d:Disciplina {código: $cod}) ' +
                                            'CREATE (p)-[poss:POSSUI]->(d) return poss', {curso: periodo.curso, perioNum: periodo.num, cod: disciplina.cod});
  return result[0];
};

exports.testNeo4J = async () => {
  const curso = {name: 'Curso', attributes: {nome:'Ciência da Computação'}};
  const discp = {nome: 'Introdução à Ciência da Computação', 'créditos': '2', 'código': '2023', 'descrição': 'Conceitos básicos de Ciência da Computação. As grandes áreas da Computação. O mercado de trabalho para o profissional da área.'};
  const discp2 = {nome: 'Matemática Computacional', 'créditos': '2', 'código': '2024', 'descrição': 'Conceitos básicos de Ciência da Computação. As grandes áreas da Computação. O mercado de trabalho para o profissional da área.'};
  const perio = {name: 'Periodo', attributes: {'Número': '11221'}};
  const root = {name: 'Disciplina', attributes: discp};
  const node = {name: 'Disciplina', attributes: discp2};
  // await this.createNode(curso);
  // await this.createNode(root);
  // await this.createNode(node);
  // await this.createNodeWithRoot(curso, perio, 'Possui');
  // await this.relateNodes(perio, root, 'Possui');
  // await this.relateNodes(perio, node, 'Possui');
  // await this.relateNodes(root, node, 'Requisito');
};
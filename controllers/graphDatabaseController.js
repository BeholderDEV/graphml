const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://hobby-npdiilmgppbfgbkeagkjfnbl.dbs.graphenedb.com:24786', neo4j.auth.basic(process.env.login, process.env.pass));
const wait = (time) => new Promise(resolve => setTimeout(resolve, time));

exports.runNeo4jCommand = async (command, values) => {
  try {
    const session = driver.session();
    const result = await session.writeTransaction(tx => tx.run(command, values));
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
  const attributesNames = Object.keys(att2);
  attributesNames.forEach((a, i) => {
    const newNameForAtt = a + i;
    att2[newNameForAtt] = att2[a];
    delete att2[a]; 
  });
  const joinedObj = {...att, ...att2};
  return joinedObj;
};

exports.saveCurso = async (curso) => {
  const result = await this.runNeo4jCommand('CREATE (n:Curso {nome: $nome }) RETURN n', {nome: curso});
  return result[0];
};

exports.createNode = async (node) => {
  let command = 'CREATE (n:' + node.name + ' {';
  command = this.concateAttributes(command, node.attributes) + '}) RETURN n'; 
  // console.log(command);
  const result = await this.runNeo4jCommand(command, node.attributes);
  return result[0];
};

exports.savePeriodo = async (curso, periodoNum) => {
  const result = await this.runNeo4jCommand('MATCH (c:Curso {nome: $curso}) CREATE (c)-[poss:POSSUI]->(n:Periodo {número: $num }) RETURN n', {curso: curso, num: periodoNum});
  return result[0];
};

exports.saveDisciplina = async (disciplina) => {
  const result = await this.runNeo4jCommand('CREATE (n:Disciplina {nome: $nome, creditos: $cred, código: $cod, descrição: $desc }) RETURN n',
                                            {nome: disciplina.nome, cred: disciplina.cred, cod: disciplina.cod, desc: disciplina.desc});
  return result[0];
};

exports.joinDisplinaPeriodo = async (disciplina, periodo) => {
  const result = await this.runNeo4jCommand('MATCH (c:Curso {nome: $curso})--(p:Periodo) WHERE p.número = $perioNum ' +
                                            'MATCH (d:Disciplina {código: $cod}) ' +
                                            'CREATE (p)-[poss:POSSUI]->(d) return poss', {curso: periodo.curso, perioNum: periodo.num, cod: disciplina.cod});
  return result[0];
};

exports.defineRequisito = async (disciplina, requisito) => {
  const result = await this.runNeo4jCommand('MATCH (d:Disciplina {código: $cod}) ' +
                                            'MATCH (r:Disciplina {código: $codReq}) ' +
                                            'CREATE (d)-[req:REQUISITO]->(r) return r', {cod: disciplina.cod, codReq: requisito});
  return result[0];
};

exports.createNodeWithRoot = async (root, node, relationName) => {
  let command = 'MATCH (n:' + root.name + ' {';
  command = this.concateAttributes(command, root.attributes) + '}) CREATE (n)-[rel:' + relationName + ']->(n2:' + node.name + '{';
  command = this.concateAttributes(command, node.attributes, true) + '}) RETURN rel';
  const values = this.joinNodesAttributes(root.attributes, node.attributes);
  // console.log(command);
  // console.log(values);
  const result = await this.runNeo4jCommand(command, values);
  return result[0];
};

exports.relateNodes = async (node1, node2, relationName) => {
  let command = 'MATCH (n:' + node1.name + ' {';
  command = this.concateAttributes(command, node1.attributes) + '}) MATCH (n2:' + node2.name + ' {';
  command = this.concateAttributes(command, node2.attributes, true) + '}) CREATE (n)-[rel:' + relationName + ']->(n2) return rel';
  const values = this.joinNodesAttributes(node1.attributes, node2.attributes);
  // console.log(command);
  // console.log(values);
  const result = await this.runNeo4jCommand(command, values);
  return result[0];
};

exports.testNeo4J = async () => {
  const curso = {name: 'Curso', attributes: {nome:'Ciência da Computação'}};
  const discp = {nome: 'Introdução à Ciência da Computação', 'créditos': '2', 'código': '2023', 'descrição': 'Conceitos básicos de Ciência da Computação. As grandes áreas da Computação. O mercado de trabalho para o profissional da área.'};
  const discp2 = {nome: 'Matemática Computacional', 'créditos': '2', 'código': '2024', 'descrição': 'Conceitos básicos de Ciência da Computação. As grandes áreas da Computação. O mercado de trabalho para o profissional da área.'};
  const perio = {name: 'Periodo', attributes: {'Número': '11221'}};
  const root = {name: 'Disciplina', attributes: discp};
  const node = {name: 'Disciplina', attributes: discp2};
  await this.createNode(curso);
  await this.createNode(root);
  await this.createNode(node);
  await this.createNodeWithRoot(curso, perio, 'Possui');
  // await wait(2000);
  await this.relateNodes(perio, root, 'Possui');
  await this.relateNodes(perio, node, 'Possui');
  await this.relateNodes(root, node, 'REQUISITO');
  // const result = await this.createNode('Disciplina', discp);
  // console.log(result);
  // const satan = await this.joinDisplinaPeriodo(discp, perio);
  // const satan2 = await this.joinDisplinaPeriodo(discp2, perio);
  // const satan = await this.defineRequisito(discp2, discp.cod);
  // console.log(satan);
  // const curso = await this.saveCurso(nomeCurso);
  // const periodo = await this.savePeriodo(nomeCurso, '1');
  // const disciplina = await this.saveDisciplina(discp);
  // const disciplina2 = await this.saveDisciplina(discp2);
  // console.log(disciplina.toObject());

  // console.log(periodo.get('n').identity.low);
  // const satan = await this.joinCursoPeriodo(curso.get('n').identity.low, periodo.get('n').identity.low);
  // console.log(satan);
  // const result = await this.runNeo4jCommand("MATCH (n:Curso) WHERE ID(n) = 24 RETURN n", {id: '24'});
  // console.log(result.length);
  // result.forEach(e => {
  //   const record = e.toObject();
  //   try {
  //     console.log(record.n.identity.low);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });
};
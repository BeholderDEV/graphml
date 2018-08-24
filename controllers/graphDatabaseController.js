const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://hobby-npdiilmgppbfgbkeagkjfnbl.dbs.graphenedb.com:24786', neo4j.auth.basic(process.env.login, process.env.pass));

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

exports.saveCurso = async (curso) => {
  const result = await this.runNeo4jCommand('CREATE (n:Curso {nome: $nome }) RETURN n', {nome: curso});
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

exports.testNeo4J = async () => {
  const nomeCurso = 'Ciência da Computação';
  const discp = {nome: 'Introdução à Ciência da Computação', cred: '2', cod: '2023', desc: 'Conceitos básicos de Ciência da Computação. As grandes áreas da Computação. O mercado de trabalho para o profissional da área.'};
  const discp2 = {nome: 'Matemática Computacional', cred: '2', cod: '2024', desc: 'Conceitos básicos de Ciência da Computação. As grandes áreas da Computação. O mercado de trabalho para o profissional da área.'};
  
  const perio = {curso: nomeCurso, num: '1'};
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
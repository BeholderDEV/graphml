const neo4j = require('neo4j-driver').v1;
const xmlParser = require('xml-js');

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
  const command = "CREATE (c:Curso {nome: $nome }) RETURN c";
  const values = {name: curso};
  const result = await this.runNeo4jCommand(command, values);
  return result;
};

exports.savePeriodo = async (cursoName, periodoNum) => {
  const command = "CREATE (p:Periodo {número: $num }) RETURN p";
  const values = {num: periodoNum};
  const result = await this.runNeo4jCommand(command, values);
  
  return result;
};

exports.joinCursoPeriodo = async (cursoName, periodoId) => {

};

exports.testNeo4J = async () => {
  const values = {nome: 'satan'};
  const result = await this.runNeo4jCommand("MATCH (n:Curso) RETURN n", values);
  result.forEach(e => {
    const record = e.toObject();
    console.log(record);
    console.log(record.n["Node"].identity["Integer"].low);
    console.log(e.get('n'));
  });
};
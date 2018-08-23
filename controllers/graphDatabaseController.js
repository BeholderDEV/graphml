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

exports.testNeo4j = async () => {
  const command = "CREATE (n:Person {name: $name }) RETURN n.name";
  const values = {name: 'bob'};
  const result = await this.runNeo4jCommand(command, values);
  return result;
};
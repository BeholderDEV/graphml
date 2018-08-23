const neo4j = require('neo4j-driver');
const xmlParser = require('xml-js');

const driver = neo4j.driver('bolt://hobby-npdiilmgppbfgbkeagkjfnbl.dbs.graphenedb.com:24786', neo4j.auth.basic(process.env.login, process.env.pass));

exports.testNeo4j = async () => {
  const session = driver.session();
  const result = await session.run("CREATE (n:Person {name:'Bob'}) RETURN n.name");
  result.records.forEach((record) => {
    console.log(record);
  });
  session.close();
};
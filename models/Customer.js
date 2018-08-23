const mongoose = require('../config/mongoConnection');

const customerSchema = {
  nome: String,
  instituicao: String,
  funcao: String
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

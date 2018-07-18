var mongoose = require('mongoose');

var toSchema = mongoose.Schema({
	name:String
});

module.exports = mongoose.model('To', toSchema, 'tos');
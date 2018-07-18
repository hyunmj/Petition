var mongoose = require('mongoose');

var categorySchema = mongoose.Schema({
	name: String
});

module.exports = mongoose.model('Category', categorySchema);
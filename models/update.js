var BoardContents = require('./boardSchema');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/board');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
    console.log('connected!');
});

BoardContents.find({}, function(err, items) {
	if (err) throw err;

	items.forEach(function(item) {
		item.endDate = item.date.getTime() + 30*24*60*60000;
		item.save(function(err) {
			if(err) throw err;
		});
	});
	console.log('done');
});

var mongoose = require('mongoose');
var To = require('./toSchema');
var Category = require('./categorySchema');

var boardSchema = mongoose.Schema({
  writer: String,
  password: String,
  title: String,
  contents: String,
  comments: [{
    writer: String,
    memo: String,
    date:{type:Date, default:Date.now()}
  }],
  to: {type: mongoose.Schema.Types.ObjectId, ref: 'To'}, //총학/단과대/과
  category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'}, //1:수업/수강, 2:시설관리, 3:학생복지
  ncomments: {type: Number, default:0},
  count: {type:Number, default:0},
  date: {type:Date, default:Date.now()},
  endDate: {type: Date, default: Date.now() + 30*24*60*60000},
  updated: [{contents:String, date:{type:Date, default:Date.now()}}],
  deleted:{type:Boolean, default:false},
  feedback: {type: Boolean, default:false}
});

module.exports = mongoose.model('BoardContents', boardSchema);

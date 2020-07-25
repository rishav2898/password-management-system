const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
var conn = mongoose.Collection;
var passwordCatergorySchema = new mongoose.Schema({
	password_category: {
		type:String,
		required: true,
		index: {
			unique: true,
		}},
	date: {
		type: Date,
		default: Date.now
	}

});

var passwordCatergoryModel = mongoose.model('password_categories', passwordCatergorySchema);
module.exports = passwordCatergoryModel;
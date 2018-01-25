const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
	name: String,
	username: String,
	email: String,
	password: String
});

const User = module.exports = mongoose.model('User', userSchema);

module.exports.registerUser = (newUser, callback) => {
	bcrypt.genSalt(10, (err, salt) => {
		 	bcrypt.hash(newUser.password, salt, (err, hash) => {
		 		if(err) {
		 			console.log(err);
		 		}
		 		newUser.password = hash;
		 		newUser.save(callback);
		 	});
	});
}

module.exports.findUserByUsername = (username, callback) => {
	const query = {username: username};
	User.findOne(query, callback);
}

module.exports.findUserById = (id, callback) => {
	User.findById(id, callback);
}

module.exports.comparePassword = (enteredPassword, hash, callback) => {
	bcrypt.compare(enteredPassword, hash, (err, isMatch) => {
		if(err) throw err;
		callback(err, isMatch);
	});
}

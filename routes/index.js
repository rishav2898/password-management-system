var express = require('express');
var router = express.Router();
var userModule = require('../modules/user');
var PasswordCategoryModel = require('../modules/password_category');
var passModel = require('../modules/password_details');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
var getPassCat = PasswordCategoryModel.find({});
var getAllPass = passModel.find({});

function checkLoginUser(req, res, next) {
	var userToken = localStorage.getItem('userToken');
	try {
		var decoded = jwt.verify(userToken, 'loginToken');
	}
	catch (err) {
		res.render('index', { title: 'Password Management System', msg:''});
	}
	next();
}

/* GET home page. */

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


function checkEmail(req, res, next) {
	var email = req.body.email;
	var checkExistEmail = userModule.findOne({email:email});
	checkExistEmail.exec((err, data) => {
		if(err) throw err;
		if(data) {
			return res.render('signup', {title: 'Password Management System', msg: 'Email Already exist'});
		}
		next();
	});
}

function userName(req, res, next) {
	var UserName = req.body.uname;
	var checkUserExist = userModule.findOne({username:UserName});
	checkUserExist.exec((err, data) => {
		if(err) throw err;
		if(data) {
			return res.render('signup', {title: 'Pass  word Management System', msg: 'UserNamme Already exist'});
		}
		next();
	});
}

router.get('/', function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	if(loginUser) {
		res.redirect('/dashboard');
	}
	else {
  		res.render('index', { title: 'Password Management System', msg:''});
  	}
});

router.post('/', function(req, res, next) {
	var username = req.body.uname;
	var password = req.body.password;
	var checkUser = userModule.findOne({username:username});
	checkUser.exec((err, data) => {
		if(err) throw err;
		var getUserID = data._id;
		var getPassword = data.password;
		if(bcrypt.compareSync(password, getPassword)) 
		{
			var token = jwt.sign({ userID:  getUserID }, 'loginToken');
			localStorage.setItem('userToken', token);
			localStorage.setItem('loginUser', username);

			res.redirect('/dashboard');
		}
		else {
			res.render('index', {title: 'Password Management System', msg:'Invalid username and password'});
		}
	});
});
// checkEmail : middleware function to check email already exist or not

router.get('/dashboard', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	// console.log(loginUser);
	res.render('dashboard', {title: 'Password Management System', loginUser:loginUser, msg:''} );
})

router.get('/signup', function(req, res, next) {

	var loginUser = localStorage.getItem('loginUser');
	if(loginUser) {
		res.redirect('/dashboard');
	}
	else {
		res.render('signup', {title: 'Password Management System', msg:'' });
	}
})

router.post('/signup', checkEmail, userName, function(req, res, next) {
	var username = req.body.uname;
	var email = req.body.email;
	var password = req.body.password;
	var confirmpassword = req.body.confpassword;

	if(password != confirmpassword) {
		res.render('signup', {title: 'Password Management System', msg:'password not matched!' });
	}
	else {
		password = bcrypt.hashSync(password, 10);
		var userDetails = new userModule({
			username: username,
			email: email,
			password: password
		});

		userDetails.save((err, doc) => {
			if(err) throw err;
			res.render('signup', {title: 'Password Management System', msg: 'User Registered Successfully'});
		});
	}
})

router.get('/PasswordCategory', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	getPassCat.exec(function(err, data) {
		if(err) throw err;
		res.render('Password_Category', {title: 'Password Management System', loginUser:loginUser, errors:'', Success:'', records:data });
	});
});

router.get('/PasswordCategory/delete/:id', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	var passcat_id = req.params.id;
	// console.log(passcat_id);
	var passdelete = PasswordCategoryModel.findByIdAndDelete(passcat_id);
	console.log("passcat id =", passcat_id)
	passdelete.exec(function(err) {
		if(err) {
			console.log(err);
			throw err;
		}
		res.redirect('/PasswordCategory');
	});
});

router.get('/PasswordCategory/edit/:id', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	var passcat_id = req.params.id;
	// console.log(passcat_id);
	var getPassCat = PasswordCategoryModel.findById(passcat_id);
	getPassCat.exec(function(err, data) {
		console.log(data);
		if(err) {
			throw err;
		}
		res.render('edit_pass_cat', {title: 'Password Management System', loginUser:loginUser, errors:'', Success:'', records:data, id:passcat_id });
	});
});


router.post('/PasswordCategory/edit/', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	var passcat_id = req.body.id;
	var passcat_id1 = req.body.passwordCategory;
	// console.log(passcat_id);
	// console.log(passcat_id1);
	var update_PassCat = PasswordCategoryModel.findByIdAndUpdate(passcat_id, {password_category:passcat_id1});
	update_PassCat.exec(function(err, doc) {
		if(err) {
			throw err;
		}
		res.redirect('/PasswordCategory');
	});
});


router.get('/add-new-category', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	res.render('addNewCategory', {title: 'Password Management System', loginUser:loginUser, errors:'', Success:''});
});

router.post('/add-new-category', checkLoginUser, [check('passwordCategory', 'Enter Password Category Name').isLength({min: 1})], 
			function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	const errors = validationResult(req);
	// console.log(errors);
	if(!errors.isEmpty()) {
		// console.log(errors);
		res.render('addNewCategory', {title: 'Password Management System', loginUser:loginUser, errors: 'Enter Password Category Name', Success:'' });
	}
	else {
		var passwordCatName = req.body.passwordCategory;
		console.log(passwordCatName);
		var passCatDetails = new PasswordCategoryModel({
			password_category: passwordCatName
		});

		passCatDetails.save(function(err, doc) {
			if(err) throw err;
			res.render('addNewCategory', {title: 'Password Management System', loginUser:loginUser, errors: '', Success: 'Password Category Inserted Successfully' });

		})
	}
});

router.get('/add-new-password', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	getPassCat.exec(function(err, data) {
		if(err) throw err;
		res.render('addNewPassword', {title: 'Password Management System', loginUser:loginUser, records:data, Success:''});
	});
});

router.post('/add-new-password', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	var pass_cat = req.body.pass_cat;
	var project_name = req.body.project_name;
	var pass_details = req.body.pass_details;

	var password_details = new passModel({
		password_category: pass_cat,
		pass_detail: pass_details,
		project_name: project_name
	});
	password_details.save(function(err, doc) {
		getPassCat.exec(function(err, data) {
			if(err) throw err;
			res.render('addNewPassword', {title: 'Password Management System', loginUser:loginUser, records:data, Success: 'password detail inserted Successfully'});
		});
	});

});


router.get('/view-all-password', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	getAllPass.exec(function(err, data) {
		if(err) throw err;
		res.render('ViewAllPassword', {title: 'Password Management System', loginUser:loginUser, records:data });	
	});
	
});


router.get('/password-detail/edit/:id', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	var id = req.params.id;
	var getPassDetails = passModel.findById({_id:id});

	getPassDetails.exec(function(err, data) {
		if(err) throw err;
		getPassCat.exec(function(err, data1){
			res.render('edit_password_details', {title: 'Password Management System', loginUser:loginUser, records:data1, record:data, Success:''});
		});		
	});
	
});

router.post('/password-detail/edit/:id', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	var id = req.params.id;
	var passCat = req.body.pass_cat;
	var projectName = req.body.project_name;
	var passDetails = req.body.pass_details;
	
	passModel.findByIdAndUpdate(id, {password_category:passCat, project_name:projectName, pass_detail:passDetails}).exec(function(err){
		if(err) throw err;
		var getPassDetails = passModel.findById({_id:id});

		getPassDetails.exec(function(err, data) {
			if(err) throw err;
			getPassCat.exec(function(err, data1){
				res.render('edit_password_details', {title: 'Password Management System', loginUser:loginUser, records:data1, record:data, Success:'Password updated Successfully'});
			});
		});	
	});
	
});

router.get('/password-detail/delete/:id', checkLoginUser, function(req, res, next) {
	var loginUser = localStorage.getItem('loginUser');
	var id = req.params.id;
	console.log(id);
	var passdelete = passModel.findByIdAndDelete(id);
	passdelete.exec(function(err) {
		if(err) {
			console.log(err);
			throw err;
		}
		res.redirect('/view-all-password');
	});
});

router.get('/logout', function(req, res, next) {
	localStorage.removeItem('userToken');
	localStorage.removeItem('loginUser');
	res.render('index', {title: 'Password Management System', msg:''});
});

module.exports = router;

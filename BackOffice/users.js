///////////////////////////////////////////////////////
//
// Paulo Gandra de Sousa, Alexandre Bragança
// PSIDI / MEI / ISEP
// (c) 2014
//
///////////////////////////////////////////////////////

//
// a node module to handle the /user/ resource and the /photo/ subresource
//

/************/
// data
/************/

//TODO pass these as parameters to the module
var port = process.env.PORT || 3001;
var SERVER_ROOT = "http://localhost:" + port;


// DATA STORE

var users =  {};


// SAMPLE DATA


users['Mary'] = {username: "Mary", email:"mary@contoso.com", password: "12345", createdOn: new Date(),status: "Active"};
users['Ann'] =  {username: "Ann",  email:"ann@contoso.com", password: "qwerty", createdOn: new Date().getDate()-1,status: "Active"};
users['Tom'] =  {username: "Tom",  email:"tom@contoso.com", password: "abc123", createdOn: new Date(2014, 05, 02),status: "Active"};



// handling users' collection
//
// GET 		not allowed 
// POST		not allowed
// PUT 		creates an user
// DELETE 	not allowed
//

function GetUsers(req, res) {
		res.status(405).send("Request not supported.");
	};

function PutUsers(req, res) {
		res.status(405).send("Request not supported.");
	};

function PostUsers(req, res) {
		var entry = users[req.body.username];
		if (entry == undefined)
		{
			users[req.body.username] = {username:req.body.username, email:req.body.email, password:req.body.password, createdOn: Date(), status: "Active"};
			res.set('Location', SERVER_ROOT + "/user/" + req.body.username);
			res.sendstatus(201)
		}
		else {
			res.status(409).send("User not allowed");
		}	
	};

function DeleteUsers(req, res) {
		res.status(405).send("Request not supported.");
	};

// handling user 
//
// GET 		returns user details
// POST		not allowed
// PUT 		updates an user
// DELETE 	deactivates an user
//


function GetUser(req, res) {
	var user = users[req.uID];
		delete user.password;
		if (user==undefined) {
			res.status(404).send("User " + req.uID + " doesn't exists.");
		}
		else {
			if (user.status != "Deactive") {
				res.format({
					'application/json': function(){
						res.json(user);
					},
					'default': function	(){
						res.status(406).send("Request not accepted.");
					}
				});
			}
			else {
				res.status(404).send("User " + req.uID + " isn't active anymore.");
			}
		}
	};

function PutUser(req, res) {
		var user = users[req.uID];
		if (user==undefined) {
			res.status(404).send("User " + req.uID + " doesn't exists.");
		}
		else {	
			console.log(req.body.password);
			user.password = req.body.password;
			res.status(200).send("Password changed!");
		}

	};

function PostUser(req, res) {
		res.status(405).send("Request not supported.");
	};

function DeleteUser(req, res) {
		var user = users[req.uID];
		if (user==undefined || user.status == "Deactive") {
			res.status(404).send("User " + req.username + " doesn't exists.");
		}
		else{	
			user.status = "Deactive";
			res.status(204).send("User deactivated!");
		}	
	};


function login(req, res, cb) {
    	var username = req.body.username || '';
    	var password = req.body.password || '';
 		var result = false;

	    if (username == '' || password == '') {
        	result = false;
    	}
 	

	 	var user = users[req.body.username];
 		if (user == undefined) {
			result = false;
		}
		else {
	  		if (password == user.password) {
	  			console.log("validei password" + user.username);
				result =  true;
        	}
	    	else {
        		console.log("Attempt failed to login with " + user.username);
		        result =false;
    		}      
    	}    	
    	cb(result);
	};



/////////////////////////////
// MODULE EXPORTS

exports.GetUsers = GetUsers;
exports.PutUsers = PutUsers;
exports.PostUsers = PostUsers;
exports.DeleteUsers = DeleteUsers;

exports.SingleGetUser = GetUser;
exports.SinglePostUser = PostUser;
exports.SinglePutUser = PutUser;
exports.SingleDeleteUser = DeleteUser;

exports.DoLogin = login;

exports.TheUser = users
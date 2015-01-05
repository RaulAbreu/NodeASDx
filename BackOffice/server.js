///////////////////////////////////////////////////////
//
// Paulo Gandra de Sousa, Alexandre Bragança
// PSIDI / MEI / ISEP
// (c) 2014
//
///////////////////////////////////////////////////////


//
// an express server exposing a /message/ and /user/ resource that also 
// handles /photo/ subresources with file uploads via form multipart
// it also generates a PDF representation of the user resource using content negotiation 
//


const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');


// var multer = require('multer'); // for multipart file upload via form

//var methodOverride = require('method-override');


const usersHandler = require("./users");
const albumsHandler = require("./albums");
const ordersHandler = require("./orders");
	
const app = express();

app.use(multer({ dest: './uploads/'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//app.use(methodOverride());

//app.set('jwtTokenSecret', 'myphotoalbumSecretSentence');

//
// USER resource
//




app.param('uID', function(req, res, next, uID){
  req.uID = uID;
  return next()
});

app.param('aID', function(req, res, next, aID){
  req.aID = aID;
  return next()
});

app.param('phID', function(req, res, next, phID){
  req.phID = phID;
  return next()
});

app.route("/user") 
	.get(usersHandler.GetUsers)
	.put(usersHandler.PutUsers)
	.post(usersHandler.PostUsers)
	.delete(usersHandler.DeleteUsers);


app.route("/user/:uID") 
	.get(usersHandler.SingleGetUser)
	.put(usersHandler.SinglePutUser)
	.post(usersHandler.SinglePostUser)
	.delete(usersHandler.SingleDeleteUser);

app.post("/login", function(req, res) {

		usersHandler.DoLogin(req,res, function(result){
			console.log(result);
			if (result === true) {
			var token = jwt.encode({
								iss: req.body.username,
								}, app.get('jwtTokenSecret'));
 
				res.json({token: token });	
		}
		else {
			console.log("Attempt failed to login with " + req.body.username);
		  return res.sendStatus(401);
		}
		
	});

});


app.route("/album")	
	.put(function(req, res) {
			res.status(405).send("Request not supported.");	
		})
	.delete(function(req, res) {
			res.status(405).send("Request not supported.");	
		})
	.get(albumsHandler.GetAlbums)
	.post(albumsHandler.PostAlbums);

app.route("/album/:aID")
	.put(function(req, res) {
			res.status(405).send("Request not supported.");	
		})
	.get(albumsHandler.SingleGetAlbum)
	.post(albumsHandler.SinglePostAlbum)
	.delete(albumsHandler.SingleDeleteAlbum);

app.route("/album/:aID/photos")
	.put(function(req, res) {
			res.status(405).send("Request not supported.");	
		})
	.get(albumsHandler.GetAlbumPhotos)
	.post(albumsHandler.PostAlbumPhotos)	
	.delete(albumsHandler.DeleteAlbumPhotos);
	

app.route("/album/:aID/photos/:phID")	
	.post(function(req, res) {
			res.status(405).send("Request not supported.");	
		})
	.put(function(req, res) {
			res.status(405).send("Request not supported.");	
		})
	.get(albumsHandler.GetAlbumSinglePhoto)
	.delete(albumsHandler.DeleteAlbumSinglePhoto);


app.route("/photo/:phID")
	.get(function(req,res) {
		res.status(405).send("Request not supported.");	
	})
	.put(function(req,res) {
		res.status(405).send("Request not supported.");	
	})
	.delete(function(req,res) {
		res.status(405).send("Request not supported.");	
	})
	.post(albumsHandler.PostSinglePhoto);


app.route("/order")
	.put(function(req, res) {
			res.status(405).send("Request not supported.");	
		})
	.delete(function(req, res) {
			res.status(405).send("Request not supported.");	
		})
	.get(ordersHandler.GetOrders)
	.post(ordersHandler.PostOrders);



/////////////////////////////
// STARTING ...


var port = process.env.PORT || 3001;

app.listen(port, function() {
	console.log("Listening on " + port);
});
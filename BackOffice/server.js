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


var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');


// var multer = require('multer'); // for multipart file upload via form

//var methodOverride = require('method-override');

// var messageHandling = require("./message-handler");
var usersHandler = require("./users");
var albumsHandler = require("./albums");
	
var app = express();

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
	.get(albumsHandler.GetAlbums)
	.post(albumsHandler.PostAlbums)
	.put()
	.delete();

app.route("/album/:aID")
	.get(albumsHandler.SingleGetAlbum)
	.post(albumsHandler.SinglePostAlbum)
	.put(albumsHandler.SinglePutAlbum)
	.delete(albumsHandler.SingleDeleteAlbum);

app.route("/album/:aID/photos")
	.get(albumsHandler.GetAlbumPhotos)
	.post(albumsHandler.PostAlbumPhotos)
	.put(albumsHandler.PutAlbumPhotos)
	.delete(albumsHandler.DeleteAlbumPhotos);
	

app.route("/album/:aID/photos/:phID")
	.get(albumsHandler.GetAlbumSinglePhoto)
	.post(albumsHandler.PostAlbumSinglePhoto)
	.put(albumsHandler.PutAlbumSinglePhoto)
	.delete(albumsHandler.DeleteAlbumSinglePhoto);


app.route("/photos/:phID")
	.get(albumsHandler.GetSinglePhoto)
	.post(albumsHandler.PostSinglePhoto)
	.put(albumsHandler.PutSinglePhoto)
	.delete(albumsHandler.DeleteSinglePhoto);

/////////////////////////////
// STARTING ...


var port = process.env.PORT || 3001;

app.listen(port, function() {
	console.log("Listening on " + port);
});
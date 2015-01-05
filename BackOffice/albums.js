//
// a node module to handle the /album/ resource and the /photos/ subresource
// 
//


const fs = require("fs");
const request = require('request');

/************/
// data
/************/

//TODO pass these as parameters to the module
const port = process.env.PORT || 3001;
const SERVER_ROOT = "http://localhost:" + port;

const ROOT_DIR = __dirname; 


// DATA STORE

var albums =  {};
var photos =  {};


const photoValue = 7;
const shipValue = 12.5;
const QuoteURI="http://iheartquotes.com/api/v1/random?format=json";


// SAMPLE DATA


photos['ph25.5'] = {id: "ph25.5", path: "D:\\PSIDI_Dev\\NodeASDx\\BackOffice\\photos\\ph25.5.jpg", description: "Que bonito", date: "2022-02-02", owner: "Mary", createdOn: "2015-01-03" }	


albums['1'] = {id:"1", owner: "Mary", name:"teste", description: "teste grande", beginDate: new Date(2014, 05, 02), endDate: new Date(2014,06,02), createdOn: new Date(),
photosCount: 1, photos:[ photos['ph25.5'] ], forPrinting: false, theme:"life", citation:"After I run your program, let's make love like crazed weasels, OK?", price:19.5, status:"Active"};

albums['2'] =  {id:"2", owner: "Ann",  name:"teste2", description: "teste grande 2", beginDate: new Date(2013, 05, 02), endDate: new Date(2014,05,02), createdOn: new Date().getDate()-1,
photosCount: 0, photos:[], forPrinting: true, theme:"life", citation:"Machines take me by surprise with great frequency.", price:0, status:"Active"};

albums['3'] =  {id:"3", owner: "Tom",  name:"teste3", description: "teste grande 3", beginDate: new Date(2013, 05, 02), endDate: new Date(2013,07,02), createdOn: new Date().getDate()-1,
photosCount: 0, photos:[], forPrinting: true, theme:"life", citation:"As he had feared, his orders had been forgotten and everyone had brought the potato salad.", price:0, status:"Active"};




// handling album' collection
//
// GET 		not allowed 
// POST		not allowed
// PUT 		creates an album
// DELETE 	not allowed
//

function getAlbumMaxID(){
	var ids=[];
	for (i in albums)
	{ 
		ids.push(albums[i].id);	
	}
	ids.sort();
	ids.reverse();
	var maxID = ids[0];
	return parseInt(maxID) + 1;
};

function GetAlbums(req, res) {

		//Tenho k permitir, quando meter a questão do user!!!!
		res.status(405).send("Request not supported.");
};

function PostAlbums(req, res) {
		var albumID = getAlbumMaxID();
		albums[albumID] = { id:albumID, 
							owner:req.body.owner, 
							name:req.body.name, 
							description:req.body.description, 
							beginDate:req.body.beginDate,
							endDate:req.body.endDate, 							
							photosCount: 0,  
							forPrinting: req.body.forPrinting, 
							theme: req.body.theme, 
							citation: undefined ,
							price: 0,
							status: "Active",
							createdOn: new Date(),
							updatedOn: new Date()
						};	
		getCitation(albums[albumID]);
		res.set('Location', SERVER_ROOT + "/album/" + albumID);
		res.sendStatus(201);

};

// handling album 
//
// GET 		returns album details
// POST		not allowed
// PUT 		
// DELETE 	Deativates an album
//


function SingleGetAlbum(req, res) {
	var album = albums[req.aID];
	if (album != undefined && album.status != "Deactive") {
		res.json(album);
	} 
	else {
		res.status(404).send("Album " + req.aID + " not found.");
	}
};

function SinglePostAlbum(req, res) {
	var album = album[req.aID];	
	if (album != undefined && album.status != "Deactive") {
		if (req.body.forPrinting != undefined) {
			album.forPrinting = req.body.forPrinting;
		}
		if (req.body.name != undefined) {
			album.name = req.body.name;
		}
		if (req.body.description != undefined) {
			album.description = req.body.description;
		}
		if (req.body.beginDate != undefined) {
			album.beginDate = req.body.beginDate;
		}
		if (req.body.endDate != undefined) {
			album.endDate = req.body.endDate;
		}
		album.updatedOn = new Date;
		res.status(200).send("Album updated");
	}
	else {
		res.status(404).send("Album " + req.aID + " doesn't exists.");
	}		
};


function SingleDeleteAlbum(req, res) {
		var album = albums[req.aID];
		if (album==undefined || album.status == "Deactive") {
			res.status(404).send("Album " + req.aID + " doesn't exists.");
		}
		else{	
			album.status = "Deactive";
			res.status(204).send("Album deactivated!");
		}	
};



// handling album photos
//
// GET 		returns album photos list
// POST		adds a photo to the album
// PUT 		not allowed
// DELETE 	not allowed
//

function GetAlbumPhotos(req, res) {
	var album = albums[req.aID];
	if (album != undefined && album.status != "Deactive") {
		res.json(album.photos);
	} 
	else {
		res.status(404).send("Album " + req.aID + " not found.");
	}
};

function PostAlbumPhotos(req, res) {
		var album = albums[req.aID];		

		if (album === undefined || album.status == "Deactive") {
			res.status(404).send("Album " + req.aID + " not found.");
		}
		else {  if (album.forPrinting === false) {
					const newID = "ph" + (Math.random()*1000).toString().substr(1, 4);		
					if (req.files.displayImage != undefined) {
						var filename = req.files.displayImage.path; // TODO check if file has been sent
						var ext = filename.substr(filename.lastIndexOf('.'));
						var photoFilename = newID + ext;
						var Path = ROOT_DIR + "\\photos\\";
						var photoPath = Path + photoFilename;
						fs.exists(Path, function(exists) {
							if (!exists) {    				
								fs.mkdir(Path, function(error) {
									console.log(error); 
									res.status(500).send(error);	
								});	
							}
						});
						fs.rename(filename, photoPath, function(err){
							if (!err) {														
								photos[newID] = buildPhoto(newID, photoPath, req.body.description, req.body.date, album.owner);							
								album.photos.push(photos[newID]);
								album.photosCount += 1;
								album.price = (album.photosCount * photoValue) + shipValue;
								res.set('Location', SERVER_ROOT + "/album/" + album.id);
								res.status(201).send("Photo Uploaded Successfuly");
							}
							else {
								res.status(500).send(err);	
							}
						});
					}
					else {
						res.status(405).send("Operation not allowed. This is a normal album, you have to add a new photo!");	
					}
	 			}
	 			else {
	 				album.photos.push(photos[req.body.photoID]);
	 				album.photosCount += 1;
					album.price = (album.photosCount * photoValue) + shipValue;
					res.status(200).send("Photo added " + req.body.photoID + " to album " + req.aID + "successfuly");
	 			}
		}
};

function DeleteAlbumPhotos(req, res) {
	var album = albums[req.aID];
	if (album != undefined && album.status != "Deactive") {
		album.photos = [];
		album.photosCount = 0;
		abums.price = 0;
		res.status(204).send("Album " + req.aID + " photos deleted.");
	} 
	else {
		res.status(404).send("Album " + req.aID + " not found.");
	}
	res.status(405).send("Request not supported.");
};

function buildPhoto(newID, photoPath, description, date, owner) {
	const now = new Date();
	return {
			id : newID, 
			path : photoPath,
			description : description, 
			date: date,
			owner: owner,
			createdOn : now
		};
};


// handling album photo
//
// GET 		returns album photos list
// POST		adds a photo to the album
// PUT 		not allowed
// DELETE 	not allowed
//

function GetAlbumSinglePhoto(req, res) {
	var album = albums[req.aID];
	if (album != undefined && album.status != "Deactive") {
		var index= album.photos.lastIndexOf(photos[req.phID]);
		if (index == -1) {
			res.status(404).send("Photo " + req.phID + " not found.");	
		} 
		else {
			res.json(album.photos[index]);
		}
	} 
	else {
		res.status(404).send("Album " + req.aID + " not found.");
	}
};

function DeleteAlbumSinglePhoto(req, res) {
	var album = albums[req.aID];
	if (album != undefined && album.status != "Deactive") {
		var index= album.photos.lastIndexOf(photos[req.phID]);
		if (index == -1) {
			res.status(404).send("Photo " + req.phID + " not found.");	
		} 
		else {
			album.photos.splice(index,1);
			album.photosCount -= 1;
			album.price = (album.photosCount * photoValue) + shipValue;
			//Poderá fazer sentido enviar o album novamente!
			res.status(204).send("Photo " + req.phID + " deleted from album " + req.aID); 
		}
	} 
	else {
		res.status(404).send("Album " + req.aID + " not found.");
	}
};



// handling photo
//
// POST		updates photo



function PostSinglePhoto(req, res) {
	var photo = photos[req.body.UphotoID];
	if (photo == undefined) {
		res.status(404).send("Photo " + req.body.phID + " not found.");	
	}
	else {
		var filename = req.files.UdisplayImage.path; // TODO check if file has been sent
		var ext = filename.substr(filename.lastIndexOf('.'));
		var photoFilename = req.body.UphotoID + ext;
		var Path = ROOT_DIR + "\\photos\\";
		var photoPath = Path + photoFilename;
		fs.rename(filename, photoPath, function(err){
			if (!err) {							
				photo.path = photoPath;
				photo.description = req.body.Udescription;
				photo.date = req.body.Udate;				
				res.status(200).send("Photo Updated Successfuly");
			}
			else {
				res.status(500).send(err);	
			}
		});
	}	
};



	


function getCitation(album) {
	request({
    	uri : QuoteURI,
    		  json : {}
    		}, function(err, res, body){ 
        		if (!err) {  
         			album.citation = body.quote;
         		}
         		else {
         			console.log(err);
         		}
         	}) 
};


/////////////////////////////
// MODULE EXPORTS

exports.GetAlbums = GetAlbums;
exports.PostAlbums = PostAlbums;

exports.SingleGetAlbum = SingleGetAlbum;
exports.SinglePostAlbum = SinglePostAlbum;
exports.SingleDeleteAlbum = SingleDeleteAlbum;

exports.GetAlbumPhotos = GetAlbumPhotos;
exports.PostAlbumPhotos = PostAlbumPhotos;
exports.DeleteAlbumPhotos = DeleteAlbumPhotos;

exports.GetAlbumSinglePhoto = GetAlbumSinglePhoto;
exports.DeleteAlbumSinglePhoto = DeleteAlbumSinglePhoto;

exports.PostSinglePhoto = PostSinglePhoto;

exports.TheAlbums = albums;


var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true})
);

const port = process.env.PORT || 3001;
const SERVER_ROOT = "http://localhost:" + port;

var orders =  {};
var orderCount = 0;
var now = new Date();

function generateLocation() {
  	var latitude = 40.679482;
  	var longitude = -8.4366005;

  	return latitude + "," + longitude;
}

//EXAMPLE
orders[0] = { orderID:"0", customerOrderRef:"Mary", albums: {numberOfPhotos: "1", citation:"home sweet home", photo: {photoPath: "here"}, qty: "1"}, deliveryAddress: {street: "Sá da Bandeira", doorNumber:"100", zipCode:"4520", city:"Porto", country: "Portugal"}, status: "waiting", createdOn: now};


//GET Location
app.route("/location") 
	.get(function(req, res) {
		res.json(generateLocation());
	})
	.put(function(req, res) {
		res.status(405).send("Cannot overwrite the location.");
	})
	.post(function(req, res) {
		res.status(405).send("Cannot create new location.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the location.");
	});

app.route("/PrintingOrder")
	.post(function(req, res) {
		console.dir(req.body);
		orderCount++;
		orders[orderCount] = { orderID:orderCount, customerOrderRef: req.body.customerOrderRef, albums: {numberOfPhotos: req.body.numberOfPhotos, citation: req.body.citation, photo: {photoPath: req.body.photoPath}, qty: req.body.qty}, deliveryAddress: {street: req.body.street, doorNumber: req.body.doorNumber, zipCode: req.body.zipCode, city: req.body.city, country: req.body.country}, status: "waiting", createdOn: now};
		res.status(201).set('Location', SERVER_ROOT + "/PrintingOrder/" + orderCount).json(orders[orderCount]);
	})
	.put(function(req, res) {
		res.status(405).send("Cannot overwrite the entire Printing Order.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the entire Printing Order.");
	});

app.param('poID', function(req, res, next, poID){
  req.poID = poID;
  return next();
})

app.route("/PrintingOrder/:poID")
	//GET Order by ID
	.get(function(req, res) {
		var entry = orders[req.poID];
		
		if (entry === undefined) {
			res.status(404).send("Order " + req.poID + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		var entry = orders[req.poID];
		if (entry === undefined) {
			res.status(404).send("Order " + req.poID + " not found.");		
		}
		else {
			if(entry.status === "printing"){
				res.status(404).send("Status Order " + req.poID + " is Printing.");			// mudar o código 404 para outro	
			}else{
				entry.albums.numberOfPhotos = req.body.numberOfPhotos;
				entry.albums.citation = req.body.citation;
				entry.albums.photo.photoPath = req.body.photoPath;
				entry.albums.qty = req.body.qty;
				entry.deliveryAddress.street = req.body.street;
				entry.deliveryAddress.doorNumber = req.body.doorNumber;
				entry.deliveryAddress.zipCode = req.body.zipCode;
				entry.deliveryAddress.country = req.body.country;
				entry.status = "waiting"
				res.json(entry);
			}
		}
	})
	.post(function(req, res) {
		res.status(404).send("User " + req.poID + " not found.");	
	})
	.delete(function(req, res) {
		var entry = orders[req.poID];
		if (entry === undefined) {
			res.status(404).send("User " + req.poID + " not found.");
		}
		else {
			if(entry.status === "printing"){
				res.status(404).send("Order " + req.poID + " is being processed, can't delete this order anymore.");	// mudar o código 404 para outro	
			}else{
				delete orders[req.poID];
				res.status(204).send("User " + req.poID + " deleted.");
			}
		}
	});

app.route("/PrintingOrder/:poID/status")
	.get(function(req,res){
		var entry = orders[req.poID].status;
		
		if (entry === undefined) {
			res.status(404).send("Order " + req.poID + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		var entry = orders[req.poID];
		if (entry === undefined) {
			res.status(404).send("Order " + req.poID + " not found.");		
		}
		else {
			if(entry.status === "printing"){
				res.status(404).send("Order " + req.poID + " is being processed, can't change this status anymore.");	// mudar o código 404 para outro	
			}else{
				entry.status = req.body.status;
				res.json(entry);
			}
		}
	});

//////////////////////
////  STARTING... ////
//////////////////////

app.listen(port, function() {
	console.log("Listening on " + port);
});
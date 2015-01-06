var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true})
);

const port = process.env.PORT || 4003;
const SERVER_ROOT = "http://localhost:" + port;

var orders =  {};
var bid = {};

var bidCount = 0;
var orderCount = 0;

var now = new Date();
var expireDate = now.setDate(now.getDate() + 30); //30 dias até expirar o orçamento

function generateLocation() {
  	var latitude = 41.5472749;
  	var longitude = -8.4114212;

  	return latitude + "," + longitude;
}

function calcPrice(numberOfPhotos){
	return numberOfPhotos * 0.10;
}

//EXAMPLE
bid[0] = {bidID: 0, ref: "order for example", numberOfPhotos: {nPhotos: 5}, price: calcPrice (5), createdOn: now, expires: expireDate, accepted: false};
orders[0] = { orderID:"0", bid: bid[0], customerRef:"Mary", albums: { album:{ citation:"home sweet home", photos: {photoPath: "here"}}}, deliveryAddress: {street: "Sá da Bandeira", doorNumber:"100", zipCode:"4520", city:"Porto", country: "Portugal"}, status: "waiting", createdOn: now};

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

app.route("/order")
	.post(function(req, res) {
		console.dir(req.body);
		orderCount++;
		bidCount++;
		orders[orderCount] = { orderID:orderCount, bid: bid[req.body.bid], customerRef: req.body.customerOrderRef, albums: { album:{citation: req.body.citation, photos: {photoPath: req.body.photoPath}}}, deliveryAddress: {street: req.body.street, doorNumber: req.body.doorNumber, zipCode: req.body.zipCode, city: req.body.city, country: req.body.country}, status: "waiting", createdOn: now};
		
		if(req.body.bid != null){
			bid[req.body.bid].accepted = true;
			orders[orderCount].status = "printing";
		}

		res.status(201).set('Location', SERVER_ROOT + "/Order/" + orderCount).json(orders[orderCount]);
	})
	.put(function(req, res) {
		res.status(405).send("Cannot overwrite the entire Printing Order.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the entire Printing Order.");
	});

app.param('oid', function(req, res, next, oid){
  req.oid = oid;
  return next();
})

app.route("/order/:oid")
	//GET Order by ID
	.get(function(req, res) {
		var entry = orders[req.oid];
		
		if (entry === undefined) {
			res.status(404).send("Order " + req.oid + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		var entry = orders[req.oid];
		if (entry === undefined) {
			res.status(404).send("Order " + req.oid + " not found.");		
		}
		else {
			if(entry.status === "printing"){
				res.status(404).send("Status Order " + req.oid + " is Printing.");			// mudar o código 404 para outro	
			}else{
				entry.albums.album.citation = req.body.citation;
				entry.albums.album.photos.photoPath = req.body.photoPath;
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
		res.status(404).send("User " + req.oid + " not found.");	
	})
	.delete(function(req, res) {
		var entry = orders[req.oid];
		if (entry === undefined) {
			res.status(404).send("Order " + req.oid + " not found.");
		}
		else {
			if(entry.status === "printing"){
				res.status(404).send("Order " + req.oid + " is being processed, can't delete this order anymore.");	// mudar o código 404 para outro	
			}else{
				delete orders[req.oid];
				res.status(204).send("Order " + req.oid + " deleted.");
			}
		}
	});


//bid
app.route("/bid")
	.post(function(req, res) {
		console.dir(req.body);
		bidCount++;
		bid[bidCount] = {bidID: bidCount, ref: req.body.ref, numberOfPhotos: { nPhotos: req.body.nPhotos}, price: calcPrice(req.body.nPhotos), createdOn: now, expires: expireDate, accepted: false};
		res.status(201).set('Location', SERVER_ROOT + "/bid/" + bidCount).json(bid[bidCount]);
	})
	.put(function(req, res) {
		res.status(405).send("Cannot overwrite the entire Printing Order.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the entire Printing Order.");
	});

app.param('bid', function(req, res, next, bid){
  req.bid = bid;
  return next();
})

app.route("/bid/:bid")
	//GET Order by ID
	.get(function(req, res) {
		var entry = bid[req.bid];
		
		if (entry === undefined) {
			res.status(404).send("Bid " + req.bid + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		res.status(405).send("Cannot chance the bid order.");
	})
	.post(function(req, res) {
		res.status(405).send("Cannot overwrite the bid order.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the bid order.");
	});

app.route("/bid/:bid/accepted")
	.get(function(req, res) {
		var entry = bid[req.bid];
		if (entry === undefined) {
			res.status(404).send("Bid " + req.bid + " not found.");		
		}
		else {
			res.json(entry.accepted);
		}
	})
	.put(function(req, res) {
		var entry = bid[req.bid];
		if (entry === undefined) {
			res.status(404).send("Bid " + req.bid + " not found.");		
		}
		else {
			if(req.body.accepted == "false" || req.body.accepted == "true"){
				entry.accepted = req.body.accepted;
				res.json(entry.accepted);	
			}else{
				res.status(404).send("Bid " + req.bid + " only accept true or false");				
			}
		}
	})
	.post(function(req, res) {
		res.status(405).send("Cannot create a new bid order here.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the bid order.");
	});
//fim do bid

app.route("/order/:oid/status")
	.get(function(req,res){
		var entry = orders[req.oid].status;
		
		if (entry === undefined) {
			res.status(404).send("Order " + req.oid + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		var entry = orders[req.oid];
		if (entry === undefined) {
			res.status(404).send("Order " + req.oid + " not found.");		
		}
		else {
			if(entry.status === "printing"){
				res.status(404).send("Order " + req.oid + " is being processed, can't change this status anymore.");	// mudar o código 404 para outro	
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
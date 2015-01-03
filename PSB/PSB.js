var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true})
);

const port = process.env.PORT || 3002;
const SERVER_ROOT = "http://localhost:" + port;

var orders =  {};
var orderCount = 0;

var now = new Date();
var expireDate = now.setDate(now.getDate() + 30); //30 dias até expirar o orçamento

function generateLocation() {
  	location = { street: "Rua da Madalena", doorNumber: "110", zipCode: "4520", city: "Lisboa", country: "Portugal" }

  	return location;
}

//EXAMPLE
orders[0] = { orderID:"0", customerReference:"Mary", numberOfItems: 1, photoTotal: 5, items: { album: { totalPhotos: 5, comments: "teste", photos: {path:"here"}}, quantity: 1}, shippingAddress: {street: "Sá da Bandeira", doorNumber:"100", zipCode:"4520", city:"Porto", country: "Portugal"}, step: "waiting" ,createdOn: now, expires: expireDate};

//GET Location
app.route("/address") 
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

app.route("/Order")
	.post(function(req, res) {
		console.dir(req.body);
		orderCount++;
		orders[orderCount] = { orderID: orderCount, customerReference: req.body.customerReference, numberOfItems: req.body.numberOfItems, photoTotal: req.body.photoTotal ,items: { album: {totalPhotos: req.body.totalPhotos, comments: req.body.comments, photos: {path: req.body.path}}, quantity: req.body.quantity}, shippingAddress: {street: req.body.street, doorNumber: req.body.doorNumber, zipCode: req.body.zipCode, city: req.body.city, country: req.body.country}, step: "waiting", createdOn: now, expires: expireDate};
		res.status(201).set('Location', SERVER_ROOT + "/Order/" + orderCount).json(orders[orderCount]);
	})
	.put(function(req, res) {
		res.status(405).send("Cannot overwrite the entire Printing Order.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the entire Printing Order.");
	});

app.param('oID', function(req, res, next, oID){
  req.oID = oID;
  return next();
})

app.route("/Order/:oID")
	//GET Order by ID
	.get(function(req, res) {
		var entry = orders[req.oID];
		
		if (entry === undefined) {
			res.status(404).send("Order " + req.oID + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		var entry = orders[req.oID];
		if (entry === undefined) {
			res.status(404).send("Order " + req.oID + " not found.");		
		}
		else {
			if(entry.status === "printing"){
				res.status(404).send("Status Order " + req.oID + " is Printing.");			// mudar o código 404 para outro	
			}else{
				entry.numberOfItems = req.body.numberOfItems;
				entry.photoTotal = req.body.photoTotal;
				entry.items.album.totalPhotos = req.body.totalPhotos;
				entry.items.album.comments = req.body.comments;
				entry.items.album.photos.path = req.body.path;
				entry.items.quantity = req.body.quantity;
				entry.shippingAddress.street = req.body.street;
				entry.shippingAddress.doorNumber = req.body.doorNumber;
				entry.shippingAddress.zipCode = req.body.zipCode;
				entry.shippingAddress.country = req.body.country;
				entry.step = "waiting"
				res.json(entry);
			}
		}
	})
	.post(function(req, res) {
		res.status(404).send("User " + req.oID + " not found.");	
	})
	.delete(function(req, res) {
		var entry = orders[req.oID];
		if (entry === undefined) {
			res.status(404).send("User " + req.oID + " not found.");
		}
		else {
			if(entry.step === "printing"){
				res.status(404).send("Order " + req.oID + " is being processed, can't delete this order anymore.");	// mudar o código 404 para outro	
			}else{
				delete orders[req.oID];
				res.status(204).send("User " + req.oID + " deleted.");
			}
		}
	});

app.route("/Order/:oID/step")
	.get(function(req,res){
		var entry = orders[req.oID].step;
		
		if (entry === undefined) {
			res.status(404).send("Order " + req.oID + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		var entry = orders[req.oID];
		if (entry === undefined) {
			res.status(404).send("Order " + req.oID + " not found.");		
		}
		else {
			if(entry.step === "printing"){
				res.status(404).send("Order " + req.oID + " is being processed, can't change this status anymore.");	// mudar o código 404 para outro	
			}else{
				entry.step = req.body.step;
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
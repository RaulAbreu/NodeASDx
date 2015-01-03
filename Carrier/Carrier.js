var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true})
);

const port = process.env.PORT || 4000;
const SERVER_ROOT = "http://localhost:" + port;

var carrier =  {};
var carrierCount = 0;

var now = new Date();

//EXAMPLE
carrier[0] = { orderID:"0", orderRef: "order0", packages: 1, pickUpAddress: {street: "Sá da Bandeira", doorNumber:"100", zipCode:"4520", city:"Porto", country: "Portugal"}, deliveryAddress: {street: "Rua da ria", doorNumber:"100", zipCode:"4440", city:"Aveiro", country: "Portugal"}, status: "in transit", createdOn: now};

app.route("/DispatchOrder") 
	.post(function(req, res) {
		console.dir(req.body);
		carrierCount++;
		carrier[carrierCount] = { orderID: carrierCount, orderRef: req.body.orderRef, packages: req.body.packages, pickUpAddress: {street: req.body.streetP, doorNumber: req.body.doorNumberP, zipCode: req.body.zipCodeP, city: req.body.cityP, country: req.body.countryP}, deliveryAddress: {street: req.body.streetD, doorNumber: req.body.doorNumberD, zipCode: req.body.zipCodeD, city: req.body.cityD, country: req.body.countryD}, status: "in transit", createdOn: now};
		res.status(201).set('Location', SERVER_ROOT + "/DispatchOrder/" + carrierCount).json(carrier[carrierCount]);
	})
	.put(function(req, res) {
		res.status(405).send("Cannot overwrite the entire carrier order.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the entire carrier order.");
	});

app.param('doid', function(req, res, next, doid){
  req.doid = doid;
  return next();
})

app.route("/DispatchOrder/:doid")	
	.get(function(req, res) {
		var entry = carrier[req.doid];
		
		if (entry === undefined) {
			res.status(404).send("Dispatch Order " + req.doid + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		res.status(405).send("Cannot change the carrier order.");
	})
	.post(function(req, res) {
		res.status(405).send("Cannot overwrite the carrier order.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the entire carrier order.");
	});

app.route("/DispatchOrder/:doid/status")
	.get(function(req,res){
		var entry = carrier[req.doid].status;
		
		if (entry === undefined) {
			res.status(404).send("Order " + req.doid + " not found.");		
		}
		else {
			res.json(entry);
		}
	})
	.put(function(req, res) {
		res.status(405).send("Cannot change the carrier status.");
	})
	.post(function(req, res) {
		res.status(405).send("Cannot overwrite the carrier status.");
	})
	.delete(function(req, res) {
		res.status(405).send("Cannot delete the entire carrier status.");
	});

//////////////////////
////  STARTING... ////
//////////////////////

app.listen(port, function() {
	console.log("Listening on " + port);
});
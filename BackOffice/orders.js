

const fs = require("fs");
const request = require('request');
const albumsHandler = require("./albums");
const xml_digester = require("xml-digester");
const validator = require('validator');




/************/
// data
/************/

//TODO pass these as parameters to the module
const port = process.env.PORT || 3001;
const SERVER = "http://localhost:"
const SERVER_ROOT = SERVER + port;

var i = 0;
var orders =  {};
var printershops = {};
const GmapsURI ="https://maps.googleapis.com/maps/api/distancematrix/xml?origins=origem&destinations=destino&sensor=false&key=AIzaSyCPB2d7-1zMZd25BDlBQxLwytsrOtVlu_E"

printershops["A"] = {id:"A",	URI:SERVER + "4001", getlocationResource:"/location", local:undefined};
printershops["B"] = {id:"B",	URI:SERVER + "4002", getlocationResource:"/address", local:undefined};
printershops["C"] = {id:"C",	URI:SERVER + "4003", getlocationResource:"/location", local:undefined};


for (a in printershops) {	
	GetLocationPrinterShop(a);
}

function GetLocationPrinterShop(PS) {
	var printershop = printershops[PS];
	request({
		uri : printershop.URI + printershop.getlocationResource, json : {}
			}, function(err, res, body){ 
				if (!err) {  
					printershop.local = body;
					i += 1;
				}
				else {
					console.log(err);
		 		}
		})
};


function GetOrders(req, res){
	res.json(orders);
};


function PostOrders(req, res){	
	const newOrderID = "o" + ((Math.random()*1000).toString().substr(1, 4) * 10);		
	orders[newOrderID] = buildOrder(newOrderID,req.body);
	setTimeout(function(){Biding(newOrderID)}, 1000);
	res.set('Location', SERVER_ROOT + "/order/" + newOrderID);
	res.sendStatus(201);

};


function buildOrder (newOrderID, body){
	const now = new Date();
	return { id: newOrderID, 
			 user: body.user, 
			 status: "Pending",
			 albums: body.albums,
			 deliveryAddress: body.deliveryAddress,		
			 weatherInfo: undefined,
			 pdfPath: undefined,
			 bids:[],
			 createdOn: now,
			 updatedOn: now,
			};	
};



function Biding(newOrderID) {
	if (i=3){
		for (p in printershops) {
			var origem = "";
			var destino = "";
			order = orders[newOrderID];
			if (printershops[p].local.street !== undefined) {
	 			origem = printershops[p].local.street + "+" + printershops[p].local.doorNumber + "+" + printershops[p].local.zipCode + "+" + printershops[p].local.city + "+" + printershops[p].local.country;							
			}
	 		else { 
	 			origem = printershops[p].local;
	 		}

	 		if (order.deliveryAddress !== undefined) {
	 			destino = order.deliveryAddress.street + "+" + order.deliveryAddress.doorNumber + "+" + order.deliveryAddress.zipCode + "+" + order.deliveryAddress.city + "+" + order.deliveryAddress.country;							
			}
	 		else { 
	 			destino = "Invalid";
	 		}
	 		 		
			URI = GmapsURI.replace("origem",origem).replace("destino",destino);
			request({
					uri : URI
					}, function(err, res, body){ 
					if (!err) {  
						var begin = body.indexOf("<distance>");
						var end = body.indexOf("</distance>");
						res = body.substr(begin,end-begin+11);
						var distance = 0;
						order = orders[newOrderID];

						var digester = xml_digester.XmlDigester({});
						digester.digest(res, function(err, result) {
								if (!err) {  
									distance = result.distance.text;
									distance = distance.replace("km","").replace(" ","");
									distance = validator.toFloat(distance);
									//Saquei a distancia de cada um dos PS até ao cliente, preciso de a inserir no bids, juntamente com o resto. Tenho que perceber isto
								}
								else {
									console.log(err);
								}
							});
  					
					}
					else {
						console.log(err);
			 		}			 	
			})		
		}
	}
	else {		
		console.log("esperei");
		setTimeout(function(){Biding(newOrderID)}, 1000);
	}
};



exports.GetOrders = GetOrders;
exports.PostOrders = PostOrders;

exports.TheOrders = orders;



const fs = require("fs");
const albumsHandler = require("./albums");


/************/
// data
/************/

//TODO pass these as parameters to the module
const port = process.env.PORT || 3001;
const SERVER_ROOT = "http://localhost:" + port;



var orders =  {};

function GetOrders(req, res){
	res.json(orders);
};


function PostOrders(req, res){
	console.log(req.body);
	const newOrderID = "o" + ((Math.random()*1000).toString().substr(1, 4) * 10);		
	orders[newOrderID] = buildOrder(newOrderID,req.body);
	res.set('Location', SERVER_ROOT + "/order/" + newOrderID);
	res.sendstatus(201);
};


function buildOrder (newOrderID, body){
	const now = new Date();
	return { id: newOrderID, 
			 user: body.user, 
			 status: "Pending",
			 albums: body.albums,
			 deliveryAdrress: body.deliveryAddress,
			 createdOn: now,
			 updatedOn: now			 
			};	
};



exports.GetOrders = GetOrders;
exports.PostOrders = PostOrders;

exports.TheOrders = orders;
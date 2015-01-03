const jwt = require('jwt-simple');
const express = require('express');
const app = express();


app.set('jwtTokenSecret', 'myphotoalbumSecretSentence');


module.exports = function(token) {
  console.log(token);
  if (token) {
  	try {
  		var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
  		console.log(decode.iss);
      return true;
  	} 
  		catch (err) {
        return false;
  	}
  }
  else {
  	return false;
  }
};
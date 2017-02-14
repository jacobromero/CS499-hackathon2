'use strict';
var request = require('request');
var AWS = require('aws-sdk');

AWS.config.update({
  region: "us-west-2"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "shuttledb";
var shuttleTimes = "bettershuttletimes";

module.exports.updateTables = (event, context, callback) => {
  request('https://rqato4w151.execute-api.us-west-1.amazonaws.com/dev/info', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var resp = JSON.parse(body);

        for (var i = 0; i < resp.length; i++) {
          var item = resp[i];
          putItem(table, item.id, item.logo, item.lat, item.lng, item.route);
          putShuttleTimes(shuttleTimes, item.id, item.logo, item.lat, item.lng, item.route);
        }

        const response = {
          statusCode: 200,
          body: body
        };

        callback(null, response);
      }
    })
};

module.exports.getBusTimes = (event, context, callback) => {
  var params = {
      TableName: shuttleTimes,
  };

  console.log("Scanning table.");
  docClient.scan(params, function (err, data) {
    if (err) {
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: "Failed to get shuttle times."
      };

      callback(null, response);
    } else {
      console.log("done scanning");

      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(data.Items)
      };

      callback(null, response);
    }
  });
};

function putItem (id, logoUrl, lat, long, route, timestamp) {
  var params = {
    TableName:table,
    Item:{
      "busID": id,
      "timestamp": Date.now(),
      "logoUrl": logoUrl,
      "lat": lat,
      "long": long,
      "route": route
    }
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });       
}

function putItem (tableName, id, logoUrl, lat, long, route) {
  var params = {
    TableName:tableName,
    Item:{
      "busID": id,
      "logo": logoUrl,
      "lat": lat,
      "long": long,
      "route": route,
      "timestamp": Date.now()
    }
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });       
}

// put shuttle times into the current shuttle times table
function putShuttleTimes (tableName, id, logoUrl, lat, long, route) {
  var params = {
    TableName:tableName,
    Item:{
      "id": id,
      "logo": logoUrl,
      "lat": lat,
      "lng": long,
      "route": route
    }
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });       
}

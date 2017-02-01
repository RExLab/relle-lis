var mysql = require('mysql')

var config = require('../config.js')

var connection = mysql.createConnection(config.dbconfig)

connection.connect()

exports.query = function(sql){
    console.log(sql)
    connection.query(sql, function (err, result, fields) {
        if (err)
            console.log(err)
        return result

    })
}
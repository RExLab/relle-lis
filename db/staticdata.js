var mysql = require('mysql')

var config = require('../config.js')

var connection = mysql.createConnection(config.dbconfig)

connection.connect()

var Lab = require('../lab.js')
var Instance = require('../instance.js')


exports.All = function (cb) {

    connection.query('SELECT * from instances', function (err1, instances, fields) {
        if (err1)
            throw err

        connection.query('SELECT * from labs', function (err, labs, fields) {
            if (err)
                throw err
            for (index in labs) {
                labs[index] = new Lab(labs[index])

                var instancesLab = instances.filter(function (obj) { // todas instancias desse laboratório
                    return obj.lab_id == labs[index].id
                })

                for (instance of instancesLab) {
                    labs[index].setInstance(new Instance(instance))
                }

                console.log('Registering lab ' + labs[index].id + ' with ' + instancesLab.length + ' instances.')
            }

            cb(labs)
            
            function sync(lab){

                connection.query('SELECT * from instances where lab_id='+lab.id, function (err1, db_instances, fields) {
                    if (err)
                        throw err
                    if(typeof(db_instances) != 'undefined' && db_instances.length >0){
                        for(instance of lab.instances){

                            var db_instance = db_instances.filter(function (obj) { // todas instancias desse laboratório
                                    return obj.id == instance.id
                            })[0]

                            if(instance.hasModified(db_instance)){
                                lab.update(db_instance)
                            }

                        }
                    }

                }) 
                
            }
            
            setInterval(function () {              
                for(index in labs){
                    sync(labs[index])                    
                }
                 
            }, 5000)

        })

    })
}



var Instance = require('./instance.js')

function Lab(lab) {

    for (var prop in lab) {
        if (lab.hasOwnProperty(prop)) {
            this[prop] = lab[prop]
        }
    }

    this.instances = []
    this.queue = null

}

Lab.prototype.update = function (instance) {
    console.log('atualiza instancia')
    console.log(instance)
    
    var oinstance = this.instances.filter(function (obj) { 
        return obj.id == instance.id
    })[0]
    
    var that = this
    
    var DropUser = function(socket){
        if(typeof(that.queue.leave) == 'function'){
           that.queue.leave(socket,oinstance)
        }            
    }
    
    if(typeof(oinstance) == 'object'){
        oinstance.setMaintenance(instance.maintenance, DropUser)
        oinstance.setQueue(instance.queue,DropUser)
    }else {
        this.setInstance(new Instance(instance))
    }
    
}

Lab.prototype.setInstance = function (instance) {
    this.instances.push(instance)
}

module.exports = Lab



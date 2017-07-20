var Helpers = require('./Helpers.js');

function Queue(timeslice, lab) {
    this.queue_d = []
    this.timeslice = timeslice;
    this.first = this.wait = this.leave = this.extended = this.status = null
    this.lab = lab
}

Queue.prototype.isOnQueue = function (pass) {
    var hasSocket = 0;

    for (var i = 0; i < this.queue_d.length; i++) {
        if (this.queue_d[i].pass === pass) {
            hasSocket++;
        }
    }

    for (var i = 0; i < this.lab.instances.length; i++) {
        if (this.lab.instances[i].actual !== null) {
            if (this.lab.instances[i].actual.pass === pass) {
                hasSocket++;
            }
        }
    }

    return hasSocket > 0;
};

Queue.prototype.replaceOnQueue = function (socket) {
    var hasReplaced = false;

    for (var i = 0; i < this.queue_d.length; i++) {
        if (this.queue_d[i].pass === socket.pass) {
            this.queue_d[i] = socket;
            hasReplaced = true;
        }
    }

    for (var i = 0; i < this.lab.instances.length; i++) {
        if (this.lab.instances[i].actual !== null) {
            if (this.lab.instances[i].actual.pass === socket.pass) {
                this.lab.instances[i].actual = socket;
                hasReplaced = true;
            }
        }
    }

    return hasReplaced;

};

Queue.prototype.orderQueue = function(socket) {   
    if (this.queue_d.length > 0){
        for(var i = 0; i < this.queue_d.length;i++) {
            if (this.queue_d[i].priority == false){
                    this.queue_d.splice(i,0,socket);
                    break;
            }else if(i == this.queue_d.length-1){
                this.queue_d.push(socket);
                break;
            }
        }
    }
    else {
        this.queue_d.push(socket);
    }
}

Queue.prototype.push = function (socket) {
    socket.priority = false;
    
    this.queue_d.push(socket);
    this.handleArray(socket);
    

};

Queue.prototype.unshift = function (socket) {
    socket.priority = true;
    this.orderQueue(socket);
    this.handleArray(socket);

};


Queue.prototype.handleArray = function (socket) {
   
    var instance,position = 0;
    if ((instance = Helpers.InstanceAvailable(this.lab)) != null) {
        this.schedule(instance);
    } else {
        var n_instances = this.lab.instances.filter(function (obj) {
            return obj.maintenance == 0
        }).length;
        
        for(var i = 0; i < this.queue_d.length; i++){
            if(this.queue_d[i].id == socket.id){
                position = i+1;
            }                
        }
        
        this.wait(socket,                                
                position * this.timeslice - ((new Date() / 1000) - Helpers.TimeWaiting(this.lab)),
                position,
                n_instances)
    }
    
    if (typeof (this.status) == 'function') {
        for (var i = 0; i < this.queue_d.length; i++) {
            if (this.queue_d[i] != null){
                this.status(this.queue_d[i],
                        (i + 1) * this.timeslice - ((new Date() / 1000) - Helpers.TimeWaiting(this.lab)),
                        (i + 1))
            }
        }
    }
    
    
    
    console.log("push - queue length: " + this.queue_d.length);
    
    
    /*
    for (var i = 0; i < this.queue_d.length; i++) {
        console.log(this.queue_d[i].id)
    }
    */
};

Queue.prototype.remove = function (socket) {

    for (var i = 0; i < this.queue_d.length; i++) {
        if (this.queue_d[i].id == socket.id) {
            this.queue_d.splice(i, 1);
        }
    }

    for (lab of this.lab.instances){
        if (lab.actual != null) {
            if (lab.actual.id == socket.id) {
                console.log('removing user [socket ID ' + socket.id + '] from instance ' + lab.id + ' of lab ' + lab.lab_id);
                lab.actual = null
                lab.arrival_time = null
                if (lab.isAvailable())
                    this.schedule(lab)
            }
        }
    }
    if (typeof (this.status) == 'function') {
        for (var i = 0; i < this.queue_d.length; i++) {
            if (this.queue_d[i] != null){
                this.status(this.queue_d[i],
                        (i + 1) * this.timeslice - ((new Date() / 1000) - Helpers.TimeWaiting(this.lab)),
                        (i + 1))
            }
        }
    }

    console.log("remove - tamanho da fila: " + this.queue_d.length);
};

Queue.prototype.isAuthorized = function (lab_id, instance_id, socket_id) {
    var instance = this.lab.instances.filter(function (obj) {
        return obj.lab_id == lab_id && obj.id == instance_id
    })[0]

    if (typeof (instance) == 'object')
        return (instance.actual.id === socket_id)
    else
        return false
};

Queue.prototype.schedule = function (lab) {
    console.log('scheduling instance ' + lab.id + ' of lab ' + lab.lab_id);

    if (typeof (this.first) != 'function' ||
            typeof (this.wait) != 'function' ||
            typeof (this.leave) != 'function' )
    throw new Error('Cannot schedule users. Some functions are missing.');

    clearTimeout(lab.timeout_id)

    if (this.queue_d.length > 0) {
        if (lab.actual != null)
            this.leave(lab.actual, lab)

        lab.actual = this.queue_d.shift()
        this.first(lab.actual, lab)
        lab.arrival_time = new Date().getTime();
        console.log(lab.arrival_time)

    } else { // é possível que o usuario permaneça usando se não há ninguém na fila
        lab.timeout_id = null // quando próximo usuário chegar saberá que quem está usando pode ser eliminado 
        if (lab.actual != null){
            if(typeof (this.extended) == 'function'){ // se a função extended não for incluída, então o usuário será retirado da fila
                this.extended(lab.actual, lab)
            }else{
                this.leave(lab.actual, lab)
                lab.actual = null;
            }
        }
        return;
    }


    lab.timeout_id = setTimeout(this.schedule.bind(this, lab), this.timeslice * 1000)

    console.log('leaving schedule | queue len ' + this.queue_d.length + ' | timeout within ' + this.timeslice * 1000 + ' ms')

};

Queue.prototype.bindFunction = function (funcs) {
    this.first = funcs.first
    this.wait = funcs.wait
    this.leave = funcs.leave
    this.extended = funcs.extended
    this.status = funcs.status
};
module.exports = Queue;

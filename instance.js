var log = require('./log')
var db = require('./db/database.js')

function Instance(data) {
    for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
            this[prop] = data[prop]
        }
    }
    this.actual = null
    this.timeout_id = null
    this.arrival_time = null
}

Instance.prototype.isAvailable = function () {
    return !this.maintenance && this.queue && (this.actual == null || this.timeout_id == null)
}

Instance.prototype.setQueue = function (hasQueue, cb) {
    if (this.queue != hasQueue) {
        this.queue = hasQueue
        if (!hasQueue && this.actual != null) {
            clearTimeout(this.timeout_id)
            cb(this.actual)
        }
    }
}

Instance.prototype.setMaintenance = function (onMaintenance, cb_socket, cb_db) {
    if (this.maintenance != onMaintenance) {
        this.maintenance = onMaintenance
        if (onMaintenance && this.actual != null) {
            clearTimeout(this.timeout_id)
            if (typeof (cb_socket) == 'function')
                cb_socket(this.actual)
        }
        if (typeof (cb_db) == 'function')
            cb_db(onMaintenance)
    }
}


Instance.prototype.hasModified = function (instance) {
    if (typeof (instance) != 'object')
        return false

    return instance.maintenance != this.maintenance || instance.queue != this.queue
}

Instance.prototype.log = function (message) {
    log.add({date: new Date(), lab: this.address, message: message})
    //console.log(this.address, message)
    if (message == 'ECONNREFUSED' || message == 'responseTimeout') {
        log.alert(this.address)
        var address = this.address
        this.setMaintenance(true, null, function (onMaintenance) {
            console.log('updating db')
            if (onMaintenance) {
                db.query("UPDATE `instances` SET `maintenance`=1  WHERE address='" + address+"'")
            } else {
                db.query("UPDATE `instances` SET `maintenance`=0  WHERE address=" + address+"'")

            }

        })
        
        
    }
}

module.exports = Instance

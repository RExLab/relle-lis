var Email = require('./mailer')
var fs = require('fs')
var logList = []

exports.add = function (log) {
    logList.push(log)
}

exports.clean = function () {
    logList = []
}

exports.report = function (filename) {
    var dir = __dirname + '/report/' 
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
    
    fs.writeFileSync(dir + filename, JSON.stringify(logList), 'utf-8', function (err) {
        if (err)
            throw err
        console.log('It\'s saved!')
    })
}



exports.sendReport = function () {
    console.log(logList)
    this.clean()
}

exports.alert = function (lab_address) {
    var data = logList.filter(function (obj) {
        return obj.lab == lab_address
    })
    
    console.log(lab_address + " EMAIL ALERTA")
    
    Email('Notificação - lab offline',
            'Foi detectado algum problema com o seguinte laboratório: '
            + lab_address +
            '\nÚltimos logs em anexo. \n',
            {
                filename: 'log.json',
                content: JSON.stringify(data)
            })
}
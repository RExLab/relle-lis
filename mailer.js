var nodemailer = require('nodemailer')
var config = require('./config.js')

var transporter = nodemailer.createTransport(config.mailTransport)

var mailOptions = config.mailOptions

module.exports = function(subject, message, attachment) {

	mailOptions.subject = subject
	mailOptions.text = message
        if(typeof(attachment) == 'object'){
            mailOptions.attachments = [attachment]
        }
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
		return console.log(error)
	    }
	    console.log('Message sent: ' + info.response)
	})

}

// This module is meant to wrap the sending of e-mail 
// through the AWS SES service.
// 
// To include the module:
//      var sesMailer = require("./SesMailer");

function SesMailer(nodemailer) { 
    if(nodemailer === null) {
        throw new Error("nodemailer must not be null.");
    }

    this.nodeMailer = nodemailer;
};
SesMailer.prototype = {
    SendMail: function(accessKey, secretKey, mail, callback) {
        if(accessKey === null) {
            throw new Error("accessKey must not be null");
        }
        if(secretKey === null) {
            throw new Error("secretKey must not be null.");
        }
        if(mail === null) {
            throw new Error("mail must not be null.");
        }
        
        var transport = this.nodeMailer.createTransport("SES", {
            AWSAccessKeyID: accessKey,
            AWSSecretKey: secretKey 
        });

        transport.sendMail(mail, function(error, result) {
            callback(error, result);
            transport.close();
        });
    }
}

module.exports = SesMailer;

//  node sendmail.js --help
//
//  Call this script to send mail from the command line.

var nodemailer = require("nodemailer");
var minimist = require("minimist");
var sesMailer = require("./SesMailer");
var util = require("util");

var argv = minimist(process.argv.slice(2));

var usageHelp = function() {
    console.log("sendmail.js:");
    console.log("------------");
    console.log("   --ak <aws access key>");
    console.log("   --sk <aws secret key>");
    console.log("   --to <to address> (You can define 'to' multiple times.)");
    console.log("   --cc <cc address> (You can define 'cc' multiple times.)");
    console.log("   --bcc <bcc address> (You can define 'bcc' multiple times.)");
    console.log("   --from <from address>");
    console.log("   --file <path to file to attach> (You can define 'file' multiple times.)");
    console.log("   --subject <the subject of your e-mail>");
    console.log("   --body <the body of your e-mail>");
    console.log("   --help");
};

if(argv.ak === undefined) {
    console.log("You must define your aws access key.");
    console.log("");
    usageHelp();
    process.exit(1);
}
if(argv.sk === undefined) {
    console.log("You must define your aws secret key.");
    console.log("");
    usageHelp();
    process.exit(1);
}
if(argv.to === undefined || argv.length == 0) {
    console.log("You must define a destination for your e-mail.");
    console.log("");
    usageHelp();
    process.exit(1);
}
if(argv.from === undefined) {
    console.log("You must define a source for your e-mail.");
    console.log("");
    usageHelp();
    process.exit(1);
}
if(argv.subject === undefined) {
    console.log("You must define a subject for your e-mail.");
    console.log("");
    usageHelp();
    process.exit(1);
}
if(argv.body === undefined) {
    console.log("You must define a body for your e-mail.");
    console.log("");
    usageHelp();
    process.exit(1);
}
if(argv.help == true) {
    usageHelp();
    process.exit(0);
}

var mailOptions = {
    from: argv.from,
    to: argv.to,
    cc: argv.cc,
    bcc: argv.bcc,
    subject: argv.subject,
    text: argv.body
}

//Make sure we add all the file attachments
if(argv.file !== undefined) {
    // If the argv.file item is an array, then we have multiple 
    // files to attach.
    if(util.isArray(argv.file)) {
        mailOptions.attachments = new Array();
        for(var i = 0; i < argv.file.length; i++) {
            mailOptions.attachments[i] = { filePath: argv.file[i] };
        }
    }
    // Otherwise, it's a single file.
    else {
        mailOptions.attachments = new Array();
        mailOptions.attachments[0] = { filePath: argv.file };
    }

}

try {
    var mailer = new sesMailer(nodemailer);
    mailer.SendMail(argv.ak, argv.sk, mailOptions, function(error, response) {
        if(error) {
            console.error(error);
        }
        else {
            console.log("Message sent: " + response.message);
        }
    });
}
catch (e) {
    console.error(e);
}


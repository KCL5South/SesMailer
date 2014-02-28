var assert = require("assert");
var sinon = require("sinon");
var nodeMailer = require("nodemailer");
var SesMailer = require("../SesMailer.js");

//  This is a stub object for the transport object
//  used by nodemailer.
//
//  It's neede by our tests.
var transportStub = function() {
    this.sendMailCalled = 0;
    this.closeCalled = 0;
    this.lastMail = null;
    this.sentError = null;
    this.sentResult = null;
};
transportStub.prototype = {
    sendMail: function(mail, callback) {
        this.sendMailCalled++;
        this.lastMail = mail;
        this.lastCallback = callback;
        if(callback) { callback(this.sentError, this.sentResult); }
    },
    close: function() { this.closeCalled++; },
    getSendMailCalled: function() { return this.sendMailCalled; },
    getCloseCalled: function() { return this.closeCalled; },
    getLastMail: function() { return this.lastMail; },
    getLastCallback: function() { return this.lastCallback; },
    getSentError: function() { return this.sentError; },
    getSentResult: function() { return this.sentResult; },
    setSentError: function(value) { this.sentError = value; },
    setSentResult: function(value) { this.sentResult = value; },

    resetSendMailCalled: function() { this.sendMailCalled = 0; },
    resetCloseCalled: function() { this.closeCalled = 0; }
}

describe('SesMailer', function(){

    describe('#SendMail()', function(){
        var actualAccessKey = null;
        var actualSecretKey = null;
        var transport = new transportStub();
        var createTransportStub = sinon.stub(nodeMailer, "createTransport", function(type, options) {
            actualAccessKey = options.AWSAccessKeyID;
            actualSecretKey = options.AWSSecretKey;
            return transport; 
        });
        var mailer = new SesMailer(nodeMailer);

        beforeEach(function() {
            transport.resetSendMailCalled();
            transport.resetCloseCalled();
        });

        it('An exception should have been thrown if accessKey is null', function(){
            assert.throws(function() { mailer.SendMail(null, "test secret key", { }); }, 'accessKey');
        });
        
        it('An exception should have been thrown if secretKey is null', function() {
            assert.throws(function() { mailer.SendMail("test Access Key", null, { }); }, 'secretKey'); 
        });

        it('An exception should have been thrown if mail is null', function() {
            assert.throws(function() { mailer.SendMail("test access Key", "test secret key", null); }, 'mail');
        });

        it('The accessKey should be passed to the transport', function() {
            mailer.SendMail("TestAccessKey", "TestSecretKey", { }, function(){ });
            assert.equal("TestAccessKey", actualAccessKey);            
        });

        it('The secretKey should be passed to the transport', function() {
            mailer.SendMail("TestAccessKey", "TestSecretKey", { }, function(){ });
            assert.equal("TestSecretKey", actualSecretKey);            
        });
       
        it('sendMail should have been called once', function() {
            mailer.SendMail("ak", "sk", { }, function(){ });
            assert.equal(1, transport.getSendMailCalled());
        });
        
        it('close should have been called once', function() {
            mailer.SendMail("ak", "sk", { }, function(){ });
            assert.equal(1, transport.getCloseCalled());
        });

        it('The mail object should be the same.', function() {
            var mail = { sender: "TestSender@void.com" };
            mailer.SendMail("ak", "sk", mail, function(){ });
            assert.deepEqual(mail, transport.getLastMail());
        });

        it('The callback should be called.', function() {
            var test = false;
            var callback = function() { test = true; };
            mailer.SendMail("ak", "sk", { }, callback);
            assert.equal(true, test);
        });

        it('The callback should receive the correct error', function() {
            var expectedError = "Some Error";
            var actualError = null;
            var callback = function(error) { actualError = error; } 
            transport.setSentError(expectedError);
            mailer.SendMail("ak", "sk", { }, callback);
            assert.equal(expectedError, actualError);
        });

        it('The callback should receive the correct result', function() {
            var expectedResult = "Some Result";
            var actualResult = null;
            var callback = function(error, result) { actualResult = result; } 
            transport.setSentResult(expectedResult);
            mailer.SendMail("ak", "sk", { }, callback);
            assert.equal(expectedResult, actualResult);
        });
    })
});

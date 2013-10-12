/*
 * imap-fetcher
 * https://github.com/parroit/imap-fetcher
 *
 * Copyright (c) 2013 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';

var Status={
    connected:1,
    disconnected:0
};

exports.Status = Status;



function Fetcher(config){

    if (Object.prototype.toString.call(config) !== "[object Object]" ) {
        throw new Error("Please provide an object options argument");
    }

    var Imap = require('imap');
    var fs = require('fs');
    var self = this;
    self.imap = new Imap(config);

    self.status = Status.disconnected;


    self.imap.once('error', function(err) {
        console.log(err);
    });




}

Fetcher.prototype.connect = function(onConnected){
    var self = this;
    self.imap.once('ready', function(){
        self.status = Status.connected;
        onConnected && onConnected();
    });
    self.imap.connect();
};


Fetcher.prototype.disconnect = function(onDisconnected){
    var self = this;
    self.imap.once('end', function(){
        self.status = Status.disconnected;
        onDisconnected && onDisconnected();
    });
    self.imap.end();
};

exports.Fetcher=Fetcher;





Fetcher.prototype.fetch = function (folderName,query){
    var self = this;
    self.imap.openBox(folderName, true, function(err, box){
        fetch (self.imap,query,err,box);
    });
};


function fetch(imap,query,err, box) {
    var bus = require("corriera");

    if (err) {
        throw err;
    }

    var f = imap.seq.fetch(query, {
        bodies: ''
    });

    f.once('error', function(err) {
        console.log('Fetch error: ' + err);
    });

    f.on('message', function(msg, seqno) {
        msg.on('body', function(stream, info) {
            bus.emit('messageFetched',"any",stream,info)
        });
    });
}
/*        msg.once('attributes', function(attrs) {

 });
 msg.once('end', function() {

 });



 f.once('end', function() {
 console.log('Done fetching all messages!');

 });*/

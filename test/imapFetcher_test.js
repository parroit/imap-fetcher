/*
 * imapFetcher
 * https://github.com/parroit/imapFetcher
 *
 * Copyright (c) 2013 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';

var imap = require('../lib/imapFetcher');

var Fetcher = imap.Fetcher;

var expect = require('chai').expect;
require('chai').should();


describe('imapFetcher',function(){
    describe("module",function() {
        it("should load",function(){
            expect(imap).not.to.be.equal(null);
            expect(imap).to.be.a('object');

        })
    });

    describe("Fetcher",function() {
        var transport = new Fetcher({
            user: process.env.MY_MAIL_ADDRESS,
            password: process.env.MY_MAIL_PASSWORD,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
        });

        it("should be instantiable with config",function(){
            expect(transport).not.to.be.null;
        });
        describe("status",function(){


            it("should be disconnected at start",function(){
                expect(transport.status).to.be.equal(imap.Status.disconnected);

            });

            it("go to connected upon connection",function(done){
                this.timeout(5000);
                transport.connect(function(){
                    expect(transport.status).to.be.equal(imap.Status.connected);
                    transport.disconnect(function(){
                        done();
                    });

                });


            });

            it("go to disconnected upon disconnection",function(done){
                this.timeout(25000);
                transport.connect(function(){

                    transport.disconnect(function(){
                        expect(transport.status).to.be.equal(imap.Status.disconnected);
                        done();
                    });
                });


            });

        });
        describe("fetch",function(){


            it("broadcast events on message received",function(done){
                this.timeout(25000);
                var bus = require("corriera");
                bus.once('messageFetched',/.*/,function(messageStream,messageInfo){
                    expect(messageStream).to.be.not.null;
                    transport.disconnect(function(){
                        done();
                    });

                });
                transport.connect(function(){
                    transport.fetch("INBOX",'1:1');
                });


            });

            it("broadcasted message stream contains full message body",function(done){
                this.timeout(25000);
                var bus = require("corriera");
                bus.once('messageFetched',/.*/,function(messageStream,messageInfo){
                    var buffer = '';
                    messageStream.on('data', function(chunk) {
                        buffer += chunk.toString('utf8');
                    });
                    messageStream.once('end', function() {
                        var fs = require("fs");
                        var expected = fs.readFileSync("./test/expected.msg","utf8");
                        expect(buffer.replace(/[\r\n]/g,"")).to.be.equal(expected.replace(/[\r\n]/g,""));
                        transport.disconnect(function(){
                            done();
                        });
                    });


                });
                transport.connect(function(){
                    transport.fetch("INBOX/test",'1:1');
                });


            });
        });
    });
});
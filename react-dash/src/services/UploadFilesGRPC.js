/*
 *
 * Copyright 2022 Yifan Wang <yw2399@cornell.edu>
 */

var PROTO_PATH = "../proto/dash_backend.proto";

var parseArgs = require('minimist');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
var dbe_proto = grpc.loadPackageDefinition(packageDefinition).dash_backend;

function main() {
    var argv = parseArgs(process.argv.slice(2), {
        string: 'target'
    });
    var target;
    if (argv.target) {
        target = argv.target;
    } else {
        target = 'localhost:50051';
    }
    var client = new dbe_proto.Dash(target, grpc.credentials.createInsecure());

    /*
     * The following commented block might work in browser, but won't work in Nods.js.
    var buffer;
    var fileReader = new FileReader();
    fileReader.onload = function(event) {
            buffer = event.target.result;
    };
    fileReader.readAsArrayBuffer("./example.jpg");
    */

    //I use fs here since I run the program in Node.js.
    const fs = require('fs');
    var buffer = fs.readFileSync("example.jpg")

    client.Dash_Put({key: "example.jpg", value: buffer}, function(err, response) {
        console.log("Put success: ", response.reply_message);
        client.Dash_Get({key: "example.jpg"}, function(err, response) {
            console.log("Get done.");
            fs.writeFileSync("reply.jpg", response.value);
        });
    });

}

main();

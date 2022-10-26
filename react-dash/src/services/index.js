const {EchoRequest, EchoResponse} = require('./dash_backend_pb.js');
const {DashClient} = require('./dash_backend_grpc_web_pb.js');

var client = new DashClient('http://localhost:8080');

var buffer = fs.readFileSync("example.jpg")

client.Dash_Put({key: "example.jpg", value: buffer}, function(err, response) {
    console.log("Put success: ", response.reply_message);
    client.Dash_Get({key: "example.jpg"}, function(err, response) {
        console.log("Get done.");
        fs.writeFileSync("reply.jpg", response.value);
    });
});

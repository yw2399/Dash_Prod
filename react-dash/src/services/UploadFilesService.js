import http from "../http-common";


const {Key, File} = require('./dash_backend_pb.js');
const {DashClient} = require('./dash_backend_grpc_web_pb.js');



class UploadFilesService {
    upload(file) {
    let formData = new FormData();

    formData.append("file", file);

    return http.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  uploadGRPC(file) {
    var client = new DashClient('http://localhost:8080');
    console.log(client);
    console.log(file);
    var request = new File();
    request.setKey('example.jpg');
    file.arrayBuffer().then(buff => {
      let byteArray = new Uint8Array(buff);
      console.log(byteArray);
      request.setValue(byteArray);
      client.dash_Put(request, {}, (err, response) => {
          console.log("Put success: ");
          var request = new Key();  
          request.setKey('example.jpg'); 
          client.dash_Get(request, {}, (err, response) => {
              console.log("Get done.", response.getValue());
          });
      });
    });
  }

  getFiles() {
    return http.get("/files");
  }
}

export default new UploadFilesService();

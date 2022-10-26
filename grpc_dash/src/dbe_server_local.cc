/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include <iostream>
#include <memory>
#include <string>
#include "dash_backend.pb.h"

#include <grpcpp/ext/proto_server_reflection_plugin.h>
#include <grpcpp/grpcpp.h>
#include <grpcpp/health_check_service_interface.h>

#ifdef BAZEL_BUILD
#include ""
#else
#include "dash_backend.grpc.pb.h"
#endif

#include <fstream>
#include <sstream>
#include <iostream> 

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::Status;
using dash_backend::Dash;
using dash_backend::Key;
using dash_backend::Value;
using dash_backend::File;
using dash_backend::PutReply;

// Logic and data behind the server's behavior.
class DashServiceImpl final : public Dash::Service {

    Status Dash_Get(ServerContext* context, const Key* request,
            Value* response) override {
        std::cout << "Inside Dash_Get.\n" << std::endl;
        std::string buffer = read_local(request->key());
        response->set_value(buffer.c_str(), buffer.size());
        return Status::OK;
    }

    Status Dash_Put(ServerContext* context, const File* request,
            PutReply* response) override {
        std::string key = request->key();
        std::string value = request->value();
        std::cout << "Value length is " << value.length() << std::endl;

        put_local(request->key(), request->value());

        std::cout << "Finish writing to local file system." << std::endl;
        response->set_reply_message("DONE");
        return ::grpc::Status(::grpc::StatusCode::OK, "DONE");
    }

    public:

    void put_local(std::string key, std::string value){
        std::string path = "server_" + key;
        std::cout << "About to write the file LOCALLY to ./" << path << std::endl;
        std::ofstream myfile;
        myfile.open(path);
        myfile << value;
        myfile.close();
    }

    //std::unique_ptr<char []> read_local(std::string key){
    std::string read_local(std::string key){
        std::string path = "server_" + key;
        std::cout << "About to open the binary file LOCALLY ./" << path << std::endl;
        std::ifstream ifs (path, std::ifstream::binary);
        if (!ifs){
            std::cout << "failed to open file " << key << std::endl;
            return NULL;
        }
        std::filebuf* pbuf = ifs.rdbuf();
        std::size_t size = pbuf->pubseekoff (0,ifs.end,ifs.in);
        std::cout << "file size is " << size << std::endl;
        pbuf->pubseekpos (0, ifs.in);
        //char* buffer=new char[size];
        //pbuf->sgetn(buffer, size);
        std::unique_ptr<char[]> buffer(new char[size]);
        pbuf->sgetn(buffer.get(),size);
        ifs.close();
        return std::string(buffer.get(), size);
    }

};

void RunServer() {
    std::string server_address("0.0.0.0:50051");
    DashServiceImpl service;

    //grpc::EnableDefaultHealthCheckService(true);
    //grpc::reflection::InitProtoReflectionServerBuilderPlugin();
    ServerBuilder builder;
    // Listen on the given address without any authentication mechanism.
    builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
    // Register "service" as the instance through which we'll communicate with
    // clients. In this case it corresponds to an *synchronous* service.
    builder.RegisterService(&service);
    // Finally assemble the server.
    std::unique_ptr<Server> server(builder.BuildAndStart());
    std::cout << "Server listening on " << server_address << std::endl;

    // Wait for the server to shutdown. Note that some other thread must be
    // responsible for shutting down the server for this call to ever return.
    server->Wait();
}

int main(int argc, char** argv) {
    RunServer();

    return 0;
}

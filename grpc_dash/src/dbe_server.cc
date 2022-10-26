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
#include <cascade/object.hpp>
#include <cascade/service_client_api.hpp>
#include <cascade/utils.hpp> 

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
        //std::string buffer = read_local(request->key());
        //response->set_value(buffer.c_str(), buffer.size());

        std::string cascade_res = read_cascade(request->key());
        response->set_value(cascade_res.c_str(), cascade_res.size());

        return Status::OK;
    }

    Status Dash_Put(ServerContext* context, const File* request,
            PutReply* response) override {
        std::string key = request->key();
        std::string value = request->value();
        std::cout << "Value length is " << value.length() << std::endl;

        //put_local(request->key(), request->value());
        put_cascade(request->key(), request->value());

        std::cout << "Finish writing to cascade." << std::endl;
        response->set_reply_message("DONE");
        return ::grpc::Status(::grpc::StatusCode::OK, "DONE");
    }

    public:
    derecho::cascade::ServiceClientAPI *capi;

    DashServiceImpl(){
        this->capi = new derecho::cascade::ServiceClientAPI();
        std::cout << "Cascade client constructed." << std::endl;
    }

    ~DashServiceImpl(){
        delete this->capi; 
        std::cout << "Cascade client destructed.." << std::endl;
    }

    void put_local(std::string key, std::string value){
        std::string path = "server_" + key;
        std::cout << "About to write the file LOCALLY to ./" << path << std::endl;
        std::ofstream myfile;
        myfile.open(path);
        myfile << value;
        myfile.close();
    }

    void put_cascade(std::string key, std::string value) {
        std::string path = "/grpc/" + key;
        derecho::cascade::ObjectWithStringKey obj;
        obj.key = path;
        obj.previous_version = persistent::INVALID_VERSION;
        obj.previous_version_by_key = persistent::INVALID_VERSION; 
        obj.blob =  derecho::cascade::Blob(reinterpret_cast<const uint8_t*>(value.c_str()), value.length());
        std::cout << "About to put to Cascade object pool with key: " << obj.key << std::endl;
        auto result = this->capi->put(obj);
        for (auto& reply_future:result.get()) {
            std::cout << "Trying to get from "
            auto reply = reply_future.second.get();
            std::cout << "node(" << reply_future.first << ") replied with version:" << std::get<0>(reply)
                      << ",ts_us:" << std::get<1>(reply)
                      << std::endl;
        }
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

    std::string read_cascade(std::string key){
        std::string obj_path = "/grpc/" + key;
        auto result = this->capi->get(obj_path);
        for (auto& reply_future : result.get()){
            derecho::cascade::ObjectWithStringKey reply = reply_future.second.get();
            const char *data = reinterpret_cast<const char*>(reply.blob.bytes);
            std::size_t size = reply.blob.size;
            std::cout << "Get size is " << size << std::endl;
            return std::string(reinterpret_cast<const char*>(reply.blob.bytes), reply.blob.size);
            //response->set_value(reply.blob.bytes, reply.blob.size);
            //break;
        }
        return std::string();
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

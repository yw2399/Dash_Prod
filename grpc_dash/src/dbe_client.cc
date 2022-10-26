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
#include <fstream>
#include <sstream>

#include <grpcpp/grpcpp.h>

#ifdef BAZEL_BUILD
#include ""
#else
#include "dash_backend.grpc.pb.h"
#endif

using grpc::Channel;
using grpc::ClientContext;
using grpc::Status;
using dash_backend::Dash;
using dash_backend::Key;
using dash_backend::Value;
using dash_backend::File;
using dash_backend::PutReply;



class DashClient {
    public:
        DashClient(std::shared_ptr<Channel> channel)
            : stub_(Dash::NewStub(channel)) {}

        // Assembles the client's payload, sends it and presents the response back
        // from the server.
        std::string test_put() {
            // Data we are sending to the server.
            std::cout << "Inside test_put" << std::endl;
            File request;
            std::cout << "Constructed request." << std::endl;
            std::string key = "example.jpg";
            request.set_key(key.c_str());
            std::cout << "About to open the binary file." << std::endl;

            std::ifstream ifs (key, std::ifstream::binary);
            if (!ifs){
                std::cout << "failed to open file." << std::endl;
            }
            std::filebuf* pbuf = ifs.rdbuf();
            std::size_t size = pbuf->pubseekoff (0,ifs.end,ifs.in);
            std::cout << "file size is " << size << std::endl;

            pbuf->pubseekpos (0, ifs.in);
            char* buffer=new char[size];
            pbuf->sgetn (buffer,size);
            std::string content(buffer, size);
            ifs.close();
            request.set_value(buffer, size);
            delete[] buffer;


            // Container for the data we expect from the server.
            PutReply reply;

            // Context for the client. It could be used to convey extra information to
            // the server and/or tweak certain RPC behaviors.
            ClientContext context;

            // The actual RPC.
            std::cout << "calling dash_put." << std::endl;
            Status status = stub_->Dash_Put(&context, request, &reply);

            std::cout << "complete calling dash_put." << std::endl;
            // Act upon its status.
            if (status.ok()) {
                return "Put success.";
            } else {
                std::cout << status.error_code() << ": " << status.error_message()
                    << std::endl;
                return "RPC failed";
            }
        }

        std::string test_get() {
            // Follows the same pattern as SayHello.
            Key request;
            std::string key = "example.jpg";
            request.set_key(key.c_str());
            Value reply;
            ClientContext context;

            // Here we can use the stub's newly available method we just added.
            Status status = stub_->Dash_Get(&context, request, &reply);
            if (status.ok()) {
                std::string rep = reply.value();
                std::string path = "./reply.jpg";
                std::cout << "The reply length is " << rep.length() << std::endl;
                std::ofstream myfile;
                myfile.open(path);
                myfile << rep;
                myfile.close();
                return "Get success.";
            } else {
                std::cout << status.error_code() << ": " << status.error_message()
                    << std::endl;
                return "RPC failed";
            }
        }

    private:
        std::unique_ptr<Dash::Stub> stub_;
};

int main(int argc, char** argv) {
    // Instantiate the client. It requires a channel, out of which the actual RPCs
    // are created. This channel models a connection to an endpoint specified by
    // the argument "--target=" which is the only expected argument.
    // We indicate that the channel isn't authenticated (use of
    // InsecureChannelCredentials()).
    std::string target_str;
    std::string arg_str("--target");
    if (argc > 1) {
        std::string arg_val = argv[1];
        size_t start_pos = arg_val.find(arg_str);
        if (start_pos != std::string::npos) {
            start_pos += arg_str.size();
            if (arg_val[start_pos] == '=') {
                target_str = arg_val.substr(start_pos + 1);
            } else {
                std::cout << "The only correct argument syntax is --target="
                    << std::endl;
                return 0;
            }
        } else {
            std::cout << "The only acceptable argument is --target=" << std::endl;
            return 0;
        }
    } else {
        target_str = "localhost:50051";
    }
    std::cout << "Start client." << std::endl;
    DashClient greeter(
            grpc::CreateChannel(target_str, grpc::InsecureChannelCredentials()));
    std::cout << "Start to test put." << std::endl;
    std::string reply = greeter.test_put();
    std::cout << "Greeter received: " << reply << std::endl;
    reply = greeter.test_get();
    std::cout << "Greeter received: " << reply << std::endl;

    return 0;
}

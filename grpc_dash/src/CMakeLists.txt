# Copyright 2022 Yifan Wang <yw2399@cornell.edu>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# cmake build file for C++ dash_backend example.
# Assumes protobuf and gRPC have been installed using cmake.
# See cmake_externalproject/CMakeLists.txt for all-in-one cmake build
# that automatically builds all the dependencies before building dash_backend.

cmake_minimum_required(VERSION 3.5.1)
set(CMAKE_CXX_STANDARD 17) 

project(DashBackend)

# Instead of using common.cmake, I specify all the dependencies here.
#include(../cmake/common.cmake)
# Protobuf
set(protobuf_MODULE_COMPATIBLE TRUE)
find_package(protobuf CONFIG REQUIRED)
message(STATUS "Using protobuf ${protobuf_VERSION}")


# Protobuf-compiler
set(_PROTOBUF_PROTOC $<TARGET_FILE:protobuf::protoc>)

# gRPC
find_package(gRPC CONFIG REQUIRED)
message(STATUS "Using gRPC ${gRPC_VERSION}")
set(_GRPC_GRPCPP gRPC::grpc++)
set(_GRPC_CPP_PLUGIN_EXECUTABLE $<TARGET_FILE:gRPC::grpc_cpp_plugin>)

# Proto file
get_filename_component(dbe_proto "../proto/dash_backend.proto" ABSOLUTE)
get_filename_component(dbe_proto_path "${dbe_proto}" PATH)

# Generated sources
set(dbe_proto_srcs "${CMAKE_CURRENT_BINARY_DIR}/dash_backend.pb.cc")
set(dbe_proto_hdrs "${CMAKE_CURRENT_BINARY_DIR}/dash_backend.pb.h")
set(dbe_grpc_srcs "${CMAKE_CURRENT_BINARY_DIR}/dash_backend.grpc.pb.cc")
set(dbe_grpc_hdrs "${CMAKE_CURRENT_BINARY_DIR}/dash_backend.grpc.pb.h")
add_custom_command(
      OUTPUT "${dbe_proto_srcs}" "${dbe_proto_hdrs}" "${dbe_grpc_srcs}" "${dbe_grpc_hdrs}"
      COMMAND ${_PROTOBUF_PROTOC}
      ARGS --grpc_out "${CMAKE_CURRENT_BINARY_DIR}"
        --cpp_out "${CMAKE_CURRENT_BINARY_DIR}"
        -I "${dbe_proto_path}"
        --plugin=protoc-gen-grpc="${_GRPC_CPP_PLUGIN_EXECUTABLE}"
        "${dbe_proto}"
      DEPENDS "${dbe_proto}")

# Include generated *.pb.h files.
include_directories("${CMAKE_CURRENT_BINARY_DIR}")

# dbe_grpc_proto
add_library(dbe_grpc_proto
  ${dbe_grpc_srcs}
  ${dbe_grpc_hdrs}
  ${dbe_proto_srcs}
  ${dbe_proto_hdrs})
target_link_libraries(dbe_grpc_proto
  ${_REFLECTION}
  ${_GRPC_GRPCPP}
  ${_PROTOBUF_LIBPROTOBUF})

# Build dbe_client.
add_executable(dbe_client dbe_client.cc)
target_link_libraries(dbe_client
dbe_grpc_proto
${_REFLECTION}
${_GRPC_GRPCPP}
${_PROTOBUF_LIBPROTOBUF})

# Build dbe_client using local file system.
add_executable(dbe_server_local dbe_server_local.cc)
target_link_libraries(dbe_server_local
dbe_grpc_proto
${_REFLECTION}
${_GRPC_GRPCPP}
${_PROTOBUF_LIBPROTOBUF})

# Dependencies for Derecho and Cascade.
find_package(nlohmann_json 3.2.0 REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(spdlog 1.3.1 REQUIRED)
find_package(derecho CONFIG REQUIRED)
find_package(cascade CONFIG REQUIRED)
# Build dbe_server.
add_executable(dbe_server dbe_server.cc)
target_include_directories(dbe_server PRIVATE
    $<BUILD_INTERFACE:/root/workspace/cascade/build-Release/include>
    $<BUILD_INTERFACE:/root/workspace/cascade/include>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
    $<BUILD_INTERFACE:${CMAKE_BINARY_DIR}>
)
target_link_libraries(dbe_server
derecho::cascade
dbe_grpc_proto
${_REFLECTION}
${_GRPC_GRPCPP}
${_PROTOBUF_LIBPROTOBUF})

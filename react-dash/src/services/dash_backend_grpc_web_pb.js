/**
 * @fileoverview gRPC-Web generated client stub for dash_backend
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.dash_backend = require('./dash_backend_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.dash_backend.DashClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.dash_backend.DashPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.dash_backend.Key,
 *   !proto.dash_backend.Value>}
 */
const methodDescriptor_Dash_Dash_Get = new grpc.web.MethodDescriptor(
  '/dash_backend.Dash/Dash_Get',
  grpc.web.MethodType.UNARY,
  proto.dash_backend.Key,
  proto.dash_backend.Value,
  /**
   * @param {!proto.dash_backend.Key} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.dash_backend.Value.deserializeBinary
);


/**
 * @param {!proto.dash_backend.Key} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.dash_backend.Value)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.dash_backend.Value>|undefined}
 *     The XHR Node Readable Stream
 */
proto.dash_backend.DashClient.prototype.dash_Get =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/dash_backend.Dash/Dash_Get',
      request,
      metadata || {},
      methodDescriptor_Dash_Dash_Get,
      callback);
};


/**
 * @param {!proto.dash_backend.Key} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.dash_backend.Value>}
 *     Promise that resolves to the response
 */
proto.dash_backend.DashPromiseClient.prototype.dash_Get =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/dash_backend.Dash/Dash_Get',
      request,
      metadata || {},
      methodDescriptor_Dash_Dash_Get);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.dash_backend.File,
 *   !proto.dash_backend.PutReply>}
 */
const methodDescriptor_Dash_Dash_Put = new grpc.web.MethodDescriptor(
  '/dash_backend.Dash/Dash_Put',
  grpc.web.MethodType.UNARY,
  proto.dash_backend.File,
  proto.dash_backend.PutReply,
  /**
   * @param {!proto.dash_backend.File} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.dash_backend.PutReply.deserializeBinary
);


/**
 * @param {!proto.dash_backend.File} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.dash_backend.PutReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.dash_backend.PutReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.dash_backend.DashClient.prototype.dash_Put =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/dash_backend.Dash/Dash_Put',
      request,
      metadata || {},
      methodDescriptor_Dash_Dash_Put,
      callback);
};


/**
 * @param {!proto.dash_backend.File} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.dash_backend.PutReply>}
 *     Promise that resolves to the response
 */
proto.dash_backend.DashPromiseClient.prototype.dash_Put =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/dash_backend.Dash/Dash_Put',
      request,
      metadata || {},
      methodDescriptor_Dash_Dash_Put);
};


module.exports = proto.dash_backend;


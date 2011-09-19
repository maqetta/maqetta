dojo.provide("dojox.io.xhrWindowNamePlugin");
dojo.require("dojox.io.xhrPlugins");
dojo.require("dojox.io.windowName");
dojo.require("dojox.io.httpParse");
dojo.require("dojox.secure.capability"); // would like to have a safe JSON verifier instead (more compact)

dojox.io.xhrWindowNamePlugin = function(/*String*/url, /*Function?*/httpAdapter, /*Boolean?*/trusted){
	// summary:
	//		Adds the windowName transport as an XHR plugin for the given site. See
	//		dojox.io.windowName for more information on the transport.
	//	url:
	//		Url prefix of the site which can handle windowName requests.
	// 	httpAdapter: This allows for adapting HTTP requests that could not otherwise be
	// 		sent with window.name, so you can use a convention for headers and PUT/DELETE methods.
	dojox.io.xhrPlugins.register(
		"windowName",
		function(method,args){
			 return args.sync !== true &&
				(method == "GET" || method == "POST" || httpAdapter) &&
				(args.url.substring(0,url.length) == url);
		},
		function(method,args,hasBody){
			var send = dojox.io.windowName.send;
			var load = args.load;
			args.load = undefined; //we don't want send to set this callback
			var dfd = (httpAdapter ? httpAdapter(send, true) : send)(method, args, hasBody); // use the windowName transport
			dfd.addCallback(function(result){
				var ioArgs = dfd.ioArgs;
				ioArgs.xhr = {
					getResponseHeader: function(name){
						// convert the hash to an object to act like response headers
						return dojo.queryToObject(ioArgs.hash.match(/[^#]*$/)[0])[name];
					}
				}
				// use the XHR content handlers for handling
				if(ioArgs.handleAs == 'json'){
					// use a secure json verifier, using object capability validator for now
					if(!trusted){
						dojox.secure.capability.validate(result,["Date"],{});
					}
					return dojo.fromJson(result);
				}
				return dojo._contentHandlers[ioArgs.handleAs || "text"]({responseText:result});
			});
			args.load = load;
			if(load){
 				dfd.addCallback(load);
 			}
			return dfd;
		}
	);
};
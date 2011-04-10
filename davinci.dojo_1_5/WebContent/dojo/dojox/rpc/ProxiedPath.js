dojo.provide("dojox.rpc.ProxiedPath");
dojo.require("dojox.rpc.Service");

dojox.rpc.envelopeRegistry.register(
	"PROXIED-PATH",function(str){return str == "PROXIED-PATH"},{
		serialize:function(smd, method, data){
			var i;
			var target = dojox.rpc.getTarget(smd, method);
			if(dojo.isArray(data)){
				for(i = 0; i < data.length;i++){
					target += '/' + (data[i] == null ? "" : data[i]);
				}
			}else{
				for(i in data){
					target += '/' + i + '/' + data[i];
				}
			}
			return {
				data:'',
				target: (method.proxyUrl || smd.proxyUrl) + "?url=" + encodeURIComponent(target)
			};
		},
		deserialize:function(results){
			return results;
		}
	}
);

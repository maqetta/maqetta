define(["../buildControl", "../stringify"], function(bc, stringify) {
	return function() {
		var
			modules= [],
			midToId= {},
			i= 0,
			resource, p;
		for (p in bc.resources) {
			resource= bc.resources[p];
			if (resource.deps && !resource.test && !/\/nls\//.test(resource.src) && resource.mid!="dojo/_base" && resource.mid!="dojo/_base/browser" && (resource.mid=="dojo/main" || /_base/.test(resource.mid))) {
				resource.uid= i;
				midToId[bc.resources[p].mid]= i;
				modules.push(resource);
				i++;
			}
		}
		var depsTree= modules.map(function(module) {
			return module.deps.map(function(item){ return item.uid; });
		});

		var
			idTree= {},
			getItem= function(parts, bag) {
				var part= parts.shift();
				if (!(part in bag)) {
					bag[part]= {};
				}
				if (parts.length) {
					return getItem(parts, bag[part]);
				} else {
					return bag[part];
				}
			};
		modules.forEach(function(item, i) {
			var parts= item.mid.split("/");
			getItem(parts, idTree)["*"]= i;
		});

		// depsTree and idTree now hold all the info need to pass to the client to do 100% client-side
		// deps tracing
	};
});

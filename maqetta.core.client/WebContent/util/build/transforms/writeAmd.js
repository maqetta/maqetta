define(["../buildControl", "../fileUtils", "../fs", "dojo/_base/lang"], function(bc, fileUtils, fs, lang) {
	var
		computingLayers
			// the set of layers being computed; use this to detect circular layer dependencies
			= {},

		computeLayerContents= function(
			layerModule,
			include,
			exclude
		) {
			// add property layerSet (a set of mid) to layerModule that...
			//
			//	 * includes dependency tree of layerModule
			//	 * includes all modules in layerInclude and their dependency trees
			//	 * excludes all modules in layerExclude and their dependency trees
			//	 * excludes layerModule itself
			//
			// note: layerSet is built exactly as given above, so included modules that are later excluded
			// are *not* in result layerSet
			if(layerModule && computingLayers[layerModule.mid]){
				bc.log("amdCircularDependency", ["module", layerModule.mid]);
				return {};
			}
			computingLayers[layerModule.mid]= 1;

			var
				includeSet= {},
				visited,
				includePhase,
				traverse= function(module) {
					var mid= module.mid;

					if (visited[mid]) {
						return;
					}
					visited[mid]= 1;
					if (includePhase) {
						includeSet[mid]= module;
					} else {
						delete includeSet[mid];
					}
					if(module!==layerModule && module.layer){
						var layerModuleSet= module.moduleSet || computeLayerContents(module, module.layer.include, module.layer.exclude);
						for(var p in layerModuleSet){
							if (includePhase) {
								includeSet[p]= layerModuleSet[p];
							} else {
								delete includeSet[p];
							}
						}
					}else{
						for (var deps= module.deps, i= 0; deps && i<deps.length; traverse(deps[i++])){
						}
					}
				};

			visited= {};
			includePhase= true;
			if (layerModule) {
				traverse(layerModule);
			}
			include.forEach(function(mid) {
				var module= bc.amdResources[bc.getSrcModuleInfo(mid, layerModule).mid];
				if (!module) {
					bc.log("amdMissingLayerIncludeModule", ["missing", mid, "layer", layerModule && layerModule.mid]);
				} else {
					traverse(module);
				}
			});

			visited= {};
			includePhase= false;
			exclude.forEach(function(mid) {
				var module= bc.amdResources[bc.getSrcModuleInfo(mid, layerModule).mid];
				if (!module) {
					bc.log("amdMissingLayerExcludeModule", ["missing", mid, "layer", layerModule && layerModule.mid]);
				} else {
					traverse(module);
				}
			});

			if(layerModule){
				layerModule.moduleSet= includeSet;
				delete computingLayers[layerModule.mid];
			}
			return includeSet;
		},

		insertAbsMid = function(
			text,
			resource
		){
			if(!resource.mid || resource.tag.hasAbsMid){
				return text;
			}
			return text.replace(/(define\s*\(\s*)(.*)/, "$1\"" + resource.mid + "\", $2");
		},

		getCacheEntry = function(
			pair
		){
			return "'" + pair[0] + "':" + pair[1];
		},

		getLayerText= function(
			resource,
			include,
			exclude
		) {
			var
				cache= [],
				pluginLayerText= "",
				moduleSet= computeLayerContents(resource, include, exclude);
			for (var p in moduleSet) if(!resource || p!=resource.mid){
				var module= moduleSet[p];
				if (module.internStrings) {
					cache.push(getCacheEntry(module.internStrings()));
				} else if(module.getText){
					cache.push("'" + p + "':function(){\n" + module.getText() + "\n}");
				} else {
					bc.log("amdMissingLayerModuleText", ["module", module.mid, "layer", resource.mid]);
				}
			}
			var text= "";
			if(resource){
				text= resource.getText();
				if(bc.insertAbsMids){
					text= insertAbsMid(text, resource);
				}
			}
			cache = cache.length ? "require({cache:{\n" + cache.join(",\n") + "}});\n" : "";
			return cache + pluginLayerText + "\n" + text;
		},

		getStrings= function(
			resource
		){
			var cache = [];
			resource.deps && resource.deps.forEach(function(dep){
				if(dep.internStrings){
					cache.push(getCacheEntry(dep.internStrings()));
				}
			});
			return cache.length ? "require({cache:{\n" + cache.join(",\n") + "}});\n" : "";
		},

		getDestFilename= function(resource){
			if(!resource.tag.syncNls && !resource.tag.nls && ((resource.layer && bc.layerOptimize) || (!resource.layer && bc.optimize))){
				return resource.dest + ".uncompressed.js";
			}else{
				return resource.dest;
			}
		},

		write= function(resource, callback) {
			fileUtils.ensureDirectoryByFilename(resource.dest);
			var text, copyright= "";
			if(resource.tag.syncNls){
				text= resource.getText();
			}else if(resource.layer){
				if(resource.layer.boot || resource.layer.discard){
					// recall resource.layer.boot layers are written by the writeDojo transform
					return 0;
				}
				text= resource.layerText= getLayerText(resource, resource.layer.include, resource.layer.exclude);
				copyright= resource.layer.copyright || "";
			}else{
				text = resource.getText();
				if(!resource.tag.nls && bc.insertAbsMids){
					text= insertAbsMid(text, resource);
				}
				text= (bc.internStrings ? getStrings(resource) : "") + text;
				resource.text= text;
				if(resource.pack){
					copyright= resource.pack.copyrightNonlayers && (resource.pack.copyright || bc.copyright);
				}else{
					copyright = bc.copyrightNonlayers &&  bc.copyright;
				}
				if(!copyright){
					copyright = "";
				}
			}
			fs.writeFile(getDestFilename(resource), copyright + "//>>built\n" + text, resource.encoding, function(err) {
				callback(resource, err);
			});
			return callback;
		};
		write.getLayerText= getLayerText;
		write.getDestFilename= getDestFilename;
		write.computeLayerContents= computeLayerContents;

		return write;
});


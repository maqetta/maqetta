define(["./buildControl", "./fileUtils", "./fs", "./stringify", "dojo/has", "./process"], function(bc, fileUtils, fs, stringify, has, process) {
	// find all files as given by files, dirs, trees, and packages
	var
		files=
			// a set of the directory names that have been inspected
			{},

		treesDirsFiles= ["trees", "dirs", "files"],

		srcDirs= {},

		destDirs= {},

		getFilepath= fileUtils.getFilepath,
		catPath= fileUtils.catPath,
		compactPath= fileUtils.compactPath,

		start= function(resource) {
			if (!resource.tag) {
				resource.tag= {};
			}
			bc.start(resource);
			srcDirs[getFilepath(resource.src)]= 1;
			destDirs[getFilepath(resource.dest)]= 1;
		},

		getFilterFunction= function(item, startAt) {
			// item is a vector of regexs or "!" starting at startAt
			// if "!", then satisfying the next regex says the filter is *not* passed

			if(typeof item=="function"){
				return item;
			}

			var result= item.slice(startAt || 0);
			if (!result.length) {
				// absent advice, assume the filename passes the filter
				return function(){ return 0; };
			}

			for(var notExpr, not= [], regExs= [], notsFound= 0, i= 0; i<result.length;){
				item= result[i++];
				if (item=="!") {
					notsFound = 1;
					notExpr= true;
					item= result[i++];
				} else {
					notExpr= false;
				}
				regExs.push(item);
				not.push(notExpr);
				notExpr= false;
			}

			var length= not.length;
			if (notsFound) {
				return function(filename) {
					var potential= 0;
					for (var i= 0; i<length; i++) {
						if (regExs[i].test(filename)) {
							if (not[i]) {
								return 0;
							} else {
								potential= 1;
							}
						}
					}
					return potential;
				};
			} else {
				return function(filename) {
					for (var i= 0; i<length; i++) {
						if (regExs[i].test(filename)) {
							return 1;
						}
					}
					return 0;
				};
			}
		},

		getResourceTagFunction= function(resourceTags) {
			//resource tags is a map from tag to vector of globs or regular expressions
			var tag= {};
			for (var p in resourceTags) {
				tag[p]= getFilterFunction(resourceTags[p]);
			}
			return function(resource) {
				for (var p in tag) {
					if (tag[p](resource.src, resource.mid, resource)) {
						resource.tag[p]= 1;
					}
				}
			};
		},

		readSingleDir= function(srcPath, destPath, excludes, advise, traverse) {
			if (files[srcPath]) {
				return;
			}
			files[srcPath]= 1;
			var
				srcPathLength= srcPath.length,
				subdirs= [];
			fs.readdirSync(srcPath).forEach(function(filename) {
				var fullFilename= srcPath + "/" + filename;
				if (!excludes || !excludes(fullFilename)) {
					var stats= fs.statSync(fullFilename);
					if (stats.isDirectory()) {
						subdirs.push(fullFilename);
					} else {
						if (advise) {
							advise(fullFilename);
						} else {
							start({src:fullFilename, dest: destPath + "/" + filename});
						}
					}
				}
			});
			if (traverse && subdirs.length) {
				subdirs.forEach(function(path) {
					readSingleDir(path, destPath + path.substring(srcPathLength), excludes, advise, 1);
				});
			}
		},

		readFile= function(item) {
			start({src:item[0], dest:item[1]});
		},

		readDir= function(item) {
			var excludes= getFilterFunction(item, 2);
			readSingleDir(item[0], item[1], excludes, 0, 0, 0);
		},

		readTree= function(item, advise) {
			var excludes= getFilterFunction(item, 2);
			readSingleDir(item[0], item[1], excludes, advise, 1);
		},

		discover= {
			files:readFile,
			dirs:readDir,
			trees:readTree
		},

		processPackage= function(pack, destPack) {
			// treeItem is the package location tree; it may give explicit exclude instructions
			var treeItem;
			for (var trees= pack.trees || [], i= 0; i<trees.length; i++) {
				if (trees[i][0]==pack.location) {
					treeItem= trees[i];
					break;
				}
			}
			if (!treeItem) {
				// create a tree item; don't traverse into hidden, backup, etc. files (e.g., .svn, .git, etc.)
				treeItem= [pack.location, destPack.location, /(\/\.)|(~$)/];
			}

			var filenames= [];
			readTree(treeItem, function(filename){ filenames.push(filename); });

			// next, sift filenames to find AMD modules
			var
				maybeAmdModules= {},
				notModules= {},
				locationPathLength= pack.location.length + 1,
				packName= pack.name,
				prefix= packName ? packName + "/" : "",
				mainModuleInfo= packName && bc.getSrcModuleInfo(packName),
				mainModuleFilename= packName && mainModuleInfo.url;
			filenames.forEach(function(filename) {
				// strip the package location path and the .js suffix (iff any) to get the mid
				var
					maybeModule= /\.js$/.test(filename),
					mid= prefix + filename.substring(locationPathLength, maybeModule ? filename.length-3 : filename.length),
					moduleInfo= maybeModule && bc.getSrcModuleInfo(mid);
				if (!maybeModule) {
					notModules[mid]= [filename, mid];
				} else if (filename==mainModuleFilename) {
					maybeAmdModules[packName]= mainModuleInfo;
				} else {
					maybeAmdModules[mid]= moduleInfo;
				}
			});

			// add modules as per explicit pack.modules vector; this is a way to add modules that map strangely
			// (for example "myPackage/foo" maps to the file "myPackage/bar"); recall, packageInfo.modules has two forms:
			//
			//	 modules: {
			//		 "foo":1,
			//		 "foo":"path/to/foo/filename.js"
			//	 }
			for (var mid in pack.modules) {
				var
					fullMid= prefix + mid,
					moduleInfo= bc.getSrcModuleInfo(fullMid);
				if (typeof pack.modules[mid]=="string") {
					moduleInfo.url= pack.modules[mid];
				}
				maybeAmdModules[fullMid]= moduleInfo;
				delete notModules[fullMid];
			};

			var
				tagResource= getResourceTagFunction(pack.resourceTags),
				startResource= function(resource) {
					resource.tag= {};
					tagResource(resource);
					start(resource);
				};

			// start all the package modules; each property holds a module info object
			for (var p in maybeAmdModules) {
				moduleInfo= maybeAmdModules[p];
				var resource= {
					src:moduleInfo.url,
					dest:bc.getDestModuleInfo(moduleInfo.mid).url,
					pid:moduleInfo.pid,
					mid:moduleInfo.mid,
					pack:pack,
					deps:[]
				};
				startResource(resource);
			}

			// start all the "notModules"
			var prefixLength= prefix.length;
			for (p in notModules) {
				resource= {
					src:notModules[p][0],
					// not really an AMD mid, but the filename with installation-dependent prefix stripped
					// this makes tagging easier
					mid:notModules[p][1],
					dest:catPath(destPack.location, p.substring(prefixLength))
				};
				startResource(resource);
			}

			// finish by processing all the trees, dirs, and files explicitly specified for the package
			for (i= 0; i<treesDirsFiles.length; i++) {
				var set= treesDirsFiles[i];
				if (pack[set]) {
					pack[set].forEach(function(item) {
						discover[set](item);
					});
				}
			}
		},

		discoverPackages= function() {
			// discover all the package modules; discover the default package last since it may overlap
			// into other packages and we want modules in those other packages to be discovered as members
			// of those other packages; not as a module in the default package
			for (var p in bc.packages) {
				processPackage(bc.packages[p], bc.destPackages[p]);
			}
		},

		clean= function(){
			var destDirList= [];
			for (var p in destDirs) {
				destDirList.push(p);
			}
			destDirList.sort();
			for (var current= destDirList[0], deleteList= [current], i= 1; i<destDirList.length; i++){
				if(destDirList[i].indexOf(current)!=0){
					current= destDirList[i];
					deleteList.push(current);
				};
			}
			bc.deleteList= deleteList;

			/*
			deleteList.forEach(function(dir){
				bc.waiting++; // matches *2*
				var
					 cb= function(code, text){
						 bc.passGate(); // matched with *2*
					 },
					 errorMessage= "failed to delete old tree (" + dir + ")",
					 args= has("is-windows") ?
						 ["cmd", "/c", "rd", "/S", "/Q", fileUtils.normalize(dir), errorMessage, bc, cb] :
						 ["rm", "-Rf", dir, errorMessage, bc, cb];
				process.exec.apply(args);
			});
			*/
		};

	return function() {
		///
		// build/discover

		bc.waiting++; // matches *1*

		// start the synthetic report resource
		start({
			tag:{report:1},
			src:"*report",
			dest:"*report",
			reports:[]
		});

		discoverPackages();

		// discover all trees, dirs, and files
		for (var i= 0; i<treesDirsFiles.length; i++) {
			var set= treesDirsFiles[i];
			bc[set].forEach(function(item) {
				discover[set](item);
			});
		}

		// advise all modules that are to be written as a layer
		// advise the loader of boot layers
		for (var mid in bc.layers) {
			var
				layer= bc.layers[mid],
				moduleInfo= bc.getSrcModuleInfo(mid),
				resource= bc.resources[moduleInfo.url];
			if (!resource) {
				// this is a synthetic layer (just a set of real modules aggregated but doesn't exist in the source)
				resource= {
					tag:{synthetic:1, amd:1},
					src:moduleInfo.url,
					dest:bc.getDestModuleInfo(moduleInfo.mid).url,
					pid:moduleInfo.pid,
					mid:moduleInfo.mid,
					pack:moduleInfo.pack,
					deps:[],
					text:"define([], 1);\n",
					getText:function(){
						return this.text;
					},
					encoding:"utf8"
				};
				start(resource);
			}
			resource.layer= layer;
			if (layer.boot) {
				if (bc.loader) {
					bc.loader.boots.push(resource);
				} else {
					bc.log("inputNoLoaderForBoot", ["boot layer", mid]);
				}
			}
		}

		if(bc.clean){
			clean();
		}

		bc.passGate(); // matches *1*
	};
});

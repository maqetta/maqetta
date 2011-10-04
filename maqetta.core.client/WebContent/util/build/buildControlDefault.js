define(["./buildControlBase"], function(bc) {
	var defaultBc= {
		files:[],
		dirs:[],
		trees:[],
		replacements:{},
		compactCssSet:{},

		staticHasFeatures:{
			// TODO
		},

		buildFlags:{
			stripConsole:"error",
			optimizeHas:1
		},

		discoveryProcs:["build/discover"],

		plugins:{
			"dojo/text":"build/plugins/text",
			"dojo/i18n":"build/plugins/i18n",
			"dojo/has":"build/plugins/has",
			"dojo/domReady":"build/plugins/domReady",
			"dojo/loadInit":"build/plugins/loadInit",
			"dojo/require":"build/plugins/require",
			"dojo/selector/_loader":"build/plugins/querySelector"
		},

		gates:[
			// [synchronized?, gate-name, gate-message]
			[0, "read", "reading resources"],
			[0, "text", "processing raw resource content"],
			[0, "tokenize", "tokenizing resource"],
			[0, "tokens", "processing resource tokens"],
			[0, "parse", "parsing resource"],
			[1, "ast", "processing resource AST"],
			[1, "optimize", "executing global optimizations"],
			[1, "write", "writing resources"],
			[1, "cleanup", "cleaning up"],
			[1, "report", "reporting"]
		],

		transformConfig: {},

		transforms:{
			trace:          ["build/transforms/trace", "read"],
			read:           ["build/transforms/read", "read"],
			dojoPragmas:    ["build/transforms/dojoPragmas", "read"],
			insertSymbols:  ["build/transforms/insertSymbols", "read"],
			depsScan:       ["build/transforms/depsScan", "ast"],
			hasFixup:       ["build/transforms/hasFixup", "ast"],
			write:          ["build/transforms/write", "write"],
			writeAmd:       ["build/transforms/writeAmd", "write"],
			writeOptimized: ["build/transforms/writeOptimized", "write"],
			copy:           ["build/transforms/copy", "write"],
			writeDojo:      ["build/transforms/writeDojo", "write"],
			compactCss:     ["build/transforms/compactCss", "optimize"],
			optimizeCss:    ["build/transforms/optimizeCss", "optimize"],
			writeCss:       ["build/transforms/writeCss", "write"],
			hasFindAll:     ["build/transforms/hasFindAll", "read"],
			hasReport:      ["build/transforms/hasReport", "cleanup"],
			depsDump:       ["build/transforms/depsDump", "cleanup"],
			dojoReport:     ["build/transforms/dojoReport", "report"],
			report:         ["build/transforms/report", "report"]
		},

		transformJobs:[[
				// immediately filter the stuff to not be transformed in any way
				function(resource, bc) {
					return (bc.mini && resource.tag.miniExclude) || (!bc.copyTests && resource.tag.test) || (resource.tag.ignore);
				},
				[]
			],[
				// if the tag says just copy, then just copy
				function(resource) {
					return resource.tag.copyOnly;
				},
				["copy"]
			],[
				// the synthetic report module
				function(resource) {
					return resource.tag.report;
				},
				["dojoReport", "insertSymbols", "report"]
			],[
				// dojo.js, the loader
				function(resource, bc) {
					if (resource.mid=="dojo/dojo") {
						bc.loader= resource;
						resource.boots= [];
						// the loader is treated as an AMD module when creating the "dojo" layer, but and AMD dependency scan won't
						// work because it's not an AMD module; therefore, initialize deps here and make sure not to do the depsScan transform
						resource.deps= [];
						bc.amdResources[resource.mid]= resource;
						return true;
					}
					return false;
				},
				["read", "dojoPragmas", "hasFindAll", "hasFixup", "writeDojo", "writeOptimized"]
			],[
				// package has module
				function(resource) {
					if (/^\w+\/has$/.test(resource.mid)) {
						bc.amdResources[resource.mid]= resource;
						return true;
					}
					return false;
				},
				["read", "dojoPragmas", "hasFindAll", "hasFixup", "depsScan", "writeAmd", "writeOptimized", "hasReport", "depsDump"]
			],[
				// nls resources
				function(resource) {
					if (/\/nls\//.test(resource.mid) ||	/\/nls\/.+\.js$/.test(resource.src)) {
						resource.tag.nls= 1;
						bc.amdResources[resource.mid]= resource;
						return true;
					}
					return false;
				},
				["read", "dojoPragmas", "hasFindAll", "hasFixup", "depsScan", "writeAmd"]
			],[
				// synthetic AMD modules (used to create layers on-the-fly
				function(resource) {
					if (resource.tag.synthetic && resource.tag.amd){
						bc.amdResources[resource.mid]= resource;
						return true;
					}
					return false;
				},
				// just like regular AMD modules, but without a bunch of unneeded transforms
				["depsScan", "writeAmd", "writeOptimized"]
			],[
				// synthetic dojo/loadInit! resources
				// FIXME: can't this be added to the previous transform?
				function(resource) {
					if (resource.tag.loadInitResource){
						bc.amdResources[resource.mid]= resource;
						return true;
					}
					return false;
				},
				// just like regular AMD modules (the next transform job), but without a bunch of unneeded transforms
				["writeAmd", "writeOptimized"]
			],[
				// AMD module:
				// already marked as an amd resource
				// ...or...
				// not dojo/dojo.js (filtered above), not package has module (filtered above), not nls bundle (filtered above), not test or building test, not build control script or profile script but still a Javascript resource...
				function(resource) {
					if (resource.tag.amd || (/\.js$/.test(resource.src) && (!resource.tag.test || bc.copyTests=="build") && !/\.(bcs|profile)\.js$/.test(resource.src))) {
						bc.amdResources[resource.mid]= resource;
						return true;
					}
					return false;
				},
				["read", "dojoPragmas", "hasFindAll", "insertSymbols", "hasFixup", "depsScan", "writeAmd", "writeOptimized"]
			],[
				// a test resource; if !bc.copyTests then the resource was filtered in the first item; otherwise, if the resource is a potential module and building tests, then it was filtered above;
				function(resource, bc) {
					return resource.tag.test;
				},
				["read", "dojoPragmas", "write"]
			],[
				// html file; may need access contents for template interning and/or dojoPragmas; therefore, can't use copy transform
				function(resource, bc) {
					return /\.(html|htm)$/.test(resource.src);
				},
				["read", "dojoPragmas", "write"]
			],[
				// css that are designated to compact
				function(resource, bc) {
					return /\.css$/.test(resource.src);
				},
				["read", "optimizeCss", "write"]
			],[
				// just copy everything else except tests which were copied above iff desired...
				function(resource) {
					return !resource.tag.test;
				},
				["copy"]
			]
		]
	};
	for (var p in defaultBc) {
		bc[p]= defaultBc[p];
	}
	return bc;
});

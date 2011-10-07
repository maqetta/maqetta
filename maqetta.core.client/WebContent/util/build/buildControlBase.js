define(["dojo", "./messages"], function(dojo, messages) {
	var bc= {
		exitCode:0,

		// useful for dojo pragma including/excluding
		built:true,

		startTimestamp:new Date(),

		paths:{},
		destPathTransforms:[],
		packageMap:{},

		// resource sets
		resources:{},
		resourcesByDest:{},
		amdResources:{},

		closureCompilerPath:"../closureCompiler/compiler.jar",
		maxOptimizationProcesses:5,
		buildReportDir:".",
		buildReportFilename:"build-report.txt"
	};
	for(var p in messages){
		bc[p] = messages[p];
	};
	return bc;
});

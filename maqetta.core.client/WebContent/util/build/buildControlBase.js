define([
	"dojo",
	"./messages",
	"dojo/text!./copyright.txt",
	"dojo/text!./buildNotice.txt"
], function(dojo, messages, defaultCopyright, defaultBuildNotice) {
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
		buildReportFilename:"build-report.txt",

		defaultCopyright:defaultCopyright,
		defaultBuildNotice:defaultBuildNotice
	};
	for(var p in messages){
		bc[p] = messages[p];
	};
	return bc;
});

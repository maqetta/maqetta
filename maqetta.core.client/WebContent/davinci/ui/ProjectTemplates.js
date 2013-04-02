define(["dojo/_base/declare",
        "davinci/Runtime",
        "davinci/Workbench"
        
],function(declare, Runtime, Workbench){
	
var ProjectTemplates = {

	create: function(params) {
		if(!params || !params.projectTemplateName){
			return;
		}
		var projectTemplateName = params.projectTemplateName;
		var sharingSimple = params.sharingSimple == "all" ? "all" : "none";

		var timestamp = new Date().toISOString();
		var params = {
			projectTemplateName: projectTemplateName, 
			projectToClone:Workbench.getProject(),
			sharingSimple:sharingSimple,
			timestamp:timestamp
		};
		var paramsJson = JSON.stringify(params, null, '\t');
		var data = Runtime.serverJSONRequest({
			url: "cmd/createProjectTemplate",
			handleAs: "json",
			content: { params:paramsJson },
			sync:true
		});
		if(!data || !data.success){
			console.log("cmd/createProjectTemplate error:"+data.error);
		}else{
			if(data.projectTemplates){
				Runtime.setSiteConfigData("projectTemplates", data.projectTemplates);
			}
		}
		return data;
		
	},

	// Assumes that calling routine has set up the params object to exactly match
	// what is required by cmd/modifyProjectTemplate
	modify: function(params) {
		var paramsJson = JSON.stringify(params, null, '\t');
		var data = Runtime.serverJSONRequest({
			url: "cmd/modifyProjectTemplates",
			handleAs: "json",
			content: { params:paramsJson },
			sync:true
		});
		if(!data || !data.success){
			console.log("cmd/modifyProjectTemplate error:"+data.error);
		}else{
			if(data.projectTemplates){
				Runtime.setSiteConfigData("projectTemplates", data.projectTemplates);
			}
		}
		return data;
		
	},

	// Assumes that calling routine has set up the params object to exactly match
	// what is required by cmd/modifyProjectTemplate
	deleteTemplates: function(params) {
		var paramsJson = JSON.stringify(params, null, '\t');
		var data = Runtime.serverJSONRequest({
			url: "cmd/deleteProjectTemplates",
			handleAs: "json",
			content: { params:paramsJson },
			sync:true
		});
		if(!data || !data.success){
			console.log("cmd/deleteProjectTemplate error:"+data.error);
		}else{
			if(data.projectTemplates){
				Runtime.setSiteConfigData("projectTemplates", data.projectTemplates);
			}
		}
		return data;
		
	}
	
};

return dojo.setObject("davinci.ui.ProjectTemplates", ProjectTemplates);

});


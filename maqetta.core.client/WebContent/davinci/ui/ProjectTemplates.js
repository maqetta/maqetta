define(["dojo/_base/declare",
        "dojo/_base/json",
        "davinci/Runtime",
        "davinci/Workbench"
        
],function(declare, json, Runtime, Workbench){
	
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
		var paramsJson = json.toJson(params, '\t');
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
		
	}
	
};

return dojo.setObject("davinci.ui.ProjectTemplates", ProjectTemplates);

});


define(["dojo/_base/declare",
        "davinci/Runtime",
        "davinci/Workbench"
        
],function(declare, Runtime, Workbench){
	
var ProjectTemplates = {

	create: function() {
		// Make async?
		// Need a different server call to see if template already exists (client-side check)
		// Are you sure check to see if any unsaved files
		var data = Runtime.serverJSONRequest({
			url: "cmd/createProjectTemplate",
			handleAs: "json",
			content: { projectTemplateName: 'foo', projectToClone:Workbench.getProject() },
			sync:true
		});
		if(!data || !data.success){
			console.log("cmd/createProjectTemplate error:"+data.error);
		}
	}
	
};

return dojo.setObject("davinci.ui.ProjectTemplates", ProjectTemplates);

});


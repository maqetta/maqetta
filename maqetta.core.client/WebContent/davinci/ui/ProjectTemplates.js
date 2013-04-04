define(["dojo/_base/declare",
        "dojo/request/xhr",
        "davinci/Runtime",
        "davinci/Workbench"
        
],function(declare, xhr, Runtime, Workbench){
	
var ProjectTemplates = {

	// Ask server for list of currently available project templates (async).
	// Note that server might return only so many at a time.
	// Callback is invoked with each incremental response from server,
	// passing the consolidated list to the callback
	getIncremental: function(maxNumberToPull, callback){
		var projectTemplateList = [];
		this._getProjectTemplatesPartial(0, maxNumberToPull, projectTemplateList, callback);
	},
	
	_getProjectTemplatesPartial: function(reqOffset, reqLimit, projectTemplateList, callback){
		//ProjectTemplates.get({offset:reqOffset, limit:reqLimit}, function(returnData){
		this._getProjectTemplatesSendRequest({offset:reqOffset, limit:reqLimit}, function(projectTemplateList, callback, returnData){
			var error = false;
			if(returnData.success){
				if(typeof returnData.totalNumProjectTemplates == 'number' && 
						typeof returnData.offset == 'number' && 
						typeof returnData.limit == 'number' &&
						returnData.offset >= 0 && returnData.limit >= 1 &&
						returnData.projectTemplatesObject && 
						returnData.projectTemplatesObject.projectTemplates){
					projectTemplateList = projectTemplateList.concat(returnData.projectTemplatesObject.projectTemplates);
					var newOffset = returnData.offset + returnData.limit;
					var allDone = (newOffset >= returnData.totalNumProjectTemplates);
					var stop = callback(projectTemplateList, returnData, allDone);
					if(!stop && !allDone){
						this._getProjectTemplatesPartial(newOffset, reqLimit, projectTemplateList, callback);
					}
				}else{
					error = false;
				}
			}else{
				error = false;
			}
			if(error){
				console.error("_getProjectTemplatesPartial: unexpected response from server. returnData=");
				console.dir(returnData);
			}
		}.bind(this, projectTemplateList, callback));
	},
	
	_getProjectTemplatesSendRequest: function(params, callback){
		var paramsJson = JSON.stringify(params, null, '\t');
		xhr.post("cmd/getProjectTemplates", {
			handleAs: "json",
			query:{params:paramsJson}
		}).then(function(responseData){
			callback(responseData);
		}, function(err){
			console.error("_getProjectTemplatesSendRequest xhr error. err=");
			console.dir(err);
		});
	},

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
			console.error("cmd/createProjectTemplate error:"+data.error);
		}
		return data;
		
	},

	// Assumes that calling routine has set up the params object to exactly match
	// what is required by cmd/modifyProjectTemplates
	modify: function(params) {
		var paramsJson = JSON.stringify(params, null, '\t');
		var data = Runtime.serverJSONRequest({
			url: "cmd/modifyProjectTemplates",
			handleAs: "json",
			content: { params:paramsJson },
			sync:true
		});
		if(!data || !data.success){
			console.error("cmd/modifyProjectTemplate error:"+data.error);
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
			console.error("cmd/deleteProjectTemplate error:"+data.error);
		}
		return data;
		
	}
	
};

return dojo.setObject("davinci.ui.ProjectTemplates", ProjectTemplates);

});


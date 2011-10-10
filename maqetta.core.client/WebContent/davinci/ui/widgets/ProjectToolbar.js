dojo.provide("davinci.ui.widgets.ProjectToolbar");
dojo.require("davinci.ui.widgets.ProjectSelection");



dojo.declare("davinci.ui.widgets.ProjectToolbar",   [dijit._Widget, dijit._Templated], {

	templateString: dojo.cache("davinci.ui", "templates/projectToolbar.html"),
	widgetsInTemplate: true,
	_projectSelection : null,

	postCreate : function(){
		this.connect(this._projectSelection, "onChange", this._projectSelectionChanged);
		this._currentProject = this._projectSelection.attr("value");
		
	},
	
	onChange : function(){
		
	},
	
	_projectSelectionChanged : function(){
		
		var newProject = this._projectSelection.attr("value");
		if(newProject==this._currentProject) return;
		davinci.Runtime.loadProject(newProject);
		
	},
	
	_delete : function(){
		var allProjects = this._projectSelection.attr("projects");
		if(allProjects.length < 2){
			alert("You can't delete the only project in your workspace!");
			return;
		}
		var changeToProject = null;
		var project = this._projectSelection.attr("value");
		for(var i=0;!changeToProject && i<allProjects.length;i++){
			if(allProjects[i]!=project)
				changeToProject = allProjects[i];
		}
		var resource = davinci.resource.findResource(project);
		resource.deleteResource();
		davinci.Runtime.loadProject(changeToProject);
	},
	
	_rename : function(){
		var newProject = this._projectSelection.attr("value");
		
	}
	
});

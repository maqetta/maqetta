dojo.provide("davinci.ui.widgets.ProjectToolbar");
dojo.require("davinci.ui.widgets.ProjectSelection");
dojo.require("davinci.ui.Rename");


dojo.declare("davinci.ui.widgets.ProjectToolbar",   [dijit._Widget, dijit._Templated], {

	templateString: dojo.cache("davinci.ui", "templates/projectToolbar.html"),
	widgetsInTemplate: true,
	_projectSelection : null,
	invalid : [],
	
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
		var oldProject = davinci.Runtime.getProject();
		var renameDialog = new davinci.ui.Rename({value:oldProject, invalid: this._projectSelection.attr("projects")});
		
		davinci.Workbench.showModal(renameDialog, 'Rename Project To....', 'height:110px;width: 200px',function(){
			
			var cancel = renameDialog.attr("cancel");
			if(!cancel){
				var newName = renameDialog.attr("value");
				if(newName==oldProject) return;
				
				var resource = davinci.resource.findResource(oldProject);
				resource.rename(newName);
				davinci.Runtime.loadProject(newName);
			}
		});
		
		
	}
	
});

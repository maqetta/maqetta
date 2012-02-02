define(["dojo/_base/declare", 
        "davinci/ui/ProjectDataStore",
        "dijit/form/ComboBox",
        "system/resource",
        "davinci/Workbench"

 ],function(declare, ProjectDataStore, ComboBox, Resource, Workbench){
	return declare("davinci.ui.ProjectSelection", dijit._Widget, {
		postCreate: function(){
			this._store = new ProjectDataStore({});
			this.combo = new ComboBox({store: this._store, required: false, style: "width:100%"});
			this.domNode = this.combo.domNode;
			this._populateProjects();
		},
		
		_populateProjects: function(){
			var workspace = Resource.getWorkspace(),
				store = this._store,
				combo = this.combo;
			workspace.getChildren(function(projects){
				store.setValues(projects);
				var activeProject = Workbench.getProject();
				combo.attr('value', activeProject);
			});

		}
		
	});


});



define(["dojo/_base/declare",
        "dijit/_Widget",
        "system/resource",
        "davinci/Runtime",
		"dojo/data/ItemFileReadStore",
		"davinci/ui/widgets/ProjectDataStore",
		"dijit/form/ComboBox"
  ],function(declare, _Widget, Resource, Runtime, ItemFileReadStore, ProjectDataStore, ComboBox){

	return declare("davinci.ui.widgets.ProjectSelection",   _Widget, {

		
		postCreate : function(){
			
			this._store = new ProjectDataStore({});
			this.combo = new ComboBox({store:this._store, required: false, style:"width:100%"});
			dojo.connect(this.combo,"onChange",this,"_onChange");
			
			this.domNode.appendChild(this.combo.domNode);
			this._populateProjects();
		},
		
		onChange : function(){
			
		},
		
		_onChange : function(){
			var comboValue = dojo.attr(this.combo, "value");
			if(this.value!=comboValue){
				this.value = comboValue;
				this.onChange();
			}
			
		},
		
		_getValueAttr : function(){
			return this.value;
		},
		
		_getSizeAttr : function(){
			return this._numberOfProjects;
		},
		
		_getProjectsAttr : function(){
			return this._allProjects;
		},
		
		_populateProjects : function(){
			var workspace = Resource.getWorkspace();
			var store = this._store;
			var combo = this.combo;
			var me = this;
			
			Resource.listProjects(dojo.hitch(this,function(projects){
				
				store.setValues(projects);
				var activeProject = Runtime.getProject();
				this.value = activeProject;
				this._numberOfProjects = projects.length;
				this._allProjects = [];
				for(var i=0;i<projects.length;i++){
					this._allProjects.push(projects[i].name);
				}
				combo.attr('value', activeProject);
			}));
			/*
			workspace.getChildren(function(projects){
				store.setValues(projects);
				var activeProject = davinci.Runtime.getProject();
				combo.attr('value', activeProject);
			});
			*/
	
		}
		
	});
});

dojo.provide("davinci.ui.ProjectSelection");
dojo.provide("davinci.ui.ProjectDataStore");
dojo.require("dojo.data.ItemFileReadStore");

dojo.declare("davinci.ui.ProjectDataStore",  dojo.data.ItemFileReadStore, {
	constructor: function(args){
		this.clearValues();
		if(args.values){
			this.setValues(args.values);
		}
	},

	setValues: function(values){
		var items = [];
		var counter = 0;
		
		if(values) 
			this._values = values;
		
		dojo.forEach(this._values, dojo.hitch(this,function(v){
			items.push({name: v, value: v, id: counter++});
		}));
		
		this._jsonData = {identifier: "id", items: items};
		this._loadFinished = false;
	},
	modifyItem : function(oldValue, newValue){
		for(var i = 0;i<this._values.length;i++){
			if(this._values[i]==oldValue){
				this._values[i] = newValue;
			}
		}
		this.setValues();
	},
	/* insert an item at the given index */
	insert : function(atIndex, value){
	
		this._values.splice(atIndex, 0, value);
		
		this.setValues();
	},

	contains : function(item){
		for(var i = 0;i<this._values.length;i++){
			if(this._values[i]==item){
				return true;
			}
		}
		return false;
		
	},

	getItemNumber : function(index){
		return this._values[index];
	}, 
	
	clearValues : function(){
		this._loadFinished = false;
	}
	
});

dojo.declare("davinci.ui.ProjectSelection",   dijit._Widget, {


	postCreate : function(){
		
		this._store = new davinci.ui.ProjectDataStore({});
		this.combo = new dijit.form.ComboBox({store:this._store, required: false, style:"width:100%"});
		this.domNode = this.combo.domNode;
		this._populateProjects();
	},
	
	_populateProjects : function(){
		var workspace = davinci.resource.getWorkspace();
		var store = this._store;
		var combo = this.combo;
		workspace.getChildren(function(projects){
			store.setValues(projects);
			var activeProject = davinci.Runtime.getProject();
			combo.attr('value', activeProject);
		});

	}
	
});

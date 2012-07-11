define([
//    "../Workbench",
		"dojo/_base/declare",
		"dojo/_base/xhr",
    "../Runtime",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "davinci/ui/Dialog",
    "dijit/Tree",
    "dijit/tree/ForestStoreModel",
    "dojo/data/ItemFileReadStore",
    "dojo/i18n!./nls/workbench",
    "dojo/i18n!dijit/nls/common",
    "dojo/text!./templates/Preferences.html",
    "dijit/form/Button"
], function(/*Workbench,*/ declare, xhr, Runtime, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Dialog, Tree, ForestStoreModel, ItemFileReadStore, workbenchStrings, commonStrings, templateString) {


var PreferencesWidget = declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {

	templateString: templateString,

	commonStrings: commonStrings,

	resize: function() {
		this.borderContainer.resize();
	}
});
	
var Preferences = {
	_allPrefs: {},

	savePreferences: function(id, base, preferences){
		xhr.put({
			url: "cmd/setPreferences?id="+id + "&base=" + encodeURIComponent(base),
			putData: dojo.toJson(preferences),
			handleAs: "json",
			contentType: "text/html"
		}).then(function() {
			if(!Preferences._allPrefs[base]) {
				Preferences._allPrefs[base] = {};			
			}
			
			Preferences._allPrefs[base][id] = preferences;
			
			dojo.publish("/davinci/preferencesChanged",[{id: id, preferences: preferences}]);
		});
	},

	_loadExtensions: function (){
		 if(!Preferences._extensions) { Preferences._extensions=Runtime.getExtensions("davinci.preferences"); }
	},
	
	showPreferencePage: function(){
		Preferences._loadExtensions();
	    var prefJson = Preferences.getPrefJson();
 	    if(!prefJson || prefJson.length < 1) {
 	    	alert(workbenchStrings.noUserPref);
 	    	return;
 	    	
 	    }

		this.dialog = new Dialog({
			title: workbenchStrings.preferences,
			content: new PreferencesWidget({}),
			contentStyle: {width: 700, height: 500},
			onCancel:function(){
				this.destroyRecursive(false);
			}
		});	

		var itemStore = new ItemFileReadStore({data: prefJson, jsId: "prefTreeDataStore"});	
		var forestModel = new ForestStoreModel({jsId: "fileModel", labelAttr: "name", store: itemStore});
		
		var dojoTree = dijit.byId("prefTree");
		if(!dojoTree) {
			dojoTree = new Tree({
				model: forestModel, 
				id: 'prefTree',
				persist: false,
				query: "{type:'directory'}",
				label: "Preferences", 
				labelAttr: "name", 
				showRoot: false,
				childrenAttrs: "children"
			});
		}
		dojoTree.onClick = function(node) { Preferences.setPaneContent(node); };
		dojo.byId("pref.TreePane").appendChild(dojoTree.domNode);
		dojoTree.startup();

		this.dialog.show();
	},
	getPrefJson: function(){
		//build the proper json structure before returning it.  this is to save a lot of time over riding model methods for the tree.
		var ejson = Preferences._extensions;
		
		if(ejson==null) return [];
		var flatNodeTree = [];
		for(var i = 0;i<ejson.length;i++){
			ejson[i]._index=i;
			if(ejson[i].category){
				if(!flatNodeTree[ejson[i].category]){
					flatNodeTree[ejson[i].category]  = [];
				}
				
				flatNodeTree[ejson[i].category].push(ejson[i]);
				
			}else{
				if(!flatNodeTree.root) {
					flatNodeTree.root = [];
				}
				flatNodeTree.root.push(ejson[i]);
			}
		}
		
		var treeJson = flatNodeTree.root.map(function(node){
			return {
				id: node.id,
				name: node.name,
				index: node._index,
				children: Preferences._getPrefJsonChildren(node.id, flatNodeTree)
			};
		});
		
		return {items: treeJson};
	},
	
	_getPrefJsonChildren: function(catId, valuesArray){
		var children = valuesArray[catId];
		if(!children) return [];
		var freechildren = []; // FIXME: use map
		for(var p = 0;p<children.length;p++){
			freechildren[p] = {
				id: children[p].id,
				name: children[p].name,
				index: children[p]._index
			};
			if(valuesArray[children[p].id]){	
				freechildren[p].children = Preferences._getPrefJsonChildren(children[p].id, valuesArray) ;
			}
		}
		return freechildren;
	},

	setPaneContent: function(node){
		var domNode;
		delete Preferences._currentPane;
		var extension= Preferences._extensions[node.index[0]];
		var prefs=Preferences.getPreferences(extension.id, davinci.Workbench.getProject());
		if (extension.pane){
			require([extension.pane], function(cls) {
				var pane=new cls();
				Preferences._currentPane=pane;
				Preferences._currentPane._extension=extension;
				Preferences._currentPane.setPreferences(prefs);
				dijit.byId("pref.RightPane").setContent(pane.domNode);
			});
		}
		else if (extension.pageContent){
			domNode=document.createTextNode(extension.pageContent);
		}
		else {
			domNode=document.createTextNode("");
		}
		if (domNode) {
			dijit.byId("pref.RightPane").setContent( domNode );
		}
	},
	
	_save: function(listOfPages){
		if (Preferences._currentPane)
		{
			var prefs=Preferences._currentPane.getPreferences();
			var id=Preferences._currentPane._extension.id;
			var base = davinci.Workbench.getProject();
			
			Preferences.savePreferences(id, base, prefs);
			if(Preferences._currentPane.save){
				Preferences._currentPane.save(prefs);
			}
		}
		for(var i = 0;i<listOfPages.length;i++){
			try{
				if(listOfPages[i].save) {
					listOfPages[i].save();
				}
			}catch(ex){console.log(ex); }
			if(listOfPages[i].children && listOfPages[i].children.length > 0) {
				Preferences._save(listOfPages[i].children);
			}
		}
	},

	save: function (){
		Preferences._save(Preferences._extensions);
		Preferences.finish();
	},

	finish: function (){
		Preferences._extensions=null;
		Preferences._currentPane=null;
		this.dialog.destroyRecursive(false);
		this.dialog = null;
	},
	
	getPreferences: function (id, base){
		
		if(!Preferences._allPrefs[base]) {
			Preferences._allPrefs[base] = {};
		}
		
		if (!Preferences._allPrefs[base][id]){
			var prefs= Runtime.serverJSONRequest({
			   url:"cmd/getPreferences",
			   handleAs:"json",
			   content:{id:id, base: base},
			   sync: true
			});
			if(!prefs){
				prefs=Preferences.getDefaultPreferences(id);
			}
			Preferences._allPrefs[base][id]=prefs;
		}
		return Preferences._allPrefs[base][id];
	},
	
	getDefaultPreferences: function(id){
		Preferences._loadExtensions();
		for(var i =0;i<Preferences._extensions.length;i++){
			if(Preferences._extensions[i].id==id){
			    if (dojo.isString(Preferences._extensions[i].defaultValues)){
			    	var prefs= Runtime.serverJSONRequest({
						   url:Preferences._extensions[i].defaultValues, handleAs:"json", sync:true  });
			    	return prefs.defaultValues;
			    }
				return Preferences._extensions[i].defaultValues;
			}
		}
	}
	
};
return dojo.setObject("davinci.workbench.Preferences", Preferences);
});

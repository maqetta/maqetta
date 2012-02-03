define([
    "../ui/Panel",
//    "../Workbench",
    "../Runtime",
    "dijit/Dialog",
    "dojo/i18n!./nls/workbench",
    "dojo/i18n!dijit/nls/common"
], function(Panel, /*Workbench,*/ Runtime, Dialog, workbenchStrings, commonStrings) {

var Preferences = {
	_allPrefs: {},

	savePreferences: function(id, base, preferences){
		dojo.xhrPut({
			url: "cmd/setPreferences?id="+id + "&base=" + escape(base),
			putData: dojo.toJson(preferences),
			handleAs:"json",
			sync:true,
			contentType:"text/html"
		});	
		
		if(!Preferences._allPrefs[base])
			Preferences._allPrefs[base] = {};
		
		Preferences._allPrefs[base][id]=preferences;
		
		dojo.publish("/davinci/preferencesChanged",[{id:id, preferences:preferences}]);
	},
	_loadExtensions: function (){
		 if(!Preferences._extensions) { Preferences._extensions=Runtime.getExtensions("davinci.preferences"); }
	},
	
	showPreferencePage: function(){
		Preferences._loadExtensions();
		var langObj = workbenchStrings;
		var dijitLangObj = commonStrings;
	    var prefJson = Preferences.getPrefJson();
 	    if(!prefJson || prefJson.length < 1) {
 	    	alert(langObj.noUserPref);
 	    	return;
 	    	
 	    }
 	    //FIXME: move template to html file and reference with dojo/text! dependency
    	var html_template = "<div dojoType='dijit.layout.BorderContainer' style='width: 700px; height: 500px;' gutters='false' liveSplitters='true' id='preferencesContainer'>"+
		    "<div dojoType='dijit.layout.ContentPane' id='pref.TreePane' splitter='true' region='leading' style='width: 200px;' minSize='100' maxSize='300'></div>"+
		    "<div dojoType='dijit.layout.ContentPane' region='bottom' style='height: 25px'>"+
			"<button dojoType=dijit.form.Button type=\"button\" onclick=\"davinci.workbench.Preferences.save();\">"+dijitLangObj.buttonSave+"</button></td>"+
			/*
			 * FIXME: we don't have logic to yet implement restoreDefaults() yet. See #627
			 "<button dojoType=dijit.form.Button type=\"button\" onclick=\"davinci.workbench.Preferences.restoreDefaults();\">"+langObj.restoreDefaults+"</button></td>"+
			*/
			"<button dojoType=dijit.form.Button type=\"button\" onclick=\"davinci.workbench.Preferences.finish();\">"+dijitLangObj.buttonCancel+"</button></td>"+
			"</div>"+
		    "<div dojoType='dijit.layout.ContentPane' region='center' id='pref.RightPane'></div>"+
		 "</div>";

		var	dialog = new Dialog({
			id: "preference.main.dialog",
			title: langObj.preferences,
			content: html_template,
			onCancel:function(){
				this.destroyRecursive(false);
			}
		});	

		var itemStore = new dojo.data.ItemFileReadStore({data:prefJson, jsId: "prefTreeDataStore"});	
		var forestModel = new dijit.tree.ForestStoreModel({jsId:"fileModel",labelAttr: "name", store:itemStore}) ;
		
		var dojoTree = dijit.byId("prefTree");
		if(!dojoTree) {
			dojoTree = new dijit.Tree({
				model: forestModel, 
				id:'prefTree',
				query:"{type:'directory'}",
				label:"Preferences", 
				labelAttr: "name", 
				showRoot: false,
				childrenAttrs:"children"
			});
		}
		dojoTree.onClick = function(node) { Preferences.setPaneContent(node); };
		dojo.byId("pref.TreePane").appendChild(dojoTree.domNode);
		dojoTree.startup();
		dialog.show();
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
			dojo["require"](extension.pane); //FIXME: use require
			var cls=eval(extension.pane); // FIXME: avoid eval?
			var pane=new cls();
			Preferences._currentPane=pane;
			Preferences._currentPane._extension=extension;
			Preferences._currentPane.setPreferences(prefs);
			domNode=pane.domNode;
		}
		else if (extension.panel){
			var widget = new Panel({definition:extension.panel, data:prefs});
			domNode=widget.domNode;
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
		dijit.byId('preference.main.dialog').destroyRecursive(false);
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

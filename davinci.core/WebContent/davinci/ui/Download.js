dojo.provide("davinci.ui.Download");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.MenuItem");
dojo.require("dijit.Menu");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ComboBox");

dojo.require("davinci.library");
dojo.require("davinci.ve.RebaseDownload");
dojo.require("dojox.widget.Standby");
dojo.declare("davinci.ui.Download",   [dijit._Widget, dijit._Templated], {
	
	
	templateString: dojo.cache("davinci.ui", "templates/download.html"),
	widgetsInTemplate: true,
	
	/* templated attach points, custom input section */
	
	/* check box for rewrite dojo */
	__rewriteDojo : null,
	__rewriteDojoURL : null,
	__fileName : null,
	_selectionDiv : null,
	_okButton : null,
	_tableDiv : null,

	buildRendering : function(){
		this.inherited(arguments);
		
		this._handles = [];
		this._userLibs = davinci.library.getUserLibs();
		var uiArray = [];
		
		uiArray.push("<table cellspacing='0' cellpadding='0' width='100%' class='dwnloadLibTable'><tr><td class='header'>Library</td><td class='header'>Version</td><td class='header'>Include<br>Source</td><td class='header'>Base Location</td></tr>");
		uiArray.push("<tr><td colspan='4'><hr></hr></td></tr>");
		this.libraries = {};
		/* build UI table */
		for(var i =0;i<this._userLibs.length;i++){
			
			this._userLibs[i].initRoot = this._getLibRoot(this._userLibs[i]['id'],this._userLibs[i]['version']);
			var name = this._userLibs[i]['id']; // may want to use a better name here eventually
			
			uiArray.push("<tr>");
			uiArray.push("<td class='columna'>" + name + "</td>");
			uiArray.push("<td class='columnb'>" + this._userLibs[i]['version'] + "</td>");
			uiArray.push("<td class='columnc'><input type='checkbox' libItemCheck='"+ i +"' checked></input></td>");
			uiArray.push("<td class='columnd'><input type='text' value='" + this._userLibs[i].initRoot + "' libItemPath='"+i+ "'></input></td>");
			
			uiArray.push("</tr>");
			
		}
		uiArray.push("</table>");
		var html =  uiArray.join("");
		dojo.place(html, this._tableDiv);
	
	},

	_getLibRoot:function(id,version){
		for(var i=0;i<this._userLibs.length;i++){
			if(this._userLibs[i].id==id && this._userLibs[i].version==version)
				return this._userLibs[i]['root'];
		}
		
	},
	
	_getLibs : function(){
		var nodeValues = dojo.query("[libItemPath]", this.domNode );
		var nodeList = dojo.query("[libItemCheck]", this.domNode );
		var userLibs = [];
		for(var i =0;i<nodeList.length;i++){
			var element = parseInt(dojo.attr(nodeList[i], "libItemCheck"));
			var value = dojo.attr(nodeList[i], "checked");
			if(value){
				var libLocation = dojo.attr(nodeValues[i], "value") || this._userLibs[element]['root']
				userLibs.push({'id':this._userLibs[element]['id'],'version':this._userLibs[element]['version'] ,'root': libLocation});
			}
		}
		
		return userLibs;
	},
	
	_getResources : function(){
		
		var folder=davinci.resource.getRoot();
		/* get all sub files */
		var list = [];
		var userLibs = [];
		for(var i = 0;i<folder.children.length;i++){
			list.push(folder.children[i].getPath());
		}

		var allLibs = this._getLibs();
		
		return {'userFiles':list, 'userLibs': this._getLibs()};
	},
	
	_rewriteUrls : function(){
		
		var resources = this._getResources();
		var libs = this._getLibs();
		
		//this._pages = davinci.resource.findResource("*.html", true, null, true);
		
		var pageBuilder = new davinci.ve.RebaseDownload(resources['userLibs']);
		for(var i=0;i<resources['userFiles'].length;i++){
			var allResources = null
			var resource = davinci.resource.findResource(resources['userFiles'][i]);
			if(resource.elementType=="Folder"){
				allResources = davinci.resource.findResource("*.html", true, resource, true);
			}else{
				allResources = [resource];
			}
			for(var k=0;i<allResources.length;k++){
				var newSource = pageBuilder.rebuildSource(allResources[k].getText(), allResources[k]);
				allResources[k].setContents(newSource, true);
			}
		}
	
		
	},
	
	okButton : function(){
		function makeTimeoutFunction(downloadFiles, fileName, libs){
			return function(){
				
				
				
				var files = downloadFiles;
				var fn = fileName
				
				davinci.resource.download(files, fn, libs);		
				/*
				for(var i=0;i<pgs.length;i++){
					pgs[i].removeWorkingCopy();
				}
				*/
				
			}
		}
		var fileName =dojo.attr( this.__fileName, "value");
		this._rewriteUrls();
	
		var allFiles = this._getResources();
		var pages = this._noRewrite ? [] : this._pages;
		/* have to close the dialog before the download call starts */
		setTimeout(makeTimeoutFunction(allFiles['userFiles'], fileName, allFiles['userLibs']), 300);
		this.onClose();
	},
	cancelButton : function(){
		this.onClose();
	}
	

});
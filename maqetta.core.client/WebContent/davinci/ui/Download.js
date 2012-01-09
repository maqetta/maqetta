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
dojo.require("davinci.theme.ThemeUtils");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");
dojo.requireLocalization("dijit", "common");

dojo.require("davinci.library");
dojo.require("davinci.ve.RebaseDownload");
dojo.require("dojox.widget.Standby");
dojo.declare("davinci.ui.Download",   [dijit._Widget, dijit._Templated], {
	
	
	templateString: dojo.cache("davinci.ui", "templates/download.html"),
	widgetsInTemplate: true,
	
	postMixInProperties : function() {
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		var dijitLangObj = dojo.i18n.getLocalization("dijit", "common");
		dojo.mixin(this, langObj);
		dojo.mixin(this, dijitLangObj);
		this.inherited(arguments);
	},
	/* templated attach points, custom input section */
	
	/* check box for rewrite dojo */
	__rewriteDojo : null,
	__rewriteDojoURL : null,
	__fileName : null,
	_selectionDiv : null,
	_okButton : null,
	_tableDiv : null,

	buildRendering : function(){
		var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
		this.inherited(arguments);
		
		this._handles = [];
		this._userLibs = davinci.library.getUserLibs(this.getRoot());
		var uiArray = [];
		
		uiArray.push("<table cellspacing='0' cellpadding='0' width='100%' class='dwnloadLibTable'><tr><td class='header'>"+langObj.library+"</td><td class='header'>"+langObj.version+"</td><td class='header'>"+langObj.include+"<br>"+langObj.source+"</td><td class='header'>"+langObj.baseLocation+"</td></tr>");
		uiArray.push("<tr><td colspan='4'><hr></hr></td></tr>");
		this.libraries = {};
		/* build UI table */
		for(var i =0;i<this._userLibs.length;i++){
			
			this._userLibs[i].initRoot = this._getLibRoot(this._userLibs[i]['id'],this._userLibs[i]['version']);
			var name = this._userLibs[i]['id']; // may want to use a better name here eventually
			
			if(this._userLibs[i].initRoot==null) continue;
			
			
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
			var libLocation = dojo.attr(nodeValues[i], "value") || this._userLibs[element]['root']
			userLibs.push({'id':this._userLibs[element]['id'],
						   'version':this._userLibs[element]['version'] ,
						   'root': libLocation,
						   'includeSrc':value});
			
		}
		
		return userLibs;
	},
	
	getRoot : function(){
		if(davinci.Runtime.singleProjectMode()){
			return davinci.Runtime.getProject();
		}
	},
	
	_getResources : function(){
	
		var project=davinci.Runtime.getProject();
		var folder = system.resource.findResource(project);
		
		/* get all sub files */
	
		var list = [];
		for(var i = 0;i<folder.children.length;i++){
			list.push(folder.children[i].getPath());
		}
		return {'userFiles':[project], 'userLibs': this._getLibs()};
	},
	
	_rewriteUrls : function(){
	
		var resources = this._getResources();

		
		//this._pages = system.resource.findResource("*.html", true, null, true);
		
		var pageBuilder = new davinci.ve.RebaseDownload(resources['userLibs']);
		var allResources = [];
		for(var i=0;i<resources['userFiles'].length;i++){
			
			var resource = system.resource.findResource(resources['userFiles'][i]);
			if(resource.elementType=="Folder"){
				allResources = system.resource.findResource("*.html", true, resource, true);
			}else if(resource.extension=="html"){
				allResources = [resource];
			}
			
			for(var k=0;k<allResources.length;k++){
				if( davinci.theme.isThemeHTML(allResources[k])) continue;
				var newSource = pageBuilder.rebuildSource(allResources[k].getText(), allResources[k]);
				allResources[k].setContents(newSource, true);
			}
		}
	
		
	},
	
	okButton : function(){
		function makeTimeoutFunction(downloadFiles, fileName, root, libs){
			return function(){
				
				
				
				var files = downloadFiles;
				var fn = fileName
			
				
				system.resource.download(files, fn, root, libs);		
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
		var actualLibs = [];
		for(var k=0;k<allFiles['userLibs'].length;k++){
			if(allFiles['userLibs'][k]['includeSrc'])
				actualLibs.push(allFiles['userLibs'][k]);
		}
		
		setTimeout(makeTimeoutFunction(allFiles['userFiles'], fileName, this.getRoot(), actualLibs), 300);
		this.onClose();
	},
	cancelButton : function(){
		this.cancel = true;
		this.onClose();
	}
	

});
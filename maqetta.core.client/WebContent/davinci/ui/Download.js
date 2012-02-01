define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "system/resource",
        "davinci/Runtime",
        "davinci/Workbench",
        "davinci/ve/RebaseDownload",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/download.html",
        "davinci/Theme",
        "davinci/ui/widgets/ThemeSelection",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dijit/form/ValidationTextBox",
        "dijit/form/RadioButton",
        "dijit/MenuItem",
        "dijit/Menu",
        "dijit/form/ComboBox",
        "davinci/ui/widgets/FolderSelection",
        "davinci/ui/widgets/ThemeSelection"
        

],function(declare, _Templated, _Widget,  Library, Resource,  Runtime, Workbench, RebaseDownload, uiNLS, commonNLS, templateString, Theme){
	return declare("davinci.ui.Download",   [_Widget, _Templated], {
		templateString: dojo.cache("davinci.ui", "templates/download.html"),
		widgetsInTemplate: true,
		
		postMixInProperties : function() {
			var langObj = uiNLS;
			var dijitLangObj = commonNLS;
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
			var langObj = uiNLS;
			this.inherited(arguments);
			
			this._handles = [];
			this._userLibs = Library.getUserLibs(this.getRoot());
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
			if(Workbench.singleProjectMode()){
				return Workbench.getProject();
			}
		},
		
		_getResources : function(){
		
			var project=Workbench.getProject();
			var folder = Resource.findResource(project);
			
			/* get all sub files */
		
			var list = [];
			for(var i = 0;i<folder.children.length;i++){
				list.push(folder.children[i].getPath());
			}
			return {'userFiles':[project], 'userLibs': this._getLibs()};
		},
		
		_rewriteUrls : function(){
		
			var resources = this._getResources();
	
			
			//this._pages = Resource.findResource("*.html", true, null, true);
			
			var pageBuilder = new RebaseDownload(resources['userLibs']);
			var allResources = [];
			for(var i=0;i<resources['userFiles'].length;i++){
				
				var resource = Resource.findResource(resources['userFiles'][i]);
				if(resource.elementType=="Folder"){
					allResources = Resource.findResource("*.html", true, resource, true);
				}else if(resource.extension=="html"){
					allResources = [resource];
				}
				
				for(var k=0;k<allResources.length;k++){
					if( Theme.isThemeHTML(allResources[k])) continue;
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
				
					
					Resource.download(files, fn, root, libs);		
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
});
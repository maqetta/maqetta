define(["dojo/_base/declare",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetBase",
        "dijit/_WidgetsInTemplateMixin",
        "davinci/library",
        "system/resource",
        "dojo/promise/all",
        "davinci/Workbench",
        "davinci/ve/RebaseDownload",
        "dojo/i18n!./nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/download.html",
        "davinci/Theme",
        "dijit/form/Button",
        "dijit/form/ValidationTextBox"

],function(declare, _TemplatedMixin, _WidgetBase, _WidgetsInTemplateMixin, Library, Resource, all, Workbench, RebaseDownload, uiNLS, commonNLS, templateString, Theme){
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: templateString,
		
		_fileNameValidationRegExp: "[a-zA-z0-9_.]+", //Numbers, letters, "_", and "."
		_fileNameMaxLength: 50, 
		
		postMixInProperties: function() {
			dojo.mixin(this, uiNLS);
			dojo.mixin(this, commonNLS);
			this.inherited(arguments);
		},
		/* templated attach points, custom input section */
		
		/* check box for rewrite dojo */
		__rewriteDojo : null,
		__rewriteDojoURL : null,
		__fileName : null,
		__optimize: null, //TODO: make sticky
		_selectionDiv : null,
		_okButton : null,
		_tableDiv : null,
	
		buildRendering: function(){
			this.inherited(arguments);
			
			this._handles = [];
			this._userLibs = Library.getUserLibs(this.getRoot());
			var uiArray = [];
			
			uiArray.push("<table cellspacing='0' cellpadding='0' width='100%' class='dwnloadLibTable'><tr><td class='header'>"+uiNLS.library+"</td><td class='header'>"+uiNLS.version+"</td><td class='header'>"+uiNLS.include+"<br>"+uiNLS.source+"</td><td class='header'>"+uiNLS.baseLocation+"</td></tr>");
			uiArray.push("<tr><td colspan='4'><hr></hr></td></tr>");
			this.libraries = {};
			/* build UI table */
			for(var i =0;i<this._userLibs.length;i++){
				this._userLibs[i].initRoot = this._getLibRoot(this._userLibs[i].id,this._userLibs[i].version);
				var name = this._userLibs[i].id; // may want to use a better name here eventually
				
				if(this._userLibs[i].initRoot==null) {
					continue;
				}
				
				if(this._userLibs[i].required){
					uiArray.push("<tr style='display:none'>");
					
				}else{
					uiArray.push("<tr>");
				}
				
				uiArray.push("<td class='columna'>" + name + "</td>");
				uiArray.push("<td class='columnb'>" + this._userLibs[i].version + "</td>");
				uiArray.push("<td class='columnc'><input type='checkbox' libItemCheck='"+ i +"' checked></input></td>");

				uiArray.push("<td class='columnd'><input type='text' value='" + this._userLibs[i].initRoot + "' libItemPath='"+i+ "'></input></td>");
				
				uiArray.push("</tr>");
				
			}
			uiArray.push("</table>");
			var html =  uiArray.join("");
			dojo.place(html, this._tableDiv);
		},
	
		_getLibRoot: function(id,version){
			for(var i=0;i<this._userLibs.length;i++){
				if(this._userLibs[i].id==id && this._userLibs[i].version==version)
					return this._userLibs[i].root;
			}
			
		},
		
		_getLibs: function(){
			var nodeValues = dojo.query("[libItemPath]", this.domNode);
			var nodeList = dojo.query("[libItemCheck]", this.domNode);
			var userLibs = [];
			for(var i =0;i<nodeList.length;i++){
				var element = parseInt(dojo.attr(nodeList[i], "libItemCheck"));
				var value = dojo.attr(nodeList[i], "checked");
				var libLocation = dojo.attr(nodeValues[i], "value") || this._userLibs[element].root
				userLibs.push({id: this._userLibs[element].id,
							   version: this._userLibs[element].version,
							   root: libLocation,
							   includeSrc: value});
				
			}
			
			return userLibs;
		},
		
		getRoot: function(){
			if(Workbench.singleProjectMode()){
				return Workbench.getProject();
			}
		},
		
		_getResources: function(){
			return {userFiles: [Workbench.getProject()], userLibs: this._getLibs()};
		},
		
		_rewriteUrls: function(){
			var resources = this._getResources(),
				promises = [];

			//this._pages = Resource.findResource("*.html", true, null, true);
			
			var pageBuilder = new RebaseDownload(resources.userLibs);
			var allResources = [];
			for(var i=0;i<resources.userFiles.length;i++){
				
				var resource = Resource.findResource(resources.userFiles[i]);
				if(resource.elementType=="Folder"){
					allResources = Resource.findResource("*.html", true, resource, true);
				}else if(resource.extension=="html"){
					allResources = [resource];
				}
				//FIXME: is it possible allResources will be repeated from the last time through the loop?
				allResources.forEach(function(res){
					if(!Theme.isThemeHTML(res)) {
						promises.push(pageBuilder.rebuildSource(res.getContentSync(), res).then(function (newSource) {
							res.setContents(newSource, true);						
						}));
					}
				});
			}
			return all(promises);
		},
		
		okButton: function(){
			if (this.__fileName.isValid()) {
				function makeTimeoutFunction(downloadFiles, fileName, root, libs, options){
					return function(){
						var files = downloadFiles;
						var fn = fileName;

						Resource.download(files, fn, root, libs, options);		
						/*
						for(var i=0;i<pgs.length;i++){
							pgs[i].removeWorkingCopy();
						}
						*/
						
					}
				}
				var fileName = dojo.attr( this.__fileName, "value");
				if (fileName.slice(-4) != ".zip") {
					fileName = fileName + ".zip";
				}
				this._rewriteUrls().then(function() {
					var allFiles = this._getResources();
					var pages = this._noRewrite ? [] : this._pages;
					/* have to close the dialog before the download call starts */
					var actualLibs = allFiles.userLibs.filter(function(lib){
						return lib.includeSrc;
					});
		
					var options = {};
					if (this.__optimize.getValue()) {
						options.build = "1";
					}

					setTimeout(makeTimeoutFunction(allFiles.userFiles, fileName, this.getRoot(), actualLibs, options), 300);					
				}.bind(this));
			}
		},
		
		cancelButton: function(){
			this.cancel = true;
			this.onClose();
		}
	});
});
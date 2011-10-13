dojo.provide("davinci.theme.ThemeUtils");

davinci.theme.isThemeHTML = function(resource){
	return resource.getName().indexOf("dojo-theme-editor.html") > -1;
};

davinci.theme.CloneTheme = function(name, version, selector, directory, originalTheme, renameFiles){
	
	var fileBase = originalTheme.file.parent;
	var themeRootPath = new davinci.model.Path(directory).removeLastSegments(0);
	var resource = davinci.resource.findResource(themeRootPath.toString());
	if (resource.libraryId) {
		resource.createResource();
	}
	davinci.resource.copy(fileBase, directory, true);
	var themeRoot = davinci.resource.findResource(directory);
	var fileName = originalTheme.file.getName();
	/* remove the copied theme */
	var sameName = (name==originalTheme.name);
	var themeFile = null;
	if(!sameName){
		var badTheme = davinci.resource.findResource(directory + "/" + fileName);
		badTheme.deleteResource();
	}

	var directoryPath = new davinci.model.Path(themeRoot.getPath());
	var lastSeg = directoryPath.lastSegment();
	/* create the .theme file */
	if (!sameName) {
		themeFile = themeRoot.createResource(lastSeg + ".theme");
	} else{
		themeFile = davinci.resource.findResource(directory + "/" + fileName);
	}

	var themeJson = {
		className: selector,
		name: name,
		version: version || originalTheme.version, 
		specVersion: originalTheme.specVersion,
		files: originalTheme.files,
		meta: originalTheme.meta,
		themeEditorHtmls: originalTheme.themeEditorHtmls
	};

	if(originalTheme.helper){
	    themeJson.helper = originalTheme.helper; 
	}
	if(originalTheme.base){
        themeJson.base = originalTheme.base; 
    }
	
	
	
	var oldClass = originalTheme.className;
	var toSave = {};
	/* re-write CSS Selectors */
	for(var i=0;i<themeJson['files'].length;i++){
		var fileUrl = directoryPath.append(themeJson['files'][i]);
		
		var resource = davinci.resource.findResource(fileUrl);
		if(!sameName && renameFiles && resource.getName().indexOf(oldClass) > -1){
			var newName = resource.getName().replace(oldClass, selector);
			resource.rename(newName);
			themeJson['files'][i] =newName;
		}
		
		var cssModel = davinci.model.Factory.getInstance().getModel({url:resource.getPath(),
			includeImports: true,
			loader:function(url){
				var r1=  davinci.resource.findResource(url);
				return r1.getText();
			}
		});
		var elements = cssModel.find({elementType: 'CSSSelector', cls: oldClass});
		for(var i=0;i<elements.length;i++){
			elements[i].cls = selector;
			var file = elements[i].getCSSFile();
			toSave[file.url] = file;
			
		}
	}
	
	themeFile.setContents("(" + dojo.toJson(themeJson)+")");
	
	for(var name in toSave){
		toSave[name].save();
	}
	/* re-write metadata */
	
	for(var i=0;i<themeJson['meta'].length;i++){
		var fileUrl = directoryPath.append(themeJson['meta'][i]);
		var file = davinci.resource.findResource(fileUrl.toString());
		var contents = file.getText();
		var newContents = contents.replace(new RegExp(oldClass, "g"), selector);
		file.setContents(newContents);
	}
	
	/* rewrite theme editor HTML */
	for(var i=0;i<themeJson['themeEditorHtmls'].length;i++){
		var fileUrl = directoryPath.append(themeJson['themeEditorHtmls'][i]);
		var file = davinci.resource.findResource(fileUrl.toString());
		var contents = file.getText();
		var htmlFile = new davinci.html.HTMLFile(fileUrl);
		htmlFile.setText(contents,true);
		var element = htmlFile.find({elementType: 'HTMLElement', tag: 'body'}, true);
		element.setAttribute('class',selector);
		htmlFile.save();
	}
	davinci.library.themesChanged();
};

davinci.theme.getHelper = function(theme){
	if (!theme) { return; } 
    if (theme._helper){
        return theme._helper;
    }
    var helper = theme.helper;// davinci.ve.metadata.queryDescriptor(type, "helper");
    if (helper) {
        try {
            dojo["require"](helper);
        } catch(e) {
            console.error("Failed to load helper: " + helper);
            console.error(e);
        }
        var aClass = dojo.getObject(helper);
        if (aClass) {
            theme._helper  = new aClass();
        }
        var obj = dojo.getObject(helper);
        return new obj();
    }
};

davinci.theme.dojoThemeSets =  { 
        "version": "1.7",
        "specVersion": "0.8",
        "helper": "davinci.libraries.dojo.dojox.mobile.ThemeHelper",
        "themeSets": [
            {
                "name": "default",
                "desktopTheme": "claro",
                "mobileTheme": "default"
            }               
           
        ]
};


davinci.theme.getThemeSet = function(context){
    
    var returnThemeSet;
    var dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
    if (!dojoThemeSets){ //  FIXME this default setting should be someplace else
        dojoThemeSets =  davinci.theme.dojoThemeSets;
    }
    // find the themeMap
    var htmlElement = context._srcDocument.getDocumentElement();
    var head = htmlElement.getChildElement("head");
    var scriptTags=head.getChildElements("script");
    var mobileTheme = 'none';
    dojo.forEach(scriptTags, function (scriptTag){
        var text=scriptTag.getElementText();
        var stop = 0;
        var start;
        if (text.length) {
            if (text.indexOf("dojo.require('dojox.mobile.deviceTheme');") && mobileTheme === 'none') {
                mobileTheme = 'default';
            }
            // Look for a dojox.mobile.themeMap in the document, if found set the themeMap
            while ((start = text.indexOf('dojox.mobile.themeMap', stop)) > -1 ){ // might be more than one.
                var stop = text.indexOf(';', start);
                if (stop > start){
                    mobileTheme = text.substring(start + 'dojox.mobile.themeMap'.length + 1, stop);
                }
            }
       }
    });
    debugger;
    var desktopTheme = context.getTheme();
    for (var s = 0; s < dojoThemeSets.themeSets.length; s++){
        var themeSet = dojoThemeSets.themeSets[s];
        var mobileMap = themeSet.mobileTheme;
        if (typeof mobileMap != "string"){
            mobileMap = dojo.toJson(mobileMap);
        }
        if (mobileMap == mobileTheme){
            // found themeMap
            if (themeSet.desktopTheme == desktopTheme.name){
                debugger;
                return themeSet;
            }
            /*var themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly);
            for (var i = 0; i < themeData.length; i++){
                if(themeData[i].name === themeSet.desktopTheme){
                 // check desktop 
                    var modelDoc = context.getModel().getDocumentElement(); 
                    var d = context.getDocument();
                    var modelHead = modelDoc.getChildElement('head');
                    var b = d.getElementsByTagName("body");
                    var modelBody = modelDoc.getChildElement('body');
                    
                    //var header = dojo.clone( this._context.getHeader());
                    var header = context.getHeader();
                    //var resourcePath = context.getFullResourcePath();
                    // find the old theme file name
                    function sameSheet(headerSheet, file){
                        return (headerSheet.indexOf(file) > -1)
                    }
                    var files = themeData[i].files;
                
                    for (var x=0; x<files.length; x++){
                        var filename = files[x];
                        for (var y=0; y<header.styleSheets.length; y++){
                            if(sameSheet(header.styleSheets[y], filename)){
                                // found the sheet to change
                                debugger;    
                                var modelAttribute = modelBody.getAttribute('class');
                                if (modelAttribute && (modelAttribute.indexOf(themeData[i].className) > -1)){
                                   debugger;
                                   return themeSet;
                                }
             
                            }
                        }
                    }
                }
            } */
           
            debugger;
        }
    }
    // themeSet not found Create one with gleaned information
    debugger;
    var newThemeSetName = desktopTheme.name + '_' + mobileTheme;
    // make sure the name is unique
    var nameIndex = 0;
    for (var n = 0; n < dojoThemeSets.themeSets.length; n++){
        if (dojoThemeSets.themeSets[n].name == newThemeSetName){
            nameIndex++;
        }
    }
    if (nameIndex > 0){
        newThemeSetName = newThemeSetName + '_' + nameIndex;
    }
    themeSet =  {
            "name": newThemeSetName,
            "desktopTheme": desktopTheme.name,
            "mobileTheme": mobileTheme
        };  
    dojoThemeSets.themeSets.push(themeSet);
    davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(), dojoThemeSets);
    return themeSet;
   
};




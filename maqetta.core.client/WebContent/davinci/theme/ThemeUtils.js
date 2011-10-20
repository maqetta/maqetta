dojo.provide("davinci.theme.ThemeUtils");

davinci.theme.isThemeHTML = function(resource){
	return resource.getName().indexOf("dojo-theme-editor.html") > -1;
};

davinci.theme.CloneTheme = function(name, version, selector, directory, originalTheme, renameFiles){
	
	var fileBase = originalTheme.file.parent;
	var themeRootPath = new davinci.model.Path(directory).removeLastSegments(0);
	var resource = system.resource.findResource(themeRootPath.toString());
	if (resource.libraryId) {
		resource.createResource();
	}
	system.resource.copy(fileBase, directory, true);
	var themeRoot = system.resource.findResource(directory);
	var fileName = originalTheme.file.getName();
	/* remove the copied theme */
	var sameName = (name==originalTheme.name);
	var themeFile = null;
	if(!sameName){
		var badTheme = system.resource.findResource(directory + "/" + fileName);
		badTheme.deleteResource();
	}

	var directoryPath = new davinci.model.Path(themeRoot.getPath());
	var lastSeg = directoryPath.lastSegment();
	/* create the .theme file */
	if (!sameName) {
		themeFile = themeRoot.createResource(lastSeg + ".theme");
	} else{
		themeFile = system.resource.findResource(directory + "/" + fileName);
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
		
		var resource = system.resource.findResource(fileUrl);
		if(!sameName && renameFiles && resource.getName().indexOf(oldClass) > -1){
			var newName = resource.getName().replace(oldClass, selector);
			resource.rename(newName);
			themeJson['files'][i] =newName;
		}
		
		var cssModel = davinci.model.Factory.getInstance().getModel({url:resource.getPath(),
			includeImports: true,
			loader:function(url){
				var r1=  system.resource.findResource(url);
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
		var file = system.resource.findResource(fileUrl.toString());
		var contents = file.getText();
		var newContents = contents.replace(new RegExp(oldClass, "g"), selector);
		file.setContents(newContents);
	}
	
	/* rewrite theme editor HTML */
	for(var i=0;i<themeJson['themeEditorHtmls'].length;i++){
		var fileUrl = directoryPath.append(themeJson['themeEditorHtmls'][i]);
		var file = system.resource.findResource(fileUrl.toString());
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

davinci.theme.desktop_default = 'desktop_default';
davinci.theme.mobile_default = 'mobile_default';
davinci.theme.default_theme = 'default';
davinci.theme.other_device = 'other';
davinci.theme.none_theme = 'none';
davinci.theme.dojoMobileDefault = [{"theme":"default","device":"Android"},{"theme":"default","device":"BlackBerry"},{"theme":"default","device":"iPad"},{"theme":"default","device":"iPhone"},{"theme":"default","device":"other"}];
davinci.theme.dojoMobileNone =  [{"theme":"none","device":"Android"},{"theme":"none","device":"BlackBerry"},{"theme":"none","device":"iPad"},{"theme":"none","device":"iPhone"},{"theme":"none","device":"other"}];
davinci.theme.dojoThemeSets =  { 
        "version": "1.7",
        "specVersion": "0.8",
        "helper": "davinci.libraries.dojo.dojox.mobile.ThemeHelper",
        "themeSets": [
            {
                "name": davinci.theme.desktop_default,
                "desktopTheme": "claro",
                "mobileTheme": davinci.theme.dojoMobileNone
            },
            {
                "name": davinci.theme.mobile_default,
                "desktopTheme": "claro",
                "mobileTheme": davinci.theme.dojoMobileDefault
            }
           
        ]
};



davinci.theme.getThemeSet = function(context){
    
    var returnThemeSet;
    var dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
    if (!dojoThemeSets){ 
        dojoThemeSets =  davinci.theme.dojoThemeSets;
        // set the defaults
        davinci.workbench.Preferences.savePreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(), dojoThemeSets);
    }
    // find the themeMap
    var htmlElement = context._srcDocument.getDocumentElement();
    var head = htmlElement.getChildElement("head");
    var scriptTags=head.getChildElements("script");
    var mobileTheme = davinci.theme.none_theme;
    dojo.forEach(scriptTags, function (scriptTag){
        var text=scriptTag.getElementText();
        var stop = 0;
        var start;
        if (text.length) {
            if (text.indexOf("dojo.require('dojox.mobile.deviceTheme');") && mobileTheme === davinci.theme.none_theme) {
                mobileTheme = davinci.theme.default_theme;
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

    var desktopTheme = context.getTheme();
    for (var s = 0; s < dojoThemeSets.themeSets.length; s++){
        var themeSet = dojoThemeSets.themeSets[s];
        if(themeSet.desktopTheme === desktopTheme.name){
            if ((mobileTheme == davinci.theme.none_theme) && (davinci.theme.themeSetEquals(themeSet.mobileTheme,davinci.theme.dojoMobileNone)) ){
                return themeSet;
            } else if ((mobileTheme == davinci.theme.default_theme) && (davinci.theme.themeSetEquals(themeSet.mobileTheme,davinci.theme.dojoMobileDefault))){
                return themeSet;
            }
            var mobileMap = dojo.toJson(davinci.theme.getDojoxMobileThemeMap(context, themeSet.mobileTheme)); //themeSet.mobileTheme;
            if (mobileMap == mobileTheme){
                // found themeMap
                return themeSet;
            }
        }
    }
    // themeSet not found Create one with gleaned information

    var newThemeSetName = 'myThemeSet';
    // make sure the name is unique
    var nameIndex = 0;
    for (var n = 0; n < dojoThemeSets.themeSets.length; n++){
        if (dojoThemeSets.themeSets[n].name == newThemeSetName){
            nameIndex++;
            newThemeSetName = 'myThemeSet_' + nameIndex;
            n = -1; // start search a first theme set with new name
        }
    }
    
    if (mobileTheme === davinci.theme.none_theme){
        mobileTheme =  dojo.toJson(davinci.theme.dojoMobileNone);
    } else  if (mobileTheme === davinci.theme.default_theme){
        mobileTheme =  dojo.toJson(davinci.theme.dojoMobileDefault);
    }
    themeSet =  {
            "name": newThemeSetName,
            "desktopTheme": desktopTheme.name,
            "mobileTheme": dojo.fromJson(mobileTheme)
        };  
    dojoThemeSets.themeSets.push(themeSet);
    davinci.workbench.Preferences.savePreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(), dojoThemeSets);
    return themeSet;
   
};

davinci.theme.getTheme = function(name){
    var themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly);
    for (var i = 0; i < themeData.length; i++){
        if(themeData[i].name === name){
            return themeData[i];
        }
    }
};

davinci.theme.getDojoxMobileThemeMap = function(context, mobileTheme){
    
    var themeMap = [];
    var other = [".*","iphone",[]]; // set default to ensure we have one
    for (var i =0; i < mobileTheme.length; i++){
        if(mobileTheme[i].theme != davinci.theme.none_theme && mobileTheme[i].theme != davinci.theme.default_theme){
            var theme = davinci.theme.getTheme(mobileTheme[i].theme);
            var ssPath = new davinci.model.Path(theme.file.parent.getPath()).append(theme.files[0]);
            var resourcePath = context.getFullResourcePath();
            var filename = ssPath.relativeTo(resourcePath, true).toString();
            if (mobileTheme[i].device === davinci.theme.other_device){
              other = ['.*',theme.base,[filename]];  
            } else {
                themeMap.push([mobileTheme[i].device,theme.base,[filename]]);
            }
        }
    }
    themeMap.push(other); // ensure the catch all is at the end.
    return themeMap;
};



davinci.theme.themeSetEquals = function (o1, o2) {
    //compares to objects to see if they are the same
    
    function countProperties(obj) {
        var count = 0;
        for (k in obj) {
            if (obj.hasOwnProperty(k)) {
                count++;
            }
        }
        return count;
    };
    
    if (typeof(o1) !== typeof(o2)) {
        return false;
    }

    if (typeof(o1) === "function") {
        return o1.toString() === o2.toString();
    }

    if (o1 instanceof Object && o2 instanceof Object) {
        if (countProperties(o1) !== countProperties(o2)) {
            return false;
        }
        var r = true;
        for (k in o1) {
            r = davinci.theme.themeSetEquals(o1[k], o2[k]);
            if (!r) {
                return false;
            }
        }
        return true;
    } else {
        return o1 === o2;
    }
};







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

	// FIXME: Why not do this instead?
	// var themeJson = dojo.mixin({}, originalTheme);
	// themeJson.className = selector;
	// themeJson.name = name;
	// themeJson.version = version || originalTheme.version;
	var themeJson = {
		className: selector,
		name: name,
		version: version || originalTheme.version, 
		specVersion: originalTheme.specVersion,
		files: originalTheme.files,
		meta: originalTheme.meta,
		themeEditorHtmls: originalTheme.themeEditorHtmls,
		useBodyFontBackgroundClass: originalTheme.useBodyFontBackgroundClass
	};

	if(originalTheme.helper){
	    themeJson.helper = originalTheme.helper; 
	}
	if(originalTheme.base){
        themeJson.base = originalTheme.base; 
    }
	if(originalTheme.type){
        themeJson.type = originalTheme.type; 
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
		// #1024 leave other classes on the body only replace the target
		var modelAttribute = element.getAttribute('class');
        if (!modelAttribute){
             modelAttribute = selector; 
        } else {
             modelAttribute = modelAttribute.replace(oldClass, selector);
        }
        element.setAttribute('class',modelAttribute); //#1024
        htmlFile.save();
	}
	davinci.library.themesChanged();
};

davinci.theme.getHelper = function(theme){
	if (!theme) { return; } 
    if (theme._helper){
        return theme._helper;
    }
    var helper = theme.helper;
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
davinci.theme.mobile_default = 'custom_default';
davinci.theme.default_theme = '(device-specific)'; //'default';
davinci.theme.none_themeset_name = '(none)';
davinci.theme.other_device = 'other';
davinci.theme.none_theme = 'none';
davinci.theme.dojoMobileDefault = [{"theme":"android","device":"Android"},{"theme":"blackberry","device":"BlackBerry"},{"theme":"ipad","device":"iPad"},{"theme":"iphone","device":"iPhone"},{"theme":"iphone","device":"other"}];
davinci.theme.dojoMobileCustom =  [{"theme":"custom","device":"Android"},{"theme":"custom","device":"BlackBerry"},{"theme":"custom","device":"iPad"},{"theme":"custom","device":"iPhone"},{"theme":"custom","device":"other"}];
davinci.theme.none_themeset = {
        "name": davinci.theme.none_themeset_name,
        "desktopTheme": "claro",
        "mobileTheme": davinci.theme.dojoMobileDefault
        };
davinci.theme.default_themeset = {
        "name": davinci.theme.desktop_default,
        "desktopTheme": "claro",
        "mobileTheme": davinci.theme.dojoMobileDefault
        };
davinci.theme.custom_themeset = {
        "name": davinci.theme.mobile_default,
        "desktopTheme": "claro",
        "mobileTheme": davinci.theme.dojoMobileCustom
        };
davinci.theme.dojoThemeSets =  { 
        "version": "1.7",
        "specVersion": "0.8",
        "helper": "davinci.libraries.dojo.dojox.mobile.ThemeHelper",
        "themeSets": [ 
               davinci.theme.custom_themeset           
        ]
};



davinci.theme.getThemeSet = function(context){
    
    var returnThemeSet;
    var dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
    if (!dojoThemeSets){ 
        dojoThemeSets =  davinci.theme.dojoThemeSets;
        // set the defaults
    //    davinci.workbench.Preferences.savePreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(), dojoThemeSets);
    }
    dojoThemeSets = dojo.clone(dojoThemeSets); // don't want to add to the real setting object
    // find the themeMap
    var htmlElement = context._srcDocument.getDocumentElement();
    var head = htmlElement.getChildElement("head");
    var scriptTags=head.getChildElements("script");
    var mobileTheme = dojo.toJson(davinci.theme.dojoMobileDefault); //davinci.theme.none_theme;
    dojo.forEach(scriptTags, function (scriptTag){
        var text=scriptTag.getElementText();
        var stop = 0;
        var start;
        if (text.length) {
            if (text.indexOf("dojo.require('dojox.mobile.deviceTheme');")/* && mobileTheme === davinci.theme.none_theme*/) {
                mobileTheme = dojo.toJson(davinci.theme.dojoMobileDefault); //davinci.theme.default_theme;
            }
            // Look for a dojox.mobile.themeMap in the document, if found set the themeMap
            while ((start = text.indexOf('dojoxMobile.themeMap', stop)) > -1 ){ // might be more than one.
                var stop = text.indexOf(';', start);
                if (stop > start){
                    mobileTheme = text.substring(start + 'dojoxMobile.themeMap'.length + 1, stop);
                    mobileTheme = dojo.toJson(davinci.theme.getDojoxMobileThemesFromThemeMap (context, mobileTheme));
                }
            }
       }
    });

    var desktopTheme = context.getTheme();
    for (var s = 0; s < dojoThemeSets.themeSets.length; s++){
        var themeSet = dojoThemeSets.themeSets[s];
        if(themeSet.desktopTheme === desktopTheme.name){
            if ((mobileTheme == davinci.theme.none_theme) && (davinci.theme.themeSetEquals(themeSet.mobileTheme,davinci.theme.dojoMobileCustom)) ){
                debugger; // why?
                return themeSet;
            }
            if (davinci.theme.themeSetEquals(dojo.fromJson(mobileTheme),themeSet.mobileTheme)){
                // found themeMap
                return themeSet;
            }
        }
    }
    
      
    var newThemeSetName = davinci.theme.none_themeset_name
    
    if (mobileTheme === davinci.theme.none_theme){
        mobileTheme = dojo.toJson(davinci.theme.dojoMobileDefault); 
    } else  if (mobileTheme === davinci.theme.default_theme){
        mobileTheme =  dojo.toJson(davinci.theme.dojoMobileDefault);
    }
    themeSet =  {
            "name": newThemeSetName,
            "desktopTheme": desktopTheme.name,
            "mobileTheme": dojo.fromJson(mobileTheme)
        };  
    dojoThemeSets.themeSets.push(themeSet);
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
            if (theme){ // user may have deleted theme
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
    }
    themeMap.push(other); // ensure the catch all is at the end.
    return themeMap;
};

davinci.theme.getDojoxMobileThemesFromThemeMap = function(context, themeMap){
    
    var themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly, true);
    var map = dojo.fromJson(themeMap);
    var mobileTheme = [];
    map.forEach(function(item, idx, arr) {
        for (var i = 0; i < themeData.length; i++){
            var theme = themeData[i];
            var ssPath = new davinci.model.Path(theme.file.parent.getPath()).append(theme.files[0]);
            var resourcePath = context.getFullResourcePath();
            var filename = ssPath.relativeTo(resourcePath, true).toString();
            if (filename == item[2][0]){
                var o = {};
                o.device = item[0];
                o.theme = theme.name;
                if (o.device === '.*') {
                    o.device = 'other';
                }
                mobileTheme.push(o);
                break;
            }
        }
        
    }, this);
    
   return mobileTheme;
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


davinci.theme.singleMobileTheme = function (themeSet) {
    //returns true if all mobile device use the same theme
    var themeName = themeSet.mobileTheme[0].theme;
    for (var i = 1; i < themeSet.mobileTheme.length; i++) {
        if (themeSet.mobileTheme[i].theme != themeName) {
            return false;
        }
    }
    return true;
   
};





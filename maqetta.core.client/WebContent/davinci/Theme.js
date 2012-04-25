define([
    	"dojo/_base/declare",
    	"dojo/DeferredList",
    	"./Workbench",
    	"./library",
    	"./workbench/Preferences",
    	"./model/Path",
    	"./html/HTMLFile",
    	"./model/Factory",
    	"system/resource"
], function(declare, DeferredList, Workbench, Library, Preferences, Path, HTMLFile, Factory, systemResource) {

	var Theme = {
		TEMP_CLONE_PRE: "clone_",
		desktop_default : 'desktop_default',
		mobile_default : 'custom_default',
		default_theme : '(device-specific)', //'default';
		none_themeset_name : '(none)',
		other_device : 'other',
		none_theme : 'none',
		dojoMobileDefault: [
			{
				"theme": "android",
				"device": "Android"
			}, {
				"theme": "blackberry",
				"device": "BlackBerry"
			}, {
				"theme": "ipad",
				"device": "iPad"
			}, {
				"theme": "iphone",
				"device": "iPhone"
			}, {
				"theme": "iphone",
				"device": "other"
			}
		],
		dojoMobileCustom: [
			{
				"theme": "custom",
				"device": "Android"
			}, {
				"theme": "custom",
				"device": "BlackBerry"
			}, {
				"theme": "custom",
				"device": "iPad"
			}, {
				"theme": "custom",
				"device": "iPhone"
			}, {
				"theme": "custom",
				"device": "other"
			}
		],
		

	isThemeHTML: function(resource){
		return resource.getName().indexOf("dojo-theme-editor.html") > -1;
	},

	CloneTheme: function(name, version, selector, directory, originalTheme, renameFiles ){
	    
		var deferreds = [];
		var fileBase = originalTheme.file.parent;
		var themeRootPath = new Path(directory).removeLastSegments(0);
		var resource = systemResource.findResource(themeRootPath.toString());
		if (resource.readOnly()) {
			resource.createResource();
		}
		systemResource.copy(fileBase, directory, true);
		var themeRoot = systemResource.findResource(directory);
		var fileName = originalTheme.file.getName();
		/* remove the copied theme */
		var sameName = (name==originalTheme.name);
		var themeFile = null;
		if(!sameName){
			var badTheme = systemResource.findResource(directory + "/" + fileName);
			badTheme.deleteResource();
		}
		var directoryPath = new Path(themeRoot.getPath());
		var lastSeg = directoryPath.lastSegment();
		/* create the .theme file */
		if (!sameName) {
			themeFile = themeRoot.createResource(lastSeg + ".theme");
		} else{
			themeFile = systemResource.findResource(directory + "/" + fileName);
		}
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
		for (var i = 0, len = themeJson.files.length; i < len; i++) {
			var fileUrl = directoryPath.append(themeJson.files[i]);
			var resource = systemResource.findResource(fileUrl);
			if(!sameName && renameFiles && resource.getName().indexOf(oldClass) > -1){
				var newName = resource.getName().replace(oldClass, selector);
				resource.rename(this.TEMP_CLONE_PRE+newName); // for caching reasons rename to temp file name, will rename later
				themeJson.files[i] =newName;
			}
			var cssModel = Factory.getModel({url:resource.getPath(),
				includeImports: true,
				loader:function(url){
					var r1=  systemResource.findResource(url);
					return r1.getText();
				}
			});
			toSave[cssModel.url] = cssModel;
			var elements = cssModel.find({elementType: 'CSSSelector', cls: oldClass});
			for(var i=0;i<elements.length;i++){
				elements[i].cls = selector;
				if(elements[i].parent.parent.url){
					toSave[elements[i].parent.parent.url] = elements[i].parent.parent;
				}

			}
		}
		deferreds.push(themeFile.setContents(JSON.stringify(themeJson)));
		/* re-write metadata */
		var metaToRename = {};
		for (var i = 0, len = themeJson.meta.length; i < len; i++) {
			var fileUrl = directoryPath.append(themeJson.meta[i]);
			var file = systemResource.findResource(fileUrl.toString());
			file.rename(this.TEMP_CLONE_PRE+file.name); // for caching reasons rename to temp file name, will rename later
			metaToRename[file.getURL()] = file;
			var contents = file.getText();
			var newContents = contents.replace(new RegExp(oldClass, "g"), selector);
			deferreds.push(file.setContents(newContents));
			
		}
		/* rewrite theme editor HTML */
		for (var i = 0, len = themeJson.themeEditorHtmls.length; i < len; i++) {
			var fileUrl = directoryPath.append(themeJson.themeEditorHtmls[i]);
			var file = systemResource.findResource(fileUrl.toString());
			var contents = file.getText();
			var htmlFile = new HTMLFile(fileUrl);
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
	        deferreds.push(htmlFile.save());
		}
		for(var name in toSave){
		    deferreds.push(toSave[name].save());
		}
	    var defs = new DeferredList(deferreds);
		Library.themesChanged();
		defs.toRename = { cssFiles: toSave, metaFile: metaToRename}; // need to save the cssFiles to rename from temp name after saves are done, in postClone
		return defs;
	},
	
	postClone: function(filesToRename){
		// We have to rename the css files to the correct name, this is to trick the browser cache
		var deferreds = [];
		var files = filesToRename.cssFiles;
		for(var name in files){
			var r = files[name];
			var f = r.getResource();
			var name = f.name.replace(this.TEMP_CLONE_PRE, "");
			if (f.name != name) {
				f.rename(name);
				var cssModel = Factory.getModel({url:f.getPath(),
					includeImports: true,
					loader:function(url){
						var r1=  systemResource.findResource(url);
						return r1.getText();
					}
				});
				deferreds.push(cssModel.save());
			}
		}
		files = filesToRename.metaFile;
		for(var name in files){
			var f = files[name];
			var name = f.name.replace(this.TEMP_CLONE_PRE, "");
			if (f.name != name){
				f.rename(name);
				var contents = f.getText();
				deferreds.push(f.setContents(contents));
			}
		}
		return  new DeferredList(deferreds);
	},

	getHelper: function(theme){
		if (!theme) { return; } 
	    if (theme._helper){
	        return theme._helper;
	    }
	    var helper = theme.helper;
	    if (helper) {
			require([helper], function(module) {
				helper = module;
			});
			return helper;
	        }
	},

	getThemeSet: function(context) {
	    var dojoThemeSets = Preferences.getPreferences("maqetta.dojo.themesets", Workbench.getProject()),
	    	mobileTheme = this.dojoMobileDefault,
	    	themeSet;
	    if (!dojoThemeSets){ 
	        dojoThemeSets =  this.dojoThemeSets;
	    }
	    dojoThemeSets = dojo.clone(dojoThemeSets); // don't want to add to the real setting object

	    if (context) {
	        // find the themeMap
	        var djConfig = context._getDojoJsElem().getAttribute('data-dojo-config');
	        if (djConfig) {
		        djConfig = eval("({ " + djConfig + " })");
		        if (djConfig.themeMap) {
			        mobileTheme = Theme.getDojoxMobileThemesFromThemeMap(context, djConfig.themeMap);
			    }
	        }

	        var desktopTheme = context.getTheme();
	        for (var s = 0, len = dojoThemeSets.themeSets.length; s < len; s++) {
	            themeSet = dojoThemeSets.themeSets[s];
	            if (themeSet.desktopTheme === desktopTheme.name) {
	                if (this.themeSetEquals(mobileTheme, themeSet.mobileTheme)) {
	                    // found themeMap
	                    return themeSet;
	                }
	            }
	        }
	    }

	    var newThemeSetName = this.none_themeset_name;
	    themeSet =  {
            name: newThemeSetName,
            desktopTheme: context ? desktopTheme.name : 'claro',
            mobileTheme: mobileTheme
        };
	    dojoThemeSets.themeSets.push(themeSet);
	    return themeSet;
	},
	
	getTheme:  function(name){
	    var themeData = Library.getThemes(Workbench.getProject(), this.workspaceOnly);
	    for (var i = 0; i < themeData.length; i++){
	        if(themeData[i].name === name){
	            return themeData[i];
	        }
	    }
	},
	
	getThemeByCssFile:  function(cssFile){

		var themeData = Library.getThemes(Workbench.getProject(), this.workspaceOnly);
    	var targetFile = cssFile.getResource().getPath(); // target
	    for (var i = 0; i < themeData.length; i++){
	    	var themeFile = themeData[i].file;
	    	var path = themeFile.getParentFolder().getPath();// theme path
	    	for (var x = 0; x < themeData[i].files.length; x++){
	    		var checkFile = path + "/" + themeData[i].files[x];
	    		if(checkFile === targetFile){
	    			// this cssFile belongs to this theme
		            return themeData[i];
		        }
	    	}
	        
	    }
	    return null; // not found
	},

	getDojoxMobileThemeMap: function(context, mobileTheme){
	    
	    var themeMap = [];
	    var other = [".*","iphone",[]]; // set default to ensure we have one
	    for (var i =0; i < mobileTheme.length; i++){
	        if(mobileTheme[i].theme != this.none_theme && mobileTheme[i].theme != this.default_theme){
	            var theme = this.getTheme(mobileTheme[i].theme);
	            if (theme){ // user may have deleted theme
	                var ssPath = new Path(theme.file.parent.getPath()).append(theme.files[0]);
	                var resourcePath = context.getFullResourcePath();
	                var filename = ssPath.relativeTo(resourcePath, true).toString();
	                if (mobileTheme[i].device === this.other_device){
	                  other = ['.*',theme.base,[filename]];  
	                } else {
	                    themeMap.push([mobileTheme[i].device,theme.base,[filename]]);
	                }
	            }
	        }
	    }
	    themeMap.push(other); // ensure the catch all is at the end.
	    return themeMap;
	},

	getDojoxMobileThemesFromThemeMap: function(context, themeMap) {
	    var themeData = Library.getThemes(Workbench.getProject(), this.workspaceOnly, true);
	    var mobileTheme = [];
	    themeMap.forEach(function(item, idx, arr) {
	        for (var i = 0; i < themeData.length; i++){
	            var theme = themeData[i];
	            var ssPath = new Path(theme.file.parent.getPath()).append(theme.files[0]);
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
	},

	themeSetEquals: function (o1, o2) {
	    //compares to objects to see if they are the same
	    
	    function countProperties(obj) {
	        var count = 0;
	        for (var k in obj) {
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
	        for (var k in o1) {
	            r = this.themeSetEquals(o1[k], o2[k]);
	            if (!r) {
	                return false;
	            }
	        }
	        return true;
	    } else {
	        return o1 === o2;
	    }
	},

	singleMobileTheme: function (themeSet) {
	    //returns true if all mobile device use the same theme
	    var themeName = themeSet.mobileTheme[0].theme;
	    for (var i = 1; i < themeSet.mobileTheme.length; i++) {
	        if (themeSet.mobileTheme[i].theme != themeName) {
	            return false;
	        }
	    }
	    return true;
	   
	}
};

	
// Initialize the object
Theme.none_themeset = {
        "name": Theme.none_themeset_name,
        "desktopTheme": "claro",
        "mobileTheme": dojo.clone(Theme.dojoMobileDefault) 
};
Theme.default_themeset = {
        "name": Theme.desktop_default,
        "desktopTheme": "claro",
        "mobileTheme": dojo.clone(Theme.dojoMobileDefault) 
};
Theme.custom_themeset = {
        "name": Theme.mobile_default,
        "desktopTheme": "claro",
        "mobileTheme": Theme.dojoMobileCustom
};
// XXX This should be moved to Dojo library metadata.
Theme.dojoThemeSets =  { 
        "version": "1.7",
        "specVersion": "0.8",
        "helper": "maq-metadata-dojo-1.7/dojox/mobile/ThemeHelper",
        "themeSets": [ 
               Theme.custom_themeset           
        ]
};

return Theme;
});


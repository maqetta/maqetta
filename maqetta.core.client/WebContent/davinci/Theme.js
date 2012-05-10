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
		systemResource.createResource(directory, true);
		var themeRoot = systemResource.findResource(directory);
		var fileName = originalTheme.file.getName();
		var directoryPath = new Path(themeRoot.getPath());
		var lastSeg = directoryPath.lastSegment();
		/* create the .theme file */
		themeFile = themeRoot.createResource(lastSeg + ".theme");
		themeCssFile = themeRoot.createResource(lastSeg + ".css"); // create the delta css file
		var themePath = this.getThemeLocation();
		var orgPath = originalTheme.file.parent.getPath();
		
		function adjustPaths(fileNames){
			// #23 adjust for path to where file in relation to the new theme is located
			var ret = [];
			fileNames.forEach(function(fileName){
				var file = systemResource.findResource(orgPath + "/" + fileName);
				var filePath = new Path(file);
				var relFilePath = filePath.relativeTo(themePath, true);
				var relativePath = '../';
				var folder = filePath.segments.parent; 
				for (var i = 0; i < relFilePath.segments.length; i++){
					if (relFilePath.segments[i] == '..'){
						relativePath = relativePath + folder.name;
						folder = folder.parent;
					}
				}
				ret.push(relativePath+'/'+fileName);
			});
			return ret;
		};
		
		var themeEditorHtmls = adjustPaths(originalTheme.themeEditorHtmls); // adjust the path of the html files
		var meta = adjustPaths(originalTheme.meta); // adjust the path of the meta files
		var importFiles = adjustPaths(originalTheme.files); // adjust the path of the css files
		var imports = ' ';
		// now add the css files from the old theme to the delta css file as imports
		importFiles.forEach(function(fileName){
			imports = imports + '@import url("' +fileName+'");'; 
		});
		var themeJson = {
			className: originalTheme.className, // #23 selector,
			name: name,
			version: version || originalTheme.version, 
			specVersion: originalTheme.specVersion,
			files: [''+lastSeg+'.css'], // #23 only add the delta css
			meta: meta,  
			themeEditorHtmls: themeEditorHtmls, 
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
		deferreds.push(themeFile.setContents(JSON.stringify(themeJson)));
		deferreds.push(themeCssFile.setContents(imports));
		var defs = new DeferredList(deferreds);
		return defs;
	},
	
	getHelper: function(theme){
		if (!theme) { return; } 
	    if (theme.helper && typeof(theme.helper) != 'string'){
	        return theme.helper;
	    }
	    var helper = theme.helper;
	    if (helper) {
	    	var deferred = new dojo.Deferred();
			require([helper], function(module) {
				helper = module;
				deferred.resolve({helper: helper});
			});
			//return helper;
			return deferred;
	        }
	},

	getThemeSet: function(context) {
	    var dojoThemeSets = Preferences.getPreferences("maqetta.dojo.themesets", Workbench.getProject()),
	    	mobileTheme = dojo.clone(this.dojoMobileDefault),
	    	themeSet;
	    if (!dojoThemeSets){ 
	        dojoThemeSets =  this.dojoThemeSets;
	    }
	    dojoThemeSets = dojo.clone(dojoThemeSets); // don't want to add to the real setting object

	    if (context) {
	        // find the themeMap
	        var djConfig = context._getDojoJsElem().getAttribute('data-dojo-config');
	        if (djConfig) {
		        djConfig = require.eval("({ " + djConfig + " })", "data-dojo-config");
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

	    themeSet =  {
            name: this.none_themeset_name,
            desktopTheme: context ? desktopTheme.name : 'claro',
            mobileTheme: mobileTheme
        };
	    dojoThemeSets.themeSets.push(themeSet);
	    return themeSet;
	},
	
	/*
	 * @return the project for the target theme.
	 */
	getBase : function(){
		if(Workbench.singleProjectMode()){
			return Workbench.getProject();
		}
	},
	
	getThemeLocation : function(){
		
		
		var base = this.getBase();
		var prefs = Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
		
		var projectThemeBase = (new Path(base).append(prefs['themeFolder']));
		
		return  projectThemeBase;
	},
	
	getTheme:  function(name, flushCache){
	    var themeData = Library.getThemes(Workbench.getProject(), this.workspaceOnly, flushCache);
	    for (var i = 0; i < themeData.length; i++){
	        if(themeData[i] && themeData[i].name === name){
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


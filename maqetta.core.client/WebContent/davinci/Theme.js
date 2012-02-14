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

	CloneTheme: function(name, version, selector, directory, originalTheme, renameFiles){
	    
		var deferreds = [];
		var fileBase = originalTheme.file.parent;
		var themeRootPath = new Path(directory).removeLastSegments(0);
		return systemResource.findResource(themeRootPath.toString()).then(function(resource){
			
			if (resource.readOnly()) {
				resource.createResource();
			}
			return systemResource.copy(fileBase, directory, true).then(function(){
				return systemResource.findResource(directory).then(function(themeRoot){
					var fileName = originalTheme.file.getName();
					/* remove the copied theme */
					var sameName = (name==originalTheme.name);
					var themeFilePromise = null;
					if(!sameName){
						systemResource.findResource(directory + "/" + fileName).then(function(badTheme){
							badTheme.deleteResource();
						});
						
					}
					var directoryPath = new Path(themeRoot.getPath());
					var lastSeg = directoryPath.lastSegment();
					/* create the .theme file */
					if (!sameName) {
						themeFilePromise = themeRoot.createResource(lastSeg + ".theme");
					} else{
						themeFilePromise = systemResource.findResource(directory + "/" + fileName);
					}
					return themeFilePromise.then(function(themeFile){
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
							var cssDefs = [];
							/* re-write CSS Selectors */
							for (var i = 0, len = themeJson.files.length; i < len; i++) {
								var fileUrl = directoryPath.append(themeJson.files[i]);
								cssDefs.push(systemResource.findResource(fileUrl).then(function(resource){
									if(!sameName && renameFiles && resource.getName().indexOf(oldClass) > -1){
										var newName = resource.getName().replace(oldClass, selector);
										resource.rename(newName);
										themeJson.files[i] =newName;
									}
									var cssModel = Factory.getModel({url:resource.getPath(),
										includeImports: true,
										loader:function(url){
											return systemResource.findResource(url).then(function(r1){
												return r1.getText();
											});
											
										}
									});
									
									return cssModel.loaded.then(function(){
										var elements = cssModel.find({elementType: 'CSSSelector', cls: oldClass});
										for(var i=0;i<elements.length;i++){
											elements[i].cls = selector;
											var file = elements[i].getCSSFile();
											toSave[file.url] = file;
											
										}
									});
									
									
								}));
								
							}
							
							var cssPromise = new dojo.DeferredList(cssDefs);
							return cssPromise.then(function(){
								
								deferreds.push(themeFile.setContents(dojo.toJson(themeJson)));
								for(var name in toSave){
								    deferreds.push(toSave[name].save());
								}
								/* re-write metadata */
								for (var i = 0, len = themeJson.meta.length; i < len; i++) {
									var fileUrl = directoryPath.append(themeJson.meta[i]);
									deferreds.push(systemResource.findResource(fileUrl.toString()).then(function(file){
										var contents = file.getText();
										var newContents = contents.replace(new RegExp(oldClass, "g"), selector);
										return file.setContents(newContents);
									}));
									
									
								}
								/* rewrite theme editor HTML */
								for (var i = 0, len = themeJson.themeEditorHtmls.length; i < len; i++) {
									
									var fileUrl = directoryPath.append(themeJson.themeEditorHtmls[i]);
									 deferreds.push(systemResource.findResource(fileUrl.toString()).then(function(file){
										
										var contents = file.getText();
										var htmlFile = new HTMLFile(fileUrl);
										htmlFile.setText(contents,true);
										return htmlFile.loaded.then(function(loadedModel){
											
											var element =  loadedModel.find({elementType: 'HTMLElement', tag: 'body'}, true);
											// #1024 leave other classes on the body only replace the target
											var modelAttribute = element.getAttribute('class');
									        if (!modelAttribute){
									             modelAttribute = selector; 
									        } else {
									             modelAttribute = modelAttribute.replace(oldClass, selector);
									        }
									        element.setAttribute('class',modelAttribute); //#1024
									        return loadedModel.save();

										});
									 }));
									
								}
								
							    var defs = new DeferredList(deferreds);
								defs.then(Library.themesChanged());
								return defs;
							});
					});
					
				});
				

			})
			
		});
		

		
		deferreds.push(themeFile.setContents(JSON.stringify(themeJson)));
		for(var name in toSave){
		    deferreds.push(toSave[name].save());
		}
		/* re-write metadata */
		for (var i = 0, len = themeJson.meta.length; i < len; i++) {
			var fileUrl = directoryPath.append(themeJson.meta[i]);
			var file = systemResource.findResource(fileUrl.toString());
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
	    var defs = new DeferredList(deferreds);
		Library.themesChanged();
		return defs;

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

	getThemeSet: function(context){
	    
	    var returnThemeSet;
	    var dojoThemeSets = Preferences.getPreferences("maqetta.dojo.themesets", Workbench.getProject());
	    if (!dojoThemeSets){ 
	        dojoThemeSets =  this.dojoThemeSets;
	    }
	    dojoThemeSets = dojo.clone(dojoThemeSets); // don't want to add to the real setting object
	    if (context){
	        // find the themeMap
	        var htmlElement = context._srcDocument.getDocumentElement();
	        var head = htmlElement.getChildElement("head");
	        var scriptTags=head.getChildElements("script");
	        var mobileTheme = dojo.toJson(this.dojoMobileDefault); //davinci.theme.none_theme;
	        dojo.forEach(scriptTags, function (scriptTag){
	            var text=scriptTag.getElementText();
	            var stop = 0;
	            var start;
	            if (text.length) {
	                if (text.indexOf("dojo.require('dojox.mobile.deviceTheme');")/* && mobileTheme === davinci.theme.none_theme*/) {
	                    mobileTheme = dojo.toJson(this.dojoMobileDefault); //davinci.theme.default_theme;
	                }
	                // Look for a dojox.mobile.themeMap in the document, if found set the themeMap
	                while ((start = text.indexOf('dojoxMobile.themeMap', stop)) > -1 ){ // might be more than one.
	                    var stop = text.indexOf(';', start);
	                    if (stop > start){
	                        mobileTheme = text.substring(start + 'dojoxMobile.themeMap'.length + 1, stop);
	                        mobileTheme = dojo.toJson(Theme.getDojoxMobileThemesFromThemeMap (context, mobileTheme));
	                    }
	                }
	           }
	        });
	    
	        var desktopTheme = context.getTheme();
	        for (var s = 0; s < dojoThemeSets.themeSets.length; s++){
	            var themeSet = dojoThemeSets.themeSets[s];
	            if(themeSet.desktopTheme === desktopTheme.name){
	                if (this.themeSetEquals(dojo.fromJson(mobileTheme),themeSet.mobileTheme)){
	                    // found themeMap
	                    return themeSet;
	                }
	            }
	        }
	    
	    }  // no theme map or context
	    var newThemeSetName = this.none_themeset_name;
	    if (!mobileTheme || mobileTheme === this.none_theme){
	        mobileTheme = dojo.toJson(this.dojoMobileDefault); 
	    } else  if (mobileTheme === this.default_theme){
	        mobileTheme =  dojo.toJson(this.dojoMobileDefault);
	    }
	    themeSet =  {
	            "name": newThemeSetName,
	            "desktopTheme": context ? desktopTheme.name : 'claro',
	            "mobileTheme": context ? dojo.fromJson(mobileTheme) : dojo.clone(this.dojoMobileDefault)
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

	getDojoxMobileThemesFromThemeMap: function(context, themeMap){
	    
	    var themeData = Library.getThemes(Workbench.getProject(), this.workspaceOnly, true);
	    var map = dojo.fromJson(themeMap);
	    var mobileTheme = [];
	    map.forEach(function(item, idx, arr) {
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


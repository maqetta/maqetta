dojo.provide("davinci.ve.commands.ChangeThemeCommand");


dojo.declare("davinci.ve.commands.ChangeThemeCommand", null, {

    name: "changeTheme",

    constructor: function(newTheme, context){
        this._newTheme = newTheme;
        this._context = context;
        this._oldTheme  = davinci.theme.getThemeSet(this._context);
        if (!this._oldTheme){ 
            this._oldTheme = davinci.theme.dojoThemeSets.themeSets[0]; // default;
        }
    },

    execute: function(){
        this._changeTheme(this._newTheme, this._oldTheme);

    },

    undo: function(){
        this._changeTheme(this._oldTheme, this._newTheme);
    },
    
    _changeTheme: function(newThemeInfo, oldTheme){
        if (!oldTheme.desktopTheme){ // not a themeSet
            this.removeTheme(oldTheme);
        } else {
            this.removeThemeSet(oldTheme);
        }
        if (!newThemeInfo.desktopTheme){ // not a themeSet
            this.addTheme(newThemeInfo);
        } else {
            this.addThemeSet(newThemeInfo);
        }
        var text = this._context.getModel().getText();
        var e = davinci.Workbench.getOpenEditor();
        e.setContent(e.fileName,text); // force regen of HTML Model to load new theme
     // Recompute styling properties in case we aren't in Normal state
        davinci.ve.states.resetState(this._context.rootWidget);
    },
    
        
    removeTheme: function(oldTheme){
        var helper = davinci.theme.getHelper(oldTheme);
        if (helper && helper.removeTheme){
          helper.removeTheme(this._context, oldTheme);  
        } else {
            var modelDoc = this._context.getModel().getDocumentElement(); 
           var modelHead = modelDoc.getChildElement('head');
           var modelBody = modelDoc.getChildElement('body');
            
           var header = dojo.clone( this._context.getHeader());
           // var resourcePath = this._context.getFullResourcePath();
            // find the old theme file name
            function sameSheet(headerSheet, file){
                return (headerSheet.indexOf(file) > -1);
            }
            
            var files = oldTheme.files;
            
            for (var x=0; x<files.length; x++){
                var filename = files[x];
                for (var y=0; y<header.styleSheets.length; y++){
                    
                    if(sameSheet(header.styleSheets[y], filename)){
                        // found the sheet to change
                            
                        var modelAttribute = modelBody.getAttribute('class');
                        if (modelAttribute){
                            modelAttribute = modelAttribute.replace(oldTheme.className,'');
                            header.bodyClasses = modelAttribute; // seems to have changed to this
                            modelBody.removeAttribute('class');
                            if (modelAttribute.length > 0){
                                modelBody.addAttribute('class',modelAttribute, false);
                            }
                        }
                       
                        this._context.setHeader(header);
                        var importElements = modelHead.find({elementType:'CSSImport'});
                        
                        for(var i=0;i<importElements.length;i++){
                            if(sameSheet(importElements[i].url, filename)){
                                importElements[i].url = 'x';
                                importElements[i].parent.removeChild(importElements[i]);
                                delete importElements[i];
                                break;
                            }
                        }   

                    }
                }

            }
        }    
          
    },
    
    addTheme: function(newThemeInfo){
        var helper = davinci.theme.getHelper(newThemeInfo);
        if (helper && helper.addTheme){
          helper.addTheme(this._context, newThemeInfo);  
        } else {
            var modelDoc = this._context.getModel().getDocumentElement(); 
            var modelHead = modelDoc.getChildElement('head');
            var modelBody = modelDoc.getChildElement('body');
            
            var header = dojo.clone( this._context.getHeader());
            var resourcePath = this._context.getFullResourcePath();
          
           
            var ssPath = new davinci.model.Path(newThemeInfo.file.parent.getPath()).append(newThemeInfo.files[0]);
            newFilename = ssPath.relativeTo(resourcePath, true);
            header.styleSheets[header.styleSheets.length] = newFilename;
            
            var modelAttribute = modelBody.getAttribute('class');
            if (!modelAttribute){
                modelAttribute = ' '; 
            } 
            modelAttribute = modelAttribute + ' '+newThemeInfo.className;
            modelAttribute = modelAttribute.trim();
            header.bodyClasses = modelAttribute;
            modelBody.removeAttribute('class');
            modelBody.addAttribute('class',modelAttribute, false);
            this._context.setHeader(header);
            var style = modelHead.getChildElement('style');
            if (!style) {
                style = new davinci.html.HTMLElement('style');
                modelHead.addChild(style);
            }
            var css = new davinci.html.CSSImport();
            css.url = newFilename.toString();
            style.addChild(css,0);
        }
        
    },
    
    removeThemeSet: function(themeSet){
        
        var themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly, true);
        // remove the desktop theme
        if (themeSet.desktopTheme){
            for (var i = 0; i < themeData.length; i++){
                if (themeData[i].name === themeSet.desktopTheme){
                    this.removeTheme(themeData[i]);
                }
            }
        }
        // remove the mobile theme
        if (themeSet.mobileTheme && (!davinci.theme.themeSetEquals(themeSet.mobileTheme,davinci.theme.dojoMobileDefault))){
            this._dojoxMobileRemoveTheme(this._context);
        }
        
    },
    
    addThemeSet: function(themeSet){
        var themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly, true);
        // add the desktop theme
        if (themeSet.desktopTheme){
            for (var i = 0; i < themeData.length; i++){
                if (themeData[i].name === themeSet.desktopTheme){
                    this.addTheme(themeData[i]);
                }
            }
        }
        // add the mobile theme
        if (themeSet.mobileTheme ){
            this._dojoxMobileAddTheme(this._context, themeSet.mobileTheme);
        }
    },
    
    _dojoxMobileRemoveTheme: function(context){
        // remove the dojox.mobile.themeMap
        var htmlElement = context._srcDocument.getDocumentElement();
        var head = htmlElement.getChildElement("head");
        var scriptTags=head.getChildElements("script");
        dojo.forEach(scriptTags, function (scriptTag){
            var text=scriptTag.getElementText();
            var stop = 0;
            var start;
            if (text.length) {
                // Look for a dojox.mobile.themeMap in the document, if found set the themeMap
                while ((start = text.indexOf(',function(dojoxMobile){dojoxMobile.themeMap=', stop)) > -1 ){ // might be more than one.
                    var stop = text.indexOf('}', start);
                    if (stop > start){
                        text = text.substring(0,start) + text.substring(stop+1);
                      }
                }
                var script = new davinci.html.HTMLElement('script');
                script.addAttribute('type', 'text/javascript');
                script.script = "";
                head.insertBefore(script, scriptTag);
                var newScriptText = new davinci.html.HTMLText();
                newScriptText.setText(text); 
                script.addChild(newScriptText); 
                scriptTag.parent.removeChild(scriptTag);
             }
        }, this);
        var device = context.getMobileDevice() || 'none';
        var dm = context.getDojo().getObject("dojox.mobile", true);
        if (dm){
            var dj = context.getDojo();
            var url = dj.moduleUrl('dojox.mobile', 'themes/iphone/ipad.css');
            dm.themeMap=[["Android","android",[]],["BlackBerry","blackberry",[]],["iPad","iphone",[url]],["Custom","custom",[]],[".*","iphone",[]]]; // reset themeMap to default
            dm.loadDeviceTheme(device);
        }
        
    },
    
    _dojoxMobileAddTheme: function(context, theme){
        
        var htmlElement = context._srcDocument.getDocumentElement();
        var head = htmlElement.getChildElement("head");
        var scriptTags=head.getChildElements("script");
        if (davinci.theme.themeSetEquals(theme, davinci.theme.dojoMobileDefault)){
            var nothingToDo = true;
            dojo.forEach(scriptTags, function (scriptTag){
                var text=scriptTag.getElementText();
                if (text.length) {
                    if (text.indexOf('dojoxMobile.themeMap=') >-1) {
                        nothingToDo = false;
                    }
                }
            }, this);
            if (nothingToDo){
                return;
            }
        }
        // add the theme to the dojox.mobile.themeMap
        context.loadRequires("dojox.mobile.View", true); //  use this widget to get the correct requires added to the file.
        head = htmlElement.getChildElement("head");
        scriptTags=head.getChildElements("script");

        dojo.forEach(scriptTags, function (scriptTag){
            var text=scriptTag.getElementText();
            if (text.length) {
                // Look for a require('dojox.mobile'); in the document, if found set the themeMap 
                var start = text.indexOf('dojox/mobile');
                if (start > 0){
                    var stop = text.indexOf(']', start);
                    if (stop > start){
                        var themeMap;
                        if (theme){
                            themeMap = theme;
                            if (davinci.theme.themeSetEquals(themeMap, davinci.theme.dojoMobileDefault)){
                                themeMap = null;
                            } else {
                               themeMap = dojo.toJson(davinci.theme.getDojoxMobileThemeMap(context, theme));
                               themeMap = text.substring(0,stop+1) + ',function(dojoxMobile){dojoxMobile.themeMap='+themeMap+';}' + text.substring(stop+1);
                            }
                        }
                        if(themeMap){
                            // create a new script element
                            var script = new davinci.html.HTMLElement('script');
                            script.addAttribute('type', 'text/javascript');
                            script.script = "";
                            head.insertBefore(script, scriptTag);
                            var newScriptText = new davinci.html.HTMLText();
                            newScriptText.setText(themeMap); 
                            script.addChild(newScriptText); 
                            scriptTag.parent.removeChild(scriptTag);
                        }
                        
                    }
                }
             }
        }, this);
        var device = context.getMobileDevice() || 'none';
        var dm = context.getDojo().getObject("dojox.mobile", true);
        dm.loadDeviceTheme(device);
                 
            

    },
    
  

});


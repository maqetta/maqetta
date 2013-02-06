define([
	"dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/query",
	"davinci/Theme",
	"davinci/Workbench",
	"davinci/library",
	"davinci/html/CSSImport",
	"davinci/html/HTMLElement",
	"davinci/html/HTMLText",
	"preview/silhouetteiframe",
	"davinci/model/Factory", 
], function(
    declare,
    lang,
    query,
    Theme,
    Workbench,
    Library,
    CSSImport,
    HTMLElement,
    HTMLText,
    silhouetteiframe,
    Factory
) {

return declare("davinci.ve.commands.ChangeThemeCommand", null, {
    name: "changeTheme",

    constructor: function(newTheme, context){
        this._newTheme = newTheme;
        this._context = context;
        this._oldTheme  = Theme.getThemeSet(this._context);
        if (!this._oldTheme){
            this._oldTheme = Theme.dojoThemeSets.themeSets[0]; // default;
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
        var context = this._context,
            editor = context.editor,
            text = context.getModel().getText();
        editor.setContent(editor.fileName, text);
        context.widgetAddedOrDeleted(true);
        context._configDojoxMobile();
        var device = context.getMobileDevice() || 'none';
        if (device != 'none'){
            device = silhouetteiframe.themeMap[device+'.svg'];
        }
        var dm = lang.getObject('dojox.mobile', true, context.getGlobal());
        if (dm && dm.loadDeviceTheme) {
        	dm.loadDeviceTheme(device);
        }
        window.setTimeout(function(){
        	// after changing the theme we have to let the browser settle a minute and then
        	// force a redraw of widgets to get the UI looking pretty..
        	this._context.resizeAllWidgets();
		}.bind(this), 50);
    },

    removeTheme: function(oldTheme){
        var helper = Theme.getHelper(oldTheme);
        if (helper && helper.removeTheme){
            helper.removeTheme(this._context, oldTheme);
        } else {
            var modelDoc = this._context.getModel().getDocumentElement(),
                modelHead = modelDoc.getChildElement('head'),
                modelBody = modelDoc.getChildElement('body'),
                header = dojo.clone(this._context.getHeader());

            // find the old theme file name
            function sameSheet(headerSheet, file){
                return (headerSheet.indexOf(file) > -1);
            }
            
            var files = oldTheme.files;
            if (oldTheme.conditionalFiles){
            	files = files.concat(oldTheme.conditionalFiles); // remove conditionals also
            }
            
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
                                var url = importElements[i].url,
                                    doc = this._context.getDocument();
                                importElements[i].url = 'x';
                                importElements[i].parent.removeChild(importElements[i]);
                                importElements[i].close(); // removes the instance from the Factory
                                query('link[href="' + url + '"]', doc).orphan();
                                this._context.theme = null;
                                break;
                            }
                        }
                    }
                }
            }
        }
    },
    
    addTheme: function(newThemeInfo){
        var helper = Theme.getHelper(newThemeInfo);
        if (helper && helper.addTheme){
          helper.addTheme(this._context, newThemeInfo);
        } else {
            var modelDoc = this._context.getModel().getDocumentElement();
            var modelHead = modelDoc.getChildElement('head');
            var modelBody = modelDoc.getChildElement('body');
            
            var header = dojo.clone( this._context.getHeader());
            var resourcePath = this._context.getFullResourcePath();
          
           
            var ssPath = new davinci.model.Path(newThemeInfo.getFile().parent.getPath()).append(newThemeInfo.files[0]);
            var newFileObj = ssPath.relativeTo(resourcePath, true);
            var newFileName = newFileObj.toString();
            header.styleSheets[header.styleSheets.length] = newFileName;
            
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
                style = new HTMLElement('style');
                modelHead.addChild(style);
            }
            var css = new CSSImport();
            css.url = newFileName;
			var cssFile = Factory.getModel({
				url: Theme.getBase()+'/'+css.url,
			    includeImports: true,
			});
			css.cssFile = cssFile; 
            style.addChild(css,0);
            this._context.theme = newThemeInfo;
        }
        
    },
    
    removeThemeSet: function(themeSet){
        
        var themeData = Library.getThemes(Workbench.getProject(), this.workspaceOnly);
        // remove the desktop theme
        if (themeSet.desktopTheme){
            for (var i = 0; i < themeData.length; i++){
                if (themeData[i].name === themeSet.desktopTheme){
                    this.removeTheme(themeData[i]);
                }
            }
        }
        // remove the mobile theme
        if (themeSet.mobileTheme && (!Theme.themeSetEquals(themeSet.mobileTheme,Theme.dojoMobileDefault))){
        	this._context.close(); //// return any singletons for CSSFiles
            this._dojoxMobileRemoveTheme(this._context);
        }
        
    },
    
    addThemeSet: function(themeSet){
        var themeData = Library.getThemes(Workbench.getProject(), this.workspaceOnly);
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

////////////////////////////////////////////////////////////////////////////////
// XXX move this section to Dojo library
    _dojoxMobileRemoveTheme: function(context) {
        // remove theme map from Dojo config attribute in model
        context._updateDojoConfig({
            themeMap: null,
            mblLoadCompatPattern: null,
            mblThemeFiles: null
        });
    },
   
    _dojoxMobileAddTheme: function(context, theme, newFile) {
    	/*  FIXME: this is comment out for firefox support
    	 * dojo mobile toolkit themes require the *-compat.css files to support not webkit
    	 * We have copied all the -moz-*, -o-* that the mobile themes use to the  to the device.css
    	 * (eg. iphone.css) that are in the maqetta/theme folder in the toolkit so that we have cross
    	 * browser support in the VE. dojo 2.0 is plaining to do the same thing so at that point we should
    	 * be able to remove theme from the device.css files in maqetta/themes and restore this code.
    	 * As we would not need a special map for stock themes.     
    	 *
    	 if (Theme.themeSetEquals(theme, Theme.dojoMobileDefault)) {
            // if setting default theme, remove theme if one exists
            this._dojoxMobileRemoveTheme(context);
            return;
        }
        */

        // set theme map in Dojo config attribute in model
        /*
		 * This is nasty, but djConfig.mblLoadCompatPattern is a regexp and if you attempt to 
		 * JSON.stringfy a regexp you get "{}" not very useful
		 * So we need to use a string 
		 */
        var themePath = Theme.getThemeLocation().toString().replace(/\//g,'\\/');
		// *-compat.css files not used in maqrtta var re = '/\\/'+themePath+'\\/.*\\.css$/';
		var re = '\'\'';
        context._updateDojoConfig({
            themeMap: Theme.getDojoxMobileThemeMap(context, theme),
            mblLoadCompatPattern: re,
            mblThemeFiles: []
        });
    }
// XXX end "move this section to Dojo library"
////////////////////////////////////////////////////////////////////////////////

});
});
define(["dojo/_base/declare",
				"dijit/_WidgetBase",
				"dijit/_TemplatedMixin",
				"dijit/_WidgetsInTemplateMixin",
        "davinci/library",
        "system/resource",
        "davinci/workbench/Preferences",
        "davinci/Runtime",
        "davinci/Workbench",
        "davinci/ve/commands/ChangeThemeCommand",
        "davinci/ui/Dialog",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dijit/form/Button",
        "dijit/form/Select",
        "davinci/Theme",
        "dojo/text!./templates/ThemeSetSelection.html",

    	
],function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,  Library, Resource,  Preferences, Runtime, Workbench,
			ChangeThemeCommand, Dialog, uiNLS, commonNLS,
			Button, Select, Theme, templateString){

	declare("davinci.ui.widgets.ThemeSetSelectionWidget", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: templateString,
		widgetsInTemplate: true,

		uiNLS: uiNLS,
		commonNLS: commonNLS
	});

	return declare("davinci.ui.widgets.ThemeSetSelection", null, {

	    workspaceOnly : false,
	    _connections: [],
	    _selectedThemeSet: null,
	    
	    constructor: function(/* Object */args){
	        dojo.safeMixin(this, args);
	    },
	    
	    buildRendering: function(){
		 var langObj = uiNLS;

	        this._dialog = new Dialog({
	            title: langObj.selectTheme,
	            contentStyle: {width: 372}
	        });
	        dojo.connect(this._dialog, "onCancel", this, "onClose");
	        var context = null;
	        if (!this.newFile) {
	            context = Workbench.getOpenEditor().getContext();
	        } 
			var currentThemeSet = Theme.getThemeSet(context);

	        if (!currentThemeSet){
	            currentThemeSet = Theme.dojoThemeSets.themeSets[0]; // default;
	            
	        }
	        this._selectedThemeSet = currentThemeSet;
	        this._dialog.attr("content", new davinci.ui.widgets.ThemeSetSelectionWidget({}));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_themeset_theme_select'), "onChange", this, "onChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_desktop_theme_select'), "onChange", this, "onDesktopChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_mobile_theme_select'), "onChange", this, "onMobileChange"));
	        this._connections.push(dojo.connect(this._dialog, "onExecute", this, "onOk"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_cancel_button'), "onClick", this, "onClose"));
	        
	        this._connections.push(dojo.connect(dijit.byId('theme_select_android_select'), "onChange", this, "onAndroidThemeChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_blackberry_select'), "onChange", this, "onBlackberryThemeChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_ipad_select'), "onChange", this, "oniPadThemeChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_iphone_select'), "onChange", this, "oniPhoneThemeChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_other_select'), "onChange", this, "onOtherThemeChange"));
	
	        this.addThemeSets();
	        var select = dijit.byId('theme_select_themeset_theme_select');
	        select.attr( 'value', currentThemeSet.name);
	        this._dialog.show();
	
	    },
	
	    addThemeSets: function(){
	
	        this._dojoThemeSets = Theme.getThemeSets( Workbench.getProject());
	        if (!this._dojoThemeSets){ 
	            this._dojoThemeSets =  Theme.dojoThemeSets;
	            
	        }
	        this._dojoThemeSets = dojo.clone(this._dojoThemeSets); // make a copy so we won't effect the real object
	        if (this._selectedThemeSet.name == Theme.none_themeset_name){
	            this._dojoThemeSets.themeSets.unshift(this._selectedThemeSet); // temp add to prefs
	        } else {
	            this._dojoThemeSets.themeSets.unshift(Theme.none_themeset); // temp add to prefs 
	        }
	        var select = dijit.byId('theme_select_themeset_theme_select');
	        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
	            opt = {value: this._dojoThemeSets.themeSets[i].name, label: this._dojoThemeSets.themeSets[i].name};
	            select.addOption(opt);
	        }
	        
	    },
	    
	    addThemes: function(themeSet){
	
	        this._themeData = Library.getThemes(Workbench.getProject(), this.workspaceOnly);
	        var dtSelect = dijit.byId('theme_select_desktop_theme_select');
	        dtSelect.options = [];
	        var androidSelect = dijit.byId('theme_select_android_select');
	        androidSelect.options = [];
	        var blackberrySelect = dijit.byId('theme_select_blackberry_select');
	        blackberrySelect.options = [];
	        var ipadSelect = dijit.byId('theme_select_ipad_select');
	        ipadSelect.options = [];
	        var iphoneSelect = dijit.byId('theme_select_iphone_select');
	        iphoneSelect.options = [];
	        var otherSelect = dijit.byId('theme_select_other_select');
	        otherSelect.options = [];
	        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
	        dtSelect.options = [];
	        mblSelect.options = [];
	        mblSelect.addOption({value: Theme.default_theme, label: Theme.default_theme});
	        this._themeCount = this._themeData.length;
	        for (var i = 0; i < this._themeData.length; i++){
	            var opt = {value: this._themeData[i].name, label: this._themeData[i].name};
	            if (this._themeData[i].type === 'dojox.mobile'){
	                mblSelect.addOption(opt);
	                androidSelect.addOption(opt);
	                blackberrySelect.addOption(opt);
	                ipadSelect.addOption(opt);
	                iphoneSelect.addOption(opt);
	                otherSelect.addOption(opt);
	            } else {
	                dtSelect.addOption(opt);
	            }
	            
	        }
	        dtSelect.attr( 'value', themeSet.desktopTheme);
	        for (var d = 0; d < themeSet.mobileTheme.length; d++){
	            var device = themeSet.mobileTheme[d].device.toLowerCase(); 
	            switch (device) {
	            case 'android':
	                androidSelect.attr( 'value', themeSet.mobileTheme[d].theme);
	                break;
	            case 'blackberry':
	                blackberrySelect.attr( 'value', themeSet.mobileTheme[d].theme);
	                break;
	            case 'ipad':
	                ipadSelect.attr( 'value', themeSet.mobileTheme[d].theme);
	                break;
	            case 'iphone':
	                iphoneSelect.attr( 'value', themeSet.mobileTheme[d].theme);
	                break;
	            case 'other':
	                otherSelect.attr( 'value', themeSet.mobileTheme[d].theme);
	                break;
	            }
	        }
	        if (Theme.singleMobileTheme(themeSet)) {
	            mblSelect.attr( 'value', themeSet.mobileTheme[themeSet.mobileTheme.length-1].theme);
	        } else {
	            mblSelect.attr( 'value', Theme.default_theme); 
	//            this.onMobileChange(Theme.default_theme); //force refresh
	        } 
	        
	    },
	      
	    onChange : function(e){
	
	        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
	            if (this._dojoThemeSets.themeSets[i].name == e) {
	                this.addThemes(this._dojoThemeSets.themeSets[i]);
	                this._selectedThemeSet = this._dojoThemeSets.themeSets[i];
	                break;
	            }
	         
	        }
	        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
	        var dtSelect = dijit.byId('theme_select_desktop_theme_select');
            var androidSelect = dijit.byId('theme_select_android_select');
            var blackberrySelect = dijit.byId('theme_select_blackberry_select');
            var ipadSelect = dijit.byId('theme_select_ipad_select');
            var iphoneSelect = dijit.byId('theme_select_iphone_select');
            var otherSelect = dijit.byId('theme_select_other_select');
	        if (e === Theme.none_themeset_name) { // none
	            mblSelect.set('disabled', false);
	            dtSelect.set('disabled', false);
	            androidSelect.set('disabled', false);
	            blackberrySelect.set('disabled', false);
	            ipadSelect.set('disabled', false);
	            iphoneSelect.set('disabled', false);
	            otherSelect.set('disabled', false);
	        } else {
	            mblSelect.set('disabled', true);
	            dtSelect.set('disabled', true);
	            androidSelect.set('disabled', true);
	            blackberrySelect.set('disabled', true);
	            ipadSelect.set('disabled', true);
	            iphoneSelect.set('disabled', true);
	            otherSelect.set('disabled', true);
	            
	        }
	        
	    },
	    
	    onDesktopChange : function(e){
	  
	        this._selectedThemeSet.desktopTheme = e;
	               
	    },
	    
	    onDeviceThemeChange: function(device, e){
	        for (var d = 0; d < this._selectedThemeSet.mobileTheme.length; d++){
	            if (this._selectedThemeSet.mobileTheme[d].device.toLowerCase() === device.toLowerCase()){
	                this._selectedThemeSet.mobileTheme[d].theme = e;
	                break;
	            }
	        }
	    },
	    
	    onAndroidThemeChange: function(e){
	        this.onDeviceThemeChange('android', e);
	    },
	    
	    onBlackberryThemeChange: function(e){
	        this.onDeviceThemeChange('blackberry', e);
	    },
	    
	    oniPadThemeChange: function(e){
	        this.onDeviceThemeChange('ipad', e);
	    },
	    
	    oniPhoneThemeChange: function(e){
	        this.onDeviceThemeChange('iphone', e);
	    },
	    
	    onOtherThemeChange: function(e){
	        this.onDeviceThemeChange('other', e);
	    },
	    
	    
	    onMobileChange : function(e){
	        
	    	if (this._selectedThemeSet.name != Theme.none_themeset_name){
	    		// mobiles can not be change when theme is none
	    		return;
	    	}
	        var androidSelect = dijit.byId('theme_select_android_select');
	        var blackberrySelect = dijit.byId('theme_select_blackberry_select');
	        var ipadSelect = dijit.byId('theme_select_ipad_select');
	        var iphoneSelect = dijit.byId('theme_select_iphone_select');
	        var otherSelect = dijit.byId('theme_select_other_select');
	        
	        if ((e === '(device-specific)') &&  (this._selectedThemeSet.name === Theme.none_themeset_name)) {
	            androidSelect.set('disabled', false);
	            blackberrySelect.set('disabled', false);
	            ipadSelect.set('disabled', false);
	            iphoneSelect.set('disabled', false);
	            otherSelect.set('disabled', false);
	        } else {
	            for (var d = 0; d < this._selectedThemeSet.mobileTheme.length; d++){
	                var device = this._selectedThemeSet.mobileTheme[d].device.toLowerCase(); 
	                this._selectedThemeSet.mobileTheme[d].theme = e;
	                switch (device) {
	                case 'android':
	                    androidSelect.attr( 'value', e);
	                    androidSelect.set('disabled', true);
	                    break;
	                case 'blackberry':
	                    blackberrySelect.attr( 'value', e);
	                    blackberrySelect.set('disabled', true);
	                    break;
	                case 'ipad':
	                    ipadSelect.attr( 'value', e);
	                    ipadSelect.set('disabled', true);
	                    break;
	                case 'iphone':
	                    iphoneSelect.attr( 'value', e);
	                    iphoneSelect.set('disabled', true);
	                    break;
	                case 'other':
	                    otherSelect.attr( 'value', e);
	                    otherSelect.set('disabled', true);
	                    break;
	                }
	            }
	        }
	   
	        
	    },
	    
	    
	    updateDeviceThemes: function(){
	
	        for (var i = 0; i < this._selectedThemeSet.mobileTheme.length; i++){
	            var select;
	            switch (this._selectedThemeSet.mobileTheme[i].device.toLowerCase()){
	            case 'android' :
	                select = dijit.byId('theme_select_android_select');
	                break;
	            case 'blackberry' :
	                select = dijit.byId('theme_select_blackberry_select');
	                break;
	            case 'ipad' :
	                select = dijit.byId('theme_select_ipad_select');
	                break;
	            case 'iphone' :
	                select = dijit.byId('theme_select_iphone_select');
	                break;
	            default :
	                select = dijit.byId('theme_select_other_select');
	                
	            }
	            this._selectedThemeSet.mobileTheme[i].theme = select.attr( 'value');
	        }
	
	    },
	    
	     
	    
	    _changeTheme : function(){
	        debugger;
	        var e = Workbench.getOpenEditor();
	        if (e && e.getContext)
	            e.getContext().getCommandStack().execute(new ChangeThemeCommand(newTheme, e.getContext()));
	    },
	    
	    _onChange :function(){ 
	
	        var langObj = uiNLS;
	        var loc = commonNLS;
	        var currentValue = this._getValueAttr();
	        if( currentValue==null  ||  this._blockChange)
	            return;
	        this.value = currentValue;
	        this._cookieName = 'maqetta_'+currentValue.name+'_'+currentValue.version;
	        var warnCookie = dojo.cookie(this._cookieName);
	        if (this.dojoVersion && currentValue.version !== this.dojoVersion && !warnCookie){
	            this._warnDiv.innerHTML = '<table>' + 
	                                            '<tr><td></td><td>'+langObj.themeVersionMessage+'</td><td></td></tr>'+
	                                             '<tr><td></td><td align="center"><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.ok">'+loc.buttonOk+'</button><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.cancel">'+loc.buttonCancel+'</button></td><td></td></tr>'+
	                                       '</table>';
	            var ok = dijit.byId('davinci.ui.widgets.ThemeSelection.ok');
	            var cancel = dijit.byId('davinci.ui.widgets.ThemeSelection.cancel');
	            dojo.connect(ok, "onClick", this, "_warnOk");
	            dojo.connect(cancel, "onClick", this, "_warnCancel");
	            
	            
	        } else {
	            this.onChange();
	        }
	        
	        
	        
	    },
	    
	    
	    _warnOk: function(){
	        dojo.cookie(this._cookieName, "true");
	        this._destroy();
	        this.onChange();
	        
	    },
	    
	    _warnCancel: function(){
	        this._destroy();
	        this.onClose();
	        
	    },
	    
	    _destroy: function(){
	        var ok = dijit.byId('davinci.ui.widgets.ThemeSelection.ok');
	        dojo.disconnect(ok);
	        ok.destroy();
	        var cancel = dijit.byId('davinci.ui.widgets.ThemeSelection.cancel');
	        dojo.disconnect(cancel);
	        cancel.destroy();
	    },
	    
	    onOk: function(e){
	
	      // this.updateDeviceThemes();
	        this.onClose(e);
	        if (!this.newFile) {
	            var e = Workbench.getOpenEditor();
	            if (e && e.getContext) {
	                e.getContext().getCommandStack().execute(new ChangeThemeCommand(this._selectedThemeSet, e.getContext()));
	            }
	        }
	    },
	    
	    onClose: function(e){
	
	        while (connection = this._connections.pop()){
	            dojo.disconnect(connection);
	        }
	        this._dialog.destroyRecursive();
	        delete this._dialog;
	    },
	    
	    _getTemplate: function(){
	        
	        var langObj = uiNLS;
	        var loc = commonNLS;
	        var template = ''+
	            '<table style="width: 100%; margin-left:10px; margin-right:10px;">'+
	                '<tr><td style="width: 18%;">'+langObj.themeSet+'</td><td style="text-align: center;"><select dojoType="dijit.form.Select" id="theme_select_themeset_theme_select" type="text" style="width: 175px;" ></select></td></tr>'+
	            '</table>' +
	            '<div style="border-top: 1px solid black; top: 231px; border-top-color: #ccc; left: 429px; width: 300px; height: 11px; margin-top: 6px; margin-left:10px;"></div>'+
	            '<table style="margin-left: 15px; width: 100%;">'+
	                '<tr><td>'+langObj.desktopTheme+'</td><td><select dojoType="dijit.form.Select" id="theme_select_desktop_theme_select"type="text"  style="width: 175px;"  ></select></td></tr>'+
	                '<tr><td>'+langObj.mobileTheme+'</td><td><select dojoType="dijit.form.Select" id="theme_select_mobile_theme_select"type="text"  style="width: 175px;" ></select></td></tr>'+
	            '</table>' +
	            '<table id="theme_select_devices_table" style="margin-left:30px; border-collapse: separate; border-spacing: 0 0; width: 100%">' +
	            '<tr><td style="width: 139px;">'+langObj.android+'</td><td><select dojoType="dijit.form.Select" id="theme_select_android_select" type="text"  style="width: 150px;"></select></td></tr>' +
	            '<tr><td>'+langObj.blackberry+'</td><td><select dojoType="dijit.form.Select" id="theme_select_blackberry_select" type="text"  style="width: 150px;"></select></td></tr>' +
	            '<tr><td>'+langObj.ipad+'</td><td><select dojoType="dijit.form.Select" id="theme_select_ipad_select" type="text"  style="width: 150px;"></select></td></tr>' +
	            '<tr><td>'+langObj.iphone+'</td><td><select dojoType="dijit.form.Select" id="theme_select_iphone_select" type="text"  style="width: 150px;"></select></td></tr>' +
	            '<tr><td>'+langObj.other+'</td><td><select dojoType="dijit.form.Select" id="theme_select_other_select" type="text"  style="width: 150px;"></select></td></tr>' +
	            '</table>' +
	            '<table style="width:100%; margin-top: 10px;">'+
	                '<tr><td style="text-align:right; width:80%;"><input type="button" dojoType="dijit.form.Button" id="theme_select_ok_button" label="'+loc.buttonOk+'"></input></td><td><input type="button" dojoType="dijit.form.Button" id="theme_select_cancel_button" label="'+loc.buttonCancel+'"></input></td></tr>'+
	             '</table>'+
	             '';
	
	           return template; 
	    }
	    
	});
});
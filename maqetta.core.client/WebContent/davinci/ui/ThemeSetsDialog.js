define(["dojo/_base/declare",
				"davinci/ui/Dialog",
    		"dijit/_Widget",
    		"dijit/_Templated",
        "davinci/workbench/Preferences",
        "davinci/Workbench",
        "davinci/library",
        "dojo/text!./templates/ThemeSetsDialog.html",
        "dojo/text!./templates/ThemeSetsRenameDialog.html",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "davinci/Theme",
        "dijit/form/ValidationTextBox",
        "dijit/form/Button",
        "dijit/Toolbar"
        
],function(declare, Dialog, _Widget, _Templated, Preferences, Workbench, Library, templateString, renameTemplateString, uiNLS, commonNLS, Theme){
	declare("davinci.ui.ThemeSetsDialogWidget", [_Widget, _Templated], {
		templateString: templateString,
		widgetsInTemplate: true,

		uiNLS: uiNLS,
		commonNLS: commonNLS
	});

	declare("davinci.ui.ThemeSetsDialogRenameWidget", [_Widget, _Templated], {
		templateString: renameTemplateString,
		widgetsInTemplate: true,

		uiNLS: uiNLS,
		commonNLS: commonNLS
	});

	return dojo.declare("davinci.ui.ThemeSetsDialog",   null, {
	    
	    constructor : function(){
	        this._connections = [];
	        this._dialog = new Dialog({
	            id: "manageThemeSets",
	            title: uiNLS.themeSetsDialog,
	            contentStyle: {width: 580}
	        });
	        dojo.connect(this._dialog, "onCancel", this, "onClose");
	        this._dojoThemeSets = Theme.getThemeSets( Workbench.getProject());
	        if (!this._dojoThemeSets){ 
	            this._dojoThemeSets =  Theme.dojoThemeSets;
	            Theme.saveThemeSets( Workbench.getProject(), this._dojoThemeSets);
	            
	        }
	        if (!this._dojoThemeSets.themeSets[0]) {
	            this._dojoThemeSets.themeSets.push(dojo.clone(Theme.custom_themeset));
	            Theme.saveThemeSets( Workbench.getProject(), this._dojoThemeSets);
	        }
	        this._dojoThemeSets = dojo.clone(this._dojoThemeSets); // make a copy so we won't effect the real object
	        
	        this._dialog.attr("content", new davinci.ui.ThemeSetsDialogWidget({}));
	        this._connections.push(dojo.connect(dojo.byId('theme_select_themeset_theme_select'), "onchange", this, "onChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_themeset_add'), "onClick", this, "addThemeSet"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_themeset_delete'), "onClick", this, "deleteThemeSet"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_rename_button'), "onClick", this, "renameThemeSet"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_desktop_theme_select'), "onChange", this, "onDesktopChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_mobile_theme_select'), "onChange", this, "onMobileChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_ok_button'), "_onSubmit", this, "onOk"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_cancel_button'), "onClick", this, "onClose"));
	        
	        this._connections.push(dojo.connect(dijit.byId('theme_select_android_select'), "onChange", this, "onAndroidThemeChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_blackberry_select'), "onChange", this, "onBlackberryThemeChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_ipad_select'), "onChange", this, "oniPadThemeChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_iphone_select'), "onChange", this, "oniPhoneThemeChange"));
	        this._connections.push(dojo.connect(dijit.byId('theme_select_other_select'), "onChange", this, "onOtherThemeChange"));
	        
	        this.addThemeSets();
	        this._selectedThemeSet = this._dojoThemeSets.themeSets[0];
	        dijit.byId('theme_select_themeset_theme_select_textbox').attr('value',this._selectedThemeSet.name);
	        this.addThemes(this._selectedThemeSet);
	        this._dialog.show();
	  
	    },
	    
	    addThemeSets: function(){

	       
	        var select = dojo.byId('theme_select_themeset_theme_select');
	        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
	            var c = dojo.doc.createElement('option');
	            c.innerHTML = this._dojoThemeSets.themeSets[i].name;
	            c.value = this._dojoThemeSets.themeSets[i].name;
	            if (i === 0 ) {
	                c.selected = '1';
	            }
	            select.appendChild(c);
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
	            this.onMobileChange(Theme.default_theme); //force refresh
	        }
	        
	    },
	    
	    addThemeSet: function(e) {
	        var newThemeSet;
	        if (this._selectedThemeSet) {
	            newThemeSet = dojo.clone(this._selectedThemeSet);
	        } else {
	            newThemeSet = dojo.clone(Theme.default_themeset);
	        }

	        var newThemeSetName = newThemeSet.name;
	        // make sure the name is unique
	        var nameIndex = 0;
	        for (var n = 0; n < this._dojoThemeSets.themeSets.length; n++){
	            if (this._dojoThemeSets.themeSets[n].name == newThemeSetName){
	                nameIndex++;
	                newThemeSetName = newThemeSet.name + '_' + nameIndex;
	                n = -1; // start search a first theme set with new name
	            }
	        }
	        newThemeSet.name = newThemeSetName;
	        this._dojoThemeSets.themeSets.push(newThemeSet);
	        var select = dojo.byId('theme_select_themeset_theme_select');
	        var c = dojo.doc.createElement('option');
	        c.innerHTML = newThemeSet.name;
	        c.value = newThemeSet.name;
	        select.appendChild(c);
	        
	    },
	    
	    deleteThemeSet: function(e) {
	        var select = dojo.byId('theme_select_themeset_theme_select');
	        var node = select[select.selectedIndex];
	        if (!node) {
	        	return;
	        }
	        for (var n = 0; n < this._dojoThemeSets.themeSets.length; n++){
	            if (this._dojoThemeSets.themeSets[n].name == node.value){
	                this._dojoThemeSets.themeSets.splice(n, 1);
	                break;
	            }
	        }
	        this._selectedThemeSet = null;
	        select.removeChild(node);
	        dijit.byId('theme_select_themeset_theme_select_textbox').attr('value','');
	        var renameButton = dijit.byId('theme_select_rename_button');
	        var desktopSelect = dijit.byId('theme_select_desktop_theme_select');
	        var mobileSelect = dijit.byId('theme_select_mobile_theme_select');
	        var androidSelect = dijit.byId('theme_select_android_select');
	        var blackberrySelect = dijit.byId('theme_select_blackberry_select');
	        var ipadSelect = dijit.byId('theme_select_ipad_select');
	        var iphoneSelect = dijit.byId('theme_select_iphone_select');
	        var otherSelect = dijit.byId('theme_select_other_select');
	        renameButton.set('disabled', true);
	        desktopSelect.set('disabled', true);
	        mobileSelect.set('disabled', true);
	        androidSelect.set('disabled', true);
            blackberrySelect.set('disabled', true);
            ipadSelect.set('disabled', true);
            iphoneSelect.set('disabled', true);
            otherSelect.set('disabled', true);
	        
	        
	    },
	    
	    renameThemeSet: function(e) {
	        
	        var langObj = uiNLS;
	        var loc = commonNLS;
	        var select = dojo.byId('theme_select_themeset_theme_select');
	        this._renameDialog = new Dialog({
	            id: "rename",
	            title: langObj.renameThemeSet,
	            contentStyle: {width: 300},
	            content: new davinci.ui.ThemeSetsDialogRenameWidget({})
	        });
	        this._renameDialog._themesetConnections = [];
	        this._renameDialog._themesetConnections.push(dojo.connect(dijit.byId('theme_set_rename_ok_button'), "onClick", this, "onOkRename"));
	        this._renameDialog._themesetConnections.push(dojo.connect(dijit.byId('theme_set_rename_cancel_button'), "onClick", this, "onCloseRename"));
	        this._renameDialog._themesetConnections.push(dojo.connect(this._renameDialog, "onCancel", this, "onCloseRename"));
	        this._renameDialog.show();
	        var editBox = dijit.byId('theme_select_themeset_rename_textbox');
	        editBox.attr('value', this._selectedThemeSet.name);
	        dijit.selectInputText(editBox);
	         
	    },
	    
	    onOkRename: function(e) {
	        
	        var newName = dijit.byId('theme_select_themeset_rename_textbox').attr('value');
	        if (newName) {
	            for (var n = 0; n < this._dojoThemeSets.themeSets.length; n++){
	                if (this._dojoThemeSets.themeSets[n].name == newName){
	                    alert('Theme set name already use');
	                    return;
	                }
	            }
	            var select = dojo.byId('theme_select_themeset_theme_select');
	            var node = select[select.selectedIndex];
	            var oldName = this._selectedThemeSet.name;
	            node.innerHTML = newName;
	            node.value = newName;
	            this._selectedThemeSet.name = newName;
	            dijit.byId('theme_select_themeset_theme_select_textbox').attr('value',this._selectedThemeSet.name);
	        }
	        
	        this.onCloseRename(e);
	    },
	    
	    onCloseRename: function(e) {
	    	
	        while (connection = this._renameDialog._themesetConnections.pop()){
	            dojo.disconnect(connection);
	        }
	        this._renameDialog.destroyDescendants();
	        this._renameDialog.destroy();
	        delete this._renameDialog;
	    },
	    
	    onClick: function(e) {
	        e.target.setAttribute('selected', false);
	        var select = dojo.byId('theme_select_themeset_theme_select');
	        select.setAttribute( 'value', this._selectedThemeSet.name);
	    },
	    
	    onChange : function(e){

	        var name = e.target[e.target.selectedIndex].value;
	        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
	            if (this._dojoThemeSets.themeSets[i].name == name) {
	            	this._selectedThemeSet = this._dojoThemeSets.themeSets[i];
	                this.addThemes(this._dojoThemeSets.themeSets[i]);
	                dijit.byId('theme_select_themeset_theme_select_textbox').attr('value',this._selectedThemeSet.name);
	                var renameButton = dijit.byId('theme_select_rename_button');
	    	        var desktopSelect = dijit.byId('theme_select_desktop_theme_select');
	    	        var mobileSelect = dijit.byId('theme_select_mobile_theme_select');
	                renameButton.set('disabled', false);
	                desktopSelect.set('disabled', false);
	                mobileSelect.set('disabled', false);
	                break;
	            }
	         
	        }
	        
	    },
	    
	    onDesktopChange : function(e){
	  
	        this._selectedThemeSet.desktopTheme = e;
	               
	    },
	    
	    onMobileChange : function(e){
	        
	        var androidSelect = dijit.byId('theme_select_android_select');
	        var blackberrySelect = dijit.byId('theme_select_blackberry_select');
	        var ipadSelect = dijit.byId('theme_select_ipad_select');
	        var iphoneSelect = dijit.byId('theme_select_iphone_select');
	        var otherSelect = dijit.byId('theme_select_other_select');
	        
	        function setDeviceSelect(device, value, disabled){
	        	 switch (device) {
	                case 'android':
	                    androidSelect.attr( 'value', value);
	                    androidSelect.set('disabled', disabled);
	                    break;
	                case 'blackberry':
	                    blackberrySelect.attr( 'value', value);
	                    blackberrySelect.set('disabled', disabled);
	                    break;
	                case 'ipad':
	                    ipadSelect.attr( 'value', value);
	                    ipadSelect.set('disabled', disabled);
	                    break;
	                case 'iphone':
	                    iphoneSelect.attr( 'value', value);
	                    iphoneSelect.set('disabled', disabled);
	                    break;
	                case 'other':
	                    otherSelect.attr( 'value', value);
	                    otherSelect.set('disabled', disabled);
	                    break;
	                }
	        }
	        
	        if ((e === '(device-specific)') ) {
	            for (var d = 0; d < this._selectedThemeSet.mobileTheme.length; d++){
	                var device = this._selectedThemeSet.mobileTheme[d].device.toLowerCase(); 
	                setDeviceSelect(device, this._selectedThemeSet.mobileTheme[d].theme, false);
	            }
	        } else {
	            for (var d = 0; d < this._selectedThemeSet.mobileTheme.length; d++){
	                var device = this._selectedThemeSet.mobileTheme[d].device.toLowerCase(); 
	                this._selectedThemeSet.mobileTheme[d].theme = e;
	                setDeviceSelect(device, this._selectedThemeSet.mobileTheme[d].theme, true);
	            }
	        }
	   
	        
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
	    
	       
	     onOk: function(e){

	         Theme.saveThemeSets( Workbench.getProject(), this._dojoThemeSets);
	         this.onClose(e);

	     },
	     
	     onClose: function(e){

	         while (connection = this._connections.pop()){
	             dojo.disconnect(connection);
	         }
	         this._dialog.destroyDescendants();
	         this._dialog.destroy();
	         delete this._dialog;
	     },
	     
	      
	     onDeleteThemeSet: function(e){

	        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
	            if (this._dojoThemeSets.themeSets[i].name === this._currentThemeSet.name){
	                var themeName = this._dojoThemeSets.themeSets[i-1].name;
	                var cb = dijit.byId('theme_select');
	                cb.store.fetchItemByIdentity({
	                    identity: this._dojoThemeSets.themeSets[i].name,
	                    onItem: function(item){
	                        cb.store.deleteItem(item);
	                        cb.store.save();
	                    }
	                });
	                this._dojoThemeSets.themeSets.splice(i,1); // removes the theme set from the array 
	                this._currentThemeSet = null;
	                cb.attr( 'value', themeName); 
	                break;
	            }
	           
	        }
	        
	    }
	});
	
});



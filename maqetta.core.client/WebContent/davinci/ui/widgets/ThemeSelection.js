dojo.provide("davinci.ui.widgets.ThemeSelection");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require('davinci.workbench.WidgetLite');
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("dijit.layout.ContentPane");
dojo.require("davinci.ui.widgets.ThemeStore");

dojo.declare("davinci.ui.widgets.ThemeSelection", null, {
    
    workspaceOnly : false,
    message: 'Theme version does not match workspace version this could produce unexpected results. We suggest recreating the custom theme using the current version of Maqetta and deleting the existing theme.',
    _connections: [],
    _selectedThemeSet: null,
    
    /* setup basic DOM */
    buildRendering: function(){
        this._dialog = new dijit.Dialog({
            title: "Select theme",
            style: "width: 250px"
        });
        dojo.connect(this._dialog, "onCancel", this, "onClose");
        var currentThemeSet = davinci.theme.getThemeSet(davinci.Workbench.getOpenEditor().getContext());
        if (!currentThemeSet){
            currentThemeSet = davinci.theme.dojoThemeSets.themeSets[0]; // default;
        }
        this._dialog.attr("content", this._getTemplate());
        this._connections.push(dojo.connect(dijit.byId('theme_select_themeset_theme_select'), "onChange", this, "onChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_desktop_theme_select'), "onChange", this, "onDesktopChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_mobile_theme_select'), "onChange", this, "onMobileChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_ok_button'), "onClick", this, "onOk"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_cancel_button'), "onClick", this, "onClose"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_android_checkbox'), "onClick", this, "onCheckboxChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_blackberry_checkbox'), "onClick", this, "onCheckboxChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_ipad_checkbox'), "onClick", this, "onCheckboxChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_iphone_checkbox'), "onClick", this, "onCheckboxChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_other_checkbox'), "onClick", this, "onCheckboxChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_all_devices_radio'), "onClick", this, "onRadioChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_devices_radio'), "onClick", this, "onRadioChange"));
        this.addThemeSets();
        //this.addThemes(this._dojoThemeSets.themeSets[0]);
        var select = dijit.byId('theme_select_themeset_theme_select');
        select.attr( 'value', currentThemeSet.name);
        this._dialog.show();

    },

    /* populate the theme selection, depends on the "workspaceOnly" attribute being set post create */
    postCreate : function(){
        debugger;
        this.addThemeSets();
    return;
        this._themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly);
        this._themeCount = this._themeData.length;
        for (var i = 0; i < this._themeData.length; i++){
            if(this._hasValue(this._themeData[i].name)) continue;
            var op = dojo.doc.createElement("option");
            op.value =this._themeData[i].name;
            op.text = this._themeData[i].name;
            this._select.appendChild(op);
            
        }
        if(this._selection)
            this._selectValue(this._selection);
    },
    
    addThemeSets: function(){

        this._dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
        if (!this._dojoThemeSets){ //  FIXME this default setting should be someplace else
            this._dojoThemeSets =  { 
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
            
        }
        var select = dijit.byId('theme_select_themeset_theme_select');
        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
            var opt = {value: this._dojoThemeSets.themeSets[i].name, label: this._dojoThemeSets.themeSets[i].name};
            select.addOption(opt);
        }
        
    },
    
    addThemes: function(themeSet){

        this._themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly, true);
        var dtSelect = dijit.byId('theme_select_desktop_theme_select');
        dtSelect.options = [];
        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
        mblSelect.options = [];
        mblSelect.addOption({value: 'default', label: 'default'});
        mblSelect.addOption({value: 'none', label: 'none'});
        this._themeCount = this._themeData.length;
        for (var i = 0; i < this._themeData.length; i++){
            var opt = {value: this._themeData[i].name, label: this._themeData[i].name};
            if (this._themeData[i].type === 'dojox.mobile'){
                mblSelect.addOption(opt);
            } else {
                dtSelect.addOption(opt);
            }
            
        }
        dtSelect.attr( 'value', themeSet.desktopTheme);
        if (themeSet.mobileTheme === 'default' || themeSet.mobileTheme === 'none' ){
            mblSelect.attr( 'value', themeSet.mobileTheme);
        } else {
           var context = davinci.Workbench.getOpenEditor().getContext();
           var css = themeSet.mobileTheme[themeSet.mobileTheme.length-1][2][0]; // should be the catchall .*
            for (var t = 0; t < this._themeData.length; t++){
                var theme = this._themeData[t];
                var ssPath = new davinci.model.Path(theme.file.parent.getPath()).append(theme.files[0]);
                var resourcePath = context.getFullResourcePath();
                var filename = ssPath.relativeTo(resourcePath, true).toString();
                if (filename === css){
                    mblSelect.attr( 'value', theme.name);
                    break;
                } 
            }
        }
        
    },
    
    _setBaseAttr : function(base){
        debugger;
        this._base = base;
    },
    
    _getBaseAttr : function(){
        debugger;
        return this._base;
    },
    
    _getNumberOfThemesAttr : function(){
        debugger;
        return this._themeCount;
    },
    
    _setValueAttr : function(value){
        debugger;
    return;
        this._selection = value;
        if(value && value.className){
            this._selection = value.className; 
        }
        this._selectValue(this._selection);
    },
    
    _hasValue : function(themeName){
        debugger;
    return;
        for(var i=0;i<this._select.children.length;i++){
            if(this._select.children[i].value==themeName){
                return true;
            }
        }
        return false;
    },
    
    _selectValue : function(value){
        debugger;
        var found = false;
        for(var i=0;i<this._select.children.length;i++){
            if(this._select.children[i].selected)
                this._select.children[i].selected = false;
            
            if(!found && this._select.children[i].value==value){
                this._select.children[i].selected = true;
                var found = true;
            }
        }
        
        if(!found && value!=null){
            var op = dojo.doc.createElement("option");
            op.value = value;
            op.text = value;
            op.selected = true;
            this._select.appendChild(op);   
        }
    },
    _getValueAttr : function(){
        debugger;
        var name = dojo.attr(this._select, "value");
        
        for(var i=0;i<this._themeData.length;i++){
            if(this._themeData[i]['name'] == name )
                return this._themeData[i];
            
        }
            
        return null;
    },
    
    _setWorkspaceOnlyAttr : function(value){
        debugger;
        this.workspaceOnly = value;
    },
    
    onChange : function(e){

        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
            if (this._dojoThemeSets.themeSets[i].name == e) {
                this.addThemes(this._dojoThemeSets.themeSets[i]);
                this._selectedThemeSet = this._dojoThemeSets.themeSets[i];
                break;
            }
         
        }
        
    },
    
    onDesktopChange : function(e){
  
        this._selectedThemeSet.desktopTheme = e;
               
    },
    
    onMobileChange : function(e){
   
        var checkboxs = [];
        checkboxs['android'] = dijit.byId('theme_select_android_checkbox');
        checkboxs['blackberry'] = dijit.byId('theme_select_blackberry_checkbox');
        checkboxs['ipad'] = dijit.byId('theme_select_ipad_checkbox');
        checkboxs['iphone'] = dijit.byId('theme_select_iphone_checkbox');
        checkboxs['other'] = dijit.byId('theme_select_other_checkbox');
        var allDevice = dijit.byId('theme_select_all_devices_radio');
        var selectDevice = dijit.byId('theme_select_devices_radio');
        var selectDevicesTable = dojo.byId('theme_select_devices_table');
        var selectRadioTable = dojo.byId('theme_select_radio_table');
        
        dojo.style(selectDevicesTable, 'display', '');
        dojo.style(selectRadioTable, 'display', '');
        // reset checkboxes
       for (c in checkboxs){
            checkboxs[c].setChecked(false);
       }
       checkboxs['other'].setDisabled(false);
        
        if (e == 'none' || e == 'default'){
            dojo.style(selectDevicesTable, 'display', 'none');
            dojo.style(selectRadioTable, 'display', 'none');
           // this.selectMobileTheme(e);
           this._selectedThemeSet.mobileTheme = e;
           delete this._selectedMobileTheme;
        } else {
            var theme;
            for (var t = 0; t < this._themeData.length; t++){
                theme = this._themeData[t];
                if(theme.name === e){
                    this._selectedMobileTheme = theme;
                    break;
                }
            }
            
            var ssPath = new davinci.model.Path(theme.file.parent.getPath()).append(theme.files[0]);
            var resourcePath = davinci.Workbench.getOpenEditor().getContext().getFullResourcePath();
            var filename = ssPath.relativeTo(resourcePath, true).toString();
            
            if (this._selectedThemeSet.mobileTheme === 'default' || this._selectedThemeSet.mobileTheme === 'none'){
                // changing from default or none for mobile
                allDevice.setChecked(true);
                selectDevice.setChecked(false);
                checkboxs['other'].setChecked(true);
                checkboxs['other'].setDisabled(true);
                dojo.style(selectDevicesTable, 'display', 'none');
                
            } else if (this._selectedThemeSet.mobileTheme.length < 2) {
                var device = this._selectedThemeSet.mobileTheme[0][0];
                if (device === '.*'){
                    allDevice.setChecked(true);
                    selectDevice.setChecked(false);
                    checkboxs['other'].setChecked(true);
                    checkboxs['other'].setDisabled(true);
                    dojo.style(selectDevicesTable, 'display', 'none');
                }
                // all devices
            } else {
                // list of devices
                allDevice.setChecked(false);
                selectDevice.setChecked(true);
                for (var i =0; i < this._selectedThemeSet.mobileTheme.length; i++){
                    if (this._selectedThemeSet.mobileTheme[i][2][0] == filename){
                        console.log(this._selectedThemeSet.mobileTheme[i][0]); // should be the device
                        var device = this._selectedThemeSet.mobileTheme[i][0];
                        if (device === '.*'){
                            device = 'other';
                            checkboxs[device].setDisabled(true);
                        }
                        device = device.toLowerCase();
                        checkboxs[device].setChecked(true);
                        
                    }
                }
            }
           
        }
        
    },
    
    onRadioChange: function(e){
      
        var selectDevicesTable = dojo.byId('theme_select_devices_table');
        var allDevice = dijit.byId('theme_select_all_devices_radio');
        var selectDevice = dijit.byId('theme_select_devices_radio');
        if (e.target.id === 'theme_select_all_devices_radio'){
            if (e.target.checked){
                allDevice.setChecked(true);
                selectDevice.setChecked(false);
                dojo.style(selectDevicesTable, 'display', 'none');
            } else {
                allDevice.setChecked(false);
                selectDevice.setChecked(true); 
                dojo.style(selectDevicesTable, 'display', '');
            }
            
        } else if(e.target.id === 'theme_select_devices_radio'){
            if (e.target.checked){
                allDevice.setChecked(false);
                selectDevice.setChecked(true);
                dojo.style(selectDevicesTable, 'display', '');
            } else {
                allDevice.setChecked(true);
                selectDevice.setChecked(false);
                dojo.style(selectDevicesTable, 'display', 'none');
            }
        }
        
        
    },
    
    onCheckboxChange: function(e){

        var checkbox = dijit.byId(e.target.id);
        var device = e.target.value;
        if (device.toLowerCase() == 'other') {
            device = '.*';
            if (checkbox.checked){
                checkbox.setDisabled(true);
            }
        }
        var mobileIndex = -1;
        for (var i =0; i < this._selectedThemeSet.mobileTheme.length; i++){
            if (device.toLowerCase() == this._selectedThemeSet.mobileTheme[i][0].toLowerCase()){
                mobileIndex = i;
                break;
            }
        }
        if (mobileIndex < 0 && checkbox.checked){
            // add
            var ssPath = new davinci.model.Path(this._selectedMobileTheme.file.parent.getPath()).append(this._selectedMobileTheme.files[0]);
            var resourcePath = davinci.Workbench.getOpenEditor().getContext().getFullResourcePath();
            var filename = ssPath.relativeTo(resourcePath, true).toString();
            if (device == '.*'){
                this._selectedThemeSet.mobileTheme.push([device,this._selectedMobileTheme.base,[filename]]);
            } else {
                this._selectedThemeSet.mobileTheme.unshift([device,this._selectedMobileTheme.base,[filename]]);
            }
        } else if (mobileIndex > -1 && checkbox.checked){
            // replace
            var ssPath = new davinci.model.Path(this._selectedMobileTheme.file.parent.getPath()).append(this._selectedMobileTheme.files[0]);
            var resourcePath = davinci.Workbench.getOpenEditor().getContext().getFullResourcePath();
            var filename = ssPath.relativeTo(resourcePath, true).toString();
            this._selectedThemeSet.mobileTheme[mobileIndex]= [device,this._selectedMobileTheme.base,[filename]];
        } else if (mobileIndex > -1 && !checkbox.checked){
            //remove
            
            if (device == '.*'){
             // FIXME can not remove other, only replace add, should disable other check box when checked.
                alert('can not remove other, replace only');
            } else {
                var temp = [];
                if (mobileIndex > 0){
                    temp = this._selectedThemeSet.mobileTheme.slice(0,mobileIndex);
                } 
                temp = temp.concat(this._selectedThemeSet.mobileTheme.slice(mobileIndex+1));
               this._selectedThemeSet.mobileTheme =  temp;
            }
        }
        debugger;
    },
    
    selectMobileTheme: function(e){
 
        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
        var themeMap = this._selectedThemeSet.mobileTheme;
        if (e === 'default'){
            mblSelect.attr( 'value', themeSet.mobileTheme);
        } else {
            
        }
        if (themeSet.mobileTheme === 'default'){
            mblSelect.attr( 'value', themeSet.mobileTheme);
        } else {
            for (var t = 0; t < themeMap.length; t++){
                
            }
                
            for (var i = 0; i < this._themeData.length; i++){
                if(this._hasValue(this._themeData[i].name)) continue;
                if (this._themeData[i].type === 'dojox.mobile'){
                    mblSelect.addOption(opt);
                } else {
                    dtSelect.addOption(opt);
                }
                
            }
            mblSelect.attr( 'value', '.*');
        }
        
    },
    
    _changeTheme : function(){
        debugger;
        var e = davinci.Workbench.getOpenEditor();
        if (e && e.getContext)
            e.getContext().getCommandStack().execute(new davinci.ve.commands.ChangeThemeCommand(newTheme, e.getContext()));
    },
    
    _onChange :function(){ // FIXME need to make this a warn for both desktop and mobile
        debugger;
        var currentValue = this._getValueAttr();
        if( currentValue==null  ||  this._blockChange)
            return;
        this.value = currentValue;
        this._cookieName = 'maqetta_'+currentValue.name+'_'+currentValue.version;
        var warnCookie = dojo.cookie(this._cookieName);
        if (this.dojoVersion && currentValue.version !== this.dojoVersion && !warnCookie){
            this._warnDiv.innerHTML = '<table>' + 
                                            '<tr><td></td><td>'+this.message+'</td><td></td></tr>'+
                                             '<tr><td></td><td align="center"><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.ok">Ok</button><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.cancel">Cancel</button></td><td></td></tr>'+
                                       '</table>';
            var ok = dijit.byId('davinci.ui.widgets.ThemeSelection.ok');
            var cancel = dijit.byId('davinci.ui.widgets.ThemeSelection.cancel');
            dojo.connect(ok, "onClick", this, "_warnOk");
            dojo.connect(cancel, "onClick", this, "_warnCancel");
            
            
        } else {
            this.onChange();
        }
        
        
        
    },
    
    
    _getThemeDataAttr : function(){
        debugger;
        return this._themeData;
    },
    
    _warnOk: function(){
        debugger;
        dojo.cookie(this._cookieName, "true");
        this._destroy();
        this.onChange();
        
    },
    
    _warnCancel: function(){
        debugger;
        this._destroy();
        this.onClose();
        
    },
    
    _destroy: function(){
        debugger;
        var ok = dijit.byId('davinci.ui.widgets.ThemeSelection.ok');
        dojo.disconnect(ok);
        ok.destroy();
        var cancel = dijit.byId('davinci.ui.widgets.ThemeSelection.cancel');
        dojo.disconnect(cancel);
        cancel.destroy();
    },
    
    onOk: function(e){

        davinci.workbench.Preferences.savePreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(),this._dojoThemeSets);
        this.onClose(e);
        var e = davinci.Workbench.getOpenEditor();
        if (e && e.getContext)
            e.getContext().getCommandStack().execute(new davinci.ve.commands.ChangeThemeCommand(this._selectedThemeSet, e.getContext()));
    },
    
    onClose: function(e){

        while (connection = this._connections.pop()){
            dojo.disconnect(connection);
        }
        this._dialog.destroyDescendants();
        this._dialog.destroy();
        delete this._dialog;
    },
    
    _getTemplate: function(){

        var template = ''+
            '<table>'+
                '<tr><td>Theme set:</td><td><select dojoType="dijit.form.Select" id="theme_select_themeset_theme_select" type="text" style="width: 135px;" ></select></td></tr>'+
            '</table>' +
            '<table>'+
                '<tr><td>Desktop theme:</td><td><select dojoType="dijit.form.Select" id="theme_select_desktop_theme_select"type="text"  style="width: 135px;"  ></select></td></tr>'+
                '<tr><td>Mobile theme:</td><td><select dojoType="dijit.form.Select" id="theme_select_mobile_theme_select"type="text"  style="width: 135px;" ></select></td></tr>'+
            '</table>' +
            '<table id="theme_select_radio_table" style="margin-top:5px; margin-left:30px;">' +
            '<tr><td>Mobile theme applies to:</td><td></td></tr>' +
            '<tr><td style="padding-left:15px;"><input showlabel="true" type="radio" id="theme_select_all_devices_radio" dojoType="dijit.form.RadioButton"></input><label>All mobile devices</label></td><td></td></tr>' +
            '<tr><td style="padding-left:15px;"> <input showlabel="true" type="radio" id="theme_select_devices_radio" dojoType="dijit.form.RadioButton"></input><label>Selected devices</label></td><td></td></tr>' +
            '</table>' +
            '<table id="theme_select_devices_table" style="margin-left:60px;">' +
                '<tr><td></td><td><input id="theme_select_android_checkbox" name="theme_select_android_checkbox" dojoType="dijit.form.CheckBox" value="Android"><label for="theme_select_android_checkbox">Android</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_blackberry_checkbox" name="theme_select_blackberry_checkbox" dojoType="dijit.form.CheckBox" value="BlackBerry"><label for="theme_select_blackberry_checkbox">BlackBerry</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_ipad_checkbox" name="theme_select_ipad_checkbox" dojoType="dijit.form.CheckBox" value="iPad"><label for="theme_select_ipad_checkbox">iPad</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_iphone_checkbox" name="theme_select_iphone_checkbox" dojoType="dijit.form.CheckBox" value="iPhone"><label for="theme_select_iphone_checkbox">iPhone</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_other_checkbox" name="theme_select_other_checkbox" dojoType="dijit.form.CheckBox" value="other"><label for="theme_select_other_checkbox">Other</label></td></tr>' +
            '</table>'+
            '<table style="width:100%;">'+
                '<tr><td style="text-align:right; width:80%;"><input type="button" dojoType="dijit.form.Button" id="theme_select_ok_button" label="Ok"></input></td><td><input type="button" dojoType="dijit.form.Button" id="theme_select_cancel_button" label="Cancel"></input></td></tr>'+
             '</table>'+
             '';

           return template; 
    }
    
    
});
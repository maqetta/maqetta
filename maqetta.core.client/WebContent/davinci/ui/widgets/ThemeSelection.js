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
            style: "width: 300px"
        });
        dojo.connect(this._dialog, "onCancel", this, "onClose");
        
        this._dialog.attr("content", this._getTemplate());
        this._connections.push(dojo.connect(dijit.byId('theme_select_themeset_theme_select'), "onChange", this, "onChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_desktop_theme_select'), "onChange", this, "onDesktopChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_mobile_theme_select'), "onChange", this, "onMobileChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_ok_button'), "onClick", this, "onOk"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_cancel_button'), "onClick", this, "onClose"));
        this.addThemeSets();
        //this.addThemes(this._dojoThemeSets.themeSets[0]);
        this._dialog.show();

        
        return;
        var div = dojo.doc.createElement("div");
        div.innerHTML = this._getTemplate();
        
//      this._select = dojo.doc.createElement("select");
    //  div.appendChild(this._select);
        this._warnDiv = dojo.doc.createElement("div");
        div.appendChild(this._warnDiv);
        this.domNode = div;
        //dojo.style(this._select, "width","180px");
        dojo.style(this.domNode, "width","100%");
    //  dojo.connect(this._select, "onchange", this, "_onChange");
    },

    /* populate the theme selection, depends on the "workspaceOnly" attribute being set post create */
    postCreate : function(){
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

       /* if(this._selection)
            this._selectValue(this._selection);*/
        
    },
    
    addThemes: function(themeSet){
        debugger;
        this._themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly, true);
        var dtSelect = dijit.byId('theme_select_desktop_theme_select');
        dtSelect.options = [];
        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
        mblSelect.options = [];
        mblSelect.addOption({value: 'default', label: 'default'});
        this._themeCount = this._themeData.length;
        for (var i = 0; i < this._themeData.length; i++){
            if(this._hasValue(this._themeData[i].name)) continue;
            var opt = {value: this._themeData[i].name, label: this._themeData[i].name};
            if (this._themeData[i].type === 'dojox.mobile'){
                mblSelect.addOption(opt);
            } else {
                dtSelect.addOption(opt);
            }
            
        }
        dtSelect.attr( 'value', themeSet.desktopTheme);
        if (themeSet.mobileTheme === 'default'){
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
        this._base = base;
    },
    
    _getBaseAttr : function(){
        return this._base;
    },
    
    _getNumberOfThemesAttr : function(){
        return this._themeCount;
    },
    
    _setValueAttr : function(value){
    return;
        this._selection = value;
        if(value && value.className){
            this._selection = value.className; 
        }
        this._selectValue(this._selection);
    },
    
    _hasValue : function(themeName){
    return;
        for(var i=0;i<this._select.children.length;i++){
            if(this._select.children[i].value==themeName){
                return true;
            }
        }
        return false;
    },
    
    _selectValue : function(value){
        
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
        var name = dojo.attr(this._select, "value");
        
        for(var i=0;i<this._themeData.length;i++){
            if(this._themeData[i]['name'] == name )
                return this._themeData[i];
            
        }
            
        return null;
    },
    
    _setWorkspaceOnlyAttr : function(value){
        this.workspaceOnly = value;
    },
    
    onChange : function(e){
        debugger;

        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
            if (this._dojoThemeSets.themeSets[i].name == e) {
                this.addThemes(this._dojoThemeSets.themeSets[i]);
                this._selectedThemeSet = this._dojoThemeSets.themeSets[i];
                break;
            }
         
        }
        
    },
    
    onDesktopChange : function(e){
        debugger;
        this._selectedThemeSet.desktopTheme = e;
               
    },
    
    onMobileChange : function(e){
        debugger;
        if (e == 'none' || e == 'default'){
           // this.selectMobileTheme(e);
        } else {
            var theme;
            for (var t = 0; t < this._themeData.length; t++){
                theme = this._themeData[t];
                if(theme.name === e){
                    break;
                }
            }
            var ssPath = new davinci.model.Path(theme.file.parent.getPath()).append(theme.files[0]);
            var resourcePath = davinci.Workbench.getOpenEditor().getContext().getFullResourcePath();
            var filename = ssPath.relativeTo(resourcePath, true).toString();
            for (var i =0; i < this._selectedThemeSet.mobileTheme.length; i++){
                if (this._selectedThemeSet.mobileTheme[i][2][0] == filename){
                    console.log(this._selectedThemeSet.mobileTheme[i][0]); // should be the device
                }
            }
           
        }
        
    },
    
    selectMobileTheme: function(e){
        debugger;
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
        
        var e = davinci.Workbench.getOpenEditor();
        if (e && e.getContext)
            e.getContext().getCommandStack().execute(new davinci.ve.commands.ChangeThemeCommand(newTheme, e.getContext()));
    },
    
    _onChange :function(){ // FIXME need to make this a warn for both desktop and mobile
        
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
        return this._themeData;
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
        debugger;
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
        delete this._dialog;
    },
    
    _getTemplate: function(){
        
        var template = ''+
            '<table>'+
                '<tr><td>Theme set:</td><td><select dojoType="dijit.form.Select" id="theme_select_themeset_theme_select" type="text" autoWidth="true"></select></td></tr>'+
            '</table>' +
            '<table>'+
                '<tr><td>Desktop theme:</td><td><select dojoType="dijit.form.Select" id="theme_select_desktop_theme_select"type="text" autoWidth="true" ></select></td></tr>'+
                '<tr><td>Mobile theme:</td><td><select dojoType="dijit.form.Select" id="theme_select_mobile_theme_select"type="text" autoWidth="true" ></select></td></tr>'+
                '<tr><td></td><td><input id="theme_select_android_checkbox" name="theme_select_android_checkbox" dojoType="dijit.form.CheckBox" value="android"><label for="theme_select_android_checkbox">Android</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_iphone_checkbox" name="theme_select_iphone_checkbox" dojoType="dijit.form.CheckBox" value="android"><label for="theme_select_iphone_checkbox">iPhone</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_other_checkbox" name="theme_select_other_checkbox" dojoType="dijit.form.CheckBox" value="android"><label for="theme_select_other_checkbox">Other</label></td></tr>' +
            '</table>'+
            '<table>'+
                '<tr><td><input type="button" dojoType="dijit.form.Button" id="theme_select_ok_button" label="Ok"></input></td><td><input type="button" dojoType="dijit.form.Button" id="theme_select_cancel_button" label="Cancel"></input></td></tr>'+
             '</table>'+
             '';

           return template; 
    }
    
    
});
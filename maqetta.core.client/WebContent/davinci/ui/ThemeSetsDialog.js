dojo.provide("davinci.ui.ThemeSetsDialog");

dojo.require("davinci.version");
dojo.require("davinci.repositoryinfo");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dojo.data.ObjectStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.ui", "ui");

dojo.require("dojo.date.locale");
dojo.require("dojo.date.stamp");

dojo.declare("davinci.ui.ThemeSetsDialog",   null, {
    
    
    constructor : function(){

        this._connections = [];
        this._dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
        var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
        this._dialog = new dijit.Dialog({
            id: "manageThemeSets",
            title: langObj.themeSetsDialog,
            style:"width:300px; ",
            
        });
        dojo.connect(this._dialog, "onCancel", this, "onClose");
        dojo.create("div");
        var formHTML='<div id="manage_theme_sets_div" style="width:200px; height:300px;></div>';
        this._dialog.attr("content",formHTML);
        this._dialog.show();
        
            
        var mydata= {"identifier":"device","items":[{"theme":"iphone","device":"iPhone"},{"theme":"android","device":"Android"}]};
        this._themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly, true);
        var options = ['none','default'];
        var desktopThemes = {"identifier":"name","items":[]};
        for (var i = 0; i < this._themeData.length; i++){
            if (this._themeData[i].type === 'dojox.mobile'){
                options.push(this._themeData[i].name);
            } else {
                var item = {};
                item.name = this._themeData[i].name;
                desktopThemes.items.push(item); 
            }
            
        }
        var layout = [
            [{
            'name': 'Device',
            'field': 'device',
            'width': '125px;'
        },
        {
            'name': 'Theme',
            'field': 'theme',
            'cellType': dojox.grid.cells.Select,
            'options': options,
            'editable': true ,
            'width': '125px'
        }]];
        var themeStore = this._getThemeSetsDataStore();
        var store = new dojo.data.ItemFileWriteStore({data: mydata });
        var desktopThemeStore = new dojo.data.ItemFileWriteStore({data: desktopThemes });
        var filteringSelect = new dijit.form.ComboBox({
            id: "theme_select",
            name: "theme",
            value: davinci.theme.desktop_default,
            store: themeStore,
            searchAttr: "name"
        });
        
        var dtSelect = new dijit.form.FilteringSelect({
            id: "desktop_theme_select",
            name: "name",
            value: "claro",
            store: desktopThemeStore,
            searchAttr: "name"
        });

        div = dojo.create("div");
        var table = dojo.create("table");
        var tr = dojo.create("tr");
        var td = dojo.create("td");
        div.innerHTML= langObj.themeSetName;
        var deleteDiv = dojo.create("div");
        deleteDiv.innerHTML='<div id="theme_set_delete" class="projectToolbarDeleteIcon"></div>';
        dojo.place(table, this._dialog.containerNode,'first');
        dojo.place(tr, table);
        dojo.place(td, tr);
        dojo.place(div, td);
        td = dojo.create("td");
        dojo.place(td, tr);
        dojo.place(filteringSelect.domNode, td);
        td = dojo.create("td");
        dojo.place(td, tr);
        dojo.place(deleteDiv, td);
        tr = dojo.create("tr");
        dojo.place(tr, table);
        td = dojo.create("td");
        dojo.place(td, tr);
        div = dojo.create("div");
        div.innerHTML= langObj.desktopTheme;
        dojo.place(div, td);
        td = dojo.create("td");
        dojo.place(td, tr);
        dojo.place(dtSelect.domNode, td);
        td = dojo.create("td");
        dojo.place(td, tr);
        
        var grid = new dojox.grid.DataGrid({
            id: 'grid',
            store: store,
            structure: layout,
            style: 'width:275px; height:140px; margin-top:5px;',
            rowSelector: '20px'
        });
       dojo.place(grid.domNode, this._dialog.containerNode);
       div = dojo.create("div");
        div.innerHTML=  '<table style="width:100%;">'+
        '<tr><td style="text-align:right; width:80%;"><input type="button"  id="theme_select_ok_button" label="Save"></input></td><td><input type="button"  id="theme_select_cancel_button" label="Cancel"></input></td></tr>'+
        '</table>';
        dojo.place(div, this._dialog.containerNode);
       var button = new dijit.form.Button({label:"Save", id:"theme_select_ok_button" }, theme_select_ok_button);
       this._connections.push(dojo.connect(button, "onClick", this, "onOk"));
       button = new dijit.form.Button({label:"cancel", id:"theme_select_cancel_button" }, theme_select_cancel_button);
       this._connections.push(dojo.connect(button, "onClick", this, "onClose"));
        grid.startup();
        this._connections.push(dojo.connect(filteringSelect, "onChange", this, "onChange"));
        this._connections.push(dojo.connect(filteringSelect, "onBlur", this, "onBlur"));
        this._connections.push(dojo.connect(dtSelect, "onChange", this, "onDesktopChange"));
        this._connections.push(dojo.connect(deleteDiv, "onclick", this, "onDeleteThemeSet"));
        this.changeThemeSetStore(davinci.theme.desktop_default); 
        dojo.style('theme_set_delete', 'display', 'none');
    },
    
    onChange: function(e){

       var deleteDiv = dojo.byId('theme_set_delete');
       if (e === davinci.theme.desktop_default || e === davinci.theme.mobile_default){ // don't let the user delete the defaults
          dojo.style(deleteDiv, 'display', 'none');
       } else {
           dojo.style(deleteDiv, 'display', ''); 
       }
       this.changeThemeSetStore(e);
    },
    
    onBlur: function(e){

        var box = dijit.byId('theme_select');
        var value = box.attr("value");
        this.changeThemeSetStore(value);

    },
     
     onOk: function(e){
  
         this._updateThemeSetFromDataStore(this._currentThemeSet);
         davinci.workbench.Preferences.savePreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(),this._dojoThemeSets);
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
     
     onDesktopChange: function(e){

         if(e && e.length > 0){
             this._currentThemeSet.desktopTheme = e; 
         }
             
     },
     
     changeThemeSetStore: function(themeSet){
         
         var grid = dijit.byId('grid');
         this._updateThemeSetFromDataStore(this._currentThemeSet);
         var mydata= {"identifier":"device","items":[{"theme":"none","device":"Android"},{"theme":"none","device":"BlackBerry"},{"theme":"none","device":"iPad"},{"theme":"none","device":"iPhone"},{"theme":"none","device":"other"}]};  
         this._currentThemeSet = null;
         for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
             if (this._dojoThemeSets.themeSets[i].name === themeSet){
                 this._currentThemeSet = this._dojoThemeSets.themeSets[i];
                 var item = {};
                 var items = dojo.clone(this._currentThemeSet.mobileTheme);
                 mydata.items = items;
             }
         }
         if (!this._currentThemeSet){ // new theme set
             var newThemeSet = {};
             newThemeSet.name = themeSet;
             newThemeSet.desktopTheme = "claro";
             newThemeSet.mobileTheme = [{"theme":"none","device":"Android"},{"theme":"none","device":"BlackBerry"},{"theme":"none","device":"iPad"},{"theme":"none","device":"iPhone"},{"theme":"none","device":"other"}];
             this._dojoThemeSets.themeSets.push(newThemeSet);
             this._currentThemeSet = newThemeSet;
             var cb = dijit.byId('theme_select'); // add the new themeset to the combo
             var item = {};
             item.name = themeSet;
             cb.store.newItem(item);
             cb.store.save();
             cb.attr( 'value', themeSet); 
         }

         var store = new dojo.data.ItemFileWriteStore({data: mydata });
        
         grid.setStore(store);
         
         
     },
     
     _updateThemeSetFromDataStore: function(themeSet){
         var grid = dijit.byId('grid');
         if (themeSet){
              var currentStore = grid.store;
           //Fetch the data.
             currentStore.fetch({
                 query: {
                     device: "*"
                 },
                 onBegin: function(e){},
                 onComplete: function(items, request){
                     themeSet.mobileTheme = [];
                     for (var i = 0; i < items.length; i++) {
                         var item = items[i];
                         var themeItem = {};
                         themeItem.theme = item.theme[0];
                         themeItem.device = item.device[0];
                         themeSet.mobileTheme.push(themeItem);
                     }
                 },
                 onError: function(e){throw 'Error ThemeSetDialog_updateThemeSetFromDataStore';},
                 queryOptions: {
                     deep: true
                 }
             });
         }
     },
     
     _getThemeSetsDataStore: function(){
         
         var themeSets= {"identifier":"name","items":[]};

         if (!this._dojoThemeSets){
             this._dojoThemeSets = davinci.theme.dojoThemeSets;
         }
         for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
             var item = {};
             item.name = this._dojoThemeSets.themeSets[i].name;
             themeSets.items.push(item);
         }
         var themeStore = new dojo.data.ItemFileWriteStore({data: themeSets });
         return themeStore;
         
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
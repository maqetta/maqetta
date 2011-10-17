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
        debugger;
        this._connections = [];
       // var langObj = dojo.i18n.getLocalization("davinci.ui", "ui");
        var dialog = new dijit.Dialog({
            id: "manageThemeSets",
           // title:langObj.aboutMaqetta,
            title:'Manage theme sets',
            style:"width:300px; height: 300px;",
            onCancel:function(){
                this.destroyRecursive(false);
            }
        });
        dojo.create("div");
        var formHTML='<div id="manage_theme_sets_div" style="width:200px; height:300px;></div>';
        dialog.attr("content",formHTML);
        dialog.show();
        
            
        var mydata= {"identifier":"device","items":[{"theme":"iphone","device":"iPhone"},{"theme":"android","device":"Android"}]};
        var themes= {"identifier":"name","items":[{"name":"iphone"},{"name":"android"}]};
       
        var layout = [
            [{
            'name': 'Device',
            'field': 'device',
            'width': 'auto'
        },
        {
            'name': 'Theme',
            'field': 'theme',
            'cellType': dojox.grid.cells.Select,
            'options': ["android","iphone","blackberry"],
            'editable': true,
            'width': 'auto'
        }]];
        var themeStore = new dojo.data.ItemFileWriteStore({data: themes });
        var store = new dojo.data.ItemFileWriteStore({data: mydata });
        var filteringSelect = new dijit.form.ComboBox({
            id: "theme_select",
            name: "theme",
            value: "iphone",
            store: themeStore,
            searchAttr: "name"
        });
        //var div = dojo.byId('manage_theme_sets_div');

        div = dojo.create("div");
        
        div.innerHTML= 'Theme set name:' ;
        dojo.place(div,dialog.containerNode,'first');
        var grid = new dojox.grid.DataGrid({
            id: 'grid',
            store: store,
            structure: layout,
            style: 'width:275px; height:150px; margin-top:5px;',
            rowSelector: '20px'
        });
        
        dojo.place(filteringSelect.domNode,dialog.containerNode);
        dojo.place(grid.domNode,dialog.containerNode);
        dojo.style( div, 'display', 'initial');
        dojo.style( div, 'margin-right', '2px');
        div = dojo.create("div");
        div.innerHTML=  '<table style="width:100%;">'+
        '<tr><td style="text-align:right; width:80%;"><input type="button"  id="theme_select_ok_button" label="Ok"></input></td><td><input type="button"  id="theme_select_cancel_button" label="Cancel"></input></td></tr>'+
        '</table>';
        dojo.place(div,dialog.containerNode);
       var button = new dijit.form.Button({label:"ok", id:"theme_select_ok_button" }, theme_select_ok_button);
       var button = new dijit.form.Button({label:"cancel", id:"theme_select_cancel_button" }, theme_select_cancel_button);
        
       // dojo.place(grid.domNode,div);
       // div.appendChild(grid.domNode);
        
      
        grid.startup();
        this._connections.push(dojo.connect(filteringSelect, "onChange", this, "onChange"));
       // this._connections.push(dojo.connect(filteringSelect, "onKeyUp", this, "onChange"));
        this._connections.push(dojo.connect(filteringSelect, "onBlur", this, "onBlur"));
    },
    
    onChange: function(e){
       debugger; 
       this.changeThemeSetStore(e);
    },
    
    onBlur: function(e){

        var box = dijit.byId('theme_select');
        var value = box.attr("value");
        this.changeThemeSetStore(value);
        debugger;
     },
     
     changeThemeSetStore: function(themeSet){
         
         debugger;
         var mydata= {"identifier":"device","items":[{"theme":"iphone","device":"iPhone"},{"theme":"custom","device":"Android"}]};
         var store = new dojo.data.ItemFileWriteStore({data: mydata });
         var grid = dijit.byId('grid');
         grid.setStore(store);
         
         
     },
    
    _getTemplate: function(){
        var data='{"identifier":"name","items":[{"type":"city","name":"1"},{"type":"city","name":"2"}]}';
        var template = ''+
     //   '<span dojoType="dojo.data.ItemFileWriteStore"  jsId="jsonStore" data="'+dojo.toJson(data)+'"> </span>'+
        '<table dojoType="dojox.grid.DataGrid" jsid="grid" id="grid" store="jsonStore" query="{ name: '*' }" rowsPerPage="20" rowSelector="20px">'+
            '<thead>'+
               '<tr>'+
                    '<th field="name" width="300px">Country/Continent Name</th>'+
                    '<th field="type" width="auto" cellType="dojox.grid.cells.Select" options="country,city,continent" editable="true">Type</th>'+
               '</tr>'+
            '</thead>' +
        '</table>';
        return template;
    }
    

    

});
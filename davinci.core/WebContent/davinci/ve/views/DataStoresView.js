dojo.provide("davinci.ve.views.DataStoresView");

dojo.require("davinci.workbench.ViewPart");
dojo.require("davinci.ve.widget");

dojo.require("dijit.Tree");
dojo.require("dijit.tree.dndSource");

dojo.require("dijit.layout.BorderContainer");

dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.data.ItemFileWriteStore");

dojo.declare("davinci.ve.views.DataStoresView", [davinci.workbench.ViewPart], {

    treeStore: new dojo.data.ItemFileWriteStore({data: {identifier: "id", items:[]}}),

    postCreate: function() {
        this.inherited(arguments);
        
        this._mainBody = dojo.byId("mainBody");

        this.container = new dijit.layout.BorderContainer({
            style: "height: 300px"
        }, "DataStoresContainer");
        
        this.container.startup();

        this.setContent(this.container);
        
        this._showDataStores();
                
        this.subscribe("/davinci/ui/selectionChanged", this._selectionChanged);
        this.subscribe("/davinci/ui/editorSelected", this._editorSelected);
        this.subscribe("/davinci/ui/context/loaded", this._drawDataStoresFromDoc);

        this.subscribe("/davinci/data/datastoreAdded", this._addDataStore);
       
    },

    _selectionChanged: function(selection)
    {
        if (selection.length>0)
        {
            if (selection[0].model)
            {
            }
        }

    },
    
    _drawDataStoresFromDoc: function() {
        var y = dojo.query("[dojoType^='dojo.data']", this._context.getDocument());
        dojo.forEach(y, this._createDSFromWidget);
    },
    
    _createDSFromWidget: function(widget) {
        // TODO: this should support other DataStore types as well
        var ds;
        if (widget.getAttribute('url'))
            ds = new dojo.data.ItemFileReadStore({url: widget.getAttribute('url')});
        else if (widget.getAttribute('data'))
            ds = new dojo.data.ItemFileReadStore({data: dojo.fromJson(widget.getAttribute('data'))});
        if (ds)
            dojo.publish("/davinci/data/datastoreAdded", [widget.getAttribute('jsId'), ds, widget.type]);
    },
    
    _editorSelected: function (event){    
        var editor = event.editor;

        if (this._editor === editor)
            return;
        
        this._clearDataStores();

        if (editor && editor.getContext() && editor.getContext().getDocument ) {
            this._editor = editor;
            this._context = editor.getContext();
            this._drawDataStoresFromDoc(this._context);
        } else {
            delete this._editor;
            delete this._context;
        }
    },
    
    _clearDataStores: function(branchDS) {
        var dsId = branchDS || "*";
        
        var deleteItem = dojo.hitch(this.treeStore, this.treeStore.deleteItem);
        var save = dojo.hitch(this.treeStore, this.treeStore.save);
        
        this.treeStore.fetch({ query: {id: dsId+":*"}, queryOptions: {deep: true}, onItem: deleteItem });
        this.treeStore.fetch({ query: {id: dsId}, onItem: deleteItem, onComplete: save});
    },
    
    // add an item for the user DS to the tree DS
    _addDataStore: function(dsId, ds, dsClass) {

        // We need to do this here so that we'll be able to find out what
        // identifierAttribute was specified in the data file.
        ds._forceLoad();
        
        // need local var for since wrong "this" in addAttr()
        //var that = this;

        this._clearDataStores(dsId);
        
        // first add a branch for the datastore itself
        var dsAttrs = {id: dsId, sourceClass: "DataStore", label: dsId, dsId: dsId, children: []};
        if (ds.getIdentityAttributes() && ds.getIdentityAttributes().length > 0) {
            dsAttrs.attrId = ds.getIdentityAttributes[0];
        }
        var dsItem = this.treeStore.newItem(dsAttrs);
        this.treeStore.save();

        // callback for fetch, add each attribute as leaf on datastore branch
        var addAttrs = davinci.ve.views.DataStoresView.introspectItem(ds, dojo.hitch(this, function(attrName) {
            this.treeStore.newItem({id: dsId+":"+attrName, sourceClass: "Attribute", label: attrName, dsId: dsId, attrId: attrName}, {parent: dsItem, attribute: "children"});
            this.treeStore.save();            
        }));
        
        // find the first item in the DataStore, add it's attributes to the grid
        ds.fetch({count: "1", onItem: addAttrs});
    },
        
    // Build a tree of DataStores; each DS is a branch off the root.
    // Each attribute of the DS Schema is a leaf
    _showDataStores: function() {
        var dataStoresView = this;
        
        var treeModel = this.treeModel = new dijit.tree.ForestStoreModel({
            store: this.treeStore,
            query: {sourceClass: "DataStore"},
            labelAttr: "label",
            rootId: "root",
            rootLabel: "DataStores",
            childrenAttrs: ["children"]
        });
        
        var dragSources = [{dragHandler: "davinci.ve.palette.DataStoreDragSource",
                            parts: ["davinci.ve.datastores"],
                            dragSource: function() { return true; }
                          }];
        
        var getIconClass = function(/*dojo.data.Item*/ item, /*Boolean*/ opened){
            // summary:
            //      Overridable function to return CSS class name to display icon
            // tags:
            //      extension
            return (!item || treeModel.mayHaveChildren(item)) ? (opened ? "dataStoreOpened" : "dataStoreClosed") : "dataStoreLeaf";
        };


        var tree = new dijit.Tree({model: treeModel,
                                                getIconClass: getIconClass,
                                                dragSources: dragSources
                                               }
                                               , "dataSourcesTree");
        var popup = davinci.Workbench.createPopup({ partID: 'davinci.ve.datastores',
            domNode: tree.domNode, openCallback: tree.getMenuOpenCallback()});
        
        tree.notifySelect = dojo.hitch(this, function (item)
                {
                    this.publish("/davinci/ui/selectionChanged",[item,this]);
                }); 

        tree.startup();
        this.container.addChild(tree);        
    }


});

dojo.mixin(davinci.ve.views.DataStoresView, {
    loadType: function(data) {
        if(!data || !data.type){
            return false;
        }
        if( !davinci.Workbench.getOpenEditor().getContext().loadRequires(data.type,true)){
            return false;
        }
        var that = this;
        if(data.children && !dojo.isString(data.children)){
            if(!dojo.every(data.children, function(c){
                return that.loadType(c);
            }, this)){
                return false;
            }
        }
        return true;
    },

    // this function is bound to the "Generate Form" menu item in ui_plugin.js
    generateForm: function(dsId) {
        var form = this._createForm();
        dsId = dsId || this._getSelectedDsId();
        this.bindDS(form, dsId);        
    },
    
    _createForm: function() {
        var context = davinci.Workbench.getOpenEditor().getContext();
        var data = {type: "dijit.form.Form",
                properties: {style: "height: 250px; width: 350px;"},
                context: context, children: []};
        var form = undefined;
        this.loadType(data);
        dojo.withDoc(context.getDocument(), function() {
            form = davinci.ve.widget.createWidget(data);
        }, this);
        var command = new davinci.ve.commands.AddCommand(form, context.getContainerNode());
        context.getCommandStack().execute(command);
        return form;
    },

    // this function is bound to the "Generate Table" menu item in ui_plugin.js
    generateTable: function() {
        var table = this._createTable();
        var dsId = this._getSelectedDsId();
        this.bindDS(table, dsId);        
    },
    
    _createTable: function() {
        var context = davinci.Workbench.getOpenEditor().getContext();
        var data = { type: "dojox.grid.DataGrid", properties: { rowSelector: "20px" }, context: context };
        var table = undefined;
        this.loadType(data);
        dojo.withDoc(context.getDocument(), function() {
            table = davinci.ve.widget.createWidget(data);
        }, this);
        var command = new davinci.ve.commands.AddCommand(table, context.getContainerNode());
        context.getCommandStack().execute(command);
        return table;
    },
    
    _getSelectedDsId: function() {
        var context = davinci.Workbench.getOpenEditor().getContext();
        var selectedNode = davinci.Runtime.getSelection();
        var dsId = selectedNode.dsId;
        return dsId;
    },
    
    bindDS: function(widget, dsId, attrId) {
        var context = davinci.Workbench.getOpenEditor().getContext();
        while (dojo.isArrayLike(dsId))
            dsId = dsId[0];
        var ds = context.getDojo().getObject(dsId);
        
        var isForm = /^form$/i.test(widget._srcElement.tag);
        var hasStructure = !!davinci.ve.metadata.query(widget.type, "property.structure.defaultValue");
        
        var width = 60; // enough space for selector and scrollbar
        
        var that = this;

        var structure = null;        
        var addAttrs = davinci.ve.views.DataStoresView.introspectItem(ds, function(attrName) {
            structure.push({ field: attrName, name: attrName, width: "40px" });
            width += 45;
        });
        
        var children = null;
        var addChildren = davinci.ve.views.DataStoresView.introspectItem(ds, function(attrName) {
            var childData = {type: "html.div", children: [], properties: {}};
            childData.properties['style'] = "padding: 10px;";
            var labelData = {type: "html.label", children: attrName, properties: {}};
            labelData.properties['style'] = "width: 80px; float: left;";
            childData.children.push(labelData);
            var textData = {type: "dijit.form.TextBox", properties: {} };
            textData.properties['name'] = attrName;
            textData.properties['id'] = attrName;
            childData.children.push(textData);
            children.push(childData);
        });
        
        
        var updateWidget = function() {
            var properties;
            if (hasStructure) {
                var query = dojo.fromJson("{'"+ds.getIdentityAttributes()[0]+"': '*'}");
                properties = { store: ds, query: query, structure: structure, style: 'width: '+width+'px;' };
            } else if (attrId) {
                properties = { store: ds, searchAttr: attrId };
            } else {
                // this is a workaround to a bug where the id isn't properly set by the
                // masterdetail operation
                properties = { id: widget.attr('id') };
            }
            if (children) {
                that.loadType({type: widget.type, children: children});
            }
            var command = new davinci.ve.commands.ModifyCommand(widget, properties, children, context);
            context.getCommandStack().execute(command);
        };
        
        if (isForm) {
            children = [];
            ds.fetch({count: "1", onItem: addChildren, onComplete: updateWidget});
        }
        else if (hasStructure) {
            structure = [];
            ds.fetch({count: "1", onItem: addAttrs, onComplete: updateWidget});
        } else {
            updateWidget();
        }
    },
    
    introspectItem: function(ds, f) {
        return function(item) {
            var dsattrs = ds.getAttributes(item);
            for (var j=0; j<dsattrs.length; ++j) {
                var attrName = dsattrs[j];
                if ("_" != attrName[0]) {
                    f(attrName);
                }
            }
        };
    }
});

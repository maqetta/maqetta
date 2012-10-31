define([
        "dojo/_base/declare",
    	"./Action",
    	"../Workbench",
    	"davinci/ui/Dialog",
    	"../ui/SaveAsWidgetForm",
    	"dojo/i18n!../ui/nls/common"
], function(declare, Action, Workbench, Dialog, SaveAsWidgetForm, langObj){

return declare("davinci.actions.SaveAsWidget", Action, {

// XXX How do we handle the properties from the individual widgets?  Doesn't make sense to put them
//  all as properties of the composite widget.  Maybe present user with a dialog showing all the
//  properties from the widgets and allow user to select which properties to expose in composite
//  widget, or allow to add new ones.

    run: function(context) {
        if (context.declaredClass !== "davinci.ve.Context") {
            if (typeof context.getContext === "function") {
                context = context.getContext();
            } else {
                context = Workbench.getOpenEditor().getContext();
            }
        }
        
        var metadata = this._generateMetadata(context);
        this._showDialog(metadata);
    },
    
    _generateMetadata: function(context) {
        var metadata = {
                //name: "",
                //id: "",
                //version: "",
                spec: "1.0",
                require: [],
                library: {}
        };
        
        // get content for custom widget
        var body = context.model.find({elementType:'HTMLElement', tag:'body'}, true);
        metadata.content = dojo.trim(body.getText(context).match(/<body[^>]*>([\s\S]*)<\/body>/)[1]);
        
        // get required resources for custom widget
        this._getRequires(context.getTopWidgets(), metadata);
        
        return metadata;
    },
    
    /**
     * Iterate over all the widgets and save their required resources to the metadata.  Duplicate
     * resources are discarded.
     * 
     * @param {Object[]} widgets  
     * @param {Object} metadata
     */
    _getRequires: function(widgets, metadata) {
        function getreqs(widgets, metadata, types) {
            dojo.forEach(widgets, function(w) {
                if (!types.hasOwnProperty(w.type)) {
                    types[w.type] = true;
    
                    // Add required resources from this widget to the metadata of the custom widget.
                    // Omit duplicates.
                    dojo.forEach(w.metadata.require, function(r) {
                        if (!this._inRequiresArray(r, metadata.require)) {
                            metadata.require.push(r);
                        }
                    }, this);
                    
                    // Track libraries needed by the individual widgets that make up the
                    // custom widget.
                    for (var l in w.metadata.library) if (w.metadata.library.hasOwnProperty(l)) {
                        if (!metadata.library[l]) {
                            metadata.library[l] = w.metadata.library[l];
                        }
                    }
                }
                getreqs.call(this, w.getChildren(), metadata, types);
            }, this);
        }
        
        var types = types || {};
        getreqs.call(this, widgets, metadata, types);
        
        // consolidate consecutive requires with $text into a single element
        if (metadata.require.length > 1) {
            var r2 = metadata.require.slice(0,1);
            for (var i = 1; i < metadata.require.length; i++) {
                var req = metadata.require[i];
                if (req.$text && r2[r2.length - 1].$text) {
                    r2[r2.length - 1].$text += "\n" + req.$text;
                } else {
                    r2.push(req);
                }
            }
            metadata.require = r2;
        }
    },
    
    /**
     * Checks if the given resource is already in the requires array.
     * 
     * @param {Object} req
     * @param {Object[]} array
     * @returns {Boolean}  True if the resource already exists in the array; false otherwise.
     */
    _inRequiresArray: function(req, array) {
        // if the resource has text, collapse whitespace to allow comparisons.
        var reqText = req.$text ? req.$text.replace(/\s/g, " ") : "";
        
        return dojo.some(array, function(item) {
            // XXX cache whitespace-collapsed version of item.$text for performance
            return (req.type === item.type &&
                    ((req.src && item.src && req.src === item.src &&
                      ((req.$library && item.$library && req.$library === item.$library) ||
                       (!req.$library && !item.$library))) ||
                     (req.$text && item.$text && reqText === item.$text.replace(/\s/g, " "))));
        });
    },
    
    _showDialog: function(metadata) {
        var formDialog = new Dialog({
            title: langObj.sawdTitle,
            "class": "dvSaveAsWidgetDialog",
            execute: dojo.hitch(this, function() {
                this._saveMetadata(arguments[0].metadata);
            }),
            onHide: function() {
                setTimeout(function() {
                    formDialog.destroyRecursive();
                }, formDialog.duration);
            }
        });
        
        var form = new SaveAsWidgetForm({
            parentId: formDialog.id,
            metadata: metadata
        });
        
        formDialog.set("content", form);
        formDialog.show();
    },
    
    _saveMetadata: function(metadata) {
        console.log("Custom Widget Metadata:");
        console.dir(metadata);
    }
});
});

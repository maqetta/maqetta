dojo.provide("davinci.ui.SaveAsWidgetForm");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");

dojo.requireLocalization("davinci.ui", "common");


dojo.declare("davinci.ui.SaveAsWidgetForm", [ dijit._Widget, dijit._Templated ], {
    
    templateString : dojo.cache("davinci.ui", "templates/SaveAsWidgetForm.html"),
    widgetsInTemplate : true,
    
    postMixInProperties : function() {
        // perform NLS substitutions
        var nls = dojo.i18n.getLocalization("davinci.ui", "common");
        this.descriptionString = nls.sawfDesc;
        this.nameString = nls.name;
        this.idString = nls.id;
        this.versionString = nls.version;
        this.requiredString = nls.required;
        this.saveString = nls.save;
        this.cancelString = nls.cancel;
        this.metadataTitle = nls.sawfMetadataTitle;
        
        this.namePromptString = nls.sawfNamePrompt;
        this.idPromptString = nls.sawfIdPrompt;
        
        // set initial value for textarea
        this.initialTextareaContent = dojo.toJson(this.metadata, true);
    },
    
    postCreate : function() {
        this.inherited(arguments);
        
        // create onChange connections to the entry fields
        var connections = [ "nameInputNode", "idInputNode", "versionInputNode", "textareaNode" ];
        dojo.forEach(connections, function(item) {
            this.connect(this[item], "onChange", function() {
                this._onChange(item, arguments[0]);
            })
        }, this);
        
        // create simple URI validation regex for the "ID" field
        this.idInputNode.regExp = "[a-zA-Z]+://[^\\s]+";
        
        // connect the Cancel button to dismiss the parent dialog
        this.connect(this.buttonCancel, "onClick", function() {
            dijit.byId(this.parentId).hide();
        });
    },
    
    _onChange : function(name, newVal) {
        switch (name) {
            case "nameInputNode":
                this.metadata.name = newVal;
                break;
            case "idInputNode":
                this.metadata.id = newVal;
                break;
            case "versionInputNode":
                this.metadata.version = newVal;
                break;
            case "textareaNode":
                try {
                    this.metadata = dojo.fromJson(newVal);
                    this._invalidMetadata = false;
                } catch (e) {
                    this._invalidMetadata = true;
                }
                break;
        }
        
        // Update the text in the textarea with the new values
        if (name !== "textareaNode") {
            this.textareaNode.set("value", dojo.toJson(this.metadata, true));
        }
        
        // set "Save" button state, depending on validity of metadata
        this.buttonSave.set("disabled", !this._isValid());
    },
    
    _isValid : function() {
        return this.idInputNode.isValid() && !this._invalidMetadata;
    }

});
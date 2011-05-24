dojo.provide("dojoy.ve.dialogs.TreeDataPane");

dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.TextBox");
dojo.require("dojoy.edit.dialogs");
dojo.require("dojoy.edit.dialogs._Pane");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("dojoy.edit.dialogs.PropertyValuesStore");
dojo.require("davinci.ve.widget");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.ModifyCommand");

dojo.declare("dojoy.ve.dialogs.TreeDataPane", [dijit._Widget, dijit._Templated, dojoy.edit.dialogs._Pane], {
	// summary:
	//		Pane for configuring a ForestStoreModel.
	//

	templateString: "<div><table style='margin: 4px;' cellspacing='4'><tbody>" +
		"<tr><td>${_loc.dataStore}:</td><td><div dojoAttachPoint='storeBoxNode'></div></td></tr>" +
		"<tr><td>${_loc.query}:</td><td><div dojoAttachPoint='queryBoxNode'></div></td></tr>" +
		"<tr><td>${_loc.rootId}:</td><td><div dojoAttachPoint='idBoxNode'></div></td></tr>" +
		"<tr><td>${_loc.rootLabel}:</td><td><div dojoAttachPoint='labelBoxNode'></div></td></tr>" +
		"<tr><td>${_loc.childrenAttrs}:</td><td><div dojoAttachPoint='attrsBoxNode'></div></td></tr>" +
		"</tbody></table></div>",

	postCreate: function(){
		// summary:
		//		Override to display ForestStoreModel parameters.
		//
		
		// store
		this._objectStore = new dojoy.edit.dialogs.PropertyValuesStore({});
		this._storeBox = new dijit.form.ComboBox({id: dojoy.edit.dialogs.getUniqueId(),
			store: this._objectStore}, this.storeBoxNode);
		// query
		this._queryBox = new dijit.form.TextBox({id: dojoy.edit.dialogs.getUniqueId()}, this.queryBoxNode);
		// root id
		this._idBox = new dijit.form.TextBox({id: dojoy.edit.dialogs.getUniqueId()}, this.idBoxNode);
		// root label
		this._labelBox = new dijit.form.TextBox({id: dojoy.edit.dialogs.getUniqueId()}, this.labelBoxNode);
		// childrenAttrs
		this._attrsBox = new dijit.form.TextBox({id: dojoy.edit.dialogs.getUniqueId()}, this.attrsBoxNode);
	},

	update: function(/*Widget*/ widget){
		// summary:
		//		Updates the UI based on the passed Tree's ForestStoreModel.
		//
		this._id = undefined;
		if(!this._context || !widget){
			return;
		}
		this._id = widget.id;

		var model = widget.model;
		if(model){
			var objectIds = this._context.getObjectIds();
			if(!objectIds || objectIds.length === 0){
				objectIds = [""];
			}
			this._objectStore.setValues(objectIds);
			var storeId = davinci.ve.widget.getObjectId(model.store);
			this._storeBox.setValue(storeId);
			var query = model.query;
			if(query){
				if(dojo.isObject(query)){
					query = dojo.toJson(query);
				}
			}else{
				query = "";
			}
			this._queryBox.setValue(query);
			this._idBox.setValue(model.rootId);
			this._labelBox.setValue(model.rootLabel);
			this._attrsBox.setValue(model.childrenAttrs);
		}
	},

	getCommand: function(){
		// summary:
		//		Returns a CompondCommand to the undo/redo stack that records the changes the user made to the Tree.
		//		The command adds the updated model to the Tree as a sibling to the Tree, and as a modified property.
		//
		if(!this._context || !this._id){
			return undefined;
		}
		var widget = davinci.ve.widget.byId(this._id, this._context.getDocument());
		if(!widget){
			return undefined;
		}

		var store = undefined;
		var storeId = this._storeBox.getValue();
		if(storeId){
			store = this._context.getDojo().getObject(storeId);
		}
		var query = this._queryBox.getValue();
		if(query){
			if(query.charAt(0) == "{"){
				var q = undefined;
				try {
					q = dojo.fromJson(query);
				}catch(e){
				}
				query = q;
			}
		}else{
			query = null;
		}
		var rootId = this._idBox.getValue();
		var rootLabel = this._labelBox.getValue();
		var childrenAttrs = this._attrsBox.getValue();
		if(childrenAttrs){
			childrenAttrs = childrenAttrs.split(",");
		}else{
			childrenAttrs = ["children"];
		}

		var command = new davinci.commands.CompoundCommand();
		var model = widget.model;
		var modelWidget = undefined;
		if(model){
			modelWidget = this._getModelWidget(model);
			if(modelWidget){
				command.add(new dojoy.ve.commands.RemoveCommand(modelWidget));
			}
		}
		var id = davinci.ve.widget.getId(widget);
		var modelId = (id ? id + "_model" : davinci.ve.widget.getUniqueObjectId("ForestStoreModel", widget.domNode));
		if(!store){
			// TODO: how to restore dummy store when loaded from source?
			var c = this._context.getDojo().getObject("dojo.data.ItemFileReadStore");
			store = new c({data: {items: []}}); // dummy store
		}
		var data = {type: "dijit.tree.ForestStoreModel", properties: {jsId: modelId,
			store: store, query: query, rootId: rootId, rootLabel: rootLabel, childrenAttrs: childrenAttrs}};
		dojo.withDoc(this._context.getDocument(), function(){
			modelWidget = davinci.ve.widget.createWidget(data);
		});
		var parent = davinci.ve.widget.getParent(widget);
		command.add(new davinci.ve.commands.AddCommand(modelWidget, parent, widget));
		model = this._context.getDojo().getObject(modelId);
		command.add(new davinci.ve.commands.ModifyCommand(widget, {model: model}));
		return command;
	},

	_getModelWidget: function(model){
		var id = davinci.ve.widget.getObjectId(model);
		if(!id){
			return undefined;
		}
		return dojo.query("> [jsId='" + id + "']", this._context.getContainerNode()).map(davinci.ve.widget.byNode)[0];
	}

});

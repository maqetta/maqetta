define([
	"dojo/_base/declare",
	"dojo/data/ItemFileReadStore",
	"davinci/Runtime",
	"davinci/ve/input/SmartInput",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/commands/RemoveCommand",
	"davinci/ve/widget",
	"system/resource",
	"dijit/Dialog",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!../nls/dojo",
	"davinci/ve/utils/URLRewrite"
], function(
	declare,
	ItemFileReadStore,
	Runtime,
	SmartInput,
	ModifyCommand,
	RemoveCommand,
	Widget,
	Resource,
	Dialog,
	commonNls,
	dojoNls,
	URLRewrite
) {

return declare(SmartInput, {

	propertyName: null,

	property: null,
	
	displayOnCreate: "true",
	
	delimiter: ", ",
	
	propertyNames: "jsId, url",
	
	properties: "myDataStore, /davinci/davinciUser/data.json",
	
	serialize: function(widget, callback, value) {
		callback(this.properties); 
	},
	
	parse: function(input) {
		var result = this.parseItemsInColumns(input);
		return result;
	},
	
	update: function(widget, values) {
		var names = this.propertyNames.split(",");
		var props = {};
		for (var i=0; i<values.length; ++i) {
			if (i < names.length) {
				var name = dojo.trim(names[i]);
				props[name] = values[i].text;
			}
		}
		var command = new ModifyCommand(widget, props, null, this._getContext());
		this._getContext().getCommandStack().execute(command);
		var widget = command.newWidget;
		// this works just as well for ItemFileWriteStore
		var ds = new ItemFileReadStore({url: props.url});
		var dsId = props.jsId;
		dojo.publish("/davinci/data/datastoreAdded", [dsId, ds, widget.type]);
	},
	
	_getContainer: function(widget){
		while(widget){
			if ((widget.isContainer || widget.isLayoutContainer) && widget.declaredClass != "dojox.layout.ScrollPane"){
				return widget;
			}
			console.error("unexpected?"); //debugger;
			widget = Widget.getParent(widget); 
		}
		return undefined;
	},
	
	_getEditor: function() {
		return Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this._getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	},
	
	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);
		this._inline = new Dialog({
			title: dojoNls.dataStoreDetails,
			style: "width: 500px; height:350px"
		});
		
		// XXX TODO Move to HTML template file.
		var s = '<div data-dojo-type="dijit/layout/BorderContainer" design="headline" livesplitters="true" iscontainer="true" style="height: 300px; width: 480px; padding: 0px;">';
		s    += '    <div data-dojo-type="dijit/layout/ContentPane" parseonload="true" iscontainer="true" region="bottom" style="height: 50px; bottom: 5px; left: 78px; right: 78px;" splitter="true">';
		s    += '        <input id="okButton" type="button" data-dojo-type="dijit/form/Button" label="'+commonNls.buttonOk+'" showlabel="true" scrollonfocus="true" style="top: 20px; left: 95px; position: absolute;">';
		s    += '        <input id="cancelButton" type="button" data-dojo-type="dijit/form/Button" label="'+commonNls.buttonCancel+'" showlabel="true" scrollonfocus="true" style="left: 145px; top: 20px; position: absolute;">';
		s    += '    </div>';
		s    += '    <div data-dojo-type="dijit/layout/ContentPane" parseonload="true" iscontainer="true" region="center" style="top: 78px; left: 78px; right: 78px; bottom: 78px;">';
		s    += '        <div style="width: 282px; height: 37px;">';
		s    += '            <label id="LABEL_T" style="left: 15px; position: absolute; top: 20px;">Type</label>';
		s    += '            <select id="typeInput" type="text" data-dojo-type="dijit/form/Select" style="position: absolute; left: 100px; top: 18px; width: 350px;">';
		s    += '                <option value="dojo/data/ItemFileReadStore">'+dojoNls.itemFileReadStore+'</option>';
		s    += '                <option value="dojo/data/ItemFileWriteStore">'+dojoNls.itemFileWriteStore+'</option>';
		s    += '            </select>';
		s    += '        </div>';
		s    += '        <div style="width: 282px; height: 37px;">';
		s    += '            <label id="LABEL_0" style="left: 15px; position: absolute; top: 55px;">'+dojoNls.dataStoreId+'</label>';
		s    += '            <input id="jsIdInput" type="text" data-dojo-type="dijit/form/TextBox" style="position: absolute; left: 100px; top: 55px; width: 350px;">';
		s    += '        </div>';
		s    += '        <div style="width: 282px; height: 37px;">';
		s    += '            <label id="LABEL_1" style="left: 15px; position: absolute; top: 90px;">'+dojoNls.url+'</label>';
		s    += '            <input id="urlInput" type="text" data-dojo-type="dijit/form/TextBox" style="top: 90px; left: 100px; position: absolute; width: 350px;">';
		s    += '        </div>';
		s    += '        <div style="width: 282px; height: 37px;">';
		s    += '            <label id="LABEL_2" style="left: 15px; position: absolute; top: 125px;">'+dojoNls.scriptLabel+'</label>';
		s    += '            <input id="scriptInput" type="text" data-dojo-type="dijit/form/Textarea" style="top: 125px; left: 100px; position: absolute; width: 350px;">';
		s    += '        </div>';
		s    += '    </div>';
		s    += '</div>';
		
		this._inline.attr("content", s);
		this._inline.onCancel = dojo.hitch(this, "cancel");
		this._inline.callBackObj = this;
		this._inline.show();
		
		var typeInput = dijit.byId("typeInput");
		var type = this._widget.type;
		typeInput.setValue(type);
		
		var jsIdInput = dijit.byId("jsIdInput");
		var jsId = this._widget._srcElement.getAttribute("jsId") || "myDataStore";
		jsIdInput.setValue(jsId);

		var urlInput = dijit.byId("urlInput");
		var url = this._widget._srcElement.getAttribute("url");
		if (url) {
			if (url[0]===".") {
				url = url.substring(1);
			}
			urlInput.setValue(URLRewrite.encodeURI(Resource.root.getURL()+url));
		}
		var scriptInput = dijit.byId("scriptInput");
		var script = this._widget._srcElement.getAttribute("data");
		if (script) {
			scriptInput.setValue(script);
		}
		
		var okButton = dijit.byId("okButton");
		okButton.onClick = dojo.hitch(this, "updateWidget");
		var cancelButton = dijit.byId("cancelButton");
		cancelButton.onClick = dojo.hitch(this, "cancel");
	},
	
	cancel: function() {
		var command = new RemoveCommand(this._widget);
		this._getContext().getCommandStack().execute(command);
		this.die();
	},
	
	die: function() {
		this._inline.destroyDescendants();
		this._inline.destroy();
		delete this._inline;
	},

	updateWidget: function() {
		var props = {};
		var jsId = dijit.byId("jsIdInput");
		props.jsId = jsId.getValue();
		var urlInput = dijit.byId("urlInput");
		var url = urlInput.getValue();
		if (url && url > "") {
			props.url = url;
		}
		var scriptInput = dijit.byId("scriptInput");
		var script = scriptInput.getValue();
		if (script && script > "") {
			props.data = dojo.fromJson(script);
		}
		var typeInput = dijit.byId("typeInput");
		this._widget.type = typeInput.getValue();
		this.die();
		var command = new ModifyCommand(this._widget, props, null, this._getContext());
		this._getContext().getCommandStack().execute(command);
		// this works just as well for ItemFileWriteStore
		var ds;
		if (url && url > "") {
			ds = new ItemFileReadStore({url: props.url});
		} else if (script && script > "") {
			ds = new ItemFileReadStore({data: props.data});
		}
		var dsId = props.jsId;
		dojo.publish("/davinci/data/datastoreAdded", [dsId, ds, this._widget.type]);
	}

});

});
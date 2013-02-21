define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/connect",
	"dojo/dom-style",
	// XXX TODO This file (and others) makes too much use of style.set().  Need
	//   to refactor this and create one (or more) CSS classes that can be set
	//   on the outermost element of this widget -- setting/unsetting this class
	//   then sets the proper CSS on interior elements.
	"dojo/dom",
	"dojo/dom-class",
	"dijit/registry",
	"davinci/Runtime",
	"davinci/ve/input/SmartInput",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/RemoveCommand",
	"davinci/commands/OrderedCompoundCommand",
	"davinci/model/Path",
	"davinci/ui/Dialog",
	"davinci/ui/widgets/OpenFile",
	"dijit/layout/ContentPane",
	"dijit/form/Button",
	"system/resource",
	"dojo/dom-attr",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!../../dojox/nls/dojox",
	"dojo/text!./templates/dojoStoreBasedWidgetInput.html",
	"davinci/ve/utils/URLRewrite",
	"dojox/form/DropDownSelect",	// used in template
	"davinci/css!./templates/dojoStoreBasedWidgetInput.css",
], function(
	declare,
	lang,
	connect,
	style,
	dom,
	domClass,
	registry,
	Runtime,
	SmartInput,
	Widget,
	ModifyCommand,
	AddCommand,
	RemoveCommand,
	OrderedCompoundCommand,
	Path,
	Dialog,
	OpenFile,
	ContentPane,
	Button,
	resource,
	domAttr,
	commonNls,
	dojoxNls,
	mainTemplateString,
	URLRewrite
	/*DropDownSelect*/
) {

/* 
 * Returns a new string appropriate for data-dojo-props with the property updated (or added if not 
 * present). This is a helper function that will be made available for "static" use.
 * 
 * NOTE: This function is NOT a general handler for data-dojo-props and is really tailored to our DataStoreBasedWidget's (in
 * particular GridX). The reasons for this follow...
 * 
 * In the simplest case, a value for data-dojo-props will be in on the form of:
 * 
 *  	"[propId1]:[propValue1],[propId2]:[propValue2],[propId3]:[propValue3],..."
 *  
 *  However, it is NOT sufficient to split the value into its component parts by doing value.split(","). We
 *  were getting away with that until recently when we added handling of "structure" to the data-dojo-props. 
 *  
 *  The "structure" attribute is represented as an array:
 *  
 *      data-dojo-props="cacheClass: 'gridx/core/model/cache/Async',store:ItemFileReadStore_1,structure:[{field: 'id', name: 'ID', width: '50px'}, {field: 'id', name: 'Label', width: '150px'}]"
		
 *  We also can't do JSON.parse (fails with parse errors) as the value of data-dojo-props is really intended to a JavaScript expression to be eval'ed by the 
 *  Dojo parser in the context of the page. Something roughly like:
 *  
 *      var dataDojoPropsEval = dojoFromPageContext.eval("({" + dataDojoPropsValue + "})");
 *   
 *  But, there are some reasons we can't really do that here either:
 *  
 *      - the eval only works if the value of store (e.g., ItemFileReadStore_1) is set in the page context. Given we're trying to edit 
 *        the data-dojo-props string with new store ids, structures, etc. we certainly can't assume an appropriate store has already been created.
 *      - we can't just do a JSON.stringify on the result of the eval and put it back in the declarative HTML for reasons such as:
 *          - when the eval is successful, we end up with an actual ItemFileReadStore in the eval result
 * 
 *  So, in the end, we're going to take a simple approach and do some special casing related to "structure". When we handle data-dojo-props across the 
 *  board in all widgets, we'll need a more robust solution (that might likely involve parsing/modeling using classes in the davinci/js package).
 */  
setPropInDataDojoProps = function(dataDojoPropsValue, propId, propValue) {
	var newDataDojoProps = "";
	if (dataDojoPropsValue) {
		// As a convenience to the caller, if we're going to be setting "structure" then convert
		// propValue to an appropriate format for data-dojo-props
		if (propId === "structure") {
			propValue = getStructureForDataDojoProps(propValue);
		}
		
		// First look for pattern with a starting "[" and "]" bracket which we'll assume is a properly formed 
		// array for "structure". We'll temporarily replace the bracketed expression so we can split the string
		var matchedArrays = dataDojoPropsValue.match(/\[.*\]/g);
		if (matchedArrays && matchedArrays.length == 1) {
			dataDojoPropsValue = dataDojoPropsValue.replace(matchedArrays[0], "${" + 0 + "}");
		}
		
		//Split the string
		var keyValuePairs = dataDojoPropsValue.split(",");
		
		//Loop on the pairs to see if property of interest is already set
		var propFound = false;
		dojo.some(keyValuePairs, function(pair, index) {
			var pairSplit = pair.split(":");
			if (pairSplit[0].trim() === propId) {
				//Found prop of interest, so replace its value with the new value
				pairSplit[1] = propValue;
				keyValuePairs[index] = pairSplit.join(":");
				propFound = true;
				return propFound;
			}
		});
		
		if (!propFound) {
			//Didn't find the prop while looping, so push new key, value pair
			keyValuePairs.push(propId + ":" + propValue);
		}
		
		//Join all of the pairs back into one comma-delimited string
		newDataDojoProps = keyValuePairs.join(",");
		
		//Put the bracketed expression back in (if substitution string wasn't replaced by propValue)
		if (matchedArrays && matchedArrays.length == 1) {
			newDataDojoProps = newDataDojoProps.replace("${" + 0 + "}", matchedArrays[0]);
		}
	} else {
		// We had no value for dataDojoPropsValue, so this new property will 
		// be the first and only entry for now
		newDataDojoProps = propId + ":" + propValue;
	}
	
	return newDataDojoProps;
};

var getStructureForDataDojoProps = function(structure) {
	// Build up string representing array for structure... can NOT do JSON.stringify
	// as that doesn't work within data-dojo-props
	var convertedStructureElements = [];
	dojo.forEach(structure, function(structureElement) {
		var convertedStructureElementEntries = [];
		for (name in structureElement) {
			if (structureElement.hasOwnProperty(name)) {
				if (name != "cellType") {
					convertedStructureElementEntries.push(name + ":'" + structureElement[name].trim() + "'");
				}
			}
		}
		convertedStructureElements.push("{" + convertedStructureElementEntries.join(",") + "}");
	});
	var structureString = "[" + convertedStructureElements.join(",") + "]";
	return structureString;
};
	
/* 
 * Returns the id of the data store for this element. This is a helper function that will be made 
 * available for "static" use.
 *  
 */ 
getStoreId = function(widget) {
	var storeId = "";
	if (widget.dijitWidget && widget.dijitWidget.store) {
		var store = widget.dijitWidget.store;
		storeId = store.id ? store.id : store._edit_object_id;
	} 
	
	return storeId;
};

var DataStoreBasedWidgetInput = declare(SmartInput, {

	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",
	supportsHTML: "false", 
	//helpText: 'First line is column headers separated by commons all following lines are data for those columns.',

	helpText: 'If the CSV data format is selected enter text in the format: first line is column headers separated by commas all following lines are data for those columns.'+
	          ' If data file from workspace is selected chose a json item file using the file explore folder.',

	_substitutedMainTemplate: null,
	_dataType: null,
	
	_useDataDojoProps: false,
	
	supportsEscapeHTMLInData: true,
	
	_embeddingContentPane: null,

	_getContainer: function(widget){
		while(widget){
			if ((widget.isContainer || widget.isLayoutContainer) && widget.declaredClass != "dojox.layout.ScrollPane"){
				return widget;
			}
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
	
	refreshStoreView: function(){
		var textArea = registry.byId("davinciIleb"),
			value ='';
		this._widget.dijitWidget.store.fetch({
			query: this.query, // XXX No `query` func on this obj
			queryOptions:{deep:true}, 
			onComplete: function(items) {
				items.forEach(function(item){
					value += item.label[0];
					if (item.moveTo){
						value += ', ' + item.moveTo[0];
					}
					value += '\n';
				});
				this._data = value;
				textArea.attr('value', String(value));
			}.bind(this)
		});
	},
	
	onOk: function(e){
		if (this._fileSelectionDialog){
			// file selection dialog is active so don't close inline edit
			return;
		}

		// clear data type
		this._dataType = null;

		//Execute update command on callback
		this.getUpdateWidgetCommand(this._executeCompoundCommand.bind(this));

		//Hide
		this.hide(); 
	},

	/*
	 * This will cause the compound command necessary to update the widget and
	 * data store to be generated. The command is NOT executed, but instead passed
	 * to a callback function (which can execute the command if it desires). 
	 * 
	 * This function is asynchronous because the "file" and "url" data store types
	 * require a fetch on the data store to calculate the required command.
	 */
	getUpdateWidgetCommand: function(updateCommandCallback){ 
		// clear data type
		this._dataType = null;

		if (this._dataStoreType === 'dummyData'){
			this._getDummyDataUpdateWidgetCommand(updateCommandCallback);
		} else if (this._dataStoreType === 'file'){
			this._format = this.getFormat();
			compoundCommand = this._getUpdateWidgetForUrlStoreCommand(updateCommandCallback);
		} else if (this._dataStoreType === 'url'){
			this._format = this.getFormat();
			compoundCommand = this._getUpdateWidgetForUrlStoreJSONP(updateCommandCallback); 
		}
	},

	hide: function(){
		if (this._isEmbedded()) {
			if (this._inline) {
				this._connection.forEach(dojo.disconnect);
				this._inline.destroyRecursive();
				delete this._inline;  
			}
		} else {
			this.inherited(arguments, [ true ]); // we already updated the widget so just do a hide like cancel
		}
	},
	
	updateWidget: function() {
		this._getDummyDataUpdateWidgetCommand(this._executeCompoundCommand.bind(this));
	},
	
	_executeCompoundCommand: function(compoundCommand) {
		var context = this._getContext();
		context.getCommandStack().execute(compoundCommand);
		context.select(this._getNewWidgetFromCompoundCommand(compoundCommand));
	},
	
	_getDummyDataUpdateWidgetCommand: function(updateCommandCallback) {
		var context = this._getContext();
		var widget = this._widget;

		var storeId = this._getStoreId(widget);
		var storeWidget = Widget.byId(storeId);

		var compoundCommand = new OrderedCompoundCommand();

		// remove the old store
		var storeWidgetParent = storeWidget.getParent();
		var oldStoreWidgetIndex = (storeWidgetParent.indexOf(widget) < 1) ? 0 : storeWidgetParent.indexOf(widget)-1;
		var removeCmd = new RemoveCommand(storeWidget);
		compoundCommand.add(removeCmd);
		
		// id for the new store
		var newStoreId = storeId;
		if (storeWidget.type != "dojo/data/ItemFileReadStore") {
			newStoreId = Widget.getUniqueObjectId("dojo/data/ItemFileReadStore", context.getDocument());
		}

		var data = {
			"type": "dojo/data/ItemFileReadStore",
			"properties": {
				id: newStoreId,
				jsId: newStoreId,
				url: '',
				data: this.buildData()
			},
			context: context,
		};

		// add the new store (in the same place it was before we deleted the old one)
		var addCmd = new AddCommand(data, widget.getParent(), oldStoreWidgetIndex);
		compoundCommand.add(addCmd);

		// create the item store (which must be created in context of page)
		var global = this._widget.getContext().getGlobal();
		global['require']([
			'dojo/data/ItemFileReadStore'
		], function(ItemFileReadStore) {
			//modify the widget using the store
			var newStore = new ItemFileReadStore({data: data.properties.data});
			// hack: pass id around for now, as we are passing an object but string may be expected
			newStore.id = newStoreId;
			var props = this._getPropsForDummyDataUpdateWidgetCommand(widget);
			props = this._getPropsForNewStore(widget, newStore, props);
			var command = new ModifyCommand(widget,
				props,
				null,
				context
			);
			compoundCommand.add(command);

			//Callback with the new command
			updateCommandCallback(compoundCommand);
		}.bind(this));
	},
	
	//Subclass can override
	_getPropsForDummyDataUpdateWidgetCommand: function() {
		return {};
	},
	
	_getPropsForNewStore: function(widget, store, modifiedProps) {
		var props = {};
		if (modifiedProps) {
			props = dojo.mixin(props, modifiedProps);
		}
		
		if (store) {
			if (this._useDataDojoProps) {
				var currentDataDojoProps = null;
				if (modifiedProps) {
					currentDataDojoProps = props["data-dojo-props"];
				}
				if (!currentDataDojoProps) {
					var widgetData = widget.getData();
					currentDataDojoProps = widgetData.properties["data-dojo-props"];
				}
				props["data-dojo-props"] =  
					DataStoreBasedWidgetInput.setPropInDataDojoProps(currentDataDojoProps, "store", store.id); 
			} 
			props.store = store;
		}
		
		return props;
	},
	
	_getNewWidgetFromCompoundCommand: function(compoundCommand) {
		var lastCommand = compoundCommand._commands[compoundCommand._commands.length-1];
		return lastCommand.newWidget;
	},
		
	updateWidgetForUrlStore: function(){
		this._getUpdateWidgetForUrlStoreCommand(this._executeCompoundCommand.bind(this));
	},
	
	_getUpdateWidgetForUrlStoreCommand: function(updateCommandCallback) {
		var textArea = registry.byId("davinciIleb");
		this._url = textArea.value;
		var url = this._getFullUrl(this._url);

		// clear any callbacks
		this._callback = '';

		//create onComplete callback function
		var onComplete = function(items) {
			this._urlDataStoreLoaded(items, updateCommandCallback);
		};
		
		//create onComplete callback function
		var onError = function() {
			this._getCsvStore(url, this.query, updateCommandCallback);
		};

		// data store must be created in context of page
		var global = this._widget.getContext().getGlobal();
		global['require']([
			'dojo/data/ItemFileReadStore'
		], function(ItemFileReadStore) {
			// data can be json or csv, so interogate the url
			var store = this._urlDataStore = new ItemFileReadStore({url: url});
			store.fetch({
				query: this.query,
				queryOptions: {deep: true},
				onComplete: onComplete.bind(this),
				onError: onError.bind(this)
			});
		}.bind(this));
	},

	_getCsvStore: function(url, query, updateCommandCallback) {
		this._dataType = "csv";
		
		//create onComplete callback function
		var onComplete = function(items) {
			this._urlDataStoreLoaded(items, updateCommandCallback);
		};

		// data store must be created in context of page
		var global = this._widget.getContext().getGlobal();
		global['require']([
			'dojox/data/CsvStore'
		], function(CsvStore) {
			var store = this._urlDataStore = new CsvStore({url: url});
			store.fetch({
				query: query,
				queryOptions: {deep: true},
				onComplete: onComplete.bind(this),
				onError: function(e){
					console.error("DataStoreBasedWidgetInput._getCsvStore error using url = " + url + "; e = " + e);
					alert('File ' + e);
				}
			});
		}.bind(this));
	},

	updateWidgetForUrlStoreJSONP: function() {
		this._getUpdateWidgetForUrlStoreJSONP(this._executeCompoundCommand.bind(this));
	},
	
	_getUpdateWidgetForUrlStoreJSONP: function(updateCommandCallback) {
		var textArea = dijit.byId("davinciIleb");
		var callbackTextBox = dijit.byId("davinci.ve.input.SmartInput_callback_editbox");
		this._url = textArea.value;
		var url = this._getFullUrl(this._url);

		this._callback = callbackTextBox.value;
		
		//create onComplete callback function
		var onComplete = function(items) {
			this._urlDataStoreLoaded(items, updateCommandCallback);
		};

		// data store must be created in context of page
		var global = this._widget.getContext().getGlobal();
		global['require']([
			'dojo/data/ItemFileReadStore',
			'dojox/io/xhrScriptPlugin'
		], function(ItemFileReadStore, xhrScriptPlugin) {
			xhrScriptPlugin(url, "callback");
			var store = this._urlDataStore = new ItemFileReadStore({url: url});
			store.fetch({
				query: this.query,
				queryOptions: {deep: true},
				onComplete: onComplete.bind(this),
				onError: function(e){ 
					console.error("DataStoreBasedWidgetInput._getUpdateWidgetForUrlStoreJSONP error using url = " + url + "; e = " + e);
					alert('File ' + e	);
				}
			});
		}.bind(this));
	},

	_getFullUrl: function(url) {
		var fullUrl;

		var patt=/http:\/\//i;
		if (patt.test(url)){ // absolute url
			fullUrl = url;
		} else {
			var parentFolder = new Path(this._widget._edit_context._srcDocument.fileName)
				 .getParentPath().toString();
			// relative so we have to get the absolute for the update of the store
			var file = system.resource.findResource(url, null, parentFolder);
			if (!file){
				console.error("DataStoreBasedWidgetInput._getFullUrl error using url = " + url + "; url does not exist.");
				alert('File: ' + this._url + ' does not exsist.');
				return;
			}
			fullUrl = file.getURL();
		}

		return URLRewrite.encodeURI(fullUrl);
	},

	_urlDataStoreLoaded: function(items, updateCommandCallback) {
		if (items.length < 1){
			console.error('Data store empty');
			return;
		}

		var widget = this._widget;
		var storeId = this._getStoreId(widget);
		var storeWidget = Widget.byId(storeId);
		var properties = {};
		var context = this._getContext();
		properties.url = this._url;

		if (this._callback){
			this.setCallback('"' + this._url + '","' + this._callback + '"');
		} 

		properties.data = ''; // to prevent ModifyCommand mixin from putting it back

		var compoundCommand = new OrderedCompoundCommand();

		//Remove the old data store
		var storeWidgetParent = storeWidget.getParent();
		var oldStoreWidgetIndex = (storeWidgetParent.indexOf(widget) < 1) ? 0 : storeWidgetParent.indexOf(widget)-1;
		var removeCmd = new RemoveCommand(storeWidget);
		compoundCommand.add(removeCmd);

		// create new store of appropriate type
		var newStoreId = storeId; //reuse old id if possible
		var newDataStoreData = null;
		if (this._dataType == "csv") {
			// replace store with csv
			if (storeWidget.type != "dojox/data/CsvStore") {
				//changing store type, so let's get a new store id
				newStoreId = Widget.getUniqueObjectId("dojox/data/CsvStore", context.getDocument());
			}
			newDataStoreData = {
				type: "dojox/data/CsvStore",
				properties: {
					id: newStoreId,
					jsId: newStoreId,
					url: this._url,
					data: ''
				},
				context: context,
			};
		} else {
			if (storeWidget.type != "dojo/data/ItemFileReadStore") {
				//changing store type, so let's get a new store id
				newStoreId = Widget.getUniqueObjectId("dojo/data/ItemFileReadStore", context.getDocument());
			}
			newDataStoreData = {
				type: "dojo/data/ItemFileReadStore",
				properties: {
					id: newStoreId,
					jsId: newStoreId,
					url: this._url,
					data: ''
				},
				context: context,
			};
		}
		this._urlDataStore.id = newStoreId;
		var addCmd = new AddCommand(newDataStoreData, widget.getParent(), oldStoreWidgetIndex);
		compoundCommand.add(addCmd);

		// allow subclasses to inject their own data
		command = this._getModifyCommandForUrlDataStore(widget, context, items, this._urlDataStore);
		compoundCommand.add(command);

		//Invoke callback
		updateCommandCallback(compoundCommand);
	},

	_getModifyCommandForUrlDataStore: function(widget, context, items, datastore) {
		var props = this._getPropsForNewStore(widget, datastore);

		return new ModifyCommand(widget, props, null, context);
	},
	
	_isEmbedded: function() {
		return this._embeddingContentPane;
	},
	
	_loading: function(height, width) {		
		if (this._isEmbedded()) {
			var inline = dojo.doc.createElement("div");
			inline.id = 'ieb';
			this._inline = inline;
			var myPane = new ContentPane({}, inline);
			this._embeddingContentPane.set("content", myPane);
			dojo.style(this._inline, "display", "block"); 
			this._inline = myPane;
		} else {
			this.inherited(arguments);
		}
	},
	
	show: function(widgetId) {
		this._widget = Widget.byId(widgetId);
			
		var width = 200;
		var height = 155;
		this._loading(height, width);
			
		dojo.addClass('ieb', "dojoStoreBasedWidgetInput");
		if (!this._isEmbedded()) {
			dojo.style('ieb', 'background-color', '#F7FDFF');
		}
		var content = this._getTemplate();
		this._inline.attr("content", content);
		this._inline.eb = dijit.byId("davinciIleb");
		this._inline.callBackObj = this;

		if (!this._isEmbedded()) {
			this._connection.push(dojo.connect(this._inline, "onBlur", this, "onOk")); 
			this._connection.push(dojo.connect(this._inline.eb, "onKeyUp", this, "handleEvent"));
		}
		var folder = dojo.byId('davinci.ve.input.DataGridInput_img_folder');
		this._connection.push(dojo.connect(folder, "onclick", this, "fileSelection"));
		this._connectHelpDiv();
		this._connectResizeHandle();
		this._connectSimDiv();
		if (this._loadingDiv) {
			this._loadingDiv.style.backgroundImage = 'none'; // turn off spinner
		}
		var dataStoreType = dijit.byId("davinci.ve.input.DataGridInput.dataStoreType");
		this._connection.push(dojo.connect(dataStoreType, "onChange", this, "changeDataStoreType"));

		var storeId = this._getStoreId(this._widget);
 		var storeWidget = Widget.byId(storeId);
		this._data = storeWidget._srcElement.getAttribute('data'); 
		this._url = storeWidget._srcElement.getAttribute('url');
		this._callback = this.getCallback(this._url);
		this._inline.eb = dijit.byId("davinciIleb");
		this._connection.push(dojo.connect(this._inline.eb, "onMouseDown", this, "stopEvent"));
		if(this._data){ 
			dataStoreType.setValue('dummyData');
			this._dataStoreType = 'dummyData';
			this._url = ' ';
			this._callback = '';
			this.refreshStoreView();
		}else if(this._callback){
			dataStoreType.setValue('url');
			this._dataStoreType = 'url';
			this._inline.eb.setValue( this._url); 
			var tb =	dijit.byId("davinci.ve.input.SmartInput_callback_editbox");
				tb.setValue(this._callback);
			this._data = ' ';
		}else{
			dataStoreType.setValue('file');
			this._dataStoreType = 'file';
			this._inline.eb.setValue( this._url); 
			this._data = ' ';
			this._callback = '';
		}
		this.changeDataStoreType(this._dataStoreType);
		if (this.supportsEscapeHTMLInData) {
			var html = this._widget.getPropertyValue('escapeHTMLInData');
			var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
			var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
	
			if(html){
				htmlRadio.set("checked", false);
				textRadio.set("checked", true);
			}else{
				htmlRadio.set("checked", true);
				textRadio.set("checked", false);					
			}
		}

		this.updateFormats();
		this._inline.eb.focus();
		
		this.resize(null);

		//Hide certain controls
		if (this._isEmbedded()) {
			//OK button
			var okButton = dijit.byId("davinci.ve.input.SmartInput_ok");
			dojo.style(okButton.domNode, "display", "none");
			
			//Cancel button
			var cancelButton = dijit.byId("davinci.ve.input.SmartInput_cancel");
			dojo.style(cancelButton.domNode, "display", "none");
		}
	},

	getCallback: function(url) {
		var helper = Widget.getWidgetHelper('dojo/data/ItemFileReadStore');
		if(helper && helper.getXhrScriptPluginParameters){
			var xhrParams = helper.getXhrScriptPluginParameters(url, this._widget._edit_context);
			if ( xhrParams){ // must be the one we were looking for.
				return xhrParams.callback;
			}
		}
	},

	setCallback: function(url){
		var helper = Widget.getWidgetHelper('dojo/data/ItemFileReadStore');
		if(helper && helper.setXhrScriptPluginParameters){
			helper.setXhrScriptPluginParameters(url, this._widget._edit_context);
		}
	},
	
	handleEvent: function(event){
		if (event.keyCode == 13) {
			var multiLine = this.multiLine;
			if (!multiLine || multiLine == "false" || this._lastKeyCode == 13){ // back to back CR
				this.onOk();
			}
		} else {
			this.updateFormats();
		}
		this._lastKeyCode = event.keyCode;
		this.updateSimStyle();
	},
	
	fileSelection: function(e){			
		var okClicked = function() {
			var tree = openDialog.fileTree;
			if (tree.selectedItem) {
				var selectedItemPathStr = tree.selectedItem.getPath();
				var path = new Path(selectedItemPathStr),
				srcDocPath = new Path(this._widget._edit_context._srcDocument.fileName),
				// ignore the filename to get the correct path to the image
				value = path.relativeTo(srcDocPath, true).toString(),
				textArea = dijit.byId("davinciIleb");
					textArea.setValue(value); 
					textArea.focus();
					this._url = tree.selectedItem;
					this.updateFormats();

					// clear the reference
					this._fileSelectionDialog = null;
			}
		};

		var openDialog = new OpenFile({finishButtonLabel: dojoxNls.selectLabel});
		this._fileSelectionDialog = Dialog.showModal(openDialog, dojoxNls.selectSource, {width: 350, height: 250}, dojo.hitch(this, okClicked));
	},
	
	updateFormats: function() {
		// NOTE: if you put a break point in here while debugging it will break the dojoEllipsis
		var callbackTr = dojo.byId("davinci.ve.input.SmartInput_callback");
		dojo.style(callbackTr, 'display', 'none');
		if (this._dataStoreType === 'file' || this._dataStoreType === 'url'){
			var textObj = dojo.byId("davinci.ve.input.SmartInput_radio_text_width_div");
			var htmlObj = dojo.byId("davinci.ve.input.SmartInput_radio_html_width_div");
			var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
			var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
			if (this.supportsEscapeHTMLInData) {
				textObj.innerHTML = '<div class="dojoxEllipsis">' + dojoxNls.plainText + '	</div>';
				htmlObj.innerHTML = '<div id="davinci.ve.input.SmartInput_radio_html_div" class="dojoxEllipsis">'+dojoxNls.htmlMarkup+'</div>';
				htmlRadio.setDisabled(false);
				textRadio.setDisabled(false);
				dojo.removeClass(textObj,'inlineEditDisabled');
				dojo.removeClass(htmlObj,'inlineEditDisabled');
				dojo.style(textRadio.domNode, 'display', '');
				dojo.style(htmlRadio.domNode, 'display', '');
				dojo.style(htmlObj, 'display', '');
				dojo.style(textObj, 'display', '');
			} else {
				dojo.style(htmlObj, 'display', 'none');
				dojo.style(textObj, 'display', 'none');
				dojo.style(htmlRadio.domNode, 'display', 'none');
				dojo.style(textRadio.domNode, 'display', 'none');
			}
			var table = dojo.byId('davinci.ve.input.SmartInput_table');
			dojo.style(table, 'display', '');
			if (this._dataStoreType === 'url'){
				dojo.style(callbackTr, 'display', '');
			}
		} else {
			this.inherited(arguments);
			if (!this.supportsEscapeHTMLInData) {
				var textObj = dojo.byId("davinci.ve.input.SmartInput_radio_text_width_div");
				var htmlObj = dojo.byId("davinci.ve.input.SmartInput_radio_html_width_div");
				var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
				var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
				
				dojo.style(htmlObj, 'display', 'none');
				dojo.style(textObj, 'display', 'none');
				dojo.style(htmlRadio.domNode, 'display', 'none');
				dojo.style(textRadio.domNode, 'display', 'none');
			}
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
		}
	},
	
	changeDataStoreType: function (e){
		this._dataStoreType = e;
		var textArea = registry.byId("davinciIleb");
		var targetObj = dom.byId("iedResizeDiv");
		var resizeWidth = style.get('iedResizeDiv', 'width');
		if (e === 'dummyData'){
			textArea.setValue( this._data);
			targetObj.style.height = '85px';
			style.set('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
			style.set('ieb', 'width', resizeWidth + 15 + 'px' );
		}else if ( e=== 'file'){
			style.set('davinci.ve.input.DataGridInput_img_folder', 'display', '');
			textArea.setValue( this._url);
			targetObj.style.height = '40px';
		}else if (e === 'url'){
			style.set('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
			textArea.setValue( this._url);
			targetObj.style.height = '40px';
			style.set('ieb', 'width', resizeWidth + 15 + 'px' );
		} else {
			// we should not ever get here.
			console.error('DataGridInput:changeDataStoreType error');
		}
		this.updateFormats();
		this.resize(null);
	},
	
	resize: function(e) {
		this.inherited(arguments);	
		var targetObj = dojo.byId("iedResizeDiv");
		var targetEditBoxDijit = dijit.byId("davinciIleb");
		var boxWidth = targetObj.clientWidth	- 5;
		var boxheight = targetObj.clientHeight -6;
		boxWidth = targetObj.clientWidth	/*+2*/ -8;
		boxheight = targetObj.clientHeight	-20; // new for text area
		dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',targetObj.clientWidth + 15 + "px");

		if (targetEditBoxDijit) {
			targetEditBoxDijit._setStyleAttr({width: boxWidth + "px", height: boxheight + "px", maxHeight: boxheight + "px"}); // needed for multi line
		}
		targetEditBoxDijit._setStyleAttr({width: targetObj.clientWidth - 20 + "px"});
				
		if (this._dataStoreType === 'file') {
			var ieb = dojo.byId("ieb");
			var iebWidth = dojo.style('ieb', 'width', targetObj.clientWidth + 30 + "px");
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', '');
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'left', targetObj.clientWidth + 1	+ 'px');
			dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',targetObj.clientWidth + 15 + "px");
		} else {
			var ieb = dojo.byId("ieb");
			var iebWidth = dojo.style('ieb', 'width', targetObj.clientWidth + 15 + "px");
			dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',targetObj.clientWidth + "px");
		}
	},

	_getTemplate: function() {
		if (!this._substitutedMainTemplate) {
			this._substitutedMainTemplate = 
				dojo.replace(mainTemplateString, {
						commaSeparatedData: dojoxNls.commaSeparatedData,
						dataFromWorkspace: dojoxNls.dataFromWorkspace,
						dataFromJsonpURL: dojoxNls.dataFromJsonpURL,
						callbackParameter: dojoxNls.callbackParameter,
						buttonOk: commonNls.buttonOk,
						buttonCancel: commonNls.buttonCancel,
						helpText: this.getHelpText()
				});
		}

		return this._substitutedMainTemplate;
	},
	
	_getStoreId: function(widget) {
		return getStoreId(widget); 
	}
});

//Make publicly available as a "static" functions
DataStoreBasedWidgetInput.setPropInDataDojoProps = setPropInDataDojoProps;
DataStoreBasedWidgetInput.getStoreId = getStoreId;

return DataStoreBasedWidgetInput;

});
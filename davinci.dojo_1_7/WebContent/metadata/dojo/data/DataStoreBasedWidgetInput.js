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
	"dojo/data/ItemFileReadStore",
	"dojox/data/CsvStore",
	"dijit/registry",
	"davinci/ve/input/SmartInput",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"davinci/ve/commands/ModifyAttributeCommand",
	"davinci/ve/commands/AddCommand",
	"davinci/ve/commands/RemoveCommand",
	"davinci/commands/OrderedCompoundCommand",
	"davinci/model/Path",
	"dijit/Dialog",
	"dijit/layout/ContentPane",	
	"dijit/form/Button",
	"dijit/Tree",
	"system/resource",
	"dojo/dom-attr",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!../../dojox/nls/dojox",
	"dojo/text!./templates/dojoStoreBasedWidgetInput.html",
	"dojox/form/DropDownSelect"	// used in template
], function(
	declare,
	lang,
	connect,
	style,
	dom,
	domClass,
	ItemFileReadStore,
	CsvStore,
	registry,
	SmartInput,
	Widget,
	ModifyCommand,
	ModifyAttributeCommand,
	AddCommand,
	RemoveCommand,
	OrderedCompoundCommand,
	Path,
	Dialog,
	ContentPane,
	Button,
	Tree,
	resource,
	domAttr,
	commonNls,
	dojoxNls,
	mainTemplateString
	/*DropDownSelect*/
) {

/* 
 * Returns a new string appropriate for data-dojo-props with the property updated (or added if not present before).
 * For reference, a value for data-dojo-props will be in on the form of:
 * 
 *  	"[propId1]:[propValue1],[propId2]:[propValue2],[propId3]:[propValue3],..."
 *  
 *  This is a helper function that will be made available for "static" use.
 *  
 */  
setPropInDataDojoProps = function(dojoDataPropsValue, propId, propValue) {
	var newDataDojoProps = "";
	if (dojoDataPropsValue) {
		var keyValuePairs = dojoDataPropsValue.split(",");
		
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
	} else {
		// We had no value for dojoDataPropsValue, so this new property will 
		// be the first and only entry for now
		newDataDojoProps = propId + ":" + propValue;
	}
	
	return newDataDojoProps;
};
	
/* 
 * Returns the id of the data store for this element. If useDataDojoProps is
 * true, it will split apart the "data-dojo-props" property for the element
 * and find the store's id. Otherwise, it will look at the element's "store"
 * property.
 *
 *  This is a helper function that will be made available for "static" use.
 *  
 */ 
// Helper function that will be made available for "static" use
getStoreId = function(srcElement, useDataDojoProps) {
	var storeId = "";
	if (useDataDojoProps) {
		var dataDojoProps = srcElement.getAttribute("data-dojo-props");
		if (dataDojoProps) {
			var keyValuePairs = dataDojoProps.split(",");
			dojo.some(keyValuePairs, function(pair) {
				var pairSplit = pair.split(":")
				if (pairSplit[0].trim() === "store") {
					storeId = pairSplit[1].trim();
					return true;
				}
			});
		}
	} else {
		storeId = srcElement.getAttribute("store");
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
	
	useDataDojoProps: false,
	
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
		return top.davinci && top.davinci.Runtime && top.davinci.Runtime.currentEditor;
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
				var value;
				while (connection = this._connection.pop()){
					dojo.disconnect(connection);
				}
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

		var compoundCommand = new OrderedCompoundCommand();

		var storeCmd = this.updateStore();
		var command = new ModifyCommand(widget, null, null, context);
		compoundCommand.add(storeCmd);
		compoundCommand.add(command);
		
		updateCommandCallback(compoundCommand);
	},
	
	_getNewWidgetFromCompoundCommand: function(compoundCommand) {
		var lastCommand = compoundCommand._commands[compoundCommand._commands.length-1];
		return lastCommand.newWidget;
	},
		
	updateStore: function() {
		// widget specific code here 
	},

	replaceStoreData: function(data) {
		var store = this._widget.dijitWidget.store;

		var storeId = this._getStoreId(this._widget.domNode._dvWidget._srcElement);
		var storeWidget = Widget.byId(storeId);
		var properties = {};
		properties.data = data;
		storeWidget._srcElement.setAttribute('url', ''); 
		properties.url = ''; // this is needed to prevent ModifyCommmand mixin from puttting it back//delete properties.url; 
		var command = new ModifyCommand(storeWidget, properties);
		store.data = data;

		return command;
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

		// data can be json or csv, so interogate the url
		var store = new ItemFileReadStore({url: url});
		this._urlDataStore = store;
		store.fetch({
				query: this.query,
				queryOptions:{deep:true}, 
				onComplete: lang.hitch(this, onComplete),
				onError: lang.hitch(this, onError)
		});
	},

	_getCsvStore: function(url, query, updateCommandCallback) {
		var store = new CsvStore({url: url});
		this._urlDataStore = store;

		this._dataType = "csv";
		
		//create onComplete callback function
		var onComplete = function(items) {
			this._urlDataStoreLoaded(items, updateCommandCallback);
		};

		store.fetch({
				query: query,
				queryOptions:{deep:true}, 
				onComplete: lang.hitch(this, onComplete),
				onError: function(e){
					alert('File ' + e	);
				}
		});
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

		var store;
		// need to use the same toolkit that the page is using, not the one maqetta is using
		var dj = this._widget.getContext().getDojo();
		try{
			dj["require"]('dojo.data.ItemFileReadStore');
			dj["require"]('dojox.io.xhrScriptPlugin');
		}catch(e){
			console.warn("FAILED: failure for module=dojo.data.ItemFileReadStore");
		}

		dj.dojox.io.xhrScriptPlugin(url,"callback");
		store = new dj.data.ItemFileReadStore({url: url});
		store.fetch({
			query: this.query,
			queryOptions:{deep:true}, 
			onComplete: dojo.hitch(this, onComplete),
			onError: function(e){ alert('File ' + e	);}
		});
		this._urlDataStore = store;
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
				alert('File: ' + this._url + ' does not exsist.');
				return;
			}
			fullUrl = file.getURL();
		}

		return fullUrl;
	},

	_urlDataStoreLoaded: function(items, updateCommandCallback) {
		if (items.length < 1){
			console.error('Data store empty');
			return;
		}

		var storeId = this._getStoreId(this._widget.domNode._dvWidget._srcElement);
		var storeWidget = Widget.byId(storeId);
		var properties = {};
		var context = this._getContext();
		var widget = this._widget;
		properties.url = this._url;

		if (this._callback){
			this.setCallback('"' + this._url + '","' + this._callback + '"');
		} 

		properties.data = ''; // to prevent ModifyCommand mixin from putting it back

		var compoundCommand = new OrderedCompoundCommand();

		if ((this._dataType == "csv" && storeWidget.type == "dojo.data.ItemFileReadStore") ||
			 (this._dataType != "csv" && storeWidget.type == "dojox.data.CsvStore")) {

			var sid;

			var removeCmd = new RemoveCommand(storeWidget);
			compoundCommand.add(removeCmd);

			// we need to change the store type
			if (this._dataType == "csv") {
				// replace store with csv
				sid = Widget.getUniqueObjectId("dojox.data.CsvStore", context.getDocument());
				var data = {
					"type": "dojox.data.CsvStore",
					"properties": {
						id: sid,
						jsId: sid,
						url: this._url,
						data: ''
					},
					context: context,
				}

				this._urlDataStore.id = sid;
				var addCmd = new AddCommand(data, widget.getParent(), 0);
				compoundCommand.add(addCmd);
			} else {
				sid = Widget.getUniqueObjectId("dojo.data.ItemFileReadStore", context.getDocument());
				var data = {
					"type": "dojo.data.ItemFileReadStore",
					"properties": {
						id: sid,
						jsId: sid,
						url: this._url,
						data: ''
					},
					context: context,
				}

				this._urlDataStore.id = sid;
				var addCmd = new AddCommand(data, widget.getParent(), 0);
				compoundCommand.add(addCmd);
			}

			// update the store id attribute
			var mcmd = new ModifyAttributeCommand(widget, {store: sid});
			compoundCommand.add(mcmd);

			// allow subclasses to inject their own data
			command = this._getModifyCommandForUrlDataStore(widget, context, items, this._urlDataStore);
			compoundCommand.add(command);
		} else {
			var storeCmd = new ModifyCommand(storeWidget, properties);
			compoundCommand.add(storeCmd);

			command = this._getModifyCommandForUrlDataStore(widget, context, items);
			compoundCommand.add(command);
		}

		//Invoke callback
		updateCommandCallback(compoundCommand);
	},

	_getModifyCommandForUrlDataStore: function(widget, context, items, datastore) {
		var props = {};

		if (datastore) {
			props.store = datastore;
		}

		return new ModifyCommand(widget, props, null, context);
	},
	
	_isEmbedded: function() {
		if  (this._embeddingContentPane) {
			return true;
		} else {
			return false;
		}
	},
	
	_loading: function(height, width) {		
		if (this._isEmbedded()) {
			var inline = dojo.doc.createElement("div");
			inline.id = 'ieb';
			dojo.addClass(inline,'inlineEdit dijitTooltipContainer');
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
			
		dojo.style('ieb', 'background-color', '#F7FDFF');
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

		var storeId = this._getStoreId(this._widget._srcElement);
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
		dojo.style('iedResizeDiv', 'background-color', 'white');
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
			
			//Resize dive
			var resizeHandle = dojo.byId("iedResizeHandle");
			dojo.style(resizeHandle, "display", "none");
		}
	},

	getCallback: function(url) {
		var helper = Widget.getWidgetHelper('dojo.data.ItemFileReadStore');
		if(helper && helper.getXhrScriptPluginParameters){
			var xhrParams = helper.getXhrScriptPluginParameters(url, this._widget._edit_context);
			if ( xhrParams){ // must be the one we were looking for.
				return xhrParams.callback;
			}
		}
	},

	setCallback: function(url){
		var helper = Widget.getWidgetHelper('dojo.data.ItemFileReadStore');
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
		this._fileSelectionDialog = new Dialog({
			title : dojoxNls.selectSource,
			style : "width:275px;height:220px;padding:0px;background-color:white;"
		});

		//Set-up file selection tree
		var treeParms= {	
			id: "dataGridInputFileSelectionTree",
			persist: false,
			style: "height:10em;margin-top:10px;overflow:auto",
			model: system.resource,
			filters: "new system.resource.FileTypeFilter(parms.fileTypes || '*');" //See #1725
			};
		var tree = new Tree(treeParms);

		this._fileSelectionDialog.containerNode.appendChild(tree.domNode);
		
		//Set-up button
		var okClicked = function() {
			var tree = dijit.byId("dataGridInputFileSelectionTree");
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
					this._fileSelectionDialog.destroyRecursive();
					delete this._fileSelectionDialog;
					this.updateFormats();
			}
		};
		var dijitLangObj = commonNls;
		var okLabel = dijitLangObj.buttonOk;
		var okStyle = 'padding:8px;';
		var okBtn = new Button({
			label : okLabel,
			style : okStyle, /* type:"submit", */
			onClick : dojo.hitch(this, okClicked)
		});
		this._fileSelectionDialog.containerNode.appendChild(okBtn.domNode);
		
		//Set up cancel handler
		var onCancelFileSelection = function(e) {
			this._fileSelectionDialog.destroyRecursive();
			delete this._fileSelectionDialog;
		};
		this._connection.push(dojo.connect(this._fileSelectionDialog, "onCancel", this,
			onCancelFileSelection));
		
		//Show dialog
		this._fileSelectionDialog.show();
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
	
	_getStoreId: function(srcElement) {
		return getStoreId(srcElement, this.useDataDojoProps); 
	}
});

//Make get setPropInDataDojoProps publically available as a "static" function
DataStoreBasedWidgetInput.setPropInDataDojoProps = setPropInDataDojoProps;

//Make get getStoreId publically available as a "static" function
DataStoreBasedWidgetInput.getStoreId = getStoreId;

return DataStoreBasedWidgetInput;

});
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
	"dijit/registry",
	"davinci/ve/input/SmartInput",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"davinci/commands/OrderedCompoundCommand",
	"davinci/model/Path",
	"dijit/Dialog",
	"dijit/layout/ContentPane",	
	"dijit/form/Button",
    "dijit/Tree",
	"system/resource",
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
	registry,
	SmartInput,
	Widget,
	ModifyCommand,
	OrderedCompoundCommand,
	Path,
	Dialog,
	ContentPane,
	Button,
	Tree,
	resource,
	commonNls,
	dojoxNls,
	mainTemplateString
	/*DropDownSelect*/
) {

return declare(SmartInput, {

	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",
	supportsHTML: "false", 
	//helpText:  'First line is column headers separated by commons all following lines are data for those columns.',

	helpText:  'If the CSV data format is selected enter text in the format: first line is column headers separated by commas all following lines are data for those columns.'+
    		   ' If data file from workspace is selected chose a json item file using the file explore folder.',

  _substitutedMainTemplate: null,

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
					value +=  item.label[0];
					if (item.moveTo){
						value +=  ', ' + item.moveTo[0];
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

		if (this._dataStoreType === 'dummyData'){
			this.updateWidget();
		} else if (this._dataStoreType === 'file'){
			this._format = this.getFormat();
			this.updateWidgetForUrlStore();
		} else if (this._dataStoreType === 'url'){
			this._format = this.getFormat();
			this.updateWidgetForUrlStoreJSONP(); 
		}

		this.hide(); 
	},
	
	hide: function(){
	  this.inherited(arguments, [ true ]); // we already updated the widget so just do a hide like cancel
	},
	
  updateWidget: function() {
    var context = this._getContext();
    var widget = this._widget;
        	
    var storeCmd = this.updateStore();
    var command = new ModifyCommand(widget, null, null, context);
    var compoundCommand = new OrderedCompoundCommand();
    compoundCommand.add(storeCmd);
    compoundCommand.add(command);
    context.getCommandStack().execute(compoundCommand);
    context.select(command.newWidget);
  },
    
  updateStore: function() {
    // widget specific code here 
	},

	replaceStoreData: function(data) {
		var store = this._widget.dijitWidget.store;

		var storeId = this._widget.domNode._dvWidget._srcElement.getAttribute("store");
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
		var textArea = registry.byId("davinciIleb");
    this._url = textArea.value;
    var url;
    var patt=/http:\/\//i;
    if (patt.test(this._url)){ // absolute url
      url = this._url;
    } else {
      var parentFolder = new Path(this._widget._edit_context._srcDocument.fileName).getParentPath().toString();
      var file = resource.findResource(this._url, null, parentFolder); // relative so we have to get the absolute for the update of the store
      if (!file){
        alert('File: ' + this._url + ' does not exsist.');
        return;
      }
      url = file.getURL();
    }

    // clear any callbacks
    this._callback = '';

    var store = new ItemFileReadStore({url: url});
    store.fetch({
        query: this.query,
    		queryOptions:{deep:true}, 
    		onComplete: lang.hitch(this, this._urlDataStoreLoaded),
    		onError: function(e){ alert('File ' + e  );}
    });

    this._urlDataStore = store;
	},

	updateWidgetForUrlStoreJSONP: function() {
    var textArea = dijit.byId("davinciIleb");
    var callbackTextBox = dijit.byId("davinci.ve.input.SmartInput_callback_editbox");
    this._url = textArea.value;
    var url;
    var patt=/http:\/\//i;
    if (patt.test(this._url)){ // absolute url
      url = this._url;
    } else {
      var parentFolder = new Path(this._widget._edit_context._srcDocument.fileName)
    	   .getParentPath().toString();
    	// relative so we have to get the absolute for the update of the store
    	var file = system.resource.findResource(this._url, null, parentFolder);
    	if (!file){
    	  alert('File: ' + this._url + ' does not exsist.');
    		return;
    	}
    	url = file.getURL();
    }

    this._callback = callbackTextBox.value;

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
		store = new dj.data.ItemFileReadStore({url: url });
    store.fetch({
    	query: this.query,
    	queryOptions:{deep:true}, 
    	onComplete: dojo.hitch(this, this._urlDataStoreLoaded),
    	onError: function(e){ alert('File ' + e  );}
    });
    this._urlDataStore = store;
	},
	
	_urlDataStoreLoaded : function(items){
		if (items.length < 1){
			console.error('Data store empty');
			return;
		}

		var store = this._widget.dijitWidget.store;
		var storeId = this._widget.domNode._dvWidget._srcElement.getAttribute("store");
		var storeWidget = Widget.byId(storeId);
		var properties = {};
		var context = this._getContext();
		var widget = this._widget;
		properties.url = this._url;

		if (this._callback){
			this.setCallback('"' + this._url + '","' + this._callback + '"');
		} 

		storeWidget._srcElement.setAttribute('data', ''); 
		properties.data = ''; // to prevent ModifyCommand mixin from putting it back

		var storeCmd = new ModifyCommand(storeWidget, properties);
    var compoundCommand = new OrderedCompoundCommand();
    compoundCommand.add(storeCmd);
    var command = this._getModifyCommandForUrlDataStore(widget, context, items);
    compoundCommand.add(command);
    context.getCommandStack().execute(compoundCommand); 
    context.select(command.newWidget);
	},

	_getModifyCommandForUrlDataStore: function(widget, context, items) {
	  return new ModifyCommand(widget, null, null, context);
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

    this._connection.push(dojo.connect(this._inline, "onBlur", this, "onOk")); 
    this._connection.push(dojo.connect(this._inline.eb, "onKeyUp", this, "handleEvent"));
		var folder = dojo.byId('davinci.ve.input.DataGridInput_img_folder');
		this._connection.push(dojo.connect(folder, "onclick", this, "fileSelection"));
		this._connectHelpDiv();
		this._connectResizeHandle();
		this._connectSimDiv();
		this._loadingDiv.style.backgroundImage = 'none'; // turn off spinner
    var dataStoreType = dijit.byId("davinci.ve.input.DataGridInput.dataStoreType");
    this._connection.push(dojo.connect(dataStoreType, "onChange", this, "changeDataStoreType"));

    var storeId = this._widget._srcElement.getAttribute("store"); 
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
      var tb =  dijit.byId("davinci.ve.input.SmartInput_callback_editbox");
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

		this.updateFormats();
    this._inline.eb.focus();
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
			var table = dojo.byId('davinci.ve.input.SmartInput_table');
			
			textObj.innerHTML = '<div class="dojoxEllipsis">' + dojoxNls.plainText + '  </div>';
			htmlObj.innerHTML = '<div id="davinci.ve.input.SmartInput_radio_html_div" class="dojoxEllipsis">'+dojoxNls.htmlMarkup+'</div>';
			htmlRadio.setDisabled(false);
			textRadio.setDisabled(false);
			dojo.removeClass(textObj,'inlineEditDisabled');
			dojo.removeClass(htmlObj,'inlineEditDisabled');
			dojo.style(textRadio.domNode, 'display', '');
			dojo.style(htmlRadio.domNode, 'display', '');
			dojo.style(htmlObj, 'display', '');
			dojo.style(textObj, 'display', '');
			dojo.style(table, 'display', '');
			if (this._dataStoreType === 'url'){
				dojo.style(callbackTr, 'display', '');
			}
		} else {
			this.inherited(arguments);
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
		}
	},
	
	changeDataStoreType: function (e){
		this._dataStoreType = e;
		var textArea = registry.byId("davinciIleb");
		var tagetObj = dom.byId("iedResizeDiv");
		var resizeWidth = style.get('iedResizeDiv', 'width');
		if (e === 'dummyData'){
			textArea.setValue( this._data);
			tagetObj.style.height = '85px';
			style.set('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
			style.set('ieb', 'width', resizeWidth + 15 + 'px' );
		}else if ( e=== 'file'){
			style.set('davinci.ve.input.DataGridInput_img_folder', 'display', '');
			textArea.setValue( this._url);
	    	tagetObj.style.height = '40px';
			
		}else if (e === 'url'){
			style.set('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
			textArea.setValue( this._url);
	    	tagetObj.style.height = '40px';
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
		var tagetObj = dojo.byId("iedResizeDiv");
		var targetEditBoxDijit = dijit.byId("davinciIleb");
		var boxWidth = tagetObj.clientWidth  - 5;
		var boxheight = tagetObj.clientHeight -6;
		boxWidth = tagetObj.clientWidth  /*+2*/ -8;
		boxheight = tagetObj.clientHeight  -20; // new for text area
		dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',tagetObj.clientWidth + 15 + "px");

		if (targetEditBoxDijit) {
			targetEditBoxDijit._setStyleAttr({width: boxWidth + "px", height: boxheight + "px", maxHeight: boxheight + "px"}); // needed for multi line
		}
		targetEditBoxDijit._setStyleAttr({width: tagetObj.clientWidth - 20 + "px"});
				
		if (this._dataStoreType === 'file') {
			var ieb = dojo.byId("ieb");
			var iebWidth = dojo.style('ieb', 'width', tagetObj.clientWidth + 30 + "px");
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', '');
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'left', tagetObj.clientWidth + 1  + 'px');
			dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',tagetObj.clientWidth + 15 + "px");
		} else {
			var ieb = dojo.byId("ieb");
			var iebWidth = dojo.style('ieb', 'width', tagetObj.clientWidth + 15 + "px");
			dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',tagetObj.clientWidth + "px");
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
	}
});
});
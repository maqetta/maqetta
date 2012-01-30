define([
	"dojo/_base/declare",
	"davinci/ve/input/SmartInput",
	"davinci/ve/commands/ModifyCommand",
	"davinci/commands/OrderedCompoundCommand",
	"davinci/ve/widget",
	"davinci/model/Path",
	"davinci/ui/Panel",
	"dojo/i18n!dijit/nls/common",
	"dojo/i18n!../nls/dojox"
], function(
	declare,
	SmartInput,
	ModifyCommand,
	OrderedCompoundCommand,
	Widget,
	Path,
	Panel,
	commonNls,
	dojoxNls
) {

return declare("davinci.libraries.dojo.dojox.grid.DataGridInput", SmartInput, {

	propertyName: "structure",

	property: "structure",
	
	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",

	supportsHTML: "true",

	//helpText:  'First line is column headers separated by commons all following lines are data for those columns.',

	helpText:  "",
	
	constructor : function() {
		this.helpText = dojoxNls.dataGridInputHelp;
	},

	serialize: function(widget, callback, value) {
        var structure = value || widget.attr('structure');
        var names = [];
        var fields = [];
        for (var i=0; i<structure.length; ++i) {
            fields.push(structure[i].field);
            names.push(structure[i].name);
        }
		callback(fields.join(", ") + '\n' + names.join(", ")); 
	},
	
	// splits the input by rows then columns
	// see @update() for format
	parse: function(input) {
		var values = this.parseGrid(input);
        if (values.length < 2) {
            alert(dojoxNls.invalidInput1);
            return input;
        }
        var fields = values[0];
        var names = values[1];
        if (fields.length < names.length) {
            alert(dojoxNls.invalidInput2);
            return input;
        }
        var structure = [];
        for (var i=0; i<fields.length; ++i) {
            var field = fields[i].text;
            var name = names[i].text;
            var width = 'auto';
            var editor = 'dojox.grid.editors.Input';
            structure.push({field: field, name: name, width: width, editor: editor});
        }
        return structure;
	},
	
    // in this case, the first row is the Fields
    // the second row is the Display Names (column headers)
	update: function(widget, structure) {
	    if (structure.length > 0) {
	        var properties = {structure: structure};
	        var command = new ModifyCommand(widget, properties, null, this._getContext());
	        this._getContext().getCommandStack().execute(command);
	        return command.newWidget;
	    }
	    return widget;
	    
	},
	
	_getContainer: function(widget){
		while(widget){
			if ((widget.isContainer || widget.isLayoutContainer) &&
					widget.declaredClass != "dojox.layout.ScrollPane") {
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
		var textArea = dijit.byId("davinciIleb");
		var structure = this._widget.attr("structure");
		var value ='';
		for (var x = 0; x < structure.length; x++){
			var pre = (x > 0) ? ',' : '';
			value += pre + structure[x].name;
		}
		value += '\n';
		for (var i = 0; i <  this._widget.dijitWidget.store._arrayOfAllItems.length; i++){
			var item = this._widget.dijitWidget.store._arrayOfAllItems[i];
			for (var s = 0; s < structure.length; s++){
				var pre = (s > 0) ? ',' : '';
				value += pre + item[structure[s].field];
			}
			value += '\n';
		}
		this._data = value;
		textArea.attr('value', String(value));
	},
	
    addOne: function() {
        this._gridColDS.newItem({rowid: this._rowid++, width: "auto", editable: true, hidden: false});
    },
    
    removeOne: function() {
        var gridColDS = this._gridColDS;
        dojo.forEach(this._gridColumns.selection.getSelected(), function(item) {
            gridColDS.deleteItem(item);
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
	    	this.updateWidgetForUrlStore(true); 
		}
	    this.hide(); 
	},
	
	hide: function(){
		// we already updated the widget so just do a hide like cancel
	    this.inherited(arguments, [ true ]);
	},
	
    updateWidget: function() {
        var structure = [];
        
        var context = this._getContext();
        var widget = this._widget;
        	
    	var storeCmd = this.updateStore(structure);
    	structure = this._structure;
    	var escapeHTML = (this.getFormat() === 'text');
        var command = new ModifyCommand(widget,
	        	{
		        	structure: structure,
		        	escapeHTMLInData: escapeHTML
		        },
		        null,
		        context
		    );
        var compoundCommand = new OrderedCompoundCommand();
        compoundCommand.add(storeCmd);
        compoundCommand.add(command);
        context.getCommandStack().execute(compoundCommand);  
        context.select(command.newWidget);
    },
    
    updateStore: function(structure, value) {
    	var oldStructure = structure, // we are defining the structure by row one of text area
    		structure = [],
    		textArea = dijit.byId("davinciIleb"),
    		value = textArea.attr('value'),
    		nodes = value,
    		rows = value.split('\n'),
    		cols = rows[0].split(',');

    	for (var c = 0; c < cols.length; c++){
			structure[c] = {
				cellType: dojox.grid.cells.Cell,
				width: 'auto',
				name: cols[c],
				field: cols[c].replace(/\s+/g, '_').toLowerCase()				
			};
		}

    	this._structure = structure;
		var data = { identifier: 'uniqe_id', items:[]},
			rows = value.split('\n'),
			items = data.items;
		// row 0 of the textarea defines colums in data grid structure
		for (var r = 1; r < rows.length; r++) {
			var cols = rows[r].split(',');
		
			var item = {uniqe_id: r};
			for (var s = 0; s < structure.length; s++){
				var fieldName = structure[s].field;
				if (cols[s]){
					item[fieldName] = cols[s];
				}
				
			}
			items.push(item);
		}

		return this.replaceDataGridStoreData(data);
	},
	
	replaceStoreData: function(store, data) {
		// Kludge to force reload of store data
		store.clearOnClose = true;
		store.data = data;
		store.close();
		store.fetch({
			query: this.query,
			queryOptions:{deep:true}, 
			onComplete: dojo.hitch(this, function(items){
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					console.warn("i=", i, "item=", item);
				}
			})
		});
	},

	replaceDataGridStoreData: function(data) {
		var store = this._widget.dijitWidget.store;

		var storeId = this._widget.domNode._dvWidget._srcElement.getAttribute("store");
		var storeWidget = Widget.byId(storeId);
		var properties = {};
		properties.data = data;
		storeWidget._srcElement.setAttribute('url', ''); 
		// this is needed to prevent ModifyCommmand mixin from puttting it back
		properties.url = '';
		var command = new ModifyCommand(storeWidget, properties);
		store.data = data;

		return command;
	},
		
	_attr: function(widget, name, value) {
		var properties = {};
		properties[name] = value;
		
		var command = new ModifyCommand(widget, properties);
		this._addOrExecCommand(command);
	},
	
	_addOrExecCommand: function(command) {
		if (this.command && command) {
			this.command.add(command);
		} else {
			this._getContext().getCommandStack().execute(this.command || command);
		}	
	},
	
	updateWidgetForUrlStore: function(jsonP) {
		var structure = [];
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
    	if (jsonP){
    		this._callback = callbackTextBox.value;
    	} else {
    		this._callback = '';
    	}
    	var store;
    	// need to use the same toolkit that the page is using, not the one maqetta is using
		var dj = this._widget.getContext().getDojo();
		try{
			dj["require"]('dojo.data.ItemFileReadStore');
			dj["require"]('dojox.io.xhrScriptPlugin');
		}catch(e){
			console.warn("FAILED: failure for module=dojo.data.ItemFileReadStore");
		}
		dj.dojox.io.xhrScriptPlugin(url,this._callback);
		store = new dj.data.ItemFileReadStore({url: url });
    	store.fetch({
    		query: this.query,
    		queryOptions:{deep:true}, 
    		onComplete: dojo.hitch(this, this._urlDataStoreLoaded),
    		onError: function(e){ alert('File ' + e  );}
    	});
    	this._urlDataStore = store;
	},
	
	_urlDataStoreLoaded : function(items) {
		if (items.length < 1){
			console.error("Data store empty");
			return;
		}
		var structure = [],
			item = items[0];
		for (var name in item){
			if (name !== '_0' && name !== '_RI' && name !== '_S'){
				structure.push({
					cellType: dojox.grid.cells.Cell,
					width: 'auto',
					name: name,
					field: name					
				});
			}
		}
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			console.warn("i=", i, "item=", item);
		}
		var store = this._widget.dijitWidget.store;
		var storeId = this._widget.domNode._dvWidget._srcElement.getAttribute("store");
		var storeWidget = Widget.byId(storeId);
		var properties = {};
		var context = this._getContext();
        var widget = this._widget;
		properties.url = this._url;
		var scripts;
		if (this._callback){
			this.setCallback('"' + this._url + '","' + this._callback + '"');
		} 
		storeWidget._srcElement.setAttribute('data', ''); 
		properties.data = ''; // to prevent ModifyCommand mixin from putting it back
		var storeCmd = new ModifyCommand(storeWidget, properties);
		var escapeHTML = (this._format === 'text');
        var command = new ModifyCommand(widget,
	        	{
					structure: structure,
		        	escapeHTMLInData: escapeHTML
		        },
		        null, 
		        context,
		        scripts
		    );
        var compoundCommand = new OrderedCompoundCommand();
        compoundCommand.add(storeCmd);
        compoundCommand.add(command);
        context.getCommandStack().execute(compoundCommand);  
        context.select(command.newWidget);
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
	
	handleEvent: function(event) {
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
		var definition = [
      	    {  
              type: "tree",
      	      data: "file",
      	      style: "height:10em;overflow:auto",
      	      model: system.resource,
      	      filters: "new system.resource.FileTypeFilter(parms.fileTypes || '*');"
      	    }
      	];
      	  
      	var data = {
      	  	file: null
        };
  		this._fileSelectionDialog = Panel.openDialog( {
  			definition: definition,
  			data: data,
  			style: "width:275px;height:225px;padding:0px;background-color:white;",
  			title: dojoxNls.selectSource,
  			contextObject: this,
  			buttonStyle: 'padding:8px;',
  			onOK : function () {
  				if (data.file) {
  					var path = new Path(data.file.getPath()),
  						srcDocPath = new Path(this._widget._edit_context._srcDocument.fileName),
  						// ignore the filename to get the correct path to the image
  						value = path.relativeTo(srcDocPath, true).toString(),
  						textArea = dijit.byId("davinciIleb");
  			    	textArea.setValue(value); 
  			    	textArea.focus();
  			    	this._url = data.file;
  			    	delete this._fileSelectionDialog;
  			    	this.updateFormats();
  				}
  			
  			}

  		});
  		this._connection.push(dojo.connect(this._fileSelectionDialog, "onCancel", this,
  				"onCancelFileSelection"));
	},
	
	onCancelFileSelection: function(e) {
		delete this._fileSelectionDialog;
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
	    var textArea = dijit.byId("davinciIleb");
	    var tagetObj = dojo.byId("iedResizeDiv");
		var callbackTextBox = dijit.byId("davinci.ve.input.SmartInput_callback_editbox");
	    var resizeWidth = dojo.style('iedResizeDiv', 'width');
		if (e === 'dummyData'){
			textArea.setValue( this._data);
	    	tagetObj.style.height = '85px';
	    	dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
			dojo.style('ieb', 'width', resizeWidth + 15 + 'px' );
			
		}else if ( e=== 'file'){
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', '');
			textArea.setValue( this._url);
	    	tagetObj.style.height = '40px';
			
		}else if (e === 'url'){
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
			textArea.setValue( this._url);
			if (this._callback){
				callbackTextBox.setValue( this._callback);
			} else {
				callbackTextBox.setValue('callback'); // provide a default
			}
			tagetObj.style.height = '40px';
	    	dojo.style('ieb', 'width', resizeWidth + 15 + 'px' );
			
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
	
	// XXX TODO Move this code to an HTML template file
	_getTemplate: function() {
		var template = ''+
		'<div id="davinciDataGridSmartInputFolderDiv" class="smartInputDataGridFolderDiv" style="background-color: #F7FCFF;	margin: 0 0 0 -1px;"> ' +
		'<table id="davinci.ve.input.DataGridInput_table" > ' +
			'<tbody>' + 
				'<tr>' +
					'<td></td>' + 
					'<td>' +
						'<select id="davinci.ve.input.DataGridInput.dataStoreType" name="davinci.ve.input.DataGridInput.dataStoreType" dojoType="dojox.form.DropDownSelect" style="width:15em;"> ' +
							'<option value="dummyData">'+dojoxNls.commaSeparatedData+'</option> ' +
							'<option value="file">'+dojoxNls.dataFromWorkspace+'</option> ' +
							'<option value="url">'+dojoxNls.dataFromJsonpURL+'</option> ' +
						'</select>' +
					'<td>' +
					'<td></td>' + 
				'</tr>' +	
	
			'</tbody>'+ 
		'</table> '+
		'</div>' +
		'<div id="iedResizeDiv"  class="iedResizeDiv" style="width: 240px; height: 60px; border: 1px solid #769DC0; margin: 0 5px 0 5px;" >' + 
        '	<textarea  dojoType="dijit.form.SimpleTextarea" name="davinciIleb"  trim="true" id="davinciIleb" style="width:240px; height:60px;" class="smartInputTextArea" ></textarea>' +
			'<div id="smartInputSim" class="smartInputSim" style="display:none;" ></div>'+
			'<span id="davinci.ve.input.DataGridInput_img_folder"  title="Folder" class="inlineEditFolder" > </span>'+
			'<div id="iedResizeHandle" dojoType="dojox.layout.ResizeHandle" targetId="iedResizeDiv" constrainMin="true" maxWidth="200" maxHeight="600" minWidth="240" minHeight="40"  activeResize="true" intermediateChanges="true" ></div>' +
		'</div>'+
		'<div  id="davinci.ve.input.SmartInput_div"  class="davinciVeInputSmartInputDiv" >' + 
			'<div id="davinci.ve.input.SmartInput_radio_div" class="smartInputRadioDiv" >' + 
				'<table id="davinci.ve.input.SmartInput_table"> ' +
					'<tbody>' + 
						'<tr> ' +
							'<td class="smartInputTd1" > ' +
								'<input id="davinci.ve.input.SmartInput_radio_text" showlabel="true" type="radio" dojoType="dijit.form.RadioButton" disabled="false" readOnly="false" intermediateChanges="false" checked="true"> </input> '+
	             			'</td> ' +
	             			'<td class="smartInputTd2" >'+ 
	             				'<div id="davinci.ve.input.SmartInput_radio_text_width_div" class="smartInputRadioTextDiv">'+
	             				'</div>'+
             				'</td> ' +
         				'</tr>'+
         				'<tr> '+
         					'<td class="smartInputTd1"> <input id="davinci.ve.input.SmartInput_radio_html" showlabel="true" type="radio" dojoType="dijit.form.RadioButton"> </input>  </td> '+
         					'<td class="smartInputTd2">'+
         						'<div id="davinci.ve.input.SmartInput_radio_html_width_div" class="smartInputRadioTextDiv">'+
         						'</div>'+
             				'</td> '+
     					'</tr> '+
     					'<tr id="davinci.ve.input.SmartInput_callback"> '+
     					'<td class="smartInputTd1">'+dojoxNls.callbackParameter+'</td> '+
     					'<td class="smartInputTd2">'+
   							'<input type="text" name="davinci.ve.input.SmartInput_callback_editbox" value="callback" data-dojo-type="dijit.form.TextBox" data-dojo-props="trim:true" id="davinci.ve.input.SmartInput_callback_editbox">' +
         				'</td> '+
 					'</tr> '+
 					'</tbody>'+ 
					'</table> '+
				'<div class="smartInputHelpDiv" > '+
	        		'<span id="davinci.ve.input.SmartInput_img_help"  title="Help" class="inlineEditHelp" > </span>'+
		        	'<span class="smartInputSpacerSpan" >'+
		        	'<button id="davinci.ve.input.SmartInput_ok"  dojoType="dijit.form.Button" type="button" class="inlineEditHelpOk" >'+commonNls.buttonOk+'</button> <button id=davinci.ve.input.SmartInput_cancel dojoType="dijit.form.Button" class="inlineEditHelpCancel"> '+commonNls.buttonCancel+'</button>  '+
		        	'</span>   '+
		        '</div> '+
		        '<div id="davinci.ve.input.SmartInput_div_help" style="display:none;" class="smartInputHelpTextDiv" > '+
		        	'<div dojoType="dijit.layout.ContentPane" style="text-align: left; padding:0; " >'+this.getHelpText()+ '</div> '+
		        	'<div style="text-align: left; padding:0; height:2px;" ></div> '+
		        '</div> '+
	        '</div>' + 
        '</div> '+
        '';
		return template;
	}

});

});
dojo.provide("davinci.ve.input.DataGridInput");
dojo.require("davinci.ve.input.SmartInput");
//dojo.require("davinci.ve.commands.ModifyFileItemStoreCommand");
dojo.require("davinci.commands.OrderedCompoundCommand");
dojo.require("dojox.grid.cells");
dojo.require("dojox.form.DropDownSelect");

dojo.declare("davinci.ve.input.DataGridInput", davinci.ve.input.SmartInput, {

	propertyName: "structure",
	
	childType: null,

	property: "structure",
	
	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",
	supportsHTML: "true", 
	//helpText:  'First line is column headers separated by commons all following lines are data for those columns.',

	helpText:  'If the CSV data format button is selected enter text in the format: first line is column headers separated by commons all following lines are data for those columns.'+
    		   ' If the URL button is selected enter the location of the json item file.',



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
            alert('invalid input (1)');
            return input;
        }
        var fields = values[0];
        var names = values[1];
        if (fields.length < names.length) {
            alert('invalid input (2)');
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
	        var command = new davinci.ve.commands.ModifyCommand(widget, properties, null, this._getContext());
	        this._getContext().getCommandStack().execute(command);
	        return command.newWidget;
	    }
	    return widget;
	    
	},
	
	_getContainer: function(widget){
		while(widget){
			if ((widget.isContainer || widget.isLayoutContainer) && widget.declaredClass != "dojox.layout.ScrollPane"){
				return widget;
			}
			widget = davinci.ve.widget.getParent(widget); 
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

	/*
    cellTypeTranslator: { 'Text':dojox.grid.cells.Cell,
	                      'CheckBox':dojox.grid.cells.Bool,
                          'Select':dojox.grid.cells.Select,
                          'dojox.grid.cells.Cell':'Text',
                          'dojox.grid.cells.Bool':'CheckBox',
                          'dojox.grid.cells.Select':'Select'
	},
	*/
	
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
	
	
//    die: function() {
//        this._inline.destroyDescendants();
//        this._inline.destroy();
//        delete this._inline;
//    },

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
	    	this.updateWidgetForUrlStore(); 
		}
	    this.hide(true); // we already updated the widget so just do a hide like cancel
	},
	
    updateWidget: function() {
        var structure = [];
        
        var context = this._getContext();
        var widget = this._widget;
        	
    	var storeCmd = this.updateStore(structure);
    	structure = this._structure;
    	var escapeHTML = (this.getFormat() === 'text');
        var command = new davinci.ve.commands.ModifyCommand(widget, {structure: structure, escapeHTMLInData:escapeHTML}, null, context);
        var compoundCommand = new davinci.commands.OrderedCompoundCommand();
        compoundCommand.add(storeCmd);
        compoundCommand.add(command);
        context.getCommandStack().execute(compoundCommand);  
        context.select(command.newWidget);

    },
    
    updateStore: function(structure) {
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
		for (var r = 1; r < rows.length; r++){ // row 0 of the textarea defines colums in data grid structure
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
		var storeWidget = davinci.ve.widget.byId(storeId);
		var properties = {};
		properties['data'] = data;
		storeWidget._srcElement.setAttribute('url', ''); //wdr 3-11
		properties.url = ''; // this is needed to prevent ModifyCommmand mixin from puttting it back//delete properties.url; // wdr 3-11
		var command = new davinci.ve.commands.ModifyCommand(storeWidget, properties);
		//var command = new davinci.ve.commands.ModifyFileItemStoreCommand(storeWidget, properties);
		store.data = data;

		return command;
	},
		
	_attr: function(widget, name, value) {
		var properties = {};
		properties[name] = value;
		
		var command = new davinci.ve.commands.ModifyCommand(widget, properties);
		this._addOrExecCommand(command);
	},
	
	_addOrExecCommand: function(command) {
		if (this.command && command) {
			this.command.add(command);
		} else {
			this._getContext().getCommandStack().execute(this.command || command);
		}	
	},
	
	updateWidgetForUrlStore: function(){
		
		var structure = [];
    	//var textBox = dijit.byId("davinci.ve.input.DataGridInput.url"); 
    	var textArea = dijit.byId("davinciIleb");
    	this._url = textArea.value;
    	var tempURL = this._url.toLowerCase();
    	var url;
    	if (tempURL.indexOf('http://') === 0){ // absolute url
    		url = this._url;
    	} else {
    		var file = davinci.model.Resource.findResource(this._url); // relative so we have to get the absolute for the update of the store
    		url = file.getURL();
    	}
    	//this._widget._edit_context.baseURL = http://localhost:8080/davinci/user/user5/ws/workspace/file1.html
    	//url = 'http://localhost:8080/davinci/user/user5/ws/workspace/' + url;
    	var store = new dojo.data.ItemFileReadStore({url: url});
    	store.fetch({
    		query: this.query,
    		queryOptions:{deep:true}, 
    		onComplete: dojo.hitch(this, this._urlDataStoreLoaded)
    	});
    	this._urlDataStore = store;
    	
    
    	
	},
	
	_urlDataStoreLoaded : function(items){
		if (items.length < 1){
			console.error('Data store empty');
			return;
		}
		var structure = [],
			item = items[0];
		for (name in item){
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
		var storeWidget = davinci.ve.widget.byId(storeId);
		var properties = {};
		var context = this._getContext();
        var widget = this._widget;
		properties['url'] = this._url; 
		storeWidget._srcElement.setAttribute('data', ''); 
		properties.data = ''; // to prevent ModifyCommand mixin from putting it back
		var storeCmd = new davinci.ve.commands.ModifyCommand(storeWidget, properties);
		var escapeHTML = (this._format === 'text');
        var command = new davinci.ve.commands.ModifyCommand(widget, {structure: structure, escapeHTMLInData:escapeHTML}, null, context);
        var compoundCommand = new davinci.commands.OrderedCompoundCommand();
        compoundCommand.add(storeCmd);
        compoundCommand.add(command);
        context.getCommandStack().execute(compoundCommand);  
        context.select(command.newWidget);

		//this.die();
	},
	
	show: function(widgetId) {
        this._widget = davinci.ve.widget.byId(widgetId);
	    
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
		this.resize(null);
        var dataStoreType = dijit.byId("davinci.ve.input.DataGridInput.dataStoreType");
        this._connection.push(dojo.connect(dataStoreType, "onChange", this, "changeDataStoreType"));
        var storeId = this._widget._srcElement.getAttribute("store"); 
   		var storeWidget = davinci.ve.widget.byId(storeId);
        this._data = storeWidget._srcElement.getAttribute('data'); 
        this._url = storeWidget._srcElement.getAttribute('url'); 
        this._inline.eb = dijit.byId("davinciIleb");
        this._connection.push(dojo.connect(this._inline.eb, "onMouseDown", this, "stopEvent"));
        if(this._data){ 
        	dataStoreType.setValue('dummyData');
        	this._dataStoreType = 'dummyData';
        	this._url = ' ';
        	this.refreshStoreView();
        }else{
        	dataStoreType.setValue('file');
        	this._dataStoreType = 'file';
        	this._inline.eb.setValue( this._url); 
        	this._data = ' ';
        }
        dojo.style('iedResizeDiv', 'background-color', 'white');
        var html = this._widget.getPropertyValue('escapeHTMLInData');
        var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
		var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
        if(html){
        	htmlRadio.setChecked(false);
			textRadio.setChecked(true);
        }else{
        	htmlRadio.setChecked(true);
			textRadio.setChecked(false);        	
        }
        this.updateFormats();

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
		var definition = [
      	    {  
              type: "tree",
      	      data: "file",
      	      style: "height:10em;overflow:auto",
      	      model: "davinci.ui.widgets.ResourceTreeModel",
      	      filters: "davinci.ui.widgets.OpenFileDialog.filter"

      	    }
      	  ];
      	  
      	  var data={
      			  file  : null

            };
      	
      		this._fileSelectionDialog = davinci.ui.Panel.openDialog( {
      			definition: definition,
      			data: data,
      			style: "width:275px;height:225px;padding:0px;background-color:white;",
      			title:"Select a source",
      			contextObject: this,
      			buttonStyle: 'padding:8px;',
      			onOK : function ()
      			{
      				if(data.file){
      					var path=new davinci.model.Path(data.file.getPath());
      					var value=path.relativeTo(new davinci.model.Path(this._widget._edit_context._srcDocument.fileName), true).toString(); // ignore the filename to get the correct path to the image
      					var textArea = dijit.byId("davinciIleb");
      			    	textArea.setValue(value); 
      			    	textArea.focus();
      			    	this._url = data.file;
      			    	delete this._fileSelectionDialog;
      			    	this.updateFormats();
      				}
      			
      			}

      		});
      		this._connection.push(dojo.connect(this._fileSelectionDialog, "onCancel", this, "onCancelFileSelection"));
      		

	},
	
	onCancelFileSelection: function(e)
	{
		delete this._fileSelectionDialog;
	},
	
	updateFormats: function(){
			
		// NOTE: if you put a break point in here while debugging it will break the dojoEllipsis
		if (this._dataStoreType === 'file' ){
			var textObj = dojo.byId("davinci.ve.input.SmartInput_radio_text_width_div");
			var htmlObj = dojo.byId("davinci.ve.input.SmartInput_radio_html_width_div");
			var htmlRadio = dijit.byId('davinci.ve.input.SmartInput_radio_html');
			var textRadio = dijit.byId('davinci.ve.input.SmartInput_radio_text');
			var table = dojo.byId('davinci.ve.input.SmartInput_table');
			
			textObj.innerHTML = '<div class="dojoxEllipsis">Plain text  </div>';
			htmlObj.innerHTML = '<div id="davinci.ve.input.SmartInput_radio_html_div" class="dojoxEllipsis">HTML markup</div>';
			htmlRadio.setDisabled(false);
			textRadio.setDisabled(false);
			dojo.removeClass(textObj,'inlineEditDisabled');
			dojo.removeClass(htmlObj,'inlineEditDisabled');
			dojo.style(textRadio.domNode, 'display', '');
			dojo.style(htmlRadio.domNode, 'display', '');
			dojo.style(htmlObj, 'display', '');
			dojo.style(textObj, 'display', '');
			dojo.style(table, 'display', '');
			
		} else {
			this.inherited(arguments);
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
		}
	},
	
	changeDataStoreType: function (e){

		this._dataStoreType = e;
	    var textArea = dijit.byId("davinciIleb");
	    var tagetObj = dojo.byId("iedResizeDiv");
	    var resizeWidth = dojo.style('iedResizeDiv', 'width');
		if (e === 'dummyData'){
			textArea.setValue( this._data);
	    	tagetObj.style.height = '85px';
	    	dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
			dojo.style('ieb', 'width', resizeWidth + 15 + 'px' );
			
		}else if ( e=== 'file'){
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', '');
			textArea.setValue( this._url);
	    	tagetObj.style.height = '40px'
			
		}else if (e === 'url'){
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', 'none');
			textArea.setValue( this._url);
	    	tagetObj.style.height = '40px'
	    	dojo.style('ieb', 'width', resizeWidth + 15 + 'px' );
			
		} else {
			// we should not ever get here.
			console.error('DataGridInput:changeDataStoreType error');
		}
    	this.resize(null);
	},
	
	resize: function(e){
		
		this.inherited(arguments);	
		var tagetObj = dojo.byId("iedResizeDiv");
		var targetEditBoxDijit = dijit.byId("davinciIleb");
		var boxWidth = tagetObj.clientWidth  - 5;
		var boxheight = tagetObj.clientHeight -6;
		boxWidth = tagetObj.clientWidth  /*+2*/ -8;
		boxheight = tagetObj.clientHeight  -20; // new for text area
		dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',tagetObj.clientWidth + 15 + "px");
		
	
		if (targetEditBoxDijit)
			targetEditBoxDijit._setStyleAttr({width: boxWidth + "px", height: boxheight + "px", maxHeight: boxheight + "px"}); // needed for multi line
		targetEditBoxDijit._setStyleAttr({width: tagetObj.clientWidth - 20 + "px"});
				
		if (this._dataStoreType === 'file') {
			var ieb = dojo.byId("ieb");
			var iebWidth = dojo.style('ieb', 'width', tagetObj.clientWidth + 30 + "px");
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', '');
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'left', tagetObj.clientWidth + 1  + 'px');
			dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',tagetObj.clientWidth + 15 + "px");
		} else {
			dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',tagetObj.clientWidth + "px");
		}
	},
	
	_getTemplate: function(){
		
		var template = ''+
		'<div id="davinciDataGridSmartInputFolderDiv" class="smartInputDataGridFolderDiv" style="background-color: #F7FCFF;	margin: 0 0 0 -1px;"> ' +
		'<table id="davinci.ve.input.DataGridInput_table" > ' +
			'<tbody>' + 
				'<tr>' +
					'<td></td>' + 
					'<td>' +
						'<select id="davinci.ve.input.DataGridInput.dataStoreType" name="davinci.ve.input.DataGridInput.dataStoreType" dojoType="dojox.form.DropDownSelect" style="width:15em;"> ' +
							'<option value="dummyData">Comma separated data</option> ' +
							'<option value="file">Data file from workspace</option> ' +
// hide for M2							'<option value="url">URL (JSONP)</option> ' +
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
 					'</tbody>'+ 
					'</table> '+
				'<div class="smartInputHelpDiv" > '+
	        		'<span id="davinci.ve.input.SmartInput_img_help"  title="Help" class="inlineEditHelp" > </span>'+
		        	'<span class="smartInputSpacerSpan" >'+
		        	'<button id="davinci.ve.input.SmartInput_ok"  dojoType="dijit.form.Button" type="button" class="inlineEditHelpOk" >OK</button> <button id=davinci.ve.input.SmartInput_cancel dojoType="dijit.form.Button" class="inlineEditHelpCancel"> Cancel</button>  '+
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
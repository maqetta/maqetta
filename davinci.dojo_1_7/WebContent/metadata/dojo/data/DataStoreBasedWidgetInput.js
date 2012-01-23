define([
	"dojo/_base/declare",
	"davinci/ve/input/SmartInput",
	"davinci/ve/widget",
	"davinci/ve/commands/ModifyCommand",
	"davinci/commands/OrderedCompoundCommand",
	"davinci/model/Path",
	"davinci/ui/Panel"
], function(
	declare,
	SmartInput,
	Widget,
	ModifyCommand,
	OrderedCompoundCommand,
	Path,
	Panel
) {

return declare("davinci.libraries.dojo.dojo.data.DataStoreBasedWidgetInput", SmartInput, {

	displayOnCreate: "true",
	
	delimiter: ", ",
	
	multiLine: "true",
	supportsHTML: "false", 
	//helpText:  'First line is column headers separated by commons all following lines are data for those columns.',

	helpText:  'If the CSV data format is selected enter text in the format: first line is column headers separated by commas all following lines are data for those columns.'+
    		   ' If data file from workspace is selected chose a json item file using the file explore folder.',

/*	parse: function(input) {
		debugger;
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
	},*/
	
    // in this case, the first row is the Fields
    // the second row is the Display Names (column headers)
	/*update: function(widget, structure) {
		debugger;
	    if (structure.length > 0) {
	       // var properties = {structure: structure};
	        var command = new ModifyCommand(widget, properties, null, this._getContext());
	        this._getContext().getCommandStack().execute(command);
	        return command.newWidget;
	    }
	    return widget;
	    
	},*/
	
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
	
		var textArea = dijit.byId("davinciIleb");

		var value ='';
		for (var i = 0; i <  this._widget.dijitWidget.store._arrayOfAllItems.length; i++){
			var item = this._widget.dijitWidget.store._arrayOfAllItems[i];
				value +=  item.label[0];
				if (item.moveTo){
					value +=  ', ' + item.moveTo[0];
				}
			value += '\n';
		}
		this._data = value;
		textArea.attr('value', String(value));
	},
	
	
/*
    addOne: function() {
        this._gridColDS.newItem({rowid: this._rowid++, width: "auto", editable: true, hidden: false});
    },
    
    removeOne: function() {
        var gridColDS = this._gridColDS;
        dojo.forEach(this._gridColumns.selection.getSelected(), function(item) {
            gridColDS.deleteItem(item);
        });
    },
    */
	
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
    	// widget specific data here, this example is EdgeToEdgeDataList
    		textArea = dijit.byId("davinciIleb"),
    		value = textArea.attr('value'),
    		nodes = value,
    		rows = value.split('\n'),
    		cols = rows[0].split(',');

		var data = { identifier: 'label', items:[]},
			rows = value.split('\n'),
			items = data.items;
		for (var r = 0; r < rows.length; r++){ 
			var cols = rows[r].split(',');
			var item = {};
			item.label = cols[0];
			if (cols[1]){
				item.moveTo = cols[1];
			} else {
				item.moveTo = 'dummy';
			}

			items.push(item);
		}
	
		
		return this.replaceStoreData(data);
	},
	
	/*replaceStoreData: function(store, data) {
		debugger;
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
	},*/

	replaceStoreData: function(data) {

		var store = this._widget.dijitWidget.store;

		var storeId = this._widget.domNode._dvWidget._srcElement.getAttribute("store");
		var storeWidget = Widget.byId(storeId);
		var properties = {};
		properties['data'] = data;
		storeWidget._srcElement.setAttribute('url', ''); 
		properties.url = ''; // this is needed to prevent ModifyCommmand mixin from puttting it back//delete properties.url; 
		var command = new ModifyCommand(storeWidget, properties);
		store.data = data;

		return command;
	},
		
/*	_attr: function(widget, name, value) {
		debugger;
		var properties = {};
		properties[name] = value;
		
		var command = new ModifyCommand(widget, properties);
		this._addOrExecCommand(command);
	},*/
	
/*	_addOrExecCommand: function(command) {
		debugger;
		if (this.command && command) {
			this.command.add(command);
		} else {
			this._getContext().getCommandStack().execute(this.command || command);
		}	
	},*/
	
	updateWidgetForUrlStore: function(){
		
    	var textArea = dijit.byId("davinciIleb");
    	this._url = textArea.value;
    	var url;
    	var patt=/http:\/\//i;
    	if (patt.test(this._url)){ // absolute url
    		url = this._url;
    	} else {
    		var parentFolder = new Path(this._widget._edit_context._srcDocument.fileName).getParentPath().toString();
            var file = system.resource.findResource(this._url, null, parentFolder); // relative so we have to get the absolute for the update of the store
            if (!file){
                alert('File: ' + this._url + ' does not exsist.');
                return;
            }
            url = file.getURL();
    	}
    	//this._widget._edit_context.baseURL = http://localhost:8080/davinci/user/user5/ws/workspace/file1.html
    	//url = 'http://localhost:8080/davinci/user/user5/ws/workspace/' + url;
    	var store = new dojo.data.ItemFileReadStore({url: url});
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

		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			console.warn("i=", i, "item=", item);
		}
		var storeId = this._widget.domNode._dvWidget._srcElement.getAttribute("store");
		var storeWidget = Widget.byId(storeId);
		var properties = {};
		var context = this._getContext();
        var widget = this._widget;
		properties.url = this._url; 
		storeWidget._srcElement.setAttribute('data', ''); 
		properties.data = ''; // to prevent ModifyCommand mixin from putting it back
		var storeCmd = new ModifyCommand(storeWidget, properties);
        var command = new ModifyCommand(widget, null, null, context);
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
      	      model: system.resource,
      	      filters: "davinci.ui.widgets.OpenFileDialog.filter"

      	    }
      	  ];
      	  
      	  var data={
      			  file  : null

            };
      	
      		this._fileSelectionDialog = Panel.openDialog( {
      			definition: definition,
      			data: data,
      			style: "width:275px;height:225px;padding:0px;background-color:white;",
      			title:"Select a source",
      			contextObject: this,
      			buttonStyle: 'padding:8px;',
      			onOK : function ()
      			{
      				if(data.file){
      					var path=new Path(data.file.getPath());
      					var value=path.relativeTo(new Path(this._widget._edit_context._srcDocument.fileName), true).toString(); // ignore the filename to get the correct path to the image
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
			if (this.isHtmlSupported())
				dojo.style(table, 'display', '');
			else{
				dojo.style(table, 'display', 'none');
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
	    	tagetObj.style.height = '40px';
	    	dojo.style('ieb', 'width', resizeWidth + 15 + 'px' );
			
		} else {
			// we should not ever get here.
			console.error('DataGridInput:changeDataStoreType error');
		}
		this.updateFormats();
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
			dojo.style('ieb', 'width', tagetObj.clientWidth + 30 + "px");
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'display', '');
			dojo.style('davinci.ve.input.DataGridInput_img_folder', 'left', tagetObj.clientWidth + 1  + 'px');
			dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',tagetObj.clientWidth + 15 + "px");
		} else {
			dojo.style("davinci.ve.input.DataGridInput.dataStoreType", 'width',tagetObj.clientWidth + "px");
		}
	},
	
	_getTemplate: function(){
		// XXX TODO THis should be moved to an HTML file.
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

});
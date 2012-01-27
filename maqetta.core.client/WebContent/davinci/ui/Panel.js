define(["dojo/_base/declare", 
        "dijit/layout/ContentPane",
        "dijit/Dialog",
        "dijit/form/CheckBox",
        "dijit/form/Button",
        "dijit/form/RadioButton",
        "davinci/ui/widgets/List",
        "davinci/ui/widgets/ObjectStore",
        "davinci/ui/widgets/ArrayStore",
        "dijit/ColorPalette",
        "dijit/Tree",
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common"

  ],function(declare, ContentPane, Dialog, CheckBox, Button, RadioButton, List, ObjectStore, ArrayStore, ColorPalette, Tree, uiNLS, commonNLS){
	
	var Panel = declare("davinci.ui.Panel",ContentPane, {
		constructor: function(params, srcNodeRef){
			this.data=params.data ;
			this.nextID=1;
			this.immediateSave=params.immediateSave;
			this.contextObject=params.contextObject;
		},
		postMixInProperties: function(){
			this.inherited(arguments);

	/*		The object is to nested for cloning, this and dojo.clone send the browser into a recursive dive
	 *      Is it necessary to clone the object? the code seems to work without problems without cloning. wdr issue #630
	 *      
	 * 		function clone (o)
			{
			
				if(!o){ return o; }
				if(dojo.isArray(o)){
					var r = [];
					for(var i = 0; i < o.length; ++i){
						r.push( clone(o[i]));
					}
					return r; // Array
				}
				if(!dojo.isObject(o) || dojo.isFunction(o)){
					return o;	anything
				}
				r={};
				for(i in o){
					if(!(i in r) || r[i] != o[i]){
						r[i] = clone(o[i]);
					}
				}
				return r; // Object
			}
			
			
				this.definition= clone(this.definition);
				*/
		},

		
		
		 postCreate: function(){
			this.fields=[];
			this._buildPanel(this.definition,this.domNode);
		 },

		 onClick : function(){},
		 onChange : function(){},
		 
		 _buildPanel : function(definitions, parentNode)
		{
	    	  
	    	  var dataObject=this.data;
			for (var i=0; i<definitions.length;i++)
			{
				var field=definitions[i];

				var metadata = field.metadata = Panel.metadata[field.type];  
				
				if (!metadata)
				{
					var label = dojo.doc.createElement("div");
					label.innerHTML="UNKNOWN field type: "+field.type+"<br/>";
					parentNode.appendChild(label);
					continue;
				}
				
				
				function createLabel()
				{		
					var label = dojo.doc.createElement("label");
					label.innerHTML=field.label;
					label.htmlFor=parms.id;
					parentNode.appendChild(label);
				}

				
				
				var parms={};
				if (!field.id)
					field.id="id"+this.nextID++;
				if (field.style)
					parms.style=field.style;
				parms.id=this.id+'.'+field.id;
				if (field.label && metadata.createPreLabel)
				{
					createLabel();
				}
				var fieldData;

				if (field.data)
				{
					this.fields.push(field);
					if (dataObject && field.data)
						fieldData=this._getFieldData(field.data);
				
				}
				else if (field.id)
					this.fields.push(field);
				if (typeof fieldData == "undefined" && typeof field.defaultValue  != "undefined")
					fieldData=field.defaultValue;

				if (metadata.dojoType)
				{
					dojo["require"](metadata.dojoType);
					var widgetType=eval(metadata.dojoType);
				}
				

				var events=[];
				if (metadata.changeEvent)
				{
					if (this.immediateSave)
					{
						parms.intermediateChanges=true;
						function saveFunction(aPanel, aField){
							return function(){
								aPanel._saveField(aField);
								aPanel.onChange();
							};	
						}
						events.push(saveFunction(this,field));
					}
					if (field.link)
					{
						function linkFunction(aPanel, aField){
							
							return function(){
								aPanel._handleLink(aField);
							};	
						}
						events.push(linkFunction(this,field));
					}
					
				}

				if (metadata.updateParms)
					metadata.updateParms(field,parms,fieldData,this);
				
				var widget;
				if (metadata.createWidget)
					widget=metadata.createWidget(field,parms,fieldData,parentNode,this);
				else 
					widget=new widgetType(parms);
				

				if (widget && metadata.changeEvent)
				{
					for (var evt=0;evt<events.length;evt++)
					  dojo.connect(widget, metadata.changeEvent, events[evt]);
				}
//				
//				if(widget && metadata.onClick){
//					dojo.connect(metadata, "onClick", this, "onClick")
//				}
//				if(widget && metadata.onChange){
//					dojo.connect(metadata, "onClick", this, "onClick")
//				}
				if (widget)
				{
					field.widget=widget;
					if (!metadata.noAppend)
					  parentNode.appendChild(widget.domNode);
				}	
				if (field.label && metadata.createPostLabel)
				{
					createLabel();
				}
				parentNode.appendChild(dojo.doc.createElement("br"));
					
					
			}
			
		},
		
	     _getFieldData : function (fieldName)
	     {
			if(fieldName.indexOf('.')<0)
			{
				return this.data[fieldName];
			}
			var obj=this.data;
			var parts=fieldName.split('.');
			var value;
			for (var i=0;i<parts.length;i++)
			{
				value =obj[parts[i]];
				if (typeof value != 'undefined')
					obj=value;
				else 
					return;
			}
			return value;
	     },
	 	
	     _setFieldData : function (fieldName, value)
	     {
			if(fieldName.indexOf('.')<0)
			{
				this.data[fieldName] = value;
			}
			else
			{
				var obj=this.data;
				var parts=fieldName.split('.');
				var value;
				for (var i=0;i<parts.length-1;i++)
				{
					obj2 =obj[parts[i]];
					if (typeof obj2 == 'undefined')
					{
						obj2={}; obj2[part[i+1]]={};
					}
				}
				obj[parts.pop()]=value;
			}


	     },

	     _handleLink : function (field)
	     {
	    	 var link=field.link;
	    	if (link.enables)
	    	{
	    		var linkField=this.findField(link.enables);
	    		if (linkField)
	    			if (linkField.widget)
	    			{
	    				linkField.widget.attr("disabled",!field.metadata.getData(field));
	    			}
	    	}
	    	if (link.target)
	    	{
	    		var targetField=this.findField(link.target);
	    		if (targetField)
	    		{
	    			var data=field.metadata.getData(field);
	    			if (link.targetFunction)
	    				data= link.targetFunction.apply(this.contextObject, [data]);
	    			targetField.metadata.setData(targetField,data);    				
	    		}
	    	}
	    	
	     },
		 setData : function(data)
			{
			    if (this.data)
			    	this.saveData();
				this.data=data;
				for (var i=0; i<this.fields.length;i++)
				{
					var field=this.fields[i];

					if (field.data)
						fieldData=this._getFieldData(field.data);
					
					if (field.metadata.setData)
						field.metadata.setData(field,fieldData);
						
				}
				
			},
			
			findField : function (id)
			{
				for (var i=0;i<this.fields.length;i++)
				{
					if (this.fields[i].id==id)
						return this.fields[i];
				}
			},
			
			saveData : function()
			{
				for (var i=0; i<this.fields.length;i++)
				{
					var field=this.fields[i];
					this._saveField(field);
						
				}
			},
			_saveField : function(field)
			{
				var data;
				if (field.metadata.getData)
				{
					data=field.metadata.getData(field);
					this._setFieldData(field.data,data);
				}
				
			},
			
			onChange : function (){},
	});

	Panel.openDialog = function(params) {
		var dialog = new Dialog({
			title : params.title,
			style : params.style || "width:250px;height:300px"
		});

		var panel = new Panel(params, dialog.containerNode);
		dojo.style(panel.domNode, "overflow", "auto");
		// dialog.containerNode.appendChild(panel.domNode);

		var okClicked = function() {
			panel.saveData();
			dialog.destroyRecursive();
			dialog.destroy();
			if (params.onOK)
				params.onOK.apply(params.contextObject, []);
			return true;
		};

		var dijitLangObj = commonNLS;
		var okLabel = params.buttonLabel || dijitLangObj.buttonOk;
		var okStyle = params.buttonStyle || '';
		var okBtn = new Button({
			label : okLabel,
			style : okStyle, /* type:"submit", */
			onClick : okClicked
		});
		dialog.containerNode.appendChild(okBtn.domNode);

		dialog.show();
		return dialog;
	};

	Panel.metadata = {
		checkBox:{
			dojoType : "dijit.form.CheckBox",
			createPostLabel : true,
			changeEvent : "onChange",
			updateParms : function(field, parms, fieldData, panel) {
				parms.checked = fieldData;
				// if (panel.immediateSave)
				// parms.onChange=function(checked){
				// panel.data[field.data]=checked; panel.onChange();}
			},
			setData : function(field, data) {
				field.widget.attr("checked", data);
			},
			getData : function(field) {
				return field.widget.attr("checked");
			}
		},
		comboBox:{
			dojoType : "dijit.form.ComboBox",
			changeEvent : "onClick",
			createPreLabel : true
		},
		radioButton :{
			createWidget : function(field, parms, fieldData, node, panel) {

				var values = field.values.split(',');
				var labels = field.labels.split(',');

				var form = dojo.doc.createElement("form");
				form.id = field.id;

				var selectedInx = 0;
				for (; selectedInx < values.length; selectedInx++)
					if (values[selectedInx] == fieldData)
						break;

				var s = field.label || "";
				for ( var i = 0; i < values.length; i++) {
					var checked = "";// (i==selectedInx)?" checked":"";
					var id = field.id + '.' + i;
					s = s + '<input type=radio id="' + id + '" value="'
							+ values[i] + '" name="' + form.id + '.rb" '
							+ checked + '/> <label for="' + id + '">'
							+ labels[i] + '</label>';
					if (!field.sameLine)
						s = s + '<br />';
				}
				form.innerHTML = s;
				node.appendChild(form);

				field.widgets = [];
				for ( var i = 0; i < values.length; i++) {
					var id = field.id + '.' + i;
					var radioOne = new RadioButton({
						checked : i == selectedInx,
						value : values[i],
						name : form.id + '.rb'
					}, id);
					field.widgets.push(radioOne);
					// if (panel.immediateSave)
					// dojo.connect(radioOne,"onChange",dojo.hitch(this,function(child){
					// panel.data[field.data]=this.getData(field);
					// panel.onChange();
					// }));

				}

			},

			setData : function(field, data) {
				var values = field.values.split(',');
				var selectedInx = 0;
				for (; selectedInx < values.length; selectedInx++)
					if (values[selectedInx] == data)
						break;
				for ( var i = 0; i < values.length; i++) {
					field.widgets[i].attr("checked", values[i] == data);
				}

			},

			getData : function(field) {
				var values = field.values.split(',');
				for ( var i = 0; i < field.widgets.length; i++) {
					var selected = field.widgets[i].attr("checked");
					if (selected)
						return values[i];
				}

			}
		},
		textBox : {
			dojoType : "dijit.form.TextBox",
			createPreLabel : true,
			changeEvent : "onChange",
			updateParms : function(field, parms, fieldData, panel) {
				parms.value = fieldData;
				// if (panel.immediateSave)
				// {
				// parms.intermediateChanges=true;
				// parms.onChange=function(checked)
				// { panel.data[field.data]=field.widget.attr("value");
				// panel.onChange();}
				// }
			},
			setData : function(field, data) {
				field.widget.attr("value", data);

			},

			getData : function(field) {
				return field.widget.attr("value");

			}
		},
		text: {
			createPreLabel : true,
			changeEvent : "onChange",
			createWidget : function(field, parms, fieldData, node, panel) {
				widget = {
					domNode : dojo.create("span")
				};
				widget.domNode.innerHTML = fieldData;
				widget.domNode.id = parms.id;
				return widget;
			},

			setData : function(field, data) {
				field.widget.domNode.innerHTML = data;
			},

			getData : function(field) {
				return field.widget.domNode.innerHTML;
			}
		},
		numberTextBox: {
			dojoType : "dijit.form.NumberTextBox",
			createPreLabel : true,
			changeEvent : "onChange",
			updateParms : function(field, parms, fieldData, panel) {
				parms.value = fieldData;
				parms.constraints = constraints = {
					places : 0,
					min : 0,
					max : 1000000000000000
				};
				if (field.min || field.max) {
					constraints.min = field.min;

				}
				if (field.max) {
					constraints.max = field.max;

				}
				// if (panel.immediateSave)
				// {
				// parms.intermediateChanges=true;
				// parms.onChange=function(checked)
				// { panel.data[field.data]=field.widget.attr("value");
				// panel.onChange();}
				// }
			},
			setData : function(field, data) {
				field.widget.attr("value", data);

			},

			getData : function(field) {
				return field.widget.attr("value");

			}
		},
		button : {
			dojoType : "dijit.form.Button",
			updateParms : function(field, parms, fieldData, panel) {
				var clickFunc;

				if (field.runFunc)
					clickFunc = field.runFunc;
				else if (field.arrayNew)
					clickFunc = function() {
						var listField = panel.findField(field.arrayNew);
						if (listField && listField.widget
								&& listField.itemEditor) {
							var item = {};
							var params = {
								definition : listField.itemEditor,
								data : item,
								title : "new",// doesn't appear to be used
												// anymore
								onOK : function() {
									listField.widget.store.newItem(item);
								}
							};
							Panel.openDialog(params);

						}
					};
				else if (field.arrayEdit)
					clickFunc = function() {
						// debugger;
						var listField = panel.findField(field.arrayEdit);
						if (listField && listField.widget
								&& listField.itemEditor) {
							list = listField.widget;
							var selected = list.selected;
							if (selected && selected.length > 0) {
								var item = list.store
										.itemForLabel(selected[0]);
								var params = {
									definition : listField.itemEditor,
									data : item,
									title : "edit"// doesn't appear to be
													// used anymore
								};
								Panel.openDialog(params);

							}

						}
					};
				else if (field.arrayDelete)
					clickFunc = function() {
						var list = panel.findField(field.arrayDelete);
						if (list && list.widget) {
							list = list.widget;
							var selected = list.selected;
							if (selected && selected.length > 0) {
								var item = list.store
										.itemForLabel(selected[0]);
								list.store.deleteItem(item);
							}

						}
					};
				if (clickFunc)
					parms.onClick = clickFunc;
				parms.label = field.label;
			}
		},
		sortedList:{
			changeEvent : "onChanged",
			createWidget : function(field, parms, fieldData, node, panel) {

				// var store=new dojo.data.ItemFileReadStore({data: {
				// identifier: field.itemLabel,

				var identifier = field.itemLabel;
				var label = field.itemLabel;

				var dataStore;
				var keyName;

				if (field.labels) {

					var storeData = {
						labelMap : field.labels,
						items : fieldData
					};

					dataStore = new ObjectStore({
						data : storeData
					});
					keyName = ObjectStore.labelName;
				} else {

					var storeData = {
						identifier : field.itemLabel,
						label : field.itemLabel,
						items : fieldData
					};

					dataStore = new ArrayStore({
						data : storeData
					});
					keyName = field.itemLabel;
				}

				var parms = {
					store : dataStore,
					key : keyName,
					singleSelect : true
				};
				if (field.label)
					parms.title = field.label;
				if (field.dataFor) {
					parms.onChanged = function(selected) {
						var item = dataStore.itemForLabel(selected[0]);
						var forField = panel.findField(field.dataFor);
						if (forField) {
							forField.widget.setData(item);
						}
					};
				} else if (field.selectedItem) {
					parms.onChanged = function(selected) {
						var item = dataStore.itemForLabel(selected[0]);
						panel.data[field.selectedItem] = item;
					};
				}
				var widget = new List(parms);

				return widget;
			}

		},
		list : {
			changeEvent : "onChange",
			createWidget : function(field, parms, fieldData, node, panel) {

				var select = dojo.doc.createElement("select");
				select.id = field.id;
				select.multiple = true;

				var identifier = field.itemLabel;
				var label = field.itemLabel;

				var dataStore;
				var keyName;

				if (field.labels) {

					var storeData = {
						labelMap : field.labels,
						items : fieldData
					};

					dataStore = new ObjectStore({
						data : storeData
					});
					keyName = ObjectStore.labelName;
				} else {

					var storeData = {
						identifier : field.itemLabel,
						label : field.itemLabel,
						items : fieldData
					};

					dataStore = new ArrayStore({
						data : storeData
					});
					keyName = field.itemLabel;
				}

				var parms = {
					store : dataStore,
					key : keyName,
					singleSelect : true
				};
				if (field.label)
					parms.title = field.label;
				if (field.dataFor) {
					select.onchange = function(selected) {
						var item = dataStore.itemForLabel(this.value);
						var forField = panel.findField(field.dataFor);
						if (forField) {
							forField.widget.setData(item);
						}
					};
				} else if (field.selectedItem) {
					select.onchange = function(selected) {
						var item = dataStore.itemForLabel(this.value);
						panel.data[field.selectedItem] = item;
					};
				}

				var s = field.label || "";

				var props = {
					onComplete : function(items, requestObject) {
						for ( var i = 0; i < items.length; i++) {
							var item = dataStore
									.getValue(items[i], keyName);
							s = s + '<option>' + item + '</option>';
						}
					}
				};
				dataStore.fetch(props);

				select.innerHTML = s;
				node.appendChild(select);

			}

		},
		panel : {
			createWidget : function(field, parms, fieldData, node, panel) {
				var div = dojo.doc.createElement("div");
				node.appendChild(div);
				parms.definition = field.children;
				var widget = new Panel(parms, div);
				field.widget = widget;
			},
			getData : function(field) {
				field.widget.saveData();
				return field.widget.data;

			}

		},
		layout : {
			createWidget : function(field, parms, fieldData, node, panel) {
				var table = dojo.doc.createElement("table");
			var row = dojo.doc.createElement("tr");
			table.setAttribute("border", "3");

			table.appendChild(row);
			var left = dojo.doc.createElement("td");
			var right = dojo.doc.createElement("td");
			row.appendChild(left);
			row.appendChild(right);
			node.appendChild(table);
			if (field.left) {
				panel._buildPanel(field.left, left);
			}

			if (field.right) {

				panel._buildPanel(field.right, right);
			}

			}
		},
		colorChooser:{
			createPreLabel : true,
			createWidget : function(field, parms, fieldData, node, panel) {

				var div = dojo.create("img", {
					src : dojo.config.blankGif
							|| dojo
									.moduleUrl("dojo",
											"resources/blank.gif"),
					style : {
						width : "40px",
						height : "15px",
						border : "2px solid black"
					}

				});

				div.onclick = function() {

					var dialog = new Dialog({
						title : "Choose Color"// doesn't appear to be used
												// anymore
					});

					var div2 = dojo.create("div", {
						innerHTML : "Selected color is: "// doesn't
															// appear to be
															// used anymore
					});
					var theSpan = dojo.create("span");
					div2.appendChild(theSpan);
					function setColor(color) {
						theSpan.style.color = color;
						theSpan.innerHTML = color;
					}

					var okClicked = function() {
						var imgStyle = div.style;
						imgStyle.color = imgStyle.backgroundColor = theSpan.style.color;
						dialog.destroyRecursive();
						dialog.destroy();
						return true;
					};

					palette = new ColorPalette({
						palette : "7x10",
						value : div.style.color,
						id : "progPalette",
						onChange : setColor
					});

					dialog.containerNode.appendChild(div2);

					var okBtn = new Button({
						label : 'ok',/* type:"submit", */
						onClick : okClicked
					});
					dialog.containerNode.appendChild(okBtn.domNode);

					setColor(div.style.color);

					dialog.show();
				};

				node.appendChild(div);

				field.div = div;

			},
			setData : function(field, data) {
				var imgStyle = field.div.style;
				imgStyle.color = imgStyle.backgroundColor = data;

			},

			getData : function(field) {
				return field.div.style.color;
			}

		},
		dynamic: {
			createWidget : function(field, parms, fieldData, parentNode,
					panel) {
				var node = field.createNode(fieldData, node, panel);
				parentNode.appendChild(node);
			}

		},
		tree : {
			changeEvent : "onClick",
			noAppend : true,
			createWidget : function(field, parms, fieldData, parentNode,
					panel) {

				var contentPane = new ContentPane({});
				parentNode.appendChild(contentPane.domNode);

				var modelName = field.model;
				if (dojo.isString(modelName)) {
					// dojo.require(modelName);
					var modelParm = field.modelParms || {};
					parms.model = new (dojo.getObject(modelName))(modelParm);
				} else {
					// I would assume that becouse we are not cloning the
					// model in postMixInProperties
					// we are being passed the model object instead of the
					// name, so lets just use it. wdr issue #630
					parms.model = modelName; // wdr
				}
				parms.filters = [];
				if (field.filters) {
					dojo.forEach(field.filters.split(','), function(each) {
						var filter = dojo.getObject(each);
						if (filter && filter.filterList)
							parms.filters.push(filter);
					});
				}
				parms.style = parms.style || "height:10em;overflow:auto";

				field.tree = new Tree(parms);

				function ccf(field, parent) {

					return function(event) {

						field._selected = event;
						parent.onClick(event);
					};
				}

				dojo.connect(field.tree, "onClick", ccf(field, this));
				contentPane.domNode.appendChild(field.tree.domNode);

				return field.tree;
			},

			onClick : function() {

			},

			setData : function(field, data) {
				field._selected = data;
				field.widget.setSelected(data);
			},
			getData : function(field) {
				return field._selected;
			}
		}
	};

	return Panel;
});





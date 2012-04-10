define([
	"dojo/_base/kernel",
	"dijit",
	"dojo/text!../../templates/FilterPane.html",
	"dojo/_base/declare",
	"./DistinctComboBoxMenu",
	"./Filter",
	"dijit/layout/ContentPane",
	"dojo/data/ItemFileReadStore",
	"dijit/form/Select",
	"dijit/form/TextBox",
	"dijit/form/DateTextBox",
	"dijit/form/TimeTextBox",
	"dijit/form/RadioButton",
	"dijit/form/NumberTextBox",
	"dijit/form/ComboBox",
	"dojox/html/ellipsis",
	"dojo/store/util/QueryResults",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/html",
	"dojo/query"
], function(dojo, dijit, template, declare, DistinctComboBoxMenu, Filter){
	return declare([dijit.layout.ContentPane], {
		content: template,
		sltColumn: null,
		sltCondition: null,
		grid: null,
		title: 'Rule',
		postCreate: function(){
			this.inherited(arguments);
			this._initFields();
			this._initSltCol();
			this.connect(this.sltColumn, 'onChange', '_onColumnChange');
			this.connect(this.sltCondition, 'onChange', '_onConditionChange');
			this.comboText.dropDownClass = DistinctComboBoxMenu;
		},
	
		getData: function(){
			// summary:
			//	Get the filter defined by this filter pane.
			var value = this._getValue(), condition = this.sltCondition.get('value');
			if(condition === 'isEmpty' || (value !== null && (condition !== 'range' || (value.start && value.end)))){
				return {
					colId: this.sltColumn.get('value'),
					condition: condition,
					value: condition === 'isEmpty' ? '' : value,
					type: this._getType()
				};
			}else{
				return null;
			}
		},
		setData: function(data){
			// summary:
			//	Set the data of the pane to restore UI.
			if(data === null){return;}
			this.sltColumn.set('value', data.colId, null);
			this._onColumnChange();
			this.sltCondition.set('value', data.condition, null);
			this._onConditionChange();
			this._setValue(data.value);
		},
		close: function(){
			var ac = this._getContainer();
			if(ac.getChildren().length === 4){
				//while there's less than 4 rules, no scroll bar
				ac._contentBox.w += dojox.html.metrics.getScrollbar().w;
			}
			
			if(this === ac.selectedChildWidget){
				//select previous pane if this is current, consistent with EDG filter.
				var i = dojo.indexOf(ac.getChildren(), this);
				if(i > 0){ac.selectChild(ac.getChildren()[i-1]);}
			}
			
			ac.removeChild(this);
			dojo.toggleClass(ac.domNode, 'gridxFilterSingleRule', ac.getChildren().length === 1);
			this.grid.filterBar._filterDialog._updateAccordionContainerHeight();
		},
		onChange: function(){
			//summary:
			//	event: fired when column, condition or value is changed
		},
		_getContainer: function(){
			return dijit.byNode(this.domNode.parentNode.parentNode.parentNode);
		},
		_initFields: function(){
			this.sltColumn = dijit.byNode(dojo.query('li>table', this.domNode)[0]);
			this.sltCondition = dijit.byNode(dojo.query('li>table', this.domNode)[1]);
			var fields = this._fields = [
				this.tbSingle = dijit.byNode(dojo.query('.gridxFilterPaneTextWrapper > .dijitTextBox', this.domNode)[0]),
				this.tbNumber = dijit.byNode(dojo.query('.gridxFilterPaneNumberWrapper > .dijitTextBox', this.domNode)[0]),
				this.comboText = dijit.byNode(dojo.query('.gridxFilterPaneComboWrapper > .dijitComboBox', this.domNode)[0]),
				this.sltSingle = dijit.byNode(dojo.query('.gridxFilterPaneSelectWrapper > .dijitSelect', this.domNode)[0]),
				this.dtbSingle = dijit.byNode(dojo.query('.gridxFilterPaneDateWrapper > .dijitDateTextBox', this.domNode)[0]),
				this.dtbStart = dijit.byNode(dojo.query('.gridxFilterPaneDateRangeWrapper > .dijitDateTextBox', this.domNode)[0]),
				this.dtbEnd = dijit.byNode(dojo.query('.gridxFilterPaneDateRangeWrapper > .dijitDateTextBox', this.domNode)[1]),
				this.ttbSingle = dijit.byNode(dojo.query('.gridxFilterPaneTimeWrapper > .dijitTimeTextBox', this.domNode)[0]),
				this.ttbStart = dijit.byNode(dojo.query('.gridxFilterPaneTimeRangeWrapper > .dijitTimeTextBox', this.domNode)[0]),
				this.ttbEnd = dijit.byNode(dojo.query('.gridxFilterPaneTimeRangeWrapper > .dijitTimeTextBox', this.domNode)[1]),
				this.rbTrue = dijit.byNode(dojo.query('.gridxFilterPaneRadioWrapper .dijitRadio', this.domNode)[0]),
				this.rbFalse = dijit.byNode(dojo.query('.gridxFilterPaneRadioWrapper .dijitRadio', this.domNode)[1])
			];
			
			this.rbTrue.domNode.nextSibling.htmlFor = this.rbTrue.id;
			this.rbFalse.domNode.nextSibling.htmlFor = this.rbFalse.id;
			var name = 'rb_name_' + Math.random();
			this.rbTrue.set('name', name);
			this.rbFalse.set('name', name);
			
			dojo.forEach(fields, function(field){
				this.connect(field, 'onChange', '_onValueChange');
			}, this);
		},
		_initSltCol: function(){
			var colOpts = [{label: 'Any Column', value: ''}],
				fb = this.grid.filterBar, 
				sltCol = this.sltColumn;
			dojo.forEach(this.grid.columns(), function(col){
				if(!col.isFilterable())return;
				colOpts.push({value: col.id, label: col.name()});
			}, this);
			sltCol.addOption(colOpts);
		},
		_initCloseButton: function(){
			//summary:
			//	Add a close button to the accordion pane.
			//  Must be called after adding to an accordion container.
	        var btnWidget = this._buttonWidget;
	        var closeButton = dojo.create('span', {
	            className: 'gridxFilterPaneCloseButton'
	            ,innerHTML: '<img src="' + this._blankGif + '"/>'
	            ,title: 'Close'
	        }, btnWidget.domNode, 'first');
	        this.connect(closeButton, 'onclick', 'close');
	        dojo.addClass(btnWidget.titleTextNode, 'dojoxEllipsis');
	    },
	    
	    _onColumnChange: function(){
	    	var opt = this.grid.filterBar._getConditionOptions(this.sltColumn.get('value'));
	    	var slt = this.sltCondition;
	    	if(slt.options && slt.options.length){slt.removeOption(slt.options);}
	    	slt.addOption(dojo.clone(opt));
	    	this._updateTitle();
	    	this.onChange();
	    },
	    _onConditionChange: function(){
	    	this._updateValueField();
	    	this._updateTitle();
	    	this.onChange();
	    },
	    _onValueChange: function(){
	    	this._updateTitle();
	    	this.onChange();
	    },
	    _getDataType: function(){
	    	//summary:
	    	//		Get current column data type
	    	var colid = this.sltColumn.get('value');
	    	var dataType = 'string';
	    	if(colid !== ''){
	    		dataType = this.grid.column(colid).dataType();
	    	}
	    	return dataType;
	    },
	    _getType: function(){
	    	//summary:
	    	//	Get current filter type, determined by data type and condition.
	    	var mapping = {'string': 'Text', number: 'Number', date: 'Date', time: 'Time', 'boolean': 'Radio'};
	    	var type = mapping[this._getDataType()];
	    	if('range' === this.sltCondition.get('value')){type += 'Range';} ;
	    	return type;
	    },
	    _updateTitle: function(){
	    	if(!this._buttonWidget){return;}
	    	var title, value = this._getValue(), 
	    		type = this._getType(), condition = this.sltCondition.get('value'),
	    		txtNode = this._buttonWidget.titleTextNode;
	    	
	    	if(value && (condition !== 'range' || (value.start && value.end))){
				title = this.sltColumn.get('displayedValue') + ' ' + this.grid.filterBar._getRuleString(condition, value, type);
	    	}else{
	    		title = 'Rule ' + (dojo.indexOf(this._getContainer().getChildren(), this) + 1);
	    	}
	    	txtNode.innerHTML = title;
			txtNode.title = title.replace(/<\/?span[^>]*>/g, '').replace('&nbsp;', ' ');
		},
		_needComboBox: function(){
			//summary:
			//	Whether current state needs a combo box for string input, may rewrite to support virtual column
			var colId = this.sltColumn.get('value');
			return this._getType() === 'Text' && !!colId && this.grid._columnsById[colId].field;
		},
	    _updateValueField: function(){
	    	// summary:
	    	//	Update the UI for field to show/hide fields.
	    	var type = this._getType(), colId = this.sltColumn.get('value');
	    	var combo = this._needComboBox();
	    	
	    	dojo.forEach(['Text','Combo', 'Date', 'Number', 'DateRange', 'Time', 'TimeRange', 'Select', 'Radio'], function(k){
	    		dojo.removeClass(this.domNode, 'gridxFilterPane' + k);
	    	}, this);
	    	
			dojo.addClass(this.domNode, 'gridxFilterPane' + (combo ? 'Combo' : type));
			var disabled = this.sltCondition.get('value') === 'isEmpty';
			dojo.forEach(this._fields, function(f){f.set('disabled', disabled)});
			
			if(combo){
				if(!this._dummyCombo){
					//HACK: mixin query, get, etc methods to store, remove from 2.0.
					this._dummyCombo = new dijit.form.ComboBox({store: this.grid.store});
				}
				//init combobox
				var col = this.grid._columnsById[colId];
				dojo.mixin(this.comboText, {
					store: this.grid.store,
					searchAttr: col.field,
					fetchProperties: {sort:[{attribute: col.field, descending: false}]}
				});
			}
	    },
	    _getValue: function(){
	    	// summary:
	    	//		Get current filter value
	    	var type = this._getType(), combo = this._needComboBox();
	    	switch(type){
	    		case 'Text':
	    			return (combo ? this.comboText : this.tbSingle).get('value') || null;
	    		case 'Number':
	    			return isNaN(this.tbNumber.get('value')) ? null : this.tbNumber.get('value');
	    		case 'Select':
	    			return this.sltSingle.get('value') || null;
	    		case 'Date':
	    			return this.dtbSingle.get('value') || null;
	    		case 'DateRange':
	    			return {start: this.dtbStart.get('value'), end: this.dtbEnd.get('value')};
	    		case 'Time':
	    			return this.ttbSingle.get('value') || null;
	    		case 'TimeRange':
	    			return {start: this.ttbStart.get('value'), end: this.ttbEnd.get('value')};
	    		case 'Radio':
	    			return !!this.rbTrue.get('checked');
	    		default:
	    			return null;
	    	}
	    },
	    _setValue: function(value){
	    	if(!value){return;}
	    	var type = this._getType(), combo = this._needComboBox();
	    	switch(type){
	    		case 'Text':
	    			(combo ? this.comboText : this.tbSingle).set('value', value);
	    			break;
	    		case 'Number':
	    			this.tbNumber.set('value', value);
	    			break;
	    		case 'Select':
	    			this.sltSingle.set('value', value);
	    			break;
	    		case 'Date':
	    			this.dtbSingle.set('value', value);
	    			break;
	    		case 'DateRange':
	    			this.dtbStart.set('value', value.start);
	    			this.dtbEnd.set('value', value.end);
	    			break;
	    		case 'Time':
	    			this.ttbSingle.set('value', value);
	    			break;
	    		case 'TimeRange':
	    			this.ttbStart.set('value', value.start);
					this.ttbEnd.set('value', value.end);
					break;
	    		case 'Radio':
	    			this.rbTrue.set('checked', true);
	    			break;
	    	}
	    },
	    uninitialize: function(){
	    	if(this._dummyCombo){this._dummyCombo.destroyRecursive();}
	    }
	});
});

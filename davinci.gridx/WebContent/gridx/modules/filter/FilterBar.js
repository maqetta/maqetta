define([
	"dojo/_base/kernel",
	"dijit",
	"dojo/_base/declare",
	"../../core/_Module",
	"dojo/text!../../templates/FilterBar.html",
	"dojo/i18n!../../nls/FilterBar",
	"./Filter",
	"./FilterDialog",
	"./FilterConfirmDialog",
	"./FilterTooltip",
	"dijit/TooltipDialog",
	"dijit/popup",
	"dijit/Tooltip",
	"dojo/date/locale",
	"dojo/_base/array",
	"dojo/_base/html",
	"dojo/query",
	"dojo/parser",
	"dojo/string"	
], function(dojo, dijit, declare, _Module, template, locale, Filter, FilterDialog, FilterConfirmDialog, FilterTooltip){

	/*=====
	var columnDefinitionFilterMixin = {
		// filterable: Boolean
		//		If FALSE, then this column should not occur in the Filter Definition Dialog for future rules.
		//		But this does not influence existing filter rules. Default to be TRUE.
		filterable: true,
	
		// disabledConditions: String[]
		//		If provided, all the listed conditions will not occur in the Filter Definition Dialog for future rules.
		//		But this does not influence existing filter rules. Default to be an empty array.
		disabledConditions: [],
	
		// dataType: String
		//		Specify the data type of this column. Should be one of "string", "number", "date", "time", and "boolean".
		//		Case insensitive. Data type decides which conditions to use in the Filter Definition Dialog.
		dataType: 'date'
		storeDatePattern: ''
		formatter: ''
		dateParsePatter: 'yyyy/MM/dd HH:mm:ss'
		filterArgs: {
			trueLabel: '',
			falseLabel: '',
			valueDijitArgs: {}
		}
		// dataTypeArgs: Object
		//		Passing any other special config options for this column. For example, if the column is of type 'date', but the data
		//		in store is of string type, then a 'converter' function is needed here:
		//		dataTypeArgs: {
		//			useRawData: true,
		//			converter: function(v){
		//				return dojo.date.locale.parse(v, {...});
		//			}
		//		}
		dataTypeArgs: {},
	};
	=====*/
	
	return _Module.register(
	declare(_Module, {
		name: 'filterBar',
		forced: ['filter'],
		getAPIPath: function(){
			return {
				filterBar: this
			};
		},
		//Public-----------------------------------------------------------
		
		// closeFilterBarButton: Boolean
		//		TRUE to show a small button on the filter bar for the user to close/hide the filter bar.
		closeFilterBarButton: true,
	
		// defineFilterButton: Boolean
		//		FALSE to hide the define filter button on the left side (right side for RTL) of the filter bar.
		defineFilterButton: true,
		
		// tooltipDelay: Number
		//		Time in mili-seconds of the delay to show the Filter Status Tooltip when mouse is hovering on the filter bar.
		tooltipDelay: 300,
	
		// maxRuleCount: Integer
		//		Maximum rule count that can be applied in the Filter Definition Dialog.
		//		If <= 0 or not number, then infinite rules are supported.
		maxRuleCount: 0,
		
		// ruleCountToConfirmClearFilter: Integer | Infinity | null
		//		If the filter rule count is larger than or equal to this value, then a confirm dialog will show when clearing filter.
		//		If set to less than 1 or null, then always show the confirm dialog.
		//		If set to Infinity, then never show the confirm dialog.
		//		Default value is 2.
		ruleCountToConfirmClearFilter: 2,
	
	/*=====
		// itemsName: String
		//		The general name of the items listed in the grid.
		//		If not provided, then search the language bundle.
		itemsName: '',=====*/
	
		// condition:
		//		Name of all supported conditions.
		//		Hard coded here or dynamicly generated is up to the implementer. Anyway, users should be able to get this info.
		conditions: {
			string: ['equal', 'contain','startWith', 'endWith', 'notEqual','notContain', 'notStartWith', 'notEndWith',	'isEmpty'],
			number: ['equal','greater','less','greaterEqual','lessEqual','notEqual','isEmpty'],
			date: ['equal','before','after','range','isEmpty'],
			time: ['equal','before','after','range','isEmpty'],
			'boolean': ['equal','isEmpty']
		},
		
		
		
		load: function(args, startup){
			//summary:
			//	Init filter bar UI
			//Add before and after expression for filter.
			var F = Filter;
			F.before = F.lessEqual;
			F.after = F.greaterEqual;
			this.closeFilterBarButton = this.arg('closeFilterBarButton') || this.closeFilterBarButton;
			this.defineFilterButton = this.arg('defineFilterButton') || this.defineFilterButton;
			this.tooltipDelay = this.arg('tooltipDelay') || this.tooltipDelay;
			this.maxRuleCount = this.arg('maxRuleCount') || this.maxRuleCount;
			this.ruleCountToConfirmClearFilter = this.arg('ruleCountToConfirmClearFilter') || this.ruleCountToConfirmClearFilter;
			
			this.domNode = dojo.create('div', {
				innerHTML: template,
				'class': 'gridxFilterBar'
			});
			dojo.parser.parse(this.domNode);
			dojo.toggleClass(this.domNode, 'gridxFilterBarHideCloseBtn', !this.closeFilterBarButton);
			this.grid.vLayout.register(this, 'domNode', 'headerNode', -1);
			this._nls = locale;
			// this._nls = dojo.i18n.getLocalization("gridx", "FilterBar");
			this._initWidgets();
			this.refresh();
			//this._buildFilterState();
			this.connect(this.domNode, 'onclick', 'onDomClick');
			this.connect(this.domNode, 'onmouseover', 'onDomMouseOver');
			this.connect(this.domNode, 'onmousemove', 'onDomMouseMove');
			this.connect(this.domNode, 'onmouseout', 'onDomMouseOut');
			this.loaded.callback();
		},
		onDomClick: function(e){
			if(!e.target || !e.target.tagName){return;}
			if(dojo.attr(e.target, 'action') === 'clear'){
				this.clearFilter();
			}else if(dojo.hasClass(e.target, 'gridxFilterBarCloseBtn')){
				this.hide();
			}else {
				this.showFilterDialog();
			}
		},
		onDomMouseMove: function(e){
			if(e && e.target && (dojo.attr(e.target, 'action') === 'clear'
				|| this.btnFilter === dijit.getEnclosingWidget(e.target))){return;}
			this._showTooltip(e);
		},
		onDomMouseOver: function(e){},
		onDomMouseOut: function(e){
			//Make sure to not hide tooltip when mouse moves to tooltip itself.
			window.setTimeout(dojo.hitch(this, '_hideTooltip'), 10);
		},
		
		applyFilter: function(filterData){
			//summary:
			//		Apply the filter data.
			var F = Filter, exps = [];
			this.filterData = filterData;
			
			dojo.forEach(filterData.conditions, function(data){
				var type = 'string';
				if(data.colId){
					type = this.grid.column(data.colId).dataType();
					exps.push(this._getFilterExpression(data.condition, data, type, data.colId));
				}else{
					//any column
					var arr = [];
					dojo.forEach(this.grid.columns(), function(col){
						if(!col.isFilterable()){return;}
						arr.push(this._getFilterExpression(data.condition, data, type, col.id));
					}, this);
					exps.push(F.or.apply(F, arr));
				}
			}, this);
			var filter = (filterData.type === 'all' ? F.and : F.or).apply(F, exps);
			this.grid.filter.setFilter(filter);
			var _this = this;
			this.model.when({}).then(function(){
				_this._currentSize = _this.model.size();
				_this._totalSize = _this.model._cache.size();
				_this._buildFilterState();
			});
		},
		
		confirmToExecute: function(callback, scope){
			var max = this.ruleCountToConfirmClearFilter;
			if(this.filterData && (this.filterData.conditions.length >= max || max <= 0)){
				if(!this._cfmDlg){
					this._cfmDlg = new FilterConfirmDialog();
				}
				this._cfmDlg.execute = dojo.hitch(scope, callback);
				this._cfmDlg.show();
			}else{
				callback.apply(scope);
			}
		},
		
		clearFilter: function(noConfirm){
			if(!noConfirm){
				this.confirmToExecute(dojo.hitch(this, 'clearFilter', true), this);
			}else{
				this.filterData = null;
				this.grid.filter.setFilter();
				this._buildFilterState();
			}
		},
	
		columnMixin: {
			isFilterable: function(){
				// summary:
				//		Check if this column is filterable.
				// return: Boolean
				return this.grid._columnsById[this.id].filterable !== false;
			},
	
			setFilterable: function(filterable){
				// summary:
				//		Set filterable for this column.
				// filterable: Boolean
				//		TRUE for filterable, FALSE for not.
				// return:
				//		column object itself
				this.grid.filterBar._setFilterable(this.id, filterable);
				return this;
			},
	
			dataType: function(){
				// summary:
				//		Get the data type of this column. Always lowercase.
				// return: String
				return (this.grid._columnsById[this.id].dataType || 'string').toLowerCase();
			},
	
			filterConditions: function(){
				// summary:
				//		Get the available conditions for this column.	
				return this.grid.filterBar._getColumnConditions(this.id);
			}
		},
	
		refresh: function(){
			// summary:
			//		Re-draw the filter bar if necessary with the current attributes.
			// example:
			//		grid.filterBar.closeFilterBarButton = true;
			//		grid.filterBar.refresh();
			this.btnClose.style.display = this.closeFilterBarButton ? '': 'none';
			this.btnFilter.style.display = this.defineFilterButton ? '': 'none';
		},
		isVisible: function(){
			return this.domNode.style.display != 'none';
		},
		show: function(){
			// summary:
			//		Show the filter bar. (May add animation later)
			this.domNode.style.display = 'block';
			this.grid.vLayout.reLayout();
			this.onShow();
		},
	
		hide: function(){
			// summary:
			//		Hide the filter bar. (May add animation later)
			this.domNode.style.display = 'none';
			this.grid.vLayout.reLayout();
			this._hideTooltip();
			this.onHide();
		},
		onShow: function(){
			
		},
		onHide: function(){
			
		},
		showFilterDialog: function(){
			// summary:
			//		Show the filter define dialog.
			var dlg = this._filterDialog;
			if(!dlg){
				this._filterDialog = dlg = new FilterDialog({
					grid: this.grid
				});
			}
			if(dlg.open){return;}
			dlg.setData(this.filterData);
			dlg.show();
		},
		
		uninitialize: function(){
			this._filterDialog && this._filterDialog.destroyRecursive();
			this.inherited(arguments);
			dojo.destroy(this.domNode);
		},
	
		//Private---------------------------------------------------------------
		_getColumnConditions: function(colId){
			// summary:
			//		Get the available conditions for a specific column. 
			// 		Excluded condtions is defined by col.disabledConditions
			// tag:
			//		private
			// colId: String|Number
			//		The ID of a column.
			// return: String[]
			//		An array of condition names.
			
			var disabled, type;
			if(!colId){
				//any column
				disabled = [];
				type = 'string';
			}else{
				disabled = this.grid._columnsById[colId].disabledConditions||[];
				type = (this.grid._columnsById[colId].dataType || 'string').toLowerCase();
			}
			
			var ret = this.conditions[type], hash = {};
			if(!ret){ret = conditionData['string'];}
			dojo.forEach(disabled, function(name){hash[name]=true;});
			ret = dojo.filter(ret, function(name){return !hash[name];});
			return ret;
		},
		
		_setFilterable: function(colId, filterable){
			var col = this.grid._columnsById[colId];
			if(!col){return;}
			if(col.filterable == !!filterable){return;}
			col.filterable = !!filterable;
			if(this.filterData){
				var d = this.filterData, len = d.conditions.length;
				d.conditions = dojo.filter(d.conditions, function(c){
					return c.colId != colId;
				});
				if(len != d.conditions.length){
					this.applyFilter(d);
				}
				if(this._filterDialog.open){
					this._filterDialog.setData(d);
				}
			}
		},
		_initWidgets: function(){
			this.btnFilter = dijit.byNode(dojo.query('.dijitButton', this.domNode)[0]);
			this.btnClose = dojo.query('.gridxFilterBarCloseBtn', this.domNode)[0];
			this.statusNode = dojo.query('.gridxFilterBarStatus', this.domNode)[0].firstChild;
			//this.connect(this.btnFilter, 'onClick', 'showFilterDialog');	
		},
		
		_buildFilterState: function(){
			//summary:
			//		Build the tooltip dialog to show all applied filters.
			var nls = this._nls;
			if(!this.filterData || !this.filterData.conditions.length){
				this.statusNode.innerHTML = nls.filterBarMsgNoFilterTemplate;
				return;
			}
			this.statusNode.innerHTML = dojo.string.substitute(nls.filterBarMsgHasFilterTemplate, 
				[this._currentSize, this._totalSize, 'items']) + 
				'&nbsp; &nbsp; <a href="javascript:void(0);" action="clear" title="Clear filter">Clear Filter</a>';
			this._buildTooltip();
		},
		_buildTooltip: function(){
			if(!this._tooltip){
				this._tooltip = new FilterTooltip({grid: this.grid});
			}
			this._tooltip.buildContent();
		},
		_showTooltip: function(evt, delayed){
			this._hideTooltip();
			if(!this.filterData || 
				!this.filterData.conditions || 
				!this.filterData.conditions.length){return;}
			if(!delayed){
				this._pointTooltipDelay = window.setTimeout(dojo.hitch(this, '_showTooltip', 
					evt, true),this.tooltipDelay);
				return;
			}
			this._tooltip.show(evt);
		},
		_hideTooltip: function(){
			var dlg = this._tooltip;
			if(!dlg){return;}
			if(dlg.isMouseOn){return;}
			if(this._pointTooltipDelay){
				window.clearTimeout(this._pointTooltipDelay);
				this._pointTooltipDelay = null;
			}
			dlg.hide();
		},
		_getRuleString: function(condition, value, type){
			//var k = condition.charAt(0).toUpperCase() + condition.substring(1);
			//return '<span style="font-style:italic">' + k + '</span> ' + value;
			var valueString, type;
			if(condition == 'isEmpty'){
				valueString = '';
			}else if(/^date|^time/i.test(type)){
				var f = this._formatDate;
				if(/^time/i.test(type)){f = this._formatTime;}
				
				if(condition === 'range'){
					var tpl = this._nls.rangeTemplate;
					valueString = dojo.string.substitute(tpl, [f(value.start), f(value.end)]);
				}else{
					valueString = f(value);
				}
			}else{
				valueString = value;
			}
			return '<span style="font-style:italic">' + this._getConditionDisplayName(condition) + '</span> ' + valueString;
		},
		_getConditionDisplayName: function(c){
			var k = c.charAt(0).toUpperCase() + c.substring(1);
			return this._nls['condition' + k];
		},
		_getConditionOptions: function(colId){
			var nls = this._nls;
			var cache = this._conditionOptions = this._conditionOptions || {};
			if(!cache[colId]){
				var arr = [];
				dojo.forEach(this._getColumnConditions(colId), function(s){
					var k = s.charAt(0).toUpperCase() + s.substring(1);
					arr.push({label: nls['condition' + k], value: s});
				}, this);
				cache[colId] = arr;
			}
			return cache[colId];
		},
		
		_getFilterExpression: function(condition, data, type, colId){
			//get filter expression by condition,data, column and type
			var F = Filter;
//			if(data.condition === 'isEmpty'){
//				return F.isEmpty(F.column(colId, type));
//			}
			var dc = this.grid._columnsById[colId].dateParser||this._stringToDate;
			var tc = this.grid._columnsById[colId].timeParser||this._stringToTime;
			var converter = {date: dc, time: tc};
			var c = data.condition, exp, isNot = false, type = c == 'isEmpty' ? 'string' : type; //isEmpty always treat type as string
			if(c === 'range'){
				var startValue = F.value(data.value.start, type),
					endValue = F.value(data.value.end, type), 
					columnValue = F.column(colId, type, converter[type]);
				exp = F.and(F.greaterEqual(columnValue, startValue), F.lessEqual(columnValue, endValue));
			}else{
				if(/^not/.test(c)){
					isNot = true;
					c = c.replace(/^not/g, '');
					c = c.charAt(0).toLowerCase() + c.substring(1);
				}
				exp = F[c](F.column(colId, type, converter[type]), c == 'isEmpty' ? null : F.value(data.value, type));
				if(isNot){exp = F.not(exp);}
			}
			return exp;
		},
		_stringToDate: function(s, pattern){
			pattern = pattern || /(\d{4})\/(\d\d?)\/(\d\d?)/;
			pattern.test(s);
			var d = new Date();
			d.setFullYear(parseInt(RegExp.$1));
			d.setMonth(parseInt(RegExp.$2)-1);
			return d;
		},
		_stringToTime: function(s, pattern){
			pattern = pattern || /(\d\d?):(\d\d?):(\d\d?)/;
			pattern.test(s);
			var d = new Date();
			d.setHours(parseInt(RegExp.$1));
			d.setMinutes(parseInt(RegExp.$2));
			d.setSeconds(parseInt(RegExp.$3));
			return d;
		},
		_formatDate: function(date){
			//this may be customized by grid layout definition
			var m = date.getMonth() + 1, d = date.getDate();
			return m + '/' + d + '/' + date.getFullYear();
		},
		_formatTime: function(time){
			//this may be customized by grid layout definition
			var h = time.getHours(), m = time.getMinutes();
			if(h < 10){h = '0' + h;}
			if(m < 10){m = '0' + m;}
			return h + ':' + m + ':00';
		}
	}));
});

dojo.provide("dojox.grid.enhanced.plugins.filter.FilterDefDialog");

dojo.require("dijit.dijit");
dojo.require("dijit.Tooltip");
dojo.require("dojox.grid.enhanced.plugins.Dialog");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.TimeTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojo.date.locale");
dojo.require("dojo.string");
dojo.require("dojox.grid.enhanced.plugins.filter.FilterBuilder");
dojo.require("dojox.grid.cells.dijit");
dojo.require("dojox.html.ellipsis");
dojo.require("dojox.html.metrics");
dojo.require("dojo.window");

(function(){
var fns = dojox.grid.enhanced.plugins.filter,
	_tabIdxes = {
		// summary:
		//		Define tabindexes for elements in the filter definition dialog
		relSelect: 60,
		accordionTitle: 70,
		removeCBoxBtn: -1,
		colSelect: 90,
		condSelect: 95,
		valueBox: 10,
		addCBoxBtn: 20,
		filterBtn: 30,
		clearBtn: 40,
		cancelBtn: 50
	};
dojo.declare("dojox.grid.enhanced.plugins.filter.FilterDefDialog", null, {
	// summary:
	//		Create the filter definition UI.
	curColIdx: -1,
	_relOpCls: "logicall",
	_savedCriterias: null,
	plugin: null,
	constructor: function(args){
		var plugin = this.plugin = args.plugin;
		this.builder = new fns.FilterBuilder();
		this._setupData();
		this._cboxes = [];
		this.defaultType = plugin.args.defaultType || "string";
		
		(this.filterDefPane = new fns.FilterDefPane({
			"dlg": this
		})).startup();
		(this._defPane = new dojox.grid.enhanced.plugins.Dialog({
			"refNode": this.plugin.grid.domNode,
			"title": plugin.nls.filterDefDialogTitle,
			"class": "dojoxGridFDTitlePane",
			"iconClass": "dojoxGridFDPaneIcon",
			"content": this.filterDefPane
		})).startup();
		
		this._defPane.connect(plugin.grid.layer('filter'), "filterDef", dojo.hitch(this, "_onSetFilter"));
		plugin.grid.setFilter = dojo.hitch(this, "setFilter");
		plugin.grid.getFilter = dojo.hitch(this, "getFilter");
		plugin.grid.getFilterRelation = dojo.hitch(this, function(){
			return this._relOpCls;
		});
		
		plugin.connect(plugin.grid.layout, "moveColumn", dojo.hitch(this, "onMoveColumn"));
	},
	onMoveColumn: function(sourceViewIndex, destViewIndex, cellIndex, targetIndex, before){
		if(this._savedCriterias && cellIndex != targetIndex){
			if(before){ --targetIndex; }
			var min = cellIndex < targetIndex ? cellIndex : targetIndex;
			var max = cellIndex < targetIndex ? targetIndex : cellIndex;
			var dir = targetIndex > min ? 1 : -1;
			dojo.forEach(this._savedCriterias, function(sc){
				var idx = parseInt(sc.column, 10);
				if(!isNaN(idx) && idx >= min && idx <= max){
					sc.column = String(idx == cellIndex ? idx + (max - min) * dir : idx - dir);
				}
			});
		}
	},
	destroy: function(){
		this._defPane.destroyRecursive();
		this._defPane = null;
		this.filterDefPane = null;
		this.builder = null;
		this._dataTypeMap = null;
		this._cboxes = null;
		var g = this.plugin.grid;
		g.setFilter = null;
		g.getFilter = null;
		g.getFilterRelation = null;
		this.plugin = null;
	},
	_setupData: function(){
		var nls = this.plugin.nls;
		this._dataTypeMap = {
		// summary:
		//		All supported data types
			"number":{
				valueBoxCls: {
					dft: dijit.form.NumberTextBox
				},
				conditions:[
					{label: nls.conditionEqual, value: "equalto", selected: true},
					{label: nls.conditionNotEqual, value: "notequalto"},
					{label: nls.conditionLess, value: "lessthan"},
					{label: nls.conditionLessEqual, value: "lessthanorequalto"},
					{label: nls.conditionLarger, value: "largerthan"},
					{label: nls.conditionLargerEqual, value: "largerthanorequalto"},
					{label: nls.conditionIsEmpty, value: "isempty"}
				]
			},
			"string":{
				valueBoxCls: {
					dft: dijit.form.TextBox,
					ac: fns.UniqueComboBox		//For autoComplete
				},
				conditions:[
					{label: nls.conditionContains, value: "contains", selected: true},
					{label: nls.conditionIs, value: "equalto"},
					{label: nls.conditionStartsWith, value: "startswith"},
					{label: nls.conditionEndWith, value: "endswith"},
					{label: nls.conditionNotContain, value: "notcontains"},
					{label: nls.conditionIsNot, value: "notequalto"},
					{label: nls.conditionNotStartWith, value: "notstartswith"},
					{label: nls.conditionNotEndWith, value: "notendswith"},
					{label: nls.conditionIsEmpty, value: "isempty"}
				]
			},
			"date":{
				valueBoxCls: {
					dft: dijit.form.DateTextBox
				},
				conditions:[
					{label: nls.conditionIs, value: "equalto", selected: true},
					{label: nls.conditionBefore, value: "lessthan"},
					{label: nls.conditionAfter, value: "largerthan"},
					{label: nls.conditionRange, value: "range"},
					{label: nls.conditionIsEmpty, value: "isempty"}
				]
			},
			"time":{
				valueBoxCls: {
					dft: dijit.form.TimeTextBox
				},
				conditions:[
					{label: nls.conditionIs, value: "equalto", selected: true},
					{label: nls.conditionBefore, value: "lessthan"},
					{label: nls.conditionAfter, value: "largerthan"},
					{label: nls.conditionRange, value: "range"},
					{label: nls.conditionIsEmpty, value: "isempty"}
				]
			},
			"boolean": {
				valueBoxCls: {
					dft: fns.BooleanValueBox
				},
				conditions: [
					{label: nls.conditionIs, value: "equalto", selected: true},
					{label: nls.conditionIsEmpty, value: "isempty"}
				]
			}
		};
	},
	setFilter: function(rules, ruleRelation){
		rules = rules || [];
		if(!dojo.isArray(rules)){
			rules = [rules];
		}
		var func = function(){
			if(rules.length){
				this._savedCriterias = dojo.map(rules, function(rule){
					var type = rule.type || this.defaultType;
					return {
						"type": type,
						"column": String(rule.column),
						"condition": rule.condition,
						"value": rule.value,
						"colTxt": this.getColumnLabelByValue(String(rule.column)),
						"condTxt": this.getConditionLabelByValue(type, rule.condition),
						"formattedVal": rule.formattedVal || rule.value
					};
				}, this);
				this._criteriasChanged = true;
				if(ruleRelation === "logicall" || ruleRelation === "logicany"){
					this._relOpCls = ruleRelation;
				}
				var exprs = dojo.map(rules, this.getExprForCriteria, this);
				exprs = this.builder.buildExpression(exprs.length == 1 ? exprs[0] : {
					"op": this._relOpCls,
					"data": exprs
				});
				this.plugin.grid.layer("filter").filterDef(exprs);
				this.plugin.filterBar.toggleClearFilterBtn(false);
			}
			this._closeDlgAndUpdateGrid();
		};
		if(this._savedCriterias){
			this._clearWithoutRefresh = true;
			var handle = dojo.connect(this, "clearFilter", this, function(){
				dojo.disconnect(handle);
				this._clearWithoutRefresh = false;
				func.apply(this);
			});
			this.onClearFilter();
		}else{
			func.apply(this);
		}
	},
	getFilter: function(){
		return dojo.clone(this._savedCriterias) || [];
	},
	getColumnLabelByValue: function(v){
		var nls = this.plugin.nls;
		if(v.toLowerCase() == "anycolumn"){
			return nls["anyColumnOption"];
		}else{
			var cell = this.plugin.grid.layout.cells[parseInt(v, 10)];
			return cell ? (cell.name || cell.field) : "";
		}
	},
	getConditionLabelByValue: function(type, c){
		var conditions = this._dataTypeMap[type].conditions;
		for(var i = conditions.length - 1; i >= 0; --i){
			var cond = conditions[i];
			if(cond.value == c.toLowerCase()){
				return cond.label;
			}
		}
		return "";
	},
	addCriteriaBoxes: function(/* int */cnt){
		// summary:
		//		Add *cnt* criteria boxes to the filter definition pane.
		//		Check overflow if necessary.
		if(typeof cnt != "number" || cnt <= 0){
			return;
		}
		var cbs = this._cboxes,
			cc = this.filterDefPane.cboxContainer,
			total = this.plugin.args.ruleCount,
			len = cbs.length, cbox;
		//If overflow, add to max rule count.
		if(total > 0 && len + cnt > total){
			cnt = total - len;
		}
		for(; cnt > 0; --cnt){
			cbox = new fns.CriteriaBox({
				dlg: this
			});
			cbs.push(cbox);
			cc.addChild(cbox);
		}
		//If there's no content box in it , AccordionContainer can not startup
		cc.startup();
		this._updatePane();
		this._updateCBoxTitles();
		cc.selectChild(cbs[cbs.length-1]);
		//Asign an impossibly large scrollTop to scroll the criteria pane to the bottom.
		this.filterDefPane.criteriaPane.scrollTop = 1000000;
		if(cbs.length === 4){
			if(dojo.isIE <= 6 && !this.__alreadyResizedForIE6){
				var size = dojo.position(cc.domNode);
				size.w -= dojox.html.metrics.getScrollbar().w;
				cc.resize(size);
				this.__alreadyResizedForIE6 = true;
			}else{
				cc.resize();
			}
		}
	},
	removeCriteriaBoxes: function(/* int|CriteriaBox|int[] */cnt,/* bool? */isIdx){
		// summary:
		//		Remove criteria boxes from the filter definition pane.
		var cbs = this._cboxes, cc = this.filterDefPane.cboxContainer,
			len = cbs.length, start = len - cnt,
			end = len - 1, cbox,
			curIdx = dojo.indexOf(cbs, cc.selectedChildWidget.content);
		if(dojo.isArray(cnt)){
			var i, idxes = cnt;
			idxes.sort();
			cnt = idxes.length;
			//find a rule that's not deleted.
			//must find and focus the last one, or the hack will not work.
			for(i = len - 1; i >= 0 && dojo.indexOf(idxes, i) >= 0; --i){}
			if(i >= 0){
				//must select before remove
				if(i != curIdx){
					cc.selectChild(cbs[i]);
				}
				//idxes is sorted from small to large,
				//so travel reversely won't need change index after delete from array.
				for(i = cnt-1; i >= 0; --i){
					if(idxes[i] >= 0 && idxes[i] < len){
						cc.removeChild(cbs[idxes[i]]);
						cbs.splice(idxes[i],1);
					}
				}
			}
			start = cbs.length;
		}else{
			if(isIdx === true){
				if(cnt >= 0 && cnt < len){
					start = end = cnt;
					cnt = 1;
				}else{
					return;
				}
			}else{
				if(cnt instanceof fns.CriteriaBox){
					cbox = cnt;
					cnt = 1;
					start = end = dojo.indexOf(cbs, cbox);
				}else if(typeof cnt != "number" || cnt <= 0){
					return;
				}else if(cnt >= len){
					cnt = end;
					start = 1;
				}
			}
			if(end < start){
				return;
			}
			//must select before remove
			if(curIdx >= start && curIdx <= end){
				cc.selectChild(cbs[start ? start-1 : end+1]);
			}
			for(; end >= start; --end){
				cc.removeChild(cbs[end]);
			}
			cbs.splice(start, cnt);
		}
		this._updatePane();
		this._updateCBoxTitles();
		if(cbs.length === 3){
			//In ie6, resize back to the normal width will cause the title button look strange.
			cc.resize();
		}
	},
	getCriteria: function(/* int */idx){
		// summary:
		//		Get the *idx*-th criteria.
		if(typeof idx != "number"){
			return this._savedCriterias ? this._savedCriterias.length : 0;
		}
		if(this._savedCriterias && this._savedCriterias[idx]){
			return dojo.mixin({
				relation: this._relOpCls == "logicall" ? this.plugin.nls.and : this.plugin.nls.or
			},this._savedCriterias[idx]);
		}
		return null;
	},
	getExprForCriteria: function(rule){
		if(rule.column == "anycolumn"){
			var cells = dojo.filter(this.plugin.grid.layout.cells, function(cell){
				return !(cell.filterable === false || cell.hidden);
			});
			return {
				"op": "logicany",
				"data": dojo.map(cells, function(cell){
					return this.getExprForColumn(rule.value, cell.index, rule.type, rule.condition);
				}, this)
			};
		}else{
			return this.getExprForColumn(rule.value, rule.column, rule.type, rule.condition);
		}
	},
	getExprForColumn: function(value, colIdx, type, condition){
		colIdx = parseInt(colIdx, 10);
		var cell = this.plugin.grid.layout.cells[colIdx],
			colName = cell.field || cell.name,
			obj = {
				"datatype": type || this.getColumnType(colIdx),
				"args": cell.dataTypeArgs,
				"isColumn": true
			},
			operands = [dojo.mixin({"data": this.plugin.args.isServerSide ? colName : cell}, obj)];
		obj.isColumn = false;
		if(condition == "range"){
			operands.push(dojo.mixin({"data": value.start}, obj),
				dojo.mixin({"data": value.end}, obj));
		}else if(condition != "isempty"){
			operands.push(dojo.mixin({"data": value}, obj));
		}
		return {
			"op": condition,
			"data": operands
		};
	},
	getColumnType: function(/* int */colIndex){
		var cell = this.plugin.grid.layout.cells[parseInt(colIndex, 10)];
		if(!cell || !cell.datatype){
			return this.defaultType;
		}
		var type = String(cell.datatype).toLowerCase();
		return this._dataTypeMap[type] ? type : this.defaultType;
	},
	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	clearFilter: function(noRefresh){
		// summary:
		//		Clear filter definition.
		if(!this._savedCriterias){
			return;
		}
		this._savedCriterias = null;
		this.plugin.grid.layer("filter").filterDef(null);
		try{
			this.plugin.filterBar.toggleClearFilterBtn(true);
			this.filterDefPane._clearFilterBtn.set("disabled", true);
			this.removeCriteriaBoxes(this._cboxes.length-1);
			this._cboxes[0].load({});
		}catch(e){
			//Any error means the filter is defined outside this plugin.
		}
		if(noRefresh){
			this.closeDialog();
		}else{
			this._closeDlgAndUpdateGrid();
		}
	},
	showDialog: function(/* int */colIndex){
		// summary:
		//		Show the filter defintion dialog.
		this._defPane.show();
		this.plugin.filterStatusTip.closeDialog();
		this._prepareDialog(colIndex);
	},
	closeDialog: function(){
		// summary:
		//		Close the filter definition dialog.
		this._defPane.hide();
	},
	onFilter: function(e){
		// summary:
		//		Triggered when the "Filter" button is clicked.
		if(this.canFilter()){
			this._defineFilter();
			this._closeDlgAndUpdateGrid();
			this.plugin.filterBar.toggleClearFilterBtn(false);
		}
	},
	onClearFilter: function(e){
		// summary:
		//		Triggered when the "Clear" button is clicked.
		if(this._savedCriterias){
			if(this._savedCriterias.length > 1){
				this.plugin.clearFilterDialog.show();
			}else{
				this.clearFilter(this._clearWithoutRefresh);
			}
		}
	},
	onCancel: function(e){
		// summary:
		//		Triggered when the "Cancel" buttton is clicked.
		var sc = this._savedCriterias;
		var cbs = this._cboxes;
		if(sc){
			this.addCriteriaBoxes(sc.length - cbs.length);
			this.removeCriteriaBoxes(cbs.length - sc.length);
			dojo.forEach(sc, function(c, i){
				cbs[i].load(c);
			});
		}else{
			this.removeCriteriaBoxes(cbs.length - 1);
			cbs[0].load({});
		}
		this.closeDialog();
	},
	onRendered: function(cbox){
		// summary:
		//		Triggered when the rendering of the filter definition dialog is completely finished.
		// cbox:
		//		Current visible criteria box
		if(!dojo.isFF){
			var elems = dijit._getTabNavigable(dojo.byId(cbox.domNode));
			dijit.focus(elems.lowest || elems.first);
		}else{
			var dp = this._defPane;
			dp._getFocusItems(dp.domNode);
			dijit.focus(dp._firstFocusItem);
		}
	},
	_onSetFilter: function(filterDef){
		// summary:
		//		If someone clear the filter def in the store directly, we must clear it in the UI.
		//		If someone defines a filter, don't know how to handle it!
		if(filterDef === null && this._savedCriterias){
			this.clearFilter();
		}
	},
	_prepareDialog: function(/* int */colIndex){
		var sc = this._savedCriterias,
			cbs = this._cboxes, i, cbox;
		this.curColIdx = colIndex;
		if(!sc){
			if(cbs.length === 0){
				this.addCriteriaBoxes(1);
			}else{
				//Re-populate columns anyway, because we don't know when the column is set to hidden.
				for(i = 0; (cbox = cbs[i]); ++i){
					cbox.changeCurrentColumn();
				}
			}
		}else if(this._criteriasChanged){
			this.filterDefPane._relSelect.set("value", this._relOpCls === "logicall" ? "0" : "1");
			this._criteriasChanged = false;
			var needNewCBox = sc.length > cbs.length;
			this.addCriteriaBoxes(sc.length - cbs.length);
			this.removeCriteriaBoxes(cbs.length - sc.length);
			this.filterDefPane._clearFilterBtn.set("disabled", false);
			if(needNewCBox){
				dojo.forEach(sc, function(c, i){
					var handle = dojo.connect(this, "onRendered", function(cbox){
						if(cbox == cbs[i]){
							dojo.disconnect(handle);
							cbox.load(c);
						}
					});
				}, this);
			}else{
				for(i = 0; i < sc.length; ++i){
					cbs[i].load(sc[i]);
				}
			}
		}
		//Since we're allowed to remove cboxes when the definition pane is not shown,
		//we have to resize the container to have a correct _verticalSpace.
		this.filterDefPane.cboxContainer.resize();
	},
	_defineFilter: function(){
		var cbs = this._cboxes,
			filterCboxes = function(method){
				return dojo.filter(dojo.map(cbs, function(cbox){
					return cbox[method]();
				}), function(result){
					return !!result;
				});
			},
			exprs = filterCboxes("getExpr");
		this._savedCriterias = filterCboxes("save");
		exprs = exprs.length == 1 ? exprs[0] : {
			"op": this._relOpCls,
			"data": exprs
		};
		exprs = this.builder.buildExpression(exprs);
		
		this.plugin.grid.layer("filter").filterDef(exprs);
		this.filterDefPane._clearFilterBtn.set("disabled", false);
	},
	_updateCBoxTitles: function(){
		for(var cbs = this._cboxes, i = cbs.length; i > 0; --i){
			cbs[i - 1].updateRuleIndex(i);
			cbs[i - 1].setAriaInfo(i);
		}
	},
	_updatePane: function(){
		var cbs = this._cboxes,
			defPane = this.filterDefPane;
		defPane._addCBoxBtn.set("disabled", cbs.length == this.plugin.args.ruleCount);
		defPane._filterBtn.set("disabled", !this.canFilter());
	},
	canFilter: function(){
		return dojo.filter(this._cboxes, function(cbox){
			return !cbox.isEmpty();
		}).length > 0;
	},
	_closeDlgAndUpdateGrid: function(){
		this.closeDialog();
		var g = this.plugin.grid;
		g.showMessage(g.loadingMessage);
		setTimeout(dojo.hitch(g, g._refresh), this._defPane.duration + 10);
	}
});
dojo.declare("dojox.grid.enhanced.plugins.filter.FilterDefPane",[dijit._Widget,dijit._Templated],{
	templateString: dojo.cache("dojox.grid","enhanced/templates/FilterDefPane.html"),
	widgetsInTemplate: true,
	dlg: null,
	postMixInProperties: function(){
		this.plugin = this.dlg.plugin;
		var nls = this.plugin.nls;
		this._addRuleBtnLabel = nls.addRuleButton;
		this._cancelBtnLabel = nls.cancelButton;
		this._clearBtnLabel = nls.clearButton;
		this._filterBtnLabel = nls.filterButton;
		this._relAll = nls.relationAll;
		this._relAny = nls.relationAny;
		this._relMsgFront = nls.relationMsgFront;
		this._relMsgTail = nls.relationMsgTail;
	},
	postCreate: function(){
		this.inherited(arguments);
		this.connect(this.domNode, "onkeypress", "_onKey");
		(this.cboxContainer = new fns.AccordionContainer({
			nls: this.plugin.nls
		})).placeAt(this.criteriaPane);
		
		this._relSelect.set("tabIndex", _tabIdxes.relSelect);
		this._addCBoxBtn.set("tabIndex", _tabIdxes.addCBoxBtn);
		this._cancelBtn.set("tabIndex", _tabIdxes.cancelBtn);
		this._clearFilterBtn.set("tabIndex", _tabIdxes.clearBtn);
		this._filterBtn.set("tabIndex", _tabIdxes.filterBtn);
		
		var nls = this.plugin.nls;
		dijit.setWaiState(this._relSelect.domNode, "label", nls.waiRelAll);
		dijit.setWaiState(this._addCBoxBtn.domNode, "label", nls.waiAddRuleButton);
		dijit.setWaiState(this._cancelBtn.domNode, "label", nls.waiCancelButton);
		dijit.setWaiState(this._clearFilterBtn.domNode, "label", nls.waiClearButton);
		dijit.setWaiState(this._filterBtn.domNode, "label", nls.waiFilterButton);
		
		this._relSelect.set("value", this.dlg._relOpCls === "logicall" ? "0" : "1");
	},
	uninitialize: function(){
		this.cboxContainer.destroyRecursive();
		this.plugin = null;
		this.dlg = null;
	},
	_onRelSelectChange: function(val){
		this.dlg._relOpCls = val == "0" ? "logicall" : "logicany";
		dijit.setWaiState(this._relSelect.domNode,"label", this.plugin.nls[val == "0" ? "waiRelAll" : "waiRelAny"]);
	},
	_onAddCBox: function(){
		this.dlg.addCriteriaBoxes(1);
	},
	_onCancel: function(){
		this.dlg.onCancel();
	},
	_onClearFilter: function(){
		this.dlg.onClearFilter();
	},
	_onFilter: function(){
		this.dlg.onFilter();
	},
	_onKey: function(e){
		if(e.keyCode == dojo.keys.ENTER){
			this.dlg.onFilter();
		}
	}
});
dojo.declare("dojox.grid.enhanced.plugins.filter.CriteriaBox",[dijit._Widget,dijit._Templated],{
	templateString: dojo.cache("dojox.grid","enhanced/templates/CriteriaBox.html"),
	widgetsInTemplate: true,
	dlg: null,
	postMixInProperties: function(){
		this.plugin = this.dlg.plugin;
		this._curValueBox = null;
		
		var nls = this.plugin.nls;
		this._colSelectLabel = nls.columnSelectLabel;
		this._condSelectLabel = nls.conditionSelectLabel;
		this._valueBoxLabel = nls.valueBoxLabel;
		this._anyColumnOption = nls.anyColumnOption;
	},
	postCreate: function(){
		var dlg = this.dlg, g = this.plugin.grid;
		//Select Column
		this._colSelect.set("tabIndex", _tabIdxes.colSelect);
		this._colOptions = this._getColumnOptions();
		this._colSelect.addOption([
			{label: this.plugin.nls.anyColumnOption, value: "anycolumn", selected: dlg.curColIdx < 0},
			{value: ""}
		].concat(this._colOptions));
		//Select Condition
		this._condSelect.set("tabIndex", _tabIdxes.condSelect);
		this._condSelect.addOption(this._getUsableConditions(dlg.getColumnType(dlg.curColIdx)));
		this._showSelectOrLabel(this._condSelect, this._condSelectAlt);
		
		this.connect(g.layout, "moveColumn", "onMoveColumn");
	},
	_getColumnOptions: function(){
		var colIdx = this.dlg.curColIdx >= 0 ? String(this.dlg.curColIdx) : "anycolumn";
		return dojo.map(dojo.filter(this.plugin.grid.layout.cells, function(cell){
			return !(cell.filterable === false || cell.hidden);
		}), function(cell){
			return {
				label: cell.name || cell.field,
				value: String(cell.index),
				selected: colIdx == String(cell.index)
			};
		});
	},
	onMoveColumn: function(){
		var tmp = this._onChangeColumn;
		this._onChangeColumn = function(){};
		var option = this._colSelect.get("selectedOptions");
		this._colSelect.removeOption(this._colOptions);
		this._colOptions = this._getColumnOptions();
		this._colSelect.addOption(this._colOptions);
		var i = 0;
		for(; i < this._colOptions.length; ++i){
			if(this._colOptions[i].label == option.label){
				break;
			}
		}
		if(i < this._colOptions.length){
			this._colSelect.set("value", this._colOptions[i].value);
		}
		var _this = this;
		setTimeout(function(){
			_this._onChangeColumn = tmp;
		}, 0);
	},
	onRemove: function(){
		this.dlg.removeCriteriaBoxes(this);
	},
	uninitialize: function(){
		if(this._curValueBox){
			this._curValueBox.destroyRecursive();
			this._curValueBox = null;
		}
		this.plugin = null;
		this.dlg = null;
	},
	_showSelectOrLabel: function(sel, alt){
		var options = sel.getOptions();
		if(options.length == 1){
			alt.innerHTML = options[0].label;
			dojo.style(sel.domNode, "display", "none");
			dojo.style(alt, "display", "");
		}else{
			dojo.style(sel.domNode, "display", "");
			dojo.style(alt, "display", "none");
		}
	},
	_onChangeColumn: function(val){
		this._checkValidCriteria();
		var type = this.dlg.getColumnType(val);
		this._setConditionsByType(type);
		this._setValueBoxByType(type);
		this._updateValueBox();
	},
	_onChangeCondition: function(val){
		this._checkValidCriteria();
		var f = (val == "range");
		if(f ^ this._isRange){
			this._isRange = f;
			this._setValueBoxByType(this.dlg.getColumnType(this._colSelect.get("value")));
		}
		this._updateValueBox();
	},
	_updateValueBox: function(cond){
		this._curValueBox.set("disabled", this._condSelect.get("value") == "isempty");
	},
	_checkValidCriteria: function(){
		// summary:
		//		Check whether the given criteria box is completed. If it is, mark it.
		setTimeout(dojo.hitch(this, function(){
			this.updateRuleTitle();
			this.dlg._updatePane();
		}),0);
	},
	_createValueBox: function(/* widget constructor */cls,/* object */arg){
		// summary:
		//		Create a value input box with given class and arguments
		var func = dojo.hitch(arg.cbox, "_checkValidCriteria");
		return new cls(dojo.mixin(arg,{
			tabIndex: _tabIdxes.valueBox,
			onKeyPress: func,
			onChange: func,
			"class": "dojoxGridFCBoxValueBox"
		}));
	},
	_createRangeBox: function(/* widget constructor */cls,/* object */arg){
		// summary:
		//		Create a DIV containing 2 input widgets, which represents a range, with the given class and arguments
		var func = dojo.hitch(arg.cbox, "_checkValidCriteria");
		dojo.mixin(arg,{
			tabIndex: _tabIdxes.valueBox,
			onKeyPress: func,
			onChange: func
		});
		var div = dojo.create("div", {"class": "dojoxGridFCBoxValueBox"}),
			start = new cls(arg),
			txt = dojo.create("span", {"class": "dojoxGridFCBoxRangeValueTxt", "innerHTML": this.plugin.nls.rangeTo}),
			end = new cls(arg);
		dojo.addClass(start.domNode, "dojoxGridFCBoxStartValue");
		dojo.addClass(end.domNode, "dojoxGridFCBoxEndValue");
		div.appendChild(start.domNode);
		div.appendChild(txt);
		div.appendChild(end.domNode);
		div.domNode = div;
		//Mock functions for set and get (in place of the old attr function)
		div.set = function(dummy, args){
			if(dojo.isObject(args)){
				start.set("value", args.start);
				end.set("value", args.end);
			}
		};
		div.get = function(){
			var s = start.get("value"),
				e = end.get("value");
			return s && e ? {start: s, end: e} : "";
		};
		return div;
	},
	changeCurrentColumn: function(/* bool */selectCurCol){
		var colIdx = this.dlg.curColIdx;
		//Re-populate the columns in case some of them are set to hidden.
		this._colSelect.removeOption(this._colOptions);
		this._colOptions = this._getColumnOptions();
		this._colSelect.addOption(this._colOptions);
		this._colSelect.set('value', colIdx >= 0 ? String(colIdx) : "anycolumn");
		this.updateRuleTitle(true);
	},
	curColumn: function(){
		return this._colSelect.getOptions(this._colSelect.get("value")).label;
	},
	curCondition: function(){
		return this._condSelect.getOptions(this._condSelect.get("value")).label;
	},
	curValue: function(){
		var cond = this._condSelect.get("value");
		if(cond == "isempty"){return "";}
		return this._curValueBox ? this._curValueBox.get("value") : "";
	},
	save: function(){
		if(this.isEmpty()){
			return null;
		}
		var colIdx = this._colSelect.get("value"),
			type = this.dlg.getColumnType(colIdx),
			value = this.curValue(),
			cond = this._condSelect.get("value");
		return {
			"column": colIdx,
			"condition": cond,
			"value": value,
			"formattedVal": this.formatValue(type, cond, value),
			"type": type,
			"colTxt": this.curColumn(),
			"condTxt": this.curCondition()
		};
	},
	load: function(obj){
		var tmp = [
			this._onChangeColumn,
			this._onChangeCondition
		];
		this._onChangeColumn = this._onChangeCondition = function(){};
		if(obj.column){
			this._colSelect.set("value", obj.column);
		}
		if(obj.condition){
			this._condSelect.set("value", obj.condition);
		}
		if(obj.type){
			this._setValueBoxByType(obj.type);
		}else{
			obj.type = this.dlg.getColumnType(this._colSelect.get("value"));
		}
		var value = obj.value || "";
		if(value || (obj.type != "date" && obj.type != "time")){
			this._curValueBox.set("value", value);
		}
		this._updateValueBox();
		setTimeout(dojo.hitch(this, function(){
			this._onChangeColumn = tmp[0];
			this._onChangeCondition = tmp[1];
		}), 0);
	},
	getExpr: function(){
		if(this.isEmpty()){
			return null;
		}
		var colval = this._colSelect.get("value");
		return this.dlg.getExprForCriteria({
			"type": this.dlg.getColumnType(colval),
			"column": colval,
			"condition": this._condSelect.get("value"),
			"value": this.curValue()
		});
	},
	isEmpty: function(){
		var cond = this._condSelect.get("value");
		if(cond == "isempty"){return false;}
		var v = this.curValue();
		return v === "" || v === null || typeof v == "undefined" || (typeof v == "number" && isNaN(v));
	},
	updateRuleTitle: function(isEmpty){
		var node = this._pane._buttonWidget.titleTextNode;
		var title = [
			"<div class='dojoxEllipsis'>"
		];
		if(isEmpty || this.isEmpty()){
			node.title = dojo.string.substitute(this.plugin.nls.ruleTitleTemplate, [this._ruleIndex || 1]);
			title.push(node.title);
		}else{
			var type = this.dlg.getColumnType(this._colSelect.get("value"));
			var column = this.curColumn();
			var condition = this.curCondition();
			var value = this.formatValue(type, this._condSelect.get("value"), this.curValue());
			title.push(
				column,
				"&nbsp;<span class='dojoxGridRuleTitleCondition'>",
				condition,
				"</span>&nbsp;",
				value
			);
			node.title = [column, " ", condition, " ", value].join('');
		}
		node.innerHTML = title.join('');
		if(dojo.isMoz){
			var tt = dojo.create("div", {
				"style": "width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 9999;"
			}, node);
			tt.title = node.title;
		}
	},
	updateRuleIndex: function(index){
		if(this._ruleIndex != index){
			this._ruleIndex = index;
			if(this.isEmpty()){
				this.updateRuleTitle();
			}
		}
	},
	setAriaInfo: function(idx){
		var dss = dojo.string.substitute, nls = this.plugin.nls;
		dijit.setWaiState(this._colSelect.domNode,"label", dss(nls.waiColumnSelectTemplate, [idx]));
		dijit.setWaiState(this._condSelect.domNode,"label", dss(nls.waiConditionSelectTemplate, [idx]));
		dijit.setWaiState(this._pane._removeCBoxBtn.domNode,"label", dss(nls.waiRemoveRuleButtonTemplate, [idx]));
		this._index = idx;
	},
	_getUsableConditions: function(type){
		var conditions = this.dlg._dataTypeMap[type].conditions;
		var typeDisabledConds = (this.plugin.args.disabledConditions || {})[type];
		var colIdx = parseInt(this._colSelect.get("value"), 10);
		var colDisabledConds = isNaN(colIdx) ?
			(this.plugin.args.disabledConditions || {})["anycolumn"] :
			this.plugin.grid.layout.cells[colIdx].disabledConditions;
		if(!dojo.isArray(typeDisabledConds)){
			typeDisabledConds = [];
		}
		if(!dojo.isArray(colDisabledConds)){
			colDisabledConds = [];
		}
		var arr = typeDisabledConds.concat(colDisabledConds);
		if(arr.length){
			var disabledConds = {};
			dojo.forEach(arr, function(c){
				if(dojo.isString(c)){
					disabledConds[c.toLowerCase()] = true;
				}
			});
			return dojo.filter(conditions, function(condOption){
				return !(condOption.value in disabledConds);
			});
		}
		return conditions;
	},
	_setConditionsByType: function(/* string */type){
		var condSelect = this._condSelect;
		condSelect.removeOption(condSelect.options);
		condSelect.addOption(this._getUsableConditions(type));
		this._showSelectOrLabel(this._condSelect, this._condSelectAlt);
	},
	_setValueBoxByType: function(/* string */type){
		if(this._curValueBox){
			this.valueNode.removeChild(this._curValueBox.domNode);
			try{
				this._curValueBox.destroyRecursive();
			}catch(e){}
			delete this._curValueBox;
		}
		//value box class
		var vbcls = this.dlg._dataTypeMap[type].valueBoxCls[this._getValueBoxClsInfo(this._colSelect.get("value"), type)],
			vboxArg = this._getValueBoxArgByType(type);
		this._curValueBox = this[this._isRange ? "_createRangeBox" : "_createValueBox"](vbcls, vboxArg);
		this.valueNode.appendChild(this._curValueBox.domNode);
		
		//Can not move to setAriaInfo, 'cause the value box is created after the defpane is loaded.
		dijit.setWaiState(this._curValueBox.domNode, "label", dojo.string.substitute(this.plugin.nls.waiValueBoxTemplate,[this._index]));
		//Now our cbox is completely ready
		this.dlg.onRendered(this);
	},
	//--------------------------UI Configuration--------------------------------------
	_getValueBoxArgByType: function(/* string */type){
		// summary:
		//		Get the arguments for the value box construction.
		var g = this.plugin.grid,
			cell = g.layout.cells[parseInt(this._colSelect.get("value"), 10)],
			res = {
				cbox: this
			};
		if(type == "string"){
			if(cell && (cell.suggestion || cell.autoComplete)){
				dojo.mixin(res, {
					store: g.store,
					searchAttr: cell.field || cell.name,
					fetchProperties: {
						sort: [{"attribute": cell.field || cell.name}]
					}
				});
			}
		}else if(type == "boolean"){
			dojo.mixin(res, this.dlg.builder.defaultArgs["boolean"]);
		}
		if(cell && cell.dataTypeArgs){
			dojo.mixin(res, cell.dataTypeArgs);
		}
		return res;
	},
	formatValue: function(type, cond, v){
		// summary:
		//		Format the value to be shown in tooltip.
		if(cond == "isempty"){return "";}
		if(type == "date" || type == "time"){
			var opt = {selector: type},
				fmt = dojo.date.locale.format;
			if(cond == "range"){
				return dojo.string.substitute(this.plugin.nls.rangeTemplate, [fmt(v.start, opt), fmt(v.end, opt)]);
			}
			return fmt(v, opt);
		}else if(type == "boolean"){
			return v ? this._curValueBox._lblTrue : this._curValueBox._lblFalse;
		}
		return v;
	},
	_getValueBoxClsInfo: function(/* int|string */colIndex, /* string */type){
		// summary:
		//		Decide which value box to use given data type and column index.
		var cell = this.plugin.grid.layout.cells[parseInt(colIndex, 10)];
		//Now we only need to handle string. But maybe we need to handle more types here in the future.
		if(type == "string"){
			return (cell && (cell.suggestion || cell.autoComplete)) ? "ac" : "dft";
		}
		return "dft";
	}
});
dojo.declare("dojox.grid.enhanced.plugins.filter.AccordionContainer", dijit.layout.AccordionContainer, {
	nls: null,
	addChild: function(/*dijit._Widget*/ child, /*Integer?*/ insertIndex){
		var pane = arguments[0] = child._pane = new dijit.layout.ContentPane({
			content: child
		});
		this.inherited(arguments);
		this._modifyChild(pane);
	},
	removeChild: function(child){
		var pane = child, isRemoveByUser = false;
		if(child._pane){
			isRemoveByUser = true;
			pane = arguments[0] = child._pane;
		}
		this.inherited(arguments);
		if(isRemoveByUser){
			this._hackHeight(false, this._titleHeight);
			var children = this.getChildren();
			if(children.length === 1){
				dojo.style(children[0]._removeCBoxBtn.domNode, "display", "none");
			}
		}
		pane.destroyRecursive();
	},
	selectChild: function(child){
		if(child._pane){
			arguments[0] = child._pane;
		}
		this.inherited(arguments);
	},
	resize: function(){
		this.inherited(arguments);
		dojo.forEach(this.getChildren(), this._setupTitleDom);
	},
	startup: function(){
		if(this._started){
			return;
		}
		this.inherited(arguments);
		if(parseInt(dojo.isIE, 10) == 7){
			//IE7 will fire a lot of "onresize" event during initialization.
			dojo.some(this._connects, function(cnnt){
				if(cnnt[0][1] == "onresize"){
					this.disconnect(cnnt);
					return true;
				}
			}, this);
		}
		dojo.forEach(this.getChildren(), function(child){
			this._modifyChild(child, true);
		}, this);
	},
	_onKeyPress: function(/*Event*/ e, /*dijit._Widget*/ fromTitle){
		// summary:
		//		Overrides base class method, make left/right button do other things.
		if(this.disabled || e.altKey || !(fromTitle || e.ctrlKey)){
			return;
		}
		var k = dojo.keys, c = e.charOrCode, ltr = dojo._isBodyLtr(), toNext = null;
		if((fromTitle && c == k.UP_ARROW) || (e.ctrlKey && c == k.PAGE_UP)){
			toNext = false;
		}else if((fromTitle && c == k.DOWN_ARROW) || (e.ctrlKey && (c == k.PAGE_DOWN || c == k.TAB))){
			toNext = true;
		}else if(c == (ltr ? k.LEFT_ARROW : k.RIGHT_ARROW)){
			toNext = this._focusOnRemoveBtn ? null : false;
			this._focusOnRemoveBtn = !this._focusOnRemoveBtn;
		}else if(c == (ltr ? k.RIGHT_ARROW : k.LEFT_ARROW)){
			toNext = this._focusOnRemoveBtn ? true : null;
			this._focusOnRemoveBtn = !this._focusOnRemoveBtn;
		}else{
			return;
		}
		if(toNext !== null){
			this._adjacent(toNext)._buttonWidget._onTitleClick();
		}
		dojo.stopEvent(e);
		dojo.window.scrollIntoView(this.selectedChildWidget._buttonWidget.domNode.parentNode);
		if(dojo.isIE){
			//IE will not show focus indicator if tabIndex is -1
			this.selectedChildWidget._removeCBoxBtn.focusNode.setAttribute("tabIndex", this._focusOnRemoveBtn ? _tabIdxes.accordionTitle : -1);
		}
		dijit.focus(this.selectedChildWidget[this._focusOnRemoveBtn ? "_removeCBoxBtn" : "_buttonWidget"].focusNode);
	},
	_modifyChild: function(child, isFirst){
		if(!child || !this._started){
			return;
		}
		dojo.style(child.domNode, "overflow", "hidden");
		child._buttonWidget.connect(child._buttonWidget, "_setSelectedAttr", function(){
			this.focusNode.setAttribute("tabIndex", this.selected ? _tabIdxes.accordionTitle : "-1");
		});
		var _this = this;
		child._buttonWidget.connect(child._buttonWidget.domNode, "onclick", function(){
			_this._focusOnRemoveBtn = false;
		});
		(child._removeCBoxBtn = new dijit.form.Button({
			label: this.nls.removeRuleButton,
			showLabel: false,
			iconClass: "dojoxGridFCBoxRemoveCBoxBtnIcon",
			tabIndex: _tabIdxes.removeCBoxBtn,
			onClick: dojo.hitch(child.content, "onRemove"),
			onKeyPress: function(e){
				_this._onKeyPress(e, child._buttonWidget.contentWidget);
			}
		})).placeAt(child._buttonWidget.domNode);
		var i, children = this.getChildren();
		if(children.length === 1){
			child._buttonWidget.set("selected", true);
			dojo.style(child._removeCBoxBtn.domNode, "display", "none");
		}else{
			for(i = 0; i < children.length; ++i){
				if(children[i]._removeCBoxBtn){
					dojo.style(children[i]._removeCBoxBtn.domNode, "display", "");
				}
			}
		}
		this._setupTitleDom(child);
		if(!this._titleHeight){
			for(i = 0; i < children.length; ++i){
				if(children[i] != this.selectedChildWidget){
					this._titleHeight = dojo.marginBox(children[i]._buttonWidget.domNode.parentNode).h;
					break;
				}
			}
		}
		if(!isFirst){
			this._hackHeight(true, this._titleHeight);
		}
	},
	_hackHeight: function(/* bool */toGrow,/* int */heightDif){
		var children = this.getChildren(),
			dn = this.domNode, h = dojo.style(dn, "height");
		if(!toGrow){
			dn.style.height = (h - heightDif) + 'px';
		}else if(children.length > 1){
			dn.style.height = (h + heightDif) + 'px';
		}else{
			//Only one rule, no need to do anything.
			return;
		}
		this.resize();
	},
	_setupTitleDom: function(child){
		var w = dojo.contentBox(child._buttonWidget.titleNode).w;
		if(dojo.isIE < 8){ w -= 8; }
		dojo.style(child._buttonWidget.titleTextNode, "width", w + "px");
	}
});
dojo.declare("dojox.grid.enhanced.plugins.filter.UniqueComboBox", dijit.form.ComboBox, {
	_openResultList: function(results){
		var cache = {}, s = this.store, colName = this.searchAttr;
		arguments[0] = dojo.filter(results, function(item){
			var key = s.getValue(item, colName), existed = cache[key];
			cache[key] = true;
			return !existed;
		});
		this.inherited(arguments);
	},
	_onKey: function(evt){
		if(evt.charOrCode === dojo.keys.ENTER && this._opened){
			dojo.stopEvent(evt);
		}
		this.inherited(arguments);
	}
});
dojo.declare("dojox.grid.enhanced.plugins.filter.BooleanValueBox", [dijit._Widget, dijit._Templated], {
	templateString: dojo.cache("dojox.grid","enhanced/templates/FilterBoolValueBox.html"),
	widgetsInTemplate: true,
	constructor: function(args){
		var nls = args.cbox.plugin.nls;
		this._baseId = args.cbox.id;
		this._lblTrue = args.trueLabel || nls.trueLabel || "true";
		this._lblFalse = args.falseLabel || nls.falseLabel || "false";
		this.args = args;
	},
	postCreate: function(){
		this.onChange();
	},
	onChange: function(){},
	
	get: function(prop){
		return this.rbTrue.get("checked");
	},
	set: function(prop, v){
		this.inherited(arguments);
		if(prop == "value"){
			this.rbTrue.set("checked", !!v);
			this.rbFalse.set("checked", !v);
		}
	}
});
})();

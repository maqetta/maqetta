dojo.provide("dojox.grid.enhanced.plugins.filter.FilterStatusTip");

dojo.requireLocalization("dojox.grid.enhanced", "Filter");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit._base.popup");
dojo.require("dijit.form.Button");
dojo.require("dojo.string");
dojo.require("dojo.date.locale");

(function(){
var gridCssCls = "", headerCssCls = "", cellCssCls = "", rowCssCls = "",
	oddRowCssCls = "dojoxGridFStatusTipOddRow",
	handleHolderCssCls = "dojoxGridFStatusTipHandle",
	conditionCssCls = "dojoxGridFStatusTipCondition",
	_removeRuleIconCls = "dojoxGridFStatusTipDelRuleBtnIcon",
	_statusFooter = "</tbody></table>";
	
	dojo.declare("dojox.grid.enhanced.plugins.filter.FilterStatusTip", null, {
		// summary:
		//		Create the status tip UI.
		constructor: function(args){
			var plugin = this.plugin = args.plugin;
			this._statusHeader = ["<table border='0' cellspacing='0' class='",
				gridCssCls, "'><thead><tr class='",
				headerCssCls, "'><th class='",
				cellCssCls, "'><div>", plugin.nls["statusTipHeaderColumn"], "</div></th><th class='",
				cellCssCls, " lastColumn'><div>", plugin.nls["statusTipHeaderCondition"], "</div></th></tr></thead><tbody>"
			].join('');
			this._removedCriterias = [];
			this._rules = [];
			this.statusPane = new dojox.grid.enhanced.plugins.filter.FilterStatusPane();
			this._dlg = new dijit.TooltipDialog({
				"class": "dojoxGridFStatusTipDialog",
				content: this.statusPane,
				autofocus: false,
				onMouseLeave: dojo.hitch(this,function(){
					this.closeDialog();
				})
			});
			this._dlg.connect(this._dlg.domNode,"click", dojo.hitch(this, this._modifyFilter));
		},
		destroy: function(){
			this._dlg.destroyRecursive();
		},
		//-----------------Public Functions------------------------
		showDialog: function(/* int */pos_x,/* int */pos_y, columnIdx){
			this._pos = {x:pos_x,y:pos_y};
			dijit.popup.close(this._dlg);
			this._removedCriterias = [];
			this._rules = [];
			this._updateStatus(columnIdx);
			dijit.popup.open({
				popup: this._dlg,
				parent: this.plugin.filterBar,
				x:pos_x - 12,
				y:pos_y - 3
			});
		},
		closeDialog: function(){
			dijit.popup.close(this._dlg);
			if(this._removedCriterias.length){
				this.plugin.filterDefDialog.removeCriteriaBoxes(this._removedCriterias);
				this._removedCriterias = [];
				this.plugin.filterDefDialog.onFilter();
			}
		},
		//-----------------Private Functions---------------------------
		_updateStatus: function(columnIdx){
			var res, p = this.plugin,
				nls = p.nls,
				sp = this.statusPane,
				fdg = p.filterDefDialog;
			if(fdg.getCriteria() === 0){
				sp.statusTitle.innerHTML = nls["statusTipTitleNoFilter"];
				sp.statusRel.innerHTML = sp.statusRelPre.innerHTML = sp.statusRelPost.innerHTML = "";
				var cell = p.grid.layout.cells[columnIdx];
				var colName = cell ? "'" + (cell.name || cell.field) + "'" : nls["anycolumn"];
				res = dojo.string.substitute(nls["statusTipMsg"], [colName]);
			}else{
				sp.statusTitle.innerHTML = nls["statusTipTitleHasFilter"];
				sp.statusRelPre.innerHTML = nls["statusTipRelPre"] + "&nbsp;";
				sp.statusRelPost.innerHTML = "&nbsp;" + nls["statusTipRelPost"];
				sp.statusRel.innerHTML = fdg._relOpCls == "logicall" ? nls["all"] : nls["any"];
				
				this._rules = [];
				var i = 0, c = fdg.getCriteria(i++);
				while(c){
					c.index = i - 1;
					this._rules.push(c);
					c = fdg.getCriteria(i++);
				}
				res = this._createStatusDetail();
			}
			sp.statusDetailNode.innerHTML = res;
			this._addButtonForRules();
		},
		_createStatusDetail: function(){
			return this._statusHeader + dojo.map(this._rules, function(rule, i){
				return this._getCriteriaStr(rule, i);
			}, this).join('') + _statusFooter;
		},
		_addButtonForRules: function(){
			if(this._rules.length > 1){
				dojo.query("." + handleHolderCssCls, this.statusPane.statusDetailNode).forEach(dojo.hitch(this, function(nd, idx){
					(new dijit.form.Button({
						label: this.plugin.nls["removeRuleButton"],
						showLabel: false,
						iconClass: _removeRuleIconCls,
						onClick: dojo.hitch(this, function(e){
							e.stopPropagation();
							this._removedCriterias.push(this._rules[idx].index);
							this._rules.splice(idx,1);
							this.statusPane.statusDetailNode.innerHTML = this._createStatusDetail();
							this._addButtonForRules();
						})
					})).placeAt(nd, "last");
				}));
			}
		},
		_getCriteriaStr: function(/* object */c, /* int */rowIdx){
			var res = ["<tr class='", rowCssCls,
				" ", (rowIdx % 2 ? oddRowCssCls : ""),
				"'><td class='", cellCssCls, "'>", c.colTxt,
				"</td><td class='", cellCssCls,
				"'><div class='", handleHolderCssCls, "'><span class='", conditionCssCls,
				"'>", c.condTxt, "&nbsp;</span>",
				c.formattedVal, "</div></td></tr>"];
			return res.join('');
		},
		_modifyFilter: function(){
			this.closeDialog();
			var p = this.plugin;
			p.filterDefDialog.showDialog(p.filterBar.getColumnIdx(this._pos.x));
		}
	});
	dojo.declare("dojox.grid.enhanced.plugins.filter.FilterStatusPane", [dijit._Widget, dijit._Templated], {
		templateString: dojo.cache("dojox.grid", "enhanced/templates/FilterStatusPane.html")
	});
})();

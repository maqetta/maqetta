define([
	"dojo",
	"dijit",
	"dojo/_base/declare",
	"./Filter",
	"./FilterDialog",
	"dijit/TooltipDialog",
	"dijit/popup",
	"dijit/Tooltip",
	"dojo/i18n!../../nls/FilterBar",
	"dojo/_base/array",
	"dojo/_base/event",
	"dojo/_base/html"
], function(dojo, dijit, declare){
	
	return declare(dijit.TooltipDialog, {
		//summary:
		//	Show status dialog of filter.
		grid: null,
		filterBar: null,
		postCreate: function(){
			this.inherited(arguments);
			this.filterBar = this.grid.filterBar;
			this.connect(this, 'onClick', '_onClick');
			this.connect(this, 'onMouseEnter', '_onMouseEnter');
			this.connect(this, 'onMouseLeave', '_onMouseLeave');
			dojo.addClass(this.domNode, 'gridxFilterTooltip');
		},
		show: function(evt){
			this.inherited(arguments);
			dijit.popup.open({
				popup: this,
				x: evt.pageX,
				y: evt.pageY,
				padding: {x: -6, y: -3}
			});
		},
		hide: function(){
			this.inherited(arguments);
			dijit.popup.close(this);
		},

		buildContent: function(){
			//summary:
			//	Build the status of current filter.
			
			var fb = this.filterBar, nls = fb._nls, data = fb.filterData;
			if(!data || !data.conditions.length){return;}
			
			var typeString = data.type === 'all' ? nls.statusTipHeaderAll : nls.statusTipHeaderAny;
			var arr = ['<div class="gridxFilterTooltipTitle"><b>Filter:</b> ', 
				typeString, '</div><table><tr><th>Column</th><th>Rule</th></tr>'
			];
			
			dojo.forEach(data.conditions, function(d, idx){
				var odd = idx%2 ? ' class="gridxFilterTooltipOddRow"' : '';
				arr.push('<tr', odd, '><td>', (d.colId ? this.grid.column(d.colId).name() : 'Any column'), 
					'</td><td class="gridxFilterTooltipValueCell">', 
					'<div>',
					fb._getRuleString(d.condition, d.value, d.type),
					'<img src="' + this.grid._blankGif + 
					'" action="remove-rule" title="' + nls.removeRuleButton + 
					'" class="gridxFilterTooltipRemoveBtn"/></div></td></tr>');
			}, this);
			arr.push('</table>');
			this.set('content', arr.join(''));
			dojo.toggleClass(this.domNode, 'gridxFilterTooltipSingleRule', data.conditions.length === 1);
		},
		_onMouseEnter: function(e){
			this.isMouseOn = true;
		},
		_onMouseLeave: function(e){
			this.isMouseOn = false;
			this.hide();
		},
		_onClick: function(e){
			var tr = this._getTr(e), fb = this.filterBar;
			if(tr && /^img$/i.test(e.target.tagName)){
				//remove the rule
				fb.filterData.conditions.splice(tr.rowIndex - 1, 1);
				tr.parentNode.removeChild(tr);
				fb.applyFilter(fb.filterData);
				dojo.stopEvent(e);
			}else{
				this.filterBar.showFilterDialog();
				this.hide();
			}
		},
		_getTr: function(e){
			//summary:
			//	Get table row of status
			var tr = e.target;
			while(tr && !/^tr$/i.test(tr.tagName) && tr !== this.domNode){
				tr = tr.parentNode;
			}
			return (tr && /^tr$/i.test(tr.tagName)) ? tr : null;
		}
	});
});

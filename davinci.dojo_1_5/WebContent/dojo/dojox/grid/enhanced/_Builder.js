dojo.provide("dojox.grid.enhanced._Builder");

dojo.require("dojox.grid._Builder");

dojo.declare("dojox.grid.enhanced._BuilderMixin", null, {
	// summary:
	//		Common methods shared between dojox.grid.enhanced._HeaderBuilder and dojox.grid.enhanced._ContentBuilder
	generateCellMarkup: function(inCell, inMoreStyles, inMoreClasses, isHeader){
		// summary:
		//		Overwritten, see dojox.grid._Builder.generateCellMarkup()
		//		Add special css classes when nested sorting is on
		var result = this.inherited(arguments);
		if(!isHeader){
			result[4] += '<div class="dojoxGridCellContent">';
			result[6] = '</div></td>';
		}
		return result;
	},
	
	domouseup: function(e){
	//summary:
	//		Handler when there is a mouse up event either in header or grid content 
	//e: Event
	//		The mouse up event
		if(e.cellNode)
			this.grid.onMouseUp(e);
	}	
});

dojo.declare("dojox.grid.enhanced._HeaderBuilder", [dojox.grid._HeaderBuilder, dojox.grid.enhanced._BuilderMixin], {
	// summary:
	//		Extending dojox.grid._HeaderBuilder to overwrite some default behavior
	getCellX: function(e){
		// summary:
		//		Overwritten, see dojox.grid._HeaderBuilder.getCellX()		
		if(this.grid.nestedSorting){
			var ascendDom = function(inNode, inWhile){
				for(var n=inNode; n && inWhile(n); n=n.parentNode);
				return n;
			};			
			var makeNotTagName = function(inTagName){
				var name = inTagName.toUpperCase();
				return function(node){ return node.tagName != name; };
			};
			var no = ascendDom(e.target, makeNotTagName("th"));
            //console.log(dojo.coords(no).x, e.clientX);
			var x = no ? e.pageX - dojo.coords(no, true).x : -1;
			if(dojo.isIE){
				//fix zoom issue in IE				
				var rect = dojo.body().getBoundingClientRect();
				var zoomLevel = (rect.right - rect.left) / document.body.clientWidth;
				// console.log('zoomlevel', zoomLevel);
				return parseInt(x / zoomLevel);
			}
            return x;
		}
		return this.inherited(arguments);
	},
	
	decorateEvent: function(e){
		// summary:
		//		Overwritten, see dojox.grid._HeaderBuilder.decorateEvent()
		var result = this.inherited(arguments);
		
		//add action types for nested sorting and column selection
		if(this.grid.nestedSorting){
			var sortInfo = this.grid._getSortEventInfo(e);
			e.unarySortChoice = sortInfo.unarySortChoice;
			e.nestedSortChoice = sortInfo.nestedSortChoice;
			e.selectChoice = sortInfo.selectChoice;				
		}
		return result;
	},
	
	doclick: function(e){
		// summary:
		//		Overwritten, see dojox.grid._HeaderBuilder.doclick()
		if((this._skipBogusClicks && !this.grid.nestedSorting)
		   ||(this.grid.nestedSorting && this.grid.ignoreEvent(e))){
			dojo.stopEvent(e);
			return true;
		}
	},
	
	colResizeSetup: function(e, isMouse){
		// summary:
		//		Overwritten, see dojox.grid._HeaderBuilder.colResizeSetup()
		//		Set minimal column width for unfixed cells when nested sorting is on
		var origMinColWidthRef = this.minColWidth;
		//if(e.sourceView.grid.nestedSorting && this.minColWidths[e.cellIndex + '']){
		if(e.sourceView.grid.nestedSorting && !this.grid.pluginMgr.isFixedCell(e.cell)){
			this.minColWidth =  this.grid.getMinColWidth();
			//this.minColWidth = this.minColWidths[e.cellIndex + ''];
			var conn = dojo.connect(this, 'endResizeColumn', dojo.hitch(this,function(){
				this.minColWidth = origMinColWidthRef;
				dojo.disconnect(conn);
			}));
		}
		var drag = this.inherited(arguments);
		if(!dojo._isBodyLtr() && dojo.isIE && drag.followers){
			//fix RTL in IE - left is NaN
			dojo.forEach(drag.followers, function(follower){
				if(!follower.left){
					follower.left = dojo.position(follower.node).x;
				}
			});
		}
		return drag;
	}	
});

dojo.declare("dojox.grid.enhanced._ContentBuilder", [dojox.grid._ContentBuilder, dojox.grid.enhanced._BuilderMixin], {
	// summary:
	// 		Extending dojox.grid._ContentBuilder to overwrite some default behavior
});

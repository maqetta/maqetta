dojo.provide("dojox.grid.enhanced.dnd._DndMovingManager");

dojo.require("dojox.grid.enhanced.dnd._DndSelectingManager");
dojo.require("dojox.grid.enhanced.dnd._DndMover");
dojo.require("dojo.dnd.move");

dojo.declare("dojox.grid.enhanced.dnd._DndMovingManager", dojox.grid.enhanced.dnd._DndSelectingManager, {
	//summary:
	//		_DndMovingManager is used to enable grid DND moving feature
	
	//exceptRowsTo: Integer
	//		the value to which that rows, that should not be moved, with index from the -1
	exceptRowsTo: -1,
	
	//exceptColumnsTo: Integer
	//		the value to which that columns, that should not be moved, with index from the -1
	exceptColumnsTo: -1,
	
	//coverDIVs: Array
	//		the list that keep the reference to all cover DIVs for DND moving
	coverDIVs: [],
	
	//movers: Array
	//		the list that keep the reference to all dnd movers for DND moving
	movers:[],
	
	constructor: function(inGrid){
		//summary:
		//		constructor, set the exceptColumnsTo value if the indirect selection feature is enabled 
		if(this.grid.indirectSelection){
			this.exceptColumnsTo = this.grid.pluginMgr.getFixedCellNumber() - 1;
		}
		this.coverDIVs = this.movers = [];
			
		dojo.subscribe("CTRL_KEY_DOWN", dojo.hitch(this,function(publisher, keyEvent){
			if(publisher == this.grid && publisher != this){
				this.keyboardMove(keyEvent);
			}
		}));
		
		dojo.forEach(this.grid.views.views, function(view){
			//fix the jumping issue of cover div when scrolled
			dojo.connect(view.scrollboxNode, 'onscroll', dojo.hitch(this, function(){
				this.clearDrugDivs();
			}));
		}, this);		
	},
	
	getGridWidth: function(){		
		//summary:
		//		get the width of the grid
		//return: Integer
		//		the width of the grid
		return dojo.contentBox(this.grid.domNode).w - this.grid.views.views[0].getWidth().replace("px","");
	},
	
	isColSelected: function(inColIndex){
		//summary:
		//		whether the specified column is selected
		//inColIndex: Integer
		//		the index value of the column
		//return: Boolean
		//		whether the specified column is selected
		return this.selectedColumns[inColIndex] && inColIndex > this.exceptColumnsTo;
	},
	
	getHScrollBarHeight: function(){
		//summary:
		//		get the horizontal sroll bar height
		//return: Integer
		//		 the horizontal sroll bar height
		this.scrollbarHeight = 0;
		dojo.forEach(this.grid.views.views, function(view, index){
			if(view.scrollboxNode){
				var thisbarHeight = view.scrollboxNode.offsetHeight - view.scrollboxNode.clientHeight;
				this.scrollbarHeight = thisbarHeight > this.scrollbarHeight ? thisbarHeight : this.scrollbarHeight;
			}
		}, this);
		return this.scrollbarHeight;
	},
	
	getExceptionalColOffsetWidth: function(){
		//summary:
		//		get the width of all un-movable columns
		//return: Integer
		//		the width of all un-movable columns
		if(!this.grid.indirectSelection || !this.grid.rowSelectCell){ return 0; }
		var offsetWidth = (normalizedOffsetWidth = 0), viewNode = this.grid.rowSelectCell.view.scrollboxNode;
		dojo.forEach(this.getHeaderNodes(), function(node, index){
			if(index <= this.exceptColumnsTo){
				var coord = dojo.coords(node);
				offsetWidth += coord.w;
			}
		}, this);
		normalizedOffsetWidth = offsetWidth - viewNode.scrollLeft * (dojo._isBodyLtr() ? 1 : (dojo.isMoz ? -1 : 1));
		return normalizedOffsetWidth > 0 ? normalizedOffsetWidth : 0;		
	},
	
	getGridCoords: function(noCache){
		//summary:
		//		get the coords values of the grid
		// noCache: Boolean
		//		force a realtime calculation
		//return: Object
		//		the coords values of the grid
		if(!this.gridCoords || noCache){
			this.gridCoords = new Object();
			if(!this.headerHeight){
				this.headerHeight = dojo.coords(this.getHeaderNodes()[0]).h;
			}
			var rowBarDomNodeCoords = dojo.coords(this.grid.views.views[0].domNode);
			var gridDomCoords = dojo.coords(this.grid.domNode);
			var gridDomBox = dojo.contentBox(this.grid.domNode);//use contentBox.h/w to exclude any margins
			this.gridCoords.h = gridDomBox.h - this.headerHeight - this.getHScrollBarHeight();
			this.gridCoords.t = gridDomCoords.y;
			this.gridCoords.l = dojo._isBodyLtr() ? (gridDomCoords.x + rowBarDomNodeCoords.w) : gridDomCoords.x;
			this.gridCoords.w = gridDomBox.w - rowBarDomNodeCoords.w;
		}
		return this.gridCoords;
	},
	
	createAvatar: function(width, height, left, top, includeHScroll){
		// Summary:
		//		Create a avatar div to DND
		// width: Integer
		//		width of avatar
		// height: Integer
		//		height of avatar
		// left: Integer
		//		left position of avatar
		// top: Integer
		// 		top position of avatar
		// includeHScroll: Boolean
		// 		whether to include the H-scroll height	
		// Return: Dom node
		//		the avatar DIV node
		this.gridCoords = null;
		var getGridCoords = this.getGridCoords();
		
		var avatar = dojo.doc.createElement("DIV");
		avatar.className = "dojoxGridSelectedDIV";
		avatar.id = "grid_dnd_cover_div_" + left + "_" + top;

		avatar.style.width = width + "px";
		
		var _docScroll = dojo._docScroll();
		
		var topDelta = top < getGridCoords.t + this.headerHeight
			? getGridCoords.t + this.headerHeight - top : 0;
		var gridBottom = getGridCoords.t + getGridCoords.h + this.headerHeight;
		
		var avatarTop = 0;
		if(top < getGridCoords.t + this.headerHeight){
			avatarTop = (getGridCoords.t + this.headerHeight);
		}else if(top > gridBottom){
			//avatar should not be shown
			avatarTop = 10000;
		}else{
			avatarTop = top ;
		}
	
		avatar.style.top = avatarTop + _docScroll.y + "px";
		avatar.style.left = (left + _docScroll.x) + "px";
		
		var avatarBottom = avatarTop + height - topDelta;
		if(avatarBottom > gridBottom + (includeHScroll ? this.scrollbarHeight : 0)){
			avatarBottom = gridBottom;
		}
		
		avatar.style.height = ((avatarBottom - avatarTop) >= 0 ? (avatarBottom - avatarTop) : 0) + "px";
		
		dojo.doc.body.appendChild(avatar);
		avatar.connections = [];
		avatar.connections.push(dojo.connect(avatar, "onmouseout", this, function(){
			this.clearDrugDivs();
		}));
		
		avatar.connections.push(dojo.connect(avatar, "onclick", this, "avataDivClick"));
		avatar.connections.push(dojo.connect(avatar, "keydown", this, function(e){
			this.handleESC(e, this);
		}));
		this.coverDIVs.push(avatar);
		
		return avatar;
	},
	
	handleESC: function(e, select){
		//Summary:
		//		 handle the esc down event, stop DND operation
		//e: Event
		//		the keydown event
		//select: _DndSelectingManager
		//		the reference to the instance of _DndSelectingManager
		var dk = dojo.keys;
		switch(e.keyCode){
			case dk.ESCAPE:
				try{
					this.cancelDND();
				}catch(e){
					console.debug(e);
				}
			break;
		}
	}, 
	
	cancelDND: function(){
		//Summary:
		//		Stop the DND operation
		this.cleanAll();
		this.clearDrugDivs();
		if(this.mover){
			this.mover.destroy();
		}
		this.cleanAll();
	},
	
	createCoverMover: function(width, height, left, top, type){
		//Summary:
		//		Create the mover according to the avatar, 
		//		and set the move constraint box to make it move horizontally or vertically
		
		var gridCoords = this.getGridCoords(), includeHScroll = (type == "col" ? true : false);
		var params = {box: {l: (type == "row" ? left : gridCoords.l) + dojo._docScroll().x, 
						 t: (type == "col" ? top : gridCoords.t + this.headerHeight) + dojo._docScroll().y, 
						 w: type == "row" ? 1 : gridCoords.w,					// keep the moving horizontally
						 h: type == "col" ? 1 : gridCoords.h // keep the moving vertically
						 }, within:true, movingType: type,
				   mover: dojox.grid.enhanced.dnd._DndMover};
		return new dojox.grid.enhanced.dnd._DndBoxConstrainedMoveable(this.createAvatar(width, height, left, top, includeHScroll), 
		params);
	},
	
	getBorderDiv: function(){
		//summary:
		//		get the border DIV that is used identify the moving position
		//return: Object
		//		 the border DIV that is used identify the moving position
		var borderDIV = dojo.byId("borderDIV" + this.grid.id);
		if(borderDIV == null){
			borderDIV = dojo.doc.createElement("DIV");
			borderDIV.id = "borderDIV" + this.grid.id;
			borderDIV.className = "dojoxGridBorderDIV";
			dojo.doc.body.appendChild(borderDIV);
		}
		return borderDIV;
	},
	
	setBorderDiv: function(width, height, left, top){
		//summary:
		//		set the position and shape of the border DIV that is used identify the moving position
		//width: Integer
		//height: Integer
		//left: Integer
		//top: Integer
		//		the position and shape of the border DIV		
		var borderDIV = this.getBorderDiv();
		dojo.style(borderDIV, {"height" : height + "px", "top" : top + "px", "width" : width + "px", "left" : left + "px"});
		return borderDIV;
	},
	
	removeOtherMovers: function(id){
		//summary:
		//		remove other movers than the specified one
		//id: Integer
		//		the id of the specified mover
		if(!this.coverDIVs.hasRemovedOtherMovers){
			var movingDIV;
			dojo.forEach(this.coverDIVs, function(div){
				if(div.id != id){
					dojo.doc.body.removeChild(div);
				}else{
					movingDIV = div;
				}
			}, this);
			this.coverDIVs = [movingDIV];
			this.coverDIVs.hasRemovedOtherMovers = true;
		}
	},
	
	addColMovers: function(){
		// Summary:
		//		Add DND movers for column DND
		var startSetDiv = -1;
		dojo.forEach(this.selectedColumns,function(col, index){
			if(this.isColSelected(index)){
				if(startSetDiv == -1){
					startSetDiv = index;
				}
				if(this.selectedColumns[index + 1] == null){
					this.addColMover(startSetDiv, index);
					startSetDiv = -1;
				}
			}
		}, this);
	},
	
	addColMover: function(leadingBorderIdx, trailingBorderIdx){
		// Summary:
		//		Add DND mover for column DND
		// leadingBorderIdx: Integer
		//		the first column index for mover to cover
		// trailingBorderIdx: Integer
		//		the last column index for mover to cover
		//console.debug("add mover: " + this.lock + "  l=" + leadingBorderIdx);
		if(this.lock){
			//console.debug("locked");
			return;
		}
		var leftPosition = (rightPosition = 0);
		var top = null, headerHeight = null;
		if(dojo._isBodyLtr()){
			dojo.forEach(this.getHeaderNodes(), function(node, index){
				var coord = dojo.coords(node);
				if(index == leadingBorderIdx){
					leftPosition = coord.x;
					top = coord.y + coord.h;
					headerHeight = coord.h;
				}
				if(index == trailingBorderIdx){
					rightPosition = coord.x + coord.w;
				}
			});
		}else{
			dojo.forEach(this.getHeaderNodes(), function(node, index){
				var coord = dojo.coords(node);
				if(index == leadingBorderIdx){
					rightPosition = coord.x + coord.w;
					headerHeight = coord.h;
				}
				if(index == trailingBorderIdx){
					leftPosition = coord.x;
					top = coord.y + coord.h;
				}
			});
		}
		
		var coords = this.normalizeColMoverCoords(leftPosition, rightPosition, leadingBorderIdx, trailingBorderIdx);
		var height = coords.h, width = coords.w;
		leftPosition = coords.l, rightPosition = coords.r;
		
		var coverMover = this.createCoverMover(width, height, leftPosition, top, "col");
		this.movers.push(coverMover);
		var borderDIV = this.setBorderDiv(3, height, -1000, top + dojo._docScroll().y);
		dojo.attr(borderDIV, 'colH', coords.colH);
			
		dojo.connect(coverMover, "onMoveStart", dojo.hitch(this, function(mover, leftTop){
			this.mover = mover;
			this.removeOtherMovers(mover.node.id);
		}));
		dojo.connect(coverMover, "onMove", dojo.hitch(this, function(mover, leftTop, mousePos){
			if(mover.node == null || mover.node.parentNode == null){
				return;
			}
			this.isMoving = true;
			this.moveColBorder(mover, mousePos, borderDIV);
		}));
		dojo.connect(coverMover, "onMoveStop", dojo.hitch(this,function(mover){
			if(this.drugDestIndex == null || this.isContinuousSelection(this.selectedColumns) 
			   && (this.drugDestIndex == leadingBorderIdx || this.drugDestIndex == trailingBorderIdx || this.drugDestIndex == (trailingBorderIdx + 1) && this.drugBefore)){ 
			   this.movingIgnored = true;
			   if(this.isMoving){
			   		this.isMoving = false;
					this.clearDrugDivs();
			   }
			   return; 
			}			
			this.isMoving = false;
			this.mover = null;
			this.startMoveCols();
			this.drugDestIndex = null;
		}));
	},
	
	normalizeColMoverCoords: function(leftPosition, rightPosition, leadingBorderIdx, trailingBorderIdx){
		// Summary:
		//		Normalize width/height, view column height and left/right x coordinates for column cover div
		// leftPosition: Integer
		//		Left side x coordinate of column mover
		// rightPosition: Integer
		//		Right side x coordinate of column mover
		// leadingBorderIdx: Integer
		//		The leftmost column index for mover to cover
		// trailingBorderIdx: Integer
		//		The rightmost column index for mover to cover
		// return:Object
		//		Normalized width and coordinates, e.g.{'w': 100, 'h': 200, 'l': 150, 'r': 250, 'colH': 50}
		var width = rightPosition - leftPosition, views = this.grid.views.views, pluginMgr = this.grid.pluginMgr;
		var coords = {'w': width, 'h': 0, 'l': leftPosition, 'r': rightPosition, 'colH': 0};
		var gridWidth = this.getGridWidth() - views[views.length-1].getScrollbarWidth();
		
		var rtl = !dojo._isBodyLtr();
		var leftView = pluginMgr.getViewByCellIdx(!rtl ? leadingBorderIdx : trailingBorderIdx); 
		var rightView = pluginMgr.getViewByCellIdx(!rtl ? trailingBorderIdx : leadingBorderIdx);
		var inSameView = (leftView == rightView);
		
		if(!leftView || !rightView){ return coords;}
		
		var leftBoundary = dojo.coords(leftView.scrollboxNode).x + (rtl && dojo.isIE ? leftView.getScrollbarWidth() : 0);
		var rightViewCoords = dojo.coords(rightView.scrollboxNode);
		var rightBoundary = rightViewCoords.x + rightViewCoords.w - ((!rtl || !dojo.isIE) ? rightView.getScrollbarWidth() : 0);
		
		if(coords.l < leftBoundary){
			coords.w = coords.r - leftBoundary;
			coords.l = leftBoundary;
		}
		if(coords.r > rightBoundary){
			coords.w = rightBoundary - coords.l;
		}

		var i, rowBarView = this.grid.views.views[0], colHeight =  dojo.coords(rowBarView.contentNode).h;;
		var view = rightView/*use right view as default*/, viewHeight = rightViewCoords.h;
		coords.colH = colHeight;
		viewHeight = !inSameView ? viewHeight : (viewHeight - (view.scrollboxNode.offsetHeight - view.scrollboxNode.clientHeight));
		coords.h = colHeight < viewHeight ? colHeight : viewHeight;
		return coords;
	},	
	
	moveColBorder: function(mover, mousePos, borderDIV){
		//Summary:
		//		Column border identify the dnd dest position. move the border according to avatar move
		//mover: Object
		//		the reference to the dnd mover
		//mousePos: Object
		//		the current position of the mover - {x:.., Y:..}	
		//borderDIV:Object
		//		reference to the borderDIV
		var docScroll = dojo._docScroll(), rtl = !dojo._isBodyLtr();
		mousePos.x -= docScroll.x;		

		var views = this.grid.views.views, gridCoords = this.getGridCoords();
		var leftViewNode = views[!rtl ? 1 : views.length-1].scrollboxNode;
		var rightViewNode = views[!rtl ? views.length-1 : 1].scrollboxNode;
			
		var leftX = (!rtl || !dojo.isIE) ? gridCoords.l : (gridCoords.l + leftViewNode.offsetWidth - leftViewNode.clientWidth);
		var rightX = (!rtl || dojo.isMoz) ? (gridCoords.l + gridCoords.w - (rightViewNode.offsetWidth - rightViewNode.clientWidth)) : (gridCoords.l + gridCoords.w);
		
		dojo.forEach(this.getHeaderNodes(), dojo.hitch(this,function(node, index){
			if(index > this.exceptColumnsTo){
				var x, coord = dojo.coords(node);
				if(mousePos.x >= coord.x && mousePos.x <= coord.x + coord.w){
					if(!this.selectedColumns[index] || !this.selectedColumns[index - 1]){
						x = coord.x +  docScroll.x + (rtl ? coord.w : 0);
						if(mousePos.x < leftX || mousePos.x > rightX || x < leftX || x > rightX){ return; }
						dojo.style(borderDIV, 'left', x + 'px');
						this.drugDestIndex = index;
						this.drugBefore = true;
						!dojo.isIE && this.normalizeColBorderHeight(borderDIV, index);
					}
				}else if(this.getHeaderNodes()[index + 1] == null && (!rtl ? (mousePos.x > coord.x + coord.w) : (mousePos.x < coord.x))){
						x = mousePos.x < leftX ? leftX : (mousePos.x > rightX ? rightX : (coord.x + docScroll.x + (rtl ? 0 : coord.w)));
						dojo.style(borderDIV, 'left', x + 'px');
						this.drugDestIndex = index;
						this.drugBefore = false;
						!dojo.isIE && this.normalizeColBorderHeight(borderDIV, index);
				}
			}
		}));
	},
	
	normalizeColBorderHeight: function(borderDiv, colIdx){
		// Summary:
		//		Normalize height of mover border div - for column moving
		// borderDiv: Dom node
		//		Mover border div dom node
		// colIdx: Integer
		//		Column index
		var view = this.grid.pluginMgr.getViewByCellIdx(colIdx);
		if(!view){ return; }
		
		var node = view.scrollboxNode, colHeight = dojo.attr(borderDiv, 'colH');
		var viewHeight = dojo.coords(node).h - (node.offsetHeight - node.clientHeight);
		viewHeight = colHeight > 0 && colHeight < viewHeight ? colHeight : viewHeight;
		dojo.style(borderDiv, 'height', viewHeight + 'px');
	},
	
	avataDivClick: function(e){
		//Summary:
		//		handle click on avatar, hide the avatar
		if(this.movingIgnored){
			this.movingIgnored = false;
			return;
		}
		this.cleanAll();
		this.clearDrugDivs();
	},
	
	startMoveCols: function(){
		// Summary:
		//		start to move the selected columns to target position
		this.changeCursorState("wait");
		this.srcIndexdelta = 0;
		deltaColAmount = 0;
		dojo.forEach(this.selectedColumns, dojo.hitch(this, function(col, index){
			if(this.isColSelected(index)){				
				if(this.drugDestIndex > index){
					index -= deltaColAmount;
				}
				deltaColAmount += 1;
				var srcViewIndex = this.grid.layout.cells[index].view.idx;
				var destViewIndex = this.grid.layout.cells[this.drugDestIndex].view.idx;
				if(index != this.drugDestIndex){
					this.grid.layout.moveColumn(srcViewIndex,destViewIndex,index,this.drugDestIndex,this.drugBefore);
				}
				if(this.drugDestIndex <= index && this.drugDestIndex + 1 < this.grid.layout.cells.length){
					this.drugDestIndex += 1;
				}				
			}
		}));
		
		var dest = this.drugDestIndex + (this.drugBefore? 0:1);
		this.clearDrugDivs();
		this.cleanAll();
		this.resetCellIdx();
		this.drugSelectionStart.colIndex = dest - deltaColAmount;
		this.drugSelectColumn(this.drugSelectionStart.colIndex +  deltaColAmount - 1);		
	},
	
	changeCursorState: function(state){
		//summary:
		//		change the cursor state
		//state: String
		//		the state that the cursor will be changed to
		dojo.forEach(this.coverDIVs, function(div){
			div.style.cursor = "wait";
		});
	},	
	
	addRowMovers: function(){
		// Summary:
		//		Add DND movers for row DND
		var startSetDiv = -1;
		dojo.forEach(this.grid.selection.selected,function(row, index){
			var rowBarView = this.grid.views.views[0];
			if(row && rowBarView.rowNodes[index]/*row bar node with 'index' must exist*/){
				if(startSetDiv == -1){
					startSetDiv = index;
				}
				if(this.grid.selection.selected[index + 1] == null || !rowBarView.rowNodes[index + 1]){
					this.addRowMover(startSetDiv, index);
					startSetDiv = -1;
				}
			}
		}, this);
	},
	
	addRowMover: function(from, to){
		// Summary:
		//		Add DND mover for row DND
		// from: 
		//		the first row index for mover to cover
		// to:
		//		the last row index for mover to cover

		// scroll bar width sum, to fix the insufficient width of borderDIV/coverDIV for 2+ views
		var scrollBarWidthSum = 0, views = this.grid.views.views;
		dojo.forEach(views, function(view, index){
			scrollBarWidthSum += view.getScrollbarWidth();
		});
		var lastScrollBarWidth = views[views.length-1].getScrollbarWidth();
		var widthDelta = !dojo._isBodyLtr() ? (dojo.isIE ? scrollBarWidthSum - lastScrollBarWidth : scrollBarWidthSum) : 0;
		
		// get grid width except the scroll bar width of trailing view
		//var gridWidth = this.getGridWidth() + scrollBarWidthSum - lastScrollBarWidth;
		var gridWidth = this.getGridWidth() - lastScrollBarWidth;
		
		// use rowBar as row position identifier
		var rowBarView = this.grid.views.views[0];
		var startBarNode = rowBarView.rowNodes[from],
			endBarNode = rowBarView.rowNodes[to];			
			
		// get the start and end postion of selected area
		if(!startBarNode || !endBarNode){
			return; // row not loaded
		}
		var	startCoord = dojo.coords(startBarNode), endCoord = dojo.coords(endBarNode);
		var exceptionalColOffsetWidth = this.getExceptionalColOffsetWidth(); 
		
		var coverMover = this.createCoverMover(gridWidth - exceptionalColOffsetWidth, // width
											   (endCoord.y - startCoord.y + endCoord.h), // height
												dojo._isBodyLtr() ? (startCoord.x + startCoord.w + exceptionalColOffsetWidth) : (startCoord.x - gridWidth - widthDelta),
											    startCoord.y,
												"row"); // top
		var borderDIV = this.setBorderDiv(gridWidth, 3,  // width & height
									(dojo._isBodyLtr() ? (endCoord.x + endCoord.w) : (endCoord.x - gridWidth - widthDelta)) + dojo._docScroll().x, -100); // top
			
		var avaMoveStart = dojo.connect(coverMover, "onMoveStart", dojo.hitch(this, function(mover, leftTop){
			this.mover = mover;
			this.removeOtherMovers(mover.node.id);
		}));
		
        var avaMove = dojo.connect(coverMover, "onMove", dojo.hitch(this, function(mover, leftTop, mousePos){
			if(mover.node == null || mover.node.parentNode == null){
				return;
			}
            this.isMoving = true;
            this.moveRowBorder(mover, leftTop, borderDIV, mousePos);
        }));
		
		var avaMoveStop = dojo.connect(coverMover, "onMoveStop", dojo.hitch(this,function(mover){
			if(this.avaOnRowIndex == null || this.isContinuousSelection(this.grid.selection.selected) && (this.avaOnRowIndex == from || this.avaOnRowIndex == (to + 1))){
			   	this.movingIgnored = true;
				if(this.isMoving){
					this.isMoving = false;
					this.clearDrugDivs();
				}
				return; 
			}			
			this.isMoving = false;
			this.mover = null;
			this.grid.select.outRangeY = false;
			this.grid.select.moveOutTop = false;
			/*fix - blank Grid page when moving rows at bottom page, this only occurs the first time Grid get loaded*/		
			this.grid.scroller.findScrollTop(this.grid.scroller.page * this.grid.scroller.rowsPerPage);
			this.startMoveRows();
			this.avaOnRowIndex = null;
			delete coverMover;
		}));
		
//		var avaKEY = dojo.connect(coverMover.node, "keydown",  dojo.hitch(this,function(e){
//			var dk = dojo.keys;
//			switch(e.keyCode){
//				case dk.ESCAPE:
//					try{
//						this.cleanAll();
//						this.clearDrugDivs();
//						this.mover.destroy();
//						this.cleanAll();
//					}catch(e){
//						console.debug(e);
//					}
//					break;
//			}
//		}));
	},
	
	moveRowBorder: function(mover, leftTop, borderDIV, mousePos){
		//summary:
		//		move the border DIV to specified position when moving row
		//mover: Object
		//		the reference to the dnd mover
		//leftTop: Object
		//		the leftTop position of the mover
		//borderDIV:Object
		//		reference to the borderDIV
		//mousePos: Object
		//		the current position of the mover - {x:.., Y:..}	
		var gridCoords = this.getGridCoords(true), docScroll = dojo._docScroll();
		var gridBottomY = gridCoords.t + this.headerHeight + gridCoords.h
		leftTop.t -= docScroll.y, mousePos.y -= docScroll.y;
		if(mousePos.y >= gridBottomY){
            this.grid.select.outRangeY = true;
            this.autoMoveToNextRow();
        }else if(mousePos.y <= gridCoords.t + this.headerHeight){
        	this.grid.select.moveOutTop = true;
            this.autoMoveToPreRow();
		}else{
            this.grid.select.outRangeY = this.grid.select.moveOutTop = false;
			var rowBarView = this.grid.views.views[0], rowBarNodes = rowBarView.rowNodes;
			var colHeight =  dojo.coords(rowBarView.contentNode).h;
			var rowCount = 0, bottomRowIndex = -1;
			for(i in rowBarNodes){
				i = parseInt(i);
				++rowCount;
				if(i > bottomRowIndex){ bottomRowIndex = i; }
			}
			var bottomRowCoords = dojo.coords(rowBarNodes[bottomRowIndex]);
			
			if(colHeight < gridCoords.h && mousePos.y > (bottomRowCoords.y + bottomRowCoords.h)){
				this.avaOnRowIndex = rowCount;
				dojo.style(borderDIV, {"top" : bottomRowCoords.y + bottomRowCoords.h + docScroll.y + "px"});
				return;
			}
			
			var coord, rowBarNode, inView;
			for(var index in rowBarNodes){
				index = parseInt(index);
				if(isNaN(index)){ continue; }
				rowBarNode = rowBarNodes[index];
				if(!rowBarNode){ continue; }
				coord = dojo.coords(rowBarNode), inView = (coord.y <= gridBottomY);
				if(inView && mousePos.y > coord.y && mousePos.y < coord.y + coord.h){
					if(!this.grid.selection.selected[index] || !this.grid.selection.selected[index - 1]){
						this.avaOnRowIndex = index;
						dojo.style(borderDIV, {"top" : coord.y + docScroll.y + "px"});
					}
				}
			}
        }
	},
	
	autoMoveToPreRow: function(){
		//summary:
		//		auto move the mover to the previous row of the current one
		if(this.grid.select.moveOutTop){	
			if(this.grid.scroller.firstVisibleRow > 0){
				this.grid.scrollToRow(this.grid.scroller.firstVisibleRow - 1);
				this.autoMoveBorderDivPre();
				setTimeout(dojo.hitch(this, 'autoMoveToPreRow'), this.autoScrollRate);
			}
		}
	},
	
	autoMoveBorderDivPre: function(){
		//summary:
		//		auto move the border DIV to the previous row of the current one
		var docScroll = dojo._docScroll(), gridCoords = this.getGridCoords();
		var viewTopY = gridCoords.t + this.headerHeight + docScroll.y;
		var preRowY, borderDIV = this.getBorderDiv();
		if(this.avaOnRowIndex - 1 <= 0){
			this.avaOnRowIndex = 0;
			preRowY = viewTopY;
		}else{
			this.avaOnRowIndex--;
			preRowY = dojo.coords(this.grid.views.views[0].rowNodes[this.avaOnRowIndex]).y + docScroll.y;
		}
		borderDIV.style.top = (preRowY < viewTopY ? viewTopY : preRowY)+ "px";
	},
	
	autoMoveToNextRow: function(){
		//summary:
		//		auto move the mover to the next row of the current one
		if(this.grid.select.outRangeY){
			if(this.avaOnRowIndex + 1 <= this.grid.scroller.rowCount){
				this.grid.scrollToRow(this.grid.scroller.firstVisibleRow + 1);
				this.autoMoveBorderDiv();
				setTimeout(dojo.hitch(this, 'autoMoveToNextRow'), this.autoScrollRate);
			}
		}
	},
	
	autoMoveBorderDiv: function(){
		//Summary:
		//		auto move the drop indicator to the next row when avatar is moved out of the grid bottom
		var docScroll = dojo._docScroll(), gridCoords = this.getGridCoords();
		var viewBottomY = gridCoords.t + this.headerHeight + gridCoords.h + docScroll.y;
		var nextRowY, borderDIV = this.getBorderDiv();
		if(this.avaOnRowIndex + 1 >= this.grid.scroller.rowCount){
			this.avaOnRowIndex = this.grid.scroller.rowCount;
			nextRowY = viewBottomY;
		}else{
			this.avaOnRowIndex++;
			nextRowY = dojo.coords(this.grid.views.views[0].rowNodes[this.avaOnRowIndex]).y + docScroll.y;
		}
		borderDIV.style.top = (nextRowY > viewBottomY ? viewBottomY : nextRowY) + "px";
	},
	
	startMoveRows: function(){
		//summary:
		//		start to move the selected rows to target position
		var start = Math.min(this.avaOnRowIndex, this.getFirstSelected());
		var end = Math.max(this.avaOnRowIndex - 1, this.getLastSelected());
		this.moveRows(start, end, this.getPageInfo());
	},
	
	moveRows: function(start, end, pageInfo){
		//summary:
		//		Only move visible rows to avoid performance issue especially 
		//		when there are many disperse selected rows across not-rendered pages
		//start:Integer
		//		the first row of the selected area to move
		//end:Integer
		//		the first row of the selected area to move deltaRowAmount
		//pageInfo:Object
		//		{topPage: xx, bottomPage: xx, invalidPages: [xx,xx,...]}
		var i, rowMoved = false, selectedRows = (selectedRowsAboveBorderDIV = 0), tempArray = [];//all rows to be updated
		var scroller = this.grid.scroller, rowsPerPage = scroller.rowsPerPage;
		var topRow = pageInfo.topPage * rowsPerPage, bottomRow = (pageInfo.bottomPage + 1) * rowsPerPage - 1;
		
		var pushUnselectedRows = dojo.hitch(this, function(from, to){
			for(i = from; i < to; i++){
				if(!this.grid.selection.selected[i] || !this.grid._by_idx[i]){
					tempArray.push(this.grid._by_idx[i]);
				}
			}
		});
		
		//push unselected rows above borderDIV to temp array
		pushUnselectedRows(start, this.avaOnRowIndex);
		
		//push selected rows to temp array
		for(i = start; i <= end; i++){
			if(this.grid.selection.selected[i] && this.grid._by_idx[i]){
				tempArray.push(this.grid._by_idx[i]);
				selectedRows++;
				if(this.avaOnRowIndex > i){ selectedRowsAboveBorderDIV++; } 
			}
		}
		
		//push unselected rows below borderDIV to temp array
		pushUnselectedRows(this.avaOnRowIndex, end + 1);
		
		//update changed region
		for(i = start, j = 0; i <= end; i++){
			this.grid._by_idx[i] = tempArray[j++];
			if(i >= topRow && i <= bottomRow){
				this.grid.updateRow(i);
				rowMoved = true;
			}
		}
		this.avaOnRowIndex += selectedRows - selectedRowsAboveBorderDIV;
		try{
			this.clearDrugDivs();
			this.cleanAll();
			this.drugSelectionStart.rowIndex = this.avaOnRowIndex - selectedRows;
			this.drugSelectRow(this.drugSelectionStart.rowIndex +  selectedRows - 1);
			if(rowMoved){
				var stack = scroller.stack;
				dojo.forEach(pageInfo.invalidPages, function(pageIndex){
					scroller.destroyPage(pageIndex);
					i = dojo.indexOf(stack, pageIndex);
					if(i >= 0){
						stack.splice(i, 1);
					}
				});			
			}
			this.publishRowMove();
		}catch(e){
			console.debug(e);
		}
	},
	
	clearDrugDivs: function(){
		//summary:
		//		remove cover DIVs for dnd moving
		if(!this.isMoving){ 
			var borderDIV = this.getBorderDiv();
	        borderDIV.style.top = -100 + "px";
			borderDIV.style.height = "0px";
			borderDIV.style.left = -100 + "px";
			
	        dojo.forEach(this.coverDIVs, function(div){
				//console.debug("del id=" + div.id);
				dojo.forEach(div.connections, function(connection){
					dojo.disconnect(connection);
				});
	            dojo.doc.body.removeChild(div);
				delete div;
	        }, this);
	        this.coverDIVs = [];
		}
	},	
	
	setDrugCoverDivs: function(inColIndex, inRowIndex){
		// Summary:
		//		set the cover divs for DND
		if(!this.isMoving){
			if(this.isColSelected(inColIndex)){
				this.addColMovers();
			}else if( this.grid.selection.selected[inRowIndex]){
				this.addRowMovers();
			}else{
				this.clearDrugDivs();
			}
		}
	},
	
	getPageInfo: function(){
		//summary:
		//		Find pages that contain visible rows
		//return: Object
		//		{topPage: xx, bottomPage: xx, invalidPages: [xx,xx,...]}
		var scroller = this.grid.scroller, topPage = (bottomPage = scroller.page);
		var firstVisibleRow = scroller.firstVisibleRow, lastVisibleRow = scroller.lastVisibleRow;
		var rowsPerPage = scroller.rowsPerPage, renderedPages = scroller.pageNodes[0];		
		var topRow, bottomRow, invalidPages = [], matched;
		
		dojo.forEach(renderedPages, function(page, pageIndex){
			if(!page){ return; }
			matched = false;
			topRow = pageIndex * rowsPerPage;
			bottomRow = (pageIndex + 1) * rowsPerPage - 1;
			if(firstVisibleRow >= topRow && firstVisibleRow <= bottomRow){
				topPage = pageIndex;
				matched = true;
			}
			if(lastVisibleRow >= topRow && lastVisibleRow <= bottomRow){
				bottomPage = pageIndex;
				matched = true;
			}
			if(!matched && (topRow > lastVisibleRow || bottomRow < firstVisibleRow)){
				invalidPages.push(pageIndex);				
			}
		});
		return {topPage: topPage, bottomPage: bottomPage, invalidPages: invalidPages};
	},
	
	resetCellIdx: function(){
		// Summary:
		//			reset the 'idx' attributes of cells' DOM node and structures
		var lastMax = 0;
		var thisMax = -1;
		dojo.forEach(this.grid.views.views, function(view, index){
			if(index == 0){
				return;
			}
			if(view.structure.cells && view.structure.cells[0]){
				dojo.forEach(view.structure.cells[0], function(cell, index){
					var marks = cell.markup[2].split(" ");
					var idx = lastMax + index;
					marks[1] = "idx=\"" + idx + "\"";
					cell.markup[2] = marks.join(" ");
				});
			}
			for(i in view.rowNodes){
				if(!view.rowNodes[i]){ return;/* row not loaded */}
				dojo.forEach(view.rowNodes[i].firstChild.rows[0].cells, function(cell, cellIndex){
					if(cell && cell.attributes ){
						if(cellIndex + lastMax > thisMax){
							thisMax = cellIndex + lastMax;
						}
						var idx = document.createAttribute("idx");
						idx.value = cellIndex + lastMax;
						cell.attributes.setNamedItem(idx);
					}
				});
			}
			lastMax = thisMax + 1;
		});
	},
	
	publishRowMove: function(){
		//summary:
		//		publish a topic to notify the row movement
		dojo.publish(this.grid.rowMovedTopic, [this]);
	},
	
	keyboardMove: function(keyEvent){
		//summary:
		//		handle keyboard dnd
		var inColSelection = this.selectedColumns.length > 0;
		var inRowSelection = dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype['getFirstSelected'])() >= 0;
		var i, colAmount, dk = dojo.keys, keyCode = keyEvent.keyCode;
		if(!dojo._isBodyLtr()){
			keyCode = (keyEvent.keyCode == dk.LEFT_ARROW) ? dk.RIGHT_ARROW : (keyEvent.keyCode == dk.RIGHT_ARROW ? dk.LEFT_ARROW : keyCode);
		}
		switch(keyCode){
			case dk.LEFT_ARROW:
				if(!inColSelection){return;}
				colAmount = this.getHeaderNodes().length;
				for(i = 0; i < colAmount; i++){
					if(this.isColSelected(i)){
						this.drugDestIndex = i - 1;
						this.drugBefore = true;
						break;
					}
				}
				var minBoundary = this.grid.indirectSelection ? 1 : 0;
				(this.drugDestIndex >= minBoundary) ? this.startMoveCols() : (this.drugDestIndex = minBoundary);
			break;
			case dk.RIGHT_ARROW:
				if(!inColSelection){return;}
				colAmount = this.getHeaderNodes().length;
				this.drugBefore = true;
				for(i = 0; i < colAmount; i++){
					if(this.isColSelected(i) && !this.isColSelected(i + 1)){
						this.drugDestIndex = i + 2;
						if(this.drugDestIndex == colAmount){
							this.drugDestIndex--;
							this.drugBefore = false;
						}
						break;
					}
				}
				if(this.drugDestIndex < colAmount){
					this.startMoveCols();
				}
			break;
			case dk.UP_ARROW:
				if(!inRowSelection){return;}
				this.avaOnRowIndex = dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype['getFirstSelected'])() - 1;
				if(this.avaOnRowIndex > -1){
					this.startMoveRows();
				}
			break;
			case dk.DOWN_ARROW:
				if(!inRowSelection){return;}
				for(i = 0; i < this.grid.rowCount; i++){
					if(this.grid.selection.selected[i] && !this.grid.selection.selected[i + 1]){
						this.avaOnRowIndex = i + 2;
						break;
					}
				}
				if(this.avaOnRowIndex <= this.grid.rowCount){
					this.startMoveRows();
				}
		}
	}
});

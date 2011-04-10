dojo.provide("dojox.grid.enhanced.dnd._DndFocusManager");

dojo.declare("dojox.grid.enhanced.dnd._DndFocusManager", null, {
	//summary:
	//		This class declaration is used to be mixed in to dojox.grid._FocusManager
	//		to enable  DND feature by changing some focus behavior in _FocusManager
	
	//_rowBarNode: Object
	//		reference to a row bar DOM node
    _rowBarNode: null,
	
	//_rowBarFocusIdy: Integer
	//		The value of the ID, which is from the row node that is focused
    _rowBarFocusIdy: null,
	
    isRowBar: function(){
		//summary:
		//		states whether currently navigating among row bar nodes.
		// returns:
		//		true if focus is on a row bar node; false otherwise. 
        return (!!this._rowBarNode);
    },
    
	getRowBarNode: function(inIdx){
		//summary:
		//		get a reference of a row bar DOM node which has the same idx value with inIdx
		//inIdx: Integer
		//		The idx value of the row bar DOM node that will be got
		return this.grid.views.views[0].getCellNode(inIdx, 0);
	},
	
    focusRowBar: function(){
		//summary:
		//		Move the focud to the first row bar node		
        this.focusRowBarNode(0);
		this._focusifyCellNode(false);
        
    },
    
    focusRowBarNode: function(rowIndex){
		//summary:
		//		move the focus to the row bar DOM node with the row index same as rowIndex
		//rowIndex: Integer
		//		The row index value of the row bar node that will be focused		
		this._blurRowBar();
		this._focusifyCellNode(false);
		var node = this.getRowBarNode(rowIndex);
		if(!node) return;
        this._rowBarNode = node;
        this._rowBarFocusIdy = rowIndex;
		this._rowBarNode.tabIndex = -1;
        dojox.grid.util.fire(this._rowBarNode, "focus");
        dojo.toggleClass(this._rowBarNode, this.focusClass, true);
    },
    
    _blurRowBar: function(){
		//summary:
		//		blur the focus on the focused row bar node
		if(this._rowBarNode){
			dojo.toggleClass(this._rowBarNode, this.focusClass, false);
        	this._rowBarNode = this._rowBarFocusIdy = null;
		}
       
    },
    
    focusNextRowBar: function(){
		//summary:
		//		move the focus to the next row bar node of the the current focused node		
        var sc = this.grid.scroller, r = this._rowBarFocusIdy, rc = this.grid.rowCount - 1, row = Math.min(rc, Math.max(0, r + 1));
        var currentY = this._rowBarFocusIdy + 1;
        if (row > sc.getLastPageRow(sc.page)) {
            //need to load additional data, let scroller do that
            this.grid.setScrollTop(this.grid.scrollTop + sc.findScrollTop(row) - sc.findScrollTop(r));
        }
      
        this.focusRowBarNode(currentY);
        this.scrollRowBarIntoView();
    },
    
    focusPrevRowBar: function(){
		//summary:
		//		move the focus to the previous row bar node of the the current focused node		
        var sc = this.grid.scroller, r = this._rowBarFocusIdy, rc = this.grid.rowCount - 1, row = Math.min(rc, Math.max(0, r - 1));
        var currentY = this._rowBarFocusIdy - 1;
        if (currentY < 0) {
            return;
        }
        if (currentY <= sc.getPageRow(sc.page)) {
            this.grid.setScrollTop(this.grid.scrollTop - sc.findScrollTop(r) - sc.findScrollTop(row));
        }
        
        this.focusRowBarNode(currentY);
        this.scrollRowBarIntoView();
    },
    
    getFocusedRowIndex: function(){
		//summary:
		//		get the index of the node which is focused
		//return: Integer
		//		the index of the node which is focused
        return this._rowBarFocusIdy;
    },
	
    scrollRowBarIntoView: function(){
    	//summary:
		//		scroll the row bar view to make the focused row bar show in the view
		
        //Fake a cell object to do scroll
        this.cell = this._rowBarNode;
        this.cell.view = this.grid.views.views[0];
        this.cell.getNode = function(index){
            return this.cell;
        };        
        
        this.rowIndex = this._rowBarFocusIdy;
        this.scrollIntoView();
		this.cell = null;
    },
	
	focusHeaderNode: function(inHeaderNodeIdx){
		//summary:
		//		move the focus to col header
		this._colHeadFocusIdx = inHeaderNodeIdx;
		this.focusHeader.apply(this, arguments);
		//this.focusHeader();
	}
});

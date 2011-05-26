dojo.provide("dojox.grid.enhanced.plugins.Pagination");

dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.Button");
dojo.require("dojox.grid.enhanced._Plugin");
dojo.require("dojox.grid.enhanced.plugins.Dialog");
dojo.require("dojox.grid.enhanced.plugins._StoreLayer");

dojo.requireLocalization("dojox.grid.enhanced", "Pagination");

dojo.declare("dojox.grid.enhanced.plugins.Pagination", dojox.grid.enhanced._Plugin, {
	// summary:
	//		The typical pagination way as an alternative to deal with huge data set besides the default virtual scrolling way
	
	name: "pagination",
	// The page size used with the store, default = 25.
	pageSize: 25,
	
	defaultRows: 25,
	
	//current page we are at
	_currentPage: 0,

	//The currently obtained max # of rows to page through.
	_maxSize: 0,
	
	init: function(){
		this.gh = null;
		this.grid.rowsPerPage = this.pageSize = this.grid.rowsPerPage ? this.grid.rowsPerPage : this.pageSize;
		this.grid.usingPagination = true;
		this.nls = dojo.i18n.getLocalization("dojox.grid.enhanced", "Pagination");
		
		this._wrapStoreLayer();
		this._createPaginators(this.option);
		
		this._regApis();
	},
	
	_createPaginators: function(paginationArgs){
		// summary:
		//		Function to create the pagination control bar.
		this.paginators = [];
		if(paginationArgs.position === "both"){
			this.paginators = [
				new dojox.grid.enhanced.plugins._Paginator(dojo.mixin(paginationArgs, {position: "bottom", plugin: this})),
				new dojox.grid.enhanced.plugins._Paginator(dojo.mixin(paginationArgs, {position: "top", plugin: this}))
			];
		}else{
			this.paginators = [new dojox.grid.enhanced.plugins._Paginator(dojo.mixin(paginationArgs, {plugin: this}))];
		}
	},
	 
	_wrapStoreLayer: function(){
		var g = this.grid,
			ns = dojox.grid.enhanced.plugins;
		this._store = g.store;
		this.query = g.query;
		
		this.forcePageStoreLayer = new ns._ForcedPageStoreLayer(this);
		ns.wrap(g, "_storeLayerFetch", this.forcePageStoreLayer);
		
		this.connect(g, "setQuery", function(query){
			if(query !== this.query){
				this.query = query;
			}
		});
	},
	
	_stopEvent: function(event){
		try{
			dojo.stopEvent(event);
		}catch(e){}
	},
	
	_onNew: function(item, parentInfo){
		var totalPages = Math.ceil(this._maxSize / this.pageSize);
		if(((this._currentPage + 1 === totalPages || totalPages === 0) && this.grid.rowCount < this.pageSize) || this.showAll){
			dojo.hitch(this.grid, this._originalOnNew)(item, parentInfo);
			this.forcePageStoreLayer.endIdx++;
		}
		this._maxSize++;
		if(this.showAll){
			this.pageSize++;
		}
		if(this.showAll && this.grid.autoHeight){
			this.grid._refresh();
		}else{
			dojo.forEach(this.paginators, function(p){
				p.update();
			});
		}
	},
	
	_removeSelectedRows: function(){
		this._multiRemoving = true;
		this._originalRemove();
		this._multiRemoving = false;
		this.grid.resize();
		this.grid._refresh();
	},
	
	_onDelete: function(){
		if(!this._multiRemoving){
			this.grid.resize();
			if(this.showAll){
				this.grid._refresh();
			}
		}
		if(this.grid.get('rowCount') === 0){
			this.prevPage();
		}
	},
	
	_regApis: function(){
		// summary:
		//		register pagination public APIs to grid.
		var g = this.grid;
		// New added APIs
		g.gotoPage = dojo.hitch(this, this.gotoPage);
		g.nextPage = dojo.hitch(this, this.nextPage);
		g.prevPage = dojo.hitch(this, this.prevPage);
		g.gotoFirstPage = dojo.hitch(this, this.gotoFirstPage);
		g.gotoLastPage = dojo.hitch(this, this.gotoLastPage);
		g.changePageSize = dojo.hitch(this, this.changePageSize);
		g.showGotoPageButton = dojo.hitch(this, this.showGotoPageButton);
		g.getTotalRowCount = dojo.hitch(this, this.getTotalRowCount);
		// Changed APIs
		this.originalScrollToRow = dojo.hitch(g, g.scrollToRow);
		g.scrollToRow = dojo.hitch(this, this.scrollToRow);
		this._originalOnNew = dojo.hitch(g, g._onNew);
		this._originalRemove = dojo.hitch(g, g.removeSelectedRows);
		g.removeSelectedRows = dojo.hitch(this, this._removeSelectedRows);
		g._onNew = dojo.hitch(this, this._onNew);
		this.connect(g, "_onDelete", dojo.hitch(this, this._onDelete));
	},
	
	destroy: function(){
		this.inherited(arguments);
		var g = this.grid;
		try{
			dojo.forEach(this.paginators, function(p){
				p.destroy();
			});
			g.unwrap(this.forcePageStoreLayer.name());
			g._onNew = this._originalOnNew;
			g.removeSelectedRows = this._originalRemove;
			g.scrollToRow = this.originalScrollToRow;
			this.paginators = null;
			this.nls = null;
		}catch(e){
			console.warn("Pagination.destroy() error: ", e);
		}
	},
	
	nextPage: function(){
		// summary:
		//		Function to handle shifting to the next page in the list.
		if(this._maxSize > ((this._currentPage + 1) * this.pageSize)){
			//Current page is indexed at 0 and gotoPage expects 1-X.  So to go
			//up  one, pass current page + 2!
			this.gotoPage(this._currentPage + 2);
		}
	},

	prevPage: function(){
		// summary:
		//		Function to handle shifting to the previous page in the list.
		if(this._currentPage > 0){
			//Current page is indexed at 0 and gotoPage expects 1-X.  So to go
			//back one, pass current page!
			this.gotoPage(this._currentPage);
		}
	},

	gotoPage: function(page){
		// summary:
		//		Function to handle shifting to an arbirtary page in the list.
		//	page:
		//		The page to go to, starting at 1.
		var totalPages = Math.ceil(this._maxSize / this.pageSize);
		page--;
		if(page < totalPages && page >= 0 && this._currentPage !== page){
			this._currentPage = page;
			// this._updateSelected();
			this.grid.setQuery(this.query);
			this.grid.resize();
		}
	},
	
	gotoFirstPage: function(){
		// summary:
		//		Go to the first page
		this.gotoPage(1);
	},
	
	gotoLastPage: function(){
		// summary:
		//		Go to the last page
		var totalPages = Math.ceil(this._maxSize / this.pageSize);
		this.gotoPage(totalPages);
	},
	
	changePageSize: function(size){
		// summary:
		//		Change size of items per page.
		//		This function will only be called by _Paginator
		if(typeof size == "string"){
			size = parseInt(size, 10);
		}
		var startIndex = this.pageSize * this._currentPage;
		dojo.forEach(this.paginators, function(f){
			f.currentPageSize = this.grid.rowsPerPage = this.pageSize = size;
			if(size >= this._maxSize){
				this.grid.rowsPerPage = this.defaultRows;
				this.grid.usingPagination = false;
			}else{
				this.grid.usingPagination = true;
			}
		}, this);
		var endIndex = startIndex + Math.min(this.pageSize, this._maxSize);
		if(endIndex > this._maxSize){
			this.gotoLastPage();
		}else{
			var cp = Math.ceil(startIndex / this.pageSize);
			if(cp !== this._currentPage){
				this.gotoPage(cp + 1);
			}else{
				this.grid._refresh(true);
			}
		}
		this.grid.resize();
	},
	
	showGotoPageButton: function(flag){
		// summary:
		//		For show/hide the go to page button dynamically
		// flag: boolean
		//		Show the go to page button when flag is true, otherwise hide it
		dojo.forEach(this.paginators, function(p){
			p._showGotoButton(flag);
		});
	},
	
	scrollToRow: function(inRowIndex){
		// summary:
		//		Override the grid.scrollToRow(), could jump to the right page
		//		and scroll to the specific row
		// inRowIndex: integer
		//		The row index
		var page = parseInt(inRowIndex / this.pageSize, 10),
			totalPages = Math.ceil(this._maxSize / this.pageSize);
		if(page > totalPages){
			return;
		}
		this.gotoPage(page + 1);
		var rowIdx = inRowIndex % this.pageSize;
		this.grid.setScrollTop(this.grid.scroller.findScrollTop(rowIdx) + 1);
	},
	
	getTotalRowCount: function(){
		// summary:
		//		Function for get total row count
		return this._maxSize;
	}
});

dojo.declare("dojox.grid.enhanced.plugins._ForcedPageStoreLayer", dojox.grid.enhanced.plugins._StoreLayer, {
	tags: ["presentation"],
	
	constructor: function(plugin){
		this._plugin = plugin;
	},
	
	_fetch: function(request){
		var self = this,
			plugin = self._plugin,
			grid = plugin.grid,
			scope = request.scope || dojo.global,
			onBegin = request.onBegin;
		
		request.start = plugin._currentPage * plugin.pageSize + request.start;
		self.startIdx = request.start;
		self.endIdx = request.start + plugin.pageSize - 1;
		if(onBegin && (plugin.showAll || dojo.every(plugin.paginators, function(p){
			return plugin.showAll = !p.sizeSwitch && !p.pageStepper && !p.gotoButton;
		}))){
			request.onBegin = function(size, req){
				plugin._maxSize = plugin.pageSize = size;
				self.startIdx = 0;
				self.endIdx = size - 1;
				dojo.forEach(plugin.paginators, function(f){
					f.update();
				});
				req.onBegin = onBegin;
				req.onBegin.call(scope, size, req);
			};
		}else if(onBegin){
			request.onBegin = function(size, req){
				req.start = 0;
				req.count = plugin.pageSize;
				plugin._maxSize = size;
				self.endIdx = self.endIdx >= size ? (size - 1) : self.endIdx;
				if(self.startIdx > size && size !== 0){
					grid._pending_requests[req.start] = false;
					plugin.gotoFirstPage();
				}
				dojo.forEach(plugin.paginators, function(f){
					f.update();
				});
				req.onBegin = onBegin;
				req.onBegin.call(scope, Math.min(plugin.pageSize, (size - self.startIdx)), req);
			};
		}
		return dojo.hitch(this._store, this._originFetch)(request);
	}
});

dojo.declare("dojox.grid.enhanced.plugins._Paginator", [dijit._Widget,dijit._Templated], {
	templatePath: dojo.moduleUrl("dojox.grid","enhanced/templates/Pagination.html"),
		
	// pagination bar position - "bottom"|"top"
	position: "bottom",
	
	// max data item size
	_maxItemSize: 0,
	
	// description message status params
	description: true,
	
	// fast step page status params
	pageStepper: true,
	
	maxPageStep: 7,
	
	// items per page size switch params
	sizeSwitch: true,
	
	pageSizes: ["10", "25", "50", "100", "All"],
	
	gotoButton: false,
	
	constructor: function(params){
		dojo.mixin(this, params);
		this.grid = this.plugin.grid;
		this.itemTitle = this.itemTitle ? this.itemTitle : this.plugin.nls.itemTitle;
		this.descTemplate = this.descTemplate ? this.descTemplate : this.plugin.nls.descTemplate;
	},
	
	postCreate: function(){
		this.inherited(arguments);
		this._setWidthValue();
		var self = this;
		var g = this.grid;
		this.plugin.connect(g, "_resize", dojo.hitch(this, "_resetGridHeight"));
		this._originalResize = dojo.hitch(g, "resize");
		g.resize = function(changeSize, resultSize){
			self._changeSize = g._pendingChangeSize = changeSize;
			self._resultSize = g._pendingResultSize = resultSize;
			g.sizeChange();
		};
		this._placeSelf();
	},
	
	destroy: function(){
		this.inherited(arguments);
		this.grid.focus.removeArea("pagination" + this.position.toLowerCase());
		if(this._gotoPageDialog){
			this._gotoPageDialog.destroy();
			dojo.destroy(this.gotoPageTd);
			delete this.gotoPageTd;
			delete this._gotoPageDialog;
		}
		this.grid.resize = this._originalResize;
		this.pageSizes = null;
	},
	
	update: function(){
		// summary:
		//		Function to update paging information and update
		//		pagination bar display.
		this.currentPageSize = this.plugin.pageSize;
		this._maxItemSize = this.plugin._maxSize;
		
		// update pagination bar display information
		this._updateDescription();
		this._updatePageStepper();
		this._updateSizeSwitch();
		this._updateGotoButton();
	},
	
	_setWidthValue: function(){
		var type = ["description", "sizeSwitch", "pageStepper"];
		var endWith = function(str1, str2){
			var reg = new RegExp(str2+"$");
			return reg.test(str1);
		};
		dojo.forEach(type, function(t){
			var width, flag = this[t];
			if(flag === undefined || typeof flag == "boolean"){
				return;
			}
			if(dojo.isString(flag)){
				width = endWith(flag, "px") || endWith(flag, "%") || endWith(flag, "em") ? flag : parseInt(flag, 10) > 0 ? parseInt(flag, 10) + "px" : null;
			}else if(typeof flag === "number" && flag > 0){
				width = flag + "px";
			}
			this[t] = width ? true : false;
			this[t + "Width"] = width;
		}, this);
	},
	
	_regFocusMgr: function(position){
		// summary:
		//		Function to register pagination bar to focus manager.
		this.grid.focus.addArea({
			name: "pagination" + position,
			onFocus: dojo.hitch(this, this._onFocusPaginator),
			onBlur: dojo.hitch(this, this._onBlurPaginator),
			onMove: dojo.hitch(this, this._moveFocus),
			onKeyDown: dojo.hitch(this, this._onKeyDown)
		});
		switch(position){
			case "top":
				this.grid.focus.placeArea("pagination" + position, "before", "header");
				break;
			case "bottom":
			default:
				this.grid.focus.placeArea("pagination" + position, "after", "content");
				break;
		}
	},
	
	_placeSelf: function(){
		// summary:
		//		Place pagination bar to a position.
		//		There are two options, top of the grid, bottom of the grid.
		var g = this.grid;
		var	position = dojo.trim(this.position.toLowerCase());
		switch(position){
			case "top":
				this.placeAt(g.viewsHeaderNode, "before");
				this._regFocusMgr("top");
				break;
			case "bottom":
			default:
				this.placeAt(g.viewsNode, "after");
				this._regFocusMgr("bottom");
				break;
		}
	},
	
	_resetGridHeight: function(changeSize, resultSize){
		// summary:
		//		Function of resize grid height to place this pagination bar.
		//		Since the grid would be able to add other element in its domNode, we have
		//		change the grid view size to place the pagination bar.
		//		This function will resize the grid viewsNode height, scorllboxNode height
		var g = this.grid;
		changeSize = changeSize || this._changeSize;
		resultSize = resultSize || this._resultSize;
		delete this._changeSize;
		delete this._resultSize;
		if(g._autoHeight){
			return;
		}
		var padBorder = g._getPadBorder().h;
		if(!this.plugin.gh){
			this.plugin.gh = dojo.contentBox(g.domNode).h + 2 * padBorder;
		}
		if(resultSize){
			changeSize = resultSize;
		}
		if(changeSize){
			this.plugin.gh = dojo.contentBox(g.domNode).h + 2 * padBorder;
		}
		var gh = this.plugin.gh,
			hh = g._getHeaderHeight(),
			ph = dojo.marginBox(this.domNode).h;
		ph = this.plugin.paginators[1] ? ph * 2 : ph;
		if(typeof g.autoHeight == "number"){
			var cgh = gh + ph - padBorder;
			dojo.style(g.domNode, "height", cgh + "px");
			dojo.style(g.viewsNode, "height", (cgh - ph - hh) + "px");
			
			this._styleMsgNode(hh, dojo.marginBox(g.viewsNode).w, cgh - ph - hh);
		}else{
			var h = gh - ph - hh - padBorder;
			dojo.style(g.viewsNode, "height", h + "px");
			var hasHScroller = dojo.some(g.views.views, function(v){
				return v.hasHScrollbar();
			});
			dojo.forEach(g.viewsNode.childNodes, function(c, idx){
				dojo.style(c, "height", h + "px");
			});
			dojo.forEach(g.views.views, function(v, idx){
				if(v.scrollboxNode){
					if(!v.hasHScrollbar() && hasHScroller){
						dojo.style(v.scrollboxNode, "height", (h - dojox.html.metrics.getScrollbar().h) + "px");
					}else{
						dojo.style(v.scrollboxNode, "height", h + "px");
					}
				}
			});
			this._styleMsgNode(hh, dojo.marginBox(g.viewsNode).w, h);
		}
	},
	
	_styleMsgNode: function(top, width, height){
		var messagesNode = this.grid.messagesNode;
		dojo.style(messagesNode, {"position": "absolute", "top": top + "px", "width": width + "px", "height": height + "px", "z-Index": "100"});
	},
	
	_updateDescription: function(){
		// summary:
		//		Update size information.
		var s = this.plugin.forcePageStoreLayer;
		if(this.description && this.descriptionDiv){
			this.descriptionDiv.innerHTML = this._maxItemSize > 0 ? dojo.string.substitute(this.descTemplate, [this.itemTitle, this._maxItemSize, s.startIdx + 1, s.endIdx + 1]) : "0 " + this.itemTitle;
		}
		if(this.descriptionWidth){
			dojo.style(this.descriptionTd, "width", this.descriptionWidth);
		}
	},
	
	_updateSizeSwitch: function(){
		// summary:
		//		Update "items per page" information.
		if(!this.sizeSwitchTd){
			return;
		}
		if(!this.sizeSwitch || this._maxItemSize <= 0){
			dojo.style(this.sizeSwitchTd, "display", "none");
			return;
		}else{
			dojo.style(this.sizeSwitchTd, "display", "");
		}
		if(this.initializedSizeNode && !this.pageSizeValue){
			// do not update page size if page size was not changed
			return;
		}
		if(this.sizeSwitchTd.childNodes.length < 1){
			this._createSizeSwitchNodes();
		}
		this._updateSwitchNodeClass();
		
		// move focus to next activable node
		this._moveToNextActivableNode(this._getAllPageSizeNodes(), this.pageSizeValue);
		this.pageSizeValue = null;
	},
	
	_createSizeSwitchNodes: function(){
		// summary:
		//		The function to create the size switch nodes
		var node = null;
		if(!this.pageSizes || this.pageSizes.length < 1){
			return;
		}
		dojo.forEach(this.pageSizes, function(size){
			// create page size switch node
			size = dojo.trim(size);
			var labelValue = size.toLowerCase() == "all" ? this.plugin.nls.allItemsLabelTemplate : dojo.string.substitute(this.plugin.nls.pageSizeLabelTemplate, [size]);
			node = dojo.create("span", {innerHTML: size, title: labelValue, value: size, tabindex: 0}, this.sizeSwitchTd, "last");
			// for accessibility
			dijit.setWaiState(node, "label", labelValue);
			// connect event
			this.plugin.connect(node, "onclick", dojo.hitch(this, "_onSwitchPageSize"));
			this.plugin.connect(node, "onmouseover", function(e){
				dojo.addClass(e.target, "dojoxGridPageTextHover");
			});
			this.plugin.connect(node, "onmouseout", function(e){
				dojo.removeClass(e.target, "dojoxGridPageTextHover");
			});
			// create a separation node
			node = dojo.create("span", {innerHTML: "|"}, this.sizeSwitchTd, "last");
			dojo.addClass(node, "dojoxGridSeparator");
		}, this);
		// delete last separation node
		dojo.destroy(node);
		this.initializedSizeNode = true;
		if(this.sizeSwitchWidth){
			dojo.style(this.sizeSwitchTd, "width", this.sizeSwitchWidth);
		}
	},
	
	_updateSwitchNodeClass: function(){
		// summary:
		//		Update the switch nodes style
		var size = null;
		var hasActivedNode = false;
		var styleNode = function(node, status){
			if(status){
				dojo.addClass(node, "dojoxGridActivedSwitch");
				dojo.attr(node, "tabindex", "-1");
				hasActivedNode = true;
			}else{
				dojo.addClass(node, "dojoxGridInactiveSwitch");
				dojo.attr(node, "tabindex", "0");
			}
		};
		dojo.forEach(this.sizeSwitchTd.childNodes, function(node){
			if(node.value){
				size = node.value;
				dojo.removeClass(node);
				if(this.pageSizeValue){
					styleNode(node, size === this.pageSizeValue && !hasActivedNode);
				}else{
					if(size.toLowerCase() == "all"){
						size = this._maxItemSize;
					}
					styleNode(node, this.currentPageSize === parseInt(size, 10) && !hasActivedNode);
				}
			}
		}, this);
	},
	
	_updatePageStepper: function(){
		// summary:
		//		Update the page step nodes
		if(!this.pageStepperTd){
			return;
		}
		if(!this.pageStepper || this._maxItemSize <= 0){
			dojo.style(this.pageStepperTd, "display", "none");
			return;
		}else{
			dojo.style(this.pageStepperTd, "display", "");
		}
		if(this.pageStepperDiv.childNodes.length < 1){
			this._createPageStepNodes();
			this._createWardBtns();
		}else{
			this._resetPageStepNodes();
		}
		this._updatePageStepNodeClass();
		
		this._moveToNextActivableNode(this._getAllPageStepNodes(), this.pageStepValue);
		this.pageStepValue = null;
	},
	
	_createPageStepNodes: function(){
		// summary:
		//		Create the page step nodes if they do not exist
		var startPage = this._getStartPage(),
			stepSize = this._getStepPageSize(),
			label = "",
			node = null;
		for(var i = startPage; i < this.maxPageStep + 1; i++){
			label = dojo.string.substitute(this.plugin.nls.pageStepLabelTemplate, [i + ""]);
			node = dojo.create("div", {innerHTML: i, value: i, title: label, tabindex: i < startPage + stepSize ? 0 : -1}, this.pageStepperDiv, "last");
			dijit.setWaiState(node, "label", label);
			// connect event
			this.plugin.connect(node, "onclick", dojo.hitch(this, "_onPageStep"));
			this.plugin.connect(node, "onmouseover", function(e){
				dojo.addClass(e.target, "dojoxGridPageTextHover");
			});
			this.plugin.connect(node, "onmouseout", function(e){
				dojo.removeClass(e.target, "dojoxGridPageTextHover");
			});
			dojo.style(node, "display", i < startPage + stepSize ? "block" : "none");
		}
		if(this.pageStepperWidth){
			dojo.style(this.pageStepperTd, "width", this.pageStepperWidth);
		}
	},
	
	_createWardBtns: function(){
		// summary:
		//		Create the previous/next/first/last button
		var self = this;
		var highContrastLabel = {prevPage: "&#60;", firstPage: "&#171;", nextPage: "&#62;", lastPage: "&#187;"};
		var createWardBtn = function(value, label, position){
			var node = dojo.create("div", {value: value, title: label, tabindex: 1}, self.pageStepperDiv, position);
			self.plugin.connect(node, "onclick", dojo.hitch(self, "_onPageStep"));
			dijit.setWaiState(node, "label", label);
			// for high contrast
			var highConrastNode = dojo.create("span", {value: value, title: label, innerHTML: highContrastLabel[value]}, node, position);
			dojo.addClass(highConrastNode, "dojoxGridWardButtonInner");
		};
		createWardBtn("prevPage", this.plugin.nls.prevTip, "first");
		createWardBtn("firstPage", this.plugin.nls.firstTip, "first");
		createWardBtn("nextPage", this.plugin.nls.nextTip, "last");
		createWardBtn("lastPage", this.plugin.nls.lastTip, "last");
	},
	
	_resetPageStepNodes: function(){
		// summary:
		//		The page step nodes might be changed when fetch data, we need to
		//		update/reset them
		var startPage = this._getStartPage(),
			stepSize = this._getStepPageSize(),
			stepNodes = this.pageStepperDiv.childNodes,
			node = null;
		for(var i = startPage, j = 2; j < stepNodes.length - 2; j++, i++){
			node = stepNodes[j];
			if(i < startPage + stepSize){
				dojo.attr(node, "innerHTML", i);
				dojo.attr(node, "value", i);
				dojo.style(node, "display", "block");
				dijit.setWaiState(node, "label", dojo.string.substitute(this.plugin.nls.pageStepLabelTemplate, [i + ""]));
			}else{
				dojo.style(node, "display", "none");
			}
		}
	},
	
	_updatePageStepNodeClass: function(){
		// summary:
		//		Update the style of the page step nodes
		var value = null,
			curPage = this._getCurrentPageNo(),
			pageCount = this._getPageCount(),
			visibleNodeLen = 0;
			
		var updateClass = function(node, isWardBtn, status){
			var value = node.value,
				enableClass = isWardBtn ? "dojoxGrid" + value + "Btn" : "dojoxGridInactived",
				disableClass = isWardBtn ? "dojoxGrid" + value + "BtnDisable" : "dojoxGridActived";
			if(status){
				dojo.addClass(node, disableClass);
				dojo.attr(node, "tabindex", "-1");
			}else{
				dojo.addClass(node, enableClass);
				dojo.attr(node, "tabindex", "0");
			}
		};
		dojo.forEach(this.pageStepperDiv.childNodes, function(node){
			dojo.removeClass(node);
			if(isNaN(parseInt(node.value, 10))){
				dojo.addClass(node, "dojoxGridWardButton");
				var disablePageNum = node.value == "prevPage" || node.value == "firstPage" ? 1 : pageCount;
				updateClass(node, true, (curPage == disablePageNum));
			}else{
				value = parseInt(node.value, 10);
				updateClass(node, false, (value === curPage || dojo.style(node, "display") === "none"));
			}
		}, this);
	},
	
	_showGotoButton: function(flag){
		this.gotoButton = flag;
		this._updateGotoButton();
	},
	
	_updateGotoButton: function(){
		// summary:
		//		Create/destroy the goto page button
		if(!this.gotoButton){
			if(this.gotoPageTd){
				if(this._gotoPageDialog){
					this._gotoPageDialog.destroy();
				}
				dojo.destroy(this.gotoPageDiv);
				dojo.destroy(this.gotoPageTd);
				delete this.gotoPageDiv;
				delete this.gotoPageTd;
			}
			return;
		}
		if(!this.gotoPageTd){
			this._createGotoNode();
		}
		dojo.toggleClass(this.gotoPageDiv, "dojoxGridPaginatorGotoDivDisabled", this.plugin.pageSize >= this.plugin._maxSize);
	},
	
	_createGotoNode: function(){
		// summary:
		//		Create the goto page button
		this.gotoPageTd = dojo.create("td", {}, dojo.query("tr", this.domNode)[0], "last");
		dojo.addClass(this.gotoPageTd, "dojoxGridPaginatorGotoTd");
		this.gotoPageDiv = dojo.create("div", {tabindex: "0", title: this.plugin.nls.gotoButtonTitle}, this.gotoPageTd, "first");
		dojo.addClass(this.gotoPageDiv, "dojoxGridPaginatorGotoDiv");
		this.plugin.connect(this.gotoPageDiv, "onclick", dojo.hitch(this, "_openGotopageDialog"));
		// for high contrast
		var highConrastNode = dojo.create("span", {title: this.plugin.nls.gotoButtonTitle, innerHTML: "&#8869;"}, this.gotoPageDiv, "last");
		dojo.addClass(highConrastNode, "dojoxGridWardButtonInner");
	},
	
	_openGotopageDialog: function(event){
		// summary:
		//		Show the goto page dialog
		if(!this._gotoPageDialog){
			this._gotoPageDialog = new dojox.grid.enhanced.plugins.pagination._GotoPageDialog(this.plugin);
		}
		// focus
		if(!this._currentFocusNode){
			this.grid.focus.focusArea("pagination" + this.position, event);
		}else{
			this._currentFocusNode = this.gotoPageDiv;
		}
		if(this.focusArea != "pageStep"){
			this.focusArea = "pageStep";
		}
		this._gotoPageDialog.updatePageCount();
		this._gotoPageDialog.showDialog();
	},
	
	// ===== focus handlers ===== //
	_onFocusPaginator: function(event, step){
		// summary:
		//		Focus handler
		if(!this._currentFocusNode){
			if(step > 0){
				return this._onFocusPageSizeNode(event) ? true : this._onFocusPageStepNode(event);
			}else if(step < 0){
				return this._onFocusPageStepNode(event) ? true : this._onFocusPageSizeNode(event);
			}else{
				return false;
			}
		}else{
			if(step > 0){
				return this.focusArea === "pageSize" ? this._onFocusPageStepNode(event) : false;
			}else if(step < 0){
				return this.focusArea === "pageStep" ? this._onFocusPageSizeNode(event) : false;
			}else{
				return false;
			}
		}
	},
	
	_onFocusPageSizeNode: function(event){
		// summary:
		//		Focus the page size area, if there is no focusable node, return false
		var pageSizeNodes = this._getPageSizeActivableNodes();
		if(event && event.type !== "click"){
			if(pageSizeNodes[0]){
				dijit.focus(pageSizeNodes[0]);
				this._currentFocusNode = pageSizeNodes[0];
				this.focusArea = "pageSize";
				this.plugin._stopEvent(event);
				return true;
			}else{
				return false;
			}
		}
		if(event && event.type == "click"){
			if(dojo.indexOf(this._getPageSizeActivableNodes(), event.target) > -1){
				this.focusArea = "pageSize";
				this.plugin._stopEvent(event);
				return true;
			}
		}
		return false;
	},
	
	_onFocusPageStepNode: function(event){
		// summary:
		//		Focus the page step area, if there is no focusable node, return false
		var pageStepNodes = this._getPageStepActivableNodes();
		if(event && event.type !== "click"){
			if(pageStepNodes[0]){
				dijit.focus(pageStepNodes[0]);
				this._currentFocusNode = pageStepNodes[0];
				this.focusArea = "pageStep";
				this.plugin._stopEvent(event);
				return true;
			}else if(this.gotoPageDiv){
				dijit.focus(this.gotoPageDiv);
				this._currentFocusNode = this.gotoPageDiv;
				this.focusArea = "pageStep";
				this.plugin._stopEvent(event);
				return true;
			}else{
				return false;
			}
		}
		if(event && event.type == "click"){
			if(dojo.indexOf(this._getPageStepActivableNodes(), event.target) > -1){
				this.focusArea = "pageStep";
				this.plugin._stopEvent(event);
				return true;
			}else if(event.target == this.gotoPageDiv){
				dijit.focus(this.gotoPageDiv);
				this._currentFocusNode = this.gotoPageDiv;
				this.focusArea = "pageStep";
				this.plugin._stopEvent(event);
				return true;
			}
		}
		return false;
	},
	
	_onFocusGotoPageNode: function(event){
		// summary:
		//		Focus the goto page button, if there is no focusable node, return false
		if(!this.gotoButton || !this.gotoPageTd){
			return false;
		}
		if(event && event.type !== "click" || (event.type == "click" && event.target == this.gotoPageDiv)){
			dijit.focus(this.gotoPageDiv);
			this._currentFocusNode = this.gotoPageDiv;
			this.focusArea = "gotoButton";
			this.plugin._stopEvent(event);
			return true;
		}
		return true;
	},
	
	_onBlurPaginator: function(event, step){
		var pageSizeNodes = this._getPageSizeActivableNodes(),
			pageStepNodes = this._getPageStepActivableNodes();
		
		if(step > 0 && this.focusArea === "pageSize" && (pageStepNodes.length > 1 || this.gotoButton)){
			return false;
		}else if(step < 0 && this.focusArea === "pageStep" && pageSizeNodes.length > 1){
			return false;
		}
		this._currentFocusNode = null;
		this.focusArea = null;
		return true;
	},
	
	_onKeyDown: function(event, isBubble){
		// summary:
		//		Focus navigation
		if(isBubble){
			return;
		}
		if(event.altKey || event.metaKey){
			return;
		}
		var dk = dojo.keys;
		if(event.keyCode === dk.ENTER || event.keyCode === dk.SPACE){
			if(dojo.indexOf(this._getPageStepActivableNodes(), this._currentFocusNode) > -1){
				this._onPageStep(event);
			}else if(dojo.indexOf(this._getPageSizeActivableNodes(), this._currentFocusNode) > -1){
				this._onSwitchPageSize(event);
			}else if(this._currentFocusNode === this.gotoPageDiv){
				this._openGotopageDialog(event);
			}
		}
		this.plugin._stopEvent(event);
	},
	
	_moveFocus: function(rowDelta, colDelta, evt){
		// summary:
		//		Move focus according row delta&column delta
		var nodes;
		if(this.focusArea == "pageSize"){
			nodes = this._getPageSizeActivableNodes();
		}else if(this.focusArea == "pageStep"){
			nodes = this._getPageStepActivableNodes();
			if(this.gotoPageDiv){
				nodes.push(this.gotoPageDiv);
			}
		}
		if(nodes.length < 1){
			return;
		}
		var currentIdx = dojo.indexOf(nodes, this._currentFocusNode);
		var focusIdx = currentIdx + colDelta;
		if(focusIdx >= 0 && focusIdx < nodes.length){
			dijit.focus(nodes[focusIdx]);
			this._currentFocusNode = nodes[focusIdx];
		}
		this.plugin._stopEvent(evt);
	},
	
	_getPageSizeActivableNodes: function(){
		return dojo.query("span[tabindex='0']", this.sizeSwitchTd);
	},
	
	_getPageStepActivableNodes: function(){
		return (dojo.query("div[tabindex='0']", this.pageStepperDiv));
	},
	
	_getAllPageSizeNodes: function(){
		var nodeList = [];
		dojo.forEach(this.sizeSwitchTd.childNodes, function(node){
			if(node.value){
				nodeList.push(node);
			}
		});
		return nodeList;
	},
	
	_getAllPageStepNodes: function(){
		var nodeList = [];
		for(var i = 0, len = this.pageStepperDiv.childNodes.length; i < len; i++){
			nodeList.push(this.pageStepperDiv.childNodes[i]);
		}
		return nodeList;
	},
	
	_moveToNextActivableNode: function(nodeList, curNodeValue){
		// summary:
		//		Need to move the focus to next node since current node is inactive and unfocusable
		if(!curNodeValue){
			return;
		}
		if(nodeList.length < 2){
			this.grid.focus.tab(1);
		}
		var nl = [],
			node = null,
			index = 0;
		dojo.forEach(nodeList, function(n){
			if(n.value == curNodeValue){
				nl.push(n);
				node = n;
			}else if(dojo.attr(n, "tabindex") == "0"){
				nl.push(n);
			}
		});
		if(nl.length < 2){
			this.grid.focus.tab(1);
		}
		index = dojo.indexOf(nl, node);
		if(dojo.attr(node, "tabindex") != "0"){
			node = nl[index + 1] ? nl[index + 1] : nl[index - 1];
		}
		dijit.focus(node);
		this._currentFocusNode = node;
	},
	
	// ===== pagination events handlers ===== //
	_onSwitchPageSize: function(/*Event*/e){
		// summary:
		//		The handler of switch the page size
		var size = this.pageSizeValue = e.target.value;
		if(!size){
			return;
		}
		if(dojo.trim(size.toLowerCase()) == "all"){
			size = this._maxItemSize;
			showAll = true;
		}
		this.plugin.grid.usingPagination = !this.plugin.showAll;
		
		size = parseInt(size, 10);
		if(isNaN(size) || size <= 0/* || size == this.currentPageSize*/){
			return;
		}
		
		if(!this._currentFocusNode){
			this.grid.focus.currentArea("pagination" + this.position);
		}
		if(this.focusArea != "pageSize"){
			this.focusArea = "pageSize";
		}
		this.plugin.changePageSize(size);
	},
	
	_onPageStep: function(/*Event*/e){
		// summary:
		//		The handler jump page event
		var p = this.plugin,
			value = this.pageStepValue = e.target.value;
		
		if(!this._currentFocusNode){
			this.grid.focus.currentArea("pagination" + this.position);
		}
		if(this.focusArea != "pageStep"){
			this.focusArea = "pageStep";
		}
		if(!isNaN(parseInt(value, 10))){
			p.gotoPage(value);
		}else{
			switch(e.target.value){
				case "prevPage":
					p.prevPage();
					break;
				case "nextPage":
					p.nextPage();
					break;
				case "firstPage":
					p.gotoFirstPage();
					break;
				case "lastPage":
					p.gotoLastPage();
			}
		}
	},
	
	// ===== information getters ===== //
	_getCurrentPageNo: function(){
		return this.plugin._currentPage + 1;
	},
	
	_getPageCount: function(){
		if(!this._maxItemSize || !this.currentPageSize){
			return 0;
		}
		return Math.ceil(this._maxItemSize / this.currentPageSize);
	},
	
	_getStartPage: function(){
		var cp = this._getCurrentPageNo();
		var ms = parseInt(this.maxPageStep / 2, 10);
		var pc = this._getPageCount();
		if(cp < ms || (cp - ms) < 1){
			return 1;
		}else if(pc <= this.maxPageStep){
			return 1;
		}else{
			if(pc - cp < ms && cp - this.maxPageStep >= 0){
				return pc - this.maxPageStep + 1;
			}else{
				return (cp - ms);
			}
		}
	},
	
	_getStepPageSize: function(){
		var sp = this._getStartPage();
		var count = this._getPageCount();
		if((sp + this.maxPageStep) > count){
			return count - sp + 1;
		}else{
			return this.maxPageStep;
		}
	}

});

dojo.declare("dojox.grid.enhanced.plugins.pagination._GotoPageDialog", null, {
	
	pageCount: 0,
	
	constructor: function(plugin){
		this.plugin = plugin;
		this.pageCount = this.plugin.paginators[0]._getPageCount();
		this._dialogNode = dojo.create("div", {}, dojo.body(), "last");
		this._gotoPageDialog = new dojox.grid.enhanced.plugins.Dialog({
			"refNode": plugin.grid.domNode,
			"title": this.plugin.nls.dialogTitle
		}, this._dialogNode);
		this._createDialogContent();
		this._gotoPageDialog.startup();
	},
	
	_createDialogContent: function(){
		// summary:
		//		Create the dialog content
		this._specifyNode = dojo.create("div", {innerHTML: this.plugin.nls.dialogIndication}, this._gotoPageDialog.containerNode, "last");
		
		this._pageInputDiv = dojo.create("div", {}, this._gotoPageDialog.containerNode, "last");
		this._pageTextBox = new dijit.form.NumberTextBox();
		this._pageTextBox.constraints = {fractional:false, min:1, max:this.pageCount};
		this.plugin.connect(this._pageTextBox.textbox, "onkeyup", dojo.hitch(this, "_setConfirmBtnState"));
		
		this._pageInputDiv.appendChild(this._pageTextBox.domNode);
		this._pageLabel = dojo.create("label", {innerHTML: dojo.string.substitute(this.plugin.nls.pageCountIndication, [this.pageCount])}, this._pageInputDiv, "last");
		
		this._buttonDiv = dojo.create("div", {}, this._gotoPageDialog.containerNode, "last");
		this._confirmBtn = new dijit.form.Button({label: this.plugin.nls.dialogConfirm, onClick: dojo.hitch(this, this._onConfirm)});
		this._confirmBtn.set("disabled", true);
		
		this._cancelBtn = new dijit.form.Button({label: this.plugin.nls.dialogCancel, onClick: dojo.hitch(this, this._onCancel)});
		this._buttonDiv.appendChild(this._confirmBtn.domNode);
		this._buttonDiv.appendChild(this._cancelBtn.domNode);
		this._styleContent();
		this._gotoPageDialog.onCancel = dojo.hitch(this, this._onCancel);
		this.plugin.connect(this._gotoPageDialog, "_onKey", dojo.hitch(this, "_onKeyDown"));
	},
	
	_styleContent: function(){
		dojo.addClass(this._specifyNode, "dojoxGridDialogMargin");
		dojo.addClass(this._pageInputDiv, "dojoxGridDialogMargin");
		dojo.addClass(this._buttonDiv, "dojoxGridDialogButton");
		dojo.style(this._pageTextBox.domNode, "width", "50px");
	},
	
	updatePageCount: function(){
		this.pageCount = this.plugin.paginators[0]._getPageCount();
		this._pageTextBox.constraints = {fractional:false, min:1, max:this.pageCount};
		dojo.attr(this._pageLabel, "innerHTML", dojo.string.substitute(this.plugin.nls.pageCountIndication, [this.pageCount]));
	},
	
	showDialog: function(){
		this._gotoPageDialog.show();
	},
	
	_onConfirm: function(event){
		// summary:
		//		Jump to the given page
		if(this._pageTextBox.isValid() && this._pageTextBox.getDisplayedValue() !== ""){
			this.plugin.gotoPage(this._pageTextBox.parse(this._pageTextBox.getDisplayedValue()));
			this._gotoPageDialog.hide();
			this._pageTextBox.reset();
		}
		this.plugin._stopEvent(event);
	},
	
	_onCancel: function(event){
		// summary:
		//		Cancel action and hide the dialog
		this._pageTextBox.reset();
		this._gotoPageDialog.hide();
		this.plugin._stopEvent(event);
	},
	
	_onKeyDown: function(event){
		if(event.altKey || event.metaKey){
			return;
		}
		var dk = dojo.keys;
		if(event.keyCode === dk.ENTER){
			this._onConfirm(event);
		}
	},
	
	_setConfirmBtnState: function(){
		if(this._pageTextBox.isValid() && this._pageTextBox.getDisplayedValue() !== ""){
			this._confirmBtn.set("disabled", false);
		}else{
			this._confirmBtn.set("disabled", true);
		}
	},
	
	destroy: function(){
		this._pageTextBox.destroy();
		this._confirmBtn.destroy();
		this._cancelBtn.destroy();
		this._gotoPageDialog.destroy();
		
		dojo.destroy(this._specifyNode);
		dojo.destroy(this._pageInputDiv);
		dojo.destroy(this._pageLabel);
		dojo.destroy(this._buttonDiv);
		dojo.destroy(this._dialogNode);
	}
});

dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Pagination/*name:'pagination'*/);
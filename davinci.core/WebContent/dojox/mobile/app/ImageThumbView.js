dojo.provide("dojox.mobile.app.ImageThumbView");
dojo.experimental("dojox.mobile.app.ImageThumbView");

dojo.require("dijit._Widget");
dojo.require("dojo.string");

dojo.declare("dojox.mobile.app.ImageThumbView", dijit._Widget, {
	// summary:
	//		An image thumbnail gallery

	// items: Array
	//		The data items from which the image urls are retrieved.
	//		If an item is a string, it is expected to be a URL. Otherwise
	//		by default it is expected to have a 'url' member.  This can
	//		be configured using the 'urlParam' attribute on this widget.
	items: null,

	// urlParam: String
	//		The paramter name used to retrieve an image url from a JSON object
	urlParam: "url",

	itemTemplate: '<div class="mblThumbInner">' +
				'<div class="mblThumbOverlay"></div>' +
				'<div class="mblThumbMask">' +
					'<div class="mblThumbSrc" style="background-image:url(${url})"></div>' +
				'</div>' +
			'</div>',

	minPadding: 5,

	maxPerRow: 3,

	baseClass: "mblImageThumbView",

	selectedIndex: -1,

	cache: null,

	postCreate: function(){
		this.inherited(arguments);
		var _this = this;

		var hoverCls = "mblThumbHover";

		this.addThumb = dojo.hitch(this, this.addThumb);
		this.handleImgLoad = dojo.hitch(this, this.handleImgLoad);

		this._onLoadImages = {};

		this.cache = [];
		this.visibleImages = [];

		this.connect(this.domNode, "onclick", function(event){
			var itemNode = _this._getItemNodeFromEvent(event);

			if(itemNode){
				_this.onSelect(itemNode._item, itemNode._index, _this.items);
				dojo.query(".selected", this.domNode).removeClass("selected");
				dojo.addClass(itemNode, "selected");
			}
		});

		this.resize();
		this.render();
	},

	onSelect: function(item, index, items){
		// summary:
		//		Dummy function that is triggered when an image is selected.
	},

	_setItemsAttr: function(items){
		this.items = items || [];

		this.render();
	},

	_getItemNode: function(node){
		while(node && !dojo.hasClass(node, "mblThumb") && node != this.domNode){
			node = node.parentNode;
		}

		return (node == this.domNode) ? null : node;
	},

	_getItemNodeFromEvent: function(event){
		if(event.touches && event.touches.length > 0){
			event = event.touches[0];
		}
		return this._getItemNode(event.target);
	},

	resize: function(){
		this._thumbSize = null;

		this._size = dojo.marginBox(this.domNode);

		this.render();
	},

	render: function(){
		var i;
		var url;
		var item;

		var thumb;
		while(this.visibleImages.length > 0){
			thumb = this.visibleImages.pop();
			this.cache.push(thumb);

			dojo.addClass(thumb, "hidden");
			thumb._cached = true;
		}
		if(!this.items || this.items.length == 0){
			//dojo.empty(this.domNode);
			return;
		}


		for(i = 0; i < this.items.length; i++){
			item = this.items[i];
			url = (dojo.isString(item) ? item : item[this.urlParam]);

			this.addThumb(item, url, i);
		}

		if(!this._thumbSize){
			return;
		}

		var column = 0;
		var row = -1;

		var totalThumbWidth = this._thumbSize.w + (this.padding * 2);
		var totalThumbHeight = this._thumbSize.h + (this.padding * 2);

		var nodes = this.thumbNodes =
			dojo.query(".mblThumb", this.domNode);

		var pos = 0;
		for(i = 0; i < nodes.length; i++){
			if(nodes[i]._cached){
				continue;
			}

			if(pos % this.maxPerRow == 0){
				row ++;
			}
			column = pos % this.maxPerRow;

			this.place(
				nodes[i],
				(column * totalThumbWidth) + this.padding,	// x position
				(row * totalThumbHeight) + this.padding		// y position
			);

			if(!nodes[i]._loading){
				dojo.removeClass(nodes[i], "hidden");
			}

			if(pos == this.selectedIndex){
				dojo[pos == this.selectedIndex ? "addClass" : "removeClass"]
					(nodes[i], "selected");
			}
			pos++;
		}

		var numRows = Math.ceil(pos / this.maxPerRow);
		
		if(this._numRows != numRows){
			this._numRows = numRows;
			dojo.style(this.domNode, "height",
					(numRows * (this._thumbSize.h + this.padding * 2)) + "px");
		}

	},

	addThumb: function(item, url, index){

		var thumbDiv;
		if(this.cache.length > 0){
			// Reuse a previously created node if possible
			thumbDiv = this.cache.pop();
		}else{
			// Create a new thumb
			thumbDiv = dojo.create("div", {
				"class": "mblThumb hidden",
				innerHTML: dojo.string.substitute(this.itemTemplate, {
					url: url
				}, null, this)
			}, this.domNode);
		}
		dojo.addClass(thumbDiv, "hidden");
		var loader = dojo.create("img",{});
		loader._thumbDiv = thumbDiv;
		loader._conn = dojo.connect(loader, "onload", this.handleImgLoad);
		loader._url = url;
		thumbDiv._loading = true;

		this._onLoadImages[url] = loader;
		loader.src = url;

		this.visibleImages.push(thumbDiv);

		thumbDiv._index = index;
		thumbDiv._item = item;
		thumbDiv._url = url;
		thumbDiv._cached = false;

		if(!this._thumbSize){
			this._thumbSize = dojo.marginBox(thumbDiv);
			this.calcPadding();
		}
	},

	handleImgLoad: function(event){
		var img = event.target;
		dojo.disconnect(img._conn);
		dojo.removeClass(img._thumbDiv, "hidden");
		img._thumbDiv._loading = false;

		dojo.query(".mblThumbSrc", img._thumbDiv)
				.style("backgroundImage", "url(" + img._url + ")");

		delete this._onLoadImages[img._url];
	},

	calcPadding: function(){
		var width = this._size.w;

		var thumbWidth = this._thumbSize.w;

		var imgBounds = thumbWidth + this.minPadding;

		this.maxPerRow = Math.floor(width / imgBounds);

		this.padding = (width - (thumbWidth * this.maxPerRow)) / (this.maxPerRow * 2);
	},

	place: function(node, x, y){
		// TODO: replace this with webkit transforms
		
		
		dojo.style(node, {
			"-webkit-transform" :"translate(" + x + "px," + y + "px)"
		});
//		dojo.style(node, {
//			top: y + "px",
//			left: x + "px",
//			visibility: "visible"
//		});
	}

});
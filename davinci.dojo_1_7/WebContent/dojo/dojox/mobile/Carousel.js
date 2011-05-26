define(["dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./PageIndicator","./SwapView"], function(WidgetBase,Container,Contained,PageIndicator,SwapView){
	// module:
	//		dojox/mobile/Carousel
	// summary:
	//		TODOC

	dojo.experimental("dojox.mobile.Carousel");

	return dojo.declare("dojox.mobile.Carousel", [dijit._WidgetBase, dijit._Container, dijit._Contained], {
		numVisible: 3, // the number of visible items
		title: "",
		pageIndicator: true,
		navButton: false,
		height: "300px",
		store: null,
		query: null,
		queryOptions: null,

		buildRendering: function(){
			this.inherited(arguments);
			this.domNode.className = "mblCarousel";
			var h;
			if(this.height === "inherit"){
				if(this.domNode.offsetParent){
					h = this.domNode.offsetParent.offsetHeight + "px";
				}
			}else if(this.height){
				h = this.height;
			}
			this.domNode.style.height = h;
			dojo.setSelectable(this.domNode, false);
			this.headerNode = dojo.create("DIV", {className:"mblCarouselHeaderBar"}, this.domNode);

			if(this.navButton){
				this.btnContainerNode = dojo.create("DIV", {
					className: "mblCarouselBtnContainer"
				}, this.headerNode);
				dojo.style(this.btnContainerNode, "float", "right"); // workaround for webkit rendering problem
				this.prevBtnNode = dojo.create("BUTTON", {
					className: "mblCarouselBtn",
					title: "Previous",
					innerHTML: "&lt;"
				}, this.btnContainerNode);
				this.nextBtnNode = dojo.create("BUTTON", {
					className: "mblCarouselBtn",
					title: "Next",
					innerHTML: "&gt;"
				}, this.btnContainerNode);
				this.connect(this.prevBtnNode, "onclick", "onPrevBtnClick");
				this.connect(this.nextBtnNode, "onclick", "onNextBtnClick");
			}

			if(this.pageIndicator){
				if(!this.title){
					this.title = "&nbsp;";
				}
				this.piw = new dojox.mobile.PageIndicator();
				dojo.style(this.piw, "float", "right"); // workaround for webkit rendering problem
				this.headerNode.appendChild(this.piw.domNode);
			}

			this.titleNode = dojo.create("DIV", {
				className: "mblCarouselTitle"
			}, this.headerNode);

			this.containerNode = dojo.create("DIV", {className:"mblCarouselPages"}, this.domNode);
			dojo.subscribe("/dojox/mobile/viewChanged", this, "handleViewChanged");
		},

		startup: function(){
			if(this._started){ return; }
			if(this.store){
				var store = this.store;
				this.store = null;
				this.setStore(store, this.query, this.queryOptions);
			}
			this.inherited(arguments);
		},

		setStore: function(store, query, queryOptions){
			if(store === this.store){ return; }
			this.store = store;
			this.query = query;
			this.queryOptions = queryOptions;
			this.refresh();
		},

		refresh: function(){
			if(!this.store){ return; }
			this.store.fetch({
				query: this.query,
				queryOptions: this.queryOptions,
				onComplete: dojo.hitch(this, "generate"),
				onError: dojo.hitch(this, "onError")
			});
		},

		generate: function(/*Array*/items, /*Object*/ dataObject){
			dojo.forEach(this.getChildren(), function(child){
				if(child instanceof dojox.mobile.SwapView){
					child.destroyRecursive();
				}
			});
			this.items = items;
			this.swapViews = [];
			this.images = [];
			var nPages = Math.ceil(items.length / this.numVisible);
			var h = this.domNode.offsetHeight - this.headerNode.offsetHeight;
			for(var i = 0; i < nPages; i++){
				var w = new dojox.mobile.SwapView({height:h+"px"});
				this.addChild(w);
				this.swapViews.push(w);
				w._carouselImages = [];
				if(i === 0 && this.piw){
					this.piw.refId = w.id;
				}
				for(var j = 0; j < this.numVisible; j++){
					var idx = i * this.numVisible + j;
					var item = idx < items.length ? items[idx] :
						{src:dojo.moduleUrl("dojo", "resources/blank.gif"), height:"1px"};
					var disp = w.domNode.style.display;
					w.domNode.style.display = ""; // need to be visible during the size calculation
					var box = this.createBox(item, h);
					w.containerNode.appendChild(box);
					box.appendChild(this.createHeaderText(item));
					var img = this.createContent(item, idx);
					box.appendChild(img);
					box.appendChild(this.createFooterText(item));
					this.resizeContent(item, box, img);
					w.domNode.style.display = disp;

					if(item.height !== "1px"){
						this.images.push(img);
						w._carouselImages.push(img);
					}
				}
			}
			if(this.swapViews[0]){
				this.loadImages(this.swapViews[0]);
			}
			if(this.swapViews[1]){
				this.loadImages(this.swapViews[1]); // pre-fetch the next view images
			}
			this.currentView = this.swapViews[0];
			if(this.piw){
				this.piw.reset();
			}
		},

		createBox: function(item, h){
			var width = item.width || (90/this.numVisible + "%");
			var height = item.height || h + "px";
			var m = dojo.isIE ? 5/this.numVisible-1 : 5/this.numVisible;
			var margin = item.margin || (m + "%");
			var box = dojo.create("DIV", {
				className: "mblCarouselBox"
			});
			dojo.style(box, {
				margin: "0px " + margin,
				width: width,
				height: height
			});
			return box;
		},

		createHeaderText: function(item){
			this.headerTextNode = dojo.create("DIV", {
				className: "mblCarouselImgHeaderText",
				innerHTML: item.headerText ? item.headerText : "&nbsp;"
			});
			return this.headerTextNode;
		},

		createContent: function(item, idx){
			var props = {
				alt: item.alt || "",
				tabIndex: "0", // for keyboard navigation on a desktop browser
				className: "mblCarouselImg"
			};
			var img = dojo.create("IMG", props);
			img._idx = idx;
			if(item.height !== "1px"){
				this.connect(img, "onclick", "onClick");
				this.connect(img, "onkeydown", "onClick");
				dojo.connect(img, "ondragstart", dojo.stopEvent);
			}else{
				img.style.visibility = "hidden";
			}
			return img;
		},

		createFooterText: function(item){
			this.footerTextNode = dojo.create("DIV", {
				className: "mblCarouselImgFooterText",
				innerHTML: item.footerText ? item.footerText : "&nbsp;"
			});
			return this.footerTextNode;
		},

		resizeContent: function(item, box, img){
			if(item.height !== "1px"){
				img.style.height = (box.offsetHeight  - this.headerTextNode.offsetHeight - this.footerTextNode.offsetHeight) + "px";
			}
		},

		onError: function(errText){
		},

		onPrevBtnClick: function(e){
			if(this.currentView){
				this.currentView.goTo(-1);
			}
		},

		onNextBtnClick: function(e){
			if(this.currentView){
				this.currentView.goTo(1);
			}
		},

		onClick: function(e){
			if(e && e.type === "keydown" && e.keyCode !== 13){ return; }
			var img = e.currentTarget;
			for(var i = 0; i < this.images.length; i++){
				if(this.images[i] === img){
					dojo.addClass(img, "mblCarouselImgSelected");
				}else{
					dojo.removeClass(this.images[i], "mblCarouselImgSelected");
				}
			}
			this.setOpacity(img, 0.4);
			var _this = this;
			setTimeout(function(){
				_this.setOpacity(img, 1);
			}, 1000);
			dojo.publish("/dojox/mobile/carouselSelect", [this, img, this.items[img._idx], img._idx]);
		},

		setOpacity: function(node, val){
			// dojo._setOpacity unfortunately requires dojo.query...
			node.style.opacity = val;
			node.style.mozOpacity = val;
			node.style.khtmlOpacity = val;
			node.style.webkitOpacity = val;
		},

		loadImages: function(view){
			if(!view){ return; }
			var imgs = view._carouselImages;
			dojo.forEach(imgs, function(img){
				if(!img.src){
					var item = this.items[img._idx];
					img.src = item.src;
				}
			}, this);
		},

		handleViewChanged: function(view){
			if(view.getParent() !== this){ return; }
			this.currentView = view;
			// lazy-load images in the next view
			this.loadImages(view.nextView(view.domNode));
		},

		_setTitleAttr: function(/*String*/title){
			this.title = title;
			this.titleNode.innerHTML = title;
		}
	});
});

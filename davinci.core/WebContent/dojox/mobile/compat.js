dojo.provide("dojox.mobile.compat");
dojo.require("dijit._base.sniff");
dojo.require("dojo._base.fx");
dojo.require("dojo.fx");
dojo.require("dojox.fx.flip");

// summary:
//		CSS3 compatibility module
// description:
//		This module provides support for some of the CSS3 features to dojox.mobile
//		for non-CSS3 browsers, such as IE or Firefox.
//		If you load this module, it directly replaces some of the methods of
//		dojox.mobile instead of subclassing. This way, html pages remains the same
//		regardless of whether this compatibility module is used or not.
//		Recommended usage is as follows. the code below loads dojox.mobile.compat
//		only when isWebKit is true.
//
//		dojo.require("dojox.mobile");
//		dojo.requireIf(!dojo.isWebKit, "dojox.mobile.compat");
//
//		This module also loads compatibility CSS files, which has -compat.css
//		suffix. You can use either the <link> tag or @import to load theme
//		CSS files. Then, this module searches for the loaded CSS files and loads
//		compatibility CSS files. For example, if you load iphone.css in a page,
//		this module automatically loads iphone-compat.css.
//		If you explicitly load iphone-compat.css with <link> or @import,
//		this module will not load the already loaded file.

if(!dojo.isWebKit){

dojo.extend(dojox.mobile.View, {
	_doTransition: function(fromNode, toNode, transition, dir){
		var anim;
		this.wakeUp(toNode);
		if(!transition || transition == "none"){
			toNode.style.display = "";
			fromNode.style.display = "none";
			toNode.style.left = "0px";
			this.invokeCallback();
		}else if(transition == "slide"){
			var w = fromNode.offsetWidth;
			var s1 = dojo.fx.slideTo({
				node: fromNode,
				duration: 400,
				left: -w*dir,
				top: fromNode.offsetTop
			});
			var s2 = dojo.fx.slideTo({
				node: toNode,
				duration: 400,
				left: 0
			});
			toNode.style.position = "absolute";
			toNode.style.left = w*dir + "px";
			toNode.style.display = "";
			anim = dojo.fx.combine([s1,s2]);
			dojo.connect(anim, "onEnd", this, function(){
				fromNode.style.display = "none";
				toNode.style.position = "relative";
				this.invokeCallback();
			});
			anim.play();
		}else if(transition == "flip"){
			anim = dojox.fx.flip({
				node: fromNode,
				dir: "right",
				depth: 0.5,
				duration: 400
			});
			toNode.style.position = "absolute";
			toNode.style.left = "0px";
			dojo.connect(anim, "onEnd", this, function(){
				fromNode.style.display = "none";
				toNode.style.position = "relative";
				toNode.style.display = "";
				this.invokeCallback();
			});
			anim.play();
		}else if(transition == "fade"){
			anim = dojo.fx.chain([
				dojo.fadeOut({
					node: fromNode,
					duration: 600
				}),
				dojo.fadeIn({
					node: toNode,
					duration: 600
				})
			]);
			toNode.style.position = "absolute";
			toNode.style.left = "0px";
			toNode.style.display = "";
			dojo.style(toNode, "opacity", 0);
			dojo.connect(anim, "onEnd", this, function(){
				fromNode.style.display = "none";
				toNode.style.position = "relative";
				dojo.style(fromNode, "opacity", 1);
				this.invokeCallback();
			});
			anim.play();
		}
	},

	wakeUp: function(node){
		// summary:
		//		Function to force IE to redraw a node since its layout code tends to misrender
		//		in partial draws.
		//	node:
		//		The node to forcibly redraw.
		// tags:
		//		public
		if(dojo.isIE && !node._wokeup){
			node._wokeup = true;
			var disp = node.style.display;
			node.style.display = "";
			var nodes = node.getElementsByTagName("*");
			for(var i = 0, len = nodes.length; i < len; i++){
				var val = nodes[i].style.display;
				nodes[i].style.display = "none";
				nodes[i].style.display = "";
				nodes[i].style.display = val;
			}
			node.style.display = disp;
		}
	}
});

dojo.extend(dojox.mobile.Switch, {
	buildRendering: function(){
		// summary:
		//		Function to simulate the mobile device style switches on
		//		browsers such as IE and FireFox.
		// tags:
		//		protected
		this.domNode = this.srcNodeRef || dojo.doc.createElement("DIV");
		this.domNode.className = "mblSwitch";
		this.domNode.innerHTML =
			  '<div class="mblSwitchInner">'
			+	'<div class="mblSwitchBg mblSwitchBgLeft">'
			+		'<div class="mblSwitchCorner mblSwitchCorner1T"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner2T"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner3T"></div>'
			+		'<div class="mblSwitchText mblSwitchTextLeft">'+this.leftLabel+'</div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner1B"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner2B"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner3B"></div>'
			+	'</div>'
			+	'<div class="mblSwitchBg mblSwitchBgRight">'
			+		'<div class="mblSwitchCorner mblSwitchCorner1T"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner2T"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner3T"></div>'
			+		'<div class="mblSwitchText mblSwitchTextRight">'+this.rightLabel+'</div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner1B"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner2B"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner3B"></div>'
			+	'</div>'
			+	'<div class="mblSwitchKnobContainer">'
			+		'<div class="mblSwitchCorner mblSwitchCorner1T"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner2T"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner3T"></div>'
			+		'<div class="mblSwitchKnob"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner1B"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner2B"></div>'
			+		'<div class="mblSwitchCorner mblSwitchCorner3B"></div>'
			+	'</div>'
			+ '</div>';
		var n = this.inner = this.domNode.firstChild;
		this.left = n.childNodes[0];
		this.right = n.childNodes[1];
		this.knob = n.childNodes[2];

		dojo.addClass(this.domNode, (this.value == "on") ? "mblSwitchOn" : "mblSwitchOff");
		this[this.value == "off" ? "left" : "right"].style.display = "none";
	},

	_changeState: function(/*String*/state){
		// summary:
		//		Function to toggle the switch state on the switch
		// state:
		//		Thhe state to toggle, switch 'on' or 'off'
		// tags:
		//		private
		if(!this.inner.parentNode || !this.inner.parentNode.tagName){
			dojo.addClass(this.domNode, (state == "on") ? "mblSwitchOn" : "mblSwitchOff");
			return;
		}
		var pos;
		if(this.inner.offsetLeft == 0){ // currently ON
			if(state == "on"){ return; }
			pos = -53;
		}else{ // currently OFF
			if(state == "off"){ return; }
			pos = 0;
		}

		var a = dojo.fx.slideTo({
			node: this.inner,
			duration: 500,
			left: pos
		});
		var _this = this;
		dojo.connect(a, "onEnd", function(){
			_this[state == "off" ? "left" : "right"].style.display = "none";
		});
		a.play();
	}
});

if(dojo.isIE || dojo.isBB){

dojo.extend(dojox.mobile.RoundRect, {
	buildRendering: function(){
		// summary:
		//		Function to simulate the borderRadius appearance on IE, since
		//		IE does not support this CSS style.
		// tags:
		//		protected
		dojox.mobile.createRoundRect(this);
		this.domNode.className = "mblRoundRect";
	}
});

dojox.mobile.RoundRectList._addChild = dojox.mobile.RoundRectList.prototype.addChild;
dojo.extend(dojox.mobile.RoundRectList, {
	buildRendering: function(){
		// summary:
		//		Function to simulate the borderRadius appearance on IE, since
		//		IE does not support this CSS style.
		// tags:
		//		protected
		dojox.mobile.createRoundRect(this, true);
		this.domNode.className = "mblRoundRectList";
	},

	postCreate: function(){
		this.redrawBorders();
	},

	addChild: function(widget){
		dojox.mobile.RoundRectList._addChild.apply(this, arguments);
		this.redrawBorders();
		if(dojox.mobile.applyPngFilter){
			dojox.mobile.applyPngFilter(widget.domNode);
		}
	},

	redrawBorders: function(){
		// summary:
		//		Function to adjust the creation of RoundRectLists on IE.
		//		Removed undesired styles.
		// tags:
		//		public

		// Remove a border of the last ListItem.
		// This is for browsers that do not support the last-child CSS pseudo-class.

		var lastChildFound = false;
		for(var i = this.containerNode.childNodes.length - 1; i >= 0; i--){
			var c = this.containerNode.childNodes[i];
			if(c.tagName == "LI"){
				c.style.borderBottomStyle = lastChildFound ? "solid" : "none";
				lastChildFound = true;
			}
		}
	}
});

dojo.extend(dojox.mobile.EdgeToEdgeList, {
	buildRendering: function(){
		this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("UL");
		this.domNode.className = "mblEdgeToEdgeList";
	}
});

if(dojox.mobile.IconContainer){

dojox.mobile.IconContainer._addChild = dojox.mobile.IconContainer.prototype.addChild;
dojo.extend(dojox.mobile.IconContainer, {
	addChild: function(widget){
		dojox.mobile.IconContainer._addChild.apply(this, arguments);
		if(dojox.mobile.applyPngFilter){
			dojox.mobile.applyPngFilter(widget.domNode);
		}
	}
});

} // if(dojox.mobile.IconContainer)

dojo.mixin(dojox.mobile, {
	createRoundRect: function(_this, isList){
		// summary:
		//		Function to adjust the creation of rounded rectangles on IE.
		//		Deals with IE's lack of borderRadius support
		// tags:
		//		public
		var i;
		_this.domNode = dojo.doc.createElement("DIV");
		_this.domNode.style.padding = "0px";
		_this.domNode.style.backgroundColor = "transparent";
		_this.domNode.style.borderStyle = "none";
		_this.containerNode = dojo.doc.createElement(isList?"UL":"DIV");
		_this.containerNode.className = "mblRoundRectContainer";
		if(_this.srcNodeRef){
			_this.srcNodeRef.parentNode.replaceChild(_this.domNode, _this.srcNodeRef);
			for(i = 0, len = _this.srcNodeRef.childNodes.length; i < len; i++){
				_this.containerNode.appendChild(_this.srcNodeRef.removeChild(_this.srcNodeRef.firstChild));
			}
			_this.srcNodeRef = null;
		}
		_this.domNode.appendChild(_this.containerNode);

		for(i = 0; i <= 5; i++){
			var top = dojo.create("DIV");
			top.className = "mblRoundCorner mblRoundCorner"+i+"T";
			_this.domNode.insertBefore(top, _this.containerNode);

			var bottom = dojo.create("DIV");
			bottom.className = "mblRoundCorner mblRoundCorner"+i+"B";
			_this.domNode.appendChild(bottom);
		}
	}
});

if(dojox.mobile.ScrollableView){

dojo.extend(dojox.mobile.ScrollableView, {
	postCreate: function(){
		// On IE, margin-top of the first child does not seem to be effective,
		// probably because padding-top is specified for containerNode
		// to make room for a fixed header. This dummy node is a workaround for that.
		var dummy = dojo.create("DIV", {className:"mblDummyForIE", innerHTML:"&nbsp;"}, this.containerNode, "first");
		dojo.style(dummy, {
			position: "relative",
			marginBottom: "-2px",
			fontSize: "1px"
		});
	}
});

} // if(dojox.mobile.ScrollableView)

} // if(dojo.isIE)

if(dojo.isIE <= 6){
	dojox.mobile.applyPngFilter = function(root){
		root = root || dojo.body();
		var nodes = root.getElementsByTagName("IMG");
		var blank = dojo.moduleUrl("dojo", "resources/blank.gif");
		for(var i = 0, len = nodes.length; i < len; i++){
			var img = nodes[i];
			var w = img.offsetWidth;
			var h = img.offsetHeight;
			if(w === 0 || h === 0){
				// The reason why the image has no width/height may be because
				// display is "none". If that is the case, let's change the
				// display to "" temporarily and see if the image returns them.
				if(dojo.style(img, "display") != "none"){ continue; }
				img.style.display = "";
				w = img.offsetWidth;
				h = img.offsetHeight;
				img.style.display = "none";
				if(w === 0 || h === 0){ continue; }
			}
			var src = img.src;
			if(src.indexOf("resources/blank.gif") != -1){ continue; }
			img.src = blank;
			img.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src+"')";
			img.style.width = w + "px";
			img.style.height = h + "px";
		}
	};
} // if(dojo.isIE <= 6)

dojox.mobile.loadCss = function(/*String|Array*/files){
	// summary:
	//		Function to load and register CSS files with the page
	//	files: String|Array
	//		The CSS files to load and register with the page.
	// tags:
	//		private
	if(!dojo.global._loadedCss){
		var obj = {};
		dojo.forEach(dojox.mobile.getCssPaths(), function(path){
			obj[path] = true;
		});
		dojo.global._loadedCss = obj;
	}
	if(!dojo.isArray(files)){ files = [files]; }
	for(var i = 0; i < files.length; i++){
		var file = files[i];
		if(!dojo.global._loadedCss[file]){
			dojo.global._loadedCss[file] = true;
			if(dojo.doc.createStyleSheet){
				// for some reason, IE hangs when you try to load
				// multiple css files almost at once.
				setTimeout(function(file){
					return function(){
						dojo.doc.createStyleSheet(file);
					};
				}(file), 0);
			}else{
				var link = dojo.doc.createElement("link");
				link.href = file;
				link.type = "text/css";
				link.rel = "stylesheet";
				var head = dojo.doc.getElementsByTagName('head')[0];
				head.appendChild(link);
			}
		}
	}
};

dojox.mobile.getCssPaths = function(){
	var paths = [];
	var i, j;

	// find @import
	var s = dojo.doc.styleSheets;
	for(i = 0; i < s.length; i++){
		var r = s[i].cssRules || s[i].imports;
		if(!r){ continue; }
		for(j = 0; j < r.length; j++){
			if(r[j].href){
				paths.push(r[j].href);
			}
		}
	}
	
	// find <link>
	var elems = dojo.doc.getElementsByTagName("link");
	for(i = 0, len = elems.length; i < len; i++){
		if(elems[i].href){
			paths.push(elems[i].href);
		}
	}
	return paths;
};

dojox.mobile.loadCompatPattern = /\/themes\/(domButtons|buttons|iphone|android).*\.css$/;

dojox.mobile.loadCompatCssFiles = function(){
	// summary:
	//		Function to perform page-level adjustments on browsers such as
	//		IE and firefox.  It loads compat specific css files into the
	//		page header.
	var paths = dojox.mobile.getCssPaths();
	for(var i = 0; i < paths.length; i++){
		var href = paths[i];
		if(href.match(dojox.mobile.loadCompatPattern) && href.indexOf("-compat.css") == -1){
			var compatCss = href.substring(0, href.length-4)+"-compat.css";
			dojox.mobile.loadCss(compatCss);
		}
	}
};

dojox.mobile.hideAddressBar = function(){
	// nop
};

dojo.addOnLoad(function(){
	if(dojo.config["mblLoadCompatCssFiles"] !== false){
		dojox.mobile.loadCompatCssFiles();
	}
	if(dojox.mobile.applyPngFilter){
		dojox.mobile.applyPngFilter();
	}
});

} // end of if(!dojo.isWebKit){

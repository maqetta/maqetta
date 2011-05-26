/*=====
// summary:
//		Utility for enabling touch scrolling capability.
// description:
//		Mobile WebKit browsers do not allow scrolling inner DIVs. (You need
//		the two-finger operation to scroll them.)
//		That means you cannot have fixed-positioned header/footer bars.
//		To solve this issue, this module disables the browsers default scrolling
//		behavior, and re-builds its own scrolling machinery by handling touch
//		events. In this module, this.domNode has height "100%" and is fixed to
//		the window, and this.containerNode scrolls. If you place a bar outside
//		of this.containerNode, then it will be fixed-positioned while
//		this.containerNode is scrollable.
//
//		This module has the following features:
//		- Scrolls inner DIVs vertically, horizontally, or both.
//		- Vertical and horizontal scroll bars.
//		- Flashes the scroll bars when a view is shown.
//		- Simulates the flick operation using animation.
//		- Respects header/footer bars if any.
//
//		dojox.mobile.scrollable is a simple function object, which holds
//		several properties and functions in it. But if you transform it to a
//		dojo class, it can be used as a mix-in class for any custom dojo
//		widgets. dojox.mobile._ScrollableMixin is such a class.
//
//		Also, it can be used even for non-dojo applications. In such cases,
//		several dojo APIs used in this module, such as dojo.connect,
//		dojo.create, etc., are re-defined so that the code works without dojo.
//		When in dojo, of course those re-defined functions are not necessary.
//		So, they are surrounded by the excludeStart and excludeEnd directives
//		so that they will be excluded from the build.
//
//		If you use this module for non-dojo application, you need to explicitly
//		assign your outer fixed node and inner scrollable node to this.domNode
//		and this.containerNode respectively.
//
// example:
//		Use this module from a non-dojo applicatoin:
//		| function onLoad(){
//		| 	var scrollable = new dojox.mobile.scrollable();
//		| 	scrollable.init({
//		| 		domNode: "outer", // id or node
//		| 		containerNode: "inner", // id or node
//		| 		fixedHeaderHeight: document.getElementById("hd1").offsetHeight
//		| 	});
//		| }
//		| <body onload="onLoad()">
//		| 	<h1 id="hd1" style="position:absolute;width:100%;z-index:1;">
//		| 		Fixed Header
//		| 	</h1>
//		| 	<div id="outer" style="height:100%;overflow:hidden;">
//		| 		<div id="inner" style="position:absolute;width:100%;">
//		| 			... content ...
//		| 		</div>
//		| 	</div>
//		| </body>
//
=====*/

if(typeof dojo != "undefined" && dojo.provide){
	dojo.provide("dojox.mobile.scrollable");
}else{
	dojo = {doc:document, global:window, isWebKit:navigator.userAgent.indexOf("WebKit") != -1};
	dojox = {mobile:{}};
}

dojox.mobile.scrollable = function(){
	this.fixedHeaderHeight = 0; // height of a fixed header
	this.fixedFooterHeight = 0; // height of a fixed footer
	this.isLocalFooter = false; // footer is view-local (as opposed to application-wide)
	this.scrollBar = true; // show scroll bar or not
	this.scrollDir = "v"; // v: vertical, h: horizontal, vh: both, f: flip
	this.weight = 0.6; // frictional drag
	this.fadeScrollBar = true;
	this.disableFlashScrollBar = false;
	this.threshold = 0; // drag threshold value in pixels

//>>excludeStart("dojo", true);
	if(!dojo.version){ // seems running in a non-dojo environment
		dojo.connect = function(node, eventName, scope, method){
			var handler = function(e){
				e = e || dojo.global.event;
				if(!e.target){
					e.target = e.srcElement;
					e.pageX = e.offsetX;
					e.pageY = e.offsetY;
				}
				scope[method](e);
			};
			if(node.addEventListener){
				node.addEventListener(eventName.replace(/^on/,""), handler, false);
			}else{
				node.attachEvent(eventName, handler);
			}
			return {node:node, eventName:eventName, handler:handler};
		};
		dojo.disconnect = function(handle){
			if(handle.node.removeEventListener){
				handle.node.removeEventListener(handle.eventName.replace(/^on/,""), handle.handler, false);
			}else{
				handle.node.detachEvent(handle.eventName, handle.handler);
			}
		};
		dojo.create = function(tag, attrs, refNode){
			return refNode.appendChild(dojo.doc.createElement(tag));
		};
		dojo.stopEvent = function(evt){
			if(evt.preventDefault){
				evt.preventDefault();
				evt.stopPropagation();
			}else{
				evt.cancelBubble = true;
			}
			return false;
		};
		dojo.style = function(node, style){
			for(var s in style){
				if(style.hasOwnProperty(s)){
					node.style[s] = style[s];
					if(s == "opacity" && typeof(node.style.filter) != "undefined"){
						node.style.filter = " progid:DXImageTransform.Microsoft.alpha(opacity="+ (style[s]*100) +")";
					}
				}
			}
		};
		dojo.hasClass = function(node, s){
			return (node.className.indexOf(s) != -1);
		};
		dojo.addClass = function(node, s){
			if(!dojo.hasClass(node, s)){
				node.className += " " + s;
			}
		};
		dojo.removeClass = function(node, s){
			node.className = node.className.replace(" " + s, "");
		};
	}
//>>excludeEnd("dojo");

	this.init = function(/*Object?*/params){
		if (params){
			for(var p in params){
				if (params.hasOwnProperty(p)) {
					this[p] = ((p == "domNode" || p == "containerNode") && typeof params[p] == "string") ?
						dojo.doc.getElementById(params[p]) : params[p]; // mix-in params
				}
			}
		}
		this._v = (this.scrollDir.indexOf("v") != -1); // vertical scrolling
		this._h = (this.scrollDir.indexOf("h") != -1); // horizontal scrolling
		this._f = (this.scrollDir == "f"); // flipping views

		this._ch = []; // connect handlers
		this._ch.push(dojo.connect(this.containerNode,
			dojox.mobile.hasTouch ? "touchstart" : "onmousedown", this, "onTouchStart"));
		if(dojo.isWebKit){
			this._ch.push(dojo.connect(this.domNode, "webkitAnimationEnd", this, "onFlickAnimationEnd"));
			this._ch.push(dojo.connect(this.domNode, "webkitAnimationStart", this, "onFlickAnimationStart"));
		}

		if(dojo.global.onorientationchange !== undefined){
			this._ch.push(dojo.connect(dojo.global, "onorientationchange", this, "resizeView"));
		}else{
			this._ch.push(dojo.connect(dojo.global, "onresize", this, "resizeView"));
		}
		this.resizeView();
		var _this = this;
		setTimeout(function(){
			_this.flashScrollBar();
		}, 600);
	};

	this.cleanup = function(){
		for(var i = 0; i < this._ch.length; i++){
			dojo.disconnect(this._ch[i]);
		}
		this._ch = null;
	};

	this.resizeView = function(e){
		// moved from init() to support dynamically added fixed bars
		this._appFooterHeight = (this.fixedFooterHeight && !this.isLocalFooter) ?
			this.fixedFooterHeight : 0;
		this.containerNode.style.paddingTop = this.fixedHeaderHeight + "px";

		// has to wait a little for completion of hideAddressBar()
		var c = 0;
		var _this = this;
		var id = setInterval(function() {
			// adjust the height of this view a couple of times
			_this.domNode.style.height = (dojo.global.innerHeight||dojo.doc.documentElement.clientHeight) - _this._appFooterHeight + "px";
			_this.resetScrollBar();
			if(c++ >= 4) { clearInterval(id); }
		}, 300);
	};

	this.onFlickAnimationStart = function(e){
		dojo.stopEvent(e);
	};

	this.onFlickAnimationEnd = function(e){
		if(e && e.srcElement){
			dojo.stopEvent(e);
		}
		this.stopAnimation();
		if(this._bounce){
			var _this = this;
			var bounce = _this._bounce;
			setTimeout(function(){
				_this.slideTo(bounce, 0.3, "ease-out");
			}, 0);
			_this._bounce = undefined;
		}else{
			this.hideScrollBar();
			this.removeCover();
		}
	};

	this.onTouchStart = function(e){
		if(this._conn && (new Date()).getTime() - this.startTime < 500){
			return; // ignore successive onTouchStart calls
		}
		if(!this._conn){
			this._conn = [];
			this._conn.push(dojo.connect(dojo.doc, dojox.mobile.hasTouch ? "touchmove" : "onmousemove", this, "onTouchMove"));
			this._conn.push(dojo.connect(dojo.doc, dojox.mobile.hasTouch ? "touchend" : "onmouseup", this, "onTouchEnd"));
		}

		this._aborted = false;
		if(dojo.hasClass(this.containerNode, "mblScrollableScrollTo2")){
			this.abort();
		}
		this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
		this.touchStartY = e.touches ? e.touches[0].pageY : e.clientY;
		this.startTime = (new Date()).getTime();
		this.startPos = this.getPos();
		this._dim = this.getDim();
		this._time = [0];
		this._posX = [this.touchStartX];
		this._posY = [this.touchStartY];

		if(e.target.nodeType != 1 || (e.target.tagName != "SELECT" && e.target.tagName != "INPUT" && e.target.tagName != "TEXTAREA")){
			dojo.stopEvent(e);
		}
	};

	this.onTouchMove = function(e){
		var x = e.touches ? e.touches[0].pageX : e.clientX;
		var y = e.touches ? e.touches[0].pageY : e.clientY;
		var dx = x - this.touchStartX;
		var dy = y - this.touchStartY;
		var to = {x:this.startPos.x + dx, y:this.startPos.y + dy};
		var dim = this._dim;

		if(this._time.length == 1){ // the first TouchMove after TouchStart
			if(dx < this.threshold && dy < this.threshold){ return; }
			this.addCover();
			this.showScrollBar();
		}

		var weight = this.weight;
		if(this._v){
			if(to.y > 0){ // content is below the screen area
				to.y = Math.round(to.y * weight);
			}else if(to.y < -dim.o.h){ // content is above the screen area
				if(dim.c.h < dim.d.h){ // content is shorter than display
					to.y = Math.round(to.y * weight);
				}else{
					to.y = -dim.o.h - Math.round((-dim.o.h - to.y) * weight);
				}
			}
		}
		if(this._h || this._f){
			if(to.x > 0){
				to.x = Math.round(to.x * weight);
			}else if(to.x < -dim.o.w){
				if(dim.c.w < dim.d.w){
					to.x = Math.round(to.x * weight);
				}else{
					to.x = -dim.o.w - Math.round((-dim.o.w - to.x) * weight);
				}
			}
		}
		this.scrollTo(to);

		var max = 10;
		var n = this._time.length; // # of samples
		if(n >= 2){
			// Check the direction of the finger move.
			// If the direction has been changed, discard the old data.
			var d0, d1;
			if(this._v && !this._h){
				d0 = this._posY[n - 1] - this._posY[n - 2];
				d1 = y - this._posY[n - 1];
			}else if(!this._v && this._h){
				d0 = this._posX[n - 1] - this._posX[n - 2];
				d1 = x - this._posX[n - 1];
			}
			if(d0 * d1 < 0){ // direction changed
				// leave only the latest data
				this._time = [this._time[n - 1]];
				this._posX = [this._posX[n - 1]];
				this._posY = [this._posY[n - 1]];
				n = 1;
			}
		}
		if(n == max){
			this._time.shift();
			this._posX.shift();
			this._posY.shift();
		}
		this._time.push((new Date()).getTime() - this.startTime);
		this._posX.push(x);
		this._posY.push(y);
	};

	this.onTouchEnd = function(e){
		if(!this._conn){ return; } // if we get onTouchEnd without onTouchStart, ignore it.
		for(var i = 0; i < this._conn.length; i++){
			dojo.disconnect(this._conn[i]);
		}
		this._conn = null;

		var n = this._time.length; // # of samples
		var clicked = false;
		if(!this._aborted){
			if(n <= 1){
				clicked = true;
			}else if(n == 2 && Math.abs(this._posY[1] - this._posY[0]) < 4){
				clicked = true;
			}
		}
		if(clicked){ // clicked, not dragged or flicked
			this.hideScrollBar();
			this.removeCover();
			if(dojox.mobile.hasTouch){
				var elem = e.target;
				if(elem.nodeType != 1){
					elem = elem.parentNode;
				}
				var ev = dojo.doc.createEvent("MouseEvents");
				ev.initEvent("click", true, true);
				elem.dispatchEvent(ev);
			}
			return;
		}
		var speed = {x:0, y:0};
		// if the user holds the mouse or finger more than 0.5 sec, do not move.
		if(n >= 2 && (new Date()).getTime() - this.startTime - this._time[n - 1] < 500){
			var dy = this._posY[n - (n > 3 ? 2 : 1)] - this._posY[(n - 6) >= 0 ? n - 6 : 0];
			var dx = this._posX[n - (n > 3 ? 2 : 1)] - this._posX[(n - 6) >= 0 ? n - 6 : 0];
			var dt = this._time[n - (n > 3 ? 2 : 1)] - this._time[(n - 6) >= 0 ? n - 6 : 0];
			speed.y = this.calcSpeed(dy, dt);
			speed.x = this.calcSpeed(dx, dt);
		}

		var pos = this.getPos();
		var to = {}; // destination
		var dim = this._dim;

		if(this._v){
			to.y = pos.y + speed.y;
		}
		if(this._h || this._f){
			to.x = pos.x + speed.x;
		}

		if(this.scrollDir == "v" && dim.c.h <= dim.d.h){ // content is shorter than display
			this.slideTo({y:0}, 0.3, "ease-out"); // go back to the top
			return;
		}else if(this.scrollDir == "h" && dim.c.w <= dim.d.w){ // content is narrower than display
			this.slideTo({x:0}, 0.3, "ease-out"); // go back to the left
			return;
		}else if(this._v && this._h && dim.c.h <= dim.d.h && dim.c.w <= dim.d.w){
			this.slideTo({x:0, y:0}, 0.3, "ease-out"); // go back to the top-left
			return;
		}

		var duration, easing = "ease-out";
		var bounce = {};
		if(this._v){
			if(to.y > 0){ // going down. bounce back to the top.
				if(pos.y > 0){ // started from below the screen area. return quickly.
					duration = 0.3;
					to.y = 0;
				}else{
					to.y = Math.min(to.y, 20);
					easing = "linear";
					bounce.y = 0;
				}
			}else if(-speed.y > dim.o.h - (-pos.y)){ // going up. bounce back to the bottom.
				if(pos.y < -dim.o.h){ // started from above the screen top. return quickly.
					duration = 0.3;
					to.y = dim.c.h <= dim.d.h ? 0 : -dim.o.h; // if shorter, move to 0
				}else{
					to.y = Math.max(to.y, -dim.o.h - 20);
					easing = "linear";
					bounce.y = -dim.o.h;
				}
			}
		}
		if(this._h || this._f){
			if(to.x > 0){ // going right. bounce back to the left.
				if(pos.x > 0){ // started from right of the screen area. return quickly.
					duration = 0.3;
					to.x = 0;
				}else{
					to.x = Math.min(to.x, 20);
					easing = "linear";
					bounce.x = 0;
				}
			}else if(-speed.x > dim.o.w - (-pos.x)){ // going left. bounce back to the right.
				if(pos.x < -dim.o.w){ // started from left of the screen top. return quickly.
					duration = 0.3;
					to.x = dim.c.w <= dim.d.w ? 0 : -dim.o.w; // if narrower, move to 0
				}else{
					to.x = Math.max(to.x, -dim.o.w - 20);
					easing = "linear";
					bounce.x = -dim.o.w;
				}
			}
		}
		this._bounce = (bounce.x !== undefined || bounce.y !== undefined) ? bounce : undefined;

		if(duration === undefined){
			var distance, velocity;
			if(this._v && this._h){
				velocity = Math.sqrt(speed.x+speed.x + speed.y*speed.y);
				distance = Math.sqrt(Math.pow(to.y - pos.y, 2) + Math.pow(to.x - pos.x, 2));
			}else if(this._v){
				velocity = speed.y;
				distance = to.y - pos.y;
			}else if(this._h){
				velocity = speed.x;
				distance = to.x - pos.x;
			}
			duration = velocity !== 0 ? Math.abs(distance / velocity) : 0.01; // time = distance / velocity
		}
		this.slideTo(to, duration, easing);
	};

	this.abort = function(){
		this.scrollTo(this.getPos());
		this.stopAnimation();
		this._aborted = true;
	};

	this.stopAnimation = function(){
		// stop the currently running animation
		dojo.removeClass(this.containerNode, "mblScrollableScrollTo2");
		if(this._scrollBarV){
			this._scrollBarV.className = "";
		}
		if(this._scrollBarH){
			this._scrollBarH.className = "";
		}
	};

	this.calcSpeed = function(/*Number*/d, /*Number*/t){
		return Math.round(d / t * 100) * 4;
	};

	this.scrollTo = function(/*Object*/to, /*?Boolean*/doNotMoveScrollBar){ // to: {x, y}
		var s = this.containerNode.style;
		if(dojo.isWebKit){
			s.webkitTransform = this.makeTranslateStr(to);
		}else{
			if(this._v){
				s.top = to.y + "px";
			}
			if(this._h || this._f){
				s.left = to.x + "px";
			}
		}
		if(!doNotMoveScrollBar){
			this.scrollScrollBarTo(this.calcScrollBarPos(to));
		}
	};

	this.slideTo = function(/*Object*/to, /*Number*/duration, /*String*/easing){
		this._runSlideAnimation(this.getPos(), to, duration, easing, this.containerNode, 2);
		this.slideScrollBarTo(to, duration, easing);
	};

	this.makeTranslateStr = function(to){
		var y = this._v && typeof to.y == "number" ? to.y+"px" : "0px";
		var x = (this._h||this._f) && typeof to.x == "number" ? to.x+"px" : "0px";
		return dojox.mobile.hasTranslate3d ?
				"translate3d("+x+","+y+",0px)" : "translate("+x+","+y+")";
	};

	this.getPos = function(){
		// summary:
		//		Get the top position in the midst of animation
		if(dojo.isWebKit){
			var m = dojo.doc.defaultView.getComputedStyle(this.containerNode, '')["-webkit-transform"];
			if(m && m.indexOf("matrix") === 0){
				var arr = m.split(/[,\s\)]+/);
				return {y:arr[5] - 0, x:arr[4] - 0};
			}
			return {x:0, y:0};
		}else{
			return {y:this.containerNode.offsetTop, x:this.containerNode.offsetLeft};
		}
	};

	this.getDim = function(){
		var d = {};
		// content width/height
		d.c = {h:this.containerNode.offsetHeight - this.fixedHeaderHeight, w:this.containerNode.offsetWidth};

		// view width/height
		d.v = {h:this.domNode.offsetHeight + this._appFooterHeight, w:this.domNode.offsetWidth};

		// display width/height
		d.d = {h:d.v.h - this.fixedHeaderHeight - this.fixedFooterHeight, w:d.v.w};

		// overflowed width/height
		d.o = {h:d.c.h - d.v.h + this.fixedHeaderHeight + this.fixedFooterHeight, w:d.c.w - d.v.w};
		return d;
	};

	this.showScrollBar = function(){
		if(!this.scrollBar){ return; }

		var dim = this._dim;
		if(this.scrollDir == "v" && dim.c.h <= dim.d.h){ return; }
		if(this.scrollDir == "h" && dim.c.w <= dim.d.w){ return; }
		if(this._v && this._h && dim.c.h <= dim.d.h && dim.c.w <= dim.d.w){ return; }

		var createBar = function(self, dir){
			var bar = self["_scrollBarNode" + dir];
			if(!bar){
				var wrapper = dojo.create("div", null, self.domNode);
				var props = { position: "absolute", overflow: "hidden" };
				if(dir == "V"){
					props.right = "2px";
					props.width = "5px";
				}else{
					props.bottom = (self.isLocalFooter ? self.fixedFooterHeight : 0) + 2 + "px";
					props.height = "5px";
				}
				dojo.style(wrapper, props);
				wrapper.className = "mblScrollBarWrapper";
				self["_scrollBarWrapper"+dir] = wrapper;

				bar = dojo.create("div", null, wrapper);
				dojo.style(bar, {
					opacity: 0.6,
					position: "absolute",
					backgroundColor: "#606060",
					fontSize: "1px",
					webkitBorderRadius: "2px",
					MozBorderRadius: "2px",
					webkitTransformOrigin: "0 0",
					zIndex: 2147483647 // max of signed 32-bit integer
				});
				dojo.style(bar, dir == "V" ? {width: "5px"} : {height: "5px"});
				self["_scrollBarNode" + dir] = bar;
			}
			return bar;
		};
		if(this._v && !this._scrollBarV){
			this._scrollBarV = createBar(this, "V");
		}
		if(this._h && !this._scrollBarH){
			this._scrollBarH = createBar(this, "H");
		}
		this.resetScrollBar();
	};

	this.hideScrollBar = function(){
		var fadeRule;
		if(this.fadeScrollBar && dojo.isWebKit){
			if(!dojox.mobile._fadeRule){
				var node = dojo.create("style", null, dojo.doc.getElementsByTagName("head")[0]);
				node.textContent =
					".mblScrollableFadeOutScrollBar{"+
					"  -webkit-animation-duration: 1s;"+
					"  -webkit-animation-name: scrollableViewFadeOutScrollBar;}"+
					"@-webkit-keyframes scrollableViewFadeOutScrollBar{"+
					"  from { opacity: 0.6; }"+
					"  50% { opacity: 0.6; }"+
					"  to { opacity: 0; }}";
				dojox.mobile._fadeRule = node.sheet.cssRules[1];
			}
			fadeRule = dojox.mobile._fadeRule;
		}
		if(!this.scrollBar){ return; }
		var f = function(bar){
			dojo.style(bar, {
				opacity: 0,
				webkitAnimationDuration: ""
			});
			bar.className = "mblScrollableFadeOutScrollBar";
		};
		if(this._scrollBarV){
			f(this._scrollBarV);
			this._scrollBarV = null;
		}
		if(this._scrollBarH){
			f(this._scrollBarH);
			this._scrollBarH = null;
		}
	};

	this.calcScrollBarPos = function(/*Object*/to){ // to: {x, y}
		var pos = {};
		var dim = this._dim;
		var f = function(wrapperH, barH, t, d, c){
			var y = Math.round((d - barH - 8) / (d - c) * t);
			if(y < -barH + 5){
				y = -barH + 5;
			}
			if(y > wrapperH - 5){
				y = wrapperH - 5;
			}
			return y;
		};
		if(typeof to.y == "number" && this._scrollBarV){
			pos.y = f(this._scrollBarWrapperV.offsetHeight, this._scrollBarV.offsetHeight, to.y, dim.d.h, dim.c.h);
		}
		if(typeof to.x == "number" && this._scrollBarH){
			pos.x = f(this._scrollBarWrapperH.offsetWidth, this._scrollBarH.offsetWidth, to.x, dim.d.w, dim.c.w);
		}
		return pos;
	};

	this.scrollScrollBarTo = function(/*Object*/to){ // to: {x, y}
		if(!this.scrollBar){ return; }
		if(this._v && this._scrollBarV && typeof to.y == "number"){
			if(dojo.isWebKit){
				this._scrollBarV.style.webkitTransform = this.makeTranslateStr({y:to.y});
			}else{
				this._scrollBarV.style.top = to.y + "px";
			}
		}
		if(this._h && this._scrollBarH && typeof to.x == "number"){
			if(dojo.isWebKit){
				this._scrollBarH.style.webkitTransform = this.makeTranslateStr({x:to.x});
			}else{
				this._scrollBarH.style.left = to.x + "px";
			}
		}
	};

	this.slideScrollBarTo = function(/*Object*/to, /*Number*/duration, /*String*/easing){
		if(!this.scrollBar){ return; }
		var fromPos = this.calcScrollBarPos(this.getPos());
		var toPos = this.calcScrollBarPos(to);
		if(this._v && this._scrollBarV){
			this._runSlideAnimation({y:fromPos.y}, {y:toPos.y}, duration, easing, this._scrollBarV, 0);
		}
		if(this._h && this._scrollBarH){
			this._runSlideAnimation({x:fromPos.x}, {x:toPos.x}, duration, easing, this._scrollBarH, 1);
		}
	};

	this._runSlideAnimation = function(/*Object*/from, /*Object*/to, /*Number*/duration, /*String*/easing, node, idx){
		// idx: 0:scrollbarV, 1:scrollbarH, 2:content
		if(dojo.isWebKit){
			this.setKeyframes(from, to, idx);
			dojo.style(node, {
				webkitAnimationDuration: duration + "s",
				webkitAnimationTimingFunction: easing
			});
			dojo.addClass(node, "mblScrollableScrollTo"+idx);
			if(idx == 2){
				this.scrollTo(to, true);
			}else{
				this.scrollScrollBarTo(to);
			}
//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		}else if(dojo.fx && dojo.fx.easing){
			// If you want to support non-webkit browsers,
			// your application needs to load necessary modules as follows:
			//
			// | dojo.require("dojo.fx");
			// | dojo.require("dojo.fx.easing");
			//
			// This module itself does not make dependency on them.
			var s = dojo.fx.slideTo({
				node: node,
				duration: duration*1000,
				left: to.x,
				top: to.y,
				easing: (easing == "ease-out") ? dojo.fx.easing.quadOut : dojo.fx.easing.linear
			}).play();
			if(idx == 2){
				dojo.connect(s, "onEnd", this, "onFlickAnimationEnd");
			}
		}else{
			// directly jump to the destination without animation
			if(idx == 2){
				this.scrollTo(to);
				this.onFlickAnimationEnd();
			}else{
				this.scrollScrollBarTo(to);
			}
//>>excludeEnd("webkitMobile");
		}
	};

	this.resetScrollBar = function(){
		//	summary:
		//		Resets the scroll bar length, position, etc.
		var f = function(wrapper, bar, d, c, hd, v){
			if(!bar){ return; }
			var props = {};
			props[v ? "top" : "left"] = hd + 4 + "px"; // +4 is for top or left margin
			props[v ? "height" : "width"] = d - 8 + "px";
			dojo.style(wrapper, props);
			var l = Math.round(d * d / c); // scroll bar length
			l = Math.min(Math.max(l - 8, 5), d - 8); // -8 is for margin for both ends
			bar.style[v ? "height" : "width"] = l + "px";
			dojo.style(bar, {"opacity": 0.6});
		};
		var dim = this.getDim();
		f(this._scrollBarWrapperV, this._scrollBarV, dim.d.h, dim.c.h, this.fixedHeaderHeight, true);
		f(this._scrollBarWrapperH, this._scrollBarH, dim.d.w, dim.c.w, 0);
		this.createMask();
	};

	this.createMask = function(){
		//	summary:
		//		Creates a mask for a scroll bar edge.
		// description:
		//		This function creates a mask that hides corners of one scroll
		//		bar edge to make it round edge. The other side of the edge is
		//		always visible and round shaped with the border-radius style.
		if(!dojo.isWebKit){ return; }
		var ctx;
		if(this._scrollBarWrapperV){
			var h = this._scrollBarWrapperV.offsetHeight;
			ctx = dojo.doc.getCSSCanvasContext("2d", "scrollBarMaskV", 5, h);
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fillRect(1, 0, 3, 2);
			ctx.fillRect(0, 1, 5, 1);
			ctx.fillRect(0, h - 2, 5, 1);
			ctx.fillRect(1, h - 1, 3, 2);
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.fillRect(0, 2, 5, h - 4);
			this._scrollBarWrapperV.style.webkitMaskImage = "-webkit-canvas(scrollBarMaskV)";
		}
		if(this._scrollBarWrapperH){
			var w = this._scrollBarWrapperH.offsetWidth;
			ctx = dojo.doc.getCSSCanvasContext("2d", "scrollBarMaskH", w, 5);
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fillRect(0, 1, 2, 3);
			ctx.fillRect(1, 0, 1, 5);
			ctx.fillRect(w - 2, 0, 1, 5);
			ctx.fillRect(w - 1, 1, 2, 3);
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.fillRect(2, 0, w - 4, 5);
			this._scrollBarWrapperH.style.webkitMaskImage = "-webkit-canvas(scrollBarMaskH)";
		}
	};

	this.flashScrollBar = function(){
		if(this.disableFlashScrollBar){ return; }
		this._dim = this.getDim();
		if(this._dim.d.h <= 0){ return; } // dom is not ready
		this.showScrollBar();
		var _this = this;
		setTimeout(function(){
			_this.hideScrollBar();
		}, 300);
	};

	this.addCover = function(){
//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		if(!dojox.mobile.hasTouch && !this.noCover){
			if(!this._cover){
				this._cover = dojo.create("div", null, dojo.doc.body);
				dojo.style(this._cover, {
					backgroundColor: "#ffff00",
					opacity: 0,
					position: "absolute",
					top: "0px",
					left: "0px",
					width: "100%",
					height: "100%",
					zIndex: 2147483647 // max of signed 32-bit integer
				});
				this._ch.push(dojo.connect(this._cover,
					dojox.mobile.hasTouch ? "touchstart" : "onmousedown", this, "onTouchEnd"));
			}else{
				this._cover.style.display = "";
			}
		}
//>>excludeEnd("webkitMobile");
		this.setSelectable(this.domNode, false);
		var sel;
		if(dojo.global.getSelection){
			sel = dojo.global.getSelection();
			sel.collapse(dojo.doc.body, 0);
		}else{
			sel = dojo.doc.selection.createRange();
			sel.setEndPoint("EndToStart", sel);
			sel.select();
		}
	};

	this.removeCover = function(){
//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		if(!dojox.mobile.hasTouch && this._cover){
			this._cover.style.display = "none";
		}
//>>excludeEnd("webkitMobile");
		this.setSelectable(this.domNode, true);
	};

	this.setKeyframes = function(/*Object*/from, /*Object*/to, /*Number*/idx){
		if(!dojox.mobile._rule){
			dojox.mobile._rule = [];
		}
		// idx: 0:scrollbarV, 1:scrollbarH, 2:content
		if(!dojox.mobile._rule[idx]){
            var node = dojo.create("style", null, dojo.doc.getElementsByTagName("head")[0]);
            node.textContent =
				".mblScrollableScrollTo"+idx+"{-webkit-animation-name: scrollableViewScroll"+idx+";}"+
				"@-webkit-keyframes scrollableViewScroll"+idx+"{}";
			dojox.mobile._rule[idx] = node.sheet.cssRules[1];
		}
		var rule = dojox.mobile._rule[idx];
		if(rule){
			if(from){
				rule.deleteRule("from");
				rule.insertRule("from { -webkit-transform: "+this.makeTranslateStr(from)+"; }");
			}
			if(to){
				if(to.x === undefined){ to.x = from.x; }
				if(to.y === undefined){ to.y = from.y; }
				rule.deleteRule("to");
				rule.insertRule("to { -webkit-transform: "+this.makeTranslateStr(to)+"; }");
			}
		}
	};

	this.setSelectable = function(node, selectable){
		// dojo.setSelectable has dependency on dojo.query. Re-define our own.
		node.style.KhtmlUserSelect = selectable ? "auto" : "none";
		node.style.MozUserSelect = selectable ? "" : "none";
		node.onselectstart = selectable ? null : function(){return false;};
		node.unselectable = selectable ? "" : "on";
	};

};

(function(){
	// feature detection
	if(dojo.isWebKit){
		var elem = dojo.doc.createElement("div");
		elem.style.webkitTransform = "translate3d(0px,1px,0px)";
		dojo.doc.documentElement.appendChild(elem);
		var v = dojo.doc.defaultView.getComputedStyle(elem, '')["-webkit-transform"];
		dojox.mobile.hasTranslate3d = v && v.indexOf("matrix") === 0;
		dojo.doc.documentElement.removeChild(elem);
	
		dojox.mobile.hasTouch = (typeof dojo.doc.documentElement.ontouchstart != "undefined" &&
			navigator.appVersion.indexOf("Mobile") != -1);
	}
})();

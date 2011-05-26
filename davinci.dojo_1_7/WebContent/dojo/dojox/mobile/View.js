define(["./common","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./ViewController"], function(mcommon,WidgetBase,Container,Contained){
	// module:
	//		dojox/mobile/View
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.View", [dijit._WidgetBase,dijit._Container,dijit._Contained],{
		// summary:
		//		A widget that represents a view that occupies the full screen
		// description:
		//		View acts as a container for any HTML and/or widgets. An entire HTML page
		//		can have multiple View widgets and the user can navigate through
		//		the views back and forth without page transitions.
	
		// selected: Boolean
		//		If true, the view is displayed at startup time.
		selected: false,

		// keepScrollPos: Boolean
		//		If true, the scroll position is kept between views.
		keepScrollPos: true,
	
		constructor: function(params, node){
			if(node){
				dojo.byId(node).style.visibility = "hidden";
			}
		},
	
		buildRendering: function(){
			this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("DIV");
			this.domNode.className = "mblView";
			if(dojo.config["mblAndroidWorkaround"] !== false && dojo.isAndroid >= 2.2 && dojo.isAndroid < 3){ // workaround for android screen flicker problem
				dojo.style(this.domNode, "webkitTransform", "translate3d(0,0,0)");
			}
			this.connect(this.domNode, "webkitAnimationEnd", "onAnimationEnd");
			this.connect(this.domNode, "webkitAnimationStart", "onAnimationStart");
			var id = location.href.match(/#(\w+)([^\w=]|$)/) ? RegExp.$1 : null;
	
			this._visible = this.selected && !id || this.id == id;
	
			if(this.selected){
				dojox.mobile._defaultView = this;
			}
		},

		startup: function(){
			if(this._started){ return; }
			var siblings = [];
			var children = this.domNode.parentNode.childNodes;
			var visible = false;
			// check if a visible view exists
			for(var i = 0; i < children.length; i++){
				var c = children[i];
				if(c.nodeType === 1 && dojo.hasClass(c, "mblView")){
					siblings.push(c);
					visible = visible || dijit.byNode(c)._visible;
				}
			}
			var _visible = this._visible;
			// if no visible view exists, make the first view visible
			if(siblings.length === 1 || (!visible && siblings[0] === this.domNode)){
				_visible = true;
			}
			var _this = this;
			setTimeout(function(){ // necessary to render the view correctly
				if(!_visible){
					_this.domNode.style.display = "none";
				}else{
					dojox.mobile.currentView = _this;
					_this.onStartView();
					dojo.publish("/dojox/mobile/startView", [_this]);
				}
				if(_this.domNode.style.visibility != "visible"){ // this check is to avoid screen flickers
					_this.domNode.style.visibility = "visible";
				}
				var parent = _this.getParent && _this.getParent();
				if(!parent || !parent.resize){ // top level widget
					_this.resize();
				}
			}, dojo.isIE?100:0); // give IE a little time to complete drawing
			this.inherited(arguments);
		},
	
		resize: function(){
			dojo.forEach(this.getChildren(), function(child){
				if(child.resize){ child.resize(); }
			});
		},

		onStartView: function(){
			// Stub function to connect to from your application.
			// Called only when this view is shown at startup time.
		},
	
		onBeforeTransitionIn: function(moveTo, dir, transition, context, method){
			// Stub function to connect to from your application.
		},
	
		onAfterTransitionIn: function(moveTo, dir, transition, context, method){
			// Stub function to connect to from your application.
		},
	
		onBeforeTransitionOut: function(moveTo, dir, transition, context, method){
			// Stub function to connect to from your application.
		},
	
		onAfterTransitionOut: function(moveTo, dir, transition, context, method){
			// Stub function to connect to from your application.
		},
	
		_saveState: function(moveTo, dir, transition, context, method){
			this._context = context;
			this._method = method;
			if(transition == "none"){
				transition = null;
			}
			this._moveTo = moveTo;
			this._dir = dir;
			this._transition = transition;
			this._arguments = dojo._toArray(arguments);
			this._args = [];
			if(context || method){
				for(i = 5; i < arguments.length; i++){
					this._args.push(arguments[i]);
				}
			}
		},
	
		convertToId: function(moveTo){
			if(typeof(moveTo) == "string"){
				// removes a leading hash mark (#) and params if exists
				// ex. "#bar&myParam=0003" -> "bar"
				moveTo.match(/^#?([^&]+)/);
				return RegExp.$1;
			}
			return moveTo;
		},
	
		performTransition: function(/*String*/moveTo, /*Number*/dir, /*String*/transition,
									/*Object|null*/context, /*String|Function*/method /*optional args*/){
			// summary:
			//		Function to perform the various types of view transitions, such as fade, slide, and flip.
			// moveTo: String
			//		The destination view id to transition the current view to.
			//		If null, transitions to a blank view.
			//		If "#", returns immediately without transition.
			// dir: Number
			//		The transition direction. If 1, transition forward. If -1, transition backward.
			//		For example, the slide transition slides the view from right to left when dir == 1,
			//		and from left to right when dir == -1.
			// transision: String
			//		The type of transition to perform. "slide", "fade", or "flip"
			// context: Object
			//		The object that the callback function will receive as "this".
			// method: String|Function
			//		A callback function that is called when the transition has been finished.
			//		A function reference, or name of a function in context.
			// tags:
			//		public
			// example:
			//		Transitions to the blank view, and then opens another page.
			//	|	performTransition(null, 1, "slide", null, function(){location.href = href;});
			if(moveTo === "#"){ return; }
			if(dojo.hash){
				if(typeof(moveTo) == "string" && moveTo.charAt(0) == '#' && !dojox.mobile._params){
					dojox.mobile._params = [];
					for(var i = 0; i < arguments.length; i++){
						dojox.mobile._params.push(arguments[i]);
					}
					dojo.hash(moveTo);
					return;
				}
			}
			this._saveState.apply(this, arguments);
			var toNode;
			if(moveTo){
				toNode = this.convertToId(moveTo);
			}else{
				if(!this._dummyNode){
					this._dummyNode = dojo.doc.createElement("DIV");
					dojo.body().appendChild(this._dummyNode);
				}
				toNode = this._dummyNode;
			}
			var fromNode = this.domNode;
			var fromTop = fromNode.offsetTop;
			toNode = this.toNode = dojo.byId(toNode);
			if(!toNode){ console.log("dojox.mobile.View#performTransition: destination view not found: "+moveTo); return; }
			toNode.style.visibility = "hidden";
			toNode.style.display = "";
			var toWidget = dijit.byNode(toNode);
			if(toWidget){
				// Now that the target view became visible, it's time to run resize()
				dojox.mobile.resizeAll(null, toWidget);
	
				if(transition && transition != "none"){
					// Temporarily add padding to align with the fromNode while transition
					toWidget.containerNode.style.paddingTop = fromTop + "px";
				}
			}
	
			this.onBeforeTransitionOut.apply(this, arguments);
			dojo.publish("/dojox/mobile/beforeTransitionOut", [this].concat(dojo._toArray(arguments)));
			if(toWidget){
				// perform view transition keeping the scroll position
				if(this.keepScrollPos && !this.getParent()){
					var scrollTop = dojo.body().scrollTop || dojo.doc.documentElement.scrollTop || dojo.global.pageYOffset || 0;
					fromNode._scrollTop = scrollTop;
					var toTop = (dir == 1) ? 0 : (toNode._scrollTop || 0);
					toNode.style.top = "0px";
					if(scrollTop > 1 || toTop !== 0){
						fromNode.style.top = toTop - scrollTop + "px";
						if(dojo.config["mblHideAddressBar"] !== false){
							setTimeout(function(){ // iPhone needs setTimeout
								dojo.global.scrollTo(0, (toTop || 1));
							}, 0);
						}
					}
				}else{
					toNode.style.top = "0px";
				}
				toWidget.onBeforeTransitionIn.apply(toWidget, arguments);
				dojo.publish("/dojox/mobile/beforeTransitionIn", [toWidget].concat(dojo._toArray(arguments)));
			}
			toNode.style.display = "none";
			toNode.style.visibility = "visible";
			this._doTransition(fromNode, toNode, transition, dir);
		},
		_toCls: function(s){
			// convert from transition name to corresponding class name
			// ex. "slide" -> "mblSlide"
			return "mbl"+s.charAt(0).toUpperCase() + s.substring(1);
		},
	
		_doTransition: function(fromNode, toNode, transition, dir){
			var rev = (dir == -1) ? " mblReverse" : "";
			toNode.style.display = "";
			if(!transition || transition == "none"){
				this.domNode.style.display = "none";
				this.invokeCallback();
			}else{
				var s = this._toCls(transition);
				dojo.addClass(fromNode, s + " mblOut" + rev);
				dojo.addClass(toNode, s + " mblIn" + rev);
				// set transform origin
				var fromOrigin = "50% 50%";
				var toOrigin = "50% 50%";
				var scrollTop, posX, posY;
				if(transition.indexOf("swirl") != -1 || transition.indexOf("zoom") != -1){
					if(this.keepScrollPos && !this.getParent()){
						scrollTop = dojo.body().scrollTop || dojo.doc.documentElement.scrollTop || dojo.global.pageYOffset || 0;
					}else{
						scrollTop = -dojo.position(fromNode, true).y;
					}
					posY = dojo.global.innerHeight / 2 + scrollTop;
					fromOrigin = "50% " + posY + "px";
					toOrigin = "50% " + posY + "px";
				}else if(transition.indexOf("scale") != -1){
					var viewPos = dojo.position(fromNode, true);
					posX = ((this.clickedPosX !== undefined) ? this.clickedPosX : dojo.global.innerWidth / 2) - viewPos.x;
					if(this.keepScrollPos && !this.getParent()){
						scrollTop = dojo.body().scrollTop || dojo.doc.documentElement.scrollTop || dojo.global.pageYOffset || 0;
					}else{
						scrollTop = -viewPos.y;
					}
					posY = ((this.clickedPosY !== undefined) ? this.clickedPosY : dojo.global.innerHeight / 2) + scrollTop;
					fromOrigin = posX + "px " + posY + "px";
					toOrigin = posX + "px " + posY + "px";
				}
				dojo.style(fromNode, {webkitTransformOrigin:fromOrigin});
				dojo.style(toNode, {webkitTransformOrigin:toOrigin});
			}
			dojox.mobile.currentView = dijit.byNode(toNode);
		},
	
		onAnimationStart: function(e){
		},


		onAnimationEnd: function(e){
			if(e.animationName.indexOf("Out") === -1 &&
				e.animationName.indexOf("In") === -1 &&
				e.animationName.indexOf("Shrink") === -1){ return; }
			var isOut = false;
			if(dojo.hasClass(this.domNode, "mblOut")){
				isOut = true;
				this.domNode.style.display = "none";
				dojo.removeClass(this.domNode, [this._toCls(this._transition), "mblIn", "mblOut", "mblReverse"]);
			}else{
				// Reset the temporary padding
				this.containerNode.style.paddingTop = "";
			}
			if(e.animationName.indexOf("Shrink") !== -1){
				var li = e.target;
				li.style.display = "none";
				dojo.removeClass(li, "mblCloseContent");
			}
			if(isOut){
				this.invokeCallback();
			}
			// this.domNode may be destroyed as a result of invoking the callback,
			// so check for that before accessing it.
			this.domNode && (this.domNode.className = "mblView");

			// clear the clicked position
			this.clickedPosX = this.clickedPosY = undefined;
		},

		invokeCallback: function(){
			this.onAfterTransitionOut.apply(this, this._arguments);
			dojo.publish("/dojox/mobile/afterTransitionOut", [this].concat(this._arguments));
			var toWidget = dijit.byNode(this.toNode);
			if(toWidget){
				toWidget.onAfterTransitionIn.apply(toWidget, this._arguments);
				dojo.publish("/dojox/mobile/afterTransitionIn", [toWidget].concat(this._arguments));
			}
	
			var c = this._context, m = this._method;
			if(!c && !m){ return; }
			if(!m){
				m = c;
				c = null;
			}
			c = c || dojo.global;
			if(typeof(m) == "string"){
				c[m].apply(c, this._args);
			}else{
				m.apply(c, this._args);
			}
		},
	
		getShowingView: function(){
			// summary:
			//		Find the currently showing view from my sibling views.
			// description:
			//		Note that dojox.mobile.currentView is the last shown view.
			//		If the page consists of a splitter, there are multiple showing views.
			var nodes = this.domNode.parentNode.childNodes;
			for(var i = 0; i < nodes.length; i++){
				if(dojo.hasClass(nodes[i], "mblView") && dojo.style(nodes[i], "display") != "none"){
					return dijit.byNode(nodes[i]);
				}
			}
			return null;
		},
	
		show: function(){
			// summary:
			//		Shows this view without a transition animation.
			var view = this.getShowingView();
			if(view){
				view.domNode.style.display = "none"; // from-style
			}
			this.domNode.style.display = ""; // to-style
			dojox.mobile.currentView = this;
		}
	});
});

define(["dojo/_base/kernel", "./common","dojo/uacss","dojo/_base/fx","dojo/fx","dojo/fx/easing","dojox/fx","dojox/fx/flip"],
	function(dojo, common, uacss, fxbase, fx, easing, xfx, flip){
	// module:
	//		dojox/mobile/compat
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
		if(dojox.mobile.View){
			dojo.extend(dojox.mobile.View, {
				_doTransition: function(fromNode, toNode, transition, dir){
					var anim;
					this.wakeUp(toNode);
					if(!transition || transition == "none"){
						toNode.style.display = "";
						fromNode.style.display = "none";
						toNode.style.left = "0px";
						this.invokeCallback();
					}else if(transition == "slide" || transition == "cover" || transition == "reveal"){
						var w = fromNode.offsetWidth;
						var s1 = dojo.fx.slideTo({
							node: fromNode,
							duration: 400,
							left: -w*dir,
							top: dojo.style(fromNode, "top")
						});
						var s2 = dojo.fx.slideTo({
							node: toNode,
							duration: 400,
							left: 0,
							top: dojo.style(toNode, "top")
						});
						toNode.style.position = "absolute";
						toNode.style.left = w*dir + "px";
						toNode.style.display = "";
						anim = dojo.fx.combine([s1,s2]);
						dojo.connect(anim, "onEnd", this, function(){
							fromNode.style.display = "none";
							fromNode.style.left = "0px";
							toNode.style.position = "relative";
							var toWidget = dijit.byNode(toNode);
							if(toWidget && !dojo.hasClass(toWidget.domNode, "out")){
								// Reset the temporary padding
								toWidget.containerNode.style.paddingTop = "";
							}
							this.invokeCallback();
						});
						anim.play();
					}else if(transition == "slidev" || transition == "coverv" || transition == "reavealv"){
						var h = fromNode.offsetHeight;
						var s1 = dojo.fx.slideTo({
							node: fromNode,
							duration: 400,
							left: 0,
							top: -h*dir
						});
						var s2 = dojo.fx.slideTo({
							node: toNode,
							duration: 400,
							left: 0,
							top: 0
						});
						toNode.style.position = "absolute";
						toNode.style.top = h*dir + "px";
						toNode.style.left = "0px";
						toNode.style.display = "";
						anim = dojo.fx.combine([s1,s2]);
						dojo.connect(anim, "onEnd", this, function(){
							fromNode.style.display = "none";
							toNode.style.position = "relative";
							this.invokeCallback();
						});
						anim.play();
					}else if(transition == "flip" || transition == "flip2"){
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
					}else {
						// other transitions - "fade", "dissolve", "swirl"
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
					dojox.mobile.currentView = dijit.byNode(toNode);
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
		}
	
		if(dojox.mobile.Switch){
			dojo.extend(dojox.mobile.Switch, {
				_changeState: function(/*String*/state, /*Boolean*/anim){
					// summary:
					//		Function to toggle the switch state on the switch
					// state:
					//		The state to toggle, switch 'on' or 'off'
					// anim:
					//		Whether to use animation or not
					// tags:
					//		private
					var on = (state === "on");
		
					var pos;
					if(!on){
						pos = -this.inner.firstChild.firstChild.offsetWidth;
					}else{
						pos = 0;
					}
		
					this.left.style.display = "";
					this.right.style.display = "";
		
					var _this = this;
					var f = function(){
						dojo.removeClass(_this.domNode, on ? "mblSwitchOff" : "mblSwitchOn");
						dojo.addClass(_this.domNode, on ? "mblSwitchOn" : "mblSwitchOff");
						_this.left.style.display = on ? "" : "none";
						_this.right.style.display = !on ? "" : "none";
					};
		
					if(anim){
						var a = dojo.fx.slideTo({
							node: this.inner,
							duration: 300,
							left: pos,
							onEnd: f
						});
						a.play();
					}else{
						if(on || pos){
							this.inner.style.left = pos + "px";
						}
						f();
					}
				}
			});	
		}
	
		if(dojo.isIE){
			if(dojox.mobile.RoundRect){
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
			}
		
			if(dojox.mobile.RoundRectList){
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
			}
	
			if(dojox.mobile.EdgeToEdgeList){
				dojo.extend(dojox.mobile.EdgeToEdgeList, {
					buildRendering: function(){
					this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("UL");
						this.domNode.className = "mblEdgeToEdgeList";
					}
				});
			}
	
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
			}
		
			dojo.mixin(dojox.mobile, {
				createRoundRect: function(_this, isList){
					// summary:
					//		Function to adjust the creation of rounded rectangles on IE.
					//		Deals with IE's lack of borderRadius support
					// tags:
					//		public
					var i, len;
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
			}
	
		} // if	(dojo.isIE)
	
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

		// override deviceTheme.js
		dojox.mobile.loadCssFile = function(/*String*/file){
			if(dojo.doc.createStyleSheet){
				// for some reason, IE hangs when you try to load
				// multiple css files almost at once.
				setTimeout(function(file){
					return function(){
						dojo.doc.createStyleSheet(file);
					};
				}(file), 0);
			}else{
				dojo.create("LINK", {
					href: file,
					type: "text/css",
					rel: "stylesheet"
				}, dojo.doc.getElementsByTagName('head')[0]);
			}
		};

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
						dojox.mobile.loadCssFile(file);
				}
			}
		};

		dojox.mobile.getCssPaths = function(){
			var paths = [];
			var i, j, len;

			// find @import
			var s = dojo.doc.styleSheets;
			for(i = 0; i < s.length; i++){
				if(s[i].href){ continue; }
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

		dojox.mobile.loadCompatPattern = /\/mobile\/themes\/.*\.css$/;

		dojox.mobile.loadCompatCssFiles = function(){
			// summary:
			//		Function to perform page-level adjustments on browsers such as
			//		IE and firefox.  It loads compat specific css files into the
			//		page header.
			var paths = dojox.mobile.getCssPaths();
			for(var i = 0; i < paths.length; i++){
				var href = paths[i];
				if((href.match(dojox.mobile.loadCompatPattern) || location.href.indexOf("mobile/tests/")) && href.indexOf("-compat.css") == -1){
					var compatCss = href.substring(0, href.length-4)+"-compat.css";
					dojox.mobile.loadCss(compatCss);
				}
			}
		};
	
		dojox.mobile.hideAddressBar = function(/*Event?*/evt, /*Boolean?*/doResize){
		if(doResize !== false){ dojox.mobile.resizeAll(); }
		};

		dojo.addOnLoad(function(){
			if(dojo.config["mblLoadCompatCssFiles"] !== false){
				setTimeout(function(){ // IE needs setTimeout
					dojox.mobile.loadCompatCssFiles();
				}, 0);
			}
			if(dojox.mobile.applyPngFilter){
				dojox.mobile.applyPngFilter();
			}
		});

	} // end of if(!dojo.isWebKit){

	return dojox.mobile.compat;
});

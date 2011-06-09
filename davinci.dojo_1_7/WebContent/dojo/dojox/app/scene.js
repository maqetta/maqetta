define(["dojo","dijit","dojox","dijit/_WidgetBase","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin","dojox/mobile/transition", "./model", "./view", "./bind"], function(dojo,dijit,dojox,WidgetBase,Templated,WidgetsInTemplate,transition, model, baseView, bind){
	
	var marginBox2contentBox = function(/*DomNode*/ node, /*Object*/ mb){
		// summary:
		//		Given the margin-box size of a node, return its content box size.
		//		Functions like dojo.contentBox() but is more reliable since it doesn't have
		//		to wait for the browser to compute sizes.
		var cs = dojo.getComputedStyle(node);
		var me = dojo._getMarginExtents(node, cs);
		var pb = dojo._getPadBorderExtents(node, cs);
		return {
			l: dojo._toPixelValue(node, cs.paddingLeft),
			t: dojo._toPixelValue(node, cs.paddingTop),
			w: mb.w - (me.w + pb.w),
			h: mb.h - (me.h + pb.h)
		};
	};

	var capitalize = function(word){
		return word.substring(0,1).toUpperCase() + word.substring(1);
	};

	var size = function(widget, dim){
		// size the child
		var newSize = widget.resize ? widget.resize(dim) : dojo.marginBox(widget.domNode, dim);
		// record child's size
		if(newSize){
			// if the child returned it's new size then use that
			dojo.mixin(widget, newSize);
		}else{
			// otherwise, call marginBox(), but favor our own numbers when we have them.
			// the browser lies sometimes
			dojo.mixin(widget, dojo.marginBox(widget.domNode));

			dojo.mixin(widget, dim);
		}
	};

	return dojo.declare("dojox.app.scene", [dijit._WidgetBase, dijit._TemplatedMixin, dijit._WidgetsInTemplateMixin], {
		isContainer: true,
		widgetsInTemplate: true,
		defaultView: "default",

		selectedChild: null,
		baseClass: "scene mblView",
		isFullScreen: false,
		defaultViewType: baseView,
		
		//Temporary work around for getting a null when calling getParent
		getParent: function(){return null;},


		constructor: function(params,node){
			this.children={};
			if(params.parent){
				this.parent=params.parent
			}
			if(params.app){
				this.app = params.app;
			}
		},

		buildRendering: function(){
			this.inherited(arguments);
			dojo.style(this.domNode, {width: "100%", "height": "100%"});
			dojo.addClass(this.domNode,"dijitContainer");
		},

		splitChildRef: function(childId){
			var id = childId.split(",");
			if (id.length>0){
				var to = id.shift();
			}else{
				console.warn("invalid child id passed to splitChildRef(): ", childId);
			}

			return {
				id:to || this.defaultView,
				next: id.join(',') 
			}
		},

		loadChild: function(childId,subIds){
			if (!childId) {
				return error("Child ID: '" + childId +"' not found");
			}
	
			var cid = this.id+"_" + childId;
			if (this.children[cid]){
				return this.children[cid];
			}

			if (this.views&& this.views[childId]){
				var conf = this.views[childId];
				if (!conf.dependencies){conf.dependencies=[];}
				var deps = conf.template? conf.dependencies.concat(["dojo/text!app/"+conf.template]) :
						conf.dependencies.concat([]);
			
				var def = new dojo.Deferred();
				if (deps.length>0) {
					require(deps,function(){
						def.resolve.call(def, arguments);			
					});
				}else{
					def.resolve(true);
				}
		
				var self = this;					
				return dojo.when(def, function(){		
					var ctor;
					if (conf.type){
						ctor=dojo.getObject(conf.type);
					}else if (self.defaultViewType){
						ctor=self.defaultViewType;
					}else{
						throw Error("Unable to find appropriate ctor for the base child class");
					}

					var params = dojo.mixin({}, conf, {
						id: self.id + "_" + childId,
						templateString: conf.template?arguments[0][arguments[0].length-1]:"<div></div>",
						parent: self,
						app: self.app
					}) 
					if (subIds){
						params.defaultView=subIds;
					}
                    var child = new ctor(params);
                    //load child's model if it is not loaded before
                    if(!child.loadedModels){
                        child.loadedModels = model(conf.models, self.loadedModels)
                        //TODO need to find out a better way to get all bindable controls in a view
                        bind([child], child.loadedModels);
                    }
					return self.addChild(child);
				});

			}
	
			throw Error("Child '" + childId + "' not found.");
		},

		resize: function(changeSize,resultSize){
			var node = this.domNode;

			// set margin box size, unless it wasn't specified, in which case use current size
			if(changeSize){
				dojo.marginBox(node, changeSize);

				// set offset of the node
				if(changeSize.t){ node.style.top = changeSize.t + "px"; }
				if(changeSize.l){ node.style.left = changeSize.l + "px"; }
			}

			// If either height or width wasn't specified by the user, then query node for it.
			// But note that setting the margin box and then immediately querying dimensions may return
			// inaccurate results, so try not to depend on it.
			var mb = resultSize || {};
			dojo.mixin(mb, changeSize || {});	// changeSize overrides resultSize
			if( !("h" in mb) || !("w" in mb) ){
				mb = dojo.mixin(dojo.marginBox(node), mb);	// just use dojo.marginBox() to fill in missing values
			}

			// Compute and save the size of my border box and content box
			// (w/out calling dojo.contentBox() since that may fail if size was recently set)
			var cs = dojo.getComputedStyle(node);
			var me = dojo._getMarginExtents(node, cs);
			var be = dojo._getBorderExtents(node, cs);
			var bb = (this._borderBox = {
				w: mb.w - (me.w + be.w),
				h: mb.h - (me.h + be.h)
			});
			var pe = dojo._getPadExtents(node, cs);
			this._contentBox = {
				l: dojo._toPixelValue(node, cs.paddingLeft),
				t: dojo._toPixelValue(node, cs.paddingTop),
				w: bb.w - pe.w,
				h: bb.h - pe.h
			};

			// Callback for widget to adjust size of its children
			this.layout();
		},

		layout: function(){
			var fullScreenScene,children,hasCenter;
			//console.log("fullscreen: ", this.selectedChild && this.selectedChild.isFullScreen);
			if (this.selectedChild && this.selectedChild.isFullScreen) {
				console.warn("fullscreen sceen layout");
				/*
				fullScreenScene=true;		
				children=[{domNode: this.selectedChild.domNode,region: "center"}];
				dojo.query("> [region]",this.domNode).forEach(function(c){
					if(this.selectedChild.domNode!==c.domNode){
						dojo.style(c.domNode,"display","none");
					}
				})
				*/
			}else{
				children = dojo.query("> [region]", this.domNode).map(function(node){
					var w = dijit.getEnclosingWidget(node);
					if (w){return w;}

					return {		
						domNode: node,
						region: dojo.attr(node,"region")
					}
						
				});
				if (this.selectedChild){
					children = dojo.filter(children, function(c){
						if (c.region=="center" && this.selectedChild && this.selectedChild.domNode!==c.domNode){
							dojo.style(c.domNode,"z-index",25);
							dojo.style(c.domNode,'display','none');
							return false;
						}else if (c.region!="center"){
							dojo.style(c.domNode,"display","");
							dojo.style(c.domNode,"z-index",100);
						}
					
						return c.domNode && c.region;
					},this);

				//	this.selectedChild.region="center";	
				//	dojo.attr(this.selectedChild.domNode,"region","center");
				//	dojo.style(this.selectedChild.domNode, "display","");
				//	dojo.style(this.selectedChild.domNode,"z-index",50);

				//	children.push({domNode: this.selectedChild.domNode, region: "center"});	
				//	children.push(this.selectedChild);
				//	console.log("children: ", children);
				}else{
					dojo.forEach(children, function(c){
						if (c && c.domNode && c.region=="center"){
							dojo.style(c.domNode,"z-index",25);
							dojo.style(c.domNode,'display','none');
						}	
					});
				}
			
			}	
			this.layoutChildren(this.domNode, this._contentBox, children);
			dojo.forEach(this.getChildren(), function(child){ 
				if (!child._started && child.startup){
					child.startup(); 
				}

			});

		},


		layoutChildren: function(/*DomNode*/ container, /*Object*/ dim, /*Widget[]*/ children,
			/*String?*/ changedRegionId, /*Number?*/ changedRegionSize){
			// summary
			//		Layout a bunch of child dom nodes within a parent dom node
			// container:
			//		parent node
			// dim:
			//		{l, t, w, h} object specifying dimensions of container into which to place children
			// children:
			//		an array of Widgets or at least objects containing:
			//			* domNode: pointer to DOM node to position
			//			* region or layoutAlign: position to place DOM node
			//			* resize(): (optional) method to set size of node
			//			* id: (optional) Id of widgets, referenced from resize object, below.
			// changedRegionId:
			//		If specified, the slider for the region with the specified id has been dragged, and thus
			//		the region's height or width should be adjusted according to changedRegionSize
			// changedRegionSize:
			//		See changedRegionId.
	
			// copy dim because we are going to modify it
			dim = dojo.mixin({}, dim);
	
			dojo.addClass(container, "dijitLayoutContainer");
	
			// Move "client" elements to the end of the array for layout.  a11y dictates that the author
			// needs to be able to put them in the document in tab-order, but this algorithm requires that
			// client be last.    TODO: move these lines to LayoutContainer?   Unneeded other places I think.
			children = dojo.filter(children, function(item){ return item.region != "center" && item.layoutAlign != "client"; })
				.concat(dojo.filter(children, function(item){ return item.region == "center" || item.layoutAlign == "client"; }));
	
			// set positions/sizes
			dojo.forEach(children, function(child){
				var elm = child.domNode,
					pos = (child.region || child.layoutAlign);
	
				// set elem to upper left corner of unused space; may move it later
				var elmStyle = elm.style;
				elmStyle.left = dim.l+"px";
				elmStyle.top = dim.t+"px";
				elmStyle.position = "absolute";
	
				dojo.addClass(elm, "dijitAlign" + capitalize(pos));
	
				// Size adjustments to make to this child widget
				var sizeSetting = {};
	
				// Check for optional size adjustment due to splitter drag (height adjustment for top/bottom align
				// panes and width adjustment for left/right align panes.
				if(changedRegionId && changedRegionId == child.id){
					sizeSetting[child.region == "top" || child.region == "bottom" ? "h" : "w"] = changedRegionSize;
				}
	
				// set size && adjust record of remaining space.
				// note that setting the width of a <div> may affect its height.
				if(pos == "top" || pos == "bottom"){
					sizeSetting.w = dim.w;
					size(child, sizeSetting);
					dim.h -= child.h;
					if(pos == "top"){
						dim.t += child.h;
					}else{
						elmStyle.top = dim.t + dim.h + "px";
					}
				}else if(pos == "left" || pos == "right"){
					sizeSetting.h = dim.h;
					size(child, sizeSetting);
					dim.w -= child.w;
					if(pos == "left"){
						dim.l += child.w;
					}else{
						elmStyle.left = dim.l + dim.w + "px";
					}
				}else if(pos == "client" || pos == "center"){
					size(child, dim);
				}
			});
		},

		getChildren: function(){
			return this._supportingWidgets;
		},

		startup: function(){
			if(this._started){ return; }
			this._started=true;

			var parts = this.defaultView?this.defaultView.split(","):"default";
			toId= parts.shift();
			subIds = parts.join(',');
			//console.log(this.id, "initial load to Id: ", toId, "subs: ", subIds);	

			var subIds;

			if(this.views[this.defaultView] && this.views[this.defaultView]["defaultView"]){
				subIds =  this.views[this.defaultView]["defaultView"];
			}	
			
			if(this.models && !this.loadedModels){
				//if there is this.models config data and the models has not been loaded yet,
				//load models at here using the configuration data and load model logic in model.js
				this.loadedModels = model(this.models);
				bind(this.getChildren(), this.loadedModels);
			}
			
			var next = this.loadChild(toId, subIds);
			dojo.when(next, dojo.hitch(this, function(next){
				this.set("selectedChild", next);
				
				// If I am a not being controlled by a parent layout widget...
				var parent = this.getParent && this.getParent();
				if (!(parent && parent.isLayoutContainer)) {
					// Do recursive sizing and layout of all my descendants
					// (passing in no argument to resize means that it has to glean the size itself)
					this.resize();
					
					// Since my parent isn't a layout container, and my style *may be* width=height=100%
					// or something similar (either set directly or via a CSS class),
					// monitor when my size changes so that I can re-layout.
					// For browsers where I can't directly monitor when my size changes,
					// monitor when the viewport changes size, which *may* indicate a size change for me.
					this.connect(dojo.isIE ? this.domNode : dojo.global, 'onresize', function(){
						// Using function(){} closure to ensure no arguments to resize.
						this.resize();
					});
					
				}
				
				dojo.forEach(this.getChildren(), function(child){
					child.startup();
				});
				
			}));
		},

		addChild: function(widget){
			dojo.addClass(widget.domNode, this.baseClass + "_child");
			widget.region = "center";;
			dojo.attr(widget.domNode,"region","center");
			this._supportingWidgets.push(widget);
			dojo.place(widget.domNode,this.domNode);
			this.children[widget.id] = widget;
			if (this._started){
				this.layout();
			}
			if(this._started && !widget._started){
				widget.startup();
			}
			return widget;
		},

		removeChild: function(widget){
			// summary:
			//		Removes the passed widget instance from this widget but does
			//		not destroy it.  You can also pass in an integer indicating
			//		the index within the container to remove

			if(widget){
				var node = widget.domNode;
				if(node && node.parentNode){
					node.parentNode.removeChild(node); // detach but don't destroy
				}
				return widget;
			}
		},

		_setSelectedChildAttr: function(child,opts){
			if (child !== this.selectedChild) { 
				return dojo.when(child, dojo.hitch(this, function(child){
					if (this.selectedChild){
						if (this.selectedChild.deactivate){
							this.selectedChild.deactivate(); 
						}

						dojo.style(this.selectedChild.domNode,"zIndex",25);
					}
		
					//dojo.style(child.domNode, {
					//	"display": "",
					//	"zIndex": 50,
					//	"overflow": "auto"
					//});
					this.selectedChild = child;
					dojo.style(child.domNode, "display", "");
					dojo.style(child.domNode,"zIndex",50);
					this.selectedChild=child;
					if (this._started) {	
						if (child.startup && !child._started){
							child.startup();
						}else if (child.activate){
							child.activate();
						}
		
					}
					this.layout();
				}));
			}
		},


		transition: function(transitionTo,opts){
			//summary: 
			//  transitions from the currently visible scene to the defined scene.
			//  it should determine what would be the best transition unless
			//  an override in opts tells it to use a specific transitioning methodology
			//  the transitionTo is a string in the form of [view]@[scene].  If
			//  view is left of, the current scene will be transitioned to the default
			//  view of the specified scene (eg @scene2), if the scene is left off
			//  the app controller will instruct the active scene to the view (eg view1).  If both
			//  are supplied (view1@scene2), then the application should transition to the scene,
			//  and instruct the scene to navigate to the view.
			var toId,subIds,next, current = this.selectedChild;
			console.log("scene", this.id, transitionTo);
			if (transitionTo){	
				var parts = transitionTo.split(",");
				toId= parts.shift();
				subIds = parts.join(',');

			}else{
				toId = this.defaultView;
				if(this.views[this.defaultView] && this.views[this.defaultView]["defaultView"]){
					subIds =  this.views[this.defaultView]["defaultView"];
				}	
			}
		
			next = this.loadChild(toId,subIds);

			if (!current){
				//assume this.set(...) will return a promise object if child is first loaded
				//return nothing if child is already in array of this.children
				return this.set("selectedChild",next);	
			}	

			return dojo.when(next, dojo.hitch(this, function(next){
				if (next!==current){
					//assume next is already loaded so that this.set(...) will not return
					//a promise object. this.set(...) will handles the this.selectedChild,
					//activate or deactivate views and refresh layout.
					this.set("selectedChild", next);
					//console.log("current.domNode: ", current.domNode, "next.domNode: ", next.domNode);
					return def = transition(current.domNode,next.domNode,dojo.mixin({},opts,{transition: this.defaultTransition || "none"})).then(dojo.hitch(this, function(){
						//dojo.style(current.domNode, "display", "none");
						if (toId && next.transition){
							return next.transition(subIds,opts);
						}
					}));
				}

				//we didn't need to transition, but continue to propogate.
				if (subIds && next.transition){
					return next.transition(subIds,opts);
				}
			}));
		},
		toString: function(){return this.id},

		activate: function(){},
		deactive: function(){}
	});
});

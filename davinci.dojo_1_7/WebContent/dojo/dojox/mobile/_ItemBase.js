define(["./common","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./ProgressIndicator","./TransitionEvent"], function(mcommon,WidgetBase,Container,Contained,ProgressIndicator,TransitionEvent){
	// module:
	//		dojox/mobile/_ItemBase
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile._ItemBase", [dijit._WidgetBase,dijit._Container,dijit._Contained],{
		icon: "",
		iconPos: "", // top,left,width,height (ex. "0,0,29,29")
		alt: "",
		href: "",
		hrefTarget: "",
		moveTo: "",
		scene: "",
		clickable: false,
		url: "",
		urlTarget: "", // node id under which a new view is created
		transition: "",
		transitionDir: 1,
		transitionOptions: null,
		callback: null,
		sync: true,
		label: "",
		toggle: false,
		_duration: 800, // duration of selection, milliseconds
	
		inheritParams: function(){
			var parent = this.getParent();
			if(parent){
				if(!this.transition){ this.transition = parent.transition; }
				if(this.icon && parent.iconBase &&
					parent.iconBase.charAt(parent.iconBase.length - 1) === '/'){
					this.icon = parent.iconBase + this.icon;
				}
				if(!this.icon){ this.icon = parent.iconBase; }
				if(!this.iconPos){ this.iconPos = parent.iconPos; }
			}
		},
	
		select: function(/*Boolean?*/deselect){
			// subclass must implement
		},
	
		defaultClickAction: function(e){
			if(this.toggle){
				this.select(this.selected);
			}else if(!this.selected){
				this.select();
				if(!this.selectOne){
					var _this = this;
					setTimeout(function(){
						_this.select(true);
					}, this._duration);
				}
				var transOpts;
				if (this.moveTo || this.href || this.url || this.scene){
					transOpts = {moveTo: this.moveTo, href: this.href, url: this.url, scene: this.scene};
				}else if (this.transitionOptions){
					transOpts = this.transitionOptions;
				}	
				if (transOpts){
					return new TransitionEvent(this.domNode,transOpts,e).dispatch();
				}
			}
		},
	
		getParent: function(){
			// almost equivalent to _Contained#getParent, but this method does not
			// cause a script error even if this widget has no parent yet.
			var ref = this.srcNodeRef || this.domNode;
			return ref && ref.parentNode ? dijit.getEnclosingWidget(ref.parentNode) : null;
		},

		setTransitionPos: function(e){
			var w = this;
			while(true){
				w = w.getParent();
				if(!w || w instanceof dojox.mobile.View){ break; }
			}
			if(w){
				w.clickedPosX = e.clientX;
				w.clickedPosY = e.clientY;
			}
		},

		transitionTo: function(moveTo,href,url,scene){
			// deprecated
			if(dojo.config.isDebug){
				var alreadyCalledHash = arguments.callee._ach || (arguments.callee._ach = {}),
					caller = (arguments.callee.caller || "unknown caller").toString();
				if(!alreadyCalledHash[caller]){
					dojo.deprecated(this.declaredClass + "::transitionTo() is deprecated." +
					caller, "", "2.0");
					alreadyCalledHash[caller] = true;
				}
			}
			new TransitionEvent(this.domNode, {moveTo: moveTo, href: href, url: url, scene: scene,
						transition: this.transition, transitionDir: this.transitionDir}).dispatch();
		}
	});
});

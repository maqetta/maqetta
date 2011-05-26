define(["dojo/_base/array","dojo/_base/html","dijit/_WidgetBase","dijit/_Contained","./_ScrollableMixin"],function(darray,dbase,WidgetBase,Contained,ScrollableMixin){
	// module:
	//		dojox/mobile/SpinWheelSlot
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.SpinWheelSlot", [dijit._WidgetBase,dijit._Contained,dojox.mobile._ScrollableMixin], {
		items: [], // Ex. [[0,"Jan"],...]
		labels: [], // Ex. ["Jan","Feb",...]
		labelFrom: 0,
		labelTo: 0,
		maxSpeed: 500,
		minItems: 15,
		centerPos: 0,
		value: "", // initial value
	
		scrollBar: false,
		constraint: false,

		buildRendering: function(){
			this.inherited(arguments);
			dojo.addClass(this.domNode, "mblSpinWheelSlot");

			var i, j, idx;
			if(this.labelFrom !== this.labelTo){
				this.labels = [];
				for(i = this.labelFrom, idx = 0; i <= this.labelTo; i++, idx++){
					this.labels[idx] = String(i);
				}
			}
			if(this.labels.length > 0){
				this.items = [];
				for(i = 0; i < this.labels.length; i++){
					this.items.push([i, this.labels[i]]);
				}
			}

			this.containerNode = dojo.create("DIV", {className:"mblSpinWheelSlotContainer"});
			this.containerNode.style.height
				= (dojo.global.innerHeight||dojo.doc.documentElement.clientHeight) * 2 + "px"; // must bigger than the screen
			this.panelNodes = [];
			for(k = 0; k < 3; k++){
				this.panelNodes[k] = dojo.create("DIV", {className:"mblSpinWheelSlotPanel"});
				var len = this.items.length;
				var n = Math.ceil(this.minItems / len);
				for(j = 0; j < n; j++){
					for(i = 0; i < len; i++){
						dojo.create("DIV", {
							className: "mblSpinWheelSlotLabel",
							name: this.items[i][0],
							innerHTML: this._cv(this.items[i][1])
						}, this.panelNodes[k]);
					}
				}
				this.containerNode.appendChild(this.panelNodes[k]);
			}
			this.domNode.appendChild(this.containerNode);
			this.touchNode = dojo.create("DIV", {className:"mblSpinWheelSlotTouch"}, this.domNode);
		},
	
		startup: function(){
			this.inherited(arguments);
			this.centerPos = this.getParent().centerPos;
			var items = this.panelNodes[1].childNodes;
			this._itemHeight = items[0].offsetHeight;
	
			var _this = this;
			setTimeout(function(){ // to get the correct dimension
				_this.adjust();
			}, 0);
		},
	
		adjust: function(){
			var items = this.panelNodes[1].childNodes;
			var adjustY;
			for(var i = 0, len = items.length; i < len; i++){
				var item = items[i];
				if(item.offsetTop <= this.centerPos && this.centerPos < item.offsetTop + item.offsetHeight){
					adjustY = this.centerPos - (item.offsetTop + Math.round(item.offsetHeight/2));
					break;
				}
			}
			var h = this.panelNodes[0].offsetHeight;
			this.panelNodes[0].style.top = -h + adjustY + "px";
			this.panelNodes[1].style.top = adjustY + "px";
			this.panelNodes[2].style.top = h + adjustY + "px";
		},
	
		setInitialValue: function(){
			if(this.items.length > 0){
				var val = (this.value !== "") ? this.value : this.items[0][1];
				this.setValue(val);
			}
		},
	
		getCenterPanel: function(){
			var pos = this.getPos();
			for(var i = 0, len = this.panelNodes.length; i < len; i++){
				var top = pos.y + this.panelNodes[i].offsetTop;
				if(top <= this.centerPos && this.centerPos < top + this.panelNodes[i].offsetHeight){
					return this.panelNodes[i];
				}
			}
			return null;
		},
	
		setColor: function(/*String*/value){
			for(var i = 0, len = this.panelNodes.length; i < len; i++){
				var items = this.panelNodes[i].childNodes;
				for(var j = 0; j < items.length; j++){
					if(items[j].innerHTML === String(value)){
						dojo.addClass(items[j], "mblSpinWheelSlotLabelBlue");
					}else{
						dojo.removeClass(items[j], "mblSpinWheelSlotLabelBlue");
					}
				}
			}
		},
	
		disableValues: function(/*Array*/values){
			for(var i = 0, len = this.panelNodes.length; i < len; i++){
				var items = this.panelNodes[i].childNodes;
				for(var j = 0; j < items.length; j++){
					dojo.removeClass(items[j], "mblSpinWheelSlotLabelGray");
					for(var k = 0; k < values.length; k++){
						if(items[j].innerHTML === String(values[k])){
							dojo.addClass(items[j], "mblSpinWheelSlotLabelGray");
							break;
						}
					}
				}
			}
		},
	
		getCenterItem: function(){
			var pos = this.getPos();
			var centerPanel = this.getCenterPanel();
			var top = pos.y + centerPanel.offsetTop;
			var items = centerPanel.childNodes;
			for(var i = 0, len = items.length; i < len; i++){
				if(top + items[i].offsetTop <= this.centerPos && this.centerPos < top + items[i].offsetTop + items[i].offsetHeight){
					return items[i];
				}
			}
			return null;
	
		},
	
		getValue: function(){
			return this.getCenterItem().innerHTML;
		},
	
		getKey: function(){
			return this.getCenterItem().getAttribute("name");
		},
	
		setValue: function(newValue){
			var idx0, idx1;
			var curValue = this.getValue();
			var n = this.items.length;
			for(var i = 0; i < n; i++){
				if(this.items[i][1] === String(curValue)){
					idx0 = i;
				}
				if(this.items[i][1] === String(newValue)){
					idx1 = i;
				}
				if(idx0 !== undefined && idx1 !== undefined){
					break;
				}
			}
			var d = idx1 - idx0;
			var m;
			if(d > 0){
				m = (d < n - d) ? -d : n - d;
			}else{
				m = (-d < n + d) ? -d : -(n + d);
			}
			var to = this.getPos();
			to.y += m * this._itemHeight;
			this.slideTo(to, 1);
		},
	
		// override scrollable.js
		getSpeed: function(){
			var y = 0, n = this._time.length;
			var delta = (new Date()).getTime() - this.startTime - this._time[n - 1];
			if(n >= 2 && delta < 200){
				var dy = this._posY[n - 1] - this._posY[(n - 6) >= 0 ? n - 6 : 0];
				var dt = this._time[n - 1] - this._time[(n - 6) >= 0 ? n - 6 : 0];
				y = this.calcSpeed(dy, dt);
			}
			return {x:0, y:y};
		},

		// override scrollable.js
		calcSpeed: function(/*Number*/d, /*Number*/t){
			var speed = this.inherited(arguments);
			if(!speed){ return 0; }
			var v = Math.abs(speed);
			var ret = speed;
			if(v > this.maxSpeed){
				ret = this.maxSpeed*(speed/v);
			}
			return ret;
		},
	
		// override scrollable.js
		adjustDestination: function(to, pos){
			var h = this._itemHeight;
			var j = to.y + Math.round(h/2);
			var a = Math.abs(j);
			var r = j >= 0 ? j % h : j % h + h;
			to.y = j - r;
		},
	
		// override scrollable.js
		slideTo: function(/*Object*/to, /*Number*/duration, /*String*/easing){
			var pos = this.getPos();
			var top = pos.y + this.panelNodes[1].offsetTop;
			var bottom = top + this.panelNodes[1].offsetHeight;
			var vh = this.domNode.parentNode.offsetHeight;
			var t;
			if(pos.y < to.y){ // going down
				if(bottom > vh){
					// move up the bottom panel
					t = this.panelNodes[2];
					t.style.top = this.panelNodes[0].offsetTop - this.panelNodes[0].offsetHeight + "px";
					this.panelNodes[2] = this.panelNodes[1];
					this.panelNodes[1] = this.panelNodes[0];
					this.panelNodes[0] = t;
				}
			}else if(pos.y > to.y){ // going up
				if(top < 0){
					// move down the top panel
					t = this.panelNodes[0];
					t.style.top = this.panelNodes[2].offsetTop + this.panelNodes[2].offsetHeight + "px";
					this.panelNodes[0] = this.panelNodes[1];
					this.panelNodes[1] = this.panelNodes[2];
					this.panelNodes[2] = t;
				}
			}
			if(Math.abs(this._speed.y) < 40){
				duration = 0.2;
			}
			this.inherited(arguments);
		}
	});
});

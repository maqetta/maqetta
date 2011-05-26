define(["./Tooltip", "./Overlay", "./common"], function(Tooltip, Overlay,mcommon) {

	var cls = dojo.declare("dojox.mobile.Opener",
		dojo.hasClass(dojo.doc.documentElement, "dj_phone") ? dojox.mobile.Overlay : dojox.mobile.Tooltip, {
		// summary:
		//		A non-templated popup widget that will use either Tooltip or Overlay depending on screen size
		//
		onShow: function(/*DomNode*/node){},
		onHide: function(/*DomNode*/node, /*Anything*/v){},
		show: function(node, positions){
			this.node = node;
			this.onShow(node);
			if(!this.cover){
				this.cover = dojo.create('div', {style: {position:'absolute', top:'0px', left:'0px', width:'100%', height:'100%', backgroundColor:'transparent' }}, this.domNode, 'before');
				this.connect(this.cover, "onclick", "_onBlur");
			}
			dojo.style(this.cover, "visibility", "visible");
			return this.inherited(arguments);
		},

		hide: function(/*Anything*/ val){
			dojo.style(this.cover, "visibility", "hidden");
			this.inherited(arguments);
			this.onHide(this.node, val);
		},

		_onBlur: function(e){
			if(this.onBlur(e) !== false){ // only exactly false prevents hide()
			        this.hide(e);
			}
		},

		destroy: function(){
			this.inherited(arguments);
			dojo.destroy(this.cover);
		}

	});
	cls.prototype.baseClass += " mblOpener"; // add to either mblOverlay or mblTooltip
	return cls;
});

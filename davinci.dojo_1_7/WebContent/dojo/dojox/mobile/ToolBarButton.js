define(["dojo/_base/array","dojo/_base/html", "./_ItemBase"],function(darray,dhtml, ItemBase){
	// module:
	//		dojox/mobile/ToolBarButton
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.ToolBarButton", dojox.mobile._ItemBase, {
		selected: false,
		_defaultColor: "mblColorDefault",
		_selColor: "mblColorDefaultSel",

		buildRendering: function(){
			this.domNode = this.containerNode = this.srcNodeRef || dojo.doc.createElement("div");
			this.inheritParams();
			dojo.addClass(this.domNode, "mblToolbarButton mblArrowButtonText");
			var color;
			if(this.selected){
				color = this._selColor;
			}else if(this.domNode.className.indexOf("mblColor") == -1){
				color = this._defaultColor;
			}
			dojo.addClass(this.domNode, color);
	
			if(!this.label){
				this.label = this.domNode.innerHTML;
			}
			this.domNode.innerHTML = this._cv(this.label);
	
			if(this.icon && this.icon != "none"){
				var img;
				if(this.iconPos){
					var iconDiv = dojo.create("DIV", null, this.domNode);
					img = dojo.create("IMG", null, iconDiv);
					img.style.position = "absolute";
					var arr = this.iconPos.split(/[ ,]/);
					dojo.style(iconDiv, {
						position: "relative",
						width: arr[2] + "px",
						height: arr[3] + "px"
					});
				}else{
					img = dojo.create("IMG", null, this.domNode);
				}
				img.src = this.icon;
				img.alt = this.alt;
				dojox.mobile.setupIcon(img, this.iconPos);
				this.iconNode = img;
			}else{
				if(dojox.mobile.createDomButton(this.domNode)){
					dojo.addClass(this.domNode, "mblToolbarButtonDomButton");
				}
			}
			this.connect(this.domNode, "onclick", "onClick");
		},
	
		select: function(/*Boolean?*/deselect){
			dojo.toggleClass(this.domNode, this._selColor, !deselect);
			this.selected = !deselect;
		},
	
		onClick: function(e){
			this.setTransitionPos(e);
			this.defaultClickAction();
		}
	});
});

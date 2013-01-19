define([
	"dojo/_base/declare",
	"dojo/dom-style"
], function(declare, domStyle){
	
	return declare("shapes._CircleMixin", [], {
		
		postCreate: function(){
			this._updateBorderRadius();
		},
		
		resize: function(){
			this._updateBorderRadius();
		},
		
		_updateBorderRadius: function(){
			var domNode = this.domNode;
			if(domNode){
				var bw, rx, ry;
				var bwString = domStyle.get(domNode, 'borderWidth');
				if(bwString){
					bw = parseFloat(bwString);
				}
				var w = domNode.offsetWidth;
				var h = domNode.offsetHeight;
				if(isNaN(bw) || bw < 0 || w <= 0 || h <= 0){
					domNode.style.borderTopLeftRadius = '0px';
					domNode.style.borderTopRightRadius = '0px';
					domNode.style.borderBottomLeftRadius = '0px';
					domNode.style.borderBottomRightRadius = '0px';
				}else{
					var rx = (w/2 + bw) + 'px';
					var ry = (h/2 + bw) + 'px';
					var val = rx + ' ' + ry;
					domNode.style.borderTopLeftRadius = val;
					domNode.style.borderTopRightRadius = val;
					domNode.style.borderBottomLeftRadius = val;
					domNode.style.borderBottomRightRadius = val;
				}
			}
		}
		
	});
});

/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/Tooltip",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dijit/place","dijit/_WidgetBase"],function(_1,_2,_3,_4,_5){
return _1.declare("dojox.mobile.Tooltip",dijit._WidgetBase,{baseClass:"mblTooltip mblTooltipHidden",buildRendering:function(){
this.inherited(arguments);
this.anchor=_1.create("div",{"class":"mblTooltipAnchor"},this.domNode,"first");
this.arrow=_1.create("div",{"class":"mblTooltipArrow"},this.anchor);
this.innerArrow=_1.create("div",{"class":"mblTooltipInnerArrow"},this.anchor);
},show:function(_6,_7){
var _8={"MRM":"mblTooltipAfter","MLM":"mblTooltipBefore","BMT":"mblTooltipBelow","TMB":"mblTooltipAbove","BLT":"mblTooltipBelow","TLB":"mblTooltipAbove","BRT":"mblTooltipBelow","TRB":"mblTooltipAbove","TLT":"mblTooltipBefore","TRT":"mblTooltipAfter","BRB":"mblTooltipAfter","BLB":"mblTooltipBefore"};
_1.removeClass(this.domNode,["mblTooltipAfter","mblTooltipBefore","mblTooltipBelow","mblTooltipAbove"]);
var _9=_4.around(this.domNode,_6,_7||["below-centered","above-centered","after","before"],this.isLeftToRight());
var _a=_8[_9.corner+_9.aroundCorner.charAt(0)]||"";
_1.addClass(this.domNode,_a);
var _b=_1.position(_6,true);
_1.style(this.anchor,(_a=="mblTooltipAbove"||_a=="mblTooltipBelow")?{top:"",left:Math.max(0,_b.x-_9.x+(_b.w>>1)-(this.arrow.offsetWidth>>1))+"px"}:{left:"",top:Math.max(0,_b.y-_9.y+(_b.h>>1)-(this.arrow.offsetHeight>>1))+"px"});
_1.replaceClass(this.domNode,"mblTooltipVisible","mblTooltipHidden");
this.resize=_1.hitch(this,"show",_6,_7);
return _9;
},hide:function(){
this.resize=undefined;
_1.replaceClass(this.domNode,"mblTooltipHidden","mblTooltipVisible");
},onBlur:function(e){
return true;
},destroy:function(){
if(this.anchor){
this.anchor.removeChild(this.innerArrow);
this.anchor.removeChild(this.arrow);
this.domNode.removeChild(this.anchor);
this.anchor=this.arrow=this.innerArrow=undefined;
}
this.inherited(arguments);
}});
});

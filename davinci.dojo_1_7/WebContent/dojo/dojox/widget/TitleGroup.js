/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/widget/TitleGroup",["dojo","dijit","dijit/_Widget","dijit/TitlePane"],function(_1,_2,_3,_4){
var d=_1,tp=_4.prototype,_5=function(){
var _6=this._dxfindParent&&this._dxfindParent();
_6&&_6.selectChild(this);
};
tp._dxfindParent=function(){
var n=this.domNode.parentNode;
if(n){
n=_2.getEnclosingWidget(n);
return n&&n instanceof dojox.widget.TitleGroup&&n;
}
return n;
};
d.connect(tp,"_onTitleClick",_5);
d.connect(tp,"_onTitleKey",function(e){
if(!(e&&e.type&&e.type=="keypress"&&e.charOrCode==d.keys.TAB)){
_5.apply(this,arguments);
}
});
return d.declare("dojox.widget.TitleGroup",_2._Widget,{"class":"dojoxTitleGroup",addChild:function(_7,_8){
return _7.placeAt(this.domNode,_8);
},removeChild:function(_9){
this.domNode.removeChild(_9.domNode);
return _9;
},selectChild:function(_a){
_a&&_1.query("> .dijitTitlePane",this.domNode).forEach(function(n){
var tp=_2.byNode(n);
tp&&tp!==_a&&tp.open&&tp.toggle();
});
return _a;
}});
});

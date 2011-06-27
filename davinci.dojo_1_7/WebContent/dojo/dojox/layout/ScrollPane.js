/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/ScrollPane",["dojo","dijit","dojox","dijit/layout/ContentPane","dijit/_Templated"],function(_1,_2,_3){
_1.getObject("dojox.layout.ScrollPane",1);
_1.experimental("dojox.layout.ScrollPane");
_1.declare("dojox.layout.ScrollPane",[_2.layout.ContentPane,_2._Templated],{_line:null,_lo:null,_offset:15,orientation:"vertical",autoHide:true,templateString:_1.cache("dojox.layout","resources/ScrollPane.html","<div class=\"dojoxScrollWindow\" dojoAttachEvent=\"onmouseenter: _enter, onmouseleave: _leave\">\n    <div class=\"dojoxScrollWrapper\" style=\"${style}\" dojoAttachPoint=\"wrapper\" dojoAttachEvent=\"onmousemove: _calc\">\n\t<div class=\"dojoxScrollPane\" dojoAttachPoint=\"containerNode\"></div>\n    </div>\n    <div dojoAttachPoint=\"helper\" class=\"dojoxScrollHelper\"><span class=\"helperInner\">|</span></div>\n</div>"),resize:function(_4){
if(_4){
if(_4.h){
_1.style(this.domNode,"height",_4.h+"px");
}
if(_4.w){
_1.style(this.domNode,"width",_4.w+"px");
}
}
var _5=this._dir,_6=this._vertical,_7=this.containerNode[(_6?"scrollHeight":"scrollWidth")];
_1.style(this.wrapper,this._dir,this.domNode.style[this._dir]);
this._lo=_1.coords(this.wrapper,true);
this._size=Math.max(0,_7-this._lo[(_6?"h":"w")]);
if(!this._size){
this.helper.style.display="none";
this.wrapper[this._scroll]=0;
return;
}else{
this.helper.style.display="";
}
this._line=new _1._Line(0-this._offset,this._size+(this._offset*2));
var u=this._lo[(_6?"h":"w")],r=Math.min(1,u/_7),s=u*r,c=Math.floor(u-(u*r));
this._helpLine=new _1._Line(0,c);
_1.style(this.helper,_5,Math.floor(s)+"px");
},postCreate:function(){
this.inherited(arguments);
if(this.autoHide){
this._showAnim=_1._fade({node:this.helper,end:0.5,duration:350});
this._hideAnim=_1.fadeOut({node:this.helper,duration:750});
}
this._vertical=(this.orientation=="vertical");
if(!this._vertical){
_1.addClass(this.containerNode,"dijitInline");
this._dir="width";
this._edge="left";
this._scroll="scrollLeft";
}else{
this._dir="height";
this._edge="top";
this._scroll="scrollTop";
}
if(this._hideAnim){
this._hideAnim.play();
}
_1.style(this.wrapper,"overflow","hidden");
},_set:function(n){
if(!this._size){
return;
}
this.wrapper[this._scroll]=Math.floor(this._line.getValue(n));
_1.style(this.helper,this._edge,Math.floor(this._helpLine.getValue(n))+"px");
},_calc:function(e){
if(!this._lo){
this.resize();
}
this._set(this._vertical?((e.pageY-this._lo.y)/this._lo.h):((e.pageX-this._lo.x)/this._lo.w));
},_enter:function(e){
if(this._hideAnim){
if(this._hideAnim.status()=="playing"){
this._hideAnim.stop();
}
this._showAnim.play();
}
},_leave:function(e){
if(this._hideAnim){
this._hideAnim.play();
}
}});
return _1.getObject("dojox.layout.ScrollPane");
});
require(["dojox/layout/ScrollPane"]);

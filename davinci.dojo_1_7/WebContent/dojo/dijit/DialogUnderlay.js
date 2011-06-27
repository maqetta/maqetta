/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/DialogUnderlay",["dojo/_base/kernel",".","dojo/window","./_Widget","./_TemplatedMixin","./BackgroundIframe","dojo/_base/declare","dojo/_base/html","dojo/_base/window"],function(_1,_2){
_1.declare("dijit.DialogUnderlay",[_2._Widget,_2._TemplatedMixin],{templateString:"<div class='dijitDialogUnderlayWrapper'><div class='dijitDialogUnderlay' dojoAttachPoint='node'></div></div>",dialogId:"","class":"",_setDialogIdAttr:function(id){
_1.attr(this.node,"id",id+"_underlay");
this._set("dialogId",id);
},_setClassAttr:function(_3){
this.node.className="dijitDialogUnderlay "+_3;
this._set("class",_3);
},postCreate:function(){
_1.body().appendChild(this.domNode);
},layout:function(){
var is=this.node.style,os=this.domNode.style;
os.display="none";
var _4=_1.window.getBox();
os.top=_4.t+"px";
os.left=_4.l+"px";
is.width=_4.w+"px";
is.height=_4.h+"px";
os.display="block";
},show:function(){
this.domNode.style.display="block";
this.layout();
this.bgIframe=new _2.BackgroundIframe(this.domNode);
},hide:function(){
this.bgIframe.destroy();
delete this.bgIframe;
this.domNode.style.display="none";
}});
return _2.DialogUnderlay;
});

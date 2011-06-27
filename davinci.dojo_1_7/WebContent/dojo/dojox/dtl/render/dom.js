/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/render/dom",["dojo/_base/kernel","dojo/_base/lang","../Context","../dom","dojo/_base/html","dojo/_base/kernel"],function(_1,_2,_3){
_1.getObject("dtl.render.dom",true,dojox);
dojox.dtl.render.dom.Render=function(_4,_5){
this._tpl=_5;
this.domNode=_1.byId(_4);
};
_1.extend(dojox.dtl.render.dom.Render,{setAttachPoint:function(_6){
this.domNode=_6;
},render:function(_7,_8,_9){
if(!this.domNode){
throw new Error("You cannot use the Render object without specifying where you want to render it");
}
this._tpl=_8=_8||this._tpl;
_9=_9||_8.getBuffer();
_7=_7||new _3();
var _a=_8.render(_7,_9).getParent();
if(!_a){
throw new Error("Rendered template does not have a root node");
}
if(this.domNode!==_a){
this.domNode.parentNode.replaceChild(_a,this.domNode);
this.domNode=_a;
}
}});
return dojox.dtl.render.dom;
});

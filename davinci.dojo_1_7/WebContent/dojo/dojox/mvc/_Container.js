/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mvc/_Container",["dojo/_base/declare","dojo/parser","dojo/_base/lang","dijit/_WidgetBase"],function(_1,_2,_3,_4){
return _1("dojox.mvc._Container",[_4],{stopParser:true,templateString:"",_containedWidgets:[],_createBody:function(){
this._containedWidgets=_2.parse(this.srcNodeRef,{template:true,inherited:{dir:this.dir,lang:this.lang},propsThis:this,scope:"dojo"});
},_destroyBody:function(){
if(this._containedWidgets&&this._containedWidgets.length>0){
for(var n=this._containedWidgets.length-1;n>-1;n--){
var w=this._containedWidgets[n];
if(w&&!w._destroyed&&w.destroy){
w.destroy();
}
}
}
},_exprRepl:function(_5){
var _6=this,_7=function(_8,_9){
if(!_8){
return "";
}
var _a=_8.substr(2);
_a=_a.substr(0,_a.length-1);
return eval(_a,_6);
};
_7=_3.hitch(this,_7);
return _5.replace(/\$\{.*?\}/g,function(_b,_c,_d){
return _7(_b,_c).toString();
});
}});
});

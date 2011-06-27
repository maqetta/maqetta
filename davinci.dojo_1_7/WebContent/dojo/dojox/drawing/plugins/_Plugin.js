/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/plugins/_Plugin",["dojo","../util/oo"],function(_1){
_1.getObject("drawing.plugins.tools",true,dojox);
dojox.drawing.plugins._Plugin=dojox.drawing.util.oo.declare(function(_2){
this._cons=[];
_1.mixin(this,_2);
if(this.button&&this.onClick){
this.connect(this.button,"onClick",this,"onClick");
}
},{util:null,keys:null,mouse:null,drawing:null,stencils:null,anchors:null,canvas:null,node:null,button:null,type:"dojox.drawing.plugins._Plugin",connect:function(){
this._cons.push(_1.connect.apply(_1,arguments));
},disconnect:function(_3){
if(!_3){
return;
}
if(!_1.isArray(_3)){
_3=[_3];
}
_1.forEach(_3,_1.disconnect,_1);
}});
return dojox.drawing.plugins._Plugin;
});

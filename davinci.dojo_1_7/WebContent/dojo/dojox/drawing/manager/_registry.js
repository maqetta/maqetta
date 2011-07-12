/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/manager/_registry",["dojo","../../drawing"],function(_1){
_1.getObject("drawing.stencil",true,dojox);
var _2={tool:{},stencil:{},drawing:{},plugin:{},button:{}};
dojox.drawing.register=function(_3,_4){
if(_4=="drawing"){
_2.drawing[_3.id]=_3;
}else{
if(_4=="tool"){
_2.tool[_3.name]=_3;
}else{
if(_4=="stencil"){
_2.stencil[_3.name]=_3;
}else{
if(_4=="plugin"){
_2.plugin[_3.name]=_3;
}else{
if(_4=="button"){
_2.button[_3.toolType]=_3;
}
}
}
}
}
};
dojox.drawing.getRegistered=function(_5,id){
return id?_2[_5][id]:_2[_5];
};
});

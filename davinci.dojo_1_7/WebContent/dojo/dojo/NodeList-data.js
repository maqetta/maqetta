/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/NodeList-data",["./main"],function(_1){
var _2={},x=0,_3="data-dojo-dataid",nl=_1.NodeList,_4=function(_5){
var _6=_1.attr(_5,_3);
if(!_6){
_6="pid"+(x++);
_1.attr(_5,_3,_6);
}
return _6;
};
var _7=_1._nodeData=function(_8,_9,_a){
var _b=_4(_8),r;
if(!_2[_b]){
_2[_b]={};
}
if(arguments.length==1){
r=_2[_b];
}
if(typeof _9=="string"){
if(arguments.length>2){
_2[_b][_9]=_a;
}else{
r=_2[_b][_9];
}
}else{
r=_1._mixin(_2[_b],_9);
}
return r;
};
var _c=_1._removeNodeData=function(_d,_e){
var _f=_4(_d);
if(_2[_f]){
if(_e){
delete _2[_f][_e];
}else{
delete _2[_f];
}
}
};
_1._gcNodeData=function(){
var _10=_1.query("["+_3+"]").map(_4);
for(var i in _2){
if(_1.indexOf(_10,i)<0){
delete _2[i];
}
}
};
_1.extend(nl,{data:nl._adaptWithCondition(_7,function(a){
return a.length===0||a.length==1&&(typeof a[0]=="string");
}),removeData:nl._adaptAsForEach(_c)});
return _1.NodeList;
});

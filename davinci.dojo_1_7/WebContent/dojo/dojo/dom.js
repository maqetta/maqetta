/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dom",["./_base/kernel","./_base/sniff","./_base/lang","./_base/window"],function(_1,_2,_3,_4){
try{
document.execCommand("BackgroundImageCache",false,true);
}
catch(e){
}
if(_2.isIE){
_1.byId=function(id,_5){
if(typeof id!="string"){
return id;
}
var _6=_5||_4.doc,te=_6.getElementById(id);
if(te&&(te.attributes.id.value==id||te.id==id)){
return te;
}else{
var _7=_6.all[id];
if(!_7||_7.nodeName){
_7=[_7];
}
var i=0;
while((te=_7[i++])){
if((te.attributes&&te.attributes.id&&te.attributes.id.value==id)||te.id==id){
return te;
}
}
}
};
}else{
_1.byId=function(id,_8){
return ((typeof id=="string")?(_8||_4.doc).getElementById(id):id)||null;
};
}
_1.isDescendant=function(_9,_a){
try{
_9=_1.byId(_9);
_a=_1.byId(_a);
while(_9){
if(_9==_a){
return true;
}
_9=_9.parentNode;
}
}
catch(e){
}
return false;
};
_1.setSelectable=function(_b,_c){
_b=_1.byId(_b);
if(_2.isMozilla){
_b.style.MozUserSelect=_c?"":"none";
}else{
if(_2.isKhtml||_2.isWebKit){
_b.style.KhtmlUserSelect=_c?"auto":"none";
}else{
if(_2.isIE){
var v=(_b.unselectable=_c?"":"on"),cs=_b.getElementsByTagName("*"),i=0,l=cs.length;
for(;i<l;++i){
cs.item(i).unselectable=v;
}
}
}
}
};
return {byId:_1.byId,isDescendant:_1.isDescendant,setSelectable:_1.setSelectable};
});

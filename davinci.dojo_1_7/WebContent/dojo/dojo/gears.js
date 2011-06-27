/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/gears",["./main"],function(_1){
_1.getObject("gears",true,_1);
_1.gears._gearsObject=function(){
var _2;
var _3=_1.getObject("google.gears");
if(_3){
return _3;
}
if(typeof GearsFactory!="undefined"){
_2=new GearsFactory();
}else{
if(_1.isIE){
try{
_2=new ActiveXObject("Gears.Factory");
}
catch(e){
}
}else{
if(navigator.mimeTypes["application/x-googlegears"]){
_2=document.createElement("object");
_2.setAttribute("type","application/x-googlegears");
_2.setAttribute("width",0);
_2.setAttribute("height",0);
_2.style.display="none";
document.documentElement.appendChild(_2);
}
}
}
if(!_2){
return null;
}
_1.setObject("google.gears.factory",_2);
return _1.getObject("google.gears");
};
_1.gears.available=(!!_1.gears._gearsObject())||0;
return _1.gears;
});

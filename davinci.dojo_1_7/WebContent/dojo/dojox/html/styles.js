/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/html/styles",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/array","dojo/_base/window"],function(d){
var dh=d.getObject("html",true,dojox);
var _1={};
var _2={};
var _3=[];
dh.insertCssRule=function(_4,_5,_6){
var ss=dh.getDynamicStyleSheet(_6);
var _7=_4+" {"+_5+"}";
if(d.isIE){
ss.cssText+=_7;
}else{
if(ss.sheet){
ss.sheet.insertRule(_7,ss._indicies.length);
}else{
ss.appendChild(d.doc.createTextNode(_7));
}
}
ss._indicies.push(_4+" "+_5);
return _4;
};
dh.removeCssRule=function(_8,_9,_a){
var ss;
var _b=-1;
var nm;
var i;
for(nm in _1){
if(_a&&_a!==nm){
continue;
}
ss=_1[nm];
for(i=0;i<ss._indicies.length;i++){
if(_8+" "+_9===ss._indicies[i]){
_b=i;
break;
}
}
if(_b>-1){
break;
}
}
if(!ss){
console.warn("No dynamic style sheet has been created from which to remove a rule.");
return false;
}
if(_b===-1){
console.warn("The css rule was not found and could not be removed.");
return false;
}
ss._indicies.splice(_b,1);
if(d.isIE){
ss.removeRule(_b);
}else{
if(ss.sheet){
ss.sheet.deleteRule(_b);
}else{
if(document.styleSheets[0]){
}
}
}
return true;
};
dh.modifyCssRule=function(_c,_d,_e){
};
dh.getStyleSheet=function(_f){
if(_1[_f||"default"]){
return _1[_f||"default"];
}
if(!_f){
return false;
}
var _10=dh.getStyleSheets();
if(_10[_f]){
return dh.getStyleSheets()[_f];
}
var nm;
for(nm in _10){
if(_10[nm].href&&_10[nm].href.indexOf(_f)>-1){
return _10[nm];
}
}
return false;
};
dh.getDynamicStyleSheet=function(_11){
if(!_11){
_11="default";
}
if(!_1[_11]){
if(d.doc.createStyleSheet){
_1[_11]=d.doc.createStyleSheet();
if(d.isIE<9){
_1[_11].title=_11;
}
}else{
_1[_11]=d.doc.createElement("style");
_1[_11].setAttribute("type","text/css");
d.doc.getElementsByTagName("head")[0].appendChild(_1[_11]);
}
_1[_11]._indicies=[];
}
return _1[_11];
};
dh.enableStyleSheet=function(_12){
var ss=dh.getStyleSheet(_12);
if(ss){
if(ss.sheet){
ss.sheet.disabled=false;
}else{
ss.disabled=false;
}
}
};
dh.disableStyleSheet=function(_13){
var ss=dh.getStyleSheet(_13);
if(ss){
if(ss.sheet){
ss.sheet.disabled=true;
}else{
ss.disabled=true;
}
}
};
dh.activeStyleSheet=function(_14){
var _15=dh.getToggledStyleSheets();
var i;
if(arguments.length===1){
d.forEach(_15,function(s){
s.disabled=(s.title===_14)?false:true;
});
}else{
for(i=0;i<_15.length;i++){
if(_15[i].disabled===false){
return _15[i];
}
}
}
return true;
};
dh.getPreferredStyleSheet=function(){
};
dh.getToggledStyleSheets=function(){
var nm;
if(!_3.length){
var _16=dh.getStyleSheets();
for(nm in _16){
if(_16[nm].title){
_3.push(_16[nm]);
}
}
}
return _3;
};
dh.getStyleSheets=function(){
if(_2.collected){
return _2;
}
var _17=d.doc.styleSheets;
d.forEach(_17,function(n){
var s=(n.sheet)?n.sheet:n;
var _18=s.title||s.href;
if(d.isIE){
if(s.cssText.indexOf("#default#VML")===-1){
if(s.href){
_2[_18]=s;
}else{
if(s.imports.length){
d.forEach(s.imports,function(si){
_2[si.title||si.href]=si;
});
}else{
_2[_18]=s;
}
}
}
}else{
_2[_18]=s;
_2[_18].id=s.ownerNode.id;
d.forEach(s.cssRules,function(r){
if(r.href){
_2[r.href]=r.styleSheet;
_2[r.href].id=s.ownerNode.id;
}
});
}
});
_2.collected=true;
return _2;
};
return dh;
});

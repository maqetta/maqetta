/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/dom-class",["./_base/kernel","./_base/lang","./dom"],function(_1,_2,_3){
var _4="className";
_1.hasClass=function(_5,_6){
return ((" "+_3.byId(_5)[_4]+" ").indexOf(" "+_6+" ")>=0);
};
var _7=/\s+/,a1=[""],_8={},_9=function(s){
if(typeof s=="string"||s instanceof String){
if(s.indexOf(" ")<0){
a1[0]=s;
return a1;
}else{
return s.split(_7);
}
}
return s||"";
};
_1.addClass=function(_a,_b){
_a=_3.byId(_a);
_b=_9(_b);
var _c=_a[_4],_d;
_c=_c?" "+_c+" ":" ";
_d=_c.length;
for(var i=0,_e=_b.length,c;i<_e;++i){
c=_b[i];
if(c&&_c.indexOf(" "+c+" ")<0){
_c+=c+" ";
}
}
if(_d<_c.length){
_a[_4]=_c.substr(1,_c.length-2);
}
};
_1.removeClass=function(_f,_10){
_f=_3.byId(_f);
var cls;
if(_10!==undefined){
_10=_9(_10);
cls=" "+_f[_4]+" ";
for(var i=0,len=_10.length;i<len;++i){
cls=cls.replace(" "+_10[i]+" "," ");
}
cls=_2.trim(cls);
}else{
cls="";
}
if(_f[_4]!=cls){
_f[_4]=cls;
}
};
_1.replaceClass=function(_11,_12,_13){
_11=_3.byId(_11);
_8[_4]=_11[_4];
_1.removeClass(_8,_13);
_1.addClass(_8,_12);
if(_11[_4]!==_8[_4]){
_11[_4]=_8[_4];
}
};
_1.toggleClass=function(_14,_15,_16){
if(_16===undefined){
_16=!_1.hasClass(_14,_15);
}
_1[_16?"addClass":"removeClass"](_14,_15);
return _16;
};
return {has:_1.hasClass,add:_1.addClass,remove:_1.removeClass,replace:_1.replaceClass,toggle:_1.toggleClass};
});

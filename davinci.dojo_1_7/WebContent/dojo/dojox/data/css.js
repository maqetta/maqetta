/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/css",["dojo","dojox"],function(_1,_2){
if(!_2.data){
_2.data={};
}
if(!_2.data.css){
_2.data.css={};
}
_2.data.css.rules={};
_2.data.css.rules.forEach=function(fn,_3,_4){
if(_4){
var _5=function(_6){
_1.forEach(_6[_6.cssRules?"cssRules":"rules"],function(_7){
if(!_7.type||_7.type!==3){
var _8="";
if(_6&&_6.href){
_8=_6.href;
}
fn.call(_3?_3:this,_7,_6,_8);
}
});
};
_1.forEach(_4,_5);
}
};
_2.data.css.findStyleSheets=function(_9){
var _a=[];
var _b=function(_c){
var s=_2.data.css.findStyleSheet(_c);
if(s){
_1.forEach(s,function(_d){
if(_1.indexOf(_a,_d)===-1){
_a.push(_d);
}
});
}
};
_1.forEach(_9,_b);
return _a;
};
_2.data.css.findStyleSheet=function(_e){
var _f=[];
if(_e.charAt(0)==="."){
_e=_e.substring(1);
}
var _10=function(_11){
if(_11.href&&_11.href.match(_e)){
_f.push(_11);
return true;
}
if(_11.imports){
return _1.some(_11.imports,function(_12){
return _10(_12);
});
}
return _1.some(_11[_11.cssRules?"cssRules":"rules"],function(_13){
if(_13.type&&_13.type===3&&_10(_13.styleSheet)){
return true;
}
return false;
});
};
_1.some(document.styleSheets,_10);
return _f;
};
_2.data.css.determineContext=function(_14){
var ret=[];
if(_14&&_14.length>0){
_14=_2.data.css.findStyleSheets(_14);
}else{
_14=document.styleSheets;
}
var _15=function(_16){
ret.push(_16);
if(_16.imports){
_1.forEach(_16.imports,function(_17){
_15(_17);
});
}
_1.forEach(_16[_16.cssRules?"cssRules":"rules"],function(_18){
if(_18.type&&_18.type===3){
_15(_18.styleSheet);
}
});
};
_1.forEach(_14,_15);
return ret;
};
return _2.data.css;
});

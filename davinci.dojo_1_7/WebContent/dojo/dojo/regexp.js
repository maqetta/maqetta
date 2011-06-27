/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/regexp",["./_base/kernel"],function(_1){
_1.getObject("regexp",true,_1);
_1.regexp.escapeString=function(_2,_3){
return _2.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,function(ch){
if(_3&&_3.indexOf(ch)!=-1){
return ch;
}
return "\\"+ch;
});
};
_1.regexp.buildGroupRE=function(_4,re,_5){
if(!(_4 instanceof Array)){
return re(_4);
}
var b=[];
for(var i=0;i<_4.length;i++){
b.push(re(_4[i]));
}
return _1.regexp.group(b.join("|"),_5);
};
_1.regexp.group=function(_6,_7){
return "("+(_7?"?:":"")+_6+")";
};
return _1.regexp;
});

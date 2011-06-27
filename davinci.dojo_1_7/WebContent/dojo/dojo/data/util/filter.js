/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/data/util/filter",["../.."],function(_1){
_1.getObject("data.util.filter",true,_1);
_1.data.util.filter.patternToRegExp=function(_2,_3){
var _4="^";
var c=null;
for(var i=0;i<_2.length;i++){
c=_2.charAt(i);
switch(c){
case "\\":
_4+=c;
i++;
_4+=_2.charAt(i);
break;
case "*":
_4+=".*";
break;
case "?":
_4+=".";
break;
case "$":
case "^":
case "/":
case "+":
case ".":
case "|":
case "(":
case ")":
case "{":
case "}":
case "[":
case "]":
_4+="\\";
default:
_4+=c;
}
}
_4+="$";
if(_3){
return new RegExp(_4,"mi");
}else{
return new RegExp(_4,"m");
}
};
return _1.data.util.filter;
});

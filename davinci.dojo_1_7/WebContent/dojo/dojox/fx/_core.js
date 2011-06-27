/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/fx/_core",[".","dojo/_base/array"],function(_1,_2){
dojox.fx._Line=function(_3,_4){
this.start=_3;
this.end=_4;
var _5=_2.isArray(_3),d=(_5?[]:_4-_3);
if(_5){
_2.forEach(this.start,function(s,i){
d[i]=this.end[i]-s;
},this);
this.getValue=function(n){
var _6=[];
_2.forEach(this.start,function(s,i){
_6[i]=(d[i]*n)+s;
},this);
return _6;
};
}else{
this.getValue=function(n){
return (d*n)+this.start;
};
}
};
return dojox.fx._Line;
});

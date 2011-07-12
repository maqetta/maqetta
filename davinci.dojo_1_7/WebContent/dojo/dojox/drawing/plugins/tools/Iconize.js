/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/drawing/plugins/tools/Iconize",["dojo","../../util/oo","../_Plugin","../../manager/_registry"],function(_1){
dojox.drawing.plugins.tools.Iconize=dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin,function(_2){
},{onClick:function(){
var _3;
for(var nm in this.stencils.stencils){
if(this.stencils.stencils[nm].shortType=="path"){
_3=this.stencils.stencils[nm];
break;
}
}
if(_3){
this.makeIcon(_3.points);
}
},makeIcon:function(p){
var _4=function(n){
return Number(n.toFixed(1));
};
var x=10000;
var y=10000;
p.forEach(function(pt){
if(pt.x!==undefined&&!isNaN(pt.x)){
x=Math.min(x,pt.x);
y=Math.min(y,pt.y);
}
});
var _5=0;
var _6=0;
p.forEach(function(pt){
if(pt.x!==undefined&&!isNaN(pt.x)){
pt.x=_4(pt.x-x);
pt.y=_4(pt.y-y);
_5=Math.max(_5,pt.x);
_6=Math.max(_6,pt.y);
}
});
var s=60;
var m=20;
p.forEach(function(pt){
pt.x=_4(pt.x/_5)*s+m;
pt.y=_4(pt.y/_6)*s+m;
});
var _7="[\n";
_1.forEach(p,function(pt,i){
_7+="{\t";
if(pt.t){
_7+="t:'"+pt.t+"'";
}
if(pt.x!==undefined&&!isNaN(pt.x)){
if(pt.t){
_7+=", ";
}
_7+="x:"+pt.x+",\t\ty:"+pt.y;
}
_7+="\t}";
if(i!=p.length-1){
_7+=",";
}
_7+="\n";
});
_7+="]";
var n=_1.byId("data");
if(n){
n.value=_7;
}
}});
dojox.drawing.plugins.tools.Iconize.setup={name:"dojox.drawing.plugins.tools.Iconize",tooltip:"Iconize Tool",iconClass:"iconPan"};
dojox.drawing.register(dojox.drawing.plugins.tools.Iconize.setup,"plugin");
return dojox.drawing.plugins.tools.Iconize;
});

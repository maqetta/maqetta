/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/ext-dojo/NodeList",["dojo/_base/kernel","dojo/_base/lang","../_base"],function(_1,_2,dd){
_1.getObject("dtl.ext-dojo.NodeList",true,dojox);
_1.extend(_1.NodeList,{dtl:function(_3,_4){
var d=dd;
var _5=this;
var _6=function(_7,_8){
var _9=_7.render(new d._Context(_8));
_5.forEach(function(_a){
_a.innerHTML=_9;
});
};
d.text._resolveTemplateArg(_3).addCallback(function(_b){
_3=new d.Template(_b);
d.text._resolveContextArg(_4).addCallback(function(_c){
_6(_3,_c);
});
});
return this;
}});
return dojox.dtl.ext-_1.NodeList;
});

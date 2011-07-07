/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/NodeList","dojo/NodeList-fx","../style"],function(){
dojo.extend(dojo.NodeList,{addClassFx:function(_1,_2){
return dojo.fx.combine(this.map(function(n){
return dojox.fx.addClass(n,_1,_2);
}));
},removeClassFx:function(_3,_4){
return dojo.fx.combine(this.map(function(n){
return dojox.fx.removeClass(n,_3,_4);
}));
},toggleClassFx:function(_5,_6,_7){
return dojo.fx.combine(this.map(function(n){
return dojox.fx.toggleClass(n,_5,_6,_7);
}));
}});
return dojo.NodeList;
});

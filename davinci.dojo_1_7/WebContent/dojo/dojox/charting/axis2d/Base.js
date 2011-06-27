/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/axis2d/Base",["dojo/_base/kernel","dojo/_base/declare","../Element"],function(_1,_2,_3){
return _1.declare("dojox.charting.axis2d.Base",dojox.charting.Element,{constructor:function(_4,_5){
this.vertical=_5&&_5.vertical;
},clear:function(){
return this;
},initialized:function(){
return false;
},calculate:function(_6,_7,_8){
return this;
},getScaler:function(){
return null;
},getTicks:function(){
return null;
},getOffsets:function(){
return {l:0,r:0,t:0,b:0};
},render:function(_9,_a){
this.dirty=false;
return this;
}});
});

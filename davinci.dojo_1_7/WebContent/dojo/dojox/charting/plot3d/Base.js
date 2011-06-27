/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/plot3d/Base",["dojo/_base/kernel","dojo/_base/declare"],function(_1){
return _1.declare("dojox.charting.plot3d.Base",null,{constructor:function(_2,_3,_4){
this.width=_2;
this.height=_3;
},setData:function(_5){
this.data=_5?_5:[];
return this;
},getDepth:function(){
return this.depth;
},generate:function(_6,_7){
}});
});

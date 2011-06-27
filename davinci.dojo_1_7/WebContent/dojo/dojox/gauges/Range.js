/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/gauges/Range",["dojo/_base/kernel","dojo/_base/declare","dijit/_Widget"],function(_1,_2,_3){
return _1.declare("dojox.gauges.Range",[_3],{low:0,high:0,hover:"",color:null,size:0,startup:function(){
this.color=this.color?(this.color.color||this.color):"black";
}});
});

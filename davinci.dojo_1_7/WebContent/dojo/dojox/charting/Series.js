/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/Series",["dojo/_base/kernel","dojo/_base/declare","./Element"],function(_1,_2,_3){
return _1.declare("dojox.charting.Series",dojox.charting.Element,{constructor:function(_4,_5,_6){
_1.mixin(this,_6);
if(typeof this.plot!="string"){
this.plot="default";
}
this.update(_5);
},clear:function(){
this.dyn={};
},update:function(_7){
if(_1.isArray(_7)){
this.data=_7;
}else{
this.source=_7;
this.data=this.source.data;
if(this.source.setSeriesObject){
this.source.setSeriesObject(this);
}
}
this.dirty=true;
this.clear();
}});
});

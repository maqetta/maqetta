/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/PlotAction",["dojo/_base/kernel","dojo/_base/connect","dojo/_base/declare","./Base","dojo/fx/easing","dojox/lang/functional","dojox/lang/functional/object"],function(_1,_2,_3,_4,_5,df,_6){
var _7=400,_8=_5.backOut;
return _1.declare("dojox.charting.action2d.PlotAction",dojox.charting.action2d.Base,{overOutEvents:{onmouseover:1,onmouseout:1},constructor:function(_9,_a,_b){
this.anim={};
if(!_b){
_b={};
}
this.duration=_b.duration?_b.duration:_7;
this.easing=_b.easing?_b.easing:_8;
},connect:function(){
this.handle=this.chart.connectToPlot(this.plot.name,this,"process");
},disconnect:function(){
if(this.handle){
_1.disconnect(this.handle);
this.handle=null;
}
},reset:function(){
},destroy:function(){
this.inherited(arguments);
df.forIn(this.anim,function(o){
df.forIn(o,function(_c){
_c.action.stop(true);
});
});
this.anim={};
}});
});

/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/widget/BidiSupport",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/html","dojo/_base/array","dojo/_base/connect","dojo/query","dijit/_BidiSupport","../BidiSupport"],function(_1,_2,_3,_4,_5,_6,_7,_8){
if(dojox.charting.widget.Legend){
_1.extend(dojox.charting.widget.Legend,{postMixInProperties:function(){
if(!this.chart){
if(!this.chartRef){
return;
}
var _9=dijit.byId(this.chartRef);
if(!_9){
var _a=_1.byId(this.chartRef);
if(_a){
_9=dijit.byNode(_a);
}else{
return;
}
}
this.textDir=_9.chart.textDir;
_1.connect(_9.chart,"setTextDir",this,"_setTextDirAttr");
}else{
this.textDir=this.chart.textDir;
_1.connect(this.chart,"setTextDir",this,"_setTextDirAttr");
}
},_setTextDirAttr:function(_b){
if(_c(_b)!=null){
if(this.textDir!=_b){
this._set("textDir",_b);
var _d=_1.query(".dojoxLegendText",this._tr);
_1.forEach(_d,function(_e){
_e.dir=this.getTextDir(_e.innerHTML,_e.dir);
},this);
}
}
}});
}
if(dojox.charting.widget.Chart){
_1.extend(dojox.charting.widget.Chart,{postMixInProperties:function(){
this.textDir=this.params["textDir"]?this.params["textDir"]:this.params["dir"];
},_setTextDirAttr:function(_f){
if(_c(_f)!=null){
this._set("textDir",_f);
this.chart.setTextDir(_f);
}
}});
}
function _c(_10){
return /^(ltr|rtl|auto)$/.test(_10)?_10:null;
};
});

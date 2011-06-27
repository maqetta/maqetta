/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/calc/GraphPro",["dojo","dojox/calc/Standard","dijit/dijit","dijit/Menu","dijit/MenuItem","dijit/form/ComboButton","dijit/form/Select","dijit/form/CheckBox","dijit/ColorPalette","dojox/charting/Chart2D","dojox/calc/Grapher","dojox/layout/FloatingPane","dojox/charting/themes/Tufte","dojo/colors"],function(_1){
_1.experimental("dojox.calc.GraphPro");
_1.declare("dojox.calc.GraphPro",dojox.calc.Standard,{templateString:_1.cache("dojox.calc","templates/GraphPro.html"),grapher:null,funcMaker:null,aFloatingPane:null,executorLoaded:function(){
this.inherited(arguments);
_1.addOnLoad(_1.hitch(this,function(){
if(this.writeStore==null&&"functionMakerButton" in this){
_1.style(this.functionMakerButton.domNode,{visibility:"hidden"});
}
}));
},makeFunctionWindow:function(){
var _2=_1.body();
var _3=_1.create("div");
_2.appendChild(_3);
this.aFloatingPane=new dojox.layout.FloatingPane({resizable:false,dockable:true,maxable:false,closable:true,duration:300,title:"Function Window",style:"position:absolute;left:10em;top:10em;width:50em;"},_3);
var _4=this;
var d=_1.create("div");
this.funcMaker=new dojox.calc.FuncGen({writeStore:_4.writeStore,readStore:_4.readStore,functions:_4.functions,deleteFunction:_4.executor.deleteFunction,onSaved:function(){
var _5,_2;
if((_5=this.combo.get("value"))==""){
this.status.set("value","The function needs a name");
}else{
if((_2=this.textarea.get("value"))==""){
this.status.set("value","The function needs a body");
}else{
var _6=this.args.get("value");
if(!(_5 in this.functions)){
this.combo.item=this.writeStore.newItem({name:_5,args:_6,body:_2});
this.writeStore.save();
}
this.saveFunction(_5,_6,_2);
this.status.set("value","Function "+_5+" was saved");
}
}
},saveFunction:_1.hitch(_4,_4.saveFunction)},d);
this.aFloatingPane.set("content",this.funcMaker);
this.aFloatingPane.startup();
this.aFloatingPane.bringToTop();
},makeGrapherWindow:function(){
var _7=_1.body();
var _8=_1.create("div");
_7.appendChild(_8);
this.aFloatingPane=new dojox.layout.FloatingPane({resizable:false,dockable:true,maxable:false,closable:true,duration:300,title:"Graph Window",style:"position:absolute;left:10em;top:5em;width:50em;"},_8);
var _9=this;
var d=_1.create("div");
this.grapher=new dojox.calc.Grapher({myPane:this.aFloatingPane,drawOne:function(i){
this.array[i][this.chartIndex].resize(this.graphWidth.get("value"),this.graphHeight.get("value"));
this.array[i][this.chartIndex].axes["x"].max=this.graphMaxX.get("value");
if(this.array[i][this.expressionIndex].get("value")==""){
this.setStatus(i,"Error");
return;
}
var _a;
var _b=(this.array[i][this.functionMode]=="y=");
if(this.array[i][this.expressionIndex].get("value")!=this.array[i][this.evaluatedExpression]){
var _c="x";
if(!_b){
_c="y";
}
_a=_9.executor.Function("",_c,"return "+this.array[i][this.expressionIndex].get("value"));
this.array[i][this.evaluatedExpression]=this.array[i][this.expressionIndex].value;
this.array[i][this.functionRef]=_a;
}else{
_a=this.array[i][this.functionRef];
}
var _d=this.array[i][this.colorIndex].get("value");
if(!_d){
_d="black";
}
dojox.calc.Grapher.draw(this.array[i][this.chartIndex],_a,{graphNumber:this.array[i][this.funcNumberIndex],fOfX:_b,color:{stroke:{color:_d}}});
this.setStatus(i,"Drawn");
},onDraw:function(){
for(var i=0;i<this.rowCount;i++){
if((!this.dirty&&this.array[i][this.checkboxIndex].get("checked"))||(this.dirty&&this.array[i][this.statusIndex].innerHTML=="Drawn")){
this.drawOne(i);
}else{
this.array[i][this.chartIndex].resize(this.graphWidth.get("value"),this.graphHeight.get("value"));
this.array[i][this.chartIndex].axes["x"].max=this.graphMaxX.get("value");
}
}
var _e=_1.position(this.outerDiv).y-_1.position(this.myPane.domNode).y;
_e*=2;
_e=Math.abs(_e);
var _f=""+Math.max(parseInt(this.graphHeight.get("value"))+50,this.outerDiv.scrollHeight+_e);
var _10=""+(parseInt(this.graphWidth.get("value"))+this.outerDiv.scrollWidth);
this.myPane.resize({w:_10,h:_f});
}},d);
this.aFloatingPane.set("content",this.grapher);
this.aFloatingPane.startup();
this.aFloatingPane.bringToTop();
}});
return dojox.calc.GraphPro;
});

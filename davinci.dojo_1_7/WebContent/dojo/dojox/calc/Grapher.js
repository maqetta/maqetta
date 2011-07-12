/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/calc/Grapher",["dojo","dijit/_Templated","dojox/math/_base","dijit/dijit","dijit/form/DropDownButton","dijit/TooltipDialog","dijit/form/TextBox","dijit/form/Button","dijit/form/ComboBox","dijit/form/Select","dijit/form/CheckBox","dijit/ColorPalette","dojox/charting/Chart2D","dojox/charting/themes/Tufte","dojo/colors"],function(_1){
_1.experimental("dojox.calc.Grapher");
_1.declare("dojox.calc.Grapher",[dijit._Widget,dijit._Templated],{templateString:_1.cache("dojox.calc","templates/Grapher.html"),widgetsInTemplate:true,addXYAxes:function(_2){
return _2.addAxis("x",{max:parseInt(this.graphMaxX.get("value")),min:parseInt(this.graphMinX.get("value")),majorLabels:true,minorLabels:true,minorTicks:false,microTicks:false,htmlLabels:true,labelFunc:function(_3){
return _3;
},maxLabelSize:30,fixUpper:"major",fixLower:"major",majorTick:{length:3}}).addAxis("y",{max:parseInt(this.graphMaxY.get("value")),min:parseInt(this.graphMinY.get("value")),labelFunc:function(_4){
return _4;
},maxLabelSize:50,vertical:true,microTicks:false,minorTicks:true,majorTick:{stroke:"black",length:3}});
},selectAll:function(){
for(var i=0;i<this.rowCount;i++){
this.array[i][this.checkboxIndex].set("checked",true);
}
},deselectAll:function(){
for(var i=0;i<this.rowCount;i++){
this.array[i][this.checkboxIndex].set("checked",false);
}
},drawOne:function(i){
},onDraw:function(){
},erase:function(i){
var _5=0;
var _6="Series "+this.array[i][this.funcNumberIndex]+"_"+_5;
while(_6 in this.array[i][this.chartIndex].runs){
this.array[i][this.chartIndex].removeSeries(_6);
_5++;
_6="Series "+this.array[i][this.funcNumberIndex]+"_"+_5;
}
this.array[i][this.chartIndex].render();
this.setStatus(i,"Hidden");
},onErase:function(){
for(var i=0;i<this.rowCount;i++){
if(this.array[i][this.checkboxIndex].get("checked")){
this.erase(i);
}
}
},onDelete:function(){
for(var i=0;i<this.rowCount;i++){
if(this.array[i][this.checkboxIndex].get("checked")){
this.erase(i);
for(var k=0;k<this.functionRef;k++){
if(this.array[i][k]&&this.array[i][k]["destroy"]){
this.array[i][k].destroy();
}
}
this.graphTable.deleteRow(i);
this.array.splice(i,1);
this.rowCount--;
i--;
}
}
},checkboxIndex:0,functionMode:1,expressionIndex:2,colorIndex:3,dropDownIndex:4,tooltipIndex:5,colorBoxFieldsetIndex:6,statusIndex:7,chartIndex:8,funcNumberIndex:9,evaluatedExpression:10,functionRef:11,createFunction:function(){
var tr=this.graphTable.insertRow(-1);
this.array[tr.rowIndex]=[];
var td=tr.insertCell(-1);
var d=_1.create("div");
td.appendChild(d);
var _7=new dijit.form.CheckBox({},d);
this.array[tr.rowIndex][this.checkboxIndex]=_7;
_1.addClass(d,"dojoxCalcCheckBox");
td=tr.insertCell(-1);
var _8=this.funcMode.get("value");
d=_1.doc.createTextNode(_8);
td.appendChild(d);
this.array[tr.rowIndex][this.functionMode]=_8;
td=tr.insertCell(-1);
d=_1.create("div");
td.appendChild(d);
var _9=new dijit.form.TextBox({},d);
this.array[tr.rowIndex][this.expressionIndex]=_9;
_1.addClass(d,"dojoxCalcExpressionBox");
var b=_1.create("div");
var _a=new dijit.ColorPalette({changedColor:this.changedColor},b);
_1.addClass(b,"dojoxCalcColorPalette");
this.array[tr.rowIndex][this.colorIndex]=_a;
var c=_1.create("div");
var _b=new dijit.TooltipDialog({content:_a},c);
this.array[tr.rowIndex][this.tooltipIndex]=_b;
_1.addClass(c,"dojoxCalcContainerOfColor");
td=tr.insertCell(-1);
d=_1.create("div");
td.appendChild(d);
var _c=_1.create("fieldset");
_1.style(_c,{backgroundColor:"black",width:"1em",height:"1em",display:"inline"});
this.array[tr.rowIndex][this.colorBoxFieldsetIndex]=_c;
var _d=new dijit.form.DropDownButton({label:"Color ",dropDown:_b},d);
_d.containerNode.appendChild(_c);
this.array[tr.rowIndex][this.dropDownIndex]=_d;
_1.addClass(d,"dojoxCalcDropDownForColor");
td=tr.insertCell(-1);
d=_1.create("fieldset");
d.innerHTML="Hidden";
this.array[tr.rowIndex][this.statusIndex]=d;
_1.addClass(d,"dojoxCalcStatusBox");
td.appendChild(d);
d=_1.create("div");
_1.style(d,{position:"absolute",left:"0px",top:"0px"});
this.chartsParent.appendChild(d);
this.array[tr.rowIndex][this.chartNodeIndex]=d;
_1.addClass(d,"dojoxCalcChart");
var _e=new dojox.charting.Chart2D(d).setTheme(dojox.charting.themes.Tufte).addPlot("default",{type:"Lines",shadow:{dx:1,dy:1,width:2,color:[0,0,0,0.3]}});
this.addXYAxes(_e);
this.array[tr.rowIndex][this.chartIndex]=_e;
_a.set("chart",_e);
_a.set("colorBox",_c);
_a.set("onChange",_1.hitch(_a,"changedColor"));
this.array[tr.rowIndex][this.funcNumberIndex]=this.funcNumber++;
this.rowCount++;
},setStatus:function(i,_f){
this.array[i][this.statusIndex].innerHTML=_f;
},changedColor:function(){
var _10=this.get("chart");
var _11=this.get("colorBox");
for(var i=0;i<_10.series.length;i++){
if(_10.series[i]["stroke"]){
if(_10.series[i].stroke["color"]){
_10.series[i]["stroke"].color=this.get("value");
_10.dirty=true;
}
}
}
_10.render();
_1.style(_11,{backgroundColor:this.get("value")});
},makeDirty:function(){
this.dirty=true;
},checkDirty1:function(){
setTimeout(_1.hitch(this,"checkDirty"),0);
},checkDirty:function(){
if(this.dirty){
for(var i=0;i<this.rowCount;i++){
this.array[i][this.chartIndex].removeAxis("x");
this.array[i][this.chartIndex].removeAxis("y");
this.addXYAxes(this.array[i][this.chartIndex]);
}
this.onDraw();
}
this.dirty=false;
},postCreate:function(){
this.inherited(arguments);
this.createFunc.set("onClick",_1.hitch(this,"createFunction"));
this.selectAllButton.set("onClick",_1.hitch(this,"selectAll"));
this.deselectAllButton.set("onClick",_1.hitch(this,"deselectAll"));
this.drawButton.set("onClick",_1.hitch(this,"onDraw"));
this.eraseButton.set("onClick",_1.hitch(this,"onErase"));
this.deleteButton.set("onClick",_1.hitch(this,"onDelete"));
this.dirty=false;
this.graphWidth.set("onChange",_1.hitch(this,"makeDirty"));
this.graphHeight.set("onChange",_1.hitch(this,"makeDirty"));
this.graphMaxX.set("onChange",_1.hitch(this,"makeDirty"));
this.graphMinX.set("onChange",_1.hitch(this,"makeDirty"));
this.graphMaxY.set("onChange",_1.hitch(this,"makeDirty"));
this.graphMinY.set("onChange",_1.hitch(this,"makeDirty"));
this.windowOptionsInside.set("onClose",_1.hitch(this,"checkDirty1"));
this.funcNumber=0;
this.rowCount=0;
this.array=[];
},startup:function(){
this.inherited(arguments);
var _12=dijit.getEnclosingWidget(this.domNode.parentNode);
if(_12&&typeof _12.close=="function"){
this.closeButton.set("onClick",_1.hitch(_12,"close"));
}else{
_1.style(this.closeButton.domNode,"display","none");
}
this.createFunction();
this.array[0][this.checkboxIndex].set("checked",true);
this.onDraw();
this.erase(0);
this.array[0][this.expressionIndex].value="";
}});
var _13=1e-15/9,_14=1e+200,_15=Math.log(2),_16={graphNumber:0,fOfX:true,color:{stroke:"black"}};
dojox.calc.Grapher.draw=function(_17,_18,_19){
_19=_1.mixin({},_16,_19);
_17.fullGeometry();
var x;
var y;
var _1a;
if(_19.fOfX==true){
x="x";
y="y";
_1a=dojox.calc.Grapher.generatePoints(_18,x,y,_17.axes.x.scaler.bounds.span,_17.axes.x.scaler.bounds.lower,_17.axes.x.scaler.bounds.upper,_17.axes.y.scaler.bounds.lower,_17.axes.y.scaler.bounds.upper);
}else{
x="y";
y="x";
_1a=dojox.calc.Grapher.generatePoints(_18,x,y,_17.axes.y.scaler.bounds.span,_17.axes.y.scaler.bounds.lower,_17.axes.y.scaler.bounds.upper,_17.axes.x.scaler.bounds.lower,_17.axes.x.scaler.bounds.upper);
}
var i=0;
if(_1a.length>0){
for(;i<_1a.length;i++){
if(_1a[i].length>0){
_17.addSeries("Series "+_19.graphNumber+"_"+i,_1a[i],_19.color);
}
}
}
var _1b="Series "+_19.graphNumber+"_"+i;
while(_1b in _17.runs){
_17.removeSeries(_1b);
i++;
_1b="Series "+_19.graphNumber+"_"+i;
}
_17.render();
return _1a;
};
dojox.calc.Grapher.generatePoints=function(_1c,x,y,_1d,_1e,_1f,_20,_21){
var _22=(1<<Math.ceil(Math.log(_1d)/_15));
var dx=(_1f-_1e)/_22,_23=[],_24=0,_25,_26;
_23[_24]=[];
var i=_1e,k,p;
for(var _27=0;_27<=_22;i+=dx,_27++){
p={};
p[x]=i;
p[y]=_1c({_name:x,_value:i,_graphing:true});
if(p[x]==null||p[y]==null){
return {};
}
if(isNaN(p[y])||isNaN(p[x])){
continue;
}
_23[_24].push(p);
if(_23[_24].length==3){
_25=_28(_29(_23[_24][_23[_24].length-3],_23[_24][_23[_24].length-2]),_29(_23[_24][_23[_24].length-2],_23[_24][_23[_24].length-1]));
continue;
}
if(_23[_24].length<4){
continue;
}
_26=_28(_29(_23[_24][_23[_24].length-3],_23[_24][_23[_24].length-2]),_29(_23[_24][_23[_24].length-2],_23[_24][_23[_24].length-1]));
if(_25.inc!=_26.inc||_25.pos!=_26.pos){
var a=_2a(_1c,_23[_24][_23[_24].length-3],_23[_24][_23[_24].length-1]);
p=_23[_24].pop();
_23[_24].pop();
for(var j=0;j<a[0].length;j++){
_23[_24].push(a[0][j]);
}
for(k=1;k<a.length;k++){
_23[++_24]=a.pop();
}
_23[_24].push(p);
_25=_26;
}
}
while(_23.length>1){
for(k=0;k<_23[1].length;k++){
if(_23[0][_23[0].length-1][x]==_23[1][k][x]){
continue;
}
_23[0].push(_23[1][k]);
}
_23.splice(1,1);
}
_23=_23[0];
var s=0;
var _2b=[[]];
for(k=0;k<_23.length;k++){
var x1,y1,b,_2c;
if(isNaN(_23[k][y])||isNaN(_23[k][x])){
while(isNaN(_23[k][y])||isNaN(_23[k][x])){
_23.splice(k,1);
}
_2b[++s]=[];
k--;
}else{
if(_23[k][y]>_21||_23[k][y]<_20){
if(k>0&&_23[k-1].y!=_20&&_23[k-1].y!=_21){
_2c=_29(_23[k-1],_23[k]);
if(_2c>_14){
_2c=_14;
}else{
if(_2c<-_14){
_2c=-_14;
}
}
if(_23[k][y]>_21){
y1=_21;
}else{
y1=_20;
}
b=_23[k][y]-_2c*_23[k][x];
x1=(y1-b)/_2c;
p={};
p[x]=x1;
p[y]=_1c(x1);
if(p[y]!=y1){
p=_2d(_1c,_23[k-1],_23[k],y1);
}
_2b[s].push(p);
_2b[++s]=[];
}
var _2e=k;
while(k<_23.length&&(_23[k][y]>_21||_23[k][y]<_20)){
k++;
}
if(k>=_23.length){
if(_2b[s].length==0){
_2b.splice(s,1);
}
break;
}
if(k>0&&_23[k].y!=_20&&_23[k].y!=_21){
_2c=_29(_23[k-1],_23[k]);
if(_2c>_14){
_2c=_14;
}else{
if(_2c<-_14){
_2c=-_14;
}
}
if(_23[k-1][y]>_21){
y1=_21;
}else{
y1=_20;
}
b=_23[k][y]-_2c*_23[k][x];
x1=(y1-b)/_2c;
p={};
p[x]=x1;
p[y]=_1c(x1);
if(p[y]!=y1){
p=_2d(_1c,_23[k-1],_23[k],y1);
}
_2b[s].push(p);
_2b[s].push(_23[k]);
}
}else{
_2b[s].push(_23[k]);
}
}
}
return _2b;
function _2d(_2f,_30,_31,_32){
while(_30<=_31){
var _33=(_30[x]+_31[x])/2;
var mid={};
mid[x]=_33;
mid[y]=_2f(mid[x]);
if(_32==mid[y]||mid[x]==_31[x]||mid[x]==_30[x]){
return mid;
}
var _34=true;
if(_32<mid[y]){
_34=false;
}
if(mid[y]<_31[y]){
if(_34){
_30=mid;
}else{
_31=mid;
}
}else{
if(mid[y]<_30[y]){
if(!_34){
_30=mid;
}else{
_31=mid;
}
}
}
}
return NaN;
};
function _2a(_35,_36,_37){
var _38=[[],[]],_39=_36,_3a=_37,_3b;
while(_39[x]<=_3a[x]){
var _3c=(_39[x]+_3a[x])/2;
_3b={};
_3b[x]=_3c;
_3b[y]=_35(_3c);
var rx=_3d(_3b[x]);
var _3e={};
_3e[x]=rx;
_3e[y]=_35(rx);
if(Math.abs(_3e[y])>=Math.abs(_3b[y])){
_38[0].push(_3b);
_39=_3e;
}else{
_38[1].unshift(_3b);
if(_3a[x]==_3b[x]){
break;
}
_3a=_3b;
}
}
return _38;
};
function _28(_3f,_40){
var _41=false,_42=false;
if(_3f<_40){
_41=true;
}
if(_40>0){
_42=true;
}
return {inc:_41,pos:_42};
};
function _3d(v){
var _43;
if(v>-1&&v<1){
if(v<0){
if(v>=-_13){
_43=-v;
}else{
_43=v/Math.ceil(v/_13);
}
}else{
_43=_13;
}
}else{
_43=Math.abs(v)*_13;
}
return v+_43;
};
function _29(p1,p2){
return (p2[y]-p1[y])/(p2[x]-p1[x]);
};
};
return dojox.calc.Grapher;
});

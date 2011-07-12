/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/plot2d/Spider",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojo/_base/html","../Element","./_PlotEvents","dojo/_base/Color","dojox/color/_base","./common","../axis2d/common","../scaler/primitive","dojox/gfx","dojox/gfx/matrix","dojox/gfx/fx","dojox/lang/functional","dojox/lang/utils","dojo/fx","dojo/fx/easing"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,dc,da,_a,g,m,_b,df,du,fx,_c){
var _d=0.2;
_1.declare("dojox.charting.plot2d.Spider",[dojox.charting.Element,dojox.charting.plot2d._PlotEvents],{defaultParams:{labels:true,ticks:false,fixed:true,precision:1,labelOffset:-10,labelStyle:"default",htmlLabels:true,startAngle:-90,divisions:3,axisColor:"",axisWidth:0,spiderColor:"",spiderWidth:0,seriesWidth:0,seriesFillAlpha:0.2,spiderOrigin:0.16,markerSize:3,spiderType:"polygon",animationType:_c.backOut,axisTickFont:"",axisTickFontColor:"",axisFont:"",axisFontColor:""},optionalParams:{radius:0,font:"",fontColor:""},constructor:function(_e,_f){
this.opt=_1.clone(this.defaultParams);
du.updateWithObject(this.opt,_f);
du.updateWithPattern(this.opt,_f,this.optionalParams);
this.series=[];
this.dyn=[];
this.datas={};
this.labelKey=[];
this.oldSeriePoints={};
this.animations={};
},clear:function(){
this.dirty=true;
this.dyn=[];
this.series=[];
this.datas={};
this.labelKey=[];
this.oldSeriePoints={};
this.animations={};
return this;
},setAxis:function(_10){
return this;
},addSeries:function(run){
var _11=false;
this.series.push(run);
for(var key in run.data){
var val=run.data[key],_12=this.datas[key];
if(_12){
_12.vlist.push(val);
_12.min=Math.min(_12.min,val);
_12.max=Math.max(_12.max,val);
}else{
this.datas[key]={min:val,max:val,vlist:[val]};
}
}
if(this.labelKey.length<=0){
for(var key in run.data){
this.labelKey.push(key);
}
}
return this;
},getSeriesStats:function(){
return dc.collectSimpleStats(this.series);
},calculateAxes:function(dim){
this.initializeScalers(dim,this.getSeriesStats());
return this;
},getRequiredColors:function(){
return this.series.length;
},initializeScalers:function(dim,_13){
if(this._hAxis){
if(!this._hAxis.initialized()){
this._hAxis.calculate(_13.hmin,_13.hmax,dim.width);
}
this._hScaler=this._hAxis.getScaler();
}else{
this._hScaler=_a.buildScaler(_13.hmin,_13.hmax,dim.width);
}
if(this._vAxis){
if(!this._vAxis.initialized()){
this._vAxis.calculate(_13.vmin,_13.vmax,dim.height);
}
this._vScaler=this._vAxis.getScaler();
}else{
this._vScaler=_a.buildScaler(_13.vmin,_13.vmax,dim.height);
}
return this;
},render:function(dim,_14){
if(!this.dirty){
return this;
}
this.dirty=false;
this.cleanGroup();
var s=this.group,t=this.chart.theme;
this.resetEvents();
if(!this.series||!this.series.length){
return this;
}
var o=this.opt,ta=t.axis,rx=(dim.width-_14.l-_14.r)/2,ry=(dim.height-_14.t-_14.b)/2,r=Math.min(rx,ry),_15=o.font||(ta.majorTick&&ta.majorTick.font)||(ta.tick&&ta.tick.font)||"normal normal normal 7pt Tahoma",_16=o.axisFont||(ta.tick&&ta.tick.titleFont)||"normal normal normal 11pt Tahoma",_17=o.axisTickFontColor||(ta.majorTick&&ta.majorTick.fontColor)||(ta.tick&&ta.tick.fontColor)||"silver",_18=o.axisFontColor||(ta.tick&&ta.tick.titleFontColor)||"black",_19=o.axisColor||(ta.tick&&ta.tick.axisColor)||"silver",_1a=o.spiderColor||(ta.tick&&ta.tick.spiderColor)||"silver",_1b=o.axisWidth||(ta.stroke&&ta.stroke.width)||2,_1c=o.spiderWidth||(ta.stroke&&ta.stroke.width)||2,_1d=o.seriesWidth||(ta.stroke&&ta.stroke.width)||2,_1e=g.normalizedLength(g.splitFontString(_16).size),_1f=m._degToRad(o.startAngle),_20=_1f,_21,_22,_23,_24,_25,_26,_27,_28,_29,_2a,_2b,ro=o.spiderOrigin,dv=o.divisions>=3?o.divisions:3,ms=o.markerSize,spt=o.spiderType,at=o.animationType,_2c=o.labelOffset<-10?o.labelOffset:-10,_2d=0.2;
if(o.labels){
_24=_1.map(this.series,function(s){
return s.name;
},this);
_25=df.foldl1(df.map(_24,function(_2e,i){
var _2f=t.series.font;
return g._base._getTextBox(_2e,{font:_2f}).w;
},this),"Math.max(a, b)")/2;
r=Math.min(rx-2*_25,ry-_1e)+_2c;
_26=r-_2c;
}
if("radius" in o){
r=o.radius;
_26=r-_2c;
}
r/=(1+_2d);
var _30={cx:_14.l+rx,cy:_14.t+ry,r:r};
for(var i=this.series.length-1;i>=0;i--){
var _31=this.series[i];
if(!this.dirty&&!_31.dirty){
t.skip();
continue;
}
_31.cleanGroup();
var run=_31.data;
if(run!==null){
var len=this._getObjectLength(run);
if(!_27||_27.length<=0){
_27=[],_28=[],_2b=[];
this._buildPoints(_27,len,_30,r,_20,true);
this._buildPoints(_28,len,_30,r*ro,_20,true);
this._buildPoints(_2b,len,_30,_26,_20);
if(dv>2){
_29=[],_2a=[];
for(var j=0;j<dv-2;j++){
_29[j]=[];
this._buildPoints(_29[j],len,_30,r*(ro+(1-ro)*(j+1)/(dv-1)),_20,true);
_2a[j]=r*(ro+(1-ro)*(j+1)/(dv-1));
}
}
}
}
}
var _32=s.createGroup(),_33={color:_19,width:_1b},_34={color:_1a,width:_1c};
for(var j=_27.length-1;j>=0;--j){
var _35=_27[j],st={x:_35.x+(_35.x-_30.cx)*_2d,y:_35.y+(_35.y-_30.cy)*_2d},nd={x:_35.x+(_35.x-_30.cx)*_2d/2,y:_35.y+(_35.y-_30.cy)*_2d/2};
_32.createLine({x1:_30.cx,y1:_30.cy,x2:st.x,y2:st.y}).setStroke(_33);
this._drawArrow(_32,st,nd,_33);
}
var _36=s.createGroup();
for(var j=_2b.length-1;j>=0;--j){
var _35=_2b[j],_37=g._base._getTextBox(this.labelKey[j],{font:_16}).w||0,_38=this.opt.htmlLabels&&g.renderer!="vml"?"html":"gfx",_39=da.createText[_38](this.chart,_36,(!_1._isBodyLtr()&&_38=="html")?(_35.x+_37-dim.width):_35.x,_35.y,"middle",this.labelKey[j],_16,_18);
if(this.opt.htmlLabels){
this.htmlElements.push(_39);
}
}
var _3a=s.createGroup();
if(spt=="polygon"){
_3a.createPolyline(_27).setStroke(_34);
_3a.createPolyline(_28).setStroke(_34);
if(_29.length>0){
for(var j=_29.length-1;j>=0;--j){
_3a.createPolyline(_29[j]).setStroke(_34);
}
}
}else{
var _3b=this._getObjectLength(this.datas);
_3a.createCircle({cx:_30.cx,cy:_30.cy,r:r}).setStroke(_34);
_3a.createCircle({cx:_30.cx,cy:_30.cy,r:r*ro}).setStroke(_34);
if(_2a.length>0){
for(var j=_2a.length-1;j>=0;--j){
_3a.createCircle({cx:_30.cx,cy:_30.cy,r:_2a[j]}).setStroke(_34);
}
}
}
var _3c=s.createGroup(),len=this._getObjectLength(this.datas),k=0;
for(var key in this.datas){
var _3d=this.datas[key],min=_3d.min,max=_3d.max,_3e=max-min,end=_20+2*Math.PI*k/len;
for(var i=0;i<dv;i++){
var _3f=min+_3e*i/(dv-1),_35=this._getCoordinate(_30,r*(ro+(1-ro)*i/(dv-1)),end);
_3f=this._getLabel(_3f);
var _37=g._base._getTextBox(_3f,{font:_15}).w||0,_38=this.opt.htmlLabels&&g.renderer!="vml"?"html":"gfx";
if(this.opt.htmlLabels){
this.htmlElements.push(da.createText[_38](this.chart,_3c,(!_1._isBodyLtr()&&_38=="html")?(_35.x+_37-dim.width):_35.x,_35.y,"start",_3f,_15,_17));
}
}
k++;
}
this.chart.seriesShapes={};
var _40=[];
for(var i=this.series.length-1;i>=0;i--){
var _31=this.series[i],run=_31.data;
if(run!==null){
var _41=[],k=0,_42=[];
for(var key in run){
var _3d=this.datas[key],min=_3d.min,max=_3d.max,_3e=max-min,_43=run[key],end=_20+2*Math.PI*k/len,_35=this._getCoordinate(_30,r*(ro+(1-ro)*(_43-min)/_3e),end);
_41.push(_35);
_42.push({sname:_31.name,key:key,data:_43});
k++;
}
_41[_41.length]=_41[0];
_42[_42.length]=_42[0];
var _44=this._getBoundary(_41),_45=t.next("spider",[o,_31]),ts=_31.group,f=g.normalizeColor(_45.series.fill),sk={color:_45.series.fill,width:_1d};
f.a=o.seriesFillAlpha;
_31.dyn={fill:f,stroke:sk};
var _46=this.oldSeriePoints[_31.name];
var cs=this._createSeriesEntry(ts,(_46||_28),_41,f,sk,r,ro,ms,at);
this.chart.seriesShapes[_31.name]=cs;
this.oldSeriePoints[_31.name]=_41;
var po={element:"spider_poly",index:i,id:"spider_poly_"+_31.name,run:_31,plot:this,shape:cs.poly,parent:ts,brect:_44,cx:_30.cx,cy:_30.cy,cr:r,f:f,s:s};
this._connectEvents(po);
var so={element:"spider_plot",index:i,id:"spider_plot_"+_31.name,run:_31,plot:this,shape:_31.group};
this._connectEvents(so);
_1.forEach(cs.circles,function(c,i){
var _47=c.getShape(),co={element:"spider_circle",index:i,id:"spider_circle_"+_31.name+i,run:_31,plot:this,shape:c,parent:ts,tdata:_42[i],cx:_41[i].x,cy:_41[i].y,f:f,s:s};
this._connectEvents(co);
},this);
}
}
return this;
},_createSeriesEntry:function(ts,_48,sps,f,sk,r,ro,ms,at){
var _49=ts.createPolyline(_48).setFill(f).setStroke(sk),_4a=[];
for(var j=0;j<_48.length;j++){
var _4b=_48[j],cr=ms;
var _4c=ts.createCircle({cx:_4b.x,cy:_4b.y,r:cr}).setFill(f).setStroke(sk);
_4a.push(_4c);
}
var _4d=_1.map(sps,function(np,j){
var sp=_48[j],_4e=new _1._Animation({duration:1000,easing:at,curve:[sp.y,np.y]});
var spl=_49,sc=_4a[j];
_1.connect(_4e,"onAnimate",function(y){
var _4f=spl.getShape();
_4f.points[j].y=y;
spl.setShape(_4f);
var _50=sc.getShape();
_50.cy=y;
sc.setShape(_50);
});
return _4e;
});
var _51=_1.map(sps,function(np,j){
var sp=_48[j],_52=new _1._Animation({duration:1000,easing:at,curve:[sp.x,np.x]});
var spl=_49,sc=_4a[j];
_1.connect(_52,"onAnimate",function(x){
var _53=spl.getShape();
_53.points[j].x=x;
spl.setShape(_53);
var _54=sc.getShape();
_54.cx=x;
sc.setShape(_54);
});
return _52;
});
var _55=fx.combine(_4d.concat(_51));
_55.play();
return {group:ts,poly:_49,circles:_4a};
},plotEvent:function(o){
var _56=o.id?o.id:"default",a;
if(_56 in this.animations){
a=this.animations[_56];
a.anim&&a.anim.stop(true);
}else{
a=this.animations[_56]={};
}
if(o.element=="spider_poly"){
if(!a.color){
var _57=o.shape.getFill();
if(!_57||!(_57 instanceof _1.Color)){
return;
}
a.color={start:_57,end:_58(_57)};
}
var _59=a.color.start,end=a.color.end;
if(o.type=="onmouseout"){
var t=_59;
_59=end;
end=t;
}
a.anim=_b.animateFill({shape:o.shape,duration:800,easing:fx.easing.backOut,color:{start:_59,end:end}});
a.anim.play();
}else{
if(o.element=="spider_circle"){
var _5a,_5b,_5c=1.5;
if(o.type=="onmouseover"){
_5a=m.identity;
_5b=_5c;
var _5d={type:"rect"};
_5d.x=o.cx;
_5d.y=o.cy;
_5d.width=_5d.height=1;
var lt=_1.coords(this.chart.node,true);
_5d.x+=lt.x;
_5d.y+=lt.y;
_5d.x=Math.round(_5d.x);
_5d.y=Math.round(_5d.y);
_5d.width=Math.ceil(_5d.width);
_5d.height=Math.ceil(_5d.height);
this.aroundRect=_5d;
var _5e=["after","before"];
if(dijit&&dijit.Tooltip){
dijit.showTooltip(o.tdata.sname+"<br/>"+o.tdata.key+"<br/>"+o.tdata.data,this.aroundRect,_5e);
}
}else{
_5a=m.scaleAt(_5c,o.cx,o.cy);
_5b=1/_5c;
if(dijit&&dijit.Tooltip){
this.aroundRect&&dijit.hideTooltip(this.aroundRect);
}
}
var cs=o.shape.getShape(),_5a=m.scaleAt(_5c,cs.cx,cs.cy),_5f={shape:o.shape,duration:200,easing:_c.backOut,transform:[{name:"scaleAt",start:[1,cs.cx,cs.cy],end:[_5b,cs.cx,cs.cy]},_5a]};
a.anim=_b.animateTransform(_5f);
a.anim.play();
}else{
if(o.element=="spider_plot"){
if(o.type=="onmouseover"&&!_1.isIE){
o.shape.moveToFront();
}
}
}
}
},_getBoundary:function(_60){
var _61=_60[0].x,_62=_60[0].x,_63=_60[0].y,_64=_60[0].y;
for(var i=0;i<_60.length;i++){
var _65=_60[i];
_61=Math.max(_65.x,_61);
_63=Math.max(_65.y,_63);
_62=Math.min(_65.x,_62);
_64=Math.min(_65.y,_64);
}
return {x:_62,y:_64,width:_61-_62,height:_63-_64};
},_drawArrow:function(s,_66,end,_67){
var len=Math.sqrt(Math.pow(end.x-_66.x,2)+Math.pow(end.y-_66.y,2)),sin=(end.y-_66.y)/len,cos=(end.x-_66.x)/len,_68={x:end.x+(len/3)*(-sin),y:end.y+(len/3)*cos},_69={x:end.x+(len/3)*sin,y:end.y+(len/3)*(-cos)};
s.createPolyline([_66,_68,_69]).setFill(_67.color).setStroke(_67);
},_buildPoints:function(_6a,_6b,_6c,_6d,_6e,_6f){
for(var i=0;i<_6b;i++){
var end=_6e+2*Math.PI*i/_6b;
_6a.push(this._getCoordinate(_6c,_6d,end));
}
if(_6f){
_6a.push(this._getCoordinate(_6c,_6d,_6e+2*Math.PI));
}
},_getCoordinate:function(_70,_71,_72){
return {x:_70.cx+_71*Math.cos(_72),y:_70.cy+_71*Math.sin(_72)};
},_getObjectLength:function(obj){
var _73=0;
if(_1.isObject(obj)){
for(var key in obj){
_73++;
}
}
return _73;
},_getLabel:function(_74){
return dc.getLabel(_74,this.opt.fixed,this.opt.precision);
}});
function _58(_75){
var a=new _9.Color(_75),x=a.toHsl();
if(x.s==0){
x.l=x.l<50?100:0;
}else{
x.s=100;
if(x.l<50){
x.l=75;
}else{
if(x.l>75){
x.l=50;
}else{
x.l=x.l-50>75-x.l?50:75;
}
}
}
var _75=_9.fromHsl(x);
_75.a=0.7;
return _75;
};
return dojox.charting.plot2d.Spider;
});

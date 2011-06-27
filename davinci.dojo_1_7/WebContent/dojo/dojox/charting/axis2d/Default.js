/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/axis2d/Default",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/connect","dojo/_base/html","./Invisible","../scaler/common","../scaler/linear","./common","dojox/gfx","dojox/lang/utils"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,g,du){
var _a=4,_b=45;
return _1.declare("dojox.charting.axis2d.Default",dojox.charting.axis2d.Invisible,{defaultParams:{vertical:false,fixUpper:"none",fixLower:"none",natural:false,leftBottom:true,includeZero:false,fixed:true,majorLabels:true,minorTicks:true,minorLabels:true,microTicks:false,rotation:0,htmlLabels:true,enableCache:false},optionalParams:{min:0,max:1,from:0,to:1,majorTickStep:4,minorTickStep:2,microTickStep:1,labels:[],labelFunc:null,maxLabelSize:0,maxLabelCharCount:0,trailingSymbol:null,stroke:{},majorTick:{},minorTick:{},microTick:{},tick:{},font:"",fontColor:"",title:"",titleGap:0,titleFont:"",titleFontColor:"",titleOrientation:""},constructor:function(_c,_d){
this.opt=_1.clone(this.defaultParams);
du.updateWithObject(this.opt,_d);
du.updateWithPattern(this.opt,_d,this.optionalParams);
if(this.opt.enableCache){
this._textFreePool=[];
this._lineFreePool=[];
this._textUsePool=[];
this._lineUsePool=[];
}
},getOffsets:function(){
var s=this.scaler,_e={l:0,r:0,t:0,b:0};
if(!s){
return _e;
}
var o=this.opt,_f=0,a,b,c,d,gl=_7.getNumericLabel,_10=0,ma=s.major,mi=s.minor,ta=this.chart.theme.axis,_11=o.font||(ta.majorTick&&ta.majorTick.font)||(ta.tick&&ta.tick.font),_12=o.titleFont||(ta.tick&&ta.tick.titleFont),_13=(o.titleGap==0)?0:o.titleGap||(ta.tick&&ta.tick.titleGap)||15,_14=this.chart.theme.getTick("major",o),_15=this.chart.theme.getTick("minor",o),_16=_11?g.normalizedLength(g.splitFontString(_11).size):0,_17=_12?g.normalizedLength(g.splitFontString(_12).size):0,_18=o.rotation%360,_19=o.leftBottom,_1a=Math.abs(Math.cos(_18*Math.PI/180)),_1b=Math.abs(Math.sin(_18*Math.PI/180));
this.trailingSymbol=(o.trailingSymbol===undefined||o.trailingSymbol===null)?this.trailingSymbol:o.trailingSymbol;
if(_18<0){
_18+=360;
}
if(_16){
if(this.labels){
_f=this._groupLabelWidth(this.labels,_11,o.maxLabelCharCount);
}else{
_f=this._groupLabelWidth([gl(ma.start,ma.prec,o),gl(ma.start+ma.count*ma.tick,ma.prec,o),gl(mi.start,mi.prec,o),gl(mi.start+mi.count*mi.tick,mi.prec,o)],_11,o.maxLabelCharCount);
}
_f=o.maxLabelSize?Math.min(o.maxLabelSize,_f):_f;
if(this.vertical){
var _1c=_19?"l":"r";
switch(_18){
case 0:
case 180:
_e[_1c]=_f;
_e.t=_e.b=_16/2;
break;
case 90:
case 270:
_e[_1c]=_16;
_e.t=_e.b=_f/2;
break;
default:
if(_18<=_b||(180<_18&&_18<=(180+_b))){
_e[_1c]=_16*_1b/2+_f*_1a;
_e[_19?"t":"b"]=_16*_1a/2+_f*_1b;
_e[_19?"b":"t"]=_16*_1a/2;
}else{
if(_18>(360-_b)||(180>_18&&_18>(180-_b))){
_e[_1c]=_16*_1b/2+_f*_1a;
_e[_19?"b":"t"]=_16*_1a/2+_f*_1b;
_e[_19?"t":"b"]=_16*_1a/2;
}else{
if(_18<90||(180<_18&&_18<270)){
_e[_1c]=_16*_1b+_f*_1a;
_e[_19?"t":"b"]=_16*_1a+_f*_1b;
}else{
_e[_1c]=_16*_1b+_f*_1a;
_e[_19?"b":"t"]=_16*_1a+_f*_1b;
}
}
}
break;
}
_e[_1c]+=_a+Math.max(_14.length,_15.length)+(o.title?(_17+_13):0);
}else{
var _1c=_19?"b":"t";
switch(_18){
case 0:
case 180:
_e[_1c]=_16;
_e.l=_e.r=_f/2;
break;
case 90:
case 270:
_e[_1c]=_f;
_e.l=_e.r=_16/2;
break;
default:
if((90-_b)<=_18&&_18<=90||(270-_b)<=_18&&_18<=270){
_e[_1c]=_16*_1b/2+_f*_1a;
_e[_19?"r":"l"]=_16*_1a/2+_f*_1b;
_e[_19?"l":"r"]=_16*_1a/2;
}else{
if(90<=_18&&_18<=(90+_b)||270<=_18&&_18<=(270+_b)){
_e[_1c]=_16*_1b/2+_f*_1a;
_e[_19?"l":"r"]=_16*_1a/2+_f*_1b;
_e[_19?"r":"l"]=_16*_1a/2;
}else{
if(_18<_b||(180<_18&&_18<(180-_b))){
_e[_1c]=_16*_1b+_f*_1a;
_e[_19?"r":"l"]=_16*_1a+_f*_1b;
}else{
_e[_1c]=_16*_1b+_f*_1a;
_e[_19?"l":"r"]=_16*_1a+_f*_1b;
}
}
}
break;
}
_e[_1c]+=_a+Math.max(_14.length,_15.length)+(o.title?(_17+_13):0);
}
}
if(_f){
this._cachedLabelWidth=_f;
}
return _e;
},cleanGroup:function(_1d){
if(this.opt.enableCache&&this.group){
this._lineFreePool=this._lineFreePool.concat(this._lineUsePool);
this._lineUsePool=[];
this._textFreePool=this._textFreePool.concat(this._textUsePool);
this._textUsePool=[];
}
this.inherited(arguments);
},createText:function(_1e,_1f,x,y,_20,_21,_22,_23,_24){
if(!this.opt.enableCache||_1e=="html"){
return _9.createText[_1e](this.chart,_1f,x,y,_20,_21,_22,_23,_24);
}
var _25;
if(this._textFreePool.length>0){
_25=this._textFreePool.pop();
_25.setShape({x:x,y:y,text:_21,align:_20});
_1f.add(_25);
}else{
_25=_9.createText[_1e](this.chart,_1f,x,y,_20,_21,_22,_23,_24);
}
this._textUsePool.push(_25);
return _25;
},createLine:function(_26,_27){
var _28;
if(this.opt.enableCache&&this._lineFreePool.length>0){
_28=this._lineFreePool.pop();
_28.setShape(_27);
_26.add(_28);
}else{
_28=_26.createLine(_27);
}
if(this.opt.enableCache){
this._lineUsePool.push(_28);
}
return _28;
},render:function(dim,_29){
if(!this.dirty){
return this;
}
var o=this.opt,ta=this.chart.theme.axis,_2a=o.leftBottom,_2b=o.rotation%360,_2c,_2d,_2e,_2f=0,_30,_31,_32,_33,_34,_35,_36=o.font||(ta.majorTick&&ta.majorTick.font)||(ta.tick&&ta.tick.font),_37=o.titleFont||(ta.tick&&ta.tick.titleFont),_38=o.fontColor||(ta.majorTick&&ta.majorTick.fontColor)||(ta.tick&&ta.tick.fontColor)||"black",_39=o.titleFontColor||(ta.tick&&ta.tick.titleFontColor)||"black",_3a=(o.titleGap==0)?0:o.titleGap||(ta.tick&&ta.tick.titleGap)||15,_3b=o.titleOrientation||(ta.tick&&ta.tick.titleOrientation)||"axis",_3c=this.chart.theme.getTick("major",o),_3d=this.chart.theme.getTick("minor",o),_3e=this.chart.theme.getTick("micro",o),_3f=Math.max(_3c.length,_3d.length,_3e.length),_40="stroke" in o?o.stroke:ta.stroke,_41=_36?g.normalizedLength(g.splitFontString(_36).size):0,_42=Math.abs(Math.cos(_2b*Math.PI/180)),_43=Math.abs(Math.sin(_2b*Math.PI/180)),_44=_37?g.normalizedLength(g.splitFontString(_37).size):0;
if(_2b<0){
_2b+=360;
}
if(this.vertical){
_2c={y:dim.height-_29.b};
_2d={y:_29.t};
_2e={y:(dim.height-_29.b+_29.t)/2};
_30=_41*_43+(this._cachedLabelWidth||0)*_42+_a+Math.max(_3c.length,_3d.length)+_44+_3a;
_31={x:0,y:-1};
_34={x:0,y:0};
_32={x:1,y:0};
_33={x:_a,y:0};
switch(_2b){
case 0:
_35="end";
_34.y=_41*0.4;
break;
case 90:
_35="middle";
_34.x=-_41;
break;
case 180:
_35="start";
_34.y=-_41*0.4;
break;
case 270:
_35="middle";
break;
default:
if(_2b<_b){
_35="end";
_34.y=_41*0.4;
}else{
if(_2b<90){
_35="end";
_34.y=_41*0.4;
}else{
if(_2b<(180-_b)){
_35="start";
}else{
if(_2b<(180+_b)){
_35="start";
_34.y=-_41*0.4;
}else{
if(_2b<270){
_35="start";
_34.x=_2a?0:_41*0.4;
}else{
if(_2b<(360-_b)){
_35="end";
_34.x=_2a?0:_41*0.4;
}else{
_35="end";
_34.y=_41*0.4;
}
}
}
}
}
}
}
if(_2a){
_2c.x=_2d.x=_29.l;
_2f=(_3b&&_3b=="away")?90:270;
_2e.x=_29.l-_30+(_2f==270?_44:0);
_32.x=-1;
_33.x=-_33.x;
}else{
_2c.x=_2d.x=dim.width-_29.r;
_2f=(_3b&&_3b=="axis")?90:270;
_2e.x=dim.width-_29.r+_30-(_2f==270?0:_44);
switch(_35){
case "start":
_35="end";
break;
case "end":
_35="start";
break;
case "middle":
_34.x+=_41;
break;
}
}
}else{
_2c={x:_29.l};
_2d={x:dim.width-_29.r};
_2e={x:(dim.width-_29.r+_29.l)/2};
_30=_41*_42+(this._cachedLabelWidth||0)*_43+_a+Math.max(_3c.length,_3d.length)+_44+_3a;
_31={x:1,y:0};
_34={x:0,y:0};
_32={x:0,y:1};
_33={x:0,y:_a};
switch(_2b){
case 0:
_35="middle";
_34.y=_41;
break;
case 90:
_35="start";
_34.x=-_41*0.4;
break;
case 180:
_35="middle";
break;
case 270:
_35="end";
_34.x=_41*0.4;
break;
default:
if(_2b<(90-_b)){
_35="start";
_34.y=_2a?_41:0;
}else{
if(_2b<(90+_b)){
_35="start";
_34.x=-_41*0.4;
}else{
if(_2b<180){
_35="start";
_34.y=_2a?0:-_41;
}else{
if(_2b<(270-_b)){
_35="end";
_34.y=_2a?0:-_41;
}else{
if(_2b<(270+_b)){
_35="end";
_34.y=_2a?_41*0.4:0;
}else{
_35="end";
_34.y=_2a?_41:0;
}
}
}
}
}
}
if(_2a){
_2c.y=_2d.y=dim.height-_29.b;
_2f=(_3b&&_3b=="axis")?180:0;
_2e.y=dim.height-_29.b+_30-(_2f?_44:0);
}else{
_2c.y=_2d.y=_29.t;
_2f=(_3b&&_3b=="away")?180:0;
_2e.y=_29.t-_30+(_2f?0:_44);
_32.y=-1;
_33.y=-_33.y;
switch(_35){
case "start":
_35="end";
break;
case "end":
_35="start";
break;
case "middle":
_34.y-=_41;
break;
}
}
}
this.cleanGroup();
try{
var s=this.group,c=this.scaler,t=this.ticks,_45,f=_8.getTransformerFromModel(this.scaler),_46=!_2f&&!_2b&&this.opt.htmlLabels&&!_1.isIE&&!_1.isOpera?"html":"gfx",dx=_32.x*_3c.length,dy=_32.y*_3c.length;
s.createLine({x1:_2c.x,y1:_2c.y,x2:_2d.x,y2:_2d.y}).setStroke(_40);
if(o.title){
var _47=_9.createText[_46](this.chart,s,_2e.x,_2e.y,"middle",o.title,_37,_39);
if(_46=="html"){
this.htmlElements.push(_47);
}else{
_47.setTransform(g.matrix.rotategAt(_2f,_2e.x,_2e.y));
}
}
if(t==null){
this.diry=false;
return;
}
_1.forEach(t.major,function(_48){
var _49=f(_48.value),_4a,x=_2c.x+_31.x*_49,y=_2c.y+_31.y*_49;
this.createLine(s,{x1:x,y1:y,x2:x+dx,y2:y+dy}).setStroke(_3c);
if(_48.label){
var _4b=o.maxLabelCharCount?this.getTextWithLimitCharCount(_48.label,_36,o.maxLabelCharCount):{text:_48.label,truncated:false};
_4b=o.maxLabelSize?this.getTextWithLimitLength(_4b.text,_36,o.maxLabelSize,_4b.truncated):_4b;
_4a=this.createText(_46,s,x+dx+_33.x+(_2b?0:_34.x),y+dy+_33.y+(_2b?0:_34.y),_35,_4b.text,_36,_38);
if(this.chart.truncateBidi&&_4b.truncated){
this.chart.truncateBidi(_4a,_48.label,_46);
}
_4b.truncated&&this.labelTooltip(_4a,this.chart,_48.label,_4b.text,_36,_46);
if(_46=="html"){
this.htmlElements.push(_4a);
}else{
if(_2b){
_4a.setTransform([{dx:_34.x,dy:_34.y},g.matrix.rotategAt(_2b,x+dx+_33.x,y+dy+_33.y)]);
}
}
}
},this);
dx=_32.x*_3d.length;
dy=_32.y*_3d.length;
_45=c.minMinorStep<=c.minor.tick*c.bounds.scale;
_1.forEach(t.minor,function(_4c){
var _4d=f(_4c.value),_4e,x=_2c.x+_31.x*_4d,y=_2c.y+_31.y*_4d;
this.createLine(s,{x1:x,y1:y,x2:x+dx,y2:y+dy}).setStroke(_3d);
if(_45&&_4c.label){
var _4f=o.maxLabelCharCount?this.getTextWithLimitCharCount(_4c.label,_36,o.maxLabelCharCount):{text:_4c.label,truncated:false};
_4f=o.maxLabelSize?this.getTextWithLimitLength(_4f.text,_36,o.maxLabelSize,_4f.truncated):_4f;
_4e=this.createText(_46,s,x+dx+_33.x+(_2b?0:_34.x),y+dy+_33.y+(_2b?0:_34.y),_35,_4f.text,_36,_38);
if(this.chart.getTextDir&&_4f.truncated){
this.chart.truncateBidi(_4e,_4c.label,_46);
}
_4f.truncated&&this.labelTooltip(_4e,this.chart,_4c.label,_4f.text,_36,_46);
if(_46=="html"){
this.htmlElements.push(_4e);
}else{
if(_2b){
_4e.setTransform([{dx:_34.x,dy:_34.y},g.matrix.rotategAt(_2b,x+dx+_33.x,y+dy+_33.y)]);
}
}
}
},this);
dx=_32.x*_3e.length;
dy=_32.y*_3e.length;
_1.forEach(t.micro,function(_50){
var _51=f(_50.value),_52,x=_2c.x+_31.x*_51,y=_2c.y+_31.y*_51;
this.createLine(s,{x1:x,y1:y,x2:x+dx,y2:y+dy}).setStroke(_3e);
},this);
}
catch(e){
}
this.dirty=false;
return this;
},labelTooltip:function(_53,_54,_55,_56,_57,_58){
if(!dijit||!dijit.Tooltip){
return;
}
var _59={type:"rect"},_5a=["above","below"],_5b=g._base._getTextBox(_56,{font:_57}).w||0,_5c=_57?g.normalizedLength(g.splitFontString(_57).size):0;
if(_58=="html"){
_1.mixin(_59,_1.coords(_53.firstChild,true));
_59.width=Math.ceil(_5b);
_59.height=Math.ceil(_5c);
this._events.push({shape:_1,handle:_1.connect(_53.firstChild,"onmouseover",this,function(e){
dijit.showTooltip(_55,_59,_5a);
})});
this._events.push({shape:_1,handle:_1.connect(_53.firstChild,"onmouseout",this,function(e){
dijit.hideTooltip(_59);
})});
}else{
var shp=_53.getShape(),lt=_1.coords(_54.node,true);
_59=_1.mixin(_59,{x:shp.x-_5b/2,y:shp.y});
_59.x+=lt.x;
_59.y+=lt.y;
_59.x=Math.round(_59.x);
_59.y=Math.round(_59.y);
_59.width=Math.ceil(_5b);
_59.height=Math.ceil(_5c);
this._events.push({shape:_53,handle:_53.connect("onmouseenter",this,function(e){
dijit.showTooltip(_55,_59,_5a);
})});
this._events.push({shape:_53,handle:_53.connect("onmouseleave",this,function(e){
dijit.hideTooltip(_59);
})});
}
}});
});

/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/widget/Chart",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/query","dijit/_Widget","../Chart","dojox/lang/utils","dojox/lang/functional"],function(_1,_2,_3,_4,_5,_6,du,df){
var _7,_8,_9,_a,_b,_c=function(o){
return o;
},dc=dojox.charting,d=_1;
_1.declare("dojox.charting.widget.Chart",dijit._Widget,{theme:null,margins:null,stroke:undefined,fill:undefined,buildRendering:function(){
this.inherited(arguments);
n=this.domNode;
var _d=d.query("> .axis",n).map(_8).filter(_c),_e=d.query("> .plot",n).map(_9).filter(_c),_f=d.query("> .action",n).map(_a).filter(_c),_10=d.query("> .series",n).map(_b).filter(_c);
n.innerHTML="";
var c=this.chart=new _6(n,{margins:this.margins,stroke:this.stroke,fill:this.fill,textDir:this.textDir});
if(this.theme){
c.setTheme(this.theme);
}
_d.forEach(function(_11){
c.addAxis(_11.name,_11.kwArgs);
});
_e.forEach(function(_12){
c.addPlot(_12.name,_12.kwArgs);
});
this.actions=_f.map(function(_13){
return new _13.action(c,_13.plot,_13.kwArgs);
});
var _14=df.foldl(_10,function(_15,_16){
if(_16.type=="data"){
c.addSeries(_16.name,_16.data,_16.kwArgs);
_15=true;
}else{
c.addSeries(_16.name,[0],_16.kwArgs);
var kw={};
du.updateWithPattern(kw,_16.kwArgs,{"query":"","queryOptions":null,"start":0,"count":1},true);
if(_16.kwArgs.sort){
kw.sort=_1.clone(_16.kwArgs.sort);
}
d.mixin(kw,{onComplete:function(_17){
var _18;
if("valueFn" in _16.kwArgs){
var fn=_16.kwArgs.valueFn;
_18=d.map(_17,function(x){
return fn(_16.data.getValue(x,_16.field,0));
});
}else{
_18=d.map(_17,function(x){
return _16.data.getValue(x,_16.field,0);
});
}
c.addSeries(_16.name,_18,_16.kwArgs).render();
}});
_16.data.fetch(kw);
}
return _15;
},false);
if(_14){
c.render();
}
},destroy:function(){
this.chart.destroy();
this.inherited(arguments);
},resize:function(box){
this.chart.resize(box);
}});
_7=function(_19,_1a,kw){
var dp=eval("("+_1a+".prototype.defaultParams)");
var x,_1b;
for(x in dp){
if(x in kw){
continue;
}
_1b=_19.getAttribute(x);
kw[x]=du.coerceType(dp[x],_1b==null||typeof _1b=="undefined"?dp[x]:_1b);
}
var op=eval("("+_1a+".prototype.optionalParams)");
for(x in op){
if(x in kw){
continue;
}
_1b=_19.getAttribute(x);
if(_1b!=null){
kw[x]=du.coerceType(op[x],_1b);
}
}
};
_8=function(_1c){
var _1d=_1c.getAttribute("name"),_1e=_1c.getAttribute("type");
if(!_1d){
return null;
}
var o={name:_1d,kwArgs:{}},kw=o.kwArgs;
if(_1e){
if(dc.axis2d[_1e]){
_1e=dojox._scopeName+".charting.axis2d."+_1e;
}
var _1f=eval("("+_1e+")");
if(_1f){
kw.type=_1f;
}
}else{
_1e=dojox._scopeName+".charting.axis2d.Default";
}
_7(_1c,_1e,kw);
if(kw.font||kw.fontColor){
if(!kw.tick){
kw.tick={};
}
if(kw.font){
kw.tick.font=kw.font;
}
if(kw.fontColor){
kw.tick.fontColor=kw.fontColor;
}
}
return o;
};
_9=function(_20){
var _21=_20.getAttribute("name"),_22=_20.getAttribute("type");
if(!_21){
return null;
}
var o={name:_21,kwArgs:{}},kw=o.kwArgs;
if(_22){
if(dc.plot2d&&dc.plot2d[_22]){
_22=dojox._scopeName+".charting.plot2d."+_22;
}
var _23=eval("("+_22+")");
if(_23){
kw.type=_23;
}
}else{
_22=dojox._scopeName+".charting.plot2d.Default";
}
_7(_20,_22,kw);
return o;
};
_a=function(_24){
var _25=_24.getAttribute("plot"),_26=_24.getAttribute("type");
if(!_25){
_25="default";
}
var o={plot:_25,kwArgs:{}},kw=o.kwArgs;
if(_26){
if(dc.action2d[_26]){
_26=dojox._scopeName+".charting.action2d."+_26;
}
var _27=eval("("+_26+")");
if(!_27){
return null;
}
o.action=_27;
}else{
return null;
}
_7(_24,_26,kw);
return o;
};
_b=function(_28){
var ga=d.partial(d.attr,_28);
var _29=ga("name");
if(!_29){
return null;
}
var o={name:_29,kwArgs:{}},kw=o.kwArgs,t;
t=ga("plot");
if(t!=null){
kw.plot=t;
}
t=ga("marker");
if(t!=null){
kw.marker=t;
}
t=ga("stroke");
if(t!=null){
kw.stroke=eval("("+t+")");
}
t=ga("outline");
if(t!=null){
kw.outline=eval("("+t+")");
}
t=ga("shadow");
if(t!=null){
kw.shadow=eval("("+t+")");
}
t=ga("fill");
if(t!=null){
kw.fill=eval("("+t+")");
}
t=ga("font");
if(t!=null){
kw.font=t;
}
t=ga("fontColor");
if(t!=null){
kw.fontColor=eval("("+t+")");
}
t=ga("legend");
if(t!=null){
kw.legend=t;
}
t=ga("data");
if(t!=null){
o.type="data";
o.data=t?_1.map(String(t).split(","),Number):[];
return o;
}
t=ga("array");
if(t!=null){
o.type="data";
o.data=eval("("+t+")");
return o;
}
t=ga("store");
if(t!=null){
o.type="store";
o.data=eval("("+t+")");
t=ga("field");
o.field=t!=null?t:"value";
t=ga("query");
if(!!t){
kw.query=t;
}
t=ga("queryOptions");
if(!!t){
kw.queryOptions=eval("("+t+")");
}
t=ga("start");
if(!!t){
kw.start=Number(t);
}
t=ga("count");
if(!!t){
kw.count=Number(t);
}
t=ga("sort");
if(!!t){
kw.sort=eval("("+t+")");
}
t=ga("valueFn");
if(!!t){
kw.valueFn=df.lambda(t);
}
return o;
}
return null;
};
return dojox.charting.widget.Chart;
});

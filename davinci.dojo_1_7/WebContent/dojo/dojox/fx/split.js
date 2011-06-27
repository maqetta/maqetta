/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/fx/split",["./_base","dojo/fx","dojo/fx/easing"],function(_1,_2){
dojo.mixin(dojox.fx,{_split:function(_3){
_3.rows=_3.rows||3;
_3.columns=_3.columns||3;
_3.duration=_3.duration||1000;
var _4=_3.node=dojo.byId(_3.node),_5=_4.parentNode,_6=_5,_7=dojo.body(),_8="position";
while(_6&&_6!=_7&&dojo.style(_6,_8)=="static"){
_6=_6.parentNode;
}
var _9=_6!=_7?dojo.position(_6,true):{x:0,y:0},_a=dojo.position(_4,true),_b=dojo.style(_4,"height"),_c=dojo.style(_4,"width"),_d=dojo.style(_4,"borderLeftWidth")+dojo.style(_4,"borderRightWidth"),_e=dojo.style(_4,"borderTopWidth")+dojo.style(_4,"borderBottomWidth"),_f=Math.ceil(_b/_3.rows),_10=Math.ceil(_c/_3.columns),_11=dojo.create(_4.tagName,{style:{position:"absolute",padding:0,margin:0,border:"none",top:_a.y-_9.y+"px",left:_a.x-_9.x+"px",height:_b+_e+"px",width:_c+_d+"px",background:"none",overflow:_3.crop?"hidden":"visible",zIndex:dojo.style(_4,"zIndex")}},_4,"after"),_12=[],_13=dojo.create(_4.tagName,{style:{position:"absolute",border:"none",padding:0,margin:0,height:_f+_d+"px",width:_10+_e+"px",overflow:"hidden"}});
for(var y=0,ly=_3.rows;y<ly;y++){
for(var x=0,lx=_3.columns;x<lx;x++){
var _14=dojo.clone(_13),_15=dojo.clone(_4),_16=y*_f,_17=x*_10;
_15.style.filter="";
dojo.removeAttr(_15,"id");
dojo.style(_14,{border:"none",overflow:"hidden",top:_16+"px",left:_17+"px"});
dojo.style(_15,{position:"static",opacity:"1",marginTop:-_16+"px",marginLeft:-_17+"px"});
_14.appendChild(_15);
_11.appendChild(_14);
var _18=_3.pieceAnimation(_14,x,y,_a);
if(dojo.isArray(_18)){
_12=_12.concat(_18);
}else{
_12.push(_18);
}
}
}
var _19=dojo.fx.combine(_12);
dojo.connect(_19,"onEnd",_19,function(){
_11.parentNode.removeChild(_11);
});
if(_3.onPlay){
dojo.connect(_19,"onPlay",_19,_3.onPlay);
}
if(_3.onEnd){
dojo.connect(_19,"onEnd",_19,_3.onEnd);
}
return _19;
},explode:function(_1a){
var _1b=_1a.node=dojo.byId(_1a.node);
_1a.rows=_1a.rows||3;
_1a.columns=_1a.columns||3;
_1a.distance=_1a.distance||1;
_1a.duration=_1a.duration||1000;
_1a.random=_1a.random||0;
if(!_1a.fade){
_1a.fade=true;
}
if(typeof _1a.sync=="undefined"){
_1a.sync=true;
}
_1a.random=Math.abs(_1a.random);
_1a.pieceAnimation=function(_1c,x,y,_1d){
var _1e=_1d.h/_1a.rows,_1f=_1d.w/_1a.columns,_20=_1a.distance*2,_21=_1a.duration,ps=_1c.style,_22=parseInt(ps.top),_23=parseInt(ps.left),_24=0,_25=0,_26=0;
if(_1a.random){
var _27=(Math.random()*_1a.random)+Math.max(1-_1a.random,0);
_20*=_27;
_21*=_27;
_24=((_1a.unhide&&_1a.sync)||(!_1a.unhide&&!_1a.sync))?(_1a.duration-_21):0;
_25=Math.random()-0.5;
_26=Math.random()-0.5;
}
var _28=((_1d.h-_1e)/2-_1e*y),_29=((_1d.w-_1f)/2-_1f*x),_2a=Math.sqrt(Math.pow(_29,2)+Math.pow(_28,2)),_2b=parseInt(_22-_28*_20+_2a*_26),_2c=parseInt(_23-_29*_20+_2a*_25);
var _2d=dojo.animateProperty({node:_1c,duration:_21,delay:_24,easing:(_1a.easing||(_1a.unhide?dojo.fx.easing.sinOut:dojo.fx.easing.circOut)),beforeBegin:(_1a.unhide?function(){
if(_1a.fade){
dojo.style(_1c,{opacity:"0"});
}
ps.top=_2b+"px";
ps.left=_2c+"px";
}:undefined),properties:{top:(_1a.unhide?{start:_2b,end:_22}:{start:_22,end:_2b}),left:(_1a.unhide?{start:_2c,end:_23}:{start:_23,end:_2c})}});
if(_1a.fade){
var _2e=dojo.animateProperty({node:_1c,duration:_21,delay:_24,easing:(_1a.fadeEasing||dojo.fx.easing.quadOut),properties:{opacity:(_1a.unhide?{start:"0",end:"1"}:{start:"1",end:"0"})}});
return (_1a.unhide?[_2e,_2d]:[_2d,_2e]);
}else{
return _2d;
}
};
var _2f=dojox.fx._split(_1a);
if(_1a.unhide){
dojo.connect(_2f,"onEnd",null,function(){
dojo.style(_1b,{opacity:"1"});
});
}else{
dojo.connect(_2f,"onPlay",null,function(){
dojo.style(_1b,{opacity:"0"});
});
}
return _2f;
},converge:function(_30){
_30.unhide=true;
return dojox.fx.explode(_30);
},disintegrate:function(_31){
var _32=_31.node=dojo.byId(_31.node);
_31.rows=_31.rows||5;
_31.columns=_31.columns||5;
_31.duration=_31.duration||1500;
_31.interval=_31.interval||_31.duration/(_31.rows+_31.columns*2);
_31.distance=_31.distance||1.5;
_31.random=_31.random||0;
if(typeof _31.fade=="undefined"){
_31.fade=true;
}
var _33=Math.abs(_31.random),_34=_31.duration-(_31.rows+_31.columns)*_31.interval;
_31.pieceAnimation=function(_35,x,y,_36){
var _37=Math.random()*(_31.rows+_31.columns)*_31.interval,ps=_35.style,_38=(_31.reverseOrder||_31.distance<0)?((x+y)*_31.interval):(((_31.rows+_31.columns)-(x+y))*_31.interval),_39=_37*_33+Math.max(1-_33,0)*_38,_3a={};
if(_31.unhide){
_3a.top={start:(parseInt(ps.top)-_36.h*_31.distance),end:parseInt(ps.top)};
if(_31.fade){
_3a.opacity={start:"0",end:"1"};
}
}else{
_3a.top={end:(parseInt(ps.top)+_36.h*_31.distance)};
if(_31.fade){
_3a.opacity={end:"0"};
}
}
var _3b=dojo.animateProperty({node:_35,duration:_34,delay:_39,easing:(_31.easing||(_31.unhide?dojo.fx.easing.sinIn:dojo.fx.easing.circIn)),properties:_3a,beforeBegin:(_31.unhide?function(){
if(_31.fade){
dojo.style(_35,{opacity:"0"});
}
ps.top=_3a.top.start+"px";
}:undefined)});
return _3b;
};
var _3c=dojox.fx._split(_31);
if(_31.unhide){
dojo.connect(_3c,"onEnd",_3c,function(){
dojo.style(_32,{opacity:"1"});
});
}else{
dojo.connect(_3c,"onPlay",_3c,function(){
dojo.style(_32,{opacity:"0"});
});
}
return _3c;
},build:function(_3d){
_3d.unhide=true;
return dojox.fx.disintegrate(_3d);
},shear:function(_3e){
var _3f=_3e.node=dojo.byId(_3e.node);
_3e.rows=_3e.rows||6;
_3e.columns=_3e.columns||6;
_3e.duration=_3e.duration||1000;
_3e.interval=_3e.interval||0;
_3e.distance=_3e.distance||1;
_3e.random=_3e.random||0;
if(typeof (_3e.fade)=="undefined"){
_3e.fade=true;
}
var _40=Math.abs(_3e.random),_41=(_3e.duration-(_3e.rows+_3e.columns)*Math.abs(_3e.interval));
_3e.pieceAnimation=function(_42,x,y,_43){
var _44=!(x%2),_45=!(y%2),_46=Math.random()*_41,_47=(_3e.reverseOrder)?(((_3e.rows+_3e.columns)-(x+y))*_3e.interval):((x+y)*_3e.interval),_48=_46*_40+Math.max(1-_40,0)*_47,_49={},ps=_42.style;
if(_3e.fade){
_49.opacity=(_3e.unhide?{start:"0",end:"1"}:{end:"0"});
}
if(_3e.columns==1){
_44=_45;
}else{
if(_3e.rows==1){
_45=!_44;
}
}
var _4a=parseInt(ps.left),top=parseInt(ps.top),_4b=_3e.distance*_43.w,_4c=_3e.distance*_43.h;
if(_3e.unhide){
if(_44==_45){
_49.left=_44?{start:(_4a-_4b),end:_4a}:{start:(_4a+_4b),end:_4a};
}else{
_49.top=_44?{start:(top+_4c),end:top}:{start:(top-_4c),end:top};
}
}else{
if(_44==_45){
_49.left=_44?{end:(_4a-_4b)}:{end:(_4a+_4b)};
}else{
_49.top=_44?{end:(top+_4c)}:{end:(top-_4c)};
}
}
var _4d=dojo.animateProperty({node:_42,duration:_41,delay:_48,easing:(_3e.easing||dojo.fx.easing.sinInOut),properties:_49,beforeBegin:(_3e.unhide?function(){
if(_3e.fade){
ps.opacity="0";
}
if(_44==_45){
ps.left=_49.left.start+"px";
}else{
ps.top=_49.top.start+"px";
}
}:undefined)});
return _4d;
};
var _4e=dojox.fx._split(_3e);
if(_3e.unhide){
dojo.connect(_4e,"onEnd",_4e,function(){
dojo.style(_3f,{opacity:"1"});
});
}else{
dojo.connect(_4e,"onPlay",_4e,function(){
dojo.style(_3f,{opacity:"0"});
});
}
return _4e;
},unShear:function(_4f){
_4f.unhide=true;
return dojox.fx.shear(_4f);
},pinwheel:function(_50){
var _51=_50.node=dojo.byId(_50.node);
_50.rows=_50.rows||4;
_50.columns=_50.columns||4;
_50.duration=_50.duration||1000;
_50.interval=_50.interval||0;
_50.distance=_50.distance||1;
_50.random=_50.random||0;
if(typeof _50.fade=="undefined"){
_50.fade=true;
}
var _52=(_50.duration-(_50.rows+_50.columns)*Math.abs(_50.interval));
_50.pieceAnimation=function(_53,x,y,_54){
var _55=_54.h/_50.rows,_56=_54.w/_50.columns,_57=!(x%2),_58=!(y%2),_59=Math.random()*_52,_5a=(_50.interval<0)?(((_50.rows+_50.columns)-(x+y))*_50.interval*-1):((x+y)*_50.interval),_5b=_59*_50.random+Math.max(1-_50.random,0)*_5a,_5c={},ps=_53.style;
if(_50.fade){
_5c.opacity=(_50.unhide?{start:0,end:1}:{end:0});
}
if(_50.columns==1){
_57=!_58;
}else{
if(_50.rows==1){
_58=_57;
}
}
var _5d=parseInt(ps.left),top=parseInt(ps.top);
if(_57){
if(_58){
_5c.top=_50.unhide?{start:top+_55*_50.distance,end:top}:{start:top,end:top+_55*_50.distance};
}else{
_5c.left=_50.unhide?{start:_5d+_56*_50.distance,end:_5d}:{start:_5d,end:_5d+_56*_50.distance};
}
}
if(_57!=_58){
_5c.width=_50.unhide?{start:_56*(1-_50.distance),end:_56}:{start:_56,end:_56*(1-_50.distance)};
}else{
_5c.height=_50.unhide?{start:_55*(1-_50.distance),end:_55}:{start:_55,end:_55*(1-_50.distance)};
}
var _5e=dojo.animateProperty({node:_53,duration:_52,delay:_5b,easing:(_50.easing||dojo.fx.easing.sinInOut),properties:_5c,beforeBegin:(_50.unhide?function(){
if(_50.fade){
dojo.style(_53,"opacity",0);
}
if(_57){
if(_58){
ps.top=(top+_55*(1-_50.distance))+"px";
}else{
ps.left=(_5d+_56*(1-_50.distance))+"px";
}
}else{
ps.left=_5d+"px";
ps.top=top+"px";
}
if(_57!=_58){
ps.width=(_56*(1-_50.distance))+"px";
}else{
ps.height=(_55*(1-_50.distance))+"px";
}
}:undefined)});
return _5e;
};
var _5f=dojox.fx._split(_50);
if(_50.unhide){
dojo.connect(_5f,"onEnd",_5f,function(){
dojo.style(_51,{opacity:"1"});
});
}else{
dojo.connect(_5f,"play",_5f,function(){
dojo.style(_51,{opacity:"0"});
});
}
return _5f;
},unPinwheel:function(_60){
_60.unhide=true;
return dojox.fx.pinwheel(_60);
},blockFadeOut:function(_61){
var _62=_61.node=dojo.byId(_61.node);
_61.rows=_61.rows||5;
_61.columns=_61.columns||5;
_61.duration=_61.duration||1000;
_61.interval=_61.interval||_61.duration/(_61.rows+_61.columns*2);
_61.random=_61.random||0;
var _63=Math.abs(_61.random),_64=_61.duration-(_61.rows+_61.columns)*_61.interval;
_61.pieceAnimation=function(_65,x,y,_66){
var _67=Math.random()*_61.duration,_68=(_61.reverseOrder)?(((_61.rows+_61.columns)-(x+y))*Math.abs(_61.interval)):((x+y)*_61.interval),_69=_67*_63+Math.max(1-_63,0)*_68,_6a=dojo.animateProperty({node:_65,duration:_64,delay:_69,easing:(_61.easing||dojo.fx.easing.sinInOut),properties:{opacity:(_61.unhide?{start:"0",end:"1"}:{start:"1",end:"0"})},beforeBegin:(_61.unhide?function(){
dojo.style(_65,{opacity:"0"});
}:function(){
_65.style.filter="";
})});
return _6a;
};
var _6b=dojox.fx._split(_61);
if(_61.unhide){
dojo.connect(_6b,"onEnd",_6b,function(){
dojo.style(_62,{opacity:"1"});
});
}else{
dojo.connect(_6b,"onPlay",_6b,function(){
dojo.style(_62,{opacity:"0"});
});
}
return _6b;
},blockFadeIn:function(_6c){
_6c.unhide=true;
return dojox.fx.blockFadeOut(_6c);
}});
return dojox.fx;
});

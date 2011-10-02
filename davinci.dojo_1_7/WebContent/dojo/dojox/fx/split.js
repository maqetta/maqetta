//>>built
define("dojox/fx/split",["dojo/_base/lang","dojo/dom","dojo/_base/window","dojo/_base/html","dojo/dom-geometry","dojo/dom-construct","dojo/dom-attr","./_base","dojo/fx/easing","dojo/_base/connect"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a){
var _b=_1.getObject("dojox.fx");
_1.mixin(_b,{_split:function(_c){
_c.rows=_c.rows||3;
_c.columns=_c.columns||3;
_c.duration=_c.duration||1000;
var _d=_c.node=_2.byId(_c.node),_e=_d.parentNode,_f=_e,_10=_3.body(),_11="position";
while(_f&&_f!=_10&&_4.style(_f,_11)=="static"){
_f=_f.parentNode;
}
var _12=_f!=_10?_5.position(_f,true):{x:0,y:0},_13=_5.position(_d,true),_14=_4.style(_d,"height"),_15=_4.style(_d,"width"),_16=_4.style(_d,"borderLeftWidth")+_4.style(_d,"borderRightWidth"),_17=_4.style(_d,"borderTopWidth")+_4.style(_d,"borderBottomWidth"),_18=Math.ceil(_14/_c.rows),_19=Math.ceil(_15/_c.columns),_1a=_6.create(_d.tagName,{style:{position:"absolute",padding:0,margin:0,border:"none",top:_13.y-_12.y+"px",left:_13.x-_12.x+"px",height:_14+_17+"px",width:_15+_16+"px",background:"none",overflow:_c.crop?"hidden":"visible",zIndex:_4.style(_d,"zIndex")}},_d,"after"),_1b=[],_1c=_6.create(_d.tagName,{style:{position:"absolute",border:"none",padding:0,margin:0,height:_18+_16+"px",width:_19+_17+"px",overflow:"hidden"}});
for(var y=0,ly=_c.rows;y<ly;y++){
for(var x=0,lx=_c.columns;x<lx;x++){
var _1d=_1.clone(_1c),_1e=_1.clone(_d),_1f=y*_18,_20=x*_19;
_1e.style.filter="";
_7.remove(_1e,"id");
_4.style(_1d,{border:"none",overflow:"hidden",top:_1f+"px",left:_20+"px"});
_4.style(_1e,{position:"static",opacity:"1",marginTop:-_1f+"px",marginLeft:-_20+"px"});
_1d.appendChild(_1e);
_1a.appendChild(_1d);
var _21=_c.pieceAnimation(_1d,x,y,_13);
if(_1.isArray(_21)){
_1b=_1b.concat(_21);
}else{
_1b.push(_21);
}
}
}
var _22=_8.combine(_1b);
_a.connect(_22,"onEnd",_22,function(){
_1a.parentNode.removeChild(_1a);
});
if(_c.onPlay){
_a.connect(_22,"onPlay",_22,_c.onPlay);
}
if(_c.onEnd){
_a.connect(_22,"onEnd",_22,_c.onEnd);
}
return _22;
},explode:function(_23){
var _24=_23.node=_2.byId(_23.node);
_23.rows=_23.rows||3;
_23.columns=_23.columns||3;
_23.distance=_23.distance||1;
_23.duration=_23.duration||1000;
_23.random=_23.random||0;
if(!_23.fade){
_23.fade=true;
}
if(typeof _23.sync=="undefined"){
_23.sync=true;
}
_23.random=Math.abs(_23.random);
_23.pieceAnimation=function(_25,x,y,_26){
var _27=_26.h/_23.rows,_28=_26.w/_23.columns,_29=_23.distance*2,_2a=_23.duration,ps=_25.style,_2b=parseInt(ps.top),_2c=parseInt(ps.left),_2d=0,_2e=0,_2f=0;
if(_23.random){
var _30=(Math.random()*_23.random)+Math.max(1-_23.random,0);
_29*=_30;
_2a*=_30;
_2d=((_23.unhide&&_23.sync)||(!_23.unhide&&!_23.sync))?(_23.duration-_2a):0;
_2e=Math.random()-0.5;
_2f=Math.random()-0.5;
}
var _31=((_26.h-_27)/2-_27*y),_32=((_26.w-_28)/2-_28*x),_33=Math.sqrt(Math.pow(_32,2)+Math.pow(_31,2)),_34=parseInt(_2b-_31*_29+_33*_2f),_35=parseInt(_2c-_32*_29+_33*_2e);
var _36=_8.animateProperty({node:_25,duration:_2a,delay:_2d,easing:(_23.easing||(_23.unhide?_9.sinOut:_9.circOut)),beforeBegin:(_23.unhide?function(){
if(_23.fade){
_4.style(_25,{opacity:"0"});
}
ps.top=_34+"px";
ps.left=_35+"px";
}:undefined),properties:{top:(_23.unhide?{start:_34,end:_2b}:{start:_2b,end:_34}),left:(_23.unhide?{start:_35,end:_2c}:{start:_2c,end:_35})}});
if(_23.fade){
var _37=_8.animateProperty({node:_25,duration:_2a,delay:_2d,easing:(_23.fadeEasing||_9.quadOut),properties:{opacity:(_23.unhide?{start:"0",end:"1"}:{start:"1",end:"0"})}});
return (_23.unhide?[_37,_36]:[_36,_37]);
}else{
return _36;
}
};
var _38=_b._split(_23);
if(_23.unhide){
_a.connect(_38,"onEnd",null,function(){
_4.style(_24,{opacity:"1"});
});
}else{
_a.connect(_38,"onPlay",null,function(){
_4.style(_24,{opacity:"0"});
});
}
return _38;
},converge:function(_39){
_39.unhide=true;
return _b.explode(_39);
},disintegrate:function(_3a){
var _3b=_3a.node=_2.byId(_3a.node);
_3a.rows=_3a.rows||5;
_3a.columns=_3a.columns||5;
_3a.duration=_3a.duration||1500;
_3a.interval=_3a.interval||_3a.duration/(_3a.rows+_3a.columns*2);
_3a.distance=_3a.distance||1.5;
_3a.random=_3a.random||0;
if(typeof _3a.fade=="undefined"){
_3a.fade=true;
}
var _3c=Math.abs(_3a.random),_3d=_3a.duration-(_3a.rows+_3a.columns)*_3a.interval;
_3a.pieceAnimation=function(_3e,x,y,_3f){
var _40=Math.random()*(_3a.rows+_3a.columns)*_3a.interval,ps=_3e.style,_41=(_3a.reverseOrder||_3a.distance<0)?((x+y)*_3a.interval):(((_3a.rows+_3a.columns)-(x+y))*_3a.interval),_42=_40*_3c+Math.max(1-_3c,0)*_41,_43={};
if(_3a.unhide){
_43.top={start:(parseInt(ps.top)-_3f.h*_3a.distance),end:parseInt(ps.top)};
if(_3a.fade){
_43.opacity={start:"0",end:"1"};
}
}else{
_43.top={end:(parseInt(ps.top)+_3f.h*_3a.distance)};
if(_3a.fade){
_43.opacity={end:"0"};
}
}
var _44=_8.animateProperty({node:_3e,duration:_3d,delay:_42,easing:(_3a.easing||(_3a.unhide?_9.sinIn:_9.circIn)),properties:_43,beforeBegin:(_3a.unhide?function(){
if(_3a.fade){
_4.style(_3e,{opacity:"0"});
}
ps.top=_43.top.start+"px";
}:undefined)});
return _44;
};
var _45=_b._split(_3a);
if(_3a.unhide){
_a.connect(_45,"onEnd",_45,function(){
_4.style(_3b,{opacity:"1"});
});
}else{
_a.connect(_45,"onPlay",_45,function(){
_4.style(_3b,{opacity:"0"});
});
}
return _45;
},build:function(_46){
_46.unhide=true;
return _b.disintegrate(_46);
},shear:function(_47){
var _48=_47.node=_2.byId(_47.node);
_47.rows=_47.rows||6;
_47.columns=_47.columns||6;
_47.duration=_47.duration||1000;
_47.interval=_47.interval||0;
_47.distance=_47.distance||1;
_47.random=_47.random||0;
if(typeof (_47.fade)=="undefined"){
_47.fade=true;
}
var _49=Math.abs(_47.random),_4a=(_47.duration-(_47.rows+_47.columns)*Math.abs(_47.interval));
_47.pieceAnimation=function(_4b,x,y,_4c){
var _4d=!(x%2),_4e=!(y%2),_4f=Math.random()*_4a,_50=(_47.reverseOrder)?(((_47.rows+_47.columns)-(x+y))*_47.interval):((x+y)*_47.interval),_51=_4f*_49+Math.max(1-_49,0)*_50,_52={},ps=_4b.style;
if(_47.fade){
_52.opacity=(_47.unhide?{start:"0",end:"1"}:{end:"0"});
}
if(_47.columns==1){
_4d=_4e;
}else{
if(_47.rows==1){
_4e=!_4d;
}
}
var _53=parseInt(ps.left),top=parseInt(ps.top),_54=_47.distance*_4c.w,_55=_47.distance*_4c.h;
if(_47.unhide){
if(_4d==_4e){
_52.left=_4d?{start:(_53-_54),end:_53}:{start:(_53+_54),end:_53};
}else{
_52.top=_4d?{start:(top+_55),end:top}:{start:(top-_55),end:top};
}
}else{
if(_4d==_4e){
_52.left=_4d?{end:(_53-_54)}:{end:(_53+_54)};
}else{
_52.top=_4d?{end:(top+_55)}:{end:(top-_55)};
}
}
var _56=_8.animateProperty({node:_4b,duration:_4a,delay:_51,easing:(_47.easing||_9.sinInOut),properties:_52,beforeBegin:(_47.unhide?function(){
if(_47.fade){
ps.opacity="0";
}
if(_4d==_4e){
ps.left=_52.left.start+"px";
}else{
ps.top=_52.top.start+"px";
}
}:undefined)});
return _56;
};
var _57=_b._split(_47);
if(_47.unhide){
_a.connect(_57,"onEnd",_57,function(){
_4.style(_48,{opacity:"1"});
});
}else{
_a.connect(_57,"onPlay",_57,function(){
_4.style(_48,{opacity:"0"});
});
}
return _57;
},unShear:function(_58){
_58.unhide=true;
return _b.shear(_58);
},pinwheel:function(_59){
var _5a=_59.node=_2.byId(_59.node);
_59.rows=_59.rows||4;
_59.columns=_59.columns||4;
_59.duration=_59.duration||1000;
_59.interval=_59.interval||0;
_59.distance=_59.distance||1;
_59.random=_59.random||0;
if(typeof _59.fade=="undefined"){
_59.fade=true;
}
var _5b=(_59.duration-(_59.rows+_59.columns)*Math.abs(_59.interval));
_59.pieceAnimation=function(_5c,x,y,_5d){
var _5e=_5d.h/_59.rows,_5f=_5d.w/_59.columns,_60=!(x%2),_61=!(y%2),_62=Math.random()*_5b,_63=(_59.interval<0)?(((_59.rows+_59.columns)-(x+y))*_59.interval*-1):((x+y)*_59.interval),_64=_62*_59.random+Math.max(1-_59.random,0)*_63,_65={},ps=_5c.style;
if(_59.fade){
_65.opacity=(_59.unhide?{start:0,end:1}:{end:0});
}
if(_59.columns==1){
_60=!_61;
}else{
if(_59.rows==1){
_61=_60;
}
}
var _66=parseInt(ps.left),top=parseInt(ps.top);
if(_60){
if(_61){
_65.top=_59.unhide?{start:top+_5e*_59.distance,end:top}:{start:top,end:top+_5e*_59.distance};
}else{
_65.left=_59.unhide?{start:_66+_5f*_59.distance,end:_66}:{start:_66,end:_66+_5f*_59.distance};
}
}
if(_60!=_61){
_65.width=_59.unhide?{start:_5f*(1-_59.distance),end:_5f}:{start:_5f,end:_5f*(1-_59.distance)};
}else{
_65.height=_59.unhide?{start:_5e*(1-_59.distance),end:_5e}:{start:_5e,end:_5e*(1-_59.distance)};
}
var _67=_8.animateProperty({node:_5c,duration:_5b,delay:_64,easing:(_59.easing||_9.sinInOut),properties:_65,beforeBegin:(_59.unhide?function(){
if(_59.fade){
_4.style(_5c,"opacity",0);
}
if(_60){
if(_61){
ps.top=(top+_5e*(1-_59.distance))+"px";
}else{
ps.left=(_66+_5f*(1-_59.distance))+"px";
}
}else{
ps.left=_66+"px";
ps.top=top+"px";
}
if(_60!=_61){
ps.width=(_5f*(1-_59.distance))+"px";
}else{
ps.height=(_5e*(1-_59.distance))+"px";
}
}:undefined)});
return _67;
};
var _68=_b._split(_59);
if(_59.unhide){
_a.connect(_68,"onEnd",_68,function(){
_4.style(_5a,{opacity:"1"});
});
}else{
_a.connect(_68,"play",_68,function(){
_4.style(_5a,{opacity:"0"});
});
}
return _68;
},unPinwheel:function(_69){
_69.unhide=true;
return _b.pinwheel(_69);
},blockFadeOut:function(_6a){
var _6b=_6a.node=_2.byId(_6a.node);
_6a.rows=_6a.rows||5;
_6a.columns=_6a.columns||5;
_6a.duration=_6a.duration||1000;
_6a.interval=_6a.interval||_6a.duration/(_6a.rows+_6a.columns*2);
_6a.random=_6a.random||0;
var _6c=Math.abs(_6a.random),_6d=_6a.duration-(_6a.rows+_6a.columns)*_6a.interval;
_6a.pieceAnimation=function(_6e,x,y,_6f){
var _70=Math.random()*_6a.duration,_71=(_6a.reverseOrder)?(((_6a.rows+_6a.columns)-(x+y))*Math.abs(_6a.interval)):((x+y)*_6a.interval),_72=_70*_6c+Math.max(1-_6c,0)*_71,_73=_8.animateProperty({node:_6e,duration:_6d,delay:_72,easing:(_6a.easing||_9.sinInOut),properties:{opacity:(_6a.unhide?{start:"0",end:"1"}:{start:"1",end:"0"})},beforeBegin:(_6a.unhide?function(){
_4.style(_6e,{opacity:"0"});
}:function(){
_6e.style.filter="";
})});
return _73;
};
var _74=_b._split(_6a);
if(_6a.unhide){
_a.connect(_74,"onEnd",_74,function(){
_4.style(_6b,{opacity:"1"});
});
}else{
_a.connect(_74,"onPlay",_74,function(){
_4.style(_6b,{opacity:"0"});
});
}
return _74;
},blockFadeIn:function(_75){
_75.unhide=true;
return _b.blockFadeOut(_75);
}});
return _8;
});

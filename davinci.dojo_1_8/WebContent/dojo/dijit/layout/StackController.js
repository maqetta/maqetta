//>>built
define("dijit/layout/StackController",["dojo/_base/array","dojo/_base/declare","dojo/dom-class","dojo/_base/event","dojo/keys","dojo/_base/lang","dojo/on","../focus","../registry","../_Widget","../_TemplatedMixin","../_Container","../form/ToggleButton","dojo/i18n!../nls/common"],function(_1,_2,_3,_4,_5,_6,on,_7,_8,_9,_a,_b,_c){
var _d=_2("dijit.layout._StackButton",_c,{tabIndex:"-1",closeButton:false,_aria_attr:"aria-selected",buildRendering:function(_e){
this.inherited(arguments);
(this.focusNode||this.domNode).setAttribute("role","tab");
}});
var _f=_2("dijit.layout.StackController",[_9,_a,_b],{baseClass:"dijitStackController",templateString:"<span role='tablist' data-dojo-attach-event='onkeypress'></span>",containerId:"",buttonWidget:_d,buttonWidgetClass:"dijitToggleButton",buttonWidgetCloseClass:"dijitStackCloseButton",constructor:function(_10){
this.pane2button={};
},postCreate:function(){
this.inherited(arguments);
this.subscribe(this.containerId+"-startup","onStartup");
this.subscribe(this.containerId+"-addChild","onAddChild");
this.subscribe(this.containerId+"-removeChild","onRemoveChild");
this.subscribe(this.containerId+"-selectChild","onSelectChild");
this.subscribe(this.containerId+"-containerKeyPress","onContainerKeyPress");
this.connect(this.containerNode,"click",function(evt){
var _11=_8.getEnclosingWidget(evt.target);
if(_11!=this.containerNode&&!_11.disabled){
for(var _12=evt.target;_12!==this.containerNode;_12=_12.parentNode){
if(_3.contains(_12,this.buttonWidgetCloseClass)){
this.onCloseButtonClick(_11);
break;
}else{
if(_3.contains(_12,this.buttonWidgetClass)){
this.onButtonClick(_11);
break;
}
}
}
}
});
},onStartup:function(_13){
_1.forEach(_13.children,this.onAddChild,this);
if(_13.selected){
this.onSelectChild(_13.selected);
}
var _14=_8.byId(this.containerId).containerNode,_15=this.pane2button,_16={"title":"label","showtitle":"showLabel","iconclass":"iconClass","closable":"closeButton","tooltip":"title","disabled":"disabled"},_17=function(_18,_19){
return on(_14,"attrmodified-"+_18,function(evt){
var _1a=_15[evt.detail&&evt.detail.widget&&evt.detail.widget.id];
if(_1a){
_1a.set(_19,evt.detail.newValue);
}
});
};
for(var _1b in _16){
this.own(_17(_1b,_16[_1b]));
}
},destroy:function(){
for(var _1c in this.pane2button){
this.onRemoveChild(_8.byId(_1c));
}
this.inherited(arguments);
},onAddChild:function(_1d,_1e){
var Cls=_6.isString(this.buttonWidget)?_6.getObject(this.buttonWidget):this.buttonWidget;
var _1f=new Cls({id:this.id+"_"+_1d.id,label:_1d.title,disabled:_1d.disabled,ownerDocument:this.ownerDocument,dir:_1d.dir,lang:_1d.lang,textDir:_1d.textDir,showLabel:_1d.showTitle,iconClass:_1d.iconClass,closeButton:_1d.closable,title:_1d.tooltip,page:_1d});
this.addChild(_1f,_1e);
this.pane2button[_1d.id]=_1f;
_1d.controlButton=_1f;
if(!this._currentChild){
this.onSelectChild(_1d);
}
},onRemoveChild:function(_20){
if(this._currentChild===_20){
this._currentChild=null;
}
var _21=this.pane2button[_20.id];
if(_21){
this.removeChild(_21);
delete this.pane2button[_20.id];
_21.destroy();
}
delete _20.controlButton;
},onSelectChild:function(_22){
if(!_22){
return;
}
if(this._currentChild){
var _23=this.pane2button[this._currentChild.id];
_23.set("checked",false);
_23.focusNode.setAttribute("tabIndex","-1");
}
var _24=this.pane2button[_22.id];
_24.set("checked",true);
this._currentChild=_22;
_24.focusNode.setAttribute("tabIndex","0");
var _25=_8.byId(this.containerId);
_25.containerNode.setAttribute("aria-labelledby",_24.id);
},onButtonClick:function(_26){
_7.focus(_26.focusNode);
var _27=_26.page;
if(this._currentChild.id===_27.id){
var _26=this.pane2button[_27.id];
_26.set("checked",true);
}
var _28=_8.byId(this.containerId);
_28.selectChild(_27);
},onCloseButtonClick:function(_29){
var _2a=_29.page,_2b=_8.byId(this.containerId);
_2b.closeChild(_2a);
if(this._currentChild){
var b=this.pane2button[this._currentChild.id];
if(b){
_7.focus(b.focusNode||b.domNode);
}
}
},adjacent:function(_2c){
if(!this.isLeftToRight()&&(!this.tabPosition||/top|bottom/.test(this.tabPosition))){
_2c=!_2c;
}
var _2d=this.getChildren();
var idx=_1.indexOf(_2d,this.pane2button[this._currentChild.id]),_2e=_2d[idx];
var _2f;
do{
idx=(idx+(_2c?1:_2d.length-1))%_2d.length;
_2f=_2d[idx];
}while(_2f.disabled&&_2f!=_2e);
return _2f;
},onkeypress:function(e){
if(this.disabled||e.altKey){
return;
}
var _30=null;
if(e.ctrlKey||!e._djpage){
switch(e.charOrCode){
case _5.LEFT_ARROW:
case _5.UP_ARROW:
if(!e._djpage){
_30=false;
}
break;
case _5.PAGE_UP:
if(e.ctrlKey){
_30=false;
}
break;
case _5.RIGHT_ARROW:
case _5.DOWN_ARROW:
if(!e._djpage){
_30=true;
}
break;
case _5.PAGE_DOWN:
if(e.ctrlKey){
_30=true;
}
break;
case _5.HOME:
var _31=this.getChildren();
for(var idx=0;idx<_31.length;idx++){
var _32=_31[idx];
if(!_32.disabled){
this.onButtonClick(_32);
break;
}
}
_4.stop(e);
break;
case _5.END:
var _31=this.getChildren();
for(var idx=_31.length-1;idx>=0;idx--){
var _32=_31[idx];
if(!_32.disabled){
this.onButtonClick(_32);
break;
}
}
_4.stop(e);
break;
case _5.DELETE:
if(this._currentChild.closable){
this.onCloseButtonClick(this.pane2button[this._currentChild.id]);
}
_4.stop(e);
break;
default:
if(e.ctrlKey){
if(e.charOrCode===_5.TAB){
this.onButtonClick(this.adjacent(!e.shiftKey));
_4.stop(e);
}else{
if(e.charOrCode=="w"){
if(this._currentChild.closable){
this.onCloseButtonClick(this.pane2button[this._currentChild.id]);
}
_4.stop(e);
}
}
}
}
if(_30!==null){
this.onButtonClick(this.adjacent(_30));
_4.stop(e);
}
}
},onContainerKeyPress:function(_33){
_33.e._djpage=_33.page;
this.onkeypress(_33.e);
}});
_f.StackButton=_d;
return _f;
});

/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/StackController",["dojo/_base/kernel","..","../_Widget","../_TemplatedMixin","../_Container","../form/ToggleButton","../focus","dojo/i18n!../nls/common","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/lang","dojo/_base/sniff"],function(_1,_2){
_1.declare("dijit.layout.StackController",[_2._Widget,_2._TemplatedMixin,_2._Container],{baseClass:"dijitTabController",templateString:"<span role='tablist' dojoAttachEvent='onkeypress'></span>",containerId:"",buttonWidget:"dijit.layout._StackButton",constructor:function(){
this.pane2button={};
this.pane2connects={};
this.pane2watches={};
},postCreate:function(){
this.inherited(arguments);
this.subscribe(this.containerId+"-startup","onStartup");
this.subscribe(this.containerId+"-addChild","onAddChild");
this.subscribe(this.containerId+"-removeChild","onRemoveChild");
this.subscribe(this.containerId+"-selectChild","onSelectChild");
this.subscribe(this.containerId+"-containerKeyPress","onContainerKeyPress");
},onStartup:function(_3){
_1.forEach(_3.children,this.onAddChild,this);
if(_3.selected){
this.onSelectChild(_3.selected);
}
},destroy:function(){
for(var _4 in this.pane2button){
this.onRemoveChild(_2.byId(_4));
}
this.inherited(arguments);
},onAddChild:function(_5,_6){
var _7=_1.getObject(this.buttonWidget);
var _8=new _7({id:this.id+"_"+_5.id,label:_5.title,dir:_5.dir,lang:_5.lang,textDir:_5.textDir,showLabel:_5.showTitle,iconClass:_5.iconClass,closeButton:_5.closable,title:_5.tooltip});
_8.focusNode.setAttribute("aria-selected","false");
var _9=["title","showTitle","iconClass","closable","tooltip"],_a=["label","showLabel","iconClass","closeButton","title"];
this.pane2watches[_5.id]=_1.map(_9,function(_b,_c){
return _5.watch(_b,function(_d,_e,_f){
_8.set(_a[_c],_f);
});
});
this.pane2connects[_5.id]=[this.connect(_8,"onClick",_1.hitch(this,"onButtonClick",_5)),this.connect(_8,"onClickCloseButton",_1.hitch(this,"onCloseButtonClick",_5))];
this.addChild(_8,_6);
this.pane2button[_5.id]=_8;
_5.controlButton=_8;
if(!this._currentChild){
_8.focusNode.setAttribute("tabIndex","0");
_8.focusNode.setAttribute("aria-selected","true");
this._currentChild=_5;
}
if(!this.isLeftToRight()&&_1.isIE&&this._rectifyRtlTabList){
this._rectifyRtlTabList();
}
},onRemoveChild:function(_10){
if(this._currentChild===_10){
this._currentChild=null;
}
_1.forEach(this.pane2connects[_10.id],_1.hitch(this,"disconnect"));
delete this.pane2connects[_10.id];
_1.forEach(this.pane2watches[_10.id],function(w){
w.unwatch();
});
delete this.pane2watches[_10.id];
var _11=this.pane2button[_10.id];
if(_11){
this.removeChild(_11);
delete this.pane2button[_10.id];
_11.destroy();
}
delete _10.controlButton;
},onSelectChild:function(_12){
if(!_12){
return;
}
if(this._currentChild){
var _13=this.pane2button[this._currentChild.id];
_13.set("checked",false);
_13.focusNode.setAttribute("aria-selected","false");
_13.focusNode.setAttribute("tabIndex","-1");
}
var _14=this.pane2button[_12.id];
_14.set("checked",true);
_14.focusNode.setAttribute("aria-selected","true");
this._currentChild=_12;
_14.focusNode.setAttribute("tabIndex","0");
var _15=_2.byId(this.containerId);
_15.containerNode.setAttribute("aria-labelledby",_14.id);
},onButtonClick:function(_16){
var _17=_2.byId(this.containerId);
_17.selectChild(_16);
},onCloseButtonClick:function(_18){
var _19=_2.byId(this.containerId);
_19.closeChild(_18);
if(this._currentChild){
var b=this.pane2button[this._currentChild.id];
if(b){
_2.focus(b.focusNode||b.domNode);
}
}
},adjacent:function(_1a){
if(!this.isLeftToRight()&&(!this.tabPosition||/top|bottom/.test(this.tabPosition))){
_1a=!_1a;
}
var _1b=this.getChildren();
var _1c=_1.indexOf(_1b,this.pane2button[this._currentChild.id]);
var _1d=_1a?1:_1b.length-1;
return _1b[(_1c+_1d)%_1b.length];
},onkeypress:function(e){
if(this.disabled||e.altKey){
return;
}
var _1e=null;
if(e.ctrlKey||!e._djpage){
var k=_1.keys;
switch(e.charOrCode){
case k.LEFT_ARROW:
case k.UP_ARROW:
if(!e._djpage){
_1e=false;
}
break;
case k.PAGE_UP:
if(e.ctrlKey){
_1e=false;
}
break;
case k.RIGHT_ARROW:
case k.DOWN_ARROW:
if(!e._djpage){
_1e=true;
}
break;
case k.PAGE_DOWN:
if(e.ctrlKey){
_1e=true;
}
break;
case k.HOME:
case k.END:
var _1f=this.getChildren();
if(_1f&&_1f.length){
_1f[e.charOrCode==k.HOME?0:_1f.length-1].onClick();
}
_1.stopEvent(e);
break;
case k.DELETE:
if(this._currentChild.closable){
this.onCloseButtonClick(this._currentChild);
}
_1.stopEvent(e);
break;
default:
if(e.ctrlKey){
if(e.charOrCode===k.TAB){
this.adjacent(!e.shiftKey).onClick();
_1.stopEvent(e);
}else{
if(e.charOrCode=="w"){
if(this._currentChild.closable){
this.onCloseButtonClick(this._currentChild);
}
_1.stopEvent(e);
}
}
}
}
if(_1e!==null){
this.adjacent(_1e).onClick();
_1.stopEvent(e);
}
}
},onContainerKeyPress:function(_20){
_20.e._djpage=_20.page;
this.onkeypress(_20.e);
}});
_1.declare("dijit.layout._StackButton",_2.form.ToggleButton,{tabIndex:"-1",closeButton:false,buildRendering:function(evt){
this.inherited(arguments);
(this.focusNode||this.domNode).setAttribute("role","tab");
},onClick:function(evt){
_2.focus(this.focusNode);
},onClickCloseButton:function(evt){
evt.stopPropagation();
}});
return _2.layout.StackController;
});

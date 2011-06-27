/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/_SelectStackMixin",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.form._SelectStackMixin",1);
_1.declare("dojox.form._SelectStackMixin",null,{stackId:"",stackPrefix:"",_paneIdFromOption:function(_4){
return (this.stackPrefix||"")+_4;
},_optionValFromPane:function(id){
var sp=this.stackPrefix;
if(sp&&id.indexOf(sp)===0){
return id.substring(sp.length);
}
return id;
},_togglePane:function(_5,_6){
if(_5._shown!=undefined&&_5._shown==_6){
return;
}
var _7=_1.filter(_5.getDescendants(),"return item.name;");
if(!_6){
_8={};
_1.forEach(_7,function(w){
_8[w.id]=w.disabled;
w.set("disabled",true);
});
_5._savedStates=_8;
}else{
var _8=_5._savedStates||{};
_1.forEach(_7,function(w){
var _9=_8[w.id];
if(_9==undefined){
_9=false;
}
w.set("disabled",_9);
});
delete _5._savedStates;
}
_5._shown=_6;
},_connectTitle:function(_a,_b){
var fx=_1.hitch(this,function(_c){
this.updateOption({value:_b,label:_c});
});
if(_a._setTitleAttr){
this.connect(_a,"_setTitleAttr",fx);
}else{
this.connect(_a,"attr",function(_d,_e){
if(_d=="title"&&arguments.length>1){
fx(_e);
}
});
}
},onAddChild:function(_f,_10){
if(!this._panes[_f.id]){
this._panes[_f.id]=_f;
var v=this._optionValFromPane(_f.id);
this.addOption({value:v,label:_f.title});
this._connectTitle(_f,v);
}
if(!_f.onShow||!_f.onHide||_f._shown==undefined){
_f.onShow=_1.hitch(this,"_togglePane",_f,true);
_f.onHide=_1.hitch(this,"_togglePane",_f,false);
_f.onHide();
}
},_setValueAttr:function(v){
if("_savedValue" in this){
return;
}
this.inherited(arguments);
},attr:function(_11,_12){
if(_11=="value"&&arguments.length==2&&"_savedValue" in this){
this._savedValue=_12;
}
return this.inherited(arguments);
},onRemoveChild:function(_13){
if(this._panes[_13.id]){
delete this._panes[_13.id];
this.removeOption(this._optionValFromPane(_13.id));
}
},onSelectChild:function(_14){
this._setValueAttr(this._optionValFromPane(_14.id));
},onStartup:function(_15){
var _16=_15.selected;
this.addOption(_1.filter(_1.map(_15.children,function(c){
var v=this._optionValFromPane(c.id);
this._connectTitle(c,v);
var _17=null;
if(!this._panes[c.id]){
this._panes[c.id]=c;
_17={value:v,label:c.title};
}
if(!c.onShow||!c.onHide||c._shown==undefined){
c.onShow=_1.hitch(this,"_togglePane",c,true);
c.onHide=_1.hitch(this,"_togglePane",c,false);
c.onHide();
}
if("_savedValue" in this&&v===this._savedValue){
_16=c;
}
return _17;
},this),function(i){
return i;
}));
var _18=this;
var fx=function(){
delete _18._savedValue;
_18.onSelectChild(_16);
if(!_16._shown){
_18._togglePane(_16,true);
}
};
if(_16!==_15.selected){
var _19=_2.byId(this.stackId);
var c=this.connect(_19,"_showChild",function(sel){
this.disconnect(c);
fx();
});
}else{
fx();
}
},postMixInProperties:function(){
this._savedValue=this.value;
this.inherited(arguments);
this.connect(this,"onChange","_handleSelfOnChange");
},postCreate:function(){
this.inherited(arguments);
this._panes={};
this._subscriptions=[_1.subscribe(this.stackId+"-startup",this,"onStartup"),_1.subscribe(this.stackId+"-addChild",this,"onAddChild"),_1.subscribe(this.stackId+"-removeChild",this,"onRemoveChild"),_1.subscribe(this.stackId+"-selectChild",this,"onSelectChild")];
var _1a=_2.byId(this.stackId);
if(_1a&&_1a._started){
this.onStartup({children:_1a.getChildren(),selected:_1a.selectedChildWidget});
}
},destroy:function(){
_1.forEach(this._subscriptions,_1.unsubscribe);
delete this._panes;
this.inherited("destroy",arguments);
},_handleSelfOnChange:function(val){
var _1b=this._panes[this._paneIdFromOption(val)];
if(_1b){
var s=_2.byId(this.stackId);
if(_1b==s.selectedChildWidget){
s._transition(_1b);
}else{
s.selectChild(_1b);
}
}
}});
return _1.getObject("dojox.form._SelectStackMixin");
});
require(["dojox/form/_SelectStackMixin"]);

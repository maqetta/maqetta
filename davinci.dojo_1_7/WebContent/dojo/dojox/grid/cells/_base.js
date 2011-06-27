/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/cells/_base",["dojo","dijit","dojox","../util","dijit/_Widget"],function(_1,_2,_3){
_1.declare("dojox.grid._DeferredTextWidget",_2._Widget,{deferred:null,_destroyOnRemove:true,postCreate:function(){
if(this.deferred){
this.deferred.addBoth(_1.hitch(this,function(_4){
if(this.domNode){
this.domNode.innerHTML=_4;
}
}));
}
}});
var _5=function(_6){
try{
_3.grid.util.fire(_6,"focus");
_3.grid.util.fire(_6,"select");
}
catch(e){
}
};
var _7=function(){
setTimeout(_1.hitch.apply(_1,arguments),0);
};
var _8=_1.getObject("grid.cells",true,_3);
_1.declare("dojox.grid.cells._Base",null,{styles:"",classes:"",editable:false,alwaysEditing:false,formatter:null,defaultValue:"...",value:null,hidden:false,noresize:false,draggable:true,_valueProp:"value",_formatPending:false,constructor:function(_9){
this._props=_9||{};
_1.mixin(this,_9);
if(this.draggable===undefined){
this.draggable=true;
}
},_defaultFormat:function(_a,_b){
var s=this.grid.formatterScope||this;
var f=this.formatter;
if(f&&s&&typeof f=="string"){
f=this.formatter=s[f];
}
var v=(_a!=this.defaultValue&&f)?f.apply(s,_b):_a;
if(typeof v=="undefined"){
return this.defaultValue;
}
if(v&&v.addBoth){
v=new _3.grid._DeferredTextWidget({deferred:v},_1.create("span",{innerHTML:this.defaultValue}));
}
if(v&&v.declaredClass&&v.startup){
return "<div class='dojoxGridStubNode' linkWidget='"+v.id+"' cellIdx='"+this.index+"'>"+this.defaultValue+"</div>";
}
return v;
},format:function(_c,_d){
var f,i=this.grid.edit.info,d=this.get?this.get(_c,_d):(this.value||this.defaultValue);
d=(d&&d.replace&&this.grid.escapeHTMLInData)?d.replace(/&/g,"&amp;").replace(/</g,"&lt;"):d;
if(this.editable&&(this.alwaysEditing||(i.rowIndex==_c&&i.cell==this))){
return this.formatEditing(d,_c);
}else{
return this._defaultFormat(d,[d,_c,this]);
}
},formatEditing:function(_e,_f){
},getNode:function(_10){
return this.view.getCellNode(_10,this.index);
},getHeaderNode:function(){
return this.view.getHeaderCellNode(this.index);
},getEditNode:function(_11){
return (this.getNode(_11)||0).firstChild||0;
},canResize:function(){
var uw=this.unitWidth;
return uw&&(uw!=="auto");
},isFlex:function(){
var uw=this.unitWidth;
return uw&&_1.isString(uw)&&(uw=="auto"||uw.slice(-1)=="%");
},applyEdit:function(_12,_13){
this.grid.edit.applyCellEdit(_12,this,_13);
},cancelEdit:function(_14){
this.grid.doCancelEdit(_14);
},_onEditBlur:function(_15){
if(this.grid.edit.isEditCell(_15,this.index)){
this.grid.edit.apply();
}
},registerOnBlur:function(_16,_17){
if(this.commitOnBlur){
_1.connect(_16,"onblur",function(e){
setTimeout(_1.hitch(this,"_onEditBlur",_17),250);
});
}
},needFormatNode:function(_18,_19){
this._formatPending=true;
_7(this,"_formatNode",_18,_19);
},cancelFormatNode:function(){
this._formatPending=false;
},_formatNode:function(_1a,_1b){
if(this._formatPending){
this._formatPending=false;
if(!_1.isIE){
_1.setSelectable(this.grid.domNode,true);
}
this.formatNode(this.getEditNode(_1b),_1a,_1b);
}
},formatNode:function(_1c,_1d,_1e){
if(_1.isIE){
_7(this,"focus",_1e,_1c);
}else{
this.focus(_1e,_1c);
}
},dispatchEvent:function(m,e){
if(m in this){
return this[m](e);
}
},getValue:function(_1f){
return this.getEditNode(_1f)[this._valueProp];
},setValue:function(_20,_21){
var n=this.getEditNode(_20);
if(n){
n[this._valueProp]=_21;
}
},focus:function(_22,_23){
_5(_23||this.getEditNode(_22));
},save:function(_24){
this.value=this.value||this.getValue(_24);
},restore:function(_25){
this.setValue(_25,this.value);
},_finish:function(_26){
_1.setSelectable(this.grid.domNode,false);
this.cancelFormatNode();
},apply:function(_27){
this.applyEdit(this.getValue(_27),_27);
this._finish(_27);
},cancel:function(_28){
this.cancelEdit(_28);
this._finish(_28);
}});
_8._Base.markupFactory=function(_29,_2a){
var d=_1;
var _2b=d.trim(d.attr(_29,"formatter")||"");
if(_2b){
_2a.formatter=_1.getObject(_2b)||_2b;
}
var get=d.trim(d.attr(_29,"get")||"");
if(get){
_2a.get=_1.getObject(get);
}
var _2c=function(_2d,_2e,_2f){
var _30=d.trim(d.attr(_29,_2d)||"");
if(_30){
_2e[_2f||_2d]=!(_30.toLowerCase()=="false");
}
};
_2c("sortDesc",_2a);
_2c("editable",_2a);
_2c("alwaysEditing",_2a);
_2c("noresize",_2a);
_2c("draggable",_2a);
var _31=d.trim(d.attr(_29,"loadingText")||d.attr(_29,"defaultValue")||"");
if(_31){
_2a.defaultValue=_31;
}
var _32=function(_33,_34,_35){
var _36=d.trim(d.attr(_29,_33)||"")||undefined;
if(_36){
_34[_35||_33]=_36;
}
};
_32("styles",_2a);
_32("headerStyles",_2a);
_32("cellStyles",_2a);
_32("classes",_2a);
_32("headerClasses",_2a);
_32("cellClasses",_2a);
};
_1.declare("dojox.grid.cells.Cell",_8._Base,{constructor:function(){
this.keyFilter=this.keyFilter;
},keyFilter:null,formatEditing:function(_37,_38){
this.needFormatNode(_37,_38);
return "<input class=\"dojoxGridInput\" type=\"text\" value=\""+_37+"\">";
},formatNode:function(_39,_3a,_3b){
this.inherited(arguments);
this.registerOnBlur(_39,_3b);
},doKey:function(e){
if(this.keyFilter){
var key=String.fromCharCode(e.charCode);
if(key.search(this.keyFilter)==-1){
_1.stopEvent(e);
}
}
},_finish:function(_3c){
this.inherited(arguments);
var n=this.getEditNode(_3c);
try{
_3.grid.util.fire(n,"blur");
}
catch(e){
}
}});
_8.Cell.markupFactory=function(_3d,_3e){
_8._Base.markupFactory(_3d,_3e);
var d=_1;
var _3f=d.trim(d.attr(_3d,"keyFilter")||"");
if(_3f){
_3e.keyFilter=new RegExp(_3f);
}
};
_1.declare("dojox.grid.cells.RowIndex",_8.Cell,{name:"Row",postscript:function(){
this.editable=false;
},get:function(_40){
return _40+1;
}});
_8.RowIndex.markupFactory=function(_41,_42){
_8.Cell.markupFactory(_41,_42);
};
_1.declare("dojox.grid.cells.Select",_8.Cell,{options:null,values:null,returnIndex:-1,constructor:function(_43){
this.values=this.values||this.options;
},formatEditing:function(_44,_45){
this.needFormatNode(_44,_45);
var h=["<select class=\"dojoxGridSelect\">"];
for(var i=0,o,v;((o=this.options[i])!==undefined)&&((v=this.values[i])!==undefined);i++){
h.push("<option",(_44==v?" selected":"")," value=\""+v+"\"",">",o,"</option>");
}
h.push("</select>");
return h.join("");
},getValue:function(_46){
var n=this.getEditNode(_46);
if(n){
var i=n.selectedIndex,o=n.options[i];
return this.returnIndex>-1?i:o.value||o.innerHTML;
}
}});
_8.Select.markupFactory=function(_47,_48){
_8.Cell.markupFactory(_47,_48);
var d=_1;
var _49=d.trim(d.attr(_47,"options")||"");
if(_49){
var o=_49.split(",");
if(o[0]!=_49){
_48.options=o;
}
}
var _4a=d.trim(d.attr(_47,"values")||"");
if(_4a){
var v=_4a.split(",");
if(v[0]!=_4a){
_48.values=v;
}
}
};
_1.declare("dojox.grid.cells.AlwaysEdit",_8.Cell,{alwaysEditing:true,_formatNode:function(_4b,_4c){
this.formatNode(this.getEditNode(_4c),_4b,_4c);
},applyStaticValue:function(_4d){
var e=this.grid.edit;
e.applyCellEdit(this.getValue(_4d),this,_4d);
e.start(this,_4d,true);
}});
_8.AlwaysEdit.markupFactory=function(_4e,_4f){
_8.Cell.markupFactory(_4e,_4f);
};
_1.declare("dojox.grid.cells.Bool",_8.AlwaysEdit,{_valueProp:"checked",formatEditing:function(_50,_51){
return "<input class=\"dojoxGridInput\" type=\"checkbox\""+(_50?" checked=\"checked\"":"")+" style=\"width: auto\" />";
},doclick:function(e){
if(e.target.tagName=="INPUT"){
this.applyStaticValue(e.rowIndex);
}
}});
_8.Bool.markupFactory=function(_52,_53){
_8.AlwaysEdit.markupFactory(_52,_53);
};
return _3.grid.cells._base;
});

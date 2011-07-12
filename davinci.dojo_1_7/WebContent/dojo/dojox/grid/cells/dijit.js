/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/cells/dijit",["dojo","dijit","dojox","../cells","dojo/data/ItemFileReadStore","dijit/form/DateTextBox","dijit/form/TimeTextBox","dijit/form/ComboBox","dijit/form/CheckBox","dijit/form/TextBox","dijit/form/NumberSpinner","dijit/form/NumberTextBox","dijit/form/CurrencyTextBox","dijit/form/HorizontalSlider","dijit/Editor"],function(_1,_2,_3){
var _4=_3.grid.cells;
_1.declare("dojox.grid.cells._Widget",_4._Base,{widgetClass:_2.form.TextBox,constructor:function(_5){
this.widget=null;
if(typeof this.widgetClass=="string"){
_1.deprecated("Passing a string to widgetClass is deprecated","pass the widget class object instead","2.0");
this.widgetClass=_1.getObject(this.widgetClass);
}
},formatEditing:function(_6,_7){
this.needFormatNode(_6,_7);
return "<div></div>";
},getValue:function(_8){
return this.widget.get("value");
},_unescapeHTML:function(_9){
return (_9&&_9.replace&&this.grid.escapeHTMLInData)?_9.replace(/&lt;/g,"<").replace(/&amp;/g,"&"):_9;
},setValue:function(_a,_b){
if(this.widget&&this.widget.set){
_b=this._unescapeHTML(_b);
if(this.widget.onLoadDeferred){
var _c=this;
this.widget.onLoadDeferred.addCallback(function(){
_c.widget.set("value",_b===null?"":_b);
});
}else{
this.widget.set("value",_b);
}
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_d){
return _1.mixin({dir:this.dir,lang:this.lang},this.widgetProps||{},{constraints:_1.mixin({},this.constraint)||{},value:this._unescapeHTML(_d)});
},createWidget:function(_e,_f,_10){
return new this.widgetClass(this.getWidgetProps(_f),_e);
},attachWidget:function(_11,_12,_13){
_11.appendChild(this.widget.domNode);
this.setValue(_13,_12);
},formatNode:function(_14,_15,_16){
if(!this.widgetClass){
return _15;
}
if(!this.widget){
this.widget=this.createWidget.apply(this,arguments);
}else{
this.attachWidget.apply(this,arguments);
}
this.sizeWidget.apply(this,arguments);
this.grid.views.renormalizeRow(_16);
this.grid.scroller.rowHeightChanged(_16,true);
this.focus();
return undefined;
},sizeWidget:function(_17,_18,_19){
var p=this.getNode(_19),box=_1.contentBox(p);
_1.marginBox(this.widget.domNode,{w:box.w});
},focus:function(_1a,_1b){
if(this.widget){
setTimeout(_1.hitch(this.widget,function(){
_3.grid.util.fire(this,"focus");
}),0);
}
},_finish:function(_1c){
this.inherited(arguments);
_3.grid.util.removeNode(this.widget.domNode);
if(_1.isIE){
_1.setSelectable(this.widget.domNode,true);
}
}});
_4._Widget.markupFactory=function(_1d,_1e){
_4._Base.markupFactory(_1d,_1e);
var d=_1;
var _1f=d.trim(d.attr(_1d,"widgetProps")||"");
var _20=d.trim(d.attr(_1d,"constraint")||"");
var _21=d.trim(d.attr(_1d,"widgetClass")||"");
if(_1f){
_1e.widgetProps=d.fromJson(_1f);
}
if(_20){
_1e.constraint=d.fromJson(_20);
}
if(_21){
_1e.widgetClass=d.getObject(_21);
}
};
_1.declare("dojox.grid.cells.ComboBox",_4._Widget,{widgetClass:_2.form.ComboBox,getWidgetProps:function(_22){
var _23=[];
_1.forEach(this.options,function(o){
_23.push({name:o,value:o});
});
var _24=new _1.data.ItemFileReadStore({data:{identifier:"name",items:_23}});
return _1.mixin({},this.widgetProps||{},{value:_22,store:_24});
},getValue:function(){
var e=this.widget;
e.set("displayedValue",e.get("displayedValue"));
return e.get("value");
}});
_4.ComboBox.markupFactory=function(_25,_26){
_4._Widget.markupFactory(_25,_26);
var d=_1;
var _27=d.trim(d.attr(_25,"options")||"");
if(_27){
var o=_27.split(",");
if(o[0]!=_27){
_26.options=o;
}
}
};
_1.declare("dojox.grid.cells.DateTextBox",_4._Widget,{widgetClass:_2.form.DateTextBox,setValue:function(_28,_29){
if(this.widget){
this.widget.set("value",new Date(_29));
}else{
this.inherited(arguments);
}
},getWidgetProps:function(_2a){
return _1.mixin(this.inherited(arguments),{value:new Date(_2a)});
}});
_4.DateTextBox.markupFactory=function(_2b,_2c){
_4._Widget.markupFactory(_2b,_2c);
};
_1.declare("dojox.grid.cells.CheckBox",_4._Widget,{widgetClass:_2.form.CheckBox,getValue:function(){
return this.widget.checked;
},setValue:function(_2d,_2e){
if(this.widget&&this.widget.attributeMap.checked){
this.widget.set("checked",_2e);
}else{
this.inherited(arguments);
}
},sizeWidget:function(_2f,_30,_31){
return;
}});
_4.CheckBox.markupFactory=function(_32,_33){
_4._Widget.markupFactory(_32,_33);
};
_1.declare("dojox.grid.cells.Editor",_4._Widget,{widgetClass:_2.Editor,getWidgetProps:function(_34){
return _1.mixin({},this.widgetProps||{},{height:this.widgetHeight||"100px"});
},createWidget:function(_35,_36,_37){
var _38=new this.widgetClass(this.getWidgetProps(_36),_35);
_1.connect(_38,"onLoad",_1.hitch(this,"populateEditor"));
return _38;
},formatNode:function(_39,_3a,_3b){
this.content=_3a;
this.inherited(arguments);
if(_1.isMoz){
var e=this.widget;
e.open();
if(this.widgetToolbar){
_1.place(e.toolbar.domNode,e.editingArea,"before");
}
}
},populateEditor:function(){
this.widget.set("value",this.content);
this.widget.placeCursorAtEnd();
}});
_4.Editor.markupFactory=function(_3c,_3d){
_4._Widget.markupFactory(_3c,_3d);
var d=_1;
var h=_1.trim(_1.attr(_3c,"widgetHeight")||"");
if(h){
if((h!="auto")&&(h.substr(-2)!="em")){
h=parseInt(h,10)+"px";
}
_3d.widgetHeight=h;
}
};
return _3.grid.cells.dijit;
});

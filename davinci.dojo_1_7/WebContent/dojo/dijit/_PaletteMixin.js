/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_PaletteMixin",["dojo/_base/kernel",".","./_CssStateMixin","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang","./typematic","./focus"],function(_1,_2){
_1.declare("dijit._PaletteMixin",[_2._CssStateMixin],{defaultTimeout:500,timeoutChangeRate:0.9,value:null,_selectedCell:-1,tabIndex:"0",cellClass:"dijitPaletteCell",dyeClass:"",_preparePalette:function(_3,_4,_5){
this._cells=[];
var _6=this._blankGif;
_5=_5||_1.getObject(this.dyeClass);
for(var _7=0;_7<_3.length;_7++){
var _8=_1.create("tr",{tabIndex:"-1"},this.gridNode);
for(var _9=0;_9<_3[_7].length;_9++){
var _a=_3[_7][_9];
if(_a){
var _b=new _5(_a,_7,_9);
var _c=_1.create("td",{"class":this.cellClass,tabIndex:"-1",title:_4[_a]});
_b.fillCell(_c,_6);
this.connect(_c,"ondijitclick","_onCellClick");
this._trackMouseState(_c,this.cellClass);
_1.place(_c,_8);
_c.index=this._cells.length;
this._cells.push({node:_c,dye:_b});
}
}
}
this._xDim=_3[0].length;
this._yDim=_3.length;
var _d={UP_ARROW:-this._xDim,DOWN_ARROW:this._xDim,RIGHT_ARROW:this.isLeftToRight()?1:-1,LEFT_ARROW:this.isLeftToRight()?-1:1};
for(var _e in _d){
this._connects.push(_2.typematic.addKeyListener(this.domNode,{charOrCode:_1.keys[_e],ctrlKey:false,altKey:false,shiftKey:false},this,function(){
var _f=_d[_e];
return function(_10){
this._navigateByKey(_f,_10);
};
}(),this.timeoutChangeRate,this.defaultTimeout));
}
},postCreate:function(){
this.inherited(arguments);
this._setCurrent(this._cells[0].node);
},focus:function(){
_2.focus(this._currentFocus);
},_onCellClick:function(evt){
var _11=evt.currentTarget,_12=this._getDye(_11).getValue();
this._setCurrent(_11);
setTimeout(_1.hitch(this,function(){
_2.focus(_11);
this._setValueAttr(_12,true);
}));
_1.removeClass(_11,"dijitPaletteCellHover");
_1.stopEvent(evt);
},_setCurrent:function(_13){
if("_currentFocus" in this){
_1.attr(this._currentFocus,"tabIndex","-1");
}
this._currentFocus=_13;
if(_13){
_1.attr(_13,"tabIndex",this.tabIndex);
}
},_setValueAttr:function(_14,_15){
if(this._selectedCell>=0){
_1.removeClass(this._cells[this._selectedCell].node,"dijitPaletteCellSelected");
}
this._selectedCell=-1;
if(_14){
for(var i=0;i<this._cells.length;i++){
if(_14==this._cells[i].dye.getValue()){
this._selectedCell=i;
_1.addClass(this._cells[i].node,"dijitPaletteCellSelected");
break;
}
}
}
this._set("value",this._selectedCell>=0?_14:null);
if(_15||_15===undefined){
this.onChange(_14);
}
},onChange:function(_16){
},_navigateByKey:function(_17,_18){
if(_18==-1){
return;
}
var _19=this._currentFocus.index+_17;
if(_19<this._cells.length&&_19>-1){
var _1a=this._cells[_19].node;
this._setCurrent(_1a);
setTimeout(_1.hitch(_2,"focus",_1a),0);
}
},_getDye:function(_1b){
return this._cells[_1b.index].dye;
}});
return _2._PaletteMixin;
});

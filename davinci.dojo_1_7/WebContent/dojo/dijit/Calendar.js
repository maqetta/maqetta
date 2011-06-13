/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dijit/Calendar",["dojo/_base/kernel",".","dojo/date","dojo/date/locale","./CalendarLite","./_CssStateMixin","./hccss","./form/DropDownButton","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff"],function(_1,_2){
_1.declare("dijit.Calendar",[_2.CalendarLite,_2._CssStateMixin],{cssStateNodes:{"decrementMonth":"dijitCalendarArrow","incrementMonth":"dijitCalendarArrow","previousYearLabelNode":"dijitCalendarPreviousYear","nextYearLabelNode":"dijitCalendarNextYear"},setValue:function(_3){
_1.deprecated("dijit.Calendar:setValue() is deprecated.  Use set('value', ...) instead.","","2.0");
this.set("value",_3);
},_createMonthWidget:function(){
return new _2.Calendar._MonthDropDownButton({id:this.id+"_mddb",tabIndex:-1,onMonthSelect:_1.hitch(this,"_onMonthSelect"),lang:this.lang,dateLocaleModule:this.dateLocaleModule},this.monthNode);
},buildRendering:function(){
this.inherited(arguments);
this.connect(this.domNode,"onkeypress","_onKeyPress");
this.connect(this.dateRowsNode,"onmouseover","_onDayMouseOver");
this.connect(this.dateRowsNode,"onmouseout","_onDayMouseOut");
this.connect(this.dateRowsNode,"onmousedown","_onDayMouseDown");
this.connect(this.dateRowsNode,"onmouseup","_onDayMouseUp");
},_onDayMouseOver:function(_4){
var _5=_1.hasClass(_4.target,"dijitCalendarDateLabel")?_4.target.parentNode:_4.target;
if(_5&&(_5.dijitDateValue||_5==this.previousYearLabelNode||_5==this.nextYearLabelNode)){
_1.addClass(_5,"dijitCalendarHoveredDate");
this._currentNode=_5;
}
},_onDayMouseOut:function(_6){
if(!this._currentNode){
return;
}
if(_6.relatedTarget&&_6.relatedTarget.parentNode==this._currentNode){
return;
}
var _7="dijitCalendarHoveredDate";
if(_1.hasClass(this._currentNode,"dijitCalendarActiveDate")){
_7+=" dijitCalendarActiveDate";
}
_1.removeClass(this._currentNode,_7);
this._currentNode=null;
},_onDayMouseDown:function(_8){
var _9=_8.target.parentNode;
if(_9&&_9.dijitDateValue){
_1.addClass(_9,"dijitCalendarActiveDate");
this._currentNode=_9;
}
},_onDayMouseUp:function(_a){
var _b=_a.target.parentNode;
if(_b&&_b.dijitDateValue){
_1.removeClass(_b,"dijitCalendarActiveDate");
}
},handleKey:function(_c){
var dk=_1.keys,_d=-1,_e,_f=this.currentFocus;
switch(_c.charOrCode){
case dk.RIGHT_ARROW:
_d=1;
case dk.LEFT_ARROW:
_e="day";
if(!this.isLeftToRight()){
_d*=-1;
}
break;
case dk.DOWN_ARROW:
_d=1;
case dk.UP_ARROW:
_e="week";
break;
case dk.PAGE_DOWN:
_d=1;
case dk.PAGE_UP:
_e=_c.ctrlKey||_c.altKey?"year":"month";
break;
case dk.END:
_f=this.dateFuncObj.add(_f,"month",1);
_e="day";
case dk.HOME:
_f=new this.dateClassObj(_f);
_f.setDate(1);
break;
case dk.ENTER:
case " ":
this.set("value",this.currentFocus);
break;
default:
return true;
}
if(_e){
_f=this.dateFuncObj.add(_f,_e,_d);
}
this._setCurrentFocusAttr(_f);
return false;
},_onKeyPress:function(evt){
if(!this.handleKey(evt)){
_1.stopEvent(evt);
}
},onValueSelected:function(_10){
},onChange:function(_11){
this.onValueSelected(_11);
},getClassForDate:function(_12,_13){
}});
_1.declare("dijit.Calendar._MonthDropDownButton",_2.form.DropDownButton,{onMonthSelect:function(){
},postCreate:function(){
this.inherited(arguments);
this.dropDown=new _2.Calendar._MonthDropDown({id:this.id+"_mdd",onChange:this.onMonthSelect});
},_setMonthAttr:function(_14){
var _15=this.dateLocaleModule.getNames("months","wide","standAlone",this.lang,_14);
this.dropDown.set("months",_15);
this.containerNode.innerHTML=(_1.isIE==6?"":"<div class='dijitSpacer'>"+this.dropDown.domNode.innerHTML+"</div>")+"<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>"+_15[_14.getMonth()]+"</div>";
}});
_1.declare("dijit.Calendar._MonthDropDown",[_2._Widget,_2._TemplatedMixin],{months:[],templateString:"<div class='dijitCalendarMonthMenu dijitMenu' "+"dojoAttachEvent='onclick:_onClick,onmouseover:_onMenuHover,onmouseout:_onMenuHover'></div>",_setMonthsAttr:function(_16){
this.domNode.innerHTML=_1.map(_16,function(_17,idx){
return _17?"<div class='dijitCalendarMonthLabel' month='"+idx+"'>"+_17+"</div>":"";
}).join("");
},_onClick:function(evt){
this.onChange(_1.attr(evt.target,"month"));
},onChange:function(_18){
},_onMenuHover:function(evt){
_1.toggleClass(evt.target,"dijitCalendarMonthLabelHover",evt.type=="mouseover");
}});
return _2.Calendar;
});

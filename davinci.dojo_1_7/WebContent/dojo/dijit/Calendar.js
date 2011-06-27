/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
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
},_onMonthSelect:function(_4){
this._setCurrentFocusAttr(this.dateFuncObj.add(this.currentFocus,"month",_4-this.currentFocus.getMonth()));
},_onDayMouseOver:function(_5){
var _6=_1.hasClass(_5.target,"dijitCalendarDateLabel")?_5.target.parentNode:_5.target;
if(_6&&(_6.dijitDateValue||_6==this.previousYearLabelNode||_6==this.nextYearLabelNode)){
_1.addClass(_6,"dijitCalendarHoveredDate");
this._currentNode=_6;
}
},_onDayMouseOut:function(_7){
if(!this._currentNode){
return;
}
if(_7.relatedTarget&&_7.relatedTarget.parentNode==this._currentNode){
return;
}
var _8="dijitCalendarHoveredDate";
if(_1.hasClass(this._currentNode,"dijitCalendarActiveDate")){
_8+=" dijitCalendarActiveDate";
}
_1.removeClass(this._currentNode,_8);
this._currentNode=null;
},_onDayMouseDown:function(_9){
var _a=_9.target.parentNode;
if(_a&&_a.dijitDateValue){
_1.addClass(_a,"dijitCalendarActiveDate");
this._currentNode=_a;
}
},_onDayMouseUp:function(_b){
var _c=_b.target.parentNode;
if(_c&&_c.dijitDateValue){
_1.removeClass(_c,"dijitCalendarActiveDate");
}
},handleKey:function(_d){
var dk=_1.keys,_e=-1,_f,_10=this.currentFocus;
switch(_d.charOrCode){
case dk.RIGHT_ARROW:
_e=1;
case dk.LEFT_ARROW:
_f="day";
if(!this.isLeftToRight()){
_e*=-1;
}
break;
case dk.DOWN_ARROW:
_e=1;
case dk.UP_ARROW:
_f="week";
break;
case dk.PAGE_DOWN:
_e=1;
case dk.PAGE_UP:
_f=_d.ctrlKey||_d.altKey?"year":"month";
break;
case dk.END:
_10=this.dateFuncObj.add(_10,"month",1);
_f="day";
case dk.HOME:
_10=new this.dateClassObj(_10);
_10.setDate(1);
break;
case dk.ENTER:
case " ":
this.set("value",this.currentFocus);
break;
default:
return true;
}
if(_f){
_10=this.dateFuncObj.add(_10,_f,_e);
}
this._setCurrentFocusAttr(_10);
return false;
},_onKeyPress:function(evt){
if(!this.handleKey(evt)){
_1.stopEvent(evt);
}
},onValueSelected:function(_11){
},onChange:function(_12){
this.onValueSelected(_12);
},getClassForDate:function(_13,_14){
}});
_1.declare("dijit.Calendar._MonthDropDownButton",_2.form.DropDownButton,{onMonthSelect:function(){
},postCreate:function(){
this.inherited(arguments);
this.dropDown=new _2.Calendar._MonthDropDown({id:this.id+"_mdd",onChange:this.onMonthSelect});
},_setMonthAttr:function(_15){
var _16=this.dateLocaleModule.getNames("months","wide","standAlone",this.lang,_15);
this.dropDown.set("months",_16);
this.containerNode.innerHTML=(_1.isIE==6?"":"<div class='dijitSpacer'>"+this.dropDown.domNode.innerHTML+"</div>")+"<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>"+_16[_15.getMonth()]+"</div>";
}});
_1.declare("dijit.Calendar._MonthDropDown",[_2._Widget,_2._TemplatedMixin],{months:[],templateString:"<div class='dijitCalendarMonthMenu dijitMenu' "+"dojoAttachEvent='onclick:_onClick,onmouseover:_onMenuHover,onmouseout:_onMenuHover'></div>",_setMonthsAttr:function(_17){
this.domNode.innerHTML=_1.map(_17,function(_18,idx){
return _18?"<div class='dijitCalendarMonthLabel' month='"+idx+"'>"+_18+"</div>":"";
}).join("");
},_onClick:function(evt){
this.onChange(_1.attr(evt.target,"month"));
},onChange:function(_19){
},_onMenuHover:function(evt){
_1.toggleClass(evt.target,"dijitCalendarMonthLabelHover",evt.type=="mouseover");
}});
return _2.Calendar;
});

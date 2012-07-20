//>>built
define("dojox/gantt/TabMenu",["dojox/gantt/contextMenuTab","dijit/Dialog","dijit/form/Button","dijit/form/Form","dijit/registry","dojo/_base/declare","dojo/_base/array","dojo/_base/lang","dojo/date/locale","dojo/request","dojo/on","dojo/dom","dojo/dom-class","dojo/dom-construct","dojo/dom-style","dojo/dom-attr","dojo/dom-geometry","dojo/keys","dojo/parser","dojo/domReady!"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,on,_b,_c,_d,_e,_f,_10,_11,_12){
return _6("dojox.gantt.GanttTaskControl",[],{constructor:function(_13){
this.ganttChart=_13;
this.menuPanel=null;
this.paneContentArea=null;
this.paneActionBar=null;
this.tabPanelDlg=null;
this.tabPanelDlgId=null;
this.arrTabs=[];
this.isShow=false;
this.buildContent();
},buildContent:function(){
this.createMenuPanel();
this.createTabPanel();
var _14=this.createTab(11,"Add Successor Task","t",true,this);
_14.addItem(1,"Id","id",true);
_14.addItem(2,"Name","name");
_14.addItem(3,"Start Time","startTime");
_14.addItem(4,"Duration (hours)","duration");
_14.addItem(5,"Percent Complete (%)","percentage");
_14.addItem(6,"Task Assignee","taskOwner");
_14.addAction("addSuccessorTaskAction");
var _15=this.createTab(10,"Add Child Task","t",true,this);
_15.addItem(1,"Id","id",true);
_15.addItem(2,"Name","name");
_15.addItem(3,"Start Time","startTime");
_15.addItem(4,"Duration (hours)","duration");
_15.addItem(5,"Percent Complete (%)","percentage");
_15.addItem(6,"Task Assignee","taskOwner");
_15.addAction("addChildTaskAction");
var _16=this.createTab(4,"Set Duration(hours)","t",true,this,true);
_16.addItem(1,"Duration (hours)","duration",true);
_16.addAction("durationUpdateAction");
var _17=this.createTab(5,"Set Complete Percentage (%)","t",true,this,true);
_17.addItem(1,"Percent Complete (%)","percentage",true);
_17.addAction("cpUpdateAction");
var _18=this.createTab(20,"Set Owner","t",true,this,true);
_18.addItem(1,"Task Assignee","taskOwner",true);
_18.addAction("ownerUpdateAction");
var _19=this.createTab(13,"Set Previous Task","t",true,this);
_19.addItem(1,"Previous Task Id","previousTaskId",true);
_19.addAction("ptUpdateAction");
var _1a=this.createTab(1,"Rename Task","t",true,this,true);
_1a.addItem(1,"New Name","name",true);
_1a.addAction("renameTaskAction");
var _1b=this.createTab(2,"Delete Task","t",true,this);
_1b.addAction("deleteAction");
var _1c=this.createTab(12,"Add New Project","p",false,this);
_1c.addItem(1,"Id","id",true);
_1c.addItem(2,"Name","name",true);
_1c.addItem(3,"Start Date","startDate",true);
_1c.addAction("addProjectAction");
var _1d=this.createTab(8,"Set Complete Percentage (%)","p",true,this,true);
_1d.addItem(1,"Percent Complete (%)","percentage",true);
_1d.addAction("cpProjectAction");
var _1e=this.createTab(6,"Rename Project","p",true,this,true);
_1e.addItem(1,"New Name","name",true);
_1e.addAction("renameProjectAction");
var _1f=this.createTab(7,"Delete Project","p",true,this);
_1f.addAction("deleteProjectAction");
var _20=this.createTab(9,"Add New Task","p",true,this);
_20.addItem(1,"Id","id",true);
_20.addItem(2,"Name","name");
_20.addItem(3,"Start Time","startTime");
_20.addItem(4,"Duration (hours)","duration");
_20.addItem(5,"Percent Complete (%)","percentage");
_20.addItem(6,"Task Assignee","taskOwner");
_20.addItem(7,"Parent Task Id","parentTaskId");
_20.addItem(8,"Previous Task Id","previousTaskId");
_20.addAction("addTaskAction");
},createMenuPanel:function(){
this.menuPanel=_d.create("div",{innerHTML:"<table></table>",className:"ganttMenuPanel"},this.ganttChart.content);
_c.add(this.menuPanel.firstChild,"ganttContextMenu");
this.menuPanel.firstChild.cellPadding=0;
this.menuPanel.firstChild.cellSpacing=0;
},createTabPanel:function(){
this.tabPanelDlg=_5.byId(this.tabPanelDlgId)||new _2({title:"Settings"});
this.tabPanelDlgId=this.tabPanelDlg.id;
this.tabPanelDlg.closeButtonNode.style.display="none";
var _21=this.tabPanelDlg.containerNode;
this.paneContentArea=_d.create("div",{className:"dijitDialogPaneContentArea"},_21);
this.paneActionBar=_d.create("div",{className:"dijitDialogPaneActionBar"},_21);
this.paneContentArea.innerHTML="<table cellpadding=0 cellspacing=0><tr><th></th></tr><tr><td></td></tr></table>";
var _22=this.paneContentArea.firstChild.rows[0].cells[0];
_22.colSpan=2;
_22.innerHTML="Description: ";
_c.add(_22,"ganttDialogContentHeader");
var _23=this.paneContentArea.firstChild.rows[1].cells[0];
_23.innerHTML="<table></table>";
_c.add(_23.firstChild,"ganttDialogContentCell");
_23.align="center";
this.ok=new _3({label:"OK"});
this.cancel=new _3({label:"Cancel"});
this.paneActionBar.appendChild(this.ok.domNode);
this.paneActionBar.appendChild(this.cancel.domNode);
},addItemMenuPanel:function(tab){
var row=this.menuPanel.firstChild.insertRow(this.menuPanel.firstChild.rows.length);
var _24=_d.create("td",{className:"ganttContextMenuItem",innerHTML:tab.Description});
_f.set(_24,"tabIndex",0);
this.ganttChart._events.push(on(_24,"click",_8.hitch(this,function(_25){
try{
this.hide();
tab.show();
}
catch(e){
}
})));
this.ganttChart._events.push(on(_24,"keydown",_8.hitch(this,function(_26){
if(_26.keyCode!=_11.ENTER){
return;
}
try{
this.hide();
tab.show();
}
catch(e){
}
})));
this.ganttChart._events.push(on(_24,"mouseover",_8.hitch(this,function(_27){
_c.add(_24,"ganttContextMenuItemHover");
})));
this.ganttChart._events.push(on(_24,"mouseout",_8.hitch(this,function(_28){
_c.remove(_24,"ganttContextMenuItemHover");
})));
row.appendChild(_24);
},show:function(_29,_2a){
if(_2a.constructor==GanttTaskControl){
_7.forEach(this.arrTabs,function(tab){
if(tab.type=="t"){
tab.object=_2a;
this.addItemMenuPanel(tab);
}
},this);
}else{
if(_2a.constructor==GanttProjectControl){
_7.forEach(this.arrTabs,function(tab){
if(tab.type=="p"){
tab.object=_2a;
this.addItemMenuPanel(tab);
}
},this);
}
}
this.isShow=true;
_e.set(this.menuPanel,{zIndex:15,visibility:"visible"});
var _2b=_10.position(this.menuPanel,true),_2c=_10.position(this.ganttChart.content,true),pos=_10.getMarginBox(_29,true);
if((pos.y+_2b.h)>(_2c.y+_2c.h+50)){
this.menuPanel.style.top=pos.y-_2b.h+pos.h+"px";
}else{
this.menuPanel.style.top=pos.y+"px";
}
if(_10.isBodyLtr()){
this.menuPanel.style.left=pos.x+pos.w+5+"px";
}else{
this.menuPanel.style.left=pos.x-_2b.w-5+"px";
}
},hide:function(){
this.isShow=false;
this.menuPanel.style.visibility="hidden";
},clear:function(){
this.menuPanel.removeChild(this.menuPanel.firstChild);
this.menuPanel.innerHTML="<table></table>";
_c.add(this.menuPanel.firstChild,"ganttContextMenu");
this.menuPanel.firstChild.cellPadding=0;
this.menuPanel.firstChild.cellSpacing=0;
},createTab:function(id,_2d,_2e,_2f,_30,_31){
var tab=new _1(id,_2d,_2e,_2f,_30,_31);
this.arrTabs.push(tab);
return tab;
}});
});

//>>built
define("dojox/gantt/GanttChart",["dojox/gantt/GanttProjectItem","dojox/gantt/GanttResourceItem","dojox/gantt/GanttProjectControl","dojox/gantt/GanttTaskControl","dojox/gantt/TabMenu","dijit/Tooltip","dojo/_base/declare","dojo/_base/array","dojo/_base/lang","dojo/date/locale","dojo/request","dojo/request/util","dojo/on","dojo/dom","dojo/dom-class","dojo/dom-construct","dojo/dom-style","dojo/dom-attr","dojo/dom-geometry","dojo/keys","dojo/has","dojo/_base/window","dojo/json","dojo/domReady!"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,on,_d,_e,_f,_10,_11,_12,_13,has,win,_14){
return _7("dojox.gantt.GanttChart",[],{constructor:function(_15,_16){
this.resourceChartHeight=_15.resourceChartHeight!==undefined?_15.resourceChartHeight:false;
this.withResource=_15.withResource!==undefined?_15.withResource:true;
this.correctError=_15.autoCorrectError!==undefined?_15.autoCorrectError:false;
this.isShowConMenu=this.isContentEditable=!_15.readOnly;
this.withTaskId=_15.withTaskId!==undefined?_15.withTaskId:!_15.readOnly;
this.animation=_15.animation!==undefined?_15.animation:true;
this.saveProgramPath=_15.saveProgramPath||"saveGanttData.php";
this.dataFilePath=_15.dataFilePath||"gantt_default.json";
this.contentHeight=_15.height||400;
this.contentWidth=_15.width||600;
this.content=_d.byId(_16);
this.scrollBarWidth=18;
this.panelTimeHeight=102;
this.maxWidthPanelNames=150;
this.maxWidthTaskNames=150;
this.minWorkLength=8;
this.heightTaskItem=12;
this.heightTaskItemExtra=11;
this.pixelsPerDay=24;
this.hsPerDay=8;
this.pixelsPerWorkHour=this.pixelsPerDay/this.hsPerDay;
this.pixelsPerHour=this.pixelsPerDay/24;
this.countDays=0;
this.totalDays=0;
this.startDate=null;
this.initialPos=0;
this.contentDataHeight=0;
this.panelTimeExpandDelta=20;
this.divTimeInfo=null;
this.panelNames=null;
this.panelTime=null;
this.contentData=null;
this.tabMenu=null;
this.project=[];
this.arrProjects=[];
this.xmlLoader=null;
this.isMoving=false;
this.isResizing=false;
this.animationNodes=[];
this.scale=1;
this.tempDayInPixels=0;
this.resource=null;
this.months=_a.getNames("months","wide");
this._events=[];
},getProject:function(id){
return _8.filter(this.arrProjects,function(_17){
return _17.project.id==id;
},this)[0];
},checkPosPreviousTask:function(_18,_19){
var _1a=this.getWidthOnDuration(_18.duration);
var _1b=this.getPosOnDate(_18.startTime);
var _1c=this.getPosOnDate(_19.startTime);
return (_1a+_1b)<=_1c;
},correctPosPreviousTask:function(_1d,_1e,_1f){
var _20=new Date(_1d.startTime);
_20.setHours(_20.getHours()+(_1d.duration/this.hsPerDay*24));
if(_20.getHours()>0){
_20.setHours(0);
_20.setDate(_20.getDate()+1);
}
_1f?(_1f.setStartTime(_20,true)):(_1e.startTime=_20);
if(_1e.parentTask){
if(!this.checkPosParentTask(_1e.parentTask,_1e)){
var _21=new Date(_1e.parentTask.startTime);
_21.setHours(_21.getHours()+(_1e.parentTask.duration/this.hsPerDay*24));
_1e.duration=parseInt((parseInt((_21-_1e.startTime)/(1000*60*60)))*this.hsPerDay/24);
}
}
},correctPosParentTask:function(_22,_23){
if(!_23.previousTask){
if(_22.startTime>_23.startTime){
_23.startTime=new Date(_22.startTime);
}
if(!this.checkPosParentTask(_22,_23)){
_23.duration=_22.duration;
}
}else{
this.correctPosPreviousTask(_23.previousTask,_23);
}
},checkPosParentTaskInTree:function(_24){
var _25=false;
for(var i=0;i<_24.cldTasks.length;i++){
var _26=_24.cldTasks[i];
if(!this.checkPosParentTask(_24,_26)){
if(!this.correctError){
return true;
}else{
this.correctPosParentTask(_24,_26);
}
}
if(_24.startTime>_26.startTime){
if(!this.correctError){
return true;
}else{
this.correctPosParentTask(_24,_26);
}
}
if(_26.cldTasks.length>0){
_25=this.checkPosParentTaskInTree(_26);
}
}
return _25;
},setPreviousTask:function(_27){
var _28=false;
for(var i=0;i<_27.parentTasks.length;i++){
var _29=_27.parentTasks[i];
if(_29.previousTaskId){
_29.previousTask=_27.getTaskById(_29.previousTaskId);
if(!_29.previousTask){
if(!this.correctError){
return true;
}
}
_29.previousTask.cldPreTasks.push(_29);
}
if(_29.previousTask){
if(!this.checkPosPreviousTask(_29.previousTask,_29)){
if(!this.correctError){
return true;
}else{
this.correctPosPreviousTask(_29.previousTask,_29);
}
}
}
_28=this.setPreviousTaskInTree(_29);
}
return _28;
},setPreviousTaskInTree:function(_2a){
var _2b=false;
for(var i=0;i<_2a.cldTasks.length;i++){
var _2c=_2a.cldTasks[i];
if(_2c.previousTaskId){
_2c.previousTask=_2a.project.getTaskById(_2c.previousTaskId);
if(!_2c.previousTask){
if(!this.correctError){
return true;
}
}
if(!this.checkPosPreviousTask(_2c.previousTask,_2c)){
if(!this.correctError){
return true;
}else{
this.correctPosPreviousTask(_2c.previousTask,_2c);
}
}
_2c.previousTask.cldPreTasks.push(_2c);
}
if(_2c.cldTasks.length>0){
_2b=this.setPreviousTaskInTree(_2c);
}
}
return _2b;
},checkPosParentTask:function(_2d,_2e){
var _2f=this.getWidthOnDuration(_2d.duration);
var _30=this.getPosOnDate(_2d.startTime);
var _31=this.getPosOnDate(_2e.startTime);
var _32=this.getWidthOnDuration(_2e.duration);
return (_2f+_30)>=(_31+_32);
},addProject:function(_33){
this.project.push(_33);
},deleteProject:function(id){
var _34=this.getProject(id);
if(_34){
if(_34.arrTasks.length>0){
while(_34.arrTasks.length>0){
_34.deleteChildTask(_34.arrTasks[0]);
}
}
var _35=this.heightTaskItemExtra+this.heightTaskItem;
_34.nextProject&&_34.shiftNextProject(_34,-_35);
this.project=_8.filter(this.project,function(_36){
return _36.id!=_34.project.id;
},this);
if((_34.previousProject)&&(_34.nextProject)){
var _37=_34.previousProject;
_37.nextProject=_34.nextProject;
}
if((_34.previousProject)&&!(_34.nextProject)){
var _37=_34.previousProject;
_37.nextProject=null;
}
if(!(_34.previousProject)&&(_34.nextProject)){
var _38=_34.nextProject;
_38.previousProject=null;
}
for(var i=0;i<this.arrProjects.length;i++){
if(this.arrProjects[i].project.id==id){
this.arrProjects.splice(i,1);
}
}
_34.projectItem[0].parentNode.removeChild(_34.projectItem[0]);
_34.descrProject.parentNode.removeChild(_34.descrProject);
_34.projectNameItem.parentNode.removeChild(_34.projectNameItem);
this.contentDataHeight-=this.heightTaskItemExtra+this.heightTaskItem;
if(this.project.length==0){
var d=new Date(this.startDate);
var t=new Date(d.setDate(d.getDate()+1));
var pi=new _1({id:1,name:"New Project",startDate:t});
this.project.push(pi);
var _34=new _3(this,pi);
_34.create();
this.arrProjects.push(_34);
this.contentDataHeight+=this.heightTaskItemExtra+this.heightTaskItem;
}
this.checkPosition();
}
},insertProject:function(id,_39,_3a){
if(this.startDate>=_3a){
return false;
}
if(this.getProject(id)){
return false;
}
this.checkHeighPanelTasks();
var _3b=new _1({id:id,name:_39,startDate:_3a});
this.project.push(_3b);
var _3c=new _3(this,_3b);
for(var i=0;i<this.arrProjects.length;i++){
var _3d=this.arrProjects[i],_3e=this.arrProjects[i-1],_3f=this.arrProjects[i+1];
if(_3a<_3d.project.startDate){
this.arrProjects.splice(i,0,_3c);
if(i>0){
_3c.previousProject=_3e;
_3e.nextProject=_3c;
}
if(i+1<=this.arrProjects.length){
_3c.nextProject=_3f;
_3f.previousProject=_3c;
var _40=this.heightTaskItem+this.heightTaskItemExtra;
_3c.shiftNextProject(_3c,_40);
}
_3c.create();
_3c.hideDescrProject();
this.checkPosition();
return _3c;
}
}
if(this.arrProjects.length>0){
this.arrProjects[this.arrProjects.length-1].nextProject=_3c;
_3c.previousProject=this.arrProjects[this.arrProjects.length-1];
}
this.arrProjects.push(_3c);
_3c.create();
_3c.hideDescrProject();
this.checkPosition();
return _3c;
},openTree:function(_41){
var _42=this.getLastCloseParent(_41);
this.openNode(_42);
_41.taskItem.id!=_42.taskItem.id&&this.openTree(_41);
},openNode:function(_43){
if(!_43.isExpanded){
_e.remove(_43.cTaskNameItem[2],"ganttImageTreeExpand");
_e.add(_43.cTaskNameItem[2],"ganttImageTreeCollapse");
_43.isExpanded=true;
_43.shiftCurrentTasks(_43,_43.hideTasksHeight);
_43.showChildTasks(_43,_43.isExpanded);
_43.hideTasksHeight=0;
}
},getLastCloseParent:function(_44){
if(_44.parentTask){
if((!_44.parentTask.isExpanded)||(_44.parentTask.cTaskNameItem[2].style.display=="none")){
return this.getLastCloseParent(_44.parentTask);
}else{
return _44;
}
}else{
return _44;
}
},getProjectItemById:function(id){
return _8.filter(this.project,function(_45){
return _45.id==id;
},this)[0];
},clearAll:function(){
this.contentDataHeight=0;
this.startDate=null;
this.clearData();
this.clearItems();
this.clearEvents();
},clearEvents:function(){
_8.forEach(this._events,function(e){
e.remove();
});
this._events=[];
},clearData:function(){
this.project=[];
this.arrProjects=[];
},clearItems:function(){
this.contentData.removeChild(this.contentData.firstChild);
this.contentData.appendChild(this.createPanelTasks());
this.panelNames.removeChild(this.panelNames.firstChild);
this.panelNames.appendChild(this.createPanelNamesTasks());
this.panelTime.removeChild(this.panelTime.firstChild);
},buildUIContent:function(){
this.project.sort(this.sortProjStartDate);
this.startDate=this.getStartDate();
this.panelTime.appendChild(this.createPanelTime());
for(var i=0;i<this.project.length;i++){
var _46=this.project[i];
for(var k=0;k<_46.parentTasks.length;k++){
var _47=_46.parentTasks[k];
if(_47.startTime){
this.setStartTimeChild(_47);
}else{
return;
}
if(this.setPreviousTask(_46)){
return;
}
}
for(var k=0;k<_46.parentTasks.length;k++){
var _47=_46.parentTasks[k];
if(_47.startTime<_46.startDate){
return;
}
if(this.checkPosParentTaskInTree(_47)){
return;
}
}
this.sortTasksByStartTime(_46);
}
for(var i=0;i<this.project.length;i++){
var _46=this.project[i];
var _48=new _3(this,_46);
if(this.arrProjects.length>0){
var _49=this.arrProjects[this.arrProjects.length-1];
_48.previousProject=_49;
_49.nextProject=_48;
}
_48.create();
this.checkHeighPanelTasks();
this.arrProjects.push(_48);
this.createTasks(_48);
}
this.resource&&this.resource.reConstruct();
this.postLoadData();
this.postBindEvents();
},loadJSONData:function(_4a){
var _4b=this;
_4b.dataFilePath=_4a||_4b.dataFilePath;
_b.get(_4b.dataFilePath,{sync:true}).then(function(_4c){
_4b.loadJSONString(_4c.text);
_4b.buildUIContent();
},function(err){
});
},loadJSONString:function(_4d){
if(!_4d){
return;
}
this.clearAll();
var _4e=_14.parse(_4d);
var _4f=_4e.items;
_8.forEach(_4f,function(_50){
var _51=_50.startdate.split("-");
var _52=new _1({id:_50.id,name:_50.name,startDate:new Date(_51[0],(parseInt(_51[1])-1),_51[2])});
var _53=_50.tasks;
_8.forEach(_53,function(_54){
var id=_54.id,_55=_54.name,_56=_54.starttime.split("-"),_57=_54.duration,_58=_54.percentage,_59=_54.previousTaskId,_5a=_54.taskOwner;
var _5b=new GanttTaskItem({id:id,name:_55,startTime:new Date(_56[0],(parseInt(_56[1])-1),_56[2]),duration:_57,percentage:_58,previousTaskId:_59,taskOwner:_5a});
var _5c=_54.children;
if(_5c.length!=0){
this.buildChildTasksData(_5b,_5c);
}
_52.addTask(_5b);
},this);
this.addProject(_52);
},this);
},buildChildTasksData:function(_5d,_5e){
_5e&&_8.forEach(_5e,function(_5f){
var id=_5f.id,_60=_5f.name,_61=_5f.starttime.split("-"),_62=_5f.duration,_63=_5f.percentage,_64=_5f.previousTaskId,_65=_5f.taskOwner;
var _66=new GanttTaskItem({id:id,name:_60,startTime:new Date(_61[0],(parseInt(_61[1])-1),_61[2]),duration:_62,percentage:_63,previousTaskId:_64,taskOwner:_65});
_66.parentTask=_5d;
_5d.addChildTask(_66);
var _67=_5f.children;
if(_67.length!=0){
this.buildChildTasksData(_66,_67);
}
},this);
},getJSONData:function(){
var _68={identifier:"id",items:[]};
_8.forEach(this.project,function(_69){
var _6a={id:_69.id,name:_69.name,startdate:_69.startDate.getFullYear()+"-"+(_69.startDate.getMonth()+1)+"-"+_69.startDate.getDate(),tasks:[]};
_68.items.push(_6a);
_8.forEach(_69.parentTasks,function(_6b){
var _6c={id:_6b.id,name:_6b.name,starttime:_6b.startTime.getFullYear()+"-"+(_6b.startTime.getMonth()+1)+"-"+_6b.startTime.getDate(),duration:_6b.duration,percentage:_6b.percentage,previousTaskId:(_6b.previousTaskId||""),taskOwner:(_6b.taskOwner||""),children:this.getChildTasksData(_6b.cldTasks)};
_6a.tasks.push(_6c);
},this);
},this);
return _68;
},getChildTasksData:function(_6d){
var _6e=[];
_6d&&_6d.length>0&&_8.forEach(_6d,function(_6f){
var _70={id:_6f.id,name:_6f.name,starttime:_6f.startTime.getFullYear()+"-"+(_6f.startTime.getMonth()+1)+"-"+_6f.startTime.getDate(),duration:_6f.duration,percentage:_6f.percentage,previousTaskId:(_6f.previousTaskId||""),taskOwner:(_6f.taskOwner||""),children:this.getChildTasksData(_6f.cldTasks)};
_6e.push(_70);
},this);
return _6e;
},saveJSONData:function(_71){
var _72=this;
_72.dataFilePath=(_71&&_9.trim(_71).length>0)?_71:this.dataFilePath;
try{
_b.post(_72.saveProgramPath,{query:{filename:_72.dataFilePath,data:_14.stringify(_72.getJSONData())}}).response.then(function(_73){
if((_c.checkStatus(_73.options.status))||(_73.options.status==405)){
}else{
}
});
}
catch(e){
}
},sortTaskStartTime:function(a,b){
return a.startTime<b.startTime?-1:(a.startTime>b.startTime?1:0);
},sortProjStartDate:function(a,b){
return a.startDate<b.startDate?-1:(a.startDate>b.startDate?1:0);
},setStartTimeChild:function(_74){
_8.forEach(_74.cldTasks,function(_75){
if(!_75.startTime){
_75.startTime=_74.startTime;
}
if(_75.cldTasks.length!=0){
this.setStartTimeChild(_75);
}
},this);
},createPanelTasks:function(){
var _76=_f.create("div",{className:"ganttTaskPanel"});
_10.set(_76,{height:(this.contentHeight-this.panelTimeHeight-this.scrollBarWidth)+"px"});
return _76;
},refreshParams:function(_77){
this.pixelsPerDay=_77;
this.pixelsPerWorkHour=this.pixelsPerDay/this.hsPerDay;
this.pixelsPerHour=this.pixelsPerDay/24;
},createPanelNamesTasksHeader:function(){
var _78=_f.create("div",{className:"ganttPanelHeader"});
var _79=_f.create("table",{cellPadding:"0px",border:"0px",cellSpacing:"0px",bgColor:"#FFFFFF",className:"ganttToolbar"},_78);
var _7a=_79.insertRow(_79.rows.length);
var _7b=_79.insertRow(_79.rows.length);
var _7c=_79.insertRow(_79.rows.length);
var _7d=_79.insertRow(_79.rows.length);
var _7e=_f.create("td",{align:"center",vAlign:"middle",className:"ganttToolbarZoomIn"},_7a);
var _7f=_9.hitch(this,function(){
if(this.scale*2>5){
return;
}
this.scale=this.scale*2;
this.switchTeleMicroView(this.pixelsPerDay*this.scale);
});
if(this.zoomInClickEvent){
this.zoomInClickEvent.remove();
}
this.zoomInClickEvent=on(_7e,"click",_9.hitch(this,_7f));
if(this.zoomInKeyEvent){
this.zoomInKeyEvent.remove();
}
this.zoomInKeyEvent=on(_7e,"keydown",_9.hitch(this,function(e){
if(e.keyCode!=_13.ENTER){
return;
}
_7f();
}));
_11.set(_7e,"tabIndex",0);
var _80=_f.create("td",{align:"center",vAlign:"middle",className:"ganttToolbarZoomOut"},_7a);
var _81=_9.hitch(this,function(){
if(this.scale*0.5<0.2){
return;
}
this.scale=this.scale*0.5;
this.switchTeleMicroView(this.pixelsPerDay*this.scale);
});
if(this.zoomOutClickEvent){
this.zoomOutClickEvent.remove();
}
this.zoomOutClickEvent=on(_80,"click",_9.hitch(this,_81));
if(this.zoomOutKeyEvent){
this.zoomOutKeyEvent.remove();
}
this.zoomOutKeyEvent=on(_80,"keydown",_9.hitch(this,function(e){
if(e.keyCode!=_13.ENTER){
return;
}
_81();
}));
_11.set(_80,"tabIndex",0);
var _82=_f.create("td",{align:"center",vAlign:"middle",className:"ganttToolbarMicro"},_7b);
if(this.microClickEvent){
this.microClickEvent.remove();
}
this.microClickEvent=on(_82,"click",_9.hitch(this,this.refresh,this.animation?15:1,0,2));
if(this.microKeyEvent){
this.microKeyEvent.remove();
}
this.microKeyEvent=on(_82,"keydown",_9.hitch(this,function(e){
if(e.keyCode!=_13.ENTER){
return;
}
_82.blur();
this.refresh(this.animation?15:1,0,2);
}));
_11.set(_82,"tabIndex",0);
var _83=_f.create("td",{align:"center",vAlign:"middle",className:"ganttToolbarTele"},_7b);
if(this.teleClickEvent){
this.teleClickEvent.remove();
}
this.teleClickEvent=on(_83,"click",_9.hitch(this,this.refresh,this.animation?15:1,0,0.5));
if(this.teleKeyEvent){
this.teleKeyEvent.remove();
}
this.teleKeyEvent=on(_83,"keydown",_9.hitch(this,function(e){
if(e.keyCode!=_13.ENTER){
return;
}
_83.blur();
this.refresh(this.animation?15:1,0,0.5);
}));
_11.set(_83,"tabIndex",0);
var _84=_f.create("td",{align:"center",vAlign:"middle",className:"ganttToolbarSave"},_7c);
if(this.saveClickEvent){
this.saveClickEvent.remove();
}
this.saveClickEvent=on(_84,"click",_9.hitch(this,this.saveJSONData,""));
if(this.saveKeyEvent){
this.saveKeyEvent.remove();
}
this.saveKeyEvent=on(_84,"keydown",_9.hitch(this,function(e){
if(e.keyCode!=_13.ENTER){
return;
}
this.saveJSONData("");
}));
_11.set(_84,"tabIndex",0);
var _85=_f.create("td",{align:"center",vAlign:"middle",className:"ganttToolbarLoad"},_7c);
if(this.loadClickEvent){
this.loadClickEvent.remove();
}
this.loadClickEvent=on(_85,"click",_9.hitch(this,this.loadJSONData,""));
if(this.loadKeyEvent){
this.loadKeyEvent.remove();
}
this.loadKeyEvent=on(_85,"keydown",_9.hitch(this,function(e){
if(e.keyCode!=_13.ENTER){
return;
}
this.loadJSONData("");
}));
_11.set(_85,"tabIndex",0);
var _86=[_7e,_80,_82,_83,_84,_85],_87=["Enlarge timeline","Shrink timeline","Zoom in time zone(microscope view)","Zoom out time zone(telescope view)","Save gantt data to json file","Load gantt data from json file"];
_8.forEach(_86,function(_88,i){
var _89=_87[i];
var _8a=function(){
_e.add(_88,"ganttToolbarActionHover");
dijit.showTooltip(_89,_88,["above","below"]);
};
_88.onmouseover=_8a;
_88.onfocus=_8a;
var _8b=function(){
_e.remove(_88,"ganttToolbarActionHover");
_88&&dijit.hideTooltip(_88);
};
_88.onmouseout=_8b;
_88.onblur=_8b;
},this);
return _78;
},createPanelNamesTasks:function(){
var _8c=_f.create("div",{innerHTML:"&nbsp;",className:"ganttPanelNames"});
_10.set(_8c,{height:(this.contentHeight-this.panelTimeHeight-this.scrollBarWidth)+"px",width:this.maxWidthPanelNames+"px"});
return _8c;
},createPanelTime:function(){
var _8d=_f.create("div",{className:"ganttPanelTime"});
var _8e=_f.create("table",{cellPadding:"0px",border:"0px",cellSpacing:"0px",bgColor:"#FFFFFF",className:"ganttTblTime"},_8d);
this.totalDays=this.countDays;
var _8f=_8e.insertRow(_8e.rows.length),_90,_91,_92=0;
_91=_90=new Date(this.startDate).getFullYear();
for(var i=0;i<this.countDays;i++,_92++){
var _93=new Date(this.startDate);
_93.setDate(_93.getDate()+i);
_91=_93.getFullYear();
if(_91!=_90){
this.addYearInPanelTime(_8f,_92,_90);
_92=0;
_90=_91;
}
}
this.addYearInPanelTime(_8f,_92,_91);
_10.set(_8f,"display","none");
var _94=_8e.insertRow(_8e.rows.length),_95,_96,_97=0,_98=1970;
_96=_95=new Date(this.startDate).getMonth();
for(var i=0;i<this.countDays;i++,_97++){
var _93=new Date(this.startDate);
_93.setDate(_93.getDate()+i);
_96=_93.getMonth();
_98=_93.getFullYear();
if(_96!=_95){
this.addMonthInPanelTime(_94,_97,_95,_98);
_97=0;
_95=_96;
}
}
this.addMonthInPanelTime(_94,_97,_96,_98);
var _99=_8e.insertRow(_8e.rows.length),_9a,_9b,_97=0;
_9b=_9a=_a._getWeekOfYear(new Date(this.startDate));
for(var i=0;i<this.countDays;i++,_97++){
var _93=new Date(this.startDate);
_93.setDate(_93.getDate()+i);
_9b=_a._getWeekOfYear(_93);
if(_9b!=_9a){
this.addWeekInPanelTime(_99,_97,_9a);
_97=0;
_9a=_9b;
}
}
this.addWeekInPanelTime(_99,_97,_9b);
var _9c=_8e.insertRow(_8e.rows.length);
for(var i=0;i<this.countDays;i++){
this.addDayInPanelTime(_9c);
}
var _9d=_8e.insertRow(_8e.rows.length);
for(var i=0;i<this.countDays;i++){
this.addHourInPanelTime(_9d);
}
_10.set(_9d,"display","none");
return _8d;
},adjustPanelTime:function(_9e){
var _9f=_8.map(this.arrProjects,function(_a0){
return (parseInt(_a0.projectItem[0].style.left)+parseInt(_a0.projectItem[0].firstChild.style.width)+_a0.descrProject.offsetWidth+this.panelTimeExpandDelta);
},this).sort(function(a,b){
return b-a;
})[0];
if(this.maxTaskEndPos!=_9f){
var _a1=this.panelTime.firstChild.firstChild.rows;
for(var i=0;i<=4;i++){
this.removeCell(_a1[i]);
}
var _a2=Math.round((_9f+this.panelTimeExpandDelta)/this.pixelsPerDay);
this.totalDays=_a2;
var _a3,_a4,_a5=0;
_a4=_a3=new Date(this.startDate).getFullYear();
for(var i=0;i<_a2;i++,_a5++){
var _a6=new Date(this.startDate);
_a6.setDate(_a6.getDate()+i);
_a4=_a6.getFullYear();
if(_a4!=_a3){
this.addYearInPanelTime(_a1[0],_a5,_a3);
_a5=0;
_a3=_a4;
}
}
this.addYearInPanelTime(_a1[0],_a5,_a4);
var _a7,_a8,_a9=0,_aa=1970;
_a8=_a7=new Date(this.startDate).getMonth();
for(var i=0;i<_a2;i++,_a9++){
var _a6=new Date(this.startDate);
_a6.setDate(_a6.getDate()+i);
_a8=_a6.getMonth();
_aa=_a6.getFullYear();
if(_a8!=_a7){
this.addMonthInPanelTime(_a1[1],_a9,_a7,_aa);
_a9=0;
_a7=_a8;
}
}
this.addMonthInPanelTime(_a1[1],_a9,_a8,_aa);
var _ab,_ac,_a9=0;
_ac=_ab=_a._getWeekOfYear(new Date(this.startDate));
for(var i=0;i<_a2;i++,_a9++){
var _a6=new Date(this.startDate);
_a6.setDate(_a6.getDate()+i);
_ac=_a._getWeekOfYear(_a6);
if(_ac!=_ab){
this.addWeekInPanelTime(_a1[2],_a9,_ab);
_a9=0;
_ab=_ac;
}
}
this.addWeekInPanelTime(_a1[2],_a9,_ac);
for(var i=0;i<_a2;i++){
this.addDayInPanelTime(_a1[3]);
}
for(var i=0;i<_a2;i++){
this.addHourInPanelTime(_a1[4]);
}
this.panelTime.firstChild.firstChild.style.width=this.pixelsPerDay*(_a1[3].cells.length)+"px";
this.contentData.firstChild.style.width=this.pixelsPerDay*(_a1[3].cells.length)+"px";
this.maxTaskEndPos=_9f;
}
},addYearInPanelTime:function(row,_ad,_ae){
var _af="Year   "+_ae;
var _b0=_f.create("td",{colSpan:_ad,align:"center",vAlign:"middle",className:"ganttYearNumber",innerHTML:this.pixelsPerDay*_ad>20?_af:"",innerHTMLData:_af},row);
_10.set(_b0,"width",(this.pixelsPerDay*_ad)+"px");
},addMonthInPanelTime:function(row,_b1,_b2,_b3){
var _b4=this.months[_b2]+(_b3?" of "+_b3:"");
var _b5=_f.create("td",{colSpan:_b1,align:"center",vAlign:"middle",className:"ganttMonthNumber",innerHTML:this.pixelsPerDay*_b1>30?_b4:"",innerHTMLData:_b4},row);
_10.set(_b5,"width",(this.pixelsPerDay*_b1)+"px");
},addWeekInPanelTime:function(row,_b6,_b7){
var _b8="Week   "+_b7;
var _b9=_f.create("td",{colSpan:_b6,align:"center",vAlign:"middle",className:"ganttWeekNumber",innerHTML:this.pixelsPerDay*_b6>20?_b8:"",innerHTMLData:_b8},row);
_10.set(_b9,"width",(this.pixelsPerDay*_b6)+"px");
},addDayInPanelTime:function(row){
var _ba=new Date(this.startDate);
_ba.setDate(_ba.getDate()+parseInt(row.cells.length));
var _bb=_f.create("td",{align:"center",vAlign:"middle",className:"ganttDayNumber",innerHTML:this.pixelsPerDay>20?_ba.getDate():"",innerHTMLData:String(_ba.getDate()),data:row.cells.length},row);
_10.set(_bb,"width",this.pixelsPerDay+"px");
(_ba.getDay()>=5)&&_e.add(_bb,"ganttDayNumberWeekend");
this._events.push(on(_bb,"mouseover",_9.hitch(this,function(_bc){
var _bd=_bc.target||_bc.srcElement;
var _be=new Date(this.startDate.getTime());
_be.setDate(_be.getDate()+parseInt(_11.get(_bd,"data")));
dijit.showTooltip(_be.getFullYear()+"."+(_be.getMonth()+1)+"."+_be.getDate(),_bb,["above","below"]);
})));
this._events.push(on(_bb,"mouseout",_9.hitch(this,function(_bf){
var _c0=_bf.target||_bf.srcElement;
_c0&&dijit.hideTooltip(_c0);
})));
},addHourInPanelTime:function(row){
var _c1=_f.create("td",{align:"center",vAlign:"middle",className:"ganttHourNumber",data:row.cells.length},row);
_10.set(_c1,"width",this.pixelsPerDay+"px");
var _c2=_f.create("table",{cellPadding:"0",cellSpacing:"0"},_c1);
var _c3=_c2.insertRow(_c2.rows.length);
for(var i=0;i<this.hsPerDay;i++){
var _c4=_f.create("td",{className:"ganttHourClass"},_c3);
_10.set(_c4,"width",(this.pixelsPerDay/this.hsPerDay)+"px");
_11.set(_c4,"innerHTMLData",String(9+i));
if(this.pixelsPerDay/this.hsPerDay>5){
_11.set(_c4,"innerHTML",String(9+i));
}
_e.add(_c4,i<=3?"ganttHourNumberAM":"ganttHourNumberPM");
}
},incHeightPanelTasks:function(_c5){
var _c6=this.contentData.firstChild;
_c6.style.height=parseInt(_c6.style.height)+_c5+"px";
},incHeightPanelNames:function(_c7){
var _c8=this.panelNames.firstChild;
_c8.style.height=parseInt(_c8.style.height)+_c7+"px";
},checkPosition:function(){
_8.forEach(this.arrProjects,function(_c9){
_8.forEach(_c9.arrTasks,function(_ca){
_ca.checkPosition();
},this);
},this);
},checkHeighPanelTasks:function(){
this.contentDataHeight+=this.heightTaskItemExtra+this.heightTaskItem;
if((parseInt(this.contentData.firstChild.style.height)<=this.contentDataHeight)){
this.incHeightPanelTasks(this.heightTaskItem+this.heightTaskItemExtra);
this.incHeightPanelNames(this.heightTaskItem+this.heightTaskItemExtra);
}
},sortTasksByStartTime:function(_cb){
_cb.parentTasks.sort(this.sortTaskStartTime);
for(var i=0;i<_cb.parentTasks.length;i++){
_cb.parentTasks[i]=this.sortChildTasks(_cb.parentTasks[i]);
}
},sortChildTasks:function(_cc){
_cc.cldTasks.sort(this.sortTaskStartTime);
for(var i=0;i<_cc.cldTasks.length;i++){
if(_cc.cldTasks[i].cldTasks.length>0){
this.sortChildTasks(_cc.cldTasks[i]);
}
}
return _cc;
},refresh:function(_cd,_ce,_cf){
if(this.arrProjects.length<=0){
return;
}
if(this.arrProjects[0].arrTasks.length<=0){
return;
}
if(!_cd||_ce>_cd){
this.refreshController();
if(this.resource){
this.resource.refresh();
}
this.tempDayInPixels=0;
this.panelNameHeadersCover&&_10.set(this.panelNameHeadersCover,"display","none");
return;
}
if(this.tempDayInPixels==0){
this.tempDayInPixels=this.pixelsPerDay;
}
this.panelNameHeadersCover&&_10.set(this.panelNameHeadersCover,"display","");
var dip=this.tempDayInPixels+this.tempDayInPixels*(_cf-1)*Math.pow((_ce/_cd),2);
this.refreshParams(dip);
_8.forEach(this.arrProjects,function(_d0){
_8.forEach(_d0.arrTasks,function(_d1){
_d1.refresh();
},this);
_d0.refresh();
},this);
setTimeout(_9.hitch(this,function(){
this.refresh(_cd,++_ce,_cf);
}),15);
},switchTeleMicroView:function(dip){
var _d2=this.panelTime.firstChild.firstChild;
for(var i=0;i<5;i++){
if(dip>40){
_10.set(_d2.rows[i],"display",(i==0||i==1)?"none":"");
}else{
if(dip<20){
_10.set(_d2.rows[i],"display",(i==2||i==4)?"none":"");
}else{
_10.set(_d2.rows[i],"display",(i==0||i==4)?"none":"");
}
}
}
},refreshController:function(){
this.contentData.firstChild.style.width=Math.max(1200,this.pixelsPerDay*this.totalDays)+"px";
this.panelTime.firstChild.style.width=this.pixelsPerDay*this.totalDays+"px";
this.panelTime.firstChild.firstChild.style.width=this.pixelsPerDay*this.totalDays+"px";
this.switchTeleMicroView(this.pixelsPerDay);
_8.forEach(this.panelTime.firstChild.firstChild.rows,function(row){
_8.forEach(row.childNodes,function(td){
var cs=parseInt(_11.get(td,"colSpan")||1);
var _d3=_9.trim(_11.get(td,"innerHTMLData")||"");
if(_d3.length>0){
_11.set(td,"innerHTML",this.pixelsPerDay*cs<20?"":_d3);
}else{
_8.forEach(td.firstChild.rows[0].childNodes,function(td){
var _d4=_9.trim(_11.get(td,"innerHTMLData")||"");
_11.set(td,"innerHTML",this.pixelsPerDay/this.hsPerDay>10?_d4:"");
},this);
}
if(cs==1){
_10.set(td,"width",(this.pixelsPerDay*cs)+"px");
if(_d3.length<=0){
_8.forEach(td.firstChild.rows[0].childNodes,function(td){
_10.set(td,"width",(this.pixelsPerDay*cs/this.hsPerDay)+"px");
},this);
}
}
},this);
},this);
},init:function(){
this.startDate=this.getStartDate();
_10.set(this.content,{width:this.contentWidth+"px",height:this.contentHeight+"px"});
this.tableControl=_f.create("table",{cellPadding:"0",cellSpacing:"0",className:"ganttTabelControl"});
var _d5=this.tableControl.insertRow(this.tableControl.rows.length);
this.content.appendChild(this.tableControl);
this.countDays=this.getCountDays();
this.panelTime=_f.create("div",{className:"ganttPanelTimeContainer"});
_10.set(this.panelTime,"height",this.panelTimeHeight+"px");
this.panelTime.appendChild(this.createPanelTime());
this.contentData=_f.create("div",{className:"ganttContentDataContainer"});
_10.set(this.contentData,"height",(this.contentHeight-this.panelTimeHeight)+"px");
this.contentData.appendChild(this.createPanelTasks());
var _d6=_f.create("td",{vAlign:"top"});
this.panelNameHeaders=_f.create("div",{className:"ganttPanelNameHeaders"},_d6);
_10.set(this.panelNameHeaders,{height:this.panelTimeHeight+"px",width:this.maxWidthPanelNames+"px"});
this.panelNameHeaders.appendChild(this.createPanelNamesTasksHeader());
this.panelNames=_f.create("div",{className:"ganttPanelNamesContainer"},_d6);
this.panelNames.appendChild(this.createPanelNamesTasks());
_d5.appendChild(_d6);
_d6=_f.create("td",{vAlign:"top"});
var _d7=_f.create("div",{className:"ganttDivCell"});
_d7.appendChild(this.panelTime);
_d7.appendChild(this.contentData);
_d6.appendChild(_d7);
_d5.appendChild(_d6);
_10.set(this.panelNames,"height",(this.contentHeight-this.panelTimeHeight-this.scrollBarWidth)+"px");
_10.set(this.panelNames,"width",this.maxWidthPanelNames+"px");
_10.set(this.contentData,"width",(this.contentWidth-this.maxWidthPanelNames)+"px");
_10.set(this.contentData.firstChild,"width",this.pixelsPerDay*this.countDays+"px");
_10.set(this.panelTime,"width",(this.contentWidth-this.maxWidthPanelNames-this.scrollBarWidth)+"px");
_10.set(this.panelTime.firstChild,"width",this.pixelsPerDay*this.countDays+"px");
if(this.isShowConMenu){
this.tabMenu=new _5(this);
}
var _d8=this;
this.contentData.onscroll=function(){
_d8.panelTime.scrollLeft=this.scrollLeft;
if(_d8.panelNames){
_d8.panelNames.scrollTop=this.scrollTop;
if(_d8.isShowConMenu){
_d8.tabMenu.hide();
}
}
if(_d8.resource){
_d8.resource.contentData.scrollLeft=this.scrollLeft;
}
};
this.project.sort(this.sortProjStartDate);
for(var i=0;i<this.project.length;i++){
var _d9=this.project[i];
for(var k=0;k<_d9.parentTasks.length;k++){
var _da=_d9.parentTasks[k];
if(!_da.startTime){
_da.startTime=_d9.startDate;
}
this.setStartTimeChild(_da);
if(this.setPreviousTask(_d9)){
return;
}
}
for(var k=0;k<_d9.parentTasks.length;k++){
var _da=_d9.parentTasks[k];
if(_da.startTime<_d9.startDate){
if(!this.correctError){
return;
}else{
_da.startTime=_d9.startDate;
}
}
if(this.checkPosParentTaskInTree(_da)){
return;
}
}
this.sortTasksByStartTime(_d9);
}
for(var i=0;i<this.project.length;i++){
var _d9=this.project[i];
var _db=new _3(this,_d9);
if(this.arrProjects.length>0){
var _dc=this.arrProjects[this.arrProjects.length-1];
_db.previousProject=_dc;
_dc.nextProject=_db;
}
_db.create();
this.checkHeighPanelTasks();
this.arrProjects.push(_db);
this.createTasks(_db);
}
if(this.withResource){
this.resource=new _2(this);
this.resource.create();
}
this.postLoadData();
this.postBindEvents();
return this;
},postLoadData:function(){
_8.forEach(this.arrProjects,function(_dd){
_8.forEach(_dd.arrTasks,function(_de){
_de.postLoadData();
},this);
_dd.postLoadData();
},this);
var _df=_12.getMarginBox(this.panelNameHeaders);
if(!this.panelNameHeadersCover){
this.panelNameHeadersCover=_f.create("div",{className:"ganttHeaderCover"},this.panelNameHeaders.parentNode);
_10.set(this.panelNameHeadersCover,{left:_df.l+"px",top:_df.t+"px",height:_df.h+"px",width:_df.w+"px",display:"none"});
}
},postBindEvents:function(){
var pos=_12.position(this.tableControl,true);
has("dom-addeventlistener")&&this._events.push(on(this.tableControl,"mousemove",_9.hitch(this,function(_e0){
var _e1=_e0.srcElement||_e0.target;
if(_e1==this.panelNames.firstChild||_e1==this.contentData.firstChild){
var _e2=this.heightTaskItem+this.heightTaskItemExtra;
var _e3=parseInt(_e0.layerY/_e2)*_e2+this.panelTimeHeight-this.contentData.scrollTop;
if(_e3!=this.oldHLTop&&_e3<(pos.h-50)){
if(this.highLightDiv){
_10.set(this.highLightDiv,"top",(pos.y+_e3)+"px");
}else{
this.highLightDiv=_f.create("div",{className:"ganttRowHighlight"},win.body());
_10.set(this.highLightDiv,{top:(pos.y+_e3)+"px",left:pos.x+"px",width:(pos.w-20)+"px",height:_e2+"px"});
}
}
this.oldHLTop=_e3;
}
})));
},getStartDate:function(){
_8.forEach(this.project,function(_e4){
if(this.startDate){
if(_e4.startDate<this.startDate){
this.startDate=new Date(_e4.startDate);
}
}else{
this.startDate=new Date(_e4.startDate);
}
},this);
this.initialPos=24*this.pixelsPerHour;
return this.startDate?new Date(this.startDate.setHours(this.startDate.getHours()-24)):new Date();
},getCountDays:function(){
return parseInt((this.contentWidth-this.maxWidthPanelNames)/(this.pixelsPerHour*24));
},createTasks:function(_e5){
_8.forEach(_e5.project.parentTasks,function(_e6,i){
if(i>0){
_e5.project.parentTasks[i-1].nextParentTask=_e6;
_e6.previousParentTask=_e5.project.parentTasks[i-1];
}
var _e7=new _4(_e6,_e5,this);
_e5.arrTasks.push(_e7);
_e7.create();
this.checkHeighPanelTasks();
if(_e6.cldTasks.length>0){
this.createChildItemControls(_e6.cldTasks,_e5);
}
},this);
},createChildItemControls:function(_e8,_e9){
_e8&&_8.forEach(_e8,function(_ea,i){
if(i>0){
_ea.previousChildTask=_e8[i-1];
_e8[i-1].nextChildTask=_ea;
}
var _eb=new _4(_ea,_e9,this);
_eb.create();
this.checkHeighPanelTasks();
if(_ea.cldTasks.length>0){
this.createChildItemControls(_ea.cldTasks,_e9);
}
},this);
},getPosOnDate:function(_ec){
return (_ec-this.startDate)/(60*60*1000)*this.pixelsPerHour;
},getWidthOnDuration:function(_ed){
return Math.round(this.pixelsPerWorkHour*_ed);
},getLastChildTask:function(_ee){
return _ee.childTask.length>0?this.getLastChildTask(_ee.childTask[_ee.childTask.length-1]):_ee;
},removeCell:function(row){
while(row.cells[0]){
row.deleteCell(row.cells[0]);
}
}});
});

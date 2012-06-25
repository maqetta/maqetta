//>>built
require({cache:{"url:dijit/templates/TreeNode.html":"<div class=\"dijitTreeNode\" role=\"presentation\"\n\t><div data-dojo-attach-point=\"rowNode\" class=\"dijitTreeRow dijitInline\" role=\"presentation\"\n\t\t><div data-dojo-attach-point=\"indentNode\" class=\"dijitInline\"></div\n\t\t><img src=\"${_blankGif}\" alt=\"\" data-dojo-attach-point=\"expandoNode\" class=\"dijitTreeExpando\" role=\"presentation\"\n\t\t/><span data-dojo-attach-point=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"\n\t\t></span\n\t\t><span data-dojo-attach-point=\"contentNode\"\n\t\t\tclass=\"dijitTreeContent\" role=\"presentation\">\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" data-dojo-attach-point=\"iconNode\" class=\"dijitIcon dijitTreeIcon\" role=\"presentation\"\n\t\t\t/><span data-dojo-attach-point=\"labelNode\" class=\"dijitTreeLabel\" role=\"treeitem\" tabindex=\"-1\" aria-selected=\"false\"></span>\n\t\t</span\n\t></div>\n\t<div data-dojo-attach-point=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\n</div>\n","url:dijit/templates/Tree.html":"<div class=\"dijitTree dijitTreeContainer\" role=\"tree\">\n\t<div class=\"dijitInline dijitTreeIndent\" style=\"position: absolute; top: -9999px\" data-dojo-attach-point=\"indentDetector\"></div>\n</div>\n"}});
define("dijit/Tree",["dojo/_base/array","dojo/_base/connect","dojo/cookie","dojo/_base/declare","dojo/_base/Deferred","dojo/DeferredList","dojo/dom","dojo/dom-class","dojo/dom-geometry","dojo/dom-style","dojo/_base/event","dojo/fx","dojo/_base/kernel","dojo/keys","dojo/_base/lang","dojo/on","dojo/topic","dojo/touch","dojo/when","./focus","./registry","./_base/manager","./_Widget","./_TemplatedMixin","./_Container","./_Contained","./_CssStateMixin","dojo/text!./templates/TreeNode.html","dojo/text!./templates/Tree.html","./tree/TreeStoreModel","./tree/ForestStoreModel","./tree/_dndSelector"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f,on,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19,_1a,_1b,_1c,_1d,_1e,_1f){
var _20=_4("dijit._TreeNode",[_16,_17,_18,_19,_1a],{item:null,isTreeNode:true,label:"",_setLabelAttr:{node:"labelNode",type:"innerText"},isExpandable:null,isExpanded:false,state:"UNCHECKED",templateString:_1b,baseClass:"dijitTreeNode",cssStateNodes:{rowNode:"dijitTreeRow"},_setTooltipAttr:{node:"rowNode",type:"attribute",attribute:"title"},buildRendering:function(){
this.inherited(arguments);
this._setExpando();
this._updateItemClasses(this.item);
if(this.isExpandable){
this.labelNode.setAttribute("aria-expanded",this.isExpanded);
}
this.setSelected(false);
},_setIndentAttr:function(_21){
var _22=(Math.max(_21,0)*this.tree._nodePixelIndent)+"px";
_a.set(this.domNode,"backgroundPosition",_22+" 0px");
_a.set(this.indentNode,this.isLeftToRight()?"paddingLeft":"paddingRight",_22);
_1.forEach(this.getChildren(),function(_23){
_23.set("indent",_21+1);
});
this._set("indent",_21);
},markProcessing:function(){
this.state="LOADING";
this._setExpando(true);
},unmarkProcessing:function(){
this._setExpando(false);
},_updateItemClasses:function(_24){
var _25=this.tree,_26=_25.model;
if(_25._v10Compat&&_24===_26.root){
_24=null;
}
this._applyClassAndStyle(_24,"icon","Icon");
this._applyClassAndStyle(_24,"label","Label");
this._applyClassAndStyle(_24,"row","Row");
this.tree._startPaint(true);
},_applyClassAndStyle:function(_27,_28,_29){
var _2a="_"+_28+"Class";
var _2b=_28+"Node";
var _2c=this[_2a];
this[_2a]=this.tree["get"+_29+"Class"](_27,this.isExpanded);
_8.replace(this[_2b],this[_2a]||"",_2c||"");
_a.set(this[_2b],this.tree["get"+_29+"Style"](_27,this.isExpanded)||{});
},_updateLayout:function(){
var _2d=this.getParent();
if(!_2d||!_2d.rowNode||_2d.rowNode.style.display=="none"){
_8.add(this.domNode,"dijitTreeIsRoot");
}else{
_8.toggle(this.domNode,"dijitTreeIsLast",!this.getNextSibling());
}
},_setExpando:function(_2e){
var _2f=["dijitTreeExpandoLoading","dijitTreeExpandoOpened","dijitTreeExpandoClosed","dijitTreeExpandoLeaf"],_30=["*","-","+","*"],idx=_2e?0:(this.isExpandable?(this.isExpanded?1:2):3);
_8.replace(this.expandoNode,_2f[idx],_2f);
this.expandoNodeText.innerHTML=_30[idx];
},expand:function(){
if(this._expandDeferred){
return this._expandDeferred;
}
if(this._collapseDeferred){
this._collapseDeferred.cancel();
delete this._collapseDeferred;
}
this.isExpanded=true;
this.labelNode.setAttribute("aria-expanded","true");
if(this.tree.showRoot||this!==this.tree.rootNode){
this.containerNode.setAttribute("role","group");
}
_8.add(this.contentNode,"dijitTreeContentExpanded");
this._setExpando();
this._updateItemClasses(this.item);
if(this==this.tree.rootNode&&this.tree.showRoot){
this.tree.domNode.setAttribute("aria-expanded","true");
}
var def,_31=_c.wipeIn({node:this.containerNode,duration:_15.defaultDuration,onEnd:function(){
def.resolve(true);
}});
def=(this._expandDeferred=new _5(function(){
_31.stop();
}));
_31.play();
return def;
},collapse:function(){
if(this._collapseDeferred){
return this._collapseDeferred;
}
if(this._expandDeferred){
this._expandDeferred.cancel();
delete this._expandDeferred;
}
this.isExpanded=false;
this.labelNode.setAttribute("aria-expanded","false");
if(this==this.tree.rootNode&&this.tree.showRoot){
this.tree.domNode.setAttribute("aria-expanded","false");
}
_8.remove(this.contentNode,"dijitTreeContentExpanded");
this._setExpando();
this._updateItemClasses(this.item);
var def,_32=_c.wipeOut({node:this.containerNode,duration:_15.defaultDuration,onEnd:function(){
def.resolve(true);
}});
def=(this._collapseDeferred=new _5(function(){
_32.stop();
}));
_32.play();
return def;
},indent:0,setChildItems:function(_33){
var _34=this.tree,_35=_34.model,_36=[];
var _37=this.getChildren();
_1.forEach(_37,function(_38){
_18.prototype.removeChild.call(this,_38);
},this);
this.defer(function(){
_1.forEach(_37,function(_39){
if(!_39._destroyed&&!_39.getParent()){
_34.dndController.removeTreeNode(_39);
var id=_35.getIdentity(_39.item),ary=_34._itemNodesMap[id];
if(ary.length==1){
delete _34._itemNodesMap[id];
}else{
var _3a=_1.indexOf(ary,_39);
if(_3a!=-1){
ary.splice(_3a,1);
}
}
_39.destroyRecursive();
}
});
});
this.state="LOADED";
if(_33&&_33.length>0){
this.isExpandable=true;
_1.forEach(_33,function(_3b){
var id=_35.getIdentity(_3b),_3c=_34._itemNodesMap[id],_3d;
if(_3c){
for(var i=0;i<_3c.length;i++){
if(_3c[i]&&!_3c[i].getParent()){
_3d=_3c[i];
_3d.set("indent",this.indent+1);
break;
}
}
}
if(!_3d){
_3d=this.tree._createTreeNode({item:_3b,tree:_34,isExpandable:_35.mayHaveChildren(_3b),label:_34.getLabel(_3b),tooltip:_34.getTooltip(_3b),ownerDocument:_34.ownerDocument,dir:_34.dir,lang:_34.lang,textDir:_34.textDir,indent:this.indent+1});
if(_3c){
_3c.push(_3d);
}else{
_34._itemNodesMap[id]=[_3d];
}
}
this.addChild(_3d);
if(this.tree.autoExpand||this.tree._state(_3d)){
_36.push(_34._expandNode(_3d));
}
},this);
_1.forEach(this.getChildren(),function(_3e){
_3e._updateLayout();
});
}else{
this.isExpandable=false;
}
if(this._setExpando){
this._setExpando(false);
}
this._updateItemClasses(this.item);
if(this==_34.rootNode){
var fc=this.tree.showRoot?this:this.getChildren()[0];
if(fc){
fc.setFocusable(true);
_34.lastFocused=fc;
}else{
_34.domNode.setAttribute("tabIndex","0");
}
}
var def=new _6(_36);
this.tree._startPaint(def);
return def;
},getTreePath:function(){
var _3f=this;
var _40=[];
while(_3f&&_3f!==this.tree.rootNode){
_40.unshift(_3f.item);
_3f=_3f.getParent();
}
_40.unshift(this.tree.rootNode.item);
return _40;
},getIdentity:function(){
return this.tree.model.getIdentity(this.item);
},removeChild:function(_41){
this.inherited(arguments);
var _42=this.getChildren();
if(_42.length==0){
this.isExpandable=false;
this.collapse();
}
_1.forEach(_42,function(_43){
_43._updateLayout();
});
},makeExpandable:function(){
this.isExpandable=true;
this._setExpando(false);
},setSelected:function(_44){
this.labelNode.setAttribute("aria-selected",_44?"true":"false");
_8.toggle(this.rowNode,"dijitTreeRowSelected",_44);
},setFocusable:function(_45){
this.labelNode.setAttribute("tabIndex",_45?"0":"-1");
},_setTextDirAttr:function(_46){
if(_46&&((this.textDir!=_46)||!this._created)){
this._set("textDir",_46);
this.applyTextDir(this.labelNode,this.labelNode.innerText||this.labelNode.textContent||"");
_1.forEach(this.getChildren(),function(_47){
_47.set("textDir",_46);
},this);
}
}});
var _48=_4("dijit.Tree",[_16,_17],{store:null,model:null,query:null,label:"",showRoot:true,childrenAttr:["children"],paths:[],path:[],selectedItems:null,selectedItem:null,openOnClick:false,openOnDblClick:false,templateString:_1c,persist:true,autoExpand:false,dndController:_1f,dndParams:["onDndDrop","itemCreator","onDndCancel","checkAcceptance","checkItemAcceptance","dragThreshold","betweenThreshold"],onDndDrop:null,itemCreator:null,onDndCancel:null,checkAcceptance:null,checkItemAcceptance:null,dragThreshold:5,betweenThreshold:0,_nodePixelIndent:19,_publish:function(_49,_4a){
_10.publish(this.id,_f.mixin({tree:this,event:_49},_4a||{}));
},postMixInProperties:function(){
this.tree=this;
if(this.autoExpand){
this.persist=false;
}
this._itemNodesMap={};
if(!this.cookieName&&this.id){
this.cookieName=this.id+"SaveStateCookie";
}
this.onLoadDeferred=new _5();
this.inherited(arguments);
},postCreate:function(){
this._initState();
var _4b=this;
this.own(on(this.domNode,on.selector(".dijitTreeNode",_11.enter),function(evt){
_4b._onNodeMouseEnter(_14.byNode(this),evt);
}),on(this.domNode,on.selector(".dijitTreeNode",_11.leave),function(evt){
_4b._onNodeMouseLeave(_14.byNode(this),evt);
}),on(this.domNode,on.selector(".dijitTreeNode","click"),function(evt){
_4b._onClick(_14.byNode(this),evt);
}),on(this.domNode,on.selector(".dijitTreeNode","dblclick"),function(evt){
_4b._onDblClick(_14.byNode(this),evt);
}),on(this.domNode,on.selector(".dijitTreeNode","keypress"),function(evt){
_4b._onKeyPress(_14.byNode(this),evt);
}),on(this.domNode,on.selector(".dijitTreeNode","keydown"),function(evt){
_4b._onKeyDown(_14.byNode(this),evt);
}),on(this.domNode,on.selector(".dijitTreeRow","focusin"),function(evt){
_4b._onNodeFocus(_14.getEnclosingWidget(this),evt);
}));
if(!this.model){
this._store2model();
}
this.connect(this.model,"onChange","_onItemChange");
this.connect(this.model,"onChildrenChange","_onItemChildrenChange");
this.connect(this.model,"onDelete","_onItemDelete");
this._load();
this.inherited(arguments);
if(this.dndController){
if(_f.isString(this.dndController)){
this.dndController=_f.getObject(this.dndController);
}
var _4c={};
for(var i=0;i<this.dndParams.length;i++){
if(this[this.dndParams[i]]){
_4c[this.dndParams[i]]=this[this.dndParams[i]];
}
}
this.dndController=new this.dndController(this,_4c);
}
},_store2model:function(){
this._v10Compat=true;
_d.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
var _4d={id:this.id+"_ForestStoreModel",store:this.store,query:this.query,childrenAttrs:this.childrenAttr};
if(this.params.mayHaveChildren){
_4d.mayHaveChildren=_f.hitch(this,"mayHaveChildren");
}
if(this.params.getItemChildren){
_4d.getChildren=_f.hitch(this,function(_4e,_4f,_50){
this.getItemChildren((this._v10Compat&&_4e===this.model.root)?null:_4e,_4f,_50);
});
}
this.model=new _1e(_4d);
this.showRoot=Boolean(this.label);
},onLoad:function(){
},_load:function(){
this.model.getRoot(_f.hitch(this,function(_51){
var rn=(this.rootNode=this.tree._createTreeNode({item:_51,tree:this,isExpandable:true,label:this.label||this.getLabel(_51),textDir:this.textDir,indent:this.showRoot?0:-1}));
if(!this.showRoot){
rn.rowNode.style.display="none";
this.domNode.setAttribute("role","presentation");
this.domNode.removeAttribute("aria-expanded");
this.domNode.removeAttribute("aria-multiselectable");
rn.labelNode.setAttribute("role","presentation");
rn.containerNode.setAttribute("role","tree");
rn.containerNode.setAttribute("aria-expanded","true");
}
this.domNode.appendChild(rn.domNode);
var _52=this.model.getIdentity(_51);
if(this._itemNodesMap[_52]){
this._itemNodesMap[_52].push(rn);
}else{
this._itemNodesMap[_52]=[rn];
}
rn._updateLayout();
this._expandNode(rn).then(_f.hitch(this,function(){
var _53=this._initialPaths||(this.persist&&this.dndController._getSavedPaths())||[];
this._loadCalled=true;
_12(this.set("paths",_53),_f.hitch(this,function(){
this.onLoadDeferred.resolve(true);
this.onLoad();
}));
}));
}),_f.hitch(this,function(err){
console.error(this,": error loading root: ",err);
}));
},getNodesByItem:function(_54){
if(!_54){
return [];
}
var _55=_f.isString(_54)?_54:this.model.getIdentity(_54);
return [].concat(this._itemNodesMap[_55]);
},_setSelectedItemAttr:function(_56){
this.set("selectedItems",[_56]);
},_setSelectedItemsAttr:function(_57){
var _58=this;
this.onLoadDeferred.then(_f.hitch(this,function(){
var _59=_1.map(_57,function(_5a){
return (!_5a||_f.isString(_5a))?_5a:_58.model.getIdentity(_5a);
});
var _5b=[];
_1.forEach(_59,function(id){
_5b=_5b.concat(_58._itemNodesMap[id]||[]);
});
this.set("selectedNodes",_5b);
}));
},_setPathAttr:function(_5c){
if(_5c.length){
return this.set("paths",[_5c]);
}else{
return this.set("paths",[]);
}
},_setPathsAttr:function(_5d){
if(!this._loadCalled){
if("paths" in this.params||"path" in this.params){
this._initialPaths=_5d;
}
return;
}
var _5e=this;
var dl=new _6(_1.map(_5d,function(_5f){
var d=new _5();
_5f=_1.map(_5f,function(_60){
return _f.isString(_60)?_60:_5e.model.getIdentity(_60);
});
if(_5f.length){
_61(_5f,[_5e.rootNode],d);
}else{
d.reject("Empty path");
}
return d;
}));
dl.then(_62);
return dl;
function _61(_63,_64,def){
var _65=_63.shift();
var _66=_1.filter(_64,function(_67){
return _67.getIdentity()==_65;
})[0];
if(!!_66){
if(_63.length){
_5e._expandNode(_66).then(function(){
_61(_63,_66.getChildren(),def);
});
}else{
def.resolve(_66);
}
}else{
def.reject("Could not expand path at "+_65);
}
};
function _62(_68){
_5e.set("selectedNodes",_1.map(_1.filter(_68,function(x){
return x[0];
}),function(x){
return x[1];
}));
};
},_setSelectedNodeAttr:function(_69){
this.set("selectedNodes",[_69]);
},_setSelectedNodesAttr:function(_6a){
this.dndController.setSelection(_6a);
},expandAll:function(){
var _6b=this;
function _6c(_6d){
var def=new dojo.Deferred();
_6b._expandNode(_6d).then(function(){
var _6e=_1.filter(_6d.getChildren()||[],function(_6f){
return _6f.isExpandable;
}),_70=_1.map(_6e,_6c);
new dojo.DeferredList(_70).then(function(){
def.resolve(true);
});
});
return def;
};
return _6c(this.rootNode);
},collapseAll:function(){
var _71=this;
function _72(_73){
var def=new dojo.Deferred();
def.label="collapseAllDeferred";
var _74=_1.filter(_73.getChildren()||[],function(_75){
return _75.isExpandable;
}),_76=_1.map(_74,_72);
new dojo.DeferredList(_76).then(function(){
if(!_73.isExpanded||(_73==_71.rootNode&&!_71.showRoot)){
def.resolve(true);
}else{
_71._collapseNode(_73).then(function(){
def.resolve(true);
});
}
});
return def;
};
return _72(this.rootNode);
},mayHaveChildren:function(){
},getItemChildren:function(){
},getLabel:function(_77){
return this.model.getLabel(_77);
},getIconClass:function(_78,_79){
return (!_78||this.model.mayHaveChildren(_78))?(_79?"dijitFolderOpened":"dijitFolderClosed"):"dijitLeaf";
},getLabelClass:function(){
},getRowClass:function(){
},getIconStyle:function(){
},getLabelStyle:function(){
},getRowStyle:function(){
},getTooltip:function(){
return "";
},_onKeyPress:function(_7a,e){
if(e.charCode<=32){
return;
}
if(!e.altKey&&!e.ctrlKey&&!e.shiftKey&&!e.metaKey){
var c=String.fromCharCode(e.charCode);
this._onLetterKeyNav({node:_7a,key:c.toLowerCase()});
_b.stop(e);
}
},_onKeyDown:function(_7b,e){
var key=e.keyCode;
var map=this._keyHandlerMap;
if(!map){
map={};
map[_e.ENTER]=map[_e.SPACE]=map[" "]="_onEnterKey";
map[this.isLeftToRight()?_e.LEFT_ARROW:_e.RIGHT_ARROW]="_onLeftArrow";
map[this.isLeftToRight()?_e.RIGHT_ARROW:_e.LEFT_ARROW]="_onRightArrow";
map[_e.UP_ARROW]="_onUpArrow";
map[_e.DOWN_ARROW]="_onDownArrow";
map[_e.HOME]="_onHomeKey";
map[_e.END]="_onEndKey";
this._keyHandlerMap=map;
}
if(this._keyHandlerMap[key]){
if(this._curSearch){
this._curSearch.timer.remove();
delete this._curSearch;
}
this[this._keyHandlerMap[key]]({node:_7b,item:_7b.item,evt:e});
_b.stop(e);
}
},_onEnterKey:function(_7c){
this._publish("execute",{item:_7c.item,node:_7c.node});
this.dndController.userSelect(_7c.node,_2.isCopyKey(_7c.evt),_7c.evt.shiftKey);
this.onClick(_7c.item,_7c.node,_7c.evt);
},_onDownArrow:function(_7d){
var _7e=this._getNextNode(_7d.node);
if(_7e&&_7e.isTreeNode){
this.focusNode(_7e);
}
},_onUpArrow:function(_7f){
var _80=_7f.node;
var _81=_80.getPreviousSibling();
if(_81){
_80=_81;
while(_80.isExpandable&&_80.isExpanded&&_80.hasChildren()){
var _82=_80.getChildren();
_80=_82[_82.length-1];
}
}else{
var _83=_80.getParent();
if(!(!this.showRoot&&_83===this.rootNode)){
_80=_83;
}
}
if(_80&&_80.isTreeNode){
this.focusNode(_80);
}
},_onRightArrow:function(_84){
var _85=_84.node;
if(_85.isExpandable&&!_85.isExpanded){
this._expandNode(_85);
}else{
if(_85.hasChildren()){
_85=_85.getChildren()[0];
if(_85&&_85.isTreeNode){
this.focusNode(_85);
}
}
}
},_onLeftArrow:function(_86){
var _87=_86.node;
if(_87.isExpandable&&_87.isExpanded){
this._collapseNode(_87);
}else{
var _88=_87.getParent();
if(_88&&_88.isTreeNode&&!(!this.showRoot&&_88===this.rootNode)){
this.focusNode(_88);
}
}
},_onHomeKey:function(){
var _89=this._getRootOrFirstNode();
if(_89){
this.focusNode(_89);
}
},_onEndKey:function(){
var _8a=this.rootNode;
while(_8a.isExpanded){
var c=_8a.getChildren();
_8a=c[c.length-1];
}
if(_8a&&_8a.isTreeNode){
this.focusNode(_8a);
}
},multiCharSearchDuration:250,_onLetterKeyNav:function(_8b){
var cs=this._curSearch;
if(cs){
cs.pattern=cs.pattern+_8b.key;
cs.timer.remove();
}else{
cs=this._curSearch={pattern:_8b.key,startNode:_8b.node};
}
cs.timer=this.defer(function(){
delete this._curSearch;
},this.multiCharSearchDuration);
var _8c=cs.startNode;
do{
_8c=this._getNextNode(_8c);
if(!_8c){
_8c=this._getRootOrFirstNode();
}
}while(_8c!==cs.startNode&&(_8c.label.toLowerCase().substr(0,cs.pattern.length)!=cs.pattern));
if(_8c&&_8c.isTreeNode){
if(_8c!==cs.startNode){
this.focusNode(_8c);
}
}
},isExpandoNode:function(_8d,_8e){
return _7.isDescendant(_8d,_8e.expandoNode);
},_onClick:function(_8f,e){
var _90=e.target,_91=this.isExpandoNode(_90,_8f);
if((this.openOnClick&&_8f.isExpandable)||_91){
if(_8f.isExpandable){
this._onExpandoClick({node:_8f});
}
}else{
this._publish("execute",{item:_8f.item,node:_8f,evt:e});
this.onClick(_8f.item,_8f,e);
this.focusNode(_8f);
}
_b.stop(e);
},_onDblClick:function(_92,e){
var _93=e.target,_94=(_93==_92.expandoNode||_93==_92.expandoNodeText);
if((this.openOnDblClick&&_92.isExpandable)||_94){
if(_92.isExpandable){
this._onExpandoClick({node:_92});
}
}else{
this._publish("execute",{item:_92.item,node:_92,evt:e});
this.onDblClick(_92.item,_92,e);
this.focusNode(_92);
}
_b.stop(e);
},_onExpandoClick:function(_95){
var _96=_95.node;
this.focusNode(_96);
if(_96.isExpanded){
this._collapseNode(_96);
}else{
this._expandNode(_96);
}
},onClick:function(){
},onDblClick:function(){
},onOpen:function(){
},onClose:function(){
},_getNextNode:function(_97){
if(_97.isExpandable&&_97.isExpanded&&_97.hasChildren()){
return _97.getChildren()[0];
}else{
while(_97&&_97.isTreeNode){
var _98=_97.getNextSibling();
if(_98){
return _98;
}
_97=_97.getParent();
}
return null;
}
},_getRootOrFirstNode:function(){
return this.showRoot?this.rootNode:this.rootNode.getChildren()[0];
},_collapseNode:function(_99){
if(_99._expandNodeDeferred){
delete _99._expandNodeDeferred;
}
if(_99.state=="LOADING"){
return;
}
if(_99.isExpanded){
var ret=_99.collapse();
this.onClose(_99.item,_99);
this._state(_99,false);
this._startPaint(ret);
return ret;
}
},_expandNode:function(_9a){
var def=new _5();
if(_9a._expandNodeDeferred){
return _9a._expandNodeDeferred;
}
var _9b=this.model,_9c=_9a.item,_9d=this;
if(!_9a._loadDeferred){
_9a.markProcessing();
_9a._loadDeferred=new _5();
_9b.getChildren(_9c,function(_9e){
_9a.unmarkProcessing();
_9a.setChildItems(_9e).then(function(){
_9a._loadDeferred.resolve(_9e);
});
},function(err){
console.error(_9d,": error loading "+_9a.label+" children: ",err);
_9a._loadDeferred.reject(err);
});
}
_9a._loadDeferred.then(_f.hitch(this,function(){
_9a.expand().then(function(){
def.resolve(true);
});
this.onOpen(_9a.item,_9a);
this._state(_9a,true);
}));
this._startPaint(def);
return def;
},focusNode:function(_9f){
_13.focus(_9f.labelNode);
},_onNodeFocus:function(_a0){
if(_a0&&_a0!=this.lastFocused){
if(this.lastFocused&&!this.lastFocused._destroyed){
this.lastFocused.setFocusable(false);
}
_a0.setFocusable(true);
this.lastFocused=_a0;
}
},_onNodeMouseEnter:function(){
},_onNodeMouseLeave:function(){
},_onItemChange:function(_a1){
var _a2=this.model,_a3=_a2.getIdentity(_a1),_a4=this._itemNodesMap[_a3];
if(_a4){
var _a5=this.getLabel(_a1),_a6=this.getTooltip(_a1);
_1.forEach(_a4,function(_a7){
_a7.set({item:_a1,label:_a5,tooltip:_a6});
_a7._updateItemClasses(_a1);
});
}
},_onItemChildrenChange:function(_a8,_a9){
var _aa=this.model,_ab=_aa.getIdentity(_a8),_ac=this._itemNodesMap[_ab];
if(_ac){
_1.forEach(_ac,function(_ad){
_ad.setChildItems(_a9);
});
}
},_onItemDelete:function(_ae){
var _af=this.model,_b0=_af.getIdentity(_ae),_b1=this._itemNodesMap[_b0];
if(_b1){
_1.forEach(_b1,function(_b2){
this.dndController.removeTreeNode(_b2);
var _b3=_b2.getParent();
if(_b3){
_b3.removeChild(_b2);
}
_b2.destroyRecursive();
},this);
delete this._itemNodesMap[_b0];
}
},_initState:function(){
this._openedNodes={};
if(this.persist&&this.cookieName){
var _b4=_3(this.cookieName);
if(_b4){
_1.forEach(_b4.split(","),function(_b5){
this._openedNodes[_b5]=true;
},this);
}
}
},_state:function(_b6,_b7){
if(!this.persist){
return false;
}
var _b8=_1.map(_b6.getTreePath(),function(_b9){
return this.model.getIdentity(_b9);
},this).join("/");
if(arguments.length===1){
return this._openedNodes[_b8];
}else{
if(_b7){
this._openedNodes[_b8]=true;
}else{
delete this._openedNodes[_b8];
}
if(this.persist&&this.cookieName){
var ary=[];
for(var id in this._openedNodes){
ary.push(id);
}
_3(this.cookieName,ary.join(","),{expires:365});
}
}
},destroy:function(){
if(this._curSearch){
this._curSearch.timer.remove();
delete this._curSearch;
}
if(this.rootNode){
this.rootNode.destroyRecursive();
}
if(this.dndController&&!_f.isString(this.dndController)){
this.dndController.destroy();
}
this.rootNode=null;
this.inherited(arguments);
},destroyRecursive:function(){
this.destroy();
},resize:function(_ba){
if(_ba){
_9.setMarginBox(this.domNode,_ba);
}
this._nodePixelIndent=_9.position(this.tree.indentDetector).w||this._nodePixelIndent;
if(this.tree.rootNode){
this.tree.rootNode.set("indent",this.showRoot?0:-1);
}
this._adjustWidths();
},_outstandingPaintOperations:0,_startPaint:function(p){
if(!this._started){
return;
}
this._outstandingPaintOperations++;
if(this._adjustWidthsTimer){
this._adjustWidthsTimer.remove();
delete this._adjustWidthsTimer;
}
var oc=_f.hitch(this,function(){
this._outstandingPaintOperations--;
if(this._outstandingPaintOperations<=0&&!this._adjustWidthsTimer){
this._adjustWidthsTimer=this.defer("_adjustWidths");
}
});
_12(p,oc,oc);
},_adjustWidths:function(){
if(this._adjustWidthsTimer){
this._adjustWidthsTimer.remove();
delete this._adjustWidthsTimer;
}
var _bb=0;
nodes=[];
function _bc(_bd){
var _be=_bd.rowNode;
_be.style.width="auto";
_bb=Math.max(_bb,_be.clientWidth);
nodes.push(_be);
if(_bd.isExpanded){
_1.forEach(_bd.getChildren(),_bc);
}
};
_bc(this.rootNode);
_bb=Math.max(_bb,_9.getContentBox(this.domNode).w);
_1.forEach(nodes,function(_bf){
_bf.style.width=_bb+"px";
});
},_createTreeNode:function(_c0){
return new _20(_c0);
},_setTextDirAttr:function(_c1){
if(_c1&&this.textDir!=_c1){
this._set("textDir",_c1);
this.rootNode.set("textDir",_c1);
}
}});
_48._TreeNode=_20;
return _48;
});

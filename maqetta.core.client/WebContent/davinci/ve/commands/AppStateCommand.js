define([
    	"dojo/_base/declare",
    	"dojo/_base/lang",
    	"davinci/XPathUtils",
    	"davinci/html/HtmlFileXPathAdapter",
    	"davinci/ve/States"
], function(declare, lang, XPathUtils, HtmlFileXPathAdapter, States){


return declare("davinci.ve.commands.AppStateCommand", null, {
	name: "AppStateCommand",
	_actions:['add','remove','modify'],

	/**
	 * @param {object} params
	 *		params.action {string} add|delete|modify
	 *		params.state {string} name of custom state
	 *		params.stateContainerNode {Element} state container node
	 *		params.context {object} Context object for current doc
	 */
	constructor: function(params){
		if(!params){
			return;
		}
		this._params = lang.mixin({}, params);
		var stateContainerNode = params.stateContainerNode;
		if(stateContainerNode && stateContainerNode._dvWidget){
			this._params.stateContainerId = stateContainerNode.id;
			this._params.stateContainerXpath = XPathUtils.getXPath(stateContainerNode._dvWidget._srcElement,
					HtmlFileXPathAdapter);
		}
	},
	
	_validParams: function(){
		return (this._params &&
			this._actions.indexOf(this._params.action) >= 0) &&
			this._params.state && 
			this._params.stateContainerNode && 
			this._params.stateContainerId && 
			this._params.stateContainerXpath && 
			this._params.context;
	},
	
	_getStateContainerNode: function(){
		var stateContainerNode;
		var context = this._params.context;
		if(!context){
			return stateContainerNode;
		}
		var userDoc = context.getDocument();
		if(!userDoc){
			return stateContainerNode;
		}
		var stateContainerId = this._params.stateContainerId;
		var stateContainerXpath = this._params.stateContainerXpath;
		var stateContainerNode = userDoc.getElementById(stateContainerId);
		if(!stateContainerNode){
			var element = context.model.evaluate(stateContainerXpath);
			if (element) {
				stateContainerNode = userDoc.getElementById(element.getAttribute('id'));
			}
		}
		return stateContainerNode;
	},
	
	execute: function(){
		if(!this._validParams()){
			return;
		}
		var action = this._params.action;
		var state = this._params.state;
		var stateContainerNode = this._getStateContainerNode();
		if(!stateContainerNode){
			return;
		}
		if(action == 'add'){
			States.add(stateContainerNode, state);
		}else if(action == 'remove'){
			States.remove(stateContainerNode, state);
		}
	},

	undo: function(){
		if(!this._validParams()){
			return;
		}
		var action = this._params.action;
		var state = this._params.state;
		var stateContainerNode = this._getStateContainerNode();
		if(!stateContainerNode){
			return;
		}
		if(action == 'add'){
			States.remove(stateContainerNode, state);
		}else if(action == 'remove'){
			States.add(stateContainerNode, state);
		}
	}

});
});
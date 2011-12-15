dojo.provide("davinci.ve.ChooseParent");

dojo.require("davinci.ve.widget");
dojo.require("davinci.ve._Widget");
dojo.require("davinci.ve.Context");

dojo.declare("davinci.ve.ChooseParent", null, {
	
	constructor: function(args){
		this._context = args.context;
	},
	
	/**
	 * Create a candidate list of valid parents for the dropped widget, based on the widgets'
	 * 'allowedChild' and 'allowedParent' properties. The logic ascends the DOM hierarchy
	 * starting with "target" to find all possible valid parents. If no valid parent is
	 * found, then return an empty array.
	 * 
	 * @param target {davinci.ve._Widget}
	 * 			The widget on which the user dropped the new widget.
	 * @param data {Array|Object}
	 * 			Data for the dropped widget. (This routine only looks for 'type' property)
	 * @param climb {boolean}
	 * 			Whether to climb the DOM looking for matches.
	 * @return an array of widgets which are possible valid parents for the dropped widget
	 * @type davinci.ve._Widget
	 */
	getAllowedTargetWidget: function(target, data, climb) {
		// get data for widget we are adding to page
		var getEnclosingWidget = davinci.ve.widget.getEnclosingWidget,
			newTarget = target,
			allowedParentList = [],
			data = data.length ? data : [data],
			children = [];

		// 'data' may represent a single widget or an array of widgets.
		// Get data for all widgets, for use later in isAllowed().
		var _this = this;
		data.forEach(function(elem) {
			children.push({
				allowedParent: davinci.ve.metadata.getAllowedParent(elem.type),
				classList: _this.getClassList(elem.type)
			});
		});

		do {
			var parentType = newTarget instanceof davinci.ve._Widget ?
					newTarget.type : newTarget._dvWidget.type;
			var parentClassList = this.getClassList(parentType);
			if(this.isAllowed(children, newTarget, parentType, parentClassList)){
				allowedParentList.push(newTarget);
			}
			newTarget = getEnclosingWidget(newTarget);
		} while (newTarget && climb);
		
		return allowedParentList;
	},
	
	// Returns 'true' if the dropped widget(s) is(are) allowed as a child of the
	// given parent.
	isAllowed: function(children, parent, parentType, parentClassList) {
		
		// returns 'true' if any of the elements in 'classes' are in 'arr'
		function containsClass(arr, classes) {
			return classes.some(function(elem) {
				return arr.indexOf(elem) !== -1;
			});
		}

		var allowedChild = davinci.ve.metadata.getAllowedChild(parentType);
		
		// special case for HTML <body>
		if (parentType === "html.body") {
			allowedChild = ["ANY"];
		}
		
		// Cycle through children, making sure that all of them work for
		// the given parent.
		return children.every(function(child){
			var isAllowedChild = allowedChild[0] !== "NONE" &&
								 (allowedChild[0] === "ANY" ||
								  containsClass(allowedChild, child.classList));
			var isAllowedParent = child.allowedParent[0] === "ANY" ||
								  containsClass(child.allowedParent, parentClassList);
			return isAllowedChild && isAllowedParent;
		});
	},

	// returns an array consisting of 'type' and any 'class' properties
	getClassList: function(type) {
		var classList = davinci.ve.metadata.queryDescriptor(type, 'class');
		if (classList) {
			classList = classList.split(/\s+/);
			classList.push(type);
			return classList;
		}
		return [type];
	},
	
	/**
	 * If showCandidateParents is true, then update the DIV that is being dragged around
	 * on the screen to show the list of possible parent widgets.
	 * If false, clear any existing list of possible parent widgets.
	 * 
	 * @param {string} widgetType  For example, 'dijit.form.Button'
	 * @param {boolean} showCandidateParents  Whether the DIV being dragged around should show possible parents
	 * @param {boolean} absolute  true if current widget will be positioned absolutely
	 * @param {object} currentParent  if provided, then current parent widget for thing being dragged
	 */
	dragUpdateCandidateParents: function(widgetType, showCandidateParents, absolute, currentParent){
		var context = this._context;
		// NOTE: For CreateTool, the activeDragDiv is a DIV attached to dragClone
		// For SelectTool, the activeDragDiv is created by calling parentListDivCreate() (in this JS file)
		var activeDragDiv = context.getActiveDragDiv();
		var parentListDiv;
		if(activeDragDiv){
			// Palette.js stuffs in an extra DIV with class maqCandidateParents into DIV that is being dragged around by user
			var elems = dojo.query('.maqCandidateParents',activeDragDiv);
			if(elems.length==1){
				parentListDiv = elems[0];
			}
		}
		if(parentListDiv){
			if(showCandidateParents){
				var allowedParentList = this._findParentsXYList;
				
				if(!this._proposedParentWidget){
					this._proposedParentWidget = this._getDefaultParent(widgetType, allowedParentList, absolute, currentParent);
				}

				this.highlightNewWidgetParent(this._proposedParentWidget);

				// Don't recreate DIV with every mousemove if parent list is the same
				var same = true;
				if(this._lastProposedParentWidget != this._proposedParentWidget){
					same = false;
				}else if(typeof this._lastAllowedParentList == 'undefined' || this._lastAllowedParentList===null){
					same = false;
				}else if(this._lastAllowedParentList.length != allowedParentList.length){
					same = false;
				}else{
					for(var i=0; i<allowedParentList.length; i++){
						if(this._lastAllowedParentList[i] != allowedParentList[i]){
							same = false;
							break;
						}
					}
				}
				this._lastProposedParentWidget = this._proposedParentWidget;

				if(!same){
					var langObj = dojo.i18n.getLocalization("davinci.ve", "ve");
					var len;
					parentListDiv.innerHTML = '';
					if(typeof allowedParentList == 'undefined' || allowedParentList === null){
						this._lastAllowedParentList = null;
						len = 0;
					}else{
						this._lastAllowedParentList = allowedParentList.slice();	// clone the array
						len = allowedParentList.length;
						var headerDiv = dojo.create('div',{className:'maqCandidateParentsHeader'},parentListDiv);
						var listDiv = dojo.create('div',{className:'maqCandidateParentsList'},parentListDiv);
						var helpDiv = dojo.create('div',{className:'maqCandidateParentsHelp'},parentListDiv);
						var div;
						if(len == 0){
							headerDiv.innerHTML = langObj.noValidParents;
						}else if(len == 1){
							headerDiv.innerHTML = langObj.willBeChildOf;
							div = dojo.create('div',{className:'maqCandidateListItem maqCandidateCurrent',innerHTML:davinci.ve.widget.getLabel(allowedParentList[0])},listDiv);
						}else{
							headerDiv.innerHTML = langObj.candidateParents;
							var s = '<table>';
							var j;
							for(var i=allowedParentList.length-1, j=1; i >= 0; i--, j++){
								var className = 'maqCandidateListItem';
								if(allowedParentList[i] == this._proposedParentWidget){
									className += ' maqCandidateCurrent';
								}
								s += '<tr class="'+className+'"><td class="maqCandidateCheckedColumn">&rarr;</td><td class="maqCandidateNumberColumn">'+j+'</td><td class="maqCandidateParentColumn">'+davinci.ve.widget.getLabel(allowedParentList[i])+'</td></tr>';
							}
							s += '</table>';
							listDiv.innerHTML = s;
							helpDiv.innerHTML = langObj.toChangePress;
						}
					}
				}
			}else{
				parentListDiv.innerHTML = '';
				this._lastAllowedParentList = null;
			}
		}
	
	},

	/**
	 * Choose a parent widget. For flow layout, default to nearest valid parent.
	 * For absolute layout, default to the current outer container widget (e.g., the BODY)
	 * 
	 * @param {string} widgetType  For example, 'dijit.form.Button'
	 * @param {[object]} allowedParentList  List of ancestor widgets of event.target that can be parents of the new widget
	 * @param {boolean} absolute  true if current widget will be positioned absolutely
	 * @param {object} currentParent  if provided, then current parent widget for thing being dragged
	 */
	_getDefaultParent: function(widgetType, allowedParentList, absolute, currentParent){
		var context = this._context;
		var proposedParentWidget;
		if(allowedParentList){
			var helper = davinci.ve.widget.getWidgetHelper(widgetType);
			if(allowedParentList.length>1 && helper && helper.chooseParent){
				//FIXME: Probably should pass all params to helper
				proposedParentWidget = helper.chooseParent(allowedParentList);
			}else if (allowedParentList.length == 0){
				proposedParentWidget = null;
			}else{
				if(absolute && currentParent){
					proposedParentWidget = currentParent;
				}else{
					var last = allowedParentList.length - 1;
					console.log('allowedParentList.length='+allowedParentList.length+',last='+last);
					proposedParentWidget = allowedParentList[last];
				}
			}
		}
		return proposedParentWidget;
	},
	
	/**
	 * Cleanup operations after drag operation is complete
	 */
	cleanup: function(){
		var context = this._context;
		this.highlightNewWidgetParent(null);
		this._lastAllowedParentList = null;
	},
	
	/**
	 * During widget drag/drop creation, highlight the widget that would
	 * be the parent of the new widget
	 * @param {davinci.ve._Widget} newWidgetParent  Parent widget to highlight
	 */
	highlightNewWidgetParent: function(newWidgetParent){
		var context = this._context;
		if(newWidgetParent != this.newWidgetParent){
			if(this.newWidgetParent){
				this.newWidgetParent.domNode.style.outline = '';
			}
			this.newWidgetParent = newWidgetParent;
			if(newWidgetParent){
				//FIXME: This quick hack using 'outline' property is problematic:
				//(1) User won't see the brown outline on BODY
				//(2) If widget actually uses 'outline' property, it will get clobbered
				newWidgetParent.domNode.style.outline = '1px solid brown';
			}
		}
	},

	/**
	 * During drag operation, returns the widget that will become the parent widget
	 * when the drag operation ends (assuming nothing changes in mean time).
	 * @return {object|null}   Widget that is the new proposed parent widget
	 */
	getProposedParentWidget: function(widget){
		return this._proposedParentWidget;
	},

	/**
	 * During drag operation, sets the widget that will become the parent widget
	 * when the drag operation ends assuming nothing changes in mean time.
	 * @param {object|null} widget  Widget that is the new proposed parent widget
	 */
	setProposedParentWidget: function(widget){
		this._proposedParentWidget = widget;
	},


	/**
	 * During drag operation, returns the list of valid parent widgets at the 
	 * current mouse location.
	 * @return {array[object]}   Array of possible parent widgets at current (x,y)
	 */
	getProposedParentsList: function(){
		return this._findParentsXYList;
	},
	
	/**
	 * Preparatory work before searching widget tree for possible parent
	 * widgets at a given (x,y) location
	 * @param {object} params  object with following properties:
	 *      {object|array{object}} data  For widget being dragged, either {type:<widgettype>} or array of similar objects
	 *      {object} eventTarget  Node (usually, Element) that is current event.target (ie, node under mouse)
	 *      {object} position x,y properties hold current mouse location
	 *      {boolean} absolute  true if current widget will be positioned absolutely
	 *      {object} currentParent  if provided, then current parent widget for thing being dragged
	 * 		{object} rect  l,t,w,h properties define rectangle being dragged around
	 * 		{boolean} doSnapLines  whether to show dynamic snap lines
	 * 		{boolean} doFindParentsXY  whether to show candidate parent widgets
	 * @return {boolean} true if current (x,y) is different than last (x,y), false if the same.
	 */
	findParentsXYBeforeTraversal: function(params) {
		var data = params.data;
		var eventTarget = params.eventTarget;
		var position = params.position;
		var absolute = params.absolute;
		var currentParent = params.currentParent;
		var rect = params.rect;
		var doFindParentsXY = params.doFindParentsXY;
		this._findParentsXYList = [];
		var bodyWidget = eventTarget.ownerDocument.body._dvWidget;
		if(absolute && currentParent && currentParent != bodyWidget){
			this._findParentsXYList.push(currentParent);
		}
		var allowedParents = this.getAllowedTargetWidget(bodyWidget, data, false);
		if(allowedParents.length === 1){
			this._findParentsXYList.push(bodyWidget);
		}
		
		if(typeof this.findParentsXYLastPosition == 'undefined'){
			this.findParentsXYLastPosition = {};
		}

		var last = this.findParentsXYLastPosition;
		if(position.x === last.x && position.y === last.y){
			return false;
		}else{
			last.x = position.x;
			last.y = position.y;
			return true;
		}
	},
	
	/**
	 * If this widget overlaps given x,y position, then add to
	 * list of possible parents at current x,y position
	 * @param {object|array{object}} data  For widget being dragged, either {type:<widgettype>} or array of similar objects
	 * @param {object} widget  widget to check (dvWidget)
	 * @param {object} position  object with properties x,y (in page-relative coords)
	 */
	findParentsXY: function(data, widget, position) {
		var domNode = widget.domNode;
		var x = position.x;
		var y = position.y;
		var w = domNode.offsetWidth;
		var h = domNode.offsetHeight;
		var l = domNode.offsetLeft;
		var t = domNode.offsetTop;
		var offsetParent = domNode.offsetParent;
		while(offsetParent && offsetParent.tagName != 'BODY'){
			l += offsetParent.offsetLeft;
			t += offsetParent.offsetTop;
			offsetParent = offsetParent.offsetParent;
		}
		var r = l + w;
		var b = t + h;
		if(x >= l && x <= r && y >= t && y <= b){
			var allowedParents = this.getAllowedTargetWidget(widget, data, false);
			if(allowedParents.length === 1){
				this._findParentsXYList.push(widget);
			}
		}
	},
	
	/**
	 * Wrap-up work after searching widget tree for possible parent
	 * widgets at a given (x,y) location
	 */
	findParentsXYAfterTraversal: function() {
		this.findParentsXYLastPosition = {};
	},
	
    /**
     * Create a floating DIV that will hold the list of proposed parent widgets
	 * {string} widgetType  Type of widget (e.g., 'dijit.form.Button')
	 * @param {boolean} absolute  true if current widget will be positioned absolutely
	 * @param {object} currentParent  if provided, then current parent widget for thing being dragged
     * @returns {object}  DIV's domNode
     */
    parentListDivCreate: function(widgetType, absolute, currentParent){
		var context = this._context;
    	if(!widgetType){
    		return;
    	}
        var userdoc = context.getDocument();	// inner document = user's document
        this._oldActiveElement = document.activeElement;
        //TODO it is possible that giving focus to defaultView will break the PageEditor split view mode. Needs investigation.
        //JF: I don't think this will break split view. This code is only activated during drag operations
        //on the canvas, and drag operations on canvas should have all focus things on the canvas.
        userdoc.defaultView.focus();	// Make sure the userdoc is the focus object for keyboard events
        this._keyDownHandler = dojo.connect(userdoc, "onkeydown", dojo.hitch(this, function(args, evt){
        	var widgetType = args[0];
        	var absolute = args[1];
        	var currentParent = args[2];
        	this.onKeyDown(evt, widgetType, absolute, currentParent);
        }, [widgetType, absolute, currentParent]));
        this._keyUpHandler = dojo.connect(userdoc, "onkeyup", dojo.hitch(this, function(args, evt){
        	var widgetType = args[0];
        	var absolute = args[1];
        	var currentParent = args[2];
        	this.onKeyUp(evt, widgetType, absolute, currentParent);
        }, [widgetType, absolute, currentParent]));
 		var body = document.body;	// outer document = Maqetta app
		parentListDiv = this._parentListDiv = dojo.create('div', {
			className:'maqParentListDiv', 
			style:'position:absolute;z-index:1000; opacity:.7;pointer-events:none;'}, 
			body);
		context.setActiveDragDiv(parentListDiv);
		// Downstream logic stuffs the list of candidate parents into DIV with class 'maqCandidateParents'
		dojo.create('div', {className:'maqCandidateParents'}, parentListDiv);
		return parentListDiv;
    },
	
    /**
     * Return the floating DIV that will hold the list of proposed parent widgets
     * @returns {object}  DIV's domNode
     */
    parentListDivGet: function(){
        return this._parentListDiv;
    },
    
    /**
     * Delete the floating DIV that held the list of proposed parent widgets
     */
   parentListDivDelete: function(){
	   var context = this._context;
	   var parentListDiv = this._parentListDiv;
	   if(parentListDiv){
		   if(this._oldActiveElement){
			   this._oldActiveElement.focus();
			   this._oldActiveElement = null;
		   }
		   dojo.disconnect(this._keyDownHandler);
		   dojo.disconnect(this._keyUpHandler);
		   this._keyDownHandler = this._keyUpHandler = null;
		   var parentNode = parentListDiv.parentNode;
		   parentNode.removeChild(parentListDiv);
		   context.setActiveDragDiv(null);
		   this._parentListDiv = null;
	   }
    },
    
    _keyEventDoUpdate: function(widgetType, absolute, currentParent){
		// Under certain conditions, show list of possible parent widgets
		var showParentsPref = this._context.getPreference('showPossibleParents');
		var showCandidateParents = (!showParentsPref && this._spaceKeyDown) || (showParentsPref && !this._spaceKeyDown);
		this.dragUpdateCandidateParents(widgetType, showCandidateParents, absolute, currentParent);
    },
    
	onKeyDown: function(event, widgetType, absolute, currentParent){
		dojo.stopEvent(event);
		if(event.keyCode==32){	// 32=space key
			this._spaceKeyDown = true;
		}else{
			this._processKeyDown(event.keyCode);
		}
		this._keyEventDoUpdate(widgetType, absolute, currentParent);
	},

	onKeyUp: function(event, widgetType, absolute, currentParent){
		dojo.stopEvent(event);
		if(event.keyCode==32){	// 32=space key
			this._spaceKeyDown = false;
		}
		this._keyEventDoUpdate(widgetType, absolute, currentParent);
	},
	
	/**
	 * Update currently proposed parent widget based on latest keydown event
	 * 
	 * @param {number} keyCode  The keyCode for the key that the user pressed
	 */
	_processKeyDown: function(keyCode){
		if(keyCode>=49 && keyCode<=57){		// 1-9
			var context = this._context;
			var proposedParentsList = this.getProposedParentsList();
			if(proposedParentsList.length > 1){
				// Number character: select parent that has the given number
				// Note that the presentation is 1-based (versus 0-based) and backwards
				var index = proposedParentsList.length - (keyCode - 48);
				if(index >= 0){
					this.setProposedParentWidget(proposedParentsList[index]);
				}
			}
		}
	},
	
	isSpaceKeyDown: function(){
		return this._spaceKeyDown;
	}

});
dojo.provide("dijit._TimePicker");

dojo.require("dijit.form._FormWidget");
dojo.require("dojo.date.locale");

/*=====
dojo.declare(
	"dijit._TimePicker.__Constraints",
	dojo.date.locale.__FormatOptions,
	{
		// clickableIncrement: String
		//		See `dijit._TimePicker.clickableIncrement`
		clickableIncrement: "T00:15:00",

		// visibleIncrement: String
		//		See `dijit._TimePicker.visibleIncrement`
		visibleIncrement: "T01:00:00",

		// visibleRange: String
		//		See `dijit._TimePicker.visibleRange`
		visibleRange: "T05:00:00"
	}
);
=====*/

dojo.declare("dijit._TimePicker",
	[dijit._Widget, dijit._Templated],
	{
		// summary:
		//		A graphical time picker.
		//		This widget is used internally by other widgets and is not available
		//		as a standalone widget due to lack of accessibility support.

		templateString: dojo.cache("dijit", "templates/TimePicker.html"),

		// baseClass: [protected] String
		//		The root className to use for the various states of this widget
		baseClass: "dijitTimePicker",

		// clickableIncrement: String
		//		ISO-8601 string representing the amount by which
		//		every clickable element in the time picker increases.
		//		Set in local time, without a time zone.
		//		Example: `T00:15:00` creates 15 minute increments
		//		Must divide dijit._TimePicker.visibleIncrement evenly
		clickableIncrement: "T00:15:00",

		// visibleIncrement: String
		//		ISO-8601 string representing the amount by which
		//		every element with a visible time in the time picker increases.
		//		Set in local time, without a time zone.
		//		Example: `T01:00:00` creates text in every 1 hour increment
		visibleIncrement: "T01:00:00",

		// visibleRange: String
		//		ISO-8601 string representing the range of this TimePicker.
		//		The TimePicker will only display times in this range.
		//		Example: `T05:00:00` displays 5 hours of options
		visibleRange: "T05:00:00",

		// value: String
		//		Date to display.
		//		Defaults to current time and date.
		//		Can be a Date object or an ISO-8601 string.
		//		If you specify the GMT time zone (`-01:00`),
		//		the time will be converted to the local time in the local time zone.
		//		Otherwise, the time is considered to be in the local time zone.
		//		If you specify the date and isDate is true, the date is used.
		//		Example: if your local time zone is `GMT -05:00`,
		//		`T10:00:00` becomes `T10:00:00-05:00` (considered to be local time),
		//		`T10:00:00-01:00` becomes `T06:00:00-05:00` (4 hour difference),
		//		`T10:00:00Z` becomes `T05:00:00-05:00` (5 hour difference between Zulu and local time)
		//		`yyyy-mm-ddThh:mm:ss` is the format to set the date and time
		//		Example: `2007-06-01T09:00:00`
		value: new Date(),

		_visibleIncrement:2,
		_clickableIncrement:1,
		_totalIncrements:10,

		// constraints: dijit._TimePicker.__Constraints
		//		Specifies valid range of times (start time, end time)
		constraints:{},

/*=====
		serialize: function(val, options){
			// summary:
			//		User overridable function used to convert the attr('value') result to a String
			// val: Date
			//		The current value
			// options: Object?
			// tags:
			//		protected
		},
=====*/
		serialize: dojo.date.stamp.toISOString,

		// _filterString: string
		//		The string to filter by
		_filterString: "",

		setValue: function(/*Date*/ value){
			// summary:
			//		Deprecated.  Used attr('value') instead.
			// tags:
			//		deprecated
			dojo.deprecated("dijit._TimePicker:setValue() is deprecated.  Use set('value', ...) instead.", "", "2.0");
			this.set('value', value);
		},
		_setValueAttr: function(/*Date*/ date){
			// summary:
			//		Hook so attr('value', ...) works.
			// description:
			//		Set the value of the TimePicker.
			//		Redraws the TimePicker around the new date.
			// tags:
			//		protected
			this.value = date;
			this._showText();
		},

		onOpen: function(best){
			// summary:
			//		This is called by the popup manager when a TimeTextBox is displayed on the screen
			// best:
			//		Whether it is being displayed above or below the `dijit.form.TimeTextBox`
			// tags:
			//		protected
			if(this._beenOpened && this.domNode.parentNode){
				// We've been opened before - so set our filter to to the
				// currently-displayed value (or empty string if it's already
				// valid)
				var p = dijit.byId(this.domNode.parentNode.dijitPopupParent);
				if(p){
					var val = p.get('displayedValue');
					if(val && !p.parse(val, p.constraints)){
						this._filterString = val;
					}else{
						this._filterString = "";
					}
					this._showText();
				}
			}
			this._beenOpened = true;
		},

		isDisabledDate: function(/*Date*/ dateObject, /*String?*/ locale){
			// summary:
			//		May be overridden to disable certain dates in the TimePicker e.g. `isDisabledDate=dojo.date.locale.isWeekend`
			// type:
			//		extension
			return false; // Boolean
		},

		_getFilteredNodes: function(/*number*/ start, /*number*/ maxNum, /*Boolean*/ before){
			// summary:
			//		Returns an array of nodes with the filter applied.  At most maxNum nodes
			//		will be returned - but fewer may be returned as well.  If the
			//		before parameter is set to true, then it will return the elements
			//		before the given index
			// tags:
			//		private
			var nodes = [], n, i = start, max = this._maxIncrement + Math.abs(i),
				chk = before?-1:1, dec = before?1:0, inc = before?0:1;
			do{
				i = i - dec;
				n = this._createOption(i);
				if(n){nodes.push(n);}
				i = i + inc;
			}while(nodes.length < maxNum && (i*chk) < max);
			if(before){ nodes.reverse(); }
			return nodes;
		},

		_showText: function(){
			// summary:
			//		Displays the relevant choices in the drop down list
			// tags:
			//		private
			this.timeMenu.innerHTML = "";
			var fromIso = dojo.date.stamp.fromISOString;
			this._clickableIncrementDate=fromIso(this.clickableIncrement);
			this._visibleIncrementDate=fromIso(this.visibleIncrement);
			this._visibleRangeDate=fromIso(this.visibleRange);
			// get the value of the increments and the range in seconds (since 00:00:00) to find out how many divs to create
			var sinceMidnight = function(/*Date*/ date){
				return date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
			};

			var clickableIncrementSeconds = sinceMidnight(this._clickableIncrementDate);
			var visibleIncrementSeconds = sinceMidnight(this._visibleIncrementDate);
			var visibleRangeSeconds = sinceMidnight(this._visibleRangeDate);

			// round reference date to previous visible increment
			var time = this.value.getTime();
			this._refDate = new Date(time - time % (visibleIncrementSeconds*1000));
			this._refDate.setFullYear(1970,0,1); // match parse defaults

			// assume clickable increment is the smallest unit
			this._clickableIncrement = 1;
			// divide the visible range by the clickable increment to get the number of divs to create
			// example: 10:00:00/00:15:00 -> display 40 divs
			this._totalIncrements = visibleRangeSeconds / clickableIncrementSeconds;
			// divide the visible increments by the clickable increments to get how often to display the time inline
			// example: 01:00:00/00:15:00 -> display the time every 4 divs
			this._visibleIncrement = visibleIncrementSeconds / clickableIncrementSeconds;
			// divide the number of seconds in a day by the clickable increment in seconds to get the
			// absolute max number of increments.
			this._maxIncrement = (60 * 60 * 24) / clickableIncrementSeconds;

			// find the nodes we should display based on our filter
			var before = this._getFilteredNodes(0, this._totalIncrements >> 1, true);
			var after = this._getFilteredNodes(0, this._totalIncrements >> 1, false);
			if(before.length < this._totalIncrements >> 1){
				before = before.slice(before.length / 2);
				after = after.slice(0, after.length / 2);
			}
			dojo.forEach(before.concat(after), function(n){this.timeMenu.appendChild(n);}, this);

			// TODO:
			// I commented this out because it
			// causes problems for a TimeTextBox in a Dialog, or as the editor of an InlineEditBox,
			// because the timeMenu node isn't visible yet. -- Bill (Bug #????)
			// dijit.focus(this.timeMenu);
		},

		postCreate: function(){
			// instantiate constraints
			if(this.constraints === dijit._TimePicker.prototype.constraints){
				this.constraints={};
			}

			// brings in visibleRange, increments, etc.
			dojo.mixin(this, this.constraints);

			// dojo.date.locale needs the lang in the constraints as locale
			if(!this.constraints.locale){
				this.constraints.locale=this.lang;
			}

			// assign typematic mouse listeners to the arrow buttons
			this.connect(this.timeMenu, dojo.isIE ? "onmousewheel" : 'DOMMouseScroll', "_mouseWheeled");
			var _this = this;
			var typematic = function(){
				_this._connects.push(
					dijit.typematic.addMouseListener.apply(null, arguments)
				);
			};
			typematic(this.upArrow,this,this._onArrowUp, 1.0, 50);
			typematic(this.downArrow,this,this._onArrowDown, 1.0, 50);

			// Connect some callback functions to the hover event of the arrows
			var triggerFx = function(cb){
				return function(cnt){
					// don't run on the first firing
					if(cnt > 0){cb.call(this, arguments);}
				};
			};
			var hoverFx = function(node, cb){
				return function(e){
					dojo.stopEvent(e);
					dijit.typematic.trigger(e, this, node, triggerFx(cb), node, 1.0, 50);
				};
			};
			this.connect(this.upArrow, "onmouseover", hoverFx(this.upArrow, this._onArrowUp));
			this.connect(this.downArrow, "onmouseover", hoverFx(this.downArrow, this._onArrowDown));

			this.inherited(arguments);
		},

		_buttonMouse: function(/*Event*/ e){
			// summary:
			//		Handler for hover (and unhover) on up/down arrows
			// tags:
			//		private

			// in non-IE browser the "mouseenter" event will become "mouseover", 
			// but in IE it's still "mouseenter"
			dojo.toggleClass(e.currentTarget, e.currentTarget == this.upArrow ? "dijitUpArrowHover" : "dijitDownArrowHover", 
				e.type == "mouseenter" || e.type == "mouseover");
		},

		_createOption: function(/*Number*/ index){
			// summary:
			//		Creates a clickable time option
			// tags:
			//		private
			var date = new Date(this._refDate);
			var incrementDate = this._clickableIncrementDate;
			date.setHours(date.getHours() + incrementDate.getHours() * index,
				date.getMinutes() + incrementDate.getMinutes() * index,
				date.getSeconds() + incrementDate.getSeconds() * index);
			if(this.constraints.selector == "time"){
				date.setFullYear(1970,0,1); // make sure each time is for the same date
			}
			var dateString = dojo.date.locale.format(date, this.constraints);
			if(this._filterString && dateString.toLowerCase().indexOf(this._filterString) !== 0){
				// Doesn't match the filter - return null
				return null;
			}

			var div = dojo.create("div", {"class": this.baseClass+"Item"});
			div.date = date;
			div.index = index;
			dojo.create('div',{
				"class": this.baseClass + "ItemInner",
				innerHTML: dateString
			}, div);

			if(index%this._visibleIncrement<1 && index%this._visibleIncrement>-1){
				dojo.addClass(div, this.baseClass+"Marker");
			}else if(!(index%this._clickableIncrement)){
				dojo.addClass(div, this.baseClass+"Tick");
			}

			if(this.isDisabledDate(date)){
				// set disabled
				dojo.addClass(div, this.baseClass+"ItemDisabled");
			}
			if(!dojo.date.compare(this.value, date, this.constraints.selector)){
				div.selected = true;
				dojo.addClass(div, this.baseClass+"ItemSelected");
				if(dojo.hasClass(div, this.baseClass+"Marker")){
					dojo.addClass(div, this.baseClass+"MarkerSelected");
				}else{
					dojo.addClass(div, this.baseClass+"TickSelected");
				}
			}
			return div;
		},

		_onOptionSelected: function(/*Object*/ tgt){
			// summary:
			//		Called when user clicks an option in the drop down list
			// tags:
			//		private
			var tdate = tgt.target.date || tgt.target.parentNode.date;
			if(!tdate || this.isDisabledDate(tdate)){ return; }
			this._highlighted_option = null;
			this.set('value', tdate);
			this.onValueSelected(tdate);
		},

		onValueSelected: function(/*Date*/ time){
			// summary:
			//		Notification that a time was selected.  It may be the same as the previous value.
			// description:
			//      Used by `dijit.form._DateTimeTextBox` (and thus `dijit.form.TimeTextBox`)
			//      to get notification when the user has clicked a time.
			// tags:
			//      protected
		},


		_highlightOption: function(/*node*/ node, /*Boolean*/ highlight){
			// summary:
			//		Turns on/off hover effect on a node based on mouse out/over event
			// tags:
			//		private
			if(!node){return;}
			if(highlight){
				if(this._highlighted_option){
					this._highlightOption(this._highlighted_option, false);
				}
				this._highlighted_option = node;
			}else if(this._highlighted_option !== node){
				return;
			}else{
				this._highlighted_option = null;
			}
			dojo.toggleClass(node, this.baseClass+"ItemHover", highlight);
			if(dojo.hasClass(node, this.baseClass+"Marker")){
				dojo.toggleClass(node, this.baseClass+"MarkerHover", highlight);
			}else{
				dojo.toggleClass(node, this.baseClass+"TickHover", highlight);
			}
		},

		onmouseover: function(/*Event*/ e){
			// summary:
			//		Handler for onmouseover event
			// tags:
			//		private
			this._keyboardSelected = null;
			var tgr = (e.target.parentNode === this.timeMenu) ? e.target : e.target.parentNode;
			// if we aren't targeting an item, then we return
			if(!dojo.hasClass(tgr, this.baseClass+"Item")){return;}
			this._highlightOption(tgr, true);
		},

		onmouseout: function(/*Event*/ e){
			// summary:
			//		Handler for onmouseout event
			// tags:
			//		private
			this._keyboardSelected = null;
			var tgr = (e.target.parentNode === this.timeMenu) ? e.target : e.target.parentNode;
			this._highlightOption(tgr, false);
		},

		_mouseWheeled: function(/*Event*/ e){
			// summary:
			//		Handle the mouse wheel events
			// tags:
			//		private
			this._keyboardSelected = null;
			dojo.stopEvent(e);
			// we're not _measuring_ the scroll amount, just direction
			var scrollAmount = (dojo.isIE ? e.wheelDelta : -e.detail);
			this[(scrollAmount>0 ? "_onArrowUp" : "_onArrowDown")](); // yes, we're making a new dom node every time you mousewheel, or click
		},

		_onArrowUp: function(count){
			// summary:
			//		Handler for up arrow key.
			// description:
			//		Removes the bottom time and add one to the top
			// tags:
			//		private
			if(typeof count == "number" && count == -1){ return; } // typematic end
			if(!this.timeMenu.childNodes.length){ return; }
			var index = this.timeMenu.childNodes[0].index;
			var divs = this._getFilteredNodes(index, 1, true);
			if(divs.length){
				this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length - 1]);
				this.timeMenu.insertBefore(divs[0], this.timeMenu.childNodes[0]);
			}
		},

		_onArrowDown: function(count){
			// summary:
			//		Handler for up arrow key.
			// description:
			//		Remove the top time and add one to the bottom
			// tags:
			//		private
			if(typeof count == "number" && count == -1){ return; } // typematic end
			if(!this.timeMenu.childNodes.length){ return; }
			var index = this.timeMenu.childNodes[this.timeMenu.childNodes.length - 1].index + 1;
			var divs = this._getFilteredNodes(index, 1, false);
			if(divs.length){
				this.timeMenu.removeChild(this.timeMenu.childNodes[0]);
				this.timeMenu.appendChild(divs[0]);
			}
		},

		handleKey: function(/*Event*/ e){
			// summary:
			//		Called from `dijit.form._DateTimeTextBox` to pass a keypress event
			//		from the `dijit.form.TimeTextBox` to be handled in this widget
			// tags:
			//		protected
			var dk = dojo.keys;
			if(e.keyChar || e.charOrCode === dk.BACKSPACE || e.charOrCode == dk.DELETE){
				// Set a timeout to kick off our filter
				setTimeout(dojo.hitch(this, function(){
					this._filterString = e.target.value.toLowerCase();
					this._showText();
				}),1);
			}else if(e.charOrCode == dk.DOWN_ARROW || e.charOrCode == dk.UP_ARROW){
				dojo.stopEvent(e);
				// Figure out which option to highlight now and then highlight it
				if(this._highlighted_option && !this._highlighted_option.parentNode){
					this._highlighted_option = null;
				}
				var timeMenu = this.timeMenu,
					tgt = this._highlighted_option || dojo.query("." + this.baseClass + "ItemSelected", timeMenu)[0];
				if(!tgt){
					tgt = timeMenu.childNodes[0];
				}else if(timeMenu.childNodes.length){
					if(e.charOrCode == dk.DOWN_ARROW && !tgt.nextSibling){
						this._onArrowDown();
					}else if(e.charOrCode == dk.UP_ARROW && !tgt.previousSibling){
						this._onArrowUp();
					}
					if(e.charOrCode == dk.DOWN_ARROW){
						tgt = tgt.nextSibling;
					}else{
						tgt = tgt.previousSibling;
					}
				}
				this._highlightOption(tgt, true);
				this._keyboardSelected = tgt;
			}else if(this._highlighted_option && (e.charOrCode == dk.ENTER || e.charOrCode === dk.TAB)){
				// Accept the currently-highlighted option as the value
				if(!this._keyboardSelected && e.charOrCode === dk.TAB){ return; } // mouse hover followed by TAB is NO selection
				if(e.charOrCode == dk.ENTER){dojo.stopEvent(e);}
				this._onOptionSelected({target: this._highlighted_option});
			}
		}
	}
);


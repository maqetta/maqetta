define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"./_DeviceClipartHelper",
	"davinci/ve/commands/ResizeCommand"
], function(declare, connect, _DeviceClipartHelper, ResizeCommand) {

return declare([], {
	
	// These two values must match width/height attributes on <svg> element for portrait clipart
	defaultWidth:385.5645,
	defaultHeight:747.8577,
	
	constructor: function(){
		//debugger;
		connect.subscribe('/davinci/ui/widgetPropertiesChanged', function(widgets){
			//debugger;
			if(!widgets){
				return;
			}
			var widget = widgets[0];
			if(!widget || !widget.dijitWidget){
				return;
			}
			var dijitWidget = widget.dijitWidget;
			if(dijitWidget.DeviceClipart && dijitWidget.UpdateStyle){
				dijitWidget.UpdateStyle();;
			}
		}.bind(this));
		//connect.subscribe('/davinci/ui/widgetPropertiesChanges', function(widgets){
			// Payload: source: this._editor.editor_id, command: (ModifyCommand object)
			//debugger;
			/*
			if(!widgets){
				return;
			}
			var widget = widgets[0];
			if(!widget || !widget.dijitWidget){
				return;
			}
			var dijitWidget = widget.dijitWidget;
			if(dijitWidget.DeviceClipart && dijitWidget.UpdateStyle){
				dijitWidget.UpdateStyle();;
			}
			*/
		//}.bind(this));
	},
	
	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 * 		size - {w:(number), h:(number)}
	 *		position - /* if an object, then widget is created with absolute positioning
	 * 		
	 */
	initialSize: function(args){
		//debugger;
		if(!args.size){
			return { w:this.defaultWidth, h:this.defaultHeight };
		}
	},

	/**
	 * Helper function called whenever a widget-specific property is changed
	 * @param {object} args  - object with these properties
	 * .    widget  the dvWidget whose property(ies) has changed
	 *      compoundCommand  the CompoundCommand object that contains the ModifyCommand
	 *      modifyCommand  the ModifyCommand object that will soon be executed to change properties
	 */
	onWidgetPropertyChange: function(args){
		debugger;
		if(!args){
			return;
		}
		var widget = args.widget;
		var compoundCommand = args.compoundCommand;
		var modifyCommand = args.modifyCommand;
		if(!widget || !compoundCommand || !modifyCommand){
			return;
		}
		//var oldData = widget.getData();
		//var oldProperties = oldData && oldData.properties;
		//var oldOrientation = (oldProperties && oldProperties.orientation);
		var oldOrientation = (widget.dijitWidget && widget.dijitWidget.orientation);
		var newProperties = modifyCommand._properties;
		var newOrientation = (newProperties && newProperties.orientation);
		if(oldOrientation && newOrientation && oldOrientation != newOrientation){
			var context = widget.getContext();
			if(!context){
				return;
			}
			var dj = context.getDojo();
			if(!dj){
				return;
			}
			var oldWidth = dj.style(widget.domNode, 'width');
			var oldHeight = dj.style(widget.domNode, 'height');
			compoundCommand.add(new ResizeCommand(widget, oldHeight, oldWidth));
		}
	}

	/*
	_setCSS3Property: function(node, domProperty, value){
		var style = node.style;
		var domPropertyUC = domProperty.charAt(0).toUpperCase() + domProperty.slice(1);
		style['webkit'+domPropertyUC] = value;
		style['Moz'+domPropertyUC] = value;
		style['ms'+domPropertyUC] = value;
		style['o'+domPropertyUC] = value;
		style[domProperty] = value;
	}
	*/

});

});
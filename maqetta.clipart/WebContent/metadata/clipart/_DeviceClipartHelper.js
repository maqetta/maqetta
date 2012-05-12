define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"davinci/ve/commands/ResizeCommand"
], function(declare, connect, ResizeCommand) {

return declare([], {
		
	constructor: function(){
		connect.subscribe('/davinci/ui/widgetPropertiesChanged', function(widgets){
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
	},
	
	destroy: function(widget){
		var children = widget.getChildren ? widget.getChildren() : [];
		children.forEach(function(each) {
			if(each.destroyWidget){
				each.destroyWidget(); 
			}
		});
		if(widget.dijitWidget && widget.dijitWidget.destroyRecursive){
			widget.dijitWidget.destroyRecursive();
		}
	},
	
	
	/**
	 * Helper function called to establish widget size at initial creation time
	 * @param {object} args  holds following values:
	 * 		parent - target parent widget for initial creation
	 * 		size - {w:(number), h:(number)}
	 *		position - if an object, then widget is created with absolute positioning
	 * 		
	 */
	initialSize: function(args){
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
		if(!args){
			return;
		}
		var widget = args.widget;
		var compoundCommand = args.compoundCommand;
		var modifyCommand = args.modifyCommand;
		if(!widget || !compoundCommand || !modifyCommand){
			return;
		}
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

});

});
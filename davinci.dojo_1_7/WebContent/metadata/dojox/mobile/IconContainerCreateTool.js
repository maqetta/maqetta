dojo.provide("davinci.libraries.dojo.dojox.mobile.IconContainerCreateTool");

dojo.require("davinci.ve.widget");
dojo.require("davinci.commands.CompoundCommand");
dojo.require("davinci.ve.commands.AddCommand");
dojo.require("davinci.ve.commands.MoveCommand");
dojo.require("davinci.ve.commands.ResizeCommand");
dojo.require("davinci.ve.tools.CreateTool");

/**
 * GitHub #801
 *  The Dojo parser first instantiates a Dijit and then instantiates its
 * children. However, currently, the Maqetta code instantiates the children
 * *first* and then the parent. This is a problem with IconContainer and its
 * children IconItem. During the rendering step, IconItem pulls in params
 * from its parent. However, when an IconContainer is first added to the page
 * in Maqetta, the code first instantiates IconItem, so it doesn't have a parent
 * and doesn't properly pull in the 'iconBase' param. This code fixes that by
 * first instantiating IconContainer and then its children IconItem.
 */

dojo.declare("davinci.libraries.dojo.dojox.mobile.IconContainerCreateTool", davinci.ve.tools.CreateTool, {

    _create: function(args) {
        var iconContainerData = this._data[0],
            childrenData = iconContainerData.children,
            context = this._context;

        // will deal with its children later
        delete iconContainerData.children;

        // load required resources for IconContainer and children
        var succeeded = childrenData.concat(iconContainerData).every(function(obj) {
            return context.loadRequires(obj.type, true);
        }, this);
        if (! succeeded) {
            return;
        }

        iconContainerData.context = context;
        var iconContainer,
            children = [];
        dojo.withDoc(context.getDocument(), function() {
            iconContainer = davinci.ve.widget.createWidget(iconContainerData);
            childrenData.forEach(function(child) {
                child.context = context;
                children.push(davinci.ve.widget.createWidget(child));
            });
        });
        if (! iconContainer) {
            return;
        }

        var command = new davinci.commands.CompoundCommand();

        // first add parent IconContainer...
        command.add(new davinci.ve.commands.AddCommand(iconContainer,
                args.parent, args.index));
        // ... followed by its children
        children.forEach(function(child, idx) {
            command.add(new davinci.ve.commands.AddCommand(child, iconContainer,
                    idx));
        });

        if (args.position) {
            command.add(new davinci.ve.commands.MoveCommand(iconContainer,
                    args.position.x, args.position.y));
        }
        if (args.size) {
            var w = args.size && args.size.w,
                h = args.size && args.size.h;
            command.add(new davinci.ve.commands.ResizeCommand(iconContainer, w, h));
        }
        context.getCommandStack().execute(command);
        this._select(iconContainer);
        return iconContainer;
    }

});

define(["dojo", "dijit"], function(dojo, dijit){
    return function(/*Array of widgets*/widgets, /*Object*/ models){
        dojo.forEach(widgets, function(item){
            //TODO need to find a better way to get all bindable widgets
            var bindWidgets = dojo.query("div[dojoType^=\"dojox.mvc\"],div[data-dojo-type^=\"dojox.mvc\"]", item.domNode);
            //set ref for each dojox.mvc widgets.
            dojo.forEach(bindWidgets, function(widget){
                //TODO need to find a better way to know which model the widget is bound to
                //currently, the ref attribute in dojox.mvc.Group cannot be empty, leave
                //explicit string with single quote in ref attribute.
                var ref = widget.getAttribute("ref");
                
                if(ref === null){
                    var refProps = widget.getAttribute("data-dojo-props");
                    if(refProps){
                        ref = refProps.replace(/^\s*ref\s*:\s*/, "");
                    }
                }
                
                if (ref) {
                    ref = ref.substring(1, ref.length-1);
                    var model = dojo.getObject(ref, false, models);
                    if (model){
                        dijit.byNode(widget).set("ref", model);
                    }                    
                }
            }, this);
        }, this);
        
    }
});

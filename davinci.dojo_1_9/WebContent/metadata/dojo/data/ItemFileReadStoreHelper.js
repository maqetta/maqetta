define([
	"dojo/_base/array",
	"davinci/html/HTMLElement",
	"davinci/html/HTMLText",
	"dojo/promise/all",
], function(
	array,
	HTMLElement,
	HTMLText,
	all
) {

var ItemFileReadStoreHelper = function() {};
ItemFileReadStoreHelper.prototype = {

	getData: function(/*Widget*/ widget, /*Object*/ options){
		if(!widget){
			return undefined;
		}

		var widgetData = widget._getData( options);
		var value = widget._srcElement.getAttribute('data');
		if (value){
			widgetData.properties.data = JSON.parse(value);
		} else {
			if (widget._srcElement.getAttribute('url')) {
				widgetData.properties.url = widget._srcElement.getAttribute('url'); 
			} else if (widget.properties) {
				widgetData.properties.url = widget.properties.url; // get url for undo from data
			} 
		}
		return widgetData;
	},
	
	preProcessData: function(data){
		// clean up the store items so that the store can be recreated if undo or redo
		if (data.properties.data){
			if (data.properties.data.items) {
				data.properties.data.items.forEach(function(item){
					delete item._0;
					delete item._RI;
					delete item._S;
					delete item._widgetId;
				});
			} else {
				var d = JSON.parse(data.properties.data);
				data.properties.data = d;
			}
		}
		return data;
	},
	
    preProcess: function(node, context){
        var url = node.getAttribute("url");
        if (!url){
            return;
        }
        url = url.trim();
        var xhrParams = this.getXhrScriptPluginParameters(url, context);
        if (xhrParams){
	      	var req = context.getGlobal()["require"];
	       	req(["dojo/data/ItemFileReadStore", "dojox/io/xhrScriptPlugin"], function(ItemFileReadStore, xhrScriptPlugin) {
	      	 	xhrScriptPlugin(xhrParams.url, xhrParams.callback);
	        });               
        }
    },

    _reXspAmd: /\brequire\(\["dojox\/io\/xhrScriptPlugin"\],function\(xhrScriptPlugin\){([\s\S]*?)}\);/,
    _reXsp: /xhrScriptPlugin\((?:.*?)\);/g,
    
    /**
     * Get the parameters passed to the dojox/io/xhrScriptPlugin function.  The
     * source can look like this:
     *
     *     require(['dojox/io/xhrScriptPlugin'], function(xhrScriptPlugin){
     *         xhrScriptPlugin("url1", "callback1");
     *         xhrScriptPlugin("url2", "callback2");
     *         ...
     *     });
     *
     * @param {String} url
     * @param {davinci.ve.Context} context
     */
    getXhrScriptPluginParameters: function(url, context) {
        if (!url) {
            return;// must be data
        }

        var head = context.getDocumentElement().getChildElement('head'),
            xhrParams;

        head.getChildElements('script').some(function(child) {
            var text = child.getElementText();
            if (text.length === 0) {
                return false;
            }

            var m = text.match(this._reXspAmd),
                n;
            if (m) {
                return m[1].match(this._reXsp).some(function(func) {
                    if (func.indexOf(url) !== -1) {
                        n = func.match(/\("(.*)",\s*"(.*)"\)/);
                        xhrParams = {
                            url: n[1],
                            callback: n[2]
                        };
                        return true;    // break 'some' loop
                    }
                });
            }
            return false;
        }, this);

        return xhrParams;
    },
    
    /**
     * Sets the source needed to call the dojox/io/xhrScriptPlugin function which
     * allows JSONP calls across domains.  Resulting source will look like this:
     *
     *     require(['dojox/io/xhrScriptPlugin'], function(xhrScriptPlugin){
     *         xhrScriptPlugin("url1", "callback1");
     *         xhrScriptPlugin("url2", "callback2");
     *         ...
     *     });
     *
     * @param {String} params
     *            Parameters that will get passed to xhrScriptPlugin(); in form
     *            of '"URL","CALLBACK_NAME"'.
     * @param {davinci.ve.Context} context
     */
    setXhrScriptPluginParameters: function(params, context) {
        var head = context.getDocumentElement().getChildElement('head'),
            elem,
            text;

        head.getChildElements('script').some(function(child) {
            text = child.getElementText();
            if (text.length === 0) {
                return false;
            }

            if (this._reXspAmd.test(text)) {
                elem = child;
                return true;    // break 'some' loop
            }
        }, this);

        // create a new script element
        if (!elem) {
            context.addHeaderScriptText([
                'require(["dojox/io/xhrScriptPlugin"],function(xhrScriptPlugin){\n',
                    '\txhrScriptPlugin(',
                        params,
                    ');\n',
                '});\n'
            ].join(''));
            return;
        }

        // add new URL, callback inside of `require` call
        var m = text.match(this._reXspAmd),
            funcs = m[1].match(this._reXsp);
        funcs.push([
            'xhrScriptPlugin(',
                params,
            ');'
        ].join(''));
        text = text.replace(this._reXspAmd,
            ['require(["dojox/io/xhrScriptPlugin"],function(xhrScriptPlugin){\n',
                '\t',
                funcs.join('\n\t'),
                '\n',
            '});'].join('')
        );

        elem.find({elementType: 'HTMLText'}, true).setText(text);
        elem.setScript(text);
    }
	
};

return ItemFileReadStoreHelper;

});

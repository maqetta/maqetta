(function () {

				        
    define(function () {
    
        text = {
            version: '0.24.0',

            strip: function (content) {
                //Strips <?xml ...?> declarations so that external SVG and XML
                //documents can be added to a document without worry. Also, if the string
                //is an HTML document, only the part inside the body tag is returned.
                if (content) {
                    content = content.replace(xmlRegExp, "");
                    var matches = content.match(bodyRegExp);
                    if (matches) {
                        content = matches[1];
                    }
                } else {
                    content = "";
                }
                return content;
            },

            jsEscape: function (content) {
                return content.replace(/(['\\])/g, '\\$1')
                    .replace(/[\f]/g, "\\f")
                    .replace(/[\b]/g, "\\b")
                    .replace(/[\n]/g, "\\n")
                    .replace(/[\t]/g, "\\t")
                    .replace(/[\r]/g, "\\r");
            },

            createXhr: function () {
               debugger;
            },

            get: function (url, callback) {
            	var content = dojo.cache("", name);
                callback(content);
            },

            load: function (name, req, onLoad, config) {
            	
               var content = dojo.cache("", name);
               onLoad(content);
               
            }
        };

        return text;
    });
}());

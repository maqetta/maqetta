package maqetta.zazl;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;

import org.apache.xerces.xni.Augmentations;
import org.apache.xerces.xni.QName;
import org.apache.xerces.xni.XMLAttributes;
import org.apache.xerces.xni.XMLLocator;
import org.apache.xerces.xni.XNIException;
import org.apache.xerces.xni.parser.XMLDocumentFilter;
import org.apache.xerces.xni.parser.XMLInputSource;
import org.cyberneko.html.HTMLConfiguration;
import org.cyberneko.html.filters.DefaultFilter;
import org.cyberneko.html.filters.Identity;
import org.cyberneko.html.filters.Writer;
import org.davinci.ajaxLibrary.Library;

public class HTMLParser extends DefaultFilter {
    private static final String AUGMENTATIONS = "http://cyberneko.org/html/features/augmentations";
    private static final String FILTERS = "http://cyberneko.org/html/properties/filters";
    private static final String SCRIPT_TYPE = "text/javascript";

	private HTMLConfiguration parser = null;
	private String encoding = null;
	private String scriptURL = null;
	private String dojoDefaultRoot = null;
	private String configScriptTag = null;

	public HTMLParser(java.io.Writer out, String encoding, Library dojoLib, String configScriptTag) {
		this.encoding = encoding;
		this.configScriptTag = configScriptTag;
		dojoDefaultRoot = dojoLib.getDefaultRoot().substring(1);
		parser = new HTMLConfiguration();
        parser.setFeature(AUGMENTATIONS, true);
        XMLDocumentFilter[] filters = { this, new Identity(), new HTMLWriter(out, this.encoding) };
        parser.setProperty(FILTERS, filters);
	}

    public void parse(String html) throws IOException {
        parser.parse(new XMLInputSource(null, "", null, new StringReader(html), encoding));
    }

    public void startDocument(XMLLocator locator, String encoding, Augmentations augs) throws XNIException {
    	super.startDocument(locator, encoding, augs);
    }
    
    public void startElement(QName element, XMLAttributes attrs, Augmentations augs) throws XNIException {
        if (element.rawname.equalsIgnoreCase("script") && attrs != null) {
            String value = attrs.getValue("type");
            if (value != null && value.equalsIgnoreCase(SCRIPT_TYPE)) {
            	String src = attrs.getValue("src");
            	if (src != null && src.equals(dojoDefaultRoot+"/dojo/dojo.js")) {
            		scriptURL = src;
            	}
            }
        }
    	super.startElement(element, attrs, augs);
    }
    
    public class HTMLWriter extends Writer {
    	PrintWriter pw = null;
    	
    	public HTMLWriter(java.io.Writer out, String encoding) {
    		super(out, encoding);
    	}
    	
        protected void printStartElement(QName element, XMLAttributes attrs) throws XNIException {
            if (element.rawname.equalsIgnoreCase("script") && attrs != null) {
                String value = attrs.getValue("type");
                if (value != null && value.equalsIgnoreCase(SCRIPT_TYPE)) {
                	String src = attrs.getValue("src");
                	if (src != null) {
                		if (scriptURL != null && scriptURL.equals(dojoDefaultRoot+"/dojo/dojo.js")) {
                			attrs.setValue(attrs.getIndex("src"), "lib/zazl/zazl.js");
                			attrs.removeAttributeAt(attrs.getIndex("data-dojo-config"));
                		}
                	}
        			super.printStartElement(element, attrs);
                } else {
                	super.printStartElement(element, attrs);
                }
            } else {
            	super.printStartElement(element, attrs);
            }
        }
        
        protected void printEndElement(QName element) throws XNIException {
        	super.printEndElement(element);
            if (element.rawname.equalsIgnoreCase("script")) {
        		if (scriptURL != null && scriptURL.equals(dojoDefaultRoot+"/dojo/dojo.js")) {
                	fPrinter.println();
        			fPrinter.println(configScriptTag);
        			scriptURL = null;
        		}
            }
        }
    }
}

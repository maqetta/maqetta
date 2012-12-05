package maqetta.zazl;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
import org.dojotoolkit.json.JSONParser;

public class HTMLParser extends DefaultFilter {
    private static final String AUGMENTATIONS = "http://cyberneko.org/html/features/augmentations";
    private static final String FILTERS = "http://cyberneko.org/html/properties/filters";
    private static final String SCRIPT_TYPE = "text/javascript";
    private static final String WS_WORKSPACE = "/ws/workspace";
    private static final Pattern packagesRegex = Pattern.compile("\'packages\':\\[(\\{\'name\':\'.+\',\'location\':\'.+\'\\})+\\]");

	private HTMLConfiguration parser = null;
	private String encoding = null;
	private String scriptURLPrefix = null;
	private String scriptURL = null;
	private String configScriptTag = null;
	private String dojoLoaderPath = null;
	private String zazlPath = null;

	public HTMLParser(java.io.Writer out, String encoding, String configScriptTag, String pathInfo) {
		String projectPath = pathInfo.substring(pathInfo.indexOf(WS_WORKSPACE)+WS_WORKSPACE.length());
		projectPath = projectPath.substring(0, projectPath.lastIndexOf('/'));
		int removeCount = projectPath.indexOf("WebContent") == -1 ? 1 : 2;
		boolean isReview = projectPath.indexOf("/.review") != -1;
		int segCount = isReview ? 0 : countSegments(projectPath) - removeCount;
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < segCount; i++) {
			sb.append("../");
		}
		sb.append("lib/zazl/zazl.js");
		zazlPath = sb.toString();
		this.encoding = encoding;
		this.configScriptTag = configScriptTag;
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
            	if (src != null && src.indexOf("/dojo/dojo.js") != -1) {
            		scriptURL = src;
            		scriptURLPrefix = scriptURL.substring(0, scriptURL.indexOf("/dojo/dojo.js"));
            		dojoLoaderPath = scriptURL.substring(0, scriptURL.lastIndexOf('/')+1);
            		configScriptTag = configScriptTag.replace("__URLPREFIX__", scriptURLPrefix);
            	}
            }
        }
    	super.startElement(element, attrs, augs);
    }

	private static String normalize(String path) {
		try {
			URI uri =  new URI(path);
			String normalized = uri.normalize().toString();
			return normalized;
		} catch (URISyntaxException e) {
			e.printStackTrace();
			return null;
		}
	}

	private static int countSegments(String path) {
		int count = 0;
		for (int i = 0; i < path.length(); i++) {
			if (path.charAt(i) == '/') {
				count++;
			}
		}
		return count;
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
                	if (src != null && src.equals(scriptURL)) {
            			attrs.setValue(attrs.getIndex("src"), zazlPath);
            			String dojoDataConfigStr = attrs.getValue(attrs.getIndex("data-dojo-config"));
	            		configScriptTag = configScriptTag.replace("__DOJOCONFIG__", "{"+dojoDataConfigStr+"}");
            			attrs.removeAttributeAt(attrs.getIndex("data-dojo-config"));
            			Matcher m = packagesRegex.matcher(dojoDataConfigStr);
            			if (m.find()) {
	            			String packagesString = m.group(0);
	            			if (packagesString != null) {
	            				StringBuffer sb = new StringBuffer();
	            				try {
									Map<String, Object> packages = (Map<String, Object>) JSONParser.parse(new StringReader('{'+packagesString+'}'));
									List<Map<String, Object>> packageList = (List<Map<String, Object>>)packages.get("packages");
									for (Map<String, Object> pkg : packageList) {
										String name = (String)pkg.get("name");
										if (name.equals("zazl")) {
											continue;
										}
										String location = (String)pkg.get("location");
										location = normalize(dojoLoaderPath+location);
										sb.append("		'");
										sb.append(name);
										sb.append("' : '");
										sb.append(location);
										sb.append("',\n");
									}
									sb.deleteCharAt(sb.length()-1);
									sb.deleteCharAt(sb.length()-1);
				            		configScriptTag = configScriptTag.replace("__PATHS__", sb.toString());
								} catch (IOException e) {
									e.printStackTrace();
								}
	            			}
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
        		if (scriptURL != null && scriptURL.indexOf("/dojo/dojo.js") != -1) {
                	fPrinter.println();
        			fPrinter.println(configScriptTag);
        			scriptURL = null;
        		}
            }
        }

        protected void printAttributeValue(String text) {
            int length = text.length();
            for (int j = 0; j < length; j++) {
                char c = text.charAt(j);
                switch (c) {
                	case '"':
                		fPrinter.print("&quot;");
                		break;
                	case '<':
                		fPrinter.print("&lt;");
                		break;
                	case '>':
                		fPrinter.print("&gt;");
                		break;
                	case '&':
                		fPrinter.print("&amp;");
                		break;
                	default:
                		fPrinter.print(c);
                }
            }
            fPrinter.flush();
        }
    }
}

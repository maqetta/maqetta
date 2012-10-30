package org.davinci.server.util;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

public abstract class XMLElement {

    protected abstract String getElementTag();
    
    protected abstract String[] getAttributeNames();
    
    protected abstract Object createObject(Element element, String[] attributeNames, String[] attributeValues);

    protected abstract String getAttributeValue(String attribute, Object object);
    
    protected void saveElementAddition(Element element, Object value) {
    }

    HashMap tags    = new HashMap();
    HashMap clazzes = new HashMap();

    public ArrayList load(Element parentElement) {
        ArrayList objects = new ArrayList();
        String elementTag = this.getElementTag();
        NodeList userElements = parentElement.getElementsByTagName(elementTag);
        for (int i = 0; i < userElements.getLength(); i++) {
            Element userElement = (Element) userElements.item(i);
            objects.add(this.loadElement(userElement));
        }
        return objects;
    }

    public Object loadElement(Element userElement) {
    	NamedNodeMap map = userElement.getAttributes();
        String[] attributeNames = new String[map.getLength()];
        String[] values = new String[attributeNames.length];
        for(int i=0;i< map.getLength();i++){
        	Node item = map.item(i);
        	attributeNames[i] = item.getNodeName();
        	values[i] = item.getNodeValue();
        }
        
        return this.createObject(userElement, attributeNames, values);
    }

    public ArrayList loadAny(Element parentElement) {
        ArrayList objects = new ArrayList();
        NodeList nodeList = parentElement.getChildNodes();
        for (int i = 0; i < nodeList.getLength(); i++) {
            Node item = nodeList.item(i);
            if (item.getNodeType() == Node.ELEMENT_NODE) {
                Element element = (Element) item;
                String name = element.getLocalName();
                XMLElement xmlElement = (XMLElement) this.tags.get(name);
                if (xmlElement != null) {
                    objects.add(xmlElement.loadElement(element));
                }
            }
        }
        return objects;
    }

    public void saveElement(Element parentElement, Object value) {
        String elementTag = this.getElementTag();
        
        String[] attributeNames = this.getAttributeNames();
        String[] attrValues = new String[attributeNames.length];
        
        for(int i=0;i<attributeNames.length;i++){
        	attrValues[i] = this.getAttributeValue(attributeNames[i], value);
        }
        
        Document document = parentElement.getOwnerDocument();
        
        Element element = document.createElement(elementTag);
        for (int i = 0; i < attrValues.length; i++) {
        	if(attrValues[i]!=null)
        		element.setAttribute(attributeNames[i], attrValues[i]);
        }
        parentElement.appendChild(element);
        this.saveElementAddition(element, value);
    }

    public void save(Element parentElement, Collection values) {
        Iterator iter = values.iterator();
        while (iter.hasNext()) {
            Object value = iter.next();
            this.saveElement(parentElement, value);
        }
    }

    public void saveAny(Element parentElement, Object[] values) {
        for (int i = 0; i < values.length; i++) {
            Object value = values[i];
            XMLElement element = (XMLElement) this.clazzes.get(value.getClass());
            if (element != null) {
                element.saveElement(parentElement, value);
            }
        }
    }

    public void addTag(XMLElement element, Class forClass) {
        this.tags.put(element.getElementTag(), element);
        this.clazzes.put(forClass, element);
    }
}

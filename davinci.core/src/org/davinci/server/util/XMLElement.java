package org.davinci.server.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.TransformerFactoryConfigurationError;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public abstract class XMLElement {
	

	
	protected abstract String getElementTag();
	
	protected abstract Object createObject(Element element, String [] attributes);
	
	protected abstract String [] getAttributeNames();
	
	protected abstract String [] getAttributeValues(Object object) ;
	
	protected void saveElementAddition(Element element, Object  value) {}
	
	HashMap tags=new HashMap();
	HashMap clazzes=new HashMap();
	
	public ArrayList load(Element parentElement)
	{
		ArrayList objects =new ArrayList();
		String elementTag=this.getElementTag();
		NodeList userElements = parentElement.getElementsByTagName(elementTag);
		for (int i = 0; i < userElements.getLength(); i++) {
			Element userElement = (Element) userElements.item(i);
			objects.add(this.loadElement(userElement));
		}
		return objects;
	}
	
	public Object loadElement(Element userElement)
	{
		String[] attributeNames=this.getAttributeNames();
			String[] values = new String[attributeNames.length];
			for (int j = 0; j < values.length; j++) {
				values[j] = userElement.getAttribute(attributeNames[j]);
			}
			return this.createObject(userElement,values);
	}
	
	public ArrayList loadAny(Element parentElement)
	{
		ArrayList objects =new ArrayList();
		NodeList nodeList=parentElement.getChildNodes();
		for (int i=0;i<nodeList.getLength();i++)
		{
			Node item = nodeList.item(i);
			if (item.getNodeType()==Node.ELEMENT_NODE)
			{
				Element element=(Element)item;
				String name=element.getLocalName();
				XMLElement xmlElement=(XMLElement)this.tags.get(name);
				if (xmlElement!=null)
				{
					objects.add(xmlElement.loadElement(element));
				}
			}
		}
		return objects;
	}
	
	
	public void saveElement(Element parentElement, Object  value)
	{
		String elementTag=this.getElementTag();
		String[] attributeNames = this.getAttributeNames();
		Document document=parentElement.getOwnerDocument();
		String [] attrValues=this.getAttributeValues(value);
		Element element= document.createElement(elementTag);
		for (int i = 0; i < attrValues.length; i++) {
			element.setAttribute(attributeNames[i], attrValues[i]);
		}
		parentElement.appendChild(element);
		this.saveElementAddition(element, value);
	}
	
	public void save(Element parentElement, Collection  values)
	{
		Iterator iter= values.iterator();
		while (iter.hasNext()) {
			Object value= iter.next();
			this.saveElement(parentElement, value);
		}
	}
	
	public void saveAny(Element parentElement, Object []  values)
	{
		for (int i=0;i<values.length; i++) {
			Object value= values[i];
			XMLElement element= (XMLElement) this.clazzes.get(value.getClass());
			if (element!=null)
				element.saveElement(parentElement, value);
		}
	}



	public void addTag(XMLElement element, Class forClass)
	{
		this.tags.put(element.getElementTag(), element);
		this.clazzes.put(forClass, element);
	}
}

package org.maqetta.project.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URL;
import java.util.Hashtable;

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
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.davinci.server.internal.Activator;
import org.osgi.framework.Bundle;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class EclipseProjectUtil {
	/* utilities for creating the XML files needed in an eclipse project */
	
	public static String PROJECT_FILE = ".project";
	
	
	
	public static Hashtable getEclipseConfig(String projectName){
		Hashtable config = new Hashtable();
		try{
		config.put(EclipseProjectUtil.PROJECT_FILE, EclipseProjectUtil.getProjectFile(projectName));
		config.put(".settings/.jsdtscope", EclipseProjectUtil.getJsdtScope());
		config.put(".settings/org.eclipse.wst.common.component", EclipseProjectUtil.getCommonComponent(projectName));
		config.put(".settings/org.eclipse.wst.common.project.facet.core.xml", EclipseProjectUtil.getCommonProjectFacetCore());
		config.put(".settings/org.eclipse.wst.jsdt.ui.superType.container", EclipseProjectUtil.getJsdtSuperTypeContainer());
		config.put(".settings/org.eclipse.wst.jsdt.ui.superType.name", EclipseProjectUtil.getJsdtSuperTypeName());
		config.put(".settings/com.ibm.etools.webtools.dojo.core.prefs", EclipseProjectUtil.readFile(".settings/com.ibm.etools.webtools.dojo.core.prefs"));
		config.put(".settings/org.eclipse.wst.validation.prefs", EclipseProjectUtil.readFile(".settings/org.eclipse.wst.validation.prefs"));
		
		}catch(Exception ex){
			System.out.println(ex);
		}
		return config;
	}

	
	private static String getProjectFile(String name){
		String text = EclipseProjectUtil.readFile(".project");
		return setXML(text, "projectDescription/name",  name);
	}
	
	private static String getJsdtScope(){
		return EclipseProjectUtil.readFile(".settings/.jsdtscope");
		
	}
	
	private static String getCommonComponent(String name){
		String text = EclipseProjectUtil.readFile(".settings/org.eclipse.wst.common.component");
		text = setXML(text, "/project-modules/wb-module", "deploy-name", name);
		text = setXML(text, "/project-modules/wb-module/property[@name='context-root']", "value", name);
		return text;
	}
	
	private static String getCommonProjectFacetCore(){
		String text = EclipseProjectUtil.readFile(".settings/org.eclipse.wst.common.project.facet.core.xml");
		return text;
	}
	
	private static String getJsdtSuperTypeContainer(){
		String text = EclipseProjectUtil.readFile(".settings/org.eclipse.wst.jsdt.ui.superType.container");
		return text;
	}
	
	private static String getJsdtSuperTypeName(){
		String text = EclipseProjectUtil.readFile(".settings/org.eclipse.wst.jsdt.ui.superType.name");
		return text;
	}
	
	private static String getValidatorPrefs(){
		String text = EclipseProjectUtil.readFile(".settings/org.eclipse.wst.validation.prefs");
		return text;
	}
	
	private static String readFile(String name){
		   Bundle bundle = Activator.getActivator().getBundle();
		   URL file = bundle.getEntry("/WebContent/project/eclipse/" + name);
		   String result = "";
		   try {
			    BufferedReader in = new BufferedReader(new InputStreamReader(file.openStream()));
			    String str;
			    while ((str = in.readLine()) != null) {
			        // str is one line of text; readLine() strips the newline character(s)
			    	result+= str + "\n";
			    }
			    in.close();
			
			} catch (IOException e) {
			}
		   
		   return result;
	}
	
	
	/* sets the tag found by an xpath command to the given value */
	
	public static String setXML(String xml, String xpathString,  String value)  {
		return setXML(xml, xpathString, null, value) ; 
	}

	/*
	 * sets xml values in an xml text
	 * 
	 * The xpath is the node to find.  it an attribute name is given, then the selected tags attribute is set to the value
	 * if no attribute name is given, the text content of the tag is set to the given value.
	 * 
	 */
	
	
	public static String setXML(String xml, String xpathString, String attributeName, String value)  {

		StringReader reader = new StringReader(xml);
		Document doc = null;
		try {
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			factory.setNamespaceAware(true);
			DocumentBuilder parser = factory.newDocumentBuilder();
			
			doc = parser.parse(new InputSource(reader));
		} catch (SAXException e) {
			System.out.println("error parsing xml: " + e);
		} catch (ParserConfigurationException e) {
			System.out.println("error parsing xml: " + e);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			reader.close();
		}
		XPathFactory xpFactory = XPathFactory.newInstance();
		XPath xpath = xpFactory.newXPath();
		XPathExpression expr =null;
		try {
			expr = xpath.compile(xpathString);
		} catch (XPathExpressionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		Element result = null;
		try {
			Object qt = expr.evaluate(doc, XPathConstants.NODE);
			result = (Element)qt;
		} catch (XPathExpressionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
		if(attributeName!=null)
			result.setAttribute(attributeName, value);
		else
			result.setTextContent(value);
		
		
		
		Transformer transformer = null;
		try {
			transformer = TransformerFactory.newInstance().newTransformer();
		} catch (TransformerConfigurationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (TransformerFactoryConfigurationError e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		transformer.setOutputProperty(OutputKeys.INDENT, "yes");

		//initialize StreamResult with File object to save to file
		StreamResult resultT = new StreamResult(new StringWriter());
		DOMSource source = new DOMSource(doc);
		try {
			transformer.transform(source, resultT);
		} catch (TransformerException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		String xmlString = resultT.getWriter().toString();
		return xmlString;
	}

	
}

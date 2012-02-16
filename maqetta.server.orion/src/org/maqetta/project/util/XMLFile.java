package org.maqetta.project.util;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;

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

import org.davinci.server.util.XMLElement;
import org.eclipse.core.filesystem.EFS;
import org.eclipse.core.filesystem.IFileStore;
import org.eclipse.core.runtime.CoreException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

public abstract class XMLFile extends XMLElement {

    protected abstract String getRootTag();

    public ArrayList load(IFileStore file) { //FIXME should throw?
        ArrayList objects = null;
        InputStream input = null;
        if (file.fetchInfo().exists()) {
            try {
                DocumentBuilder parser = DocumentBuilderFactory.newInstance().newDocumentBuilder();
                try {
					input = new BufferedInputStream(file.openInputStream(EFS.NONE, null));
				} catch (CoreException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
                Document document = parser.parse(input);
                Element rootElement = document.getDocumentElement();
                objects = this.load(rootElement);
            } catch (ParserConfigurationException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } catch (SAXException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } finally {
                try {
                    if (input != null) {
                        input.close();
                    }
                } catch (IOException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            }
        }
        if (objects == null) {
            objects = new ArrayList();
        }
        return objects;
    }

    public void save(IFileStore file, Collection values) { //FIXME should throw?
        OutputStream out = null;
        try {
        	/*
            if (!file.fetchInfo().exists()) {
                file.;
                file.delete();
                file.createNewFile();

            }
            */
            String rootName = this.getRootTag();
            try {
				out = new BufferedOutputStream(file.openOutputStream(EFS.NONE, null));
			} catch (CoreException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.newDocument();

            Element rootElement = document.createElement(rootName);
            document.appendChild(rootElement);

            this.save(rootElement, values);

            Transformer transformer = TransformerFactory.newInstance().newTransformer();
            transformer.setOutputProperty(OutputKeys.METHOD, "xml"); //$NON-NLS-1$
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8"); //$NON-NLS-1$
            transformer.setOutputProperty(OutputKeys.INDENT, "yes"); //$NON-NLS-1$
            DOMSource source = new DOMSource(document);
            StreamResult result = new StreamResult(out);

            transformer.transform(source, result);
        } catch (TransformerFactoryConfigurationError e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (ParserConfigurationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (TransformerConfigurationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (TransformerException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } finally {
            try {
                if (out != null) {
                    out.close();
                }
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
    }

}

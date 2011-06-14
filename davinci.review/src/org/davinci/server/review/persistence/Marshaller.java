package org.davinci.server.review.persistence;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Result;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.TransformerFactoryConfigurationError;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.davinci.server.review.Comment;
import org.davinci.server.review.Constants;
import org.davinci.server.review.DavinciProject;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

/**
 *
 * Transform a JAVA object into a XML document.
 *
 */
public class Marshaller extends DefaultHandler {
	private DavinciProject project;

	// private volatile static long nextCommentIdNano;

	public Marshaller(DavinciProject project) {
		this.project = project;
	}

	public DavinciProject getProject() {
		return project;
	}

	public void setProject(DavinciProject project) {
		this.project = project;
	}

	/*
	 * private synchronized static long generateCommentId() { return System.currentTimeMillis() +
	 * (nextCommentIdNano++); }
	 */

	public Document marshall(boolean append) throws ParserConfigurationException, IOException,
			TransformerConfigurationException, TransformerFactoryConfigurationError {

		Marshaller.addComments(project.getCommentsDocument().getCommentList(), append);

		return null;
	}

	public static void addComments(List<Comment> commentList, boolean append)
			throws ParserConfigurationException, IOException, TransformerConfigurationException,
			TransformerFactoryConfigurationError {
		if (null == commentList || commentList.isEmpty())
			return;

		// Cache the DOM document, since comments may be from different project,
		// with this cache, XML files need not to be loaded multiple times.
		Map<String, StringBuffer> xmlFragmentMap = new HashMap<String, StringBuffer>();
		DavinciProject prj;
		StringBuffer xmlFragment;
		DocumentBuilderFactory builderFactory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = builderFactory.newDocumentBuilder();
		Document doc = builder.newDocument();
		Source source = null;
		OutputStream os = null;
		Result result = null;
		Transformer xformer = TransformerFactory.newInstance().newTransformer();
		xformer.setOutputProperty(OutputKeys.METHOD, "xml"); //$NON-NLS-1$
		xformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8"); //$NON-NLS-1$
		xformer.setOutputProperty(OutputKeys.INDENT, "yes"); //$NON-NLS-1$

		for (Comment comm : commentList) {
			prj = comm.getProject();
			if (null == prj)
				continue;
			xmlFragment = xmlFragmentMap.get(prj.getCommentFilePath());
			if (null == xmlFragment) {
				xmlFragment = new StringBuffer();
				xmlFragmentMap.put(prj.getCommentFilePath(), xmlFragment);
			}

			try {
				source = new DOMSource(createCommentElem(comm, doc));
				os = new ByteArrayOutputStream();
				result = new StreamResult(os);
				xformer.transform(source, result);
				xmlFragment.append(os.toString());
			} catch (TransformerException e) {
				e.printStackTrace();
			} finally {
				if (os != null)
					os.close();
			}
		}

		Set<Entry<String, StringBuffer>> entrySet = xmlFragmentMap.entrySet();
		for (Entry<String, StringBuffer> entry : entrySet) {
			persist(entry.getValue().toString(), entry.getKey(), append);
		}
	}

	protected static Element createCommentElem(Comment comm, Document doc) {
		Element commentElem;
		Element elem;
		SimpleDateFormat sdf = new SimpleDateFormat(Constants.DATE_PATTERN);

		commentElem = doc.createElement("Comment");
		elem = doc.createElement(Comment.ID);
		setValue(elem, doc, comm.getId());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.REPLY_TO);
		setValue(elem, doc, comm.getReplyTo());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.EMAIL);
		setValue(elem, doc, comm.getEmail());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.OWNER_ID);
		setValue(elem, doc, comm.getOwnerId());
		commentElem.appendChild(elem);

//		elem = doc.createElement(Comment.ORDER);
//		setValue(elem, doc, Float.toString(comm.getOrder()));
//		commentElem.appendChild(elem);

//		elem = doc.createElement(Comment.DEPTH);
//		setValue(elem, doc, Short.toString(comm.getDepth()));
//		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.PAGE_NAME);
		setValue(elem, doc, comm.getPageName());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.PAGE_STATE);
		setValue(elem, doc, comm.getPageState());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.SUBJECT);
		setValue(elem, doc, comm.getSubject());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.CONTENT);
		setValue(elem, doc, comm.getContent());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.CREATED);
		setValue(elem, doc, sdf.format(comm.getCreated()));
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.DRAWING_JSON);
		setValue(elem, doc, comm.getDrawingJson());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.SEVERITY);
		setValue(elem, doc, comm.getSeverity());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.TYPE);
		setValue(elem, doc, comm.getType());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.STATUS);
		setValue(elem, doc, comm.getStatus());
		commentElem.appendChild(elem);

		return commentElem;
	}

	protected static void persist(String content, String filePath, boolean append)
			throws IOException {
		// Remove string like <?xml version="1.0" encoding="UTF-8"?>
		// Pattern p = Pattern.compile("(<Comment\\W.*?</Comment>)");
		// Matcher m = p.matcher(content);
		File f = new File(filePath);
		File parent = f.getParentFile();
		if (!parent.exists())
			parent.mkdirs();
		if (!f.exists())
			f.createNewFile();

		RandomAccessFile raf = null;
		try {
			raf = new RandomAccessFile(f, "rw");
			if (!append)
				raf.setLength(0);
			byte[] buffer = new byte[1024];
			raf.read(buffer);
			String leadingString = new String(buffer).trim();
			Pattern p = Pattern.compile("(<\\?xml\\W.*?\\?>)");
			Matcher m = p.matcher(leadingString);
			String xmlMeta = ""; // Store the xml version meta data, used to insert to the xml file
									// if needed.
			if (m.find()) {
				xmlMeta = m.group();
			}
			leadingString = m.replaceAll("");
			leadingString = leadingString.substring(0,
					Math.min(leadingString.length(), "<CommentsDocument />".length())).replaceAll(
					"\\s", "");

			StringBuilder sb = new StringBuilder();
			content = content.replaceAll(p.pattern(), "");
			if (leadingString.startsWith("<CommentsDocument/>") || "".equals(leadingString)) {
				// There is no comments yet.
				raf.setLength(0);
				sb.append(xmlMeta);
				sb.append("<CommentsDocument>");
				sb.append(content);
				sb.append("</CommentsDocument>");
				raf.write(sb.toString().getBytes());
			} else if (leadingString.startsWith("<CommentsDocument>")) {
				// There are some comments and append new comments.
				long fileLen = raf.length() - "</CommentsDocument>".getBytes().length;
				raf.setLength(fileLen);
				raf.seek(raf.length());
				sb.append(content);
				sb.append("</CommentsDocument>");
				raf.write(sb.toString().getBytes());
			}
		} finally {
			if (raf != null)
				raf.close();
		}

	}

	protected static void setValue(Node node, Document doc, String value) {
		if (null == node || node.getNodeType() != Node.ELEMENT_NODE)
			return;
		else {
			Node child = doc.createTextNode(escapeXml(value));
			node.appendChild(child);
		}
	}

	public static String escapeXml(String content) {
		if (null == content || content.length() == 0)
			return "";

		int len = content.length();
		StringBuffer str = new StringBuffer();
		char ch;
		for (int i = 0; i < len; i++) {
			ch = content.charAt(i);
			switch (ch) {
			case '<':
				str.append("&lt;");
				break;
			case '>':
				str.append("&gt;");
				break;
			case '&':
				str.append("&amp;");
				break;
			case '"':
				str.append("&quot;");
				break;
			case '\'':
				str.append("&apos;");
				break;
			case '/':
				str.append("%2F");
				break;
			default:
				str.append(ch);
			}
		}
		return str.toString();
	}

	/**
	 * Unit Test Driver
	 *
	 * @param args
	 * @throws ParserConfigurationException
	 * @throws SAXException
	 * @throws IOException
	 * @throws TransformerConfigurationException
	 * @throws TransformerFactoryConfigurationError
	 */
	public static void main(String[] args) throws ParserConfigurationException, SAXException,
			IOException, TransformerConfigurationException, TransformerFactoryConfigurationError {

	}
}

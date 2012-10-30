package org.davinci.server.review.persistence;

import java.io.IOException;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;
import java.util.SimpleTimeZone;

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

import org.davinci.server.review.Comment;
import org.davinci.server.review.CommentsDocument;
import org.davinci.server.review.Constants;
import org.davinci.server.user.IDavinciProject;
import org.maqetta.server.IStorage;
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
	private IDavinciProject project;

	// private volatile static long nextCommentIdNano;

	public Marshaller(IDavinciProject project) {
		this.project = project;
	}

	public IDavinciProject getProject() {
		return project;
	}

	public void setProject(IDavinciProject project) {
		this.project = project;
	}

	/*
	 * private synchronized static long generateCommentId() { return System.currentTimeMillis() +
	 * (nextCommentIdNano++); }
	 */

	public Document marshall(boolean append) throws ParserConfigurationException, IOException,
			TransformerConfigurationException, TransformerFactoryConfigurationError {

		persistComments(project.getCommentsDocument(), project.getCommentsFileStorage());

		return null;
	}

	public void persistComments(CommentsDocument commentsDocument, IStorage commentsStorage)
			throws ParserConfigurationException, IOException, TransformerConfigurationException,
			TransformerFactoryConfigurationError {
		List<Comment> commentList = commentsDocument.getCommentList();
		if (null == commentList || commentList.isEmpty()) {
			return;
		}
		
		OutputStream out = null;
		try {
			if (!commentsStorage.exists())
				try {
					commentsStorage.createNewFile();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					return;
				}

			try {
				out = commentsStorage.getOutputStream();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return;
			}
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder builder = factory.newDocumentBuilder();
			Document document = builder.newDocument();

			Element rootElement = document.createElement("CommentsDocument");
			document.appendChild(rootElement);
		
			for (Comment comm : commentList) {
				Element commentElement = createCommentElem(comm, document);
				rootElement.appendChild(commentElement);
			}

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

	private Element createCommentElem(Comment comm, Document doc) {
		Element commentElem;
		Element elem;
		
		SimpleDateFormat sdf = new SimpleDateFormat(Constants.DATE_PATTERN);
		sdf.setCalendar(Calendar.getInstance(new SimpleTimeZone(0, "GMT")));

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
		
		elem = doc.createElement(Comment.DESIGNER_ID);
		setValue(elem, doc, comm.getDesignerId());
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

		elem = doc.createElement(Comment.PAGE_STATE_LIST);
		setValue(elem, doc, comm.getPageStateList());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.VIEW_SCENE);
		setValue(elem, doc, comm.getViewScene());
		commentElem.appendChild(elem);

		elem = doc.createElement(Comment.VIEW_SCENE_LIST);
		setValue(elem, doc, comm.getViewSceneList());
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

		return commentElem;
	}

	private void setValue(Node node, Document doc, String value) {
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

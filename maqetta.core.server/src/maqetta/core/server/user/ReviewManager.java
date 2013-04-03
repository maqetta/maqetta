package maqetta.core.server.user;


import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

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

import org.davinci.server.review.Constants;
import org.davinci.server.review.ReviewerVersion;
import org.davinci.server.review.Version;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.review.user.IReviewManager;
import org.davinci.server.review.user.Reviewer;
import org.davinci.server.user.IUser;
import org.davinci.server.user.UserException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IStorage;
import org.maqetta.server.ServerManager;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class ReviewManager implements IReviewManager {
//	private static final String LS = System.getProperty("line.separator");
	private static ReviewManager theReviewManager;
//	private HashMap<IDavinciProject, HashMap<String, ILibInfo[]>> snapshotLibs;
	public IStorage baseDirectory;
	
	public static ReviewManager getReviewManager()
	{
		if (theReviewManager==null) {
			theReviewManager=new ReviewManager();
			
			// Start the ReviewCacheManager thread. This has previously been started in the service
			// function of DavinciReviewServlet.
			if ( !ReviewCacheManager.$.isAlive() ) {
				ReviewCacheManager.$.start();
			}
		}
		return theReviewManager;
	}

	Map<String, IDesignerUser> designerUsers = Collections.synchronizedMap(new HashMap<String, IDesignerUser>());
	Map<String, Reviewer> reviewers = Collections.synchronizedMap(new HashMap<String, Reviewer>());
	
	public ReviewManager() {
		baseDirectory = ServerManager.getServerManager().getBaseDirectory();
	}

	public void saveDraft(IDesignerUser user, Version version) throws IOException {
		IStorage commentingDir = user.getCommentingDirectory();
		if (!commentingDir.exists()) {
			commentingDir.mkdir();
			(commentingDir.newInstance(commentingDir, "snapshot")).mkdir();
		}
		saveVersionFile(user);
	}

	public void publish(IDesignerUser user, Version version) throws IOException {
		IStorage commentingDir = user.getCommentingDirectory();
		if (!commentingDir.exists()) {
			commentingDir.mkdir();
			(commentingDir.newInstance(commentingDir, "snapshot")).mkdir();
		}

		initVersionDir(user, version.getTime());
		saveVersionFile(user);
		
		//Persist review information
		this.saveReviewerVersionFiles(version);
		
		//Rebuild workspace
		user.rebuildWorkspace();
	}
	
	/****************************************************/
	
	private void saveReviewerVersionFiles(Version version) throws IOException {
		List<Reviewer> reviewers = version.getReviewers();
		for (Reviewer reviewer : reviewers) {
			this.saveReviewerVersionFile(reviewer);
		}
	}
	
	private void saveReviewerVersionFile(Reviewer reviewer) throws IOException {
		IStorage versionFile = getReviewerVersionFile(reviewer);
		ReviewerVersionFile file = new ReviewerVersionFile();
		file.save(versionFile, reviewer);
	}
	
	private IStorage getReviewerVersionFile(Reviewer reviewer) throws IOException {
		IStorage versionFile = baseDirectory.newInstance(getReviewerVersionDirectory(), this.buildBaseFileForFromReviewer(reviewer)); 
		return versionFile;
	}
	
	private String buildBaseFileForFromReviewer(Reviewer reviewer) {
		String fileName = reviewer.getEmail() + ".xml";
		return fileName;
	}
	
	private IStorage getReviewerVersionDirectory() throws IOException {
		//Init the directory to hold version info for all of the reviewers and return it
		IStorage reviewerVersionsDirectory = baseDirectory.newInstance(baseDirectory, Constants.REVIEW_DIRECTORY_NAME);
		if (!reviewerVersionsDirectory.exists()) {
			reviewerVersionsDirectory.mkdir();
		}
		return reviewerVersionsDirectory;
	}
	/**************************************************/
	

	public void saveVersionFile(IDesignerUser user) throws IOException {
		IStorage commentingDir = user.getCommentingDirectory();
		IStorage versionFile = commentingDir.newInstance(commentingDir, "snapshot/versions.xml");
		VersionFile file = new VersionFile();
		file.save(versionFile, user);
	}

	private void initVersionDir(IDesignerUser user, String timeStamp) throws IOException {
		IStorage commentingDir = user.getCommentingDirectory();
		IStorage versionDir = commentingDir.newInstance(commentingDir, "snapshot/" + timeStamp);
		if(versionDir.exists()) {
			return;
		}
		versionDir.mkdir();

		IStorage userDir = user.getUserDirectory();
		IStorage[] files = userDir.listFiles();
		for (int i = 0; i < files.length; i++) {
			String path = files[i].getAbsolutePath();
			if (files[i].isFile()
					&& path.indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION) < 0) {
				IStorage destination = versionDir.newInstance(files[i].getName());
				copyFile(files[i], destination);
			} else if (files[i].isDirectory()
//					&& path.indexOf(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME) < 0  // Need to copy the settings
					&& path.indexOf(IDavinciServerConstants.DOWNLOAD_DIRECTORY_NAME) < 0
					&& path.indexOf(Constants.REVIEW_DIRECTORY_NAME) < 0
					&& path.indexOf(".svn") < 0
					&& containsPublishedFiles(files[i], user, timeStamp)) {
				IStorage destination = versionDir.newInstance(versionDir, files[i].getName());
				copyDirectory(files[i], destination);
			}
		}
	}

	private void copyDirectory(IStorage sourceDir, IStorage destinationDir) throws IOException {
		destinationDir.mkdirs();
		IStorage[] file = sourceDir.listFiles();
		for (int i = 0; i < file.length; i++) {
			if (file[i].isFile()) {
				IStorage sourceFile = file[i];

				IStorage targetFile = destinationDir.newInstance(destinationDir, file[i].getName());
				copyFile(sourceFile, targetFile);
			}

			if (file[i].isDirectory()) {
				IStorage destination = destinationDir.newInstance(destinationDir, file[i].getName());
				copyDirectory(file[i], destination);
			}
		}
	}

	private void copyFile(IStorage source, IStorage destination) throws IOException {
		InputStream in = null;
		OutputStream out = null;
		try {
			destination.getParentFile().mkdirs();
			in = source.getInputStream();
			out = destination.getOutputStream();
			byte[] buf = new byte[1024];
			int len;
			while ((len = in.read(buf)) > 0) {
				out.write(buf, 0, len);
			}
		} finally {
			if (in != null) {
				in.close();
			}
			if (out != null) {
				out.close();
			}
		}
	}

	public IDesignerUser getDesignerUser(IUser user) throws IOException {
		String name = user.getUserID();
		IDesignerUser designer = designerUsers.get(name);
		if (null == designer) {
			designer = loadDesignerUser(user);
			designerUsers.put(name, designer);
		}else{
			//Update the raw user
			designer.setRawUser(user);
		}
		return designer;
	}
	
	public IDesignerUser getDesignerUser(String name) throws IOException {
		IDesignerUser designer = designerUsers.get(name);
		if (designer == null) {
			IUser user;
			try {
				user = ServerManager.getServerManager().getUserManager().getUser(name);
			} catch (UserException e) {
				throw new RuntimeException(e);
			}
			
			if(user==null) return null;
			designer = getDesignerUser(user);
		}
		return designer;
	}
	
	public Reviewer getReviewer(String email) throws IOException {
		return getReviewer(null, email);
	}
	
	public Reviewer getReviewer(String name, String email) throws IOException {
		Reviewer reviewer = reviewers.get(email);
		if (null == reviewer) {
			reviewer = loadReviewer(name, email);
		}
		return reviewer;
	}

	public Reviewer isValid(String name, String id, String versionTime) {
		IDesignerUser user;
		try {
			user = getDesignerUser(name);
		} catch (IOException e) {
			e.printStackTrace(); //TODO
			return null;
		}
		if (versionTime == null) {
			if (user.getLatestVersion() != null) {
				versionTime = user.getLatestVersion().getTime();
			}
		}
		if (versionTime == null) {
			return null;
		}
		List<Version> versionList = user.getVersions();
		for (Version version : versionList) {
			if (version.getTime().equals(versionTime)) {
				List<Reviewer> reviewers = version.getReviewers();
				for (Reviewer reviewer : reviewers) {
					if (reviewer.getEmail().equals(id)) {
						return reviewer;
					}
				}
			}
		}
		return null;
	}

	private IDesignerUser loadDesignerUser(IUser user) throws IOException {
		//Create the designer user
		IDesignerUser designerUser = new DesignerUser(user);

		//Initialize the latest version
		IStorage commentingDir = designerUser.getCommentingDirectory();
		IStorage versionFile = commentingDir.newInstance(commentingDir, "snapshot/versions.xml");
		if (versionFile.exists()) {
			VersionFile file = new VersionFile();
			List<Version> versions = file.load(versionFile);
			for (Version version : versions) {
				designerUser.addVersion(version);
				if (file.latestVersionID != null
						&& version.getVersionID().equals(file.latestVersionID)) {
					designerUser.setLatestVersion(version);
				}
			}
		}
		
		return designerUser;
	}
	
	private Reviewer loadReviewer(String name, String email) throws IOException {
		Reviewer reviewer = new Reviewer(name, email);
		IStorage versionFile = getReviewerVersionFile(reviewer);
		if (versionFile.exists()) {
			ReviewerVersionFile file = new ReviewerVersionFile();
			List<ReviewerVersion> versions = file.load(versionFile);
			for (ReviewerVersion version : versions) {
				reviewer.addReviewerVersion(version);
			}
		}
		reviewers.put(email, reviewer);
		return reviewer;
	}

	private boolean containsPublishedFiles(IStorage dir, IDesignerUser user, String timeStamp){
		for(Version version : user.getVersions()){
			if(!version.getTime().equals(timeStamp)) continue;
			for(String res : version.resources){
				IPath resPath = new Path(res);
				while(resPath.segment(0).equals(".")) resPath = resPath.removeFirstSegments(1);
				if(dir.getName().equals(resPath.segment(0))){
					return true;
				}
			}
		}
		return false;
	}

	public String getReviewUrl(String designerId, String version, String requestUrl, Boolean zazl) {
		String prefix = requestUrl.substring(0, requestUrl.indexOf("/cmd/"));
		String suffix = "?"
				+ IDavinciServerConstants.REVIEW_DESIGNER_ATTR + "="
				+ designerId /* FIXME: encode? */ + "&"
				+ IDavinciServerConstants.REVIEW_VERSION_ATTR + "=" + version;
		if (zazl) {
			suffix += "&zazl=true";
		}
		return prefix + suffix;
	}

	private class VersionFile {
		public String latestVersionID;

		public void save(IStorage file, IDesignerUser user) throws IOException {
			OutputStream out = null;
			try {
				if (!file.exists()) {
					file.createNewFile();
				}
				out = file.getOutputStream();
				DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
				DocumentBuilder builder = factory.newDocumentBuilder();
				Document document = builder.newDocument();

				Element rootElement = document.createElement("user");
				document.appendChild(rootElement);

				Element latestVersionElement = document.createElement("latestVersion");
				latestVersionElement.setAttribute("id", user.getLatestVersion().getVersionID());
				latestVersionElement.setAttribute("title", user.getLatestVersion()
						.getVersionTitle());
				latestVersionElement.setAttribute("time", user.getLatestVersion().getTime());

				rootElement.appendChild(latestVersionElement);

				for (Version version : user.getVersions()) {
					Element element = document.createElement("version");
					element.setAttribute("id", version.getVersionID());
					element.setAttribute("title", version.getVersionTitle());
					element.setAttribute("time", version.getTime());
					element.setAttribute("isDraft", version.isDraft()?"true":"false");
					element.setAttribute("dueDate", version.dueDateString());
					element.setAttribute("desireWidth", version.getDesireWidth()+"");
					element.setAttribute("desireHeight", version.getDesireHeight()+"");
					element.setAttribute("hasClosedManually", Boolean.toString(version.isHasClosedManually()));
					element.setAttribute("restartFrom", version.getRestartFrom());
					element.setAttribute("description", version.getDescription());
					element.setAttribute("receiveEmail", version.isReceiveEmail()?"true":"false");
					element.setAttribute("hasRestarted", version.isHasRestarted()?"true":"false");
					for (Reviewer reviewer : version.getReviewers()) {
						Element reviewerElement = document.createElement("reviewer");
						reviewerElement.setAttribute("name", reviewer.getUserID());
						reviewerElement.setAttribute("email", reviewer.getEmail());

						element.appendChild(reviewerElement);
					}
					for (String resource : version.resources) {
						Element resourceElement = document.createElement("resource");
						resourceElement.setAttribute("path", resource);
						element.appendChild(resourceElement);
					}
					rootElement.appendChild(element);
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
				if (out != null) {
					out.close();
				}
			}
		}

		public List<Version> load(IStorage file) throws IOException {
			ArrayList<Version> objects = new ArrayList<Version>();
			InputStream input = null;
			if (file.exists()) {
				try {
					DocumentBuilder parser = DocumentBuilderFactory.newInstance()
							.newDocumentBuilder();
					input = file.getInputStream();
					Document document = parser.parse(input);
					Element rootElement = document.getDocumentElement();
					NodeList latestVersion = rootElement.getElementsByTagName("latestVersion");
					latestVersionID = ((Element) latestVersion.item(0)).getAttribute("id");
					NodeList versionElements = rootElement.getElementsByTagName("version");
					for (int i = 0; i < versionElements.getLength(); i++) {
						Element versionElement = (Element) versionElements.item(i);

						String versionID = versionElement.getAttribute("id");
						String time = versionElement.getAttribute("time");
						String versionTitle = versionElement.getAttribute("title");
						String isDraftString = versionElement.getAttribute("isDraft");
						boolean isDraft = Boolean.parseBoolean(isDraftString);
						String dueDate = versionElement.getAttribute("dueDate");
						String width = versionElement.getAttribute("desireWidth");
						String height = versionElement.getAttribute("desireHeight");
						boolean isHasClosedManually = Boolean.parseBoolean(versionElement.getAttribute("hasClosedManually"));
						String restartFrom = versionElement.getAttribute("restartFrom");
						String description = versionElement.getAttribute("description");
						boolean receiveEmail = Boolean.parseBoolean(versionElement.getAttribute("receiveEmail"));
						boolean hasRestarted = Boolean.parseBoolean(versionElement.getAttribute("hasRestarted"));
						Version version = new Version(versionID, time,isDraft,dueDate,width,height);
						if (versionTitle == null)
							versionTitle = "";
						version.setVersionTitle(versionTitle);
						version.setHasClosedManually(isHasClosedManually);
						version.setRestartFrom(restartFrom);
						version.setDescription(description);
						version.setReceiveEmail(receiveEmail);
						version.setHasRestarted(hasRestarted);

						NodeList reviewers = versionElement.getElementsByTagName("reviewer");
						for (int j = 0; j < reviewers.getLength(); j++) {
							Element reviewer = (Element) reviewers.item(j);

							String reviewerName = reviewer.getAttribute("name");
							String reviewerEmail = reviewer.getAttribute("email");
							version.addReviewer(ReviewManager.getReviewManager().getReviewer(reviewerName, reviewerEmail));
						}

						NodeList resources = versionElement.getElementsByTagName("resource");
						for (int j = 0; j < resources.getLength(); j++) {
							Element resource = (Element) resources.item(j);

							String path = resource.getAttribute("path");
							version.addResource(path);
						}
						objects.add(version);

					}
				} catch (ParserConfigurationException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (SAXException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} finally {
					if (input != null) {
						input.close();
					}
				}
			}
			return objects;
		}
	}
	
	private class ReviewerVersionFile {
		
		public void save(IStorage file, org.davinci.server.review.user.Reviewer reviewer) throws IOException {
			OutputStream out = null;
			try {
				if (!file.exists()) {
					file.createNewFile();
				}

				out = file.getOutputStream();

				DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
				DocumentBuilder builder = factory.newDocumentBuilder();
				Document document = builder.newDocument();

				Element rootElement = document.createElement("reviewer");
				document.appendChild(rootElement);
				
				Iterator<ReviewerVersion> iterator = reviewer.getReviewerVersions();
				while (iterator.hasNext()) {
					ReviewerVersion version = iterator.next();
					Element element = document.createElement("version");
					element.setAttribute("designerID", version.getDesignerID());
					element.setAttribute("time", version.getTimeVersion());
					rootElement.appendChild(element);
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
				if (out != null) {
					out.close();
				}
			}
		}

		public List<ReviewerVersion> load(IStorage file) throws IOException {
			ArrayList<ReviewerVersion> objects = new ArrayList<ReviewerVersion>();
			InputStream input = null;
			if (file.exists()) {
				try {
					DocumentBuilder parser = DocumentBuilderFactory.newInstance()
							.newDocumentBuilder();
					input = file.getInputStream();
					Document document = parser.parse(input);
					Element rootElement = document.getDocumentElement();
					NodeList versionElements = rootElement.getElementsByTagName("version");
					for (int i = 0; i < versionElements.getLength(); i++) {
						Element versionElement = (Element) versionElements.item(i);
						
						String designerID = versionElement.getAttribute("designerID");
						String time = versionElement.getAttribute("time");
						ReviewerVersion version = new ReviewerVersion(designerID, time);

						objects.add(version);

					}
				} catch (ParserConfigurationException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (SAXException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} finally {
					if (input != null)
						input.close();
				}
			}
			return objects;
		}
	}
}

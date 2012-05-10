package maqetta.core.server.user;


import java.io.FileNotFoundException;
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

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.server.review.Constants;
import org.davinci.server.review.ReviewerVersion;
import org.davinci.server.review.Version;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.review.user.IReviewManager;
import org.davinci.server.review.user.Reviewer;
import org.davinci.server.user.IDavinciProject;
import org.davinci.server.user.IUser;
import org.davinci.server.user.LibrarySettings;
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
	private HashMap<IDavinciProject, HashMap<String, ILibInfo[]>> snapshotLibs;
	public IStorage baseDirectory;


	
	public static ReviewManager getReviewManager()
	{
		if (theReviewManager==null)
			theReviewManager=new ReviewManager();
		return theReviewManager;
	}

	Map<String, IDesignerUser> designerUsers = Collections.synchronizedMap(new HashMap<String, IDesignerUser>());
	Map<String, Reviewer> reviewers = Collections.synchronizedMap(new HashMap<String, Reviewer>());
	
	public ReviewManager() {
		String basePath = ServerManager.getServerManger().getDavinciProperty(IDavinciServerConstants.BASE_DIRECTORY_PROPERTY);
		baseDirectory = ServerManager.getServerManger().getBaseDirectory().newInstance(".");
		if (basePath != null) {
			IStorage dir = baseDirectory.newInstance(basePath);
			if (dir.exists())
				baseDirectory = dir;
		}
		if (ServerManager.DEBUG_IO_TO_CONSOLE)
			System.out.println("\nSetting [user space] to: " + baseDirectory.getAbsolutePath());
	}

	public void saveDraft(IDesignerUser user, Version version) {
		IStorage commentingDir = user.getCommentingDirectory();
		if (!commentingDir.exists()) {
			commentingDir.mkdir();
			(baseDirectory.newInstance(commentingDir, "snapshot")).mkdir();
			(baseDirectory.newInstance(commentingDir, "livedoc")).mkdir();
		}
		saveVersionFile(user);
	}

	public void publish(IDesignerUser user, Version version) {
		IStorage commentingDir = user.getCommentingDirectory();
		if (!commentingDir.exists()) {
			commentingDir.mkdir();
			(baseDirectory.newInstance(commentingDir, "snapshot")).mkdir();
			(baseDirectory.newInstance(commentingDir, "livedoc")).mkdir();
		}

		initVersionDir(user, version.getTime());
		saveVersionFile(user);
		
		//Persist review information
		this.saveReviewerVersionFiles(version);
		
		//Rebuild workspace
		user.rebuildWorkspace();
	}
	
	/****************************************************/
	
	private void saveReviewerVersionFiles(Version version) {
		List<Reviewer> reviewers = version.getReviewers();
		for (Reviewer reviewer : reviewers) {
			this.saveReviewerVersionFile(reviewer);
		}
	}
	
	private void saveReviewerVersionFile(Reviewer reviewer) {
		IStorage versionFile = getReviewerVersionFile(reviewer);
		ReviewerVersionFile file = new ReviewerVersionFile();
		file.save(versionFile, reviewer);
	}
	
	private IStorage getReviewerVersionFile(Reviewer reviewer) {
		IStorage versionFile = baseDirectory.newInstance(getReviewerVersionDirectory(), this.buildBaseFileForFromReviewer(reviewer)); 
		return versionFile;
	}
	
	private String buildBaseFileForFromReviewer(Reviewer reviewer) {
		String fileName = reviewer.getEmail() + ".xml";
		return fileName;
	}
	
	private IStorage getReviewerVersionDirectory() {
		//Init the directory to hold version info for all of the reviewers and return it
		IStorage reviewerVersionsDirectory = baseDirectory.newInstance(baseDirectory, Constants.REVIEW_DIRECTORY_NAME);
		if (!reviewerVersionsDirectory.exists()) {
			reviewerVersionsDirectory.mkdir();
		}
		return reviewerVersionsDirectory;
	}
	/**************************************************/
	

	public void saveVersionFile(IDesignerUser user) {
		IStorage versionFile = baseDirectory.newInstance(user.getCommentingDirectory(), "snapshot/versions.xml");
		VersionFile file = new VersionFile();
		file.save(versionFile, user);
	}

	private void initVersionDir(IDesignerUser user, String timeStamp) {
		IStorage versionDir = baseDirectory.newInstance(user.getCommentingDirectory(), "snapshot/" + timeStamp);
		if(versionDir.exists()) return;
		versionDir.mkdir();
		IStorage userDir = user.getUserDirectory();

		IStorage[] files = userDir.listFiles();
		for (int i = 0; i < files.length; i++) {
			String path = files[i].getAbsolutePath();
			if (files[i].isFile()
					&& path.indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION) < 0) {
				IStorage destination = baseDirectory.newInstance(versionDir, files[i].getName());
				copyFile(files[i], destination);
			} else if (files[i].isDirectory()
//					&& path.indexOf(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME) < 0  // Need to copy the settings
					&& path.indexOf(IDavinciServerConstants.DOWNLOAD_DIRECTORY_NAME) < 0
					&& path.indexOf(Constants.REVIEW_DIRECTORY_NAME) < 0
					&& path.indexOf(".svn") < 0
					&& containsPublishedFiles(files[i], user, timeStamp)) {
				IStorage destination = baseDirectory.newInstance(versionDir, files[i].getName());
				copyDirectory(files[i], destination);
			}
		}
	}

	private void copyDirectory(IStorage sourceDir, IStorage destinationDir) {
		destinationDir.mkdirs();
		IStorage[] file = sourceDir.listFiles();
		for (int i = 0; i < file.length; i++) {
			if (file[i].isFile()) {

				IStorage sourceFile = file[i];

				IStorage targetFile = baseDirectory.newInstance(destinationDir, file[i].getName());
				copyFile(sourceFile, targetFile);
			}
			if (file[i].isDirectory()) {
				IStorage destination = baseDirectory.newInstance(destinationDir, file[i].getName());
				copyDirectory(file[i], destination);
			}
		}
	}

	private void copyFile(IStorage source, IStorage destination) {
		try {
			destination.getParentFile().mkdirs();
			InputStream in = source.getInputStream();
			OutputStream out = destination.getOutputStream();
			byte[] buf = new byte[1024];
			int len;
			while ((len = in.read(buf)) > 0) {
				out.write(buf, 0, len);
			}
			in.close();
			out.close();

		} catch (IOException e) {
			e.printStackTrace();
			// throw new UserException(UserException.ERROR_COPYING_USER_BASE_DIRECTORY);
		}
	}

	public IDesignerUser getDesignerUser(IUser user) {
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
	
	public IDesignerUser getDesignerUser(String name) {
		IDesignerUser designer = designerUsers.get(name);
		if (designer == null) {
			IUser user = ServerManager.getServerManger().getUserManager().getUser(name);
			designer = getDesignerUser(user);
		}
		return designer;
	}
	
	public Reviewer getReviewer(String email) {
		return getReviewer(null, email);
	}
	
	public Reviewer getReviewer(String name, String email) {
		Reviewer reviewer = reviewers.get(email);
		if (null == reviewer) {
			reviewer = loadReviewer(name, email);
		}
		return reviewer;
	}

	public Reviewer isVaild(String name, String id, String versionTime) {
		IDesignerUser user = getDesignerUser(name);
		if (versionTime == null) {
			if (user.getLatestVersion() != null)
				versionTime = user.getLatestVersion().getTime();
		}
		if (versionTime == null)
			return null;
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

	private IDesignerUser loadDesignerUser(IUser user) {
		IStorage versionFile;
		String name = user.getUserID();
		if (ServerManager.LOCAL_INSTALL || Constants.LOCAL_INSTALL_USER_NAME.equals(name)) {
			versionFile = this.baseDirectory.newInstance(this.baseDirectory, "/.review/snapshot/versions.xml");
		} else {
			versionFile = this.baseDirectory.newInstance(this.baseDirectory, "/" + name
					+ "/.review/snapshot/versions.xml");
		}
		IDesignerUser designerUser = new DesignerUser(user);

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
	
	private Reviewer loadReviewer(String name, String email) {
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
	
	class VersionFile {
		public String latestVersionID;

		public void save(IStorage file, org.davinci.server.review.user.IDesignerUser user) {
			OutputStream out = null;
			try {
				if (!file.exists())
					try {
						file.createNewFile();
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}

				try {
					out = file.getOutputStream();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
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

		public List<Version> load(IStorage file) {
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
				} catch (FileNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
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
						if (input != null)
							input.close();
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
			return objects;
		}
	}
	
	class ReviewerVersionFile {
		
		public void save(IStorage file, org.davinci.server.review.user.Reviewer reviewer) {
			OutputStream out = null;
			try {
				if (!file.exists())
					try {
						file.createNewFile();
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}

				try {
					out = file.getOutputStream();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
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

		public List<ReviewerVersion> load(IStorage file) {
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
				} catch (FileNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
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
						if (input != null)
							input.close();
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
			return objects;
		}
	}

	public IStorage getBaseDirectory() {
		return baseDirectory;
	}

	public ILibInfo[] getSystemLibs(IDavinciProject project){
		StringBuilder path = new StringBuilder();
		path.append(baseDirectory.getAbsolutePath());
		path.append("/");
		path.append(project.getOwnerId());
		path.append("/");
		path.append(project.getProjectName());
		path.append("/");
		path.append(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		return new LibrarySettings(this.baseDirectory.newInstance(path.toString())).allLibs();
	}

	public ILibInfo[] getVersionLib(IDavinciProject project, String version){
		if(snapshotLibs == null){
			snapshotLibs = new HashMap<IDavinciProject, HashMap<String, ILibInfo[]>>();
		}
		HashMap<String, ILibInfo[]> versions = snapshotLibs.get(project);
		if(versions == null){
			versions = new HashMap<String, ILibInfo[]>();
			snapshotLibs.put(project, versions);
		}
		ILibInfo[] libInfos = versions.get(version);
		if(libInfos == null){
			StringBuilder path = new StringBuilder();
			path.append(baseDirectory.getAbsolutePath());
			path.append("/");
			path.append(project.getOwnerId());
			path.append("/");
			path.append(Constants.REVIEW_DIRECTORY_NAME);
			path.append("/snapshot/");
			path.append(version);
			path.append("/");
			path.append(project.getProjectName());
			path.append("/");
			path.append(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);

			libInfos = new LibrarySettings(this.baseDirectory.newInstance(path.toString())).allLibs();
			if(libInfos != null)
				versions.put(version, libInfos);
		}
		return libInfos;
	}
	
	public static IPath adjustPath(IPath path, String ownerId, String version, String projectName){
		// Map the request lib path stored in the snapshot to the actual system lib path
		// A path like: project1/./lib/dojo/dojo.js
		IReviewManager reviewManager = ReviewManager.getReviewManager();
		IDavinciProject project = new DavinciProject();
		project.setOwnerId(ownerId);
		project.setProjectName(projectName);
		ILibInfo[] sysLibs = reviewManager.getSystemLibs(project);
		ILibInfo[] versionLibs = reviewManager.getVersionLib(project, version);

		// If the lib path is not specified in the review version,
		// just return the path
		if(versionLibs == null) return path;
		
		IPath cp = new Path(path.toString());
		IPath newPath = new Path(cp.segment(0));
		cp = cp.removeFirstSegments(1);
		
		int c = 0;
		while(cp.segment(0).equals(".") || cp.segment(0).equals("..")){
			c++;
		}
		cp = cp.removeFirstSegments(c);
		
		for(ILibInfo info : versionLibs){
			if (info.getVirtualRoot() == null) {
				continue;
			}
			IPath versionVirtualRoot = new Path(info.getVirtualRoot());
			if(cp.matchingFirstSegments(versionVirtualRoot) == versionVirtualRoot.segmentCount()){
				String virtualRoot = null;
				for(ILibInfo lib : sysLibs){
					if(lib.getId().equals(info.getId())){
						virtualRoot = lib.getVirtualRoot();
						break;
					}
				}
				if(virtualRoot != null){
					IPath vr = newPath.append(virtualRoot);
					return vr.append(cp.removeFirstSegments(versionVirtualRoot.segmentCount()));
				}
				break;
			}
		}
		return path;
	}
}

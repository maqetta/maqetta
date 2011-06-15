package org.davinci.server.review;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
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

import org.davinci.ajaxLibrary.LibInfo;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.user.LibrarySettings;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class ReviewManager {
//	private static final String LS = System.getProperty("line.separator");
	private static ReviewManager theReviewManager;
	HashMap<DavinciProject, HashMap<String, LibInfo[]>> snapshotLibs;
	File baseDirectory;


	public static ReviewManager getReviewManager()
	{
		if (theReviewManager==null)
			theReviewManager=new ReviewManager();
		return theReviewManager;
	}

	Map<String, DesignerUser> users = Collections.synchronizedMap(new HashMap<String, DesignerUser>());
	public ReviewManager() {
		String basePath = ServerManager.getServerManger().getDavinciProperty(IDavinciServerConstants.BASE_DIRECTORY_PROPERTY);
		baseDirectory = new File(".");
		if (basePath != null) {
			File dir = new File(basePath);
			if (dir.exists())
				baseDirectory = dir;
		}
		if (ServerManager.DEBUG_IO_TO_CONSOLE)
			System.out.println("\nSetting [user space] to: " + baseDirectory.getAbsolutePath());
	}

	public void saveDraft(String name,Version version) {
		DesignerUser user = getDesignerUser(name);
		File commentingDir = user.getCommentingDirectory();
		if (!commentingDir.exists()) {
			commentingDir.mkdir();
			(new File(commentingDir, "snapshot")).mkdir();
			(new File(commentingDir, "livedoc")).mkdir();
		}
		saveVersionFile(user);
	}

	public void publish(String name, Version version) {
		DesignerUser user = getDesignerUser(name);
		File commentingDir = user.getCommentingDirectory();
		if (!commentingDir.exists()) {
			commentingDir.mkdir();
			(new File(commentingDir, "snapshot")).mkdir();
			(new File(commentingDir, "livedoc")).mkdir();
		}

		initVersionDir(user, version.getTime());
		saveVersionFile(user);

	}

	public void saveVersionFile(DesignerUser user) {
		File versionFile = new File(user.getCommentingDirectory(), "snapshot/versions.xml");
		VersionFile file = new VersionFile();
		file.save(versionFile, user);
	}

	private void initVersionDir(DesignerUser user, String timeStamp) {
		File versionDir = new File(user.getCommentingDirectory(), "snapshot/" + timeStamp);
		if(versionDir.exists()) return;
		versionDir.mkdir();
		File userDir = user.getUserDirectory();

		File[] files = userDir.listFiles();
		for (int i = 0; i < files.length; i++) {
			String path = files[i].getAbsolutePath();
			if (files[i].isFile()
					&& path.indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION) < 0) {
				File destination = new File(versionDir, files[i].getName());
				copyFile(files[i], destination);
			} else if (files[i].isDirectory()
//					&& path.indexOf(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME) < 0  // Need to copy the settings
					&& path.indexOf(IDavinciServerConstants.DOWNLOAD_DIRECTORY_NAME) < 0
					&& path.indexOf(Constants.REVIEW_DIRECTORY_NAME) < 0
					&& path.indexOf(".svn") < 0) {
				File destination = new File(versionDir, files[i].getName());
				copyDirectory(files[i], destination);
			}
		}
	}

	private void copyDirectory(File sourceDir, File destinationDir) {
		destinationDir.mkdirs();
		File[] file = sourceDir.listFiles();
		for (int i = 0; i < file.length; i++) {
			if (file[i].isFile()) {

				File sourceFile = file[i];

				File targetFile = new File(destinationDir, file[i].getName());
				copyFile(sourceFile, targetFile);
			}
			if (file[i].isDirectory()) {
				File destination = new File(destinationDir, file[i].getName());
				copyDirectory(file[i], destination);
			}
		}
	}

	private void copyFile(File source, File destination) {
		try {
			destination.getParentFile().mkdirs();
			InputStream in = new FileInputStream(source);
			OutputStream out = new FileOutputStream(destination);
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

	public DesignerUser getDesignerUser(String name) {
		if (users.get(name) == null) {
			loadUser(name);
		}
		return users.get(name);
	}

	public Reviewer isVaild(String name, String id, String versionTime) {
		DesignerUser user = getDesignerUser(name);
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

	private void loadUser(String name) {
		File versionFile;
		if (ServerManager.LOCAL_INSTALL || Constants.LOCAL_INSTALL_USER_NAME.equals(name)) {
			versionFile = new File(this.baseDirectory, "/.review/snapshot/versions.xml");
		} else {
			versionFile = new File(this.baseDirectory, "/" + name
					+ "/.review/snapshot/versions.xml");
		}
		DesignerUser user = new DesignerUser(name);

		if (versionFile.exists()) {
			VersionFile file = new VersionFile();
			List<Version> versions = file.load(versionFile);
			for (Version version : versions) {
				user.addVersion(version);
				if (file.latestVersionID != null
						&& version.getVersionID().equals(file.latestVersionID)) {
					user.setLatestVersion(version);
				}
			}
		}
		users.put(name, user);
	}

	class VersionFile {
		public String latestVersionID;

		public void save(File file, DesignerUser user) {
			OutputStream out = null;
			try {
				if (!file.exists())
					file.createNewFile();

				out = new FileOutputStream(file);
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
						reviewerElement.setAttribute("name", reviewer.getUserName());
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
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
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

		public List<Version> load(File file) {
			ArrayList<Version> objects = new ArrayList<Version>();
			InputStream input = null;
			if (file.exists()) {
				try {
					DocumentBuilder parser = DocumentBuilderFactory.newInstance()
							.newDocumentBuilder();
					input = new FileInputStream(file);
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
							String id = reviewer.getAttribute("id");
							version.addReviewer(reviewerName, reviewerEmail);
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

	public File getBaseDirectory() {
		return baseDirectory;
	}

	public LibInfo[] getSystemLibs(DavinciProject project){
		StringBuilder path = new StringBuilder();
		path.append(baseDirectory.getAbsolutePath());
		path.append("/");
		path.append(project.getOwnerId());
		path.append("/");
		path.append(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		return new LibrarySettings(new File(path.toString())).allLibs();
	}

	public LibInfo[] getVersionLib(DavinciProject project, String version){
		if(snapshotLibs == null){
			snapshotLibs = new HashMap<DavinciProject, HashMap<String, LibInfo[]>>();
		}
		HashMap<String, LibInfo[]> versions = snapshotLibs.get(project);
		if(versions == null){
			versions = new HashMap<String, LibInfo[]>();
			snapshotLibs.put(project, versions);
		}
		LibInfo[] libInfos = versions.get(version);
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
			path.append(IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);

			libInfos = new LibrarySettings(new File(path.toString())).allLibs();
			if(libInfos != null)
				versions.put(version, libInfos);
		}
		return libInfos;
	}
}

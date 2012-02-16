package maqetta.core.server.standalone.user;

import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Vector;

import maqetta.core.server.standalone.VDirectory;
import maqetta.core.server.standalone.VFile;
import maqetta.core.server.standalone.VLibraryResource;
import maqetta.core.server.standalone.VWorkspaceRoot;
import maqetta.core.server.standalone.internal.Links;

import org.davinci.ajaxLibrary.ILibInfo;
import org.davinci.ajaxLibrary.Library;
import org.davinci.server.review.Constants;
import org.davinci.server.review.Version;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.review.user.Reviewer;
import org.davinci.server.user.IUser;
import org.davinci.server.user.LibrarySettings;

import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ILink;
import org.maqetta.server.ILinks;
import org.maqetta.server.IStorage;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;

public class DesignerUser implements IDesignerUser {
	private final String name;
	private IStorage commentingDirectory;
	private IVResource workspace;
	private Links links;
	private final List<Version> versions = new ArrayList<Version>();
	private Version latestVersion;
	private IStorage userDirectory;

	public IUser rawUser;

	public IUser getRawUser() {
		return rawUser;
	}

	public void setRawUser(IUser rawUser) {
		this.rawUser = rawUser;
	}

	public DesignerUser(String name) {
		this.name = name;
		this.rawUser = ServerManager.getServerManger().getUserManager()
				.newUser(new Reviewer(name, ""), this.getUserDirectory());
		userDirectory.mkdirs(); // userDirectory is set as a side-effect of the
								// getUserDirectory getter method
		rebuildWorkspace();

	}

	public void rebuildWorkspace() {
		this.workspace = new VWorkspaceRoot();
		IStorage[] userFiles = this.userDirectory.listFiles();

		for (int j = 0; j < userFiles.length; j++) {
			if (!userFiles[j].isDirectory())
				continue;
			LibrarySettings settings = this.getLibSettings(userFiles[j]);
			if (!settings.exists())
				continue;
			Vector<ILibInfo> libs = new Vector();
			libs.addAll(Arrays.asList(settings.allLibs()));

			IVResource workspace = this.workspace;
			IVResource firstFolder = new VDirectory(workspace,
					userFiles[j].getName());
			this.workspace.add(firstFolder);
			for (int i = 0; i < libs.size(); i++) {
				IVResource root = firstFolder;
				String defaultRoot = libs.get(i).getVirtualRoot();

				if (defaultRoot == null)
					continue;

				Library b = this.getLibrary(libs.get(i));
				/*
				 * library not found on server so avoid adding it to the
				 * workspace
				 */
				if (b == null) {
					continue;
				}
				URL file = b.getURL("");
				// TODO temp fix to avoid adding virtual library entries that
				// don't
				// exist to the workspace.
				if (file == null) {
					continue;
				}
				IPath path = new Path(defaultRoot);
				for (int k = 0; k < path.segmentCount(); k++) {
					String segment = path.segment(k);
					IVResource v = root.get(segment);
					if (v == null) {
						/* creating virtual directory structure, so READ ONLY */
						v = new VDirectory(root, segment, true);
						root.add(v);
					}
					root = v;
				}

				IVResource libResource = new VLibraryResource(b, file, "", "");
				/*
				 * need a special case for library items whos root is the
				 * project roots
				 */
				// if(path.segmentCount()==0){

				IVResource[] children = libResource.listFiles();
				for (int p = 0; p < children.length; p++)
					root.add(children[p]);
				// }else{
				// root.add(libResource);
				// }
			}
		}
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.standalone.user.IDesignerUser#getVersion(java.lang
	 * .String)
	 */
	public Version getVersion(String time) {
		for (Version version : versions) {
			if (time.equals(version.getTime()))
				return version;
		}
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see maqetta.core.server.standalone.user.IDesignerUser#getName()
	 */
	public String getName() {
		return this.name;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see maqetta.core.server.standalone.user.IDesignerUser#getLatestVersion()
	 */
	public Version getLatestVersion() {
		return latestVersion;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.standalone.user.IDesignerUser#setLatestVersion(org
	 * .davinci.server.review.Version)
	 */
	public void setLatestVersion(Version latestVersion) {
		this.latestVersion = latestVersion;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.standalone.user.IDesignerUser#addVersion(org.davinci
	 * .server.review.Version)
	 */
	public void addVersion(Version version) {
		versions.add(version);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see maqetta.core.server.standalone.user.IDesignerUser#getVersions()
	 */
	public List<Version> getVersions() {
		return versions;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.standalone.user.IDesignerUser#deleteVersion(java.
	 * lang.String)
	 */
	public void deleteVersion(String versionTime) {
		Version version = this.getVersion(versionTime);
		versions.remove(version);
		IStorage versionDir = this.userDirectory.newInstance(
				this.getCommentingDirectory(), "snapshot/" + versionTime);
		if (versionDir.exists()) {
			deleteDir(versionDir);
		}
	}

	private static boolean deleteDir(IStorage dir) {
		if (dir.isDirectory()) {
			String[] children = dir.list();
			for (int i = 0; i < children.length; i++) {
				boolean success = deleteDir(dir.newInstance(dir, children[i]));
				if (!success) {
					return false;
				}
			}
		}

		// The directory is now empty so delete it
		return dir.delete();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.standalone.user.IDesignerUser#getCommentingDirectory
	 * ()
	 */
	public IStorage getCommentingDirectory() {
		if (this.commentingDirectory == null) {
			IStorage userDir;
			if (ServerManager.LOCAL_INSTALL) {
				userDir = ReviewManager.getReviewManager().baseDirectory
						.newInstance(ReviewManager.getReviewManager().baseDirectory
								.getAbsolutePath());
			} else {
				userDir = ReviewManager.getReviewManager().baseDirectory
						.newInstance(
								ReviewManager.getReviewManager().baseDirectory,
								name);
			}
			this.commentingDirectory = this.userDirectory.newInstance(userDir,
					Constants.REVIEW_DIRECTORY_NAME);
		}
		return this.commentingDirectory;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see maqetta.core.server.standalone.user.IDesignerUser#getUserDirectory()
	 */
	public IStorage getUserDirectory() {
		if (this.userDirectory == null) {
			IStorage userDir;
			if (ServerManager.LOCAL_INSTALL) {
				userDir = ReviewManager.getReviewManager().baseDirectory
						.newInstance(ReviewManager.getReviewManager().baseDirectory
								.getAbsolutePath());
			} else {
				userDir = ReviewManager.getReviewManager().baseDirectory
						.newInstance(
								ReviewManager.getReviewManager().baseDirectory,
								name);
			}
			this.userDirectory = userDir;
		}
		return this.userDirectory;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.standalone.user.IDesignerUser#getResource(org.eclipse
	 * .core.runtime.IPath)
	 */
	public IVResource getResource(IPath path) {
		// Path = /.review/snapshot/20100101/project1/folder1/sample1.html
		IVResource vr = null;
		if (path.segment(0).equals(Constants.REVIEW_DIRECTORY_NAME)) {
			vr = getUserFile(path.removeFirstSegments(1).toString());
		}
		if (vr == null) {
			vr = getLinkedResource(path.toString());
		}
		if (vr == null) {
			vr = getLibFile(path.toString());
		}
		return vr;
	}

	private IVResource getUserFile(String path) {
		IPath reviewFilePath = new Path(this.getCommentingDirectory()
				.getAbsolutePath()).append(path);

		if (!this.userDirectory.newInstance(reviewFilePath.toOSString())
				.exists()) {
			// The requested file does not exist!
			return null;
		}

		String[] segments = reviewFilePath.segments();
		IPath me = new Path(this.getCommentingDirectory().getAbsolutePath());
		IVResource parent = this.workspace;
		for (int i = me.matchingFirstSegments(reviewFilePath); i < segments.length; i++) {
			int segsToEnd = segments.length - i - 1;
			String s = reviewFilePath.removeLastSegments(segsToEnd)
					.toOSString();
			IStorage f = this.userDirectory.newInstance(s);
			parent = new VFile(f, parent, segments[i]);
		}

		if (parent == this.workspace)
			parent = new VFile(this.getUserDirectory(), this.workspace);

		return parent;
	}

	private LibrarySettings getLibSettings(IStorage base) {

		IStorage settings = base.newInstance(base,
				IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		return new LibrarySettings(settings);
	}

	private IVResource getLinkedResource(String path) {
		String path1 = path;
		if (path1.startsWith("./")) {
			path1 = path.substring(2);
		}
		ILink link = this.getLinks().hasLink(path1);
		if (link != null) {
			path = ILink.location + "/" + path1.substring(ILink.path.length());
			path = path.replace('/', IStorage.separatorChar);
			VFile linkFile = new VFile(this.userDirectory.newInstance(path));
			return linkFile;
		}
		return null;

	}

	synchronized public ILinks getLinks() {
		if (this.links == null) {
			this.links = new Links(this.getWorkbenchSettings());
		}
		return this.links;
	}

	public IStorage getWorkbenchSettings() {
		return getWorkbenchSettings("");
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.davinci.server.user.IUser#getWorkbenchSettings(java.lang.String)
	 */
	public IStorage getWorkbenchSettings(String base) {

		IStorage baseFile = this.userDirectory.newInstance(this.userDirectory,
				base);
		IStorage settingsDirectory = this.userDirectory.newInstance(baseFile,
				IDavinciServerConstants.SETTINGS_DIRECTORY_NAME);
		if (!isValid(settingsDirectory.getAbsolutePath()))
			return null;

		if (!settingsDirectory.exists())
			settingsDirectory.mkdirs();

		return settingsDirectory;
	}

	public boolean isValid(String path) {
		IPath workspaceRoot = new Path(this.userDirectory.getAbsolutePath());
		IPath a = new Path(path);
		if (a.matchingFirstSegments(workspaceRoot) != workspaceRoot
				.segmentCount()) {
			return false;
		}
		return true;
	}

	private IVResource getLibFile(String p1) {
		IPath path = new Path(p1);
		IVResource root = this.workspace;
		for (int i = 0; i < path.segmentCount() && root != null; i++) {
			root = root.get(path.segment(i));

		}

		return root;
	}

	private Library getLibrary(ILibInfo li) {
		String id = li.getId();
		String version = li.getVersion();
		return ServerManager.getServerManger().getLibraryManager()
				.getLibrary(id, version);

	}
}

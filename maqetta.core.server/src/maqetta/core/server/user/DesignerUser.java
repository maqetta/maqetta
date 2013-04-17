package maqetta.core.server.user;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.davinci.server.review.Constants;
import org.davinci.server.review.Version;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.user.IUser;
import org.maqetta.server.IStorage;

public class DesignerUser implements IDesignerUser {
	private final String name;
	private IStorage commentingDirectory;
	private final List<Version> versions = new ArrayList<Version>();
	private Version latestVersion;
	private IStorage userDirectory;

	public IUser rawUser;
	
	public DesignerUser(IUser user) {
		this.name = user.getUserID();
		this.rawUser = user;
		// userDirectory is set as a side-effect of the getUserDirectory getter method
		this.getUserDirectory();
	}
	
	public IUser getRawUser() {
		return rawUser;
	}
	
	public void setRawUser(IUser user) {
		rawUser = user;
	}
	
	public void rebuildWorkspace() {
		rawUser.rebuildWorkspace();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.user.IDesignerUser#getVersion(java.lang
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
	 * @see maqetta.core.server.user.IDesignerUser#getName()
	 */
	public String getName() {
		return this.name;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see maqetta.core.server.user.IDesignerUser#getLatestVersion()
	 */
	public Version getLatestVersion() {
		return latestVersion;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.user.IDesignerUser#setLatestVersion(org
	 * .davinci.server.review.Version)
	 */
	public void setLatestVersion(Version latestVersion) {
		this.latestVersion = latestVersion;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.user.IDesignerUser#addVersion(org.davinci
	 * .server.review.Version)
	 */
	public void addVersion(Version version) {
		versions.add(version);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see maqetta.core.server.user.IDesignerUser#getVersions()
	 */
	public List<Version> getVersions() {
		return versions;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * maqetta.core.server.user.IDesignerUser#deleteVersion(java.
	 * lang.String)
	 */
	public void deleteVersion(String versionTime) throws IOException {
		Version version = this.getVersion(versionTime);
		versions.remove(version);
		IStorage versionDir = this.userDirectory.newInstance(
				this.getCommentingDirectory(), "snapshot/" + versionTime);
		if (versionDir.exists()) {
			deleteDir(versionDir);
		}
	}

	private static boolean deleteDir(IStorage dir) throws IOException {
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
	 * maqetta.core.server.user.IDesignerUser#getCommentingDirectory
	 * ()
	 */
	public IStorage getCommentingDirectory() {
		if (this.commentingDirectory == null) {
			// this.userDirectory is of type VOrionWorkspaceStorage. Because of that, we cannot use
			// `newInstance()`, since that will return `null` if the underlying path doesn't already
			// exist.  Instead, we call `create()`, to create an Orion project for this dir.
			this.commentingDirectory = this.userDirectory.create(Constants.REVIEW_DIRECTORY_NAME);
		}
		return this.commentingDirectory;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see maqetta.core.server.user.IDesignerUser#getUserDirectory()
	 */
	public IStorage getUserDirectory() {
		if (this.userDirectory == null) {
			this.userDirectory = this.getRawUser().getUserDirectory();
		}
		return this.userDirectory;
	}
}

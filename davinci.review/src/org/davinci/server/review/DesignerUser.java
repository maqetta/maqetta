package org.davinci.server.review;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.davinci.server.ServerManager;

public class DesignerUser {
	private String name;
	private File commentingDirectory;

	private List<Version> versions = new ArrayList<Version>();

	private Version latestVersion;
	private File userDirectory;

	public Version getVersion(String time) {
		for (Version version : versions) {
			if (time.equals(version.getTime()))
				return version;
		}
		return null;
	}

	public String getName() {
		return this.name;
	}

	public Version getLatestVersion() {
		return latestVersion;
	}

	public void setLatestVersion(Version latestVersion) {
		this.latestVersion = latestVersion;
	}

	public DesignerUser(String name) {
		this.name = name;
	}

	public void addVersion(Version version) {
		versions.add(version);
	}

	public List<Version> getVersions() {
		return versions;
	}

	public void deleteVersion(String versionTime){
		Version version = this.getVersion(versionTime);
		versions.remove(version);
		File versionDir = new File(this.getCommentingDirectory(), "snapshot/" + versionTime);
		if(versionDir.exists()){
			deleteDir(versionDir);
		}
	}

	private static boolean deleteDir(File dir) {
	    if (dir.isDirectory()) {
	        String[] children = dir.list();
	        for (int i=0; i<children.length; i++) {
	            boolean success = deleteDir(new File(dir, children[i]));
	            if (!success) {
	                return false;
	            }
	        }
	    }

	    // The directory is now empty so delete it
	    return dir.delete();
	}

	public File getCommentingDirectory() {
		if (this.commentingDirectory == null) {
			File userDir;
			if (ServerManager.LOCAL_INSTALL) {
				userDir = new File(
						ReviewManager.getReviewManager().baseDirectory
								.getAbsolutePath());
			} else {
				userDir = new File(
						ReviewManager.getReviewManager().baseDirectory, name);
			}
			this.commentingDirectory = new File(userDir,
					Constants.REVIEW_DIRECTORY_NAME);
		}
		return this.commentingDirectory;
	}

	public File getUserDirectory() {
		if (this.userDirectory == null) {
			File userDir;
			if (ServerManager.LOCAL_INSTALL) {
				userDir = new File(
						ReviewManager.getReviewManager().baseDirectory
								.getAbsolutePath());
			} else {
				userDir = new File(
						ReviewManager.getReviewManager().baseDirectory, name);
			}
			this.userDirectory = userDir;
		}
		return this.userDirectory;
	}

}

package org.davinci.server.review.user;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.maqetta.server.VFile;

import org.davinci.server.review.Constants;
import org.davinci.server.review.ReviewManager;
import org.davinci.server.review.Version;
import org.davinci.server.user.IUser;

import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;

public class DesignerUser{
	private String name;
	private File commentingDirectory;
	private IVResource workspace;
	private List<Version> versions = new ArrayList<Version>();
	private Version latestVersion;
	private File userDirectory;
	
	public IUser rawUser;

	public DesignerUser(String name) {
		this.name = name;
		this.rawUser = ServerManager.getServerManger().getUserManager().newUser(new Reviewer(name, ""), this.getUserDirectory());
		
	}
	
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
	
	public IVResource getResource(IPath path){
		// Path = /.review/snapshot/20100101/project1/folder1/sample1.html
		IVResource vr = null;
		if(path.segment(0).equals(Constants.REVIEW_DIRECTORY_NAME)){
			vr = getUserFile(path.removeFirstSegments(1).toString());
		}
		if(null != vr){
			return vr;
		}else{
			// The file does not exist under .review directory
			// And there is no review diretory either
			
			// Let's map the lib path to the real lib path first
			String ownerId = this.name;
			String version = path.segment(2);
			String projectName = path.segment(3);
			path = path.removeFirstSegments(3);
			path = ReviewManager.adjustPath(path, ownerId, version, projectName);
			
			return this.rawUser.getResource(path.toString());
		}
	}
	
	private IVResource getUserFile(String path) {
		IPath reviewFilePath = new Path(this.getCommentingDirectory().getAbsolutePath()).append(path);

		if(!new File(reviewFilePath.toOSString()).exists()){
			// The requested file does not exist!
			return null;
		}
		
		String[] segments = reviewFilePath.segments();
		IPath me = new Path(this.getCommentingDirectory().getAbsolutePath());
		IVResource parent = this.workspace;
		for (int i = me.matchingFirstSegments(reviewFilePath); i < segments.length; i++) {
			int segsToEnd = segments.length - i - 1;
			String s = reviewFilePath.removeLastSegments(segsToEnd).toOSString();
			File f = new File(s);
			parent = new VFile(f, parent, segments[i]);
		}

		if (parent == this.workspace)
			parent = new VFile(this.getUserDirectory(), this.workspace);

		return parent;
	}
}

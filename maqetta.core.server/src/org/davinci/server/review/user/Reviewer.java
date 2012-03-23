package org.davinci.server.review.user;

import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.davinci.server.review.ReviewerVersion;
import org.davinci.server.user.IPerson;

public class Reviewer implements IPerson{
	private String name;
	private String email;
	
	private Map<String, ReviewerVersion> versions = Collections.synchronizedMap(new HashMap<String, ReviewerVersion>());

	public Reviewer(String name, String email) {
		if(name ==null) {
			name = "";
		}
		this.name = name;
		this.email =email;
	}
	
	public String getUserName() {
		return name;
	}
	
	public void setUserName(String name) {
		this.name = name;
	}
	
	public String getEmail() {
		return email;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}
	
	public void addReviewerVersion(ReviewerVersion version) {
		if (!versions.containsKey(version.getUniqueID())) {
			versions.put(version.getUniqueID(), version);
		}
	}

	public Iterator<ReviewerVersion> getReviewerVersions() {
		return versions.values().iterator();
	}

	/*AWE TODO
	public void deleteVersion(String versionTime) {
		Version version = this.getVersion(versionTime);
		versions.remove(version);
		IStorage versionDir = this.userDirectory.newInstance(
				this.getCommentingDirectory(), "snapshot/" + versionTime);
		if (versionDir.exists()) {
			deleteDir(versionDir);
		}
	}
	*/
}

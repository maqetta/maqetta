package org.davinci.server.review.user;

import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.davinci.server.review.ReviewerVersion;
import org.davinci.server.user.IPerson;
import org.davinci.server.user.IPersonManager;
import org.maqetta.server.ServerManager;

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
	
	public String getUserID() {
		if (name.equals("")) {
			//Try and look it up... this is necessary because reviewer doesn't necessarily have
			//a user name at the time they are invited to a review
			IPersonManager personManager = ServerManager.getServerManager().getPersonManager();
			IPerson person = personManager.getPersonByEmail(email);
			if (person != null) {
				name = person.getUserID();
			}
		}
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

	public String getDisplayName() {
		String displayName = this.getEmail();
		IPersonManager personManager = ServerManager.getServerManager().getPersonManager();
		IPerson person = personManager.getPersonByEmail(this.getEmail());
		if (person != null) {
			displayName = person.getDisplayName();
		}
		

		return displayName;
	}


}

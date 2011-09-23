package org.davinci.server.review.user;

import org.davinci.server.user.IPerson;

public class Reviewer implements IPerson{
	private String name;
	private String email;
	
	
	public Reviewer(String name, String email)
	{
		if(name ==null)
			name = "";
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
}

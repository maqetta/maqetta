package org.davinci.server.review;

public class ReviewerVersion{

	private String designerID;

	private String timeVersion;
	
	private String uniqueID;

	public ReviewerVersion(String designerID, String timeVersion){
		this.designerID = designerID;
		this.timeVersion = timeVersion;
		this.uniqueID = designerID + timeVersion;
	}

	public String getUniqueID() {
		return uniqueID;
	}
	
	public String getDesignerID() {
		return designerID;
	}
	
	public void setDesignerID(String designerID) {
		this.designerID = designerID;
	}
	
	public String getTimeVersion() {
		return timeVersion;
	}
	
	public void setTimeVersion(String timeVersion) {
		this.timeVersion = timeVersion;
	}
}
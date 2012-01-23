package org.davinci.server.review;

public class ReviewObject {
	private String designerName;
	private String designerEmail;
	private String file;
	private String commentId;
	
	public ReviewObject(String designerName)
	{
		this.designerName = designerName;
	}
	
	public ReviewObject(String designerName,String file, String commentId)
	{
		this.designerName = designerName;
		
		this.file = file;
		this.commentId = commentId;
	}
	
	public String getDesignerName() {
		return designerName;
	}
	public void setDesignerName(String designerName) {
		this.designerName = designerName;
	}
	
	public String getFile() {
		return file;
	}
	public void setFile(String file) {
		this.file = file;
	}
	public String getCommentId() {
		return commentId;
	}
	public void setCommentId(String commentId) {
		this.commentId = commentId;
	}

	public void setDesignerEmail(String designerEmail) {
		this.designerEmail = designerEmail;
	}

	public String getDesignerEmail() {
		return designerEmail;
	}
	
	
}

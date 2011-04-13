package org.davinci.server.review;

import java.io.File;
import java.io.Serializable;

public class DavinciProject implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private String ownerId;

	// FIXME Currently, there is no project concept, so set project name a value
	// by default
	private String projectName = "Project";

	private CommentsDocument commentsDocument;

	public String getOwnerId() {
		return ownerId;
	}

	public void setOwnerId(String ownerId) {
		this.ownerId = ownerId;
	}

	public String getProjectName() {
		return projectName;
	}

	public void setProjectName(String projectName) {
		this.projectName = projectName;
	}

	public String getCommentFilePath() {
		DesignerUser ru = new DesignerUser(ownerId);
		return ru.getCommentingDirectory().getAbsolutePath() + File.separator + "snapshot"
				+ File.separator + "comments.xml";
	}

	public CommentsDocument getCommentsDocument() {
		return commentsDocument;
	}

	public void setCommentsDocument(CommentsDocument commentsDocument) {
		this.commentsDocument = commentsDocument;
	}

	public int hashCode() {
		return (ownerId + '\t' + projectName).hashCode();
	}

	public boolean equals(Object j) {
		DavinciProject p = (DavinciProject) j;
		if (null == j || !(j instanceof DavinciProject))
			return false;

		if (("" + ownerId + '\t' + projectName).equals("" + p.getOwnerId() + '\t'
				+ p.getProjectName()))
			return true;
		else
			return false;
	}
}

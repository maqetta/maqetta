package maqetta.core.server.user;

import java.io.IOException;
import java.io.Serializable;

import org.davinci.server.review.CommentsDocument;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.user.IDavinciProject;
import org.maqetta.server.IStorage;


public class DavinciProject implements Serializable, IDavinciProject {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private String ownerId;

	// FIXME Currently, there is no project concept actually.
	// A project is just a directory with user workspace.
	// So set project name a value by default
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

	public IStorage getCommentsFileStorage() throws IOException {
		IDesignerUser ru = ReviewManager.getReviewManager().getDesignerUser(ownerId);
		IStorage commentingDir = ru.getCommentingDirectory();
		IStorage commentsFileStorage = commentingDir.newInstance(commentingDir, "snapshot/comments.xml");
		return commentsFileStorage;
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

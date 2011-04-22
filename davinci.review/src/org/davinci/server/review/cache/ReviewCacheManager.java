package org.davinci.server.review.cache;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.Vector;
import org.davinci.server.review.Comment;
import org.davinci.server.review.CommentsDocument;
import org.davinci.server.review.DavinciProject;
import org.davinci.server.review.Utils;
import org.davinci.server.review.Version;
import org.davinci.server.review.persistence.Marshaller;
import org.davinci.server.review.persistence.Unmarshaller;

public class ReviewCacheManager extends Thread {
	static final public ReviewCacheManager $ = new ReviewCacheManager();

	static final private String LAST_ACCESS_TIME = "lastAccessTime";

	static final private long DESTROY_TIME = 60000; // 10 mins

	static final private long SLEEP_TIME = 60000; // 2 min

	// Map<FileLocation, Hashtable<CommentId, Comment>>
	private Hashtable<DavinciProject, Hashtable<String, Comment>> reviewFilePool = new Hashtable<DavinciProject, Hashtable<String, Comment>>();

	private volatile boolean stop;

	private ReviewCacheManager() {
		stop = false;
	}

	public synchronized boolean updateComments(List<Comment> comments) throws Exception {
		DavinciProject project;
		Hashtable<String, Comment> reviewHash;
		Comment fatherComment;
		for (Comment comment : comments) {
			project = comment.getProject();
			reviewHash = loadReviewFile(project);

			if (null == reviewHash) {
				System.out.println("Can't find project " + project.getProjectName()
						+ " review file for comment " + comment.getId());
				continue;
			}

			boolean isFaterClosed = false;
			if (!Utils.isBlank(comment.getReplyTo()) && !"0".equals(comment.getReplyTo())){
				fatherComment = reviewHash.get(comment.getReplyTo());
				if(null != fatherComment
						&& Comment.STATUS_CLOSED.equals(fatherComment.getStatus())){
					isFaterClosed =true;
				}
			}
			boolean isStatusChange = false;
			Comment tempComment =reviewHash.get(comment.getId());
			if(tempComment!=null && tempComment.getStatus()!=comment.getStatus()){
				isStatusChange = true;
			}
			if(!isStatusChange && (Comment.STATUS_CLOSED.equals(comment.getStatus())||
					isFaterClosed)){
				throw new Exception(
						"The review with subject "
								+ comment.getSubject()
								+ " can't be added because this review thread is closed by others, please reload the review data.");
			}
			reviewHash.put(comment.getId(), comment);

			// Update the last access time
			updateLastAccessTime(project);
		}
		return true;
	}

	public synchronized List<Comment> getCommentsByPageName(DavinciProject project, String pageName) {
		// Load project's review information
		Hashtable<String, Comment> reviewHash = loadReviewFile(project);
		List<Comment> result = new LinkedList<Comment>();
		if (null == reviewHash)
			return result;

		Set<Entry<String, Comment>> entries = reviewHash.entrySet();
		for (Entry<String, Comment> entry : entries) {
			if (!LAST_ACCESS_TIME.equals(entry.getKey())) {
				if (pageName != null && !"".equals(pageName)
						&& !pageName.equals(entry.getValue().getPageName())) {
					// If the comment does not belong to the given page, do not add it
					continue;
				}
				result.add((Comment) (Utils.deepClone(entry.getValue())));
				// result.add(entry.getValue());
			}
		}

		// Update the last access time
		updateLastAccessTime(project);

		return result;
	}

	public synchronized Comment getComment(DavinciProject project, String commentId) {
		Hashtable<String, Comment> reviewHash = loadReviewFile(project);
		if (null == reviewHash)
			return null;

		// Update the last access time
		updateLastAccessTime(project);

		return (Comment) (Utils.deepClone(reviewHash.get(commentId)));
		// return reviewHash.get(commentId);
	}

	public synchronized boolean updateLastAccessTime(DavinciProject project) {
		if (null == project)
			return false;

		Hashtable<String, Comment> reviewHash = reviewFilePool.get(project);
		if (null == reviewHash)
			return true;

		Comment lastAccessTime = new Comment();
		lastAccessTime.setCreated(new Date(System.currentTimeMillis()));
		reviewHash.put(LAST_ACCESS_TIME, lastAccessTime);
		return true;
	}

	/**
	 * 
	 * @param project
	 * @return
	 */
	private synchronized Hashtable<String, Comment> loadReviewFile(DavinciProject project) {
		Hashtable<String, Comment> reviewHash;
		if (null == project)
			return null;

		// The review file has been loaded.
		reviewHash = reviewFilePool.get(project);
		if (reviewHash != null)
			return reviewHash;

		// Load the review file from disk.
		Unmarshaller unmarshaller = new Unmarshaller();
		CommentsDocument document = unmarshaller.unmarshall(project);

		List<Comment> commentList = document.getCommentList();
		reviewHash = new Hashtable<String, Comment>();
		for (Comment comment : commentList) {
			reviewHash.put(comment.getId(), comment);
		}
		reviewFilePool.put(project, reviewHash);
		updateLastAccessTime(project);

		return reviewHash;
	}

	/**
	 * 
	 * @param project
	 * @return
	 */
	public synchronized boolean persistReviewFile(DavinciProject project) {
		if (null == project)
			return false;

		Hashtable<String, Comment> reviewHash = reviewFilePool.get(project);
		if (null == reviewHash)
			return false;

		CommentsDocument doc = project.getCommentsDocument();
		if (null == doc) {
			doc = new CommentsDocument(project);
			project.setCommentsDocument(doc);
		}

		reviewHash = (Hashtable<String, Comment>) Utils.deepClone(reviewHash);
		reviewHash.remove(LAST_ACCESS_TIME);
		// clearUnconsistentComments(reviewHash);
		doc.setCommentList(new ArrayList<Comment>(reviewHash.values()));

		Marshaller marshaller = new Marshaller(project);
		try {
			marshaller.marshall(false);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	public synchronized boolean clearReviewForProject(DavinciProject project) {
		Hashtable<String, Comment> reviewHash = reviewFilePool.get(project);
		if (null == reviewHash)
			return true;

		Comment lastAccessTime = reviewHash.get(LAST_ACCESS_TIME);
		lastAccessTime.setCreated(new Date(0));
		reviewHash.clear();
		reviewHash.put(LAST_ACCESS_TIME, lastAccessTime);
		return true;
	}

	/**
	 * 
	 * @param project
	 * @return
	 */
	private synchronized boolean destroyReviewFile(DavinciProject project, boolean forced) {
		if (null == project)
			return false;

		Hashtable<String, Comment> reviewHash = reviewFilePool.get(project);
		if (null == reviewHash)
			return true;

		Comment lastAccessTime = reviewHash.get(LAST_ACCESS_TIME);
		if (System.currentTimeMillis() - lastAccessTime.getCreated().getTime() > DESTROY_TIME
				|| forced) {
			persistReviewFile(project);
			reviewHash.clear();
			reviewFilePool.remove(project);
			return true;
		}
		return false;
	}

	/**
	 * 
	 * @param project
	 * @return
	 */
	public synchronized boolean destroyAllReview() {
		Set<DavinciProject> keys = reviewFilePool.keySet();
		for (DavinciProject project : keys) {
			destroyReviewFile(project, true);
		}
		return true;
	}

	public void run() {
		while (!stop) {
			try {
				Thread.sleep(SLEEP_TIME);
				recycle();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}

	public synchronized void recycle() {
		Set<DavinciProject> keySet = reviewFilePool.keySet();
		for (DavinciProject prj : keySet) {
			if (!this.destroyReviewFile(prj, false)) { // Destroy will persist the project.
				this.persistReviewFile(prj);
			}
		}
	}

	public void markStop() {
		stop = true;
	}

	public synchronized boolean republish(DavinciProject project,String parentVersion, Version version) {
		Hashtable<String, Comment> reviewHash = loadReviewFile(project);
		if (null == reviewHash)
			return false;

		Set<Entry<String, Comment>> entries = reviewHash.entrySet();
		Comment newOne, oldOne;
		String s;
		String[] parts;
		Map<String, Comment> tmpReview = new HashMap<String, Comment>();
		for (Entry<String, Comment> entry : entries) {
			if (LAST_ACCESS_TIME.equals(entry.getKey()))
				continue;

			oldOne = entry.getValue();
			if (!Comment.STATUS_CLOSED.equalsIgnoreCase(oldOne.getStatus())&&parentVersion.equals(oldOne.getPageVersion())) {
				newOne = (Comment) Utils.deepClone(oldOne);

				// Re-calculate the comment id
				s = newOne.getId();
				String drawingJson = newOne.getDrawingJson();
				if (s.contains("_")) {
					parts = s.split("_");
					s = parts[0] + '_' + (Integer.parseInt(parts[1]) + 1);
				} else {
					s += ("_" + 1);
				}
				drawingJson = drawingJson.replace(newOne.getId(), s);
				newOne.setDrawingJson(drawingJson);
				newOne.setId(s);

				
				// Re-calculate the comment replyTo id
				s = newOne.getReplyTo();
				if (!"0".equals(s)) {
					if (s.contains("_")) {
						parts = s.split("_");
						s = parts[0] + '_' + (Integer.parseInt(parts[1]) + 1);
					} else {
						s += ("_" + 1);
					}
				}
				newOne.setReplyTo(s);

				// Re-calculate the comment page name
				s = newOne.getPageName();
				if (null != s) {
					parts = s.split("/");
					newOne.setPageName(parts[0] + '/' + parts[1] + '/' + version.getTime() + '/'
							+ parts[3] + '/' + parts[4]);
				}
				tmpReview.put(newOne.getId(), newOne);
			}
		}
		reviewHash.putAll(tmpReview);

		return true;
	}

	/*
	 * 
	 */
	/*
	 * private synchronized boolean clearUnconsistentComments(Hashtable<String, Comment> reviewHash)
	 * { if (null == reviewHash) return false; else if (reviewHash.isEmpty()) return true;
	 * 
	 * Set<Entry<String, Comment>> entries = reviewHash.entrySet(); Comment comment; Comment
	 * fatherComment; for (Entry<String, Comment> entry : entries) { comment = entry.getValue(); if
	 * (!Util.isBlank(comment.getReplyTo()) && !"0".equals(comment.getReplyTo())) { fatherComment =
	 * reviewHash.get(comment.getReplyTo()); if (null != fatherComment)
	 * comment.setStatus(fatherComment.getStatus()); } }
	 * 
	 * return true; }
	 */
}

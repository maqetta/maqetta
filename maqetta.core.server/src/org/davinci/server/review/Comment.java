package org.davinci.server.review;

import java.io.Serializable;

import java.lang.reflect.Field;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.davinci.server.user.IDavinciProject;

import org.davinci.server.util.JSONWriter;

/**
 * This class represents a comment from reviewer.
 * 
 */
public class Comment implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/*
	 * This section contains the parameter names in HTTP request, which will be used when parsing a
	 * comment from a request.
	 */
	public static final String ID = "id";

	public static final String PAGE_STATE = "pageState";

	public static final String OWNER_ID = "ownerId";

	public static final String SUBJECT = "subject";

	public static final String CONTENT = "content";

//	public static final String ORDER = "order";

//	public static final String DEPTH = "depth";

	public static final String DRAWING_JSON = "drawingJson";

	public static final String FLAG = "flag";

	public static final String CREATED = "created";

//	public static final String PREVIOUS_ORDER = "previous";

//	public static final String NEXT_ORDER = "next";

	public static final String REPLY_TO = "replyTo";

	public static final String EMAIL = "email";

	public static final String PAGE_NAME = "pageName";

	public static final String REOPEN_VERSION = "reopenVersion";

	public static final String SEVERITY = "severity";

	public static final String TYPE = "type";

	public static final String STATUS = "status";

	public static final String SEVERITY_HIGH = "high";

	public static final String SEVERITY_MEDIUM = "medium";

	public static final String SEVERITY_LOW = "low";

	public static final String TYPE_REQUIREMENT = "requirement";

	public static final String TYPE_DEFECT = "defect";

	public static final String TYPE_FIX = "fix";

	public static final String STATUS_OPEN = "open";

	public static final String STATUS_CLOSED = "Close";

	// Indicates which fields should be included when transforming object to
	// Json format.
	private static Map<String, Boolean> fieldInclusionMap = new HashMap<String, Boolean>();

	/*
	 * Non-static members
	 */
	private String id;

	private String pageState;

	private String drawingJson;

	private String ownerId;

	private String subject;

	private String content;

	private Date created;
	
	private Date updateTime;

//	private float order;

//	private short depth;

	private String replyTo;

	private String email;

	private String severity;

	private String type;

	private String status;

	// Which project the comment belongs to
	private IDavinciProject project;

	private String pageName;
	
	private String pageVersion;

	private String reopenVersion;

	static {
		fieldInclusionMap.put(Comment.ID, Boolean.TRUE);
		fieldInclusionMap.put(Comment.PAGE_STATE, Boolean.TRUE);
		fieldInclusionMap.put(Comment.PAGE_NAME, Boolean.TRUE);
		fieldInclusionMap.put(Comment.OWNER_ID, Boolean.TRUE);
		fieldInclusionMap.put(Comment.REPLY_TO, Boolean.TRUE);
		fieldInclusionMap.put(Comment.EMAIL, Boolean.TRUE);
		fieldInclusionMap.put(Comment.SUBJECT, Boolean.TRUE);
		fieldInclusionMap.put(Comment.CONTENT, Boolean.TRUE);
		fieldInclusionMap.put(Comment.CREATED, Boolean.TRUE);
//		fieldInclusionMap.put(Comment.ORDER, Boolean.TRUE);
//		fieldInclusionMap.put(Comment.DEPTH, Boolean.TRUE);
		fieldInclusionMap.put(Comment.DRAWING_JSON, Boolean.TRUE);
		fieldInclusionMap.put(Comment.SEVERITY, Boolean.TRUE);
		fieldInclusionMap.put(Comment.STATUS, Boolean.TRUE);
		fieldInclusionMap.put(Comment.TYPE, Boolean.TRUE);

	}

	public Comment() {
		id = "";
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getDrawingJson() {
		return drawingJson;
	}

	public void setDrawingJson(String drawingJson) {
		this.drawingJson = drawingJson;
	}

	public String getOwnerId() {
		return ownerId;
	}

	public void setOwnerId(String ownerId) {
		this.ownerId = ownerId;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

//	public float getOrder() {
//		return order;
//	}
//
//	public void setOrder(float order) {
//		this.order = order;
//	}

//	public short getDepth() {
//		return depth;
//	}
//
//	public void setDepth(short depth) {
//		this.depth = depth;
//	}

	public String getPageState() {
		return pageState;
	}

	public void setPageState(String pageState) {
		this.pageState = pageState;
	}

	public IDavinciProject getProject() {
		return project;
	}

	public void setProject(IDavinciProject project) {
		this.project = project;
	}

	public void setReplyTo(String replyTo) {
		this.replyTo = replyTo;
	}

	public String getReplyTo() {
		return replyTo;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getEmail() {
		return email;
	}

	public void setPageName(String pageName) {
		this.pageName = pageName;
		this.pageVersion = pageName.split("/")[2];
	}

	public String getPageName() {
		return this.pageName;
	}
	
	public String getPageVersion(){
		return this.pageVersion;
	}

	public String getReopenVersion() {
		return reopenVersion;
	}

	public void setReopenVersion(String reopenVersion) {
		this.reopenVersion = reopenVersion;
	}

	public String getSeverity() {
		return severity;
	}

	public void setSeverity(String severity) {
		this.severity = severity;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	/**
	 * Transform the object into a Json format.
	 * 
	 * @return
	 */
	public String toString() {
		JSONWriter writer = new JSONWriter(false);
		
		//StringBuffer jsonFormat = new StringBuffer("{");

		Field[] fields = this.getClass().getDeclaredFields();
		Boolean inclusive;
		String fieldName;
		Object returnValue;
		for (int i = 0; i < fields.length; i++) {
			fieldName = (String) fields[i].getName();
			inclusive = Comment.fieldInclusionMap.get(fieldName);
			if (Boolean.TRUE.equals(inclusive)) {
				try {
					returnValue = fields[i].get(this);
					if ("created".equals(fieldName))
						returnValue = ((Date) returnValue).getTime();
				} catch (Exception e) {
					returnValue = new Object();
					e.printStackTrace();
				}
				writer.addField(fieldName, null == returnValue ? "" : returnValue.toString());
				
			}
		}
		return writer.getJSON();
	}
	
	public Date getUpdateTime() {
		return updateTime;
	}

	public void setUpdateTime(Date updateTime) {
		this.updateTime = updateTime;
	}

	/**
	 * Unit Test Driver
	 * 
	 * @param args
	 */
	public static void main(String[] args) {
	}
}

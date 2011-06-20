package org.davinci.server.review;

import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.user.Person;
import org.davinci.server.user.User;

public class Constants {
	public static final String BUNDLE_ID = "davinci.review";
	
	public static final String REVIEW_DIRECTORY_NAME=".review";

	public static final String REVIEW_INFO = "DAVINCI.REVIEW";
	public static final String REVIEW_COOKIE_DESIGNER = "davinci_designer";
	public static final String REVIEW_COOKIE_DESIGNER_EMAIL = "davinci_designer_email";
	public static final String REVIEW_COOKIE_VERSION = "davinci_version";
	public static final String REVIEW_COOKIE_FILE = "davinci_file";
	public static final String REVIEW_COOKIE_CMTID = "davinci_commentId";
	
	public static final String FAKE_REVIEWER = "davinci.review.fakeReviewer";
	
	public static final String DATE_PATTERN = "yyyy-MM-dd HH:mm:ss";

	public static final String EXTENSION_POINT_MAIL_CONFIG = "mailConfig";
	public static final String EP_TAG_MAIL_CONFIG = "mailConfig";
	public static final String EP_ATTR_MAIL_CONFIG_MAILSERVER = "smtp.mailServer";
	public static final String EP_ATTR_MAIL_CONFIG_NOTIFICATIONID = "smtp.notificationId";
	public static final String EP_ATTR_MAIL_CONFIG_LOGINUSER = "smtp.loginUser";
	public static final String EP_ATTR_MAIL_CONFIG_PASSWORD = "smtp.password";
	
	public static final String TEMPLATE_PROPERTY_FILE = "review.properties";
	public static final String TEMPLATE_INVITATION_SUBJECT_PREFIX = "maqetta.review.invitationSubject";
	public static final String TEMPLATE_INVITATION = "maqetta.review.invitationTemplate";
	public static final String TEMPLATE_COMMENT_NOTIFICATION_SUBJECT = "maqetta.review.commentNotificationSubject";
	public static final String TEMPLATE_COMMENT = "maqetta.review.commentTemplate";
	
	public static final User LOCAL_INSTALL_USER;

	public static final String LOCAL_INSTALL_USER_NAME = IDavinciServerConstants.LOCAL_INSTALL_USER;
	static {
		LOCAL_INSTALL_USER = 
			 new User(new Person() {
				public String getUserName() {
					return LOCAL_INSTALL_USER_NAME;
				}
				public String getEmail() {
					return "";
				}
			 }
			,ReviewManager.getReviewManager().getBaseDirectory());
		
	}
}

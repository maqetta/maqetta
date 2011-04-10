package org.davinci.server.review;

import java.io.File;

import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.user.Person;
import org.davinci.server.user.User;

public class Constants {
	public static final String BUNDLE_ID = "davinci.review";
	
	public static final String REVIEW_DIRECTORY_NAME=".review";

	public static final String REVIEW_INFO = "DAVINCI.REVIEW";
	public static final String REVIEW_COOKIE_DESIGNER = "davinci_designer";
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
	
	/**
	 * notification subject of adding comment.
	 */
	public static final String ADD_COMMENT_NOTIFICATION_SUBJECT = "Reviewer has added comment(s) on your page.";

	/**
	 * notification subject of inviting user to review.
	 */
	public static final String PUBLISH_NOTIFICATION_SUBJECT = "You have been invited to review published file(s)";

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

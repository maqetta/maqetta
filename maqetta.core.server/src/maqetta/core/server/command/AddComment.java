package maqetta.core.server.command;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SimpleTimeZone;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.user.DavinciProject;
import maqetta.core.server.user.ReviewManager;

import org.davinci.server.review.Comment;
import org.davinci.server.review.Constants;
import org.davinci.server.review.Utils;
import org.davinci.server.review.Version;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.user.IUser;
import org.davinci.server.user.IUserManager;
import org.davinci.server.user.UserException;
import org.eclipse.orion.server.useradmin.UserEmailUtil;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

@SuppressWarnings("restriction")
public class AddComment extends Command {

	static final private Logger theLogger = Logger.getLogger(AddComment.class.getName());

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user)
			throws IOException {
		Comment comment = extractComment(req);
		
		IUserManager userManager = ServerManager.getServerManager().getUserManager();
		String designerName = comment.getDesignerId();
		IUser designer = null;
		try {
			if(ServerManager.LOCAL_INSTALL && IDavinciServerConstants.LOCAL_INSTALL_USER.equalsIgnoreCase(designerName)) {
				designer = userManager.getUser(IDavinciServerConstants.LOCAL_INSTALL_USER);
			} else {
				designer = userManager.getUser(designerName);
			}
		} catch (UserException e) {
			errorString = "Failure getting user for 'designer'. Reason: " + e.getMessage();
			theLogger.severe((String) errorString);
			return;
		}
		
		//Set up project based on designer
		DavinciProject project = new DavinciProject();
		project.setOwnerId(designer.getUserID());
		comment.setProject(project);

		comment.setEmail(user.getPerson().getEmail());

		IDesignerUser du = ReviewManager.getReviewManager()
				.getDesignerUser(designerName);
		Version version = du.getVersion(comment.getPageVersion());

		if (version != null && version.isClosed()){
			errorString = "The version was closed by another user while editing. Please reload the review data.";
			return;
		}
		List<Comment> commentList = new ArrayList<Comment>(1);
		commentList.add(comment);
		ReviewCacheManager.$.updateComments(commentList);

		String emailResult = null;
		if (version != null && version.isReceiveEmail()) { // Send the notification only the designer want receive it.
			Boolean zazl = req.getParameter("zazl") != null;
			emailResult = notifyRelatedPersons(user, designer, comment, req, zazl);
		}

		SimpleDateFormat sdf = new SimpleDateFormat(Constants.DATE_PATTERN);
		sdf.setCalendar(Calendar.getInstance(new SimpleTimeZone(0, "GMT")));
		try {
			JSONObject json = new JSONObject()
					.put("id", comment.getId())
					.put("created", sdf.format(comment.getCreated()))
//						.put("order", comment.getOrder())
					.put("email", user.getPerson().getEmail())
					.put("reviewer", user.getUserID());
			if (emailResult != null) {
				json.put("emailResult", emailResult);
			}
			responseString = json.toString();
		} catch (JSONException e) { /*ignore*/ }
	}

	protected String notifyRelatedPersons(IUser reviewer, IUser designer, Comment comment,
			HttpServletRequest req, Boolean zazl) {
		String to = designer.getPerson().getEmail();
		if (to != null && !to.trim().equals("")) {
			String subject = Utils.getTemplates().getProperty(Constants.TEMPLATE_COMMENT_NOTIFICATION_SUBJECT);
			String htmlContent = getHtmlContent(reviewer, comment, req.getRequestURL().toString(), zazl);
			try {
				UserEmailUtil.getUtil().sendEmail(subject, htmlContent, to);
			} catch (Exception e) {
				// Email server not reachable or not configured. Return email contents to client.
				// Note: We do not return an error on the request since sending an email notification
				// is a secondary goal; the primary goal is to add a new comment.
				return htmlContent;
			}
		}
		return "OK";
	}

//	private static String unescape(String str) {
//		if (str == null)
//			return null;
//
//		String regEx = "%u([0-9A-F]{4})";
//		Pattern p = Pattern.compile(regEx);
//		Matcher m = p.matcher(str);
//
//		StringBuffer sb = new StringBuffer();
//
//		while (m.find()) {
//			String group = m.group().substring(2);
//			m.appendReplacement(sb, String.valueOf((char) (Integer.parseInt(group, 16))));
//		}
//
//		m.appendTail(sb);
//
//		return sb.toString();
//	}

//	private static String decode(String str) {
//		/*if (str == null) {
//			return null;
//		}
//
//		try {
//			return URLDecoder.decode(unescape(str), "UTF-8");
//		} catch (UnsupportedEncodingException e) {
//			// ignore, never happen.
//			return null;
//		}*/
//		return str;
//	}

	private String getHtmlContent(IUser reviewer, Comment comment, String requestUrl, Boolean zazl) {
		String commentTitle = comment.getSubject();;
		String pageName = comment.getPageName();
		
		int index = pageName.lastIndexOf("/");
		if (index > -1) {
			pageName = pageName.substring(index + 1);
		}

		Map<String, String> props = new HashMap<String, String>();
		props.put("displayName", reviewer.getPerson().getDisplayName());
		props.put("pagename", pageName);
		props.put("url", ReviewManager.getReviewManager().getReviewUrl(comment.getDesignerId(), comment.getPageVersion(),  requestUrl, zazl)); 
		props.put("title", commentTitle);
		props.put("content", comment.getContent());
		props.put("pagestate", comment.getPageState());
		props.put("pagestatelist", comment.getPageStateList());
		props.put("viewscene", comment.getViewScene());
		props.put("viewscenelist", comment.getViewSceneList());
		props.put("time", comment.getCreated().toString());
		
		return Utils.substitute(Utils.getTemplates().getProperty(Constants.TEMPLATE_COMMENT), props);
	}

	protected Comment extractComment(HttpServletRequest req) {
		Comment comment = new Comment();
		String paramValue;

		paramValue = req.getParameter(Comment.ID);
		comment.setId(paramValue);

		paramValue = req.getParameter(Comment.CONTENT);
		comment.setContent(paramValue);

//		paramValue = req.getParameter(Comment.DEPTH);
//		comment.setDepth(Short.parseShort(paramValue));

		paramValue = req.getParameter(Comment.OWNER_ID);
		comment.setOwnerId(paramValue);

		paramValue = req.getParameter(Comment.DESIGNER_ID);
		comment.setDesignerId(paramValue);
		
		paramValue = req.getParameter(Comment.PAGE_NAME);
		comment.setPageName(paramValue);

		paramValue = req.getParameter(Comment.PAGE_STATE);
		comment.setPageState(paramValue);

		paramValue = req.getParameter(Comment.PAGE_STATE_LIST);
		comment.setPageStateList(paramValue);

		paramValue = req.getParameter(Comment.VIEW_SCENE);
		comment.setViewScene(paramValue);

		paramValue = req.getParameter(Comment.VIEW_SCENE_LIST);
		comment.setViewSceneList(paramValue);

		paramValue = req.getParameter(Comment.SUBJECT);
		comment.setSubject(paramValue);

//		paramValue = req.getParameter(Comment.PREVIOUS_ORDER);
//		comment.setOrder(Float.parseFloat(paramValue));
//
//		paramValue = req.getParameter(Comment.NEXT_ORDER);
//		comment.setOrder((comment.getOrder() + Float.parseFloat(paramValue)) / 2);

		paramValue = req.getParameter(Comment.REPLY_TO);
		comment.setReplyTo(paramValue);

		paramValue = req.getParameter(Comment.REOPEN_VERSION);
		comment.setReopenVersion(paramValue);

		paramValue = req.getParameter(Comment.DRAWING_JSON);
		comment.setDrawingJson(paramValue);

		comment.setCreated(new Date());

		return comment;
	}
}

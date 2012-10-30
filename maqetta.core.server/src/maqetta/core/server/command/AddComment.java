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
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;
import org.maqetta.server.mail.SimpleMessage;
import org.maqetta.server.mail.SmtpPop3Mailer;

public class AddComment extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user)
			throws IOException {
		try {
			Comment comment = extractComment(req);
			
			IUserManager userManager = ServerManager.getServerManger().getUserManager();
			String designerName = comment.getDesignerId();
			IUser designer = null;
			if(ServerManager.LOCAL_INSTALL && IDavinciServerConstants.LOCAL_INSTALL_USER.equalsIgnoreCase(designerName)) {
				designer = userManager.getUser(IDavinciServerConstants.LOCAL_INSTALL_USER);
			} else {
				designer = userManager.getUser(designerName);
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
				throw new Exception("The version is closed by others during your editting. Please reload the review data.");
			}
			List<Comment> commentList = new ArrayList<Comment>(1);
			commentList.add(comment);
			ReviewCacheManager.$.updateComments(commentList);

			if (version != null && version.isReceiveEmail()) // Send the notification only the designer want receive it.
				notifyRelatedPersons(user, designer, comment, req);

			//FIXME: use JSONWriter?
			SimpleDateFormat sdf = new SimpleDateFormat(Constants.DATE_PATTERN);
			sdf.setCalendar(Calendar.getInstance(new SimpleTimeZone(0, "GMT")));
			responseString = "{\"id\":\"" + comment.getId() + "\",\"created\":\""
					+ sdf.format(comment.getCreated()) /*+ ",order:'" + comment.getOrder()
					+ "'*/ + "\",\"email\":\"" + user.getPerson().getEmail() + "\",\"reviewer\":\"" + user.getUserID()
					+ "\"}";
		} catch (Exception e) {
			e.printStackTrace();
			errorString = "The review is not added successfully. Reason: " + e.getMessage();
			//resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, errorString);
		}
	}

	protected void notifyRelatedPersons(IUser reviewer, IUser designer, Comment comment, HttpServletRequest req) {
		String to = designer.getPerson().getEmail();
		if (to != null && !to.trim().equals("")) {
			String htmlContent = getHtmlContent(reviewer, comment, req.getRequestURL().toString());
			String notifId = Utils.getCommonNotificationId(req);
			SimpleMessage email = new SimpleMessage(notifId,
					designer.getPerson().getEmail(), null, null, Utils.getTemplates().getProperty(Constants.TEMPLATE_COMMENT_NOTIFICATION_SUBJECT),
					htmlContent);
//			SmtpPop3Mailer.send(email);
			try {
				SmtpPop3Mailer mailer = SmtpPop3Mailer.getDefault();
				if(mailer != null){
					mailer.sendMessage(email);
				}else{
					this.responseString = "Failed to send mail to users. "+"Mail server is not configured. Mail notification is cancelled.";
					System.out.println("Mail server is not configured. Mail notification is cancelled.");
				}
			} catch (Exception e) {
				this.responseString = "Failed to send mail to users. "+e.getMessage();
				e.printStackTrace();
			}
		}
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

	private String getHtmlContent(IUser reviewer, Comment comment, String requestUrl) {
		String commentTitle = comment.getSubject();;
		String pageName = comment.getPageName();
		
		int index = pageName.lastIndexOf("/");
		if (index > -1) {
			pageName = pageName.substring(index + 1);
		}

		Map<String, String> props = new HashMap<String, String>();
		props.put("displayName", reviewer.getPerson().getEmail());
		props.put("pagename", pageName);
		props.put("url", ReviewManager.getReviewManager().getReviewUrl(comment.getDesignerId(), comment.getPageVersion(),  requestUrl)); 
		props.put("title", commentTitle);
		props.put("content", comment.getContent());
		props.put("pagestate", comment.getPageState());
		props.put("pagestatelist", comment.getPageStateList());
		props.put("viewscene", comment.getViewScene());
		props.put("viewscenelist", comment.getViewSceneList());
		props.put("time", comment.getCreated().toString());
		
		return Utils.substitude(Utils.getTemplates().getProperty(Constants.TEMPLATE_COMMENT), props);
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

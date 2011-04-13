package org.davinci.server.review.command;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.mail.MessagingException;
import javax.mail.SendFailedException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.mail.SimpleMessage;
import org.davinci.server.mail.SmtpPop3Mailer;
import org.davinci.server.review.Comment;
import org.davinci.server.review.Constants;
import org.davinci.server.review.DavinciProject;
import org.davinci.server.review.DesignerUser;
import org.davinci.server.review.ReviewManager;
import org.davinci.server.review.ReviewObject;
import org.davinci.server.review.Util;
import org.davinci.server.review.Version;
import org.davinci.server.review.persistence.CommentDao;
import org.davinci.server.review.persistence.CommentDaoFactory;
import org.davinci.server.review.persistence.CommentDaoFactory.DaoType;
import org.davinci.server.user.User;
import org.davinci.server.user.UserManager;

public class AddComment extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user)
			throws IOException {
		try {
			UserManager userManager = ServerManager.getServerManger().getUserManager();
			String designerName = ((ReviewObject) req.getSession().getAttribute(Constants.REVIEW_INFO)).getDesignerName();
			User designer = null;
			if(ServerManager.LOCAL_INSTALL && IDavinciServerConstants.LOCAL_INSTALL_USER.equalsIgnoreCase(designerName))
				designer = userManager.getUser(IDavinciServerConstants.LOCAL_INSTALL_USER);
			else
				designer = userManager.getUser(designerName);

			Comment comment = extractComment(req);
			DavinciProject project = new DavinciProject();
			project.setOwnerId(designer.getUserName());
			comment.setProject(project);

			comment.setEmail(user.getPerson().getEmail());

			CommentDao commDao = CommentDaoFactory.getInstance(DaoType.XML);
			if (null != commDao) {
				DesignerUser du = ReviewManager.getReviewManager()
						.getDesignerUser(designerName);
				Version version = du.getVersion(comment.getPageVersion());

				if (version != null && version.isClosed())
					throw new Exception(
							"The version is closed by others during your editting. Please reload the review data.");
				List<Comment> commentList = new ArrayList<Comment>(1);
				commentList.add(comment);
				commDao.insertComments(commentList);

				if (version != null && version.isReceiveEmail())// Send the notification only the
																// designer want receive it.
					notifyRelatedPersons(user, designer, comment);

				responseString = "{id:'" + comment.getId() + "',created:"
						+ comment.getCreated().getTime() /*+ ",order:'" + comment.getOrder()
						+ "'*/ + ",email:'" + user.getPerson().getEmail() + "',reviewer:'" + user.getUserName()
						+ "'}";
			} else
				throw new RuntimeException("Server error!");
		} catch (Exception e) {
			e.printStackTrace();
			errorString = "The review is not added successfully. Reason: " + e.getMessage();
			//resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, errorString);
		}
	}

	protected void notifyRelatedPersons(User reviewer, User designer, Comment comment) {
		String to = designer.getPerson().getEmail();
		if (to != null && !to.trim().equals("")) {
			String htmlContent = getHtmlContent(reviewer, comment);
			SimpleMessage email = new SimpleMessage(Util.getCommonNotificationId(),
					designer.getPerson().getEmail(), null, null, Constants.ADD_COMMENT_NOTIFICATION_SUBJECT,
					htmlContent);
//			SmtpPop3Mailer.send(email);
			try {
				SmtpPop3Mailer mailer = SmtpPop3Mailer.getDefault();
				if(mailer != null){
					mailer.sendMessage(email);
				}else{
					this.responseString = "Failed to send mail to users. "+"Mail server is not configured. Mail notificatioin is cancelled.";
					System.out.println("Mail server is not configured. Mail notificatioin is cancelled.");
				}
			} catch (Exception e) {
				this.responseString = "Failed to send mail to users. "+e.getMessage();
				e.printStackTrace();
			}
		}
	}

	private static String unescape(String str) {
		if (str == null)
			return null;

		String regEx = "%u([0-9A-F]{4})";
		Pattern p = Pattern.compile(regEx);
		Matcher m = p.matcher(str);

		StringBuffer sb = new StringBuffer();

		while (m.find()) {
			String group = m.group().substring(2);
			m.appendReplacement(sb, String.valueOf((char) (Integer.parseInt(group, 16))));
		}

		m.appendTail(sb);

		return sb.toString();
	}

	private static String decode(String str) {
		/*if (str == null) {
			return null;
		}

		try {
			return URLDecoder.decode(unescape(str), "UTF-8");
		} catch (UnsupportedEncodingException e) {
			// ignore, never happen.
			return null;
		}*/
		return str;
	}

	private String getHtmlContent(User reviewer, Comment comment) {
		String commentTitle = null;
		String commentContent = null;
		commentTitle = decode(comment.getSubject());
		commentContent = decode(comment.getContent());

		String pageName = decode(comment.getPageName());
		int index = pageName.lastIndexOf("/");
		if (index > -1) {
			pageName = pageName.substring(index + 1);
		}

		StringBuffer content = new StringBuffer();
		content.append(Util.genHtmlHeader());

		content.append("<table>");
		content.append("<caption>" + reviewer.getUserName() + " add comment on your page \""
				+ pageName + "\"</caption>");

		content.append("<tr>");
		content.append("<th>Comment owner:</th>");
		content.append("<td>" + reviewer.getUserName() + "</td>");
		content.append("</tr>");

		content.append("<tr>");
		content.append("<th>Comment subject:</th>");
		content.append("<td>" + commentTitle + "</td>");
		content.append("</tr>");

		content.append("<tr>");
		content.append("<th>Comment type:</th>");
		content.append("<td>" + comment.getType() + "</td>");
		content.append("</tr>");

		content.append("<tr>");
		content.append("<th>Comment severity:</th>");
		content.append("<td>" + comment.getSeverity() + "</td>");
		content.append("</tr>");

		content.append("<tr>");
		content.append("<th>Comment status:</th>");
		content.append("<td>" + comment.getStatus() + "</td>");
		content.append("</tr>");

		content.append("<tr>");
		content.append("<th>Comment content:</th>");
		content.append("<td>" + commentContent + "</td>");
		content.append("</tr>");

		content.append("<tr>");
		content.append("<th>Page name:</th>");
		content.append("<td>" + pageName + "</td>");
		content.append("</tr>");

		content.append("<tr>");
		content.append("<th>Page state:</th>");
		content.append("<td>" + comment.getPageState() + "</td>");
		content.append("</tr>");

		content.append("<tr>");
		content.append("<th>Comment timestamp:</th> ");
		content.append("<td>" + comment.getCreated() + "</td>");
		content.append("</tr>");

		content.append("</table>");

		content.append("<div>");
		content.append("<p>You are receiving this mail because you are designer of this page.</p>");
		content.append("<br />");
		content.append("<p>DO NOT RESPOND TO THE SERVICE MACHINE THAT GENERATED THIS NOTE</p>");
		content.append("</div>");
		content.append(Util.genHtmlTail());

		return content.toString();
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

		paramValue = req.getParameter(Comment.PAGE_NAME);
		comment.setPageName(paramValue);

		paramValue = req.getParameter(Comment.PAGE_STATE);
		comment.setPageState(paramValue);

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

		paramValue = req.getParameter(Comment.SEVERITY);
		comment.setSeverity(paramValue);

		paramValue = req.getParameter(Comment.TYPE);
		comment.setType(paramValue);

		paramValue = req.getParameter(Comment.STATUS);
		comment.setStatus(paramValue);

		comment.setCreated(Util.getCurrentDateInGmt0());

		return comment;
	}
}

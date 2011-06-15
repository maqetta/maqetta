package org.davinci.server.review.command;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.ServerManager;
import org.davinci.server.mail.SimpleMessage;
import org.davinci.server.mail.SmtpPop3Mailer;
import org.davinci.server.review.Constants;
import org.davinci.server.review.DavinciProject;
import org.davinci.server.review.DesignerUser;
import org.davinci.server.review.ReviewManager;
import org.davinci.server.review.Reviewer;
import org.davinci.server.review.Utils;
import org.davinci.server.review.Version;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.user.User;

public class Publish extends Command {
	SmtpPop3Mailer mailer = SmtpPop3Mailer.getDefault();
	
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			User user) throws IOException {

		Version version = null;
		Boolean isUpdate = req.getParameter("isUpdate").equals("true") ? true
				: false;
		String vTime = req.getParameter("vTime");
		Boolean isRestart = req.getParameter("isRestart").equals("true") ? true
				: false;

		String reviewersStr = req.getParameter("reviewers");
		String emailsStr = req.getParameter("emails");
		String message = req.getParameter("message");
		String versionTitle = req.getParameter("versionTitle");
		String[] resources = req.getParameterValues("resources");
		String desireWidth = req.getParameter("desireWidth");
		String desireHeight = req.getParameter("desireHeight");
		Boolean savingDraft = req.getParameter("savingDraft") == null ? false
				: true;
		String dueDate = req.getParameter("dueDate");
		Boolean receiveEmail = req.getParameter("receiveEmail").equals("true") ? true
				: false;

		String[] names = reviewersStr.split(",");
		String[] emails = emailsStr.split(",");
		List<Reviewer> reviewers = new ArrayList<Reviewer>();

		Date currentTime = new Date();
		SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
		String timeVersion = formatter.format(currentTime);

		for (int i = 0; i < names.length; i++) {
			String name = names[i];
			String email = emails[i];
			if (name != null && name != "" && !email.equals(user.getPerson().getEmail()))
				reviewers.add(new Reviewer(name, email));
		}

		reviewers.add(new Reviewer(user.getUserName(), user.getPerson().getEmail()));
		
		String fakeReviewer = ServerManager.getServerManger().getDavinciProperty(Constants.FAKE_REVIEWER);
		if(fakeReviewer != null)
			reviewers.add(new Reviewer("fakeReviewer", fakeReviewer));

		DesignerUser du = ReviewManager.getReviewManager()
				.getDesignerUser(user.getUserName());

		if (!isUpdate) {
			String id = null;
			int latestVersionID = 1;
			if(du.getLatestVersion() == null||du.getVersion(du.getLatestVersion().getTime())==null){
				List<Version> versions = du.getVersions();
				for(Version temp: versions){
					int i = Integer.parseInt(temp.getVersionID());
					if(i>latestVersionID){
						latestVersionID = i;
					}
				}
				id=latestVersionID+"";
			}
			else {
				int latestID = Integer.parseInt(du.getLatestVersion()
						.getVersionID());
				id = latestID + 1 + "";
			}
			version = new Version(id, timeVersion, savingDraft, dueDate,
					desireWidth, desireHeight);
			du.addVersion(version);
			du.setLatestVersion(version);
		} else {
			version = du.getVersion(vTime);
		}

		version.setDraft(savingDraft);
		version.setDueDate(dueDate);
		version.setDesireWidth(desireWidth);
		version.setDesireHeight(desireHeight);
		version.setReviewers(reviewers);
		version.setVersionTitle(versionTitle);
		if (resources != null)
			version.setResource(resources);
		version.setHasClosedManually(false);
		version.setDescription(message);
		version.setReceiveEmail(receiveEmail);

		if (isRestart) {
			version.setRestartFrom(vTime);
			du.getVersion(vTime).setHasRestarted(true);
			DavinciProject project = new DavinciProject();
			project.setOwnerId(du.getName());
			ReviewCacheManager.$.republish(project,vTime, version);
		}
		if (savingDraft) {
			ReviewManager.getReviewManager()
					.saveDraft(user.getUserName(), version);
			this.responseString = "OK";
			return;
		}

		ReviewManager.getReviewManager()
				.publish(user.getUserName(), version);

		String requestUrl = req.getRequestURL().toString();
		// set is used to filter duplicate email. Only send mail to one email
		// one time.
		Set<String> set = new HashSet<String>();
		for (Reviewer reviewer : reviewers) {
			String mail = reviewer.getEmail();
			if (mail != null && !mail.equals("") && set.add(mail)) {
				String url = getUrl(user, timeVersion, requestUrl, mail);
				String htmlContent = getHtmlContent(user, message, url);
				notifyRelatedPersons(Utils.getCommonNotificationId(), mail,
						Utils.getTemplates().getProperty(Constants.TEMPLATE_INVITATION_SUBJECT_PREFIX) + " " + versionTitle, htmlContent);
			}
		}
		if(this.responseString==null)
		this.responseString = "OK";
	}

	private void notifyRelatedPersons(String from, String to, String subject,
			String htmlContent) {
		SimpleMessage email = new SimpleMessage(from, to, null, null, subject, htmlContent);
		try {
			if(mailer != null){
				mailer.sendMessage(email);
			}else{
				this.responseString = htmlContent;
				System.out.println("Mail server is not configured. Mail notificatioin is cancelled.");
			}
		} catch (MessagingException e) {
			this.responseString = htmlContent;
			e.printStackTrace();
		}
	}

	private String getHtmlContent(User user, String message, String url) {
		Map<String, String> props = new HashMap<String, String>();
		props.put("username", user.getUserName());
		props.put("message", message);
		props.put("url", url);
		props.put("email", user.getPerson().getEmail());
		return Utils.substitude(Utils.getTemplates().getProperty(Constants.TEMPLATE_INVITATION), props);
	}

	private String getUrl(User user, String version, String requestUrl, String reviewer) {
		String host = requestUrl.substring(0, requestUrl.indexOf('/', "http://".length()));
		String prefix =  System.getProperty("org.eclipse.equinox.http.jetty.context.path");
		if(prefix != null){
			return host + prefix + "/review/" + user.getUserName();
		} else {
			return host + "/review/" + user.getUserName();
		}
	}
}

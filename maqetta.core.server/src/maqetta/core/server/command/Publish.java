package maqetta.core.server.command;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SimpleTimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.user.DavinciProject;
import maqetta.core.server.user.ReviewManager;

import org.davinci.server.review.Constants;
import org.davinci.server.review.ReviewerVersion;
import org.davinci.server.review.Utils;
import org.davinci.server.review.Version;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.review.user.Reviewer;
import org.davinci.server.user.IUser;
import org.davinci.server.util.JSONWriter;
import org.eclipse.orion.server.useradmin.UserEmailUtil;
import org.maqetta.server.Command;
import org.maqetta.server.ServerManager;

@SuppressWarnings("restriction")
public class Publish extends Command {
	

    @Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
			IUser user) throws IOException {

		Version version = null;
		Boolean isUpdate = req.getParameter("isUpdate") != null ? 
				req.getParameter("isUpdate").equals("true") : false;
		String vTime = req.getParameter("vTime");
		Boolean isRestart = req.getParameter("isRestart") != null ? 
				req.getParameter("isRestart").equals("true") : false;
		String emailsStr = req.getParameter("emails");
		String message = req.getParameter("message");
		String versionTitle = req.getParameter("versionTitle");
		String[] resources = req.getParameterValues("resources");
		String desireWidth = req.getParameter("desireWidth");
		String desireHeight = req.getParameter("desireHeight");
		Boolean savingDraft = req.getParameter("savingDraft") != null;
		String dueDate = req.getParameter("dueDate");
		Boolean receiveEmail = req.getParameter("receiveEmail") != null ? 
				req.getParameter("receiveEmail").equals("true") : false;
		Boolean zazl = req.getParameter("zazl") != null;

		String[] emails = emailsStr.split(",");
		List<Reviewer> reviewers = new ArrayList<Reviewer>();

		IDesignerUser du = ReviewManager.getReviewManager().getDesignerUser(user);

		if (!isUpdate) {
			Date currentTime = new Date();
			SimpleDateFormat formatter = new SimpleDateFormat(Constants.DATE_PATTERN_SHORT);
			formatter.setCalendar(Calendar.getInstance(new SimpleTimeZone(0, "GMT")));
			String timeVersion = formatter.format(currentTime);
			
			String id = null;
			int latestVersionID = 1;
			if (du.getLatestVersion() == null|| du.getVersion(du.getLatestVersion().getTime()) == null) {
				List<Version> versions = du.getVersions();
				for(Version temp: versions){
					int i = Integer.parseInt(temp.getVersionID());
					if (i > latestVersionID) {
						latestVersionID = i;
					}
				}
				id=latestVersionID+"";
			} else {
				int latestID = Integer.parseInt(du.getLatestVersion().getVersionID());
				id = latestID + 1 + "";
			}
			version = new Version(id, timeVersion, savingDraft, dueDate,
					desireWidth, desireHeight);
			du.addVersion(version);
			du.setLatestVersion(version);
		} else {
			version = du.getVersion(vTime);
			
			//NOTE: In theory, it would be good to remove the review any reviewers 
			//no longer part of the review and persist the changes
		}
		
		//Deal with reviewers the designer has added to the review
		ReviewerVersion reviewerVersion = new ReviewerVersion(user.getUserID(), version.getTime());
		Reviewer tmpReviewer = null;
		for (int i = 0; i < emails.length; i++) {
			String email = emails[i];
			if (!email.equals(user.getPerson().getEmail())) {
				tmpReviewer = ReviewManager.getReviewManager().getReviewer("", email);
				tmpReviewer.addReviewerVersion(reviewerVersion);
				reviewers.add(tmpReviewer);
			}
		}

		//Add the designer as a reviewer
		tmpReviewer = ReviewManager.getReviewManager().getReviewer(user.getUserID(), user.getPerson().getEmail());
		tmpReviewer.addReviewerVersion(reviewerVersion);
		reviewers.add(tmpReviewer);

		//Handle fake reviewer (if necessary)
		String fakeReviewer = ServerManager.getServerManager().getDavinciProperty(Constants.FAKE_REVIEWER);
		if (fakeReviewer != null) {
			tmpReviewer = ReviewManager.getReviewManager().getReviewer("fakeReviewer", fakeReviewer);
			tmpReviewer.addReviewerVersion(reviewerVersion);
			reviewers.add(tmpReviewer);
		}

		version.setDraft(savingDraft);
		version.setDueDate(dueDate);
		version.setDesireWidth(desireWidth);
		version.setDesireHeight(desireHeight);
		version.setReviewers(reviewers);
		version.setVersionTitle(versionTitle);
		if (resources != null) {
			version.setResource(resources);
		}
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
		
		JSONWriter writer = new JSONWriter(true);
		writer.startObject();
		writer.addField("result", "OK");
		writer.addField("version", version.getTime());
		writer.addField("designer", du.getName());
		if (savingDraft) {
			ReviewManager.getReviewManager().saveDraft(du, version);
		} else {
			ReviewManager.getReviewManager().publish(du, version);
	
			String requestUrl = req.getRequestURL().toString();
			// set is used to filter duplicate email. Only send mail to one email
			// one time.
			Set<String> set = new HashSet<String>();
			String emailResult = null;
			for (Reviewer reviewer : reviewers) {
				String mail = reviewer.getEmail();
				if (mail != null && !mail.equals("") && set.add(mail)) {
					String url = ReviewManager.getReviewManager().getReviewUrl(user.getUserID(), version.getTime(), requestUrl, zazl);
					String htmlContent = getHtmlContent(user, message, url);
					String subject = Utils.getTemplates().getProperty(Constants.TEMPLATE_INVITATION_SUBJECT_PREFIX) + " " + versionTitle;
					emailResult = notifyRelatedPersons(mail, subject, htmlContent);
				}
			}
			if (emailResult != null) {
				writer.addField("emailResult", emailResult);
			}
		}
		writer.endObject();
		this.responseString = writer.getJSON();
        resp.setContentType("application/json;charset=UTF-8");
	}

	private String notifyRelatedPersons(String to, String subject, String htmlContent) {
		try {
			UserEmailUtil.getUtil().sendEmail(subject, htmlContent, to);
			return "OK";
		} catch (Exception e) {
			// Email server not reachable or not configured. Return email contents to client.
			// Note: We do not return an error on the request since sending an email notification
			// is a secondary goal; the primary goal is to add a new review session.
			return htmlContent;
		}
	}

	private String getHtmlContent(IUser user, String message, String url) {
		Map<String, String> props = new HashMap<String, String>();
		props.put("displayName", user.getPerson().getDisplayName());
		props.put("message", message);
		props.put("url", url);
		return Utils.substitute(Utils.getTemplates().getProperty(Constants.TEMPLATE_INVITATION), props);
	}
}
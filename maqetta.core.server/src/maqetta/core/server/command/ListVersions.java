package maqetta.core.server.command;

import java.io.IOException;
import java.util.Iterator;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.user.ReviewManager;

import org.davinci.server.review.ReviewerVersion;
import org.davinci.server.review.Version;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.review.user.Reviewer;
import org.davinci.server.user.IUser;
import org.davinci.server.util.JSONWriter;
import org.maqetta.server.Command;

public class ListVersions extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, IUser user)
			throws IOException {

		String designerIDParm = (String) req.getParameter("designer");
		
		ReviewManager commentingManager = ReviewManager.getReviewManager();

		String userEmail = user.getPerson().getEmail();
		Reviewer reviewerUser = commentingManager.getReviewer(userEmail);

		JSONWriter writer = new JSONWriter(true);
		Iterator<ReviewerVersion> iterator = reviewerUser.getReviewerVersions();
		while (iterator.hasNext()) {
			ReviewerVersion reviewerVersion = iterator.next();

			String reviewDesignerID = reviewerVersion.getDesignerID();
			String reviewTime = reviewerVersion.getTimeVersion();
			if (designerIDParm == null || designerIDParm.equals("") || designerIDParm.equals(reviewDesignerID)) {
				IDesignerUser designerUser = commentingManager.getDesignerUser(reviewDesignerID);
				/* designer user removed from the system (or never existed) */
				if(designerUser==null) continue;
				Version version = designerUser.getVersion(reviewTime);

				if (version != null) {
					if (version.containsUser(userEmail)) {
						writer.startObject();
						writer.addField("designerId", reviewDesignerID);
						writer.addField("designerEmail", designerUser.getRawUser().getPerson().getEmail());
						writer.addField("designerDisplayName", designerUser.getRawUser().getPerson().getDisplayName() );
						writer.addField("versionTitle", version.getVersionTitle());
						writer.addField("versionId", version.getVersionID());
						writer.addField("dueDate", version.dueDateString());
						writer.addField("timeStamp", version.getTime());
						writer.addField("closed", version.isClosed());
						writer.addField("closedManual",version.isHasClosedManually());
						writer.addField("isDraft", version.isDraft());
						writer.addField("width", version.getDesireWidth());
						writer.addField("height", version.getDesireHeight());
						writer.addField("restartFrom",version.getRestartFrom());
						writer.addField("receiveEmail", version.isReceiveEmail());
						writer.addField("hasRestarted", version.isHasRestarted());
						if(version.getDescription()!="") {
							writer.addField("description", version.getDescription());
						}
						
						writer.addFieldName("reviewers");
						writer.startArray();
		
						for(Reviewer reviewer:version.getReviewers()){
							writer.startObject();
							writer.addField("name", reviewer.getUserID());
							writer.addField("displayName", reviewer.getDisplayName());
							writer.addField("email", reviewer.getEmail());
							writer.endObject();
						}
						writer.endArray();
						writer.endObject();
					}
				} else {
					//NOTE: Could not find version created by given designer... this could happen if a review has been deleted, but not
					//removed from the given reviewer's xml file. This could be an opportunity to prune the reviewer's index file.
				}
			}
		}
		this.responseString = writer.getJSON();
        resp.setContentType("application/json;charset=UTF-8");
	}
}

package org.davinci.server.review.command;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.review.DesignerUser;
import org.davinci.server.review.ReviewManager;
import org.davinci.server.review.Reviewer;
import org.davinci.server.review.Version;
import org.davinci.server.user.User;
import org.davinci.server.util.JSONWriter;

public class ListVersions extends Command {

	public void handleCommand(HttpServletRequest req, HttpServletResponse resp, User user)
			throws IOException {

		String designer = (String) req.getParameter("designer");
		if(designer==null||designer.equals(""))
			designer = user.getUserName();
		ReviewManager commentingManager = ReviewManager.getReviewManager();

		/*String file = req.getParameter("fileName");
		IPath path = new Path(file);
		path = path.removeFirstSegments(3);
		String filePath = path.toString();
		filePath = "./" + filePath;
*/
		DesignerUser reviewUser = commentingManager.getDesignerUser(designer);

		// this.responseString = reviewUser.getVersionsJSON();

		JSONWriter writer = new JSONWriter(true);
		for (Version version : reviewUser.getVersions()) {
			if (version.containsUser(user.getPerson().getEmail())) {
				writer.startObject();
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
				if(version.getDescription()!="")
					writer.addField("description", version.getDescription());
				StringBuffer buf = new StringBuffer("[");
				for(Reviewer reviewer:version.getReviewers()){
					buf.append("{");
					buf.append("'");
					buf.append("name");
					buf.append("'");
					buf.append(":");
					buf.append("'");
					buf.append(reviewer.getUserName());
					buf.append("'");
					buf.append(",");
					buf.append("'");
					buf.append("email");
					buf.append("'");
					buf.append(":");
					buf.append("'");
					buf.append(reviewer.getEmail());
					buf.append("'");
					buf.append(",");
					buf.append("}");
					buf.append(",");
				}

				if(!version.getReviewers().isEmpty())
				buf=buf.delete(buf.length()-1, buf.length());
				buf.append("]");

				writer.addFieldName("reviewers");
				writer.startArray();

				for(Reviewer reviewer:version.getReviewers()){
					writer.startObject();
					writer.addField("name", reviewer.getUserName());
					writer.addField("email", reviewer.getEmail());
					writer.endObject();
				}
				writer.endArray();
				writer.endObject();
			}
		}
		this.responseString = writer.getJSON();
	}

}

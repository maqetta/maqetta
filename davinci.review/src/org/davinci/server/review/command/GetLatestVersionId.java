package org.davinci.server.review.command;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.review.DesignerUser;
import org.davinci.server.review.ReviewManager;
import org.davinci.server.review.Version;
import org.davinci.server.user.User;

public class GetLatestVersionId extends Command{

		public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
				User user) throws IOException {
			ReviewManager cm = ReviewManager.getReviewManager();
			DesignerUser reviewUser = cm.getDesignerUser(user.getUserName());
			int latestVersionID = 1;
			if(reviewUser.getLatestVersion() !=null&&reviewUser.getVersion(reviewUser.getLatestVersion().getTime())!=null){
				latestVersionID = Integer.parseInt(reviewUser.getLatestVersion().getVersionID())+1;
			}
			else{
				List<Version> versions = reviewUser.getVersions();
				for(Version version: versions){
					int i = Integer.parseInt(version.getVersionID());
					if(i>latestVersionID){
						latestVersionID = i;
					}
				}
			}

			this.responseString = new Integer(latestVersionID).toString();

	}
}

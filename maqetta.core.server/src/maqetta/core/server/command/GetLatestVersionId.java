package maqetta.core.server.command;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.user.ReviewManager;

import org.davinci.server.review.Version;
import org.davinci.server.review.user.IDesignerUser;
import org.davinci.server.user.IUser;
import org.maqetta.server.Command;

public class GetLatestVersionId extends Command{

		public void handleCommand(HttpServletRequest req, HttpServletResponse resp,
				IUser user) throws IOException {
			ReviewManager cm = ReviewManager.getReviewManager();
			IDesignerUser reviewUser = cm.getDesignerUser(user);
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

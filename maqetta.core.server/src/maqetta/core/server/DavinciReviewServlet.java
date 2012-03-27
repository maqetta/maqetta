package maqetta.core.server;

import java.io.IOException;
import java.net.URL;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.user.ReviewManager;

import org.davinci.server.internal.Activator;
import org.davinci.server.review.Constants;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.maqetta.server.VURL;

@SuppressWarnings("serial")
public class DavinciReviewServlet extends DavinciPageServlet {
	private ReviewManager reviewManager;

	@Override
	public void initialize() {
		super.initialize();
		reviewManager = ReviewManager.getReviewManager();
	}

	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.service(req, resp);
		if ( !ReviewCacheManager.$.isAlive() )
			ReviewCacheManager.$.start();
	}

	public String getLoginUrl(HttpServletRequest req, String revieweeName) {
		String loginUrl = serverManager.getDavinciProperty("loginUrl");
		String params = "";
		if ( null == loginUrl ) {
			loginUrl = req.getContextPath();
		} // Ensure loginUrl is not null
		String pseparator = loginUrl.indexOf("?") > 0 ? "&" : "?";
		if ( revieweeName != null ) {
			params = pseparator + "revieweeuser=" + revieweeName;
		}
		return loginUrl + params;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		if ( serverManager == null ) {
			initialize();
		}
		String revieweeName = req.getParameter("revieweeuser");
		String reviewVersion = req.getParameter("version");

		String pathInfo = req.getPathInfo();
		IUser sessionUser = ServerManager.getServerManger().getUserManager().getUser(req);
		if ( ServerManager.DEBUG_IO_TO_CONSOLE ) {
			System.out.println("Review Servlet request: " + pathInfo + ", logged in= " + (sessionUser != null ? sessionUser.getUserName() : "guest"));
		}

		if ( pathInfo == null || pathInfo.equals("") ) {
			// Because the requested URL is /review with nothing after we do not have a designer
			if (sessionUser == null) {
				resp.sendRedirect(this.getLoginUrl(req, revieweeName));
				return;
			} else {
				resp.sendRedirect("/maqetta/");
				return;
			}
		} else {
			IPath path = new Path(pathInfo);
			String prefix = path.segment(0);
			if ( prefix == null ) {
				// Because the requested URL is /review with nothing after we do not have a designer
				if (sessionUser == null) {
					resp.sendRedirect(this.getLoginUrl(req, revieweeName));
					return;
				} else {
					resp.sendRedirect("/maqetta/");
					return;
				}
			}

			if ( prefix.equals(IDavinciServerConstants.APP_URL.substring(1))
					|| prefix.equals(Constants.CMD_URL.substring(1)) ) {
				// Forward to DavinciPageServlet such as "/app/img/1.jpg" or "cmd/getUserInfo"
				req.getRequestDispatcher(pathInfo).forward(req, resp);
				return;
			}

			if ( sessionUser != null) {
				if (handleReviewRequest(req, resp, path) || handleLibraryRequest(req, resp, path, sessionUser) ) {
					return;
				}
			}

			// Check if it is a valid user name for the designer.
			// If it is a valid user name, do login
			// Else, error.
			IUser designerOfReviewInQuestion = userManager.getUser(prefix);
			if ( designerOfReviewInQuestion == null ) {
				resp.sendRedirect(this.getLoginUrl(req, revieweeName));
				return;
			} else {
				//Fill in designer cookie
				String designerOfReviewInQuestionId = prefix;
				Cookie designerCookie = new Cookie(Constants.REVIEW_COOKIE_DESIGNER, designerOfReviewInQuestionId);
				/* have to set the path to delete it later from the client */
				designerCookie.setPath("/maqetta/");
				resp.addCookie(designerCookie);

				//Fill in review version cookie
				if ( reviewVersion != null ) {
					Cookie versionCookie = new Cookie(Constants.REVIEW_VERSION, reviewVersion);
					/* have to set the path to delete it later from the client */
					versionCookie.setPath("/maqetta/");
					resp.addCookie(versionCookie);
				}
				
				/*
				if ( path.segmentCount() > 2 ) {
					// Token = 20100101/project1/folder1/sample1.html/default
					String commentId = path.segment(path.segmentCount() - 1);
					String fileName = path.removeLastSegments(1).removeFirstSegments(1).toPortableString();
					resp.addCookie(new Cookie(Constants.REVIEW_COOKIE_CMTID, commentId));
					resp.addCookie(new Cookie(Constants.REVIEW_COOKIE_FILENAME, fileName));
				}
				*/
				
				resp.sendRedirect("/maqetta/");
				return;
			}
		}
	}

	@Override
	protected boolean handleLibraryRequest(HttpServletRequest req, HttpServletResponse resp,
			IPath path, IUser user) throws ServletException, IOException {
		// Remove the following URL prefix
		// /user/heguyi/ws/workspace/.review/snapshot/20100101/project1/lib/dojo/dojo.js
		// 		to
		// project1/lib/dojo/dojo.js
		String version = null;
		String ownerId = null;
		String projectName = null;
		IUser reviewUser = user;
		if ( isValidReviewPath(path) ) {
			ownerId = path.segment(1);
			version = path.segment(6);
			projectName = path.segment(7);
			path = path.removeFirstSegments(7);
			// So that each snapshot can be mapped to its virtual lib path correctly.
			path = ReviewManager.adjustPath(path, ownerId, version, projectName);
			reviewUser = ServerManager.getServerManger().getUserManager().getUser(ownerId);
		}
		return super.handleLibraryRequest(req, resp, path, reviewUser);
	}

	protected boolean handleReviewRequest(HttpServletRequest req, HttpServletResponse resp,
			IPath path) throws ServletException, IOException {
		// Get the requested resources from the designer's folder
		// Remove the following URL prefix
		// /user/heguyi/ws/workspace/.review/snapshot/20100101/project1/folder1/sample1.html
		// 		to
		// /.review/snapshot/20100101/project1/folder1/sample1.html
		if ( isValidReviewPath(path) ) {
			String designerName = path.segment(1);
			path = path.removeFirstSegments(4);
			IVResource vr = reviewManager.getDesignerUser(designerName).getResource(path);
			if ( vr != null ) {
				writePage(req, resp, vr, true);
				return true;
			}
		}
		return false;
	}

	protected void writeReviewPage(HttpServletRequest req, HttpServletResponse resp, String path)
			throws ServletException, IOException {
		URL resourceURL = Activator.getActivator().getOtherBundle("maqetta.core.client").getEntry("/WebContent/" + path);
		VURL v = new VURL(resourceURL);
		writePage(req, resp, v, false);
	}

	private boolean isValidReviewPath(IPath path) {
		String designerName = path.segment(1);

		// Verify the user
		if ( designerName == null ) {
			return false;
		}
		IUser user = userManager.getUser(designerName);

		return user != null && path.segmentCount() > 8 && path.segment(4).equals(".review")
				&& path.segment(5).equals("snapshot") && path.segment(0).equals("user")
				&& path.segment(2).equals("ws") && path.segment(3).equals("workspace");
	}

	@Override
	public void destroy() {
		ReviewCacheManager.$.markStop();
		ReviewCacheManager.$.destroyAllReview();
	}
}

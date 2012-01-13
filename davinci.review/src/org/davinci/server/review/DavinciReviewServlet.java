package org.davinci.server.review;

import java.io.IOException;
import java.net.URL;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.standalone.DavinciPageServlet;
import maqetta.core.server.standalone.VURL;

import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IVResource;

@SuppressWarnings("serial")
public class DavinciReviewServlet extends DavinciPageServlet {
	private ReviewManager reviewManager;
	protected String revieweeName;

	public void initialize() {
		super.initialize();
//		serverManager = ServerManager.createServerManger(getServletConfig());
//		userManager = serverManager.getUserManager();
//		libraryManager = serverManager.getLibraryManager();
		reviewManager = ReviewManager.getReviewManager();
	}

	protected void service(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.service(req, resp);
		if (!ReviewCacheManager.$.isAlive())
			ReviewCacheManager.$.start();
	}

	public String getLoginUrl(HttpServletRequest req){
        String loginUrl = serverManager.getDavinciProperty("loginUrl");
        String params = "";
        if(null == loginUrl) loginUrl = req.getContextPath(); // Ensure loginUrl is not null
        String pseparator = loginUrl.indexOf("?") > 0 ? "&" : "?";
        if ( revieweeName != null ) {
	        params = pseparator + "revieweeuser=" + revieweeName;
	    }
		return  loginUrl + params;
	}

	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
			IOException {

	    if(serverManager==null)
	        initialize();

        revieweeName  = req.getParameter("revieweeuser");

        String contextString = req.getContextPath();

		String pathInfo = req.getPathInfo();

		IUser user = (IUser) req.getSession().getAttribute(IDavinciServerConstants.SESSION_USER);
		if(user==null){
		    req.getSession().setAttribute(IDavinciServerConstants.REDIRECT_TO, req.getRequestURL().toString());
			resp.sendRedirect(this.getLoginUrl(req));
			return;
		}


		if (pathInfo == null || pathInfo.equals("")) {
			ReviewObject reviewObject = (ReviewObject) req.getSession().getAttribute(
					Constants.REVIEW_INFO);
			if (reviewObject == null) {
				// Because the requested URL is /review so the empty review object means we
				// can not have a designer name. Error.
			//	resp.setHeader("referrer", contextString +"review.html" );
				resp.sendRedirect(this.getLoginUrl(req));

				return;
			} else {
				resp.addCookie(new Cookie(Constants.REVIEW_COOKIE_DESIGNER,	reviewObject.getDesignerName()));
				resp.addCookie(new Cookie(Constants.REVIEW_COOKIE_DESIGNER_EMAIL, reviewObject.getDesignerEmail()));

				if (reviewObject.getCommentId() != null)
					resp.addCookie(new Cookie(Constants.REVIEW_COOKIE_CMTID,
							reviewObject.getCommentId()));
				if (reviewObject.getFile() != null)
					resp.addCookie(new Cookie(Constants.REVIEW_COOKIE_FILE,
							reviewObject.getFile()));
				writeReviewPage(req, resp, "review.html");
			}
		} else {
			IPath path = new Path(pathInfo);
		
			String prefix = path.segment(0);
			if(prefix == null){
				resp.sendRedirect(contextString + "./review");
				return;
			}

			if(handleReviewRequest(req, resp, path) || handleLibraryRequest(req, resp, path, user)) {
				return;
			}

			if (prefix.equals(IDavinciServerConstants.APP_URL.substring(1))
//					|| prefix.equals(IDavinciServerConstants.USER_URL.substring(1))
					|| prefix.equals(Constants.CMD_URL.substring(1))) {
				// Forward to DavinciPageServlet such as "/app/img/1.jpg"
				req.getRequestDispatcher(pathInfo).forward(req, resp);
				return;
			}
			
			// Check if it is a valid user name.
			// If it is a valid user name, do login
			// Else, error.
			IUser designer = userManager.getUser(prefix);
			if (designer == null) {
				resp.sendRedirect(this.getLoginUrl(req));
				return;
			} else {
				ReviewObject reviewObject = new ReviewObject(prefix);
				reviewObject.setDesignerEmail(designer.getPerson().getEmail());
				if (path.segmentCount() > 2) {
					// Token = 20100101/project1/folder1/sample1.html/default
					String commentId = path.segment(path.segmentCount() - 1);
					String fileName = path.removeLastSegments(1).removeFirstSegments(1)
							.toPortableString();

					reviewObject.setFile(fileName);
					reviewObject.setCommentId(commentId);

				}
				req.getSession().setAttribute(Constants.REVIEW_INFO, reviewObject);
				resp.sendRedirect("/maqetta/review");
				return;
			}
		}
	}

//	private void writeWelcomePage(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
//		IConfigurationElement welcomeExtension = serverManager.getExtension(IDavinciServerConstants.EXTENSION_POINT_WELCOME_PAGE, IDavinciServerConstants.EP_TAG_WELCOME_PAGE);
//		if (welcomeExtension==null)
//			writeInternalPage(req, resp, "welcome.html");
//		else{
//			String name = welcomeExtension.getDeclaringExtension().getContributor().getName();
//			Bundle bundle=Activator.getActivator().getOtherBundle(name);
//			if (bundle!=null)
//			{
//				String path=welcomeExtension.getAttribute(IDavinciServerConstants.EP_ATTR_WELCOME_PAGE_PATH);
//				VURL resourceURL = new VURL(bundle.getResource(path));
//				this.writePage(req, resp, resourceURL, false);
//			}
//
//		}
//	}

	protected boolean handleLibraryRequest(HttpServletRequest req, HttpServletResponse resp, IPath path, IUser user) throws ServletException, IOException{
		// Remove the follow URL prefix
		// /user/heguyi/ws/workspace/.review/snapshot/20100101/project1/lib/dojo/dojo.js
		// to
		// project1/lib/dojo/dojo.js
		String version = null;
		String ownerId = null;
		String projectName = null;

		if(isValidReviewPath(path)){
			ownerId = path.segment(1);
			version = path.segment(6);
			projectName = path.segment(7);
			path = path.removeFirstSegments(7);
			path = ReviewManager.adjustPath(path, ownerId, version, projectName); // So that each snapshot can be mapped to its virtual lib path correctly.
		}
		return super.handleLibraryRequest(req, resp, path, user);
	}
	
	protected boolean handleReviewRequest(HttpServletRequest req, HttpServletResponse resp,IPath path) throws ServletException, IOException {
		// Get the requested resources from the designer's folder
		// Remove the follow URL prefix
		// /user/heguyi/ws/workspace/.review/snapshot/20100101/project1/folder1/sample1.html
		// to
		// /.review/snapshot/20100101/project1/folder1/sample1.html
		if(isValidReviewPath(path)){
			String designerName = path.segment(1);
			path = path.removeFirstSegments(4);
			IVResource vr = reviewManager.getDesignerUser(designerName).getResource(path);
			if(null != vr){
				writePage(req, resp, vr, true);
				return true;
			}
		}
		return false;
	}
	
	protected void writeReviewPage(HttpServletRequest req, HttpServletResponse resp, String path) throws ServletException, IOException {
		URL resourceURL =Activator.getActivator().getBundle().getEntry("/WebContent/"+path);
		VURL v = new VURL(resourceURL);
		writePage(req, resp, v, false);
	}
	
	private boolean isValidReviewPath(IPath path){
		String designerName = path.segment(1);

		// Verify the user
		if(designerName == null) return false;
		IUser user = userManager.getUser(designerName);
		
		return null != user && path.segmentCount() > 8 && path.segment(4).equals(".review")
				&& path.segment(5).equals("snapshot") && path.segment(0).equals("user")
				&&path.segment(2).equals("ws")&&path.segment(3).equals("workspace");
	}
	
	public void destroy() {
		ReviewCacheManager.$.markStop();
		ReviewCacheManager.$.destroyAllReview();
	}
}

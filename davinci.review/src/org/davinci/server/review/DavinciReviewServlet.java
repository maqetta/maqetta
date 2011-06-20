package org.davinci.server.review;

import java.io.IOException;
import java.net.URL;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.LibInfo;
import org.davinci.server.DavinciPageServlet;
import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.ServerManager;
import org.davinci.server.VURL;
import org.davinci.server.review.cache.ReviewCacheManager;
import org.davinci.server.user.User;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.osgi.framework.Bundle;

public class DavinciReviewServlet extends DavinciPageServlet {
	private ReviewManager reviewManager;

	private static String LOGIN_URL = "http://maqetta.org/index.php?option=com_user&view=login";

	public void initialize() {
		serverManager = ServerManager.createServerManger(getServletConfig());
		userManager = serverManager.getUserManager();
		libraryManager = serverManager.getLibraryManager();
		reviewManager = ReviewManager.getReviewManager();
	}

	protected void service(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.service(req, resp);
		if (!ReviewCacheManager.$.isAlive())
			ReviewCacheManager.$.start();
	}

	public String getLoginUrl(HttpServletRequest req){
		//	return req.getContextPath() + "/welcome";
		return serverManager.getDavinciProperty("loginUrl");
		//return "http://maqetta.org/index.php?option=com_user&view=login";
	}

	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
			IOException {
	    
	    if(serverManager==null)
	        initialize();
	    
		String contextString = req.getContextPath();

		String pathInfo = req.getPathInfo();

		User user = (User) req.getSession().getAttribute(IDavinciServerConstants.SESSION_USER);
		if(user==null){
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
			if(prefix==null){
				resp.sendRedirect(contextString + "/review");
				return;
			}

			// Handle the library request before the other operations
			if(handleLibraryRequest(req, resp, path))
				return;
			if (prefix.equals(IDavinciServerConstants.APP_URL.substring(1))
					|| prefix.equals(IDavinciServerConstants.USER_URL.substring(1))
					|| prefix.equals("cmd")) {
				// Forward to DavinciPageServlet such as "/app/img/1.jpg"
				req.getRequestDispatcher(pathInfo).forward(req, resp);
				return;
			} else {
				// Check if it is a valid user name.
				// If it is a valid user name, do login
				// Else, error.
				User designer = userManager.getUser(prefix);
				if (designer == null) {
					resp.sendRedirect(this.getLoginUrl(req));
					return;
				} else {
					ReviewObject reviewObject = new ReviewObject(prefix);
					if (path.segmentCount() > 2) {
						// Token = 20100101/folder1/sample1.html/default
						String commentId = path.segment(path.segmentCount() - 1);
						String fileName = path.removeLastSegments(1).removeFirstSegments(1)
								.toPortableString();

						reviewObject.setFile(fileName);
						reviewObject.setCommentId(commentId);
						reviewObject.setDesignerEmail(designer.getPerson().getEmail());

					}
					req.getSession()
							.setAttribute(Constants.REVIEW_INFO, reviewObject);
					resp.sendRedirect(contextString + "/review");
					return;
				}
			}
		}
	}

	private void writeWelcomePage(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		IConfigurationElement welcomeExtension = serverManager.getExtension(IDavinciServerConstants.EXTENSION_POINT_WELCOME_PAGE, IDavinciServerConstants.EP_TAG_WELCOME_PAGE);
		if (welcomeExtension==null)
			writeInternalPage(req, resp, "welcome.html");
		else{
			String name = welcomeExtension.getDeclaringExtension().getContributor().getName();
			Bundle bundle=Activator.getActivator().getOtherBundle(name);
			if (bundle!=null)
			{
				String path=welcomeExtension.getAttribute(IDavinciServerConstants.EP_ATTR_WELCOME_PAGE_PATH);
				VURL resourceURL = new VURL(bundle.getResource(path));
				this.writePage(req, resp, resourceURL, false);
			}

		}
	}

	protected boolean handleLibraryRequest(HttpServletRequest req, HttpServletResponse resp,IPath path) throws ServletException, IOException {
		// Remove the follow URL prefix
		// /user/heguyi/ws/workspace/.review/snapshot/20100101/folder1/sample1.html
		// to
		// /folder1/sample1.html

		String version = null;
		String ownerId = null;
		String designerName = path.segment(1);

		if(designerName==null) return false;
		User user = userManager.getUser(designerName);
		if(user==null)
			return false;
		if(super.handleLibraryRequest(req, resp, path.removeFirstSegments(4),user))
			return true;
		if (path.segmentCount() > 7 && path.segment(4).equals(".review")
				&& path.segment(5).equals("snapshot") && path.segment(0).equals("user")
				&&path.segment(2).equals("ws")&&path.segment(3).equals("workspace")) {
			ownerId = path.segment(1);
			version = path.segment(6);
			path = path.removeFirstSegments(7);

		}
		else
			return false;

		path = adjustPath(path, ownerId, version); // So that each snapshot can be mapped to its virtual lib path correctly.
		return super.handleLibraryRequest(req, resp, path,user);
	}

	public void destroy() {
		ReviewCacheManager.$.markStop();
		ReviewCacheManager.$.destroyAllReview();
	}

	protected void writeReviewPage(HttpServletRequest req, HttpServletResponse resp, String path) throws ServletException, IOException {
		URL resourceURL =Activator.getActivator().getBundle().getEntry("/WebContent/"+path);
		VURL v = new VURL(resourceURL);
		writePage(req, resp, v, false);
	}

	protected IPath adjustPath(IPath path, String ownerId, String version){
		// Map the request lib path stored in the snapshot to the actual system lib path
		ReviewManager reviewManager = ReviewManager.getReviewManager();
		DavinciProject project = new DavinciProject();
		project.setOwnerId(ownerId);
		LibInfo[] sysLibs = reviewManager.getSystemLibs(project);
		LibInfo[] versionLibs = reviewManager.getVersionLib(project, version);

		if(versionLibs == null) return path;

		for(LibInfo info : versionLibs){
			IPath versionVirtualRoot = new Path(info.getVirtualRoot());
			if(path.matchingFirstSegments(versionVirtualRoot) == versionVirtualRoot.segmentCount()){
				String virtualRoot = null;
				for(LibInfo lib : sysLibs){
					if(lib.getId().equals(info.getId())){
						virtualRoot = lib.getVirtualRoot();
						break;
					}
				}
				if(virtualRoot != null){
					IPath vr = new Path(virtualRoot);
					return vr.append(path.removeFirstSegments(versionVirtualRoot.segmentCount()));
				}
				break;
			}
		}
		return path;
	}
}

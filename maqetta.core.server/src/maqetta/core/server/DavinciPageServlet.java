package maqetta.core.server;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.net.URL;
import java.net.URLConnection;
import java.util.Enumeration;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.ILibraryManager;
import org.davinci.server.internal.Activator;
import org.davinci.server.user.IUser;
import org.davinci.server.user.IUserManager;
import org.davinci.server.user.UserException;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IServerManager;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.maqetta.server.VURL;
import org.maqetta.server.Validator;
import org.osgi.framework.Bundle;

public class DavinciPageServlet extends HttpServlet {

	static final private Logger theLogger = Logger.getLogger(DavinciPageServlet.class.getName());

	private static final long serialVersionUID = 1L;
	private static final String LAST_MODIFIED = "Last-Modified"; //$NON-NLS-1$
	private static final String IF_MODIFIED_SINCE = "If-Modified-Since"; //$NON-NLS-1$
	private static final String IF_NONE_MATCH = "If-None-Match"; //$NON-NLS-1$
	private static final String ETAG = "ETag"; //$NON-NLS-1$
	private static final String CACHE_CONTROL = "Cache-Control"; //$NON-NLS-1$
	private static final String PRAGMA = "Pragma"; //$NON-NLS-1$
	private static final String EXPIRES = "Expires"; //$NON-NLS-1$
	private static final long maxAge = 30*24*60*60; // 30 days

	private enum CacheHeaders {
		CACHE, NO_CACHE
	}

	protected IUserManager userManager;
	protected IServerManager serverManager;
	protected ILibraryManager libraryManager;

	public void initialize() {
		serverManager = ServerManager.getServerManager();
		userManager = serverManager.getUserManager();
		libraryManager = serverManager.getLibraryManager();
	}

	private void log(HttpServletRequest req, IUser user) {
		String log = "RequestURL: " + req.getRequestURL().toString();
		if (user != null) {
			log += "\nUser: uid=" + user.getUserID();
			String email = user.getPerson().getEmail();
			if (email != null) {
				log += " email=" + email;
			}
		}

		String query = req.getQueryString();
		if (query != null) {
			log += "\nQuery: " + query;
		}

		Enumeration<String> names = req.getHeaderNames();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			String header = req.getHeader(name);
			if (header != null) {
				log += "\n" + name + ": " + header;
			}
		}
		theLogger.info(log);
	}

	/*
	 * Save file request from user. Saves files to workspace. (non-Javadoc)
	 * 
	 * @see
	 * javax.servlet.http.HttpServlet#doPut(javax.servlet.http.HttpServletRequest
	 * , javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		IUser user = null;
		try {
			user = ServerManager.getServerManager().getUserManager().getUser(req);
			if(user==null){
				resp.sendError(HttpServletResponse.SC_FORBIDDEN);
				return;
			}
			String path = getPathInfo(req);
			if (path == null) {
				theLogger.warning("DavinciPageServlet:doPut getPathInfo returned Null for user: " + user.getUserID());
				resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				return;
			}
			boolean isWorkingCopy = (path.indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION) > -1);
			if ( isWorkingCopy ) {
				path = path.substring(0, path.indexOf(IDavinciServerConstants.WORKING_COPY_EXTENSION));
			}
			IVResource file = user.getResource(path);
			if (file == null) {
				theLogger.warning("DavinciPageServlet:doPut user.getResource("+path+") returned Null for user: " + user.getUserID());
				resp.sendError(HttpServletResponse.SC_NOT_FOUND);
				return;
			}
			/* user is trying to save over a library path */
			if ( file.isVirtual() ) {
				file = user.createResource(path, file.isDirectory());
				if(file.isDirectory())
					file.mkdir();
				else
				   file.createNewInstance();
			}
			if ( file.exists() ) {
				OutputStream os = file.getOutputStreem();
				transferStreams(req.getInputStream(), os, false);
				if ( !isWorkingCopy ) {
					// flush the working copy
					file.flushWorkingCopy();
				}
	
			} else {
				resp.sendError(HttpServletResponse.SC_NOT_FOUND);
			}
		} catch (RuntimeException re) {
			log(req, user);
			throw re;
		} 
	}

	public String getPathInfo(HttpServletRequest req){
		return req.getPathInfo();
	}
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		IUser user = null;
		try {
			if ( serverManager == null ) {
				initialize();
			}
			String previewParam = req.getParameter(IDavinciServerConstants.PREVIEW_PARAM);
	
			user = ServerManager.getServerManager().getUserManager().getUser(req);
			String pathInfo = getPathInfo(req);
			theLogger.finest("Page Servlet request: " + pathInfo + ", logged in=" + (user != null));

			if ( pathInfo == null ) {
				handleReview(req, resp);
				resp.sendRedirect("maqetta/");
			} else if ( pathInfo != null && (pathInfo.equals("") || pathInfo.equals("/")) && previewParam == null ) {
				if ( !ServerManager.LOCAL_INSTALL ) {
					if ( user == null ) {
						resp.sendRedirect("welcome");
					} else {
						writeMainPage(req, resp);
					}
				} else {
					writeMainPage(req, resp);
				}
			} else if ( pathInfo.equals("/welcome") ) {
				/* write the welcome page (may come from extension point) */
				writeWelcomePage(req, resp);
			} else if ( previewParam != null ) {
				handlePreview(req, resp);
			} else if ( pathInfo.startsWith(IDavinciServerConstants.USER_URL) ) {
				handleWSRequest(req, resp, user);
			} else {
				/* resource not found */
				resp.sendError(HttpServletResponse.SC_NOT_FOUND);
			}
		} catch (RuntimeException re) {
			log(req, user);
			throw re;
		} 
	}
	
	/*
	 * If review-related attributes are in the URL, set cookies so that
	 * review gets opened on the client.
	 */
	private void handleReview(HttpServletRequest req, HttpServletResponse resp) {
		String designerName = req.getParameter(IDavinciServerConstants.REVIEW_DESIGNER_ATTR);
		String reviewVersion = req.getParameter(IDavinciServerConstants.REVIEW_VERSION_ATTR);
		if (validateReviewParms(designerName, reviewVersion)) {
			//Fill in designer cookie
			Cookie designerCookie = new Cookie(IDavinciServerConstants.REVIEW_COOKIE_DESIGNER, designerName);
			/* have to set the path to delete it later from the client */
			designerCookie.setPath("/");
			resp.addCookie(designerCookie);

			//Fill in review version cookie
			if ( reviewVersion != null ) {
				Cookie versionCookie = new Cookie(IDavinciServerConstants.REVIEW_COOKIE_VERSION, reviewVersion);
				/* have to set the path to delete it later from the client */
				versionCookie.setPath("/");
				resp.addCookie(versionCookie);
			}
		}
	}
	
	/*
	 * Make sure we have valid parms before putting back out into cookies. Putting 
	 * unsanitized/unvalidated parms straight into a cookie can open up the door for XSS attacks.
	 */
	private boolean validateReviewParms(String designerName, String reviewVersion) {
		boolean returnVal = (designerName != null && reviewVersion != null);
		if (returnVal) {
			boolean validDesigner;
			try {
				validDesigner = ServerManager.getServerManager().getUserManager().isValidUser(designerName);
			} catch (IOException e) {
				throw new RuntimeException(e); //FIXME
			} catch (UserException e) {
				throw new RuntimeException(e); //FIXME
			}
			if (validDesigner) {
				returnVal = Validator.isValidISOTimeStamp(reviewVersion);
				if (!returnVal) {
					theLogger.warning("validateReviewParms: Poorly formatted reviewVersion = " + reviewVersion);
				}
			} else {
				theLogger.warning("validateReviewParms: Invalid review designer name = " + designerName);
				returnVal = false;
			}
		}
		return returnVal;
	}

	/*
	 * Find a plugin with the given extension name and calculate winner based on
	 * priority.
	 * 
	 * @param extensionName the extension point name
	 * 
	 * @return Bundle
	 */
	protected URL getPageExtensionPath(String extensionPoint, String extensionName) {
		List extensions = serverManager.getExtensions(extensionPoint, extensionName);
		IConfigurationElement winner = null;
		int highest = -100000;
		for (int i = 0; i < extensions.size(); i++) {
			IConfigurationElement extension = (IConfigurationElement) extensions.get(i);
			int priority = Integer.parseInt(extension.getAttribute(IDavinciServerConstants.EP_ATTR_PAGE_PRIORITY));
			if ( priority > highest ) {
				winner = extension;
				highest = priority;
			}
		}
		String name = winner.getDeclaringExtension().getContributor().getName();
		Bundle bundle = Activator.getActivator().getOtherBundle(name);
		String path = winner.getAttribute(IDavinciServerConstants.EP_ATTR_PAGE_PATH);

		return bundle.getResource(path);
	}

	protected void writeWelcomePage(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
			IOException {
		URL welcomePage = getPageExtensionPath(IDavinciServerConstants.EXTENSION_POINT_WELCOME_PAGE,
				IDavinciServerConstants.EP_TAG_WELCOME_PAGE);
		VURL resourceURL = new VURL(welcomePage);
		this.writePage(req, resp, resourceURL, CacheHeaders.NO_CACHE);
	}

	protected void writeMainPage(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		URL welcomePage = getPageExtensionPath(IDavinciServerConstants.EXTENSION_POINT_MAIN_PAGE,
				IDavinciServerConstants.EP_TAG_MAIN_PAGE);
		VURL resourceURL = new VURL(welcomePage);
		this.writePage(req, resp, resourceURL, CacheHeaders.NO_CACHE);
	}

	/*
	 * Used for previewing mobile pages.
	 */
	protected void handlePreview(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
		URL previewPage = getPageExtensionPath(IDavinciServerConstants.EXTENSION_POINT_PREVIEW_PAGE,
				IDavinciServerConstants.EP_TAG_PREVIEW_PAGE);
		VURL resourceURL = new VURL(previewPage);
		this.writePage(req, resp, resourceURL, CacheHeaders.CACHE);
	}

	protected void handleWSRequest(HttpServletRequest req, HttpServletResponse resp, IUser user) throws IOException,
			ServletException {

		// System.out.println("enter ws request");
		String pathInfo =getPathInfo(req);
		// Code further down expects pathInfo==null if user goes to root of daVinci server
		IPath path = new Path(pathInfo);
		if ( path.hasTrailingSeparator() ) {
			path = path.removeTrailingSeparator();
		}

		path = path.removeFirstSegments(1);
		String userName = path.segment(0);
		if ( path.segmentCount() < 4 || !path.segment(1).equals("ws") || !path.segment(2).equals("workspace") ) {
			theLogger.warning("incorrectly formed workspace path: " + path);
			resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
			return;
		}
		path = path.removeFirstSegments(3);

		/* unlocking user directory to un-authenticated users */
		try {
			if ( user == null ) {
				user = ServerManager.getServerManager().getUserManager().getUser(userName);
			}
	
			if(user!=null && user.getUserID().compareTo(userName)!=0){
				user =  ServerManager.getServerManager().getUserManager().getUser(userName);
			}
		} catch (UserException e) {
			throw new RuntimeException(e);
		}
		
		if ( handleLibraryRequest(req, resp, path, user) ) {
			// System.out.println("was library");
			return;
		}

		if ( user == null ) {
			try {
				user = ServerManager.getServerManager().getUserManager().getUser(userName);
			} catch (UserException e) {
				throw new RuntimeException(e);
			}
			if ( user == null ) {
				theLogger.warning("user not found: " + userName);
				resp.sendError(HttpServletResponse.SC_NOT_FOUND);
				return;
			}
		}

		IVResource userFile = user.getResource(path.toString());

		if ( userFile != null && !userFile.exists() ) {
			if ( path.getFileExtension() == null ) {
				userFile = user.getResource(path.addFileExtension("html").toString());
			}
			if ( !userFile.exists() ) {
				theLogger.warning("user file not found: " + path);
				resp.sendError(HttpServletResponse.SC_NOT_FOUND);
				return;
			}
		} else {
			resp.resetBuffer();
			resp.sendError(HttpServletResponse.SC_NOT_FOUND);
		}
	}

	protected boolean handleLibraryRequest(HttpServletRequest req, HttpServletResponse resp, IPath path, IUser user)
			throws ServletException, IOException {
		IVResource libraryURL = user.getResource(path.toString());
		if (libraryURL != null) {
			CacheHeaders caching = libraryURL.readOnly() ? CacheHeaders.CACHE : CacheHeaders.NO_CACHE;
			writePage(req, resp, libraryURL, caching);
			return true;
		}
		return false;
	}

	protected void writePage(HttpServletRequest req, HttpServletResponse resp, IVResource resourceURL,
			CacheHeaders doCache) throws ServletException, IOException {

		if ( resourceURL == null ) {
			theLogger.warning("resource URL not found: "+resourceURL);
			resp.sendError(HttpServletResponse.SC_NOT_FOUND);
			return;
		}
		
		URLConnection connection = resourceURL.openConnection();
		InputStream is  = null;
		try {
			/*
			 * #3897
			 * Open the input stream here, if we open a URLConnection
			 * and do not close a steam, some times we are unable to 
			 * delete the file latter. So by opening a stream and then 
			 * closing the stream we are able to process the file later.
			 */
			is  = connection.getInputStream();
			long lastModified = connection.getLastModified();
			int contentLength = connection.getContentLength();
	
			String etag = null;
			if ( lastModified != -1 && contentLength != -1 ) {
				etag = "W/\"" + contentLength + "-" + lastModified + "\"";
			}
	
			// Check for cache revalidation.
			// We should prefer ETag validation as the guarantees are stronger and
			// all HTTP 1.1 clients should be using it
			String ifNoneMatch = req.getHeader(DavinciPageServlet.IF_NONE_MATCH);
			if (ifNoneMatch != null && etag != null && ifNoneMatch.compareTo(etag) == 0) {
				resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
				return; //#3897 free's up the file pointer/io stream in the finally
			}
	
			long ifModifiedSince = req.getDateHeader(DavinciPageServlet.IF_MODIFIED_SINCE);
			// for purposes of comparison we add 999 to ifModifiedSince since the fidelity
			// of the IMS header generally doesn't include milli-seconds
			if ( ifModifiedSince > -1 && lastModified > 0 && lastModified <= (ifModifiedSince + 999)) {
				resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
				return; //#3897 free's up the file pointer/io stream in the finally
			}
	
			// return the full contents regularly
			if ( contentLength != -1 ) {
				resp.setContentLength(contentLength);
			}
	
			String path = resourceURL.getPath();
			String contentType = req.getSession().getServletContext().getMimeType(path);
			if ( contentType != null ) {
				resp.setContentType(contentType);
			}
	
			if ( lastModified > 0 ) {
				resp.setDateHeader(DavinciPageServlet.LAST_MODIFIED, lastModified);
			}
	
			resp.setCharacterEncoding("UTF-8");
	
			if ( etag != null ) {
				resp.setHeader(DavinciPageServlet.ETAG, etag);
			}
	
			// Cache Headers
			if (doCache != CacheHeaders.NO_CACHE) {
				resp.setDateHeader(EXPIRES, System.currentTimeMillis() + maxAge * 1000);
				resp.setHeader(CACHE_CONTROL, "public, max-age=" + maxAge + ", must-revalidate"); //$NON-NLS-1$ //$NON-NLS-2$
			} else {
				resp.setDateHeader(EXPIRES, 0);
				resp.setHeader(CACHE_CONTROL, "no-cache"); // HTTP 1.1
				resp.setHeader(PRAGMA, "no-cache"); // HTTP 1.0
			}
	
		
			// write the resource
			try {
				OutputStream os = resp.getOutputStream();
				int writtenContentLength = writeResource(is, os);
				if ( contentLength == -1 || contentLength != writtenContentLength ) {
					resp.setContentLength(writtenContentLength);
				}
			} catch ( IllegalStateException e ) { 
				// can occur if the response output is already open as a Writer
				Writer writer = resp.getWriter();
				writeResource(is, writer);
				// Since ContentLength is a measure of the number of bytes contained in the body
				// of a message when we use a Writer we lose control of the exact byte count and
				// defer the problem to the Servlet Engine's Writer implementation.
			}
		} catch ( FileNotFoundException e ) {
			// FileNotFoundException may indicate the following scenarios
			// 		- url is a directory
			// 		- url is not accessible
			theLogger.log(Level.WARNING, "writePage file not found: " + resourceURL, e);
			resp.reset();
			resp.sendError(HttpServletResponse.SC_FORBIDDEN);

		} catch ( SecurityException e ) {
			// SecurityException may indicate the following scenarios
			// 		- url is not accessible
			theLogger.log(Level.WARNING, "writePage security exception: " + resourceURL, e);
			resp.reset();
			resp.sendError(HttpServletResponse.SC_FORBIDDEN);
		} finally {
			if (is != null ) {
				is.close(); //#3897 free up the file pointer
			}

		}
		
	}

//	protected void writeInternalPage(HttpServletRequest req, HttpServletResponse resp, Bundle bundle, String path)
//			throws ServletException, IOException {
//		VURL resourceURL = new VURL(bundle.getResource(path));
//		writePage(req, resp, resourceURL, CacheHeaders.CACHE);
//	}

	protected static int writeResource(InputStream is, OutputStream os) throws IOException {
		byte[] buffer = new byte[8192];
		int bytesRead = is.read(buffer);
		int writtenContentLength = 0;
		while ( bytesRead != -1 ) {
			os.write(buffer, 0, bytesRead);
			writtenContentLength += bytesRead;
			bytesRead = is.read(buffer);
		}
		return writtenContentLength;
	}

	protected static void writeResource(InputStream is, Writer writer) throws IOException {
		Reader reader = new InputStreamReader(is);
		try {
			char[] buffer = new char[8192];
			int charsRead = reader.read(buffer);
			while ( charsRead != -1 ) {
				writer.write(buffer, 0, charsRead);
				charsRead = reader.read(buffer);
			}
		} finally {
			if ( reader != null ) {
				reader.close(); // will also close input stream
			}
		}
	}

	protected static final void transferStreams(InputStream source, OutputStream destination, boolean closeInput)
			throws IOException {
		byte[] buffer = new byte[8192];
		try {
			synchronized ( buffer ) {
				while ( true ) {
					int bytesRead = -1;
					bytesRead = source.read(buffer);
					if ( bytesRead == -1 ) {
						break;
					}
					destination.write(buffer, 0, bytesRead);
				}
			}
		} finally {
			if ( closeInput ) {
				source.close();
			} else {
				destination.close();
			}
		}
	}
}

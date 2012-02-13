package maqetta.server.orion;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.net.URL;
import java.net.URLConnection;
import java.util.Calendar;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


import maqetta.server.orion.internal.Activator;

import org.davinci.ajaxLibrary.ILibraryManager;
import org.davinci.server.user.IUser;
import org.davinci.server.user.IUserManager;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.maqetta.server.Command;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IServerManager;
import org.maqetta.server.IVResource;
import org.maqetta.server.ServerManager;
import org.osgi.framework.Bundle;

public class DavinciPageServlet extends HttpServlet {

    private static final long   serialVersionUID  = 1L;
    private static final String LAST_MODIFIED     = "Last-Modified";    //$NON-NLS-1$
    private static final String IF_MODIFIED_SINCE = "If-Modified-Since"; //$NON-NLS-1$
    private static final String IF_NONE_MATCH     = "If-None-Match";    //$NON-NLS-1$
    private static final String ETAG              = "ETag";             //$NON-NLS-1$
    private static final String CACHE_CONTROL     = "Cache-Control";

    protected IUserManager       userManager;
    protected IServerManager     serverManager;
    protected ILibraryManager    libraryManager;

    public void initialize() {
        serverManager = ServerManager.getServerManger();
        userManager = serverManager.getUserManager();
        libraryManager = serverManager.getLibraryManager();
    }


    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if(serverManager==null)
            initialize();
        String previewParam = req.getParameter(IDavinciServerConstants.PREVIEW_PARAM);
        String user = (String) req.getSession().getAttribute("user");
        
    
        String pathInfo = req.getPathInfo();
        /*
        if(pathInfo==null)   {
        	resp.sendRedirect("./maqetta/");
        	resp.getOutputStream().close();
        	return;
        }
        */
        if (ServerManager.DEBUG_IO_TO_CONSOLE) {
            System.out.println("request: " + pathInfo + ", logged in=" + (user != null));
        }

        /* add the user name to a cookie, prob should move to login but login wasn't persisting the cookie properly */
        Cookie k = new Cookie(IDavinciServerConstants.SESSION_USER, user!=null?user:null);
        resp.addCookie(k);
        
        if (pathInfo!=null && pathInfo.endsWith("/welcome")) {
            /* write the welcome page (may come from extension point) */
            writeWelcomePage(req, resp);
        }else if (user==null) {
                    resp.sendRedirect("./welcome");
        }else if(pathInfo==null || pathInfo.equals("index.html") || pathInfo.equals("index.html")  || pathInfo.equalsIgnoreCase("/index.html")){
        	 writeMainPage(req, resp);
       
        } else if (req.getParameter(IDavinciServerConstants.PREVIEW_PARAM)!=null) {
            handlePreview(req,resp);
        }else {
            /* resource not found */
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
        resp.getOutputStream().close();
    }

    
    /* Find a plugin with the given extension name and calculate winner based on priority.
     * 
     * @param extensionName the extension point name
     * @return Bundle
     */
    private  URL getPageExtensionPath(String extensionPoint, String extensionName){
    	
    	  List extensions = serverManager.getExtensions(extensionPoint, extensionName);
    	  IConfigurationElement winner = null;
    	  int highest = -100000;
    	  for(int i=0;i<extensions.size();i++){
    		IConfigurationElement extension = (IConfigurationElement)extensions.get(i);
	      	int priority = Integer.parseInt(extension.getAttribute(IDavinciServerConstants.EP_ATTR_PAGE_PRIORITY));
	      	if(priority > highest){
	      		winner = extension;
	      		highest = priority;
	      	}
	 	  }
    	  
    	  String name = winner.getDeclaringExtension().getContributor().getName();
	      Bundle bundle= Activator.getActivator().getOtherBundle(name);
	      String path = winner.getAttribute(IDavinciServerConstants.EP_ATTR_PAGE_PATH);
    	  
	      return bundle.getResource(path);
	          
    }
    
    private void writeWelcomePage(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    	URL welcomePage = getPageExtensionPath(IDavinciServerConstants.EXTENSION_POINT_WELCOME_PAGE, IDavinciServerConstants.EP_TAG_WELCOME_PAGE);
        VURL resourceURL = new VURL(welcomePage);
        this.writePage(req, resp, resourceURL, false);
    }
    
    private void writeMainPage(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    
    	URL welcomePage = getPageExtensionPath(IDavinciServerConstants.EXTENSION_POINT_MAIN_PAGE, IDavinciServerConstants.EP_TAG_MAIN_PAGE);
        VURL resourceURL = new VURL(welcomePage);
        this.writePage(req, resp, resourceURL, false);
    }

    private void handlePreview(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        String preview = req.getParameter(IDavinciServerConstants.PREVIEW_PARAM);
        Cookie k = new Cookie("preview", preview);
        resp.addCookie(k);
    	URL previewPage = getPageExtensionPath(IDavinciServerConstants.EXTENSION_POINT_PREVIEW_PAGE, IDavinciServerConstants.EP_TAG_PREVIEW_PAGE);
        VURL resourceURL = new VURL(previewPage);
        this.writePage(req, resp, resourceURL, false);
    }

    

    protected void writePage(HttpServletRequest req, HttpServletResponse resp, IVResource resourceURL, boolean cacheExpires) throws ServletException,
            IOException {

        if (resourceURL == null) {
            if (ServerManager.DEBUG_IO_TO_CONSOLE) {
                System.out.println("resource URL not found");
            }
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        String path = resourceURL.getPath();
        boolean noCache = resourceURL.getPath().endsWith(".html");
        URLConnection connection = resourceURL.openConnection();
        long lastModified = connection.getLastModified();
        int contentLength = connection.getContentLength();

        String etag = null;
        if (lastModified != -1 && contentLength != -1) {
            etag = "W/\"" + contentLength + "-" + lastModified + "\""; //$NON-NLS-1$//$NON-NLS-2$//$NON-NLS-3$
        }

        // Check for cache revalidation.
        // We should prefer ETag validation as the guarantees are stronger and
        // all HTTP 1.1 clients should be using it
        String ifNoneMatch = req.getHeader(DavinciPageServlet.IF_NONE_MATCH);
        if (ifNoneMatch != null && etag != null && ifNoneMatch.indexOf(etag) != -1 && !noCache) {
            resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
            return;
        }

        long ifModifiedSince = req.getDateHeader(DavinciPageServlet.IF_MODIFIED_SINCE);
        // for purposes of comparison we add 999 to ifModifiedSince since the
        // fidelity
        // of the IMS header generally doesn't include milli-seconds
        if (ifModifiedSince > -1 && lastModified > 0 && lastModified <= (ifModifiedSince + 999) && !noCache) {
            resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
            return;
        }

        // return the full contents regularly
        if (contentLength != -1) {
            resp.setContentLength(contentLength);
        }

        // String contentType ="text/html";
        String contentType = req.getSession().getServletContext().getMimeType(path);
        // if (contentType == null)
        // contentType = servletContext.getMimeType(resourcePath);

        if (contentType != null) {
            resp.setContentType(contentType);
        }

        if (lastModified > 0) {
            resp.setDateHeader(DavinciPageServlet.LAST_MODIFIED, lastModified);
        }

        resp.setCharacterEncoding("UTF-8");

        if (etag != null) {
            resp.setHeader(DavinciPageServlet.ETAG, etag);
        }

        if (!cacheExpires && !noCache) {
            String dateStamp = "Mon, 25 Aug " + (Calendar.getInstance().get(Calendar.YEAR) + 5) + " 01:00:00 GMT";
            resp.setHeader(DavinciPageServlet.CACHE_CONTROL, "Expires:" + dateStamp);
        }else if(noCache){
        	resp.setDateHeader("Expires", 0);
        	resp.setHeader("Cache-Control","no-cache"); //HTTP 1.1
        	resp.setHeader("Pragma","no-cache"); //HTTP 1.0
        }

        if (contentLength != 0) {
            // open the input stream
            InputStream is = null;
            try {
                is = connection.getInputStream();
                // write the resource
                try {
                    OutputStream os = resp.getOutputStream();
                    int writtenContentLength = writeResource(is, os);
                    if (contentLength == -1 || contentLength != writtenContentLength) {
                        resp.setContentLength(writtenContentLength);
                    }
                } catch (IllegalStateException e) { // can occur if the response
                                                    // output is already open as
                                                    // a Writer
                    Writer writer = resp.getWriter();
                    writeResource(is, writer);
                    // Since ContentLength is a measure of the number of bytes
                    // contained in the body
                    // of a message when we use a Writer we lose control of the
                    // exact byte count and
                    // defer the problem to the Servlet Engine's Writer
                    // implementation.
                }
            } catch (FileNotFoundException e) {
                // FileNotFoundException may indicate the following scenarios
                // - url is a directory
                // - url is not accessible
                if (ServerManager.DEBUG_IO_TO_CONSOLE) {
                    System.out.println("file not found exception: " + e.toString());
                }
                resp.reset();
                resp.sendError(HttpServletResponse.SC_FORBIDDEN);

            } catch (SecurityException e) {
                // SecurityException may indicate the following scenarios
                // - url is not accessible
                resp.reset();
                resp.sendError(HttpServletResponse.SC_FORBIDDEN);
            } finally {
                if (is != null) {
                    is.close();
                }
            }
        }

    }

    protected void writeInternalPage(HttpServletRequest req, HttpServletResponse resp, Bundle bundle, String path) throws ServletException, IOException {
       VURL resourceURL = new VURL(bundle.getResource(path));
       writePage(req, resp, resourceURL, false);
    }

    private static int writeResource(InputStream is, OutputStream os) throws IOException {
        byte[] buffer = new byte[8192];
        int bytesRead = is.read(buffer);
        int writtenContentLength = 0;
        while (bytesRead != -1) {
            os.write(buffer, 0, bytesRead);
            writtenContentLength += bytesRead;
            bytesRead = is.read(buffer);
        }
        return writtenContentLength;
    }

    private static void writeResource(InputStream is, Writer writer) throws IOException {
        Reader reader = new InputStreamReader(is);
        try {
            char[] buffer = new char[8192];
            int charsRead = reader.read(buffer);
            while (charsRead != -1) {
                writer.write(buffer, 0, charsRead);
                charsRead = reader.read(buffer);
            }
        } finally {
            if (reader != null) {
                reader.close(); // will also close input stream
            }
        }
    }

}

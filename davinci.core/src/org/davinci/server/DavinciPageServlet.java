package org.davinci.server;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URL;
import java.net.URLConnection;
import java.util.Calendar;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.davinci.ajaxLibrary.LibraryManager;
import org.davinci.server.internal.Activator;
import org.davinci.server.user.User;
import org.davinci.server.user.UserManager;
import org.eclipse.core.runtime.IConfigurationElement;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.osgi.framework.Bundle;

public class DavinciPageServlet extends HttpServlet {

    private static final long   serialVersionUID  = 1L;
    private static final String LAST_MODIFIED     = "Last-Modified";    //$NON-NLS-1$
    private static final String IF_MODIFIED_SINCE = "If-Modified-Since"; //$NON-NLS-1$
    private static final String IF_NONE_MATCH     = "If-None-Match";    //$NON-NLS-1$
    private static final String ETAG              = "ETag";             //$NON-NLS-1$
    private static final String CACHE_CONTROL     = "Cache-Control";

    protected UserManager       userManager;
    protected ServerManager     serverManager;
    protected LibraryManager    libraryManager;

    public void initialize() {
        serverManager = ServerManager.createServerManger(getServletConfig());
        userManager = serverManager.getUserManager();
        libraryManager = serverManager.getLibraryManager();
    }

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if(serverManager==null)
            initialize();
        
        User user = (User) req.getSession().getAttribute(IDavinciServerConstants.SESSION_USER);
        String pathInfo = req.getPathInfo();
        if (ServerManager.DEBUG_IO_TO_CONSOLE) {
            System.out.println("request: " + pathInfo + ", logged in=" + (user != null));
        }

        if (pathInfo != null && (pathInfo.equals("") || pathInfo.equals("/"))) {
            if (!ServerManager.LOCAL_INSTALL) {
                if (user == null) {
                    resp.sendRedirect("./welcome");
                } else {
                    writeInternalPage(req, resp, "pagedesigner.html");
                }
            } else {
                /* local install, set user to single user */
                user = this.userManager.getSingleUser();
                req.getSession().setAttribute(IDavinciServerConstants.SESSION_USER, user);
                if (req.getParameter(IDavinciServerConstants.PREVIEW_PARAM)!=null) {
                	handlePreview(req,resp);
                }else{
                	writeInternalPage(req, resp, "pagedesigner.html");
                }
            }
        } else if (pathInfo.equals("/welcome")) {
            /* write the welcome page (may come from extension point) */
            writeWelcomePage(req, resp);
        } else if (req.getParameter(IDavinciServerConstants.PREVIEW_PARAM)!=null) {
            handlePreview(req,resp);
        }else if (pathInfo.startsWith(IDavinciServerConstants.USER_URL)) {    
            handleWSRequest(req, resp, user);
        }else {
            /* resource not found */
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
        resp.getOutputStream().close();
    }

    private void writeWelcomePage(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        IConfigurationElement welcomeExtension = serverManager.getExtension(IDavinciServerConstants.EXTENSION_POINT_WELCOME_PAGE,
                IDavinciServerConstants.EP_TAG_WELCOME_PAGE);
        if (welcomeExtension == null) {
            writeInternalPage(req, resp, "welcome.html");
        } else {
            String name = welcomeExtension.getDeclaringExtension().getContributor().getName();
            Bundle bundle = Activator.getActivator().getOtherBundle(name);
            if (bundle != null) {
                String path = welcomeExtension.getAttribute(IDavinciServerConstants.EP_ATTR_WELCOME_PAGE_PATH);
                VURL resourceURL = new VURL(bundle.getResource(path));
                this.writePage(req, resp, resourceURL, false);
            }

        }
    }

    private void handlePreview(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        String preview = req.getParameter(IDavinciServerConstants.PREVIEW_PARAM);
        Cookie k = new Cookie("preview", preview);
        resp.addCookie(k);
        writeInternalPage(req, resp, "preview.html");
    }
    
    private void handleWSRequest(HttpServletRequest req, HttpServletResponse resp, User user) throws IOException, ServletException {

        // System.out.println("enter ws request");
        String pathInfo = req.getPathInfo();
        // Code further down expects pathInfo==null if user goes to root of
        // daVinci server
        IPath path = new Path(pathInfo);
        // FIXME: what's this doing? If it's trying to remove trailing slash, it
        // needs to subtract 1
        if (path.hasTrailingSeparator()) {
            path = path.removeTrailingSeparator();
        }

        // Path path = new Path()
        path = path.removeFirstSegments(1);
        String userName = path.segment(0);
        if (path.segmentCount() < 4 || !path.segment(1).equals("ws") || !path.segment(2).equals("workspace")) {
            if (ServerManager.DEBUG_IO_TO_CONSOLE) {
                System.out.println("incorrectly formed workspace url");
            }

           resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
           return;
           // String s=null;
            // s.toString();

        }
        path = path.removeFirstSegments(3);

        /* unlocking user directory to un-authenticated users */
        if (user == null) {
            user = ServerManager.getServerManger().getUserManager().getUser(userName);
        }

        if (handleLibraryRequest(req, resp, path, user)) {
            // System.out.println("was library");
            return;
        }

        if (user == null) {
            user = ServerManager.getServerManger().getUserManager().getUser(userName);
            if (user == null) {
                if (ServerManager.DEBUG_IO_TO_CONSOLE) {
                    System.out.println("user not found: " + userName);
                }
                resp.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
        }

        IVResource userFile = user.getResource(path.toString());

        if (userFile != null && !userFile.exists()) {
            if (path.getFileExtension() == null) {
                userFile = user.getResource(path.addFileExtension("html").toString());
            }
            if (!userFile.exists()) {
                if (ServerManager.DEBUG_IO_TO_CONSOLE) {
                    System.out.println("user file not found: " + path);
                }
                resp.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
        } else {
            resp.resetBuffer();
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            // writePage(req, resp, userFile, true);
        }

    }

    protected boolean handleLibraryRequest(HttpServletRequest req, HttpServletResponse resp, IPath path, User user) throws ServletException, IOException {
        IVResource libraryURL = user.getResource(path.toString());
        if (libraryURL != null) {
            writePage(req, resp, libraryURL, false);
            return true;
        }
        return false;
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
        if (ifNoneMatch != null && etag != null && ifNoneMatch.indexOf(etag) != -1) {
            resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
            return;
        }

        long ifModifiedSince = req.getDateHeader(DavinciPageServlet.IF_MODIFIED_SINCE);
        // for purposes of comparison we add 999 to ifModifiedSince since the
        // fidelity
        // of the IMS header generally doesn't include milli-seconds
        if (ifModifiedSince > -1 && lastModified > 0 && lastModified <= (ifModifiedSince + 999)) {
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

        if (!cacheExpires) {
            String dateStamp = "Mon, 25 Aug " + (Calendar.getInstance().get(Calendar.YEAR) + 5) + " 01:00:00 GMT";
            resp.setHeader(DavinciPageServlet.CACHE_CONTROL, "Expires:" + dateStamp);
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
                    try {
                        is.close();
                    } catch (IOException e) {
                        // ignore
                    }
                }
            }
        }

    }

    protected void writeInternalPage(HttpServletRequest req, HttpServletResponse resp, String path) throws ServletException, IOException {
        URL url = Activator.getActivator().getBundle().getEntry("/WebContent/" + path);
        VURL resourceURL = new VURL(url);

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

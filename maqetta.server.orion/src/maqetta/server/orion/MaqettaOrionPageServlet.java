package maqetta.server.orion;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.DavinciPageServlet;

import org.davinci.server.user.IUser;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class MaqettaOrionPageServlet extends DavinciPageServlet {

	public String getPathInfo(HttpServletRequest req){
		String pathInfo = req.getPathInfo();
        String bPage = "/index.html";
        if(pathInfo==null)
        	return null;
        int idx = pathInfo.indexOf(bPage);
        if(idx > -1){
        	pathInfo = pathInfo.substring(idx + bPage.length() );
        }
       return pathInfo;
	}
    
	
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if(serverManager==null)
            initialize();
        String previewParam = req.getParameter(IDavinciServerConstants.PREVIEW_PARAM);
        IUser user = ServerManager.getServerManger().getUserManager().getUser(req);
        
        /* orion adds an index.html to the path.  remove that and redirect if we encounter */
        String pathInfo =getPathInfo(req);
        
        
        if(pathInfo==null)   {
        	resp.sendRedirect("./maqetta/");
        	resp.getOutputStream().close();
        	return;
        }
        
        if (ServerManager.DEBUG_IO_TO_CONSOLE) {
            System.out.println("request: " + pathInfo + ", logged in=" + (user != null));
        }

        /* add the user name to a cookie, prob should move to login but login wasn't persisting the cookie properly */
        Cookie k = new Cookie(IDavinciServerConstants.SESSION_USER, user!=null?user.getUserName():null);
        resp.addCookie(k);
        
        if (pathInfo!=null && pathInfo.endsWith("/welcome")) {
            /* write the welcome page (may come from extension point) */
            writeWelcomePage(req, resp);
        }else if (user==null) {
                    resp.sendRedirect("./welcome");
        }else if(pathInfo==null || pathInfo.equals("") || pathInfo.equals("/") ){
        	
        	/* rebuild the users workspace before launching main page.  this is in case Orion changed the files under the covers */
        	user.rebuildWorkspace();
        	writeMainPage(req, resp);
       
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

}

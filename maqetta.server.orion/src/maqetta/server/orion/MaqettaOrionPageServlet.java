package maqetta.server.orion;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.core.server.DavinciPageServlet;

import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class MaqettaOrionPageServlet extends DavinciPageServlet {

  
    

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
        }else if (pathInfo.startsWith(IDavinciServerConstants.USER_URL)) {
           // handleWSRequest(req, resp, user);
        }else {
            /* resource not found */
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
        resp.getOutputStream().close();
    }

}

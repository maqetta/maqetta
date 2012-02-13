package maqetta.server.orion;

import java.io.IOException;
import java.net.URL;
import java.util.Hashtable;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.davinci.ajaxLibrary.Library;
import org.davinci.server.util.JSONWriter;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ServerManager;

public class LibraryServlet extends DavinciPageServlet{
	  
	private static Hashtable libraryMaps = new Hashtable();
	
	
	
	
	{
		Library[] libs = ServerManager.getServerManger().getLibraryManager().getAllLibraries();
		for(int i=0;i<libs.length;i++){
			Library lib = libs[i];
			String path = new String("/" + lib.getID() + "/" + lib.getVersion() );
			libraryMaps.put(lib,path);
		}
		
	}
	
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String pathInfo = req.getPathInfo();
		String[] split = pathInfo.split("/");
		Library library = ServerManager.getServerManger().getLibraryManager().getLibrary(split[1],split[2]);
		int fromIndex = pathInfo.indexOf(split[3] + "/");
		URL url = library.getURL(pathInfo.substring(fromIndex));
		VURL file = new VURL(url);
		   this.writePage(req, resp, file, false);
	 }
	
	public static Hashtable getLibraryMaps(){
		return libraryMaps;
	}
}
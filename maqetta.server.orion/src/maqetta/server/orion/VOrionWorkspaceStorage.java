package maqetta.server.orion;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.security.Principal;
import java.util.Collection;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Map;
import java.util.Vector;

import javax.servlet.AsyncContext;
import javax.servlet.DispatcherType;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.internal.server.servlets.workspace.WebProject;
import org.eclipse.orion.internal.server.servlets.workspace.WebWorkspace;
import org.eclipse.orion.internal.server.servlets.workspace.WorkspaceResourceHandler;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.IStorage;

@SuppressWarnings("restriction")
public class VOrionWorkspaceStorage extends VOrionProjectStorage{

	WebWorkspace webWorkspace = null;
	String PROJECT_NODE_NAME = "Project";
	String userName = null;

	public VOrionWorkspaceStorage(WebWorkspace webWorkspace, String userName) {
		super(".", null, null);
		this.webWorkspace = webWorkspace;
	}
	
	public String getPath(){
		return this.name;
	}

	public IStorage create(String name){
		
		IStorage existing = this.get(name);
		
		if(existing!=null)
			return existing;
		
			IPath path = new Path(name);
			VOrionStorage parent = (VOrionStorage)this.createProj(path.segment(0));
			if(path.segmentCount() > 1)
				return parent.create(path.removeFirstSegments(1).toString());
			
			return parent;
	}
	public boolean exists() {
		return true;
	}

	public IStorage createProj(String name){
		IStorage existing = this.get(name);
		if(existing!=null)
			return existing;
		
		String	id = WebProject.nextProjectId();
		WebProject project = WebProject.fromId(id);
		
		project.setName(name);
		
		try {
			DummyRequest req = new DummyRequest(userName);
			WorkspaceResourceHandler.computeProjectLocation(req, project, null, true);
		} catch (URISyntaxException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (CoreException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		try {
			//If all went well, add project to workspace
			WorkspaceResourceHandler.addProject(userName, webWorkspace, project);
		} catch (CoreException e) {
			e.printStackTrace();				
		}
		
		try {
			return new VOrionProjectStorage(name, project.getProjectStore(),project,this);
		} catch (CoreException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	
		return null;
	}


	public IStorage get(String name){
		IStorage[] projects = this.listFiles();
		for(int i=0;i<projects.length;i++){
			if(projects[i].getName().compareTo(name)==0)
				return projects[i];
		}
		return null;
	}
	public void removeProject(WebProject webProject){
		webWorkspace.removeProject(webProject);
		try {
			webWorkspace.save();
		} catch (CoreException e) {
			e.printStackTrace();
		}
	}
	
	public IStorage[] listFiles(){
		
		JSONArray allProjects;
		Vector<VOrionProjectStorage> projects = new Vector<VOrionProjectStorage>();
		try {
			allProjects = webWorkspace.getProjectsJSON();
			for(int i=0;i<allProjects.length();i++){
				JSONObject projObj = (JSONObject)allProjects.opt(i);
				String id = projObj.getString("Id");
				IEclipsePreferences ep = (IEclipsePreferences) scope.getNode(PROJECT_NODE_NAME).node(id);
				
				WebProject result = WebProject.fromId(id);
			
				String name = result.getName();
				try {
					projects.add(new VOrionProjectStorage(name, result.getProjectStore(), result, this));
				} catch (CoreException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
			}
		} catch (JSONException e) {
			//someone messed with the backing store and inserted something invalid- just wipe it out
			allProjects = new JSONArray();
		}
		return projects.toArray(new VOrionProjectStorage[projects.size()]);
	}

	// XXX Extremely hacky!  But Orion 2.0 changed the WorkspaceResourceHandler.computeProjectLocation()
	//  API to require a request object.  It's only needed to get the user name.
	//  Long-term solution is to get rid of these storage classes entirely and just use Orion APIs.
	private class DummyRequest implements HttpServletRequest {

		private String remoteUser;

		DummyRequest(String user) {
			this.remoteUser = user;
		}

		public AsyncContext getAsyncContext() {
			// TODO Auto-generated method stub
			return null;
		}

		public Object getAttribute(String arg0) {
			// TODO Auto-generated method stub
			return null;
		}

		public Enumeration<String> getAttributeNames() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getCharacterEncoding() {
			// TODO Auto-generated method stub
			return null;
		}

		public int getContentLength() {
			// TODO Auto-generated method stub
			return 0;
		}

		public String getContentType() {
			// TODO Auto-generated method stub
			return null;
		}

		public DispatcherType getDispatcherType() {
			// TODO Auto-generated method stub
			return null;
		}

		public ServletInputStream getInputStream() throws IOException {
			// TODO Auto-generated method stub
			return null;
		}

		public String getLocalAddr() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getLocalName() {
			// TODO Auto-generated method stub
			return null;
		}

		public int getLocalPort() {
			// TODO Auto-generated method stub
			return 0;
		}

		public Locale getLocale() {
			// TODO Auto-generated method stub
			return null;
		}

		public Enumeration<Locale> getLocales() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getParameter(String arg0) {
			// TODO Auto-generated method stub
			return null;
		}

		public Map<String, String[]> getParameterMap() {
			// TODO Auto-generated method stub
			return null;
		}

		public Enumeration<String> getParameterNames() {
			// TODO Auto-generated method stub
			return null;
		}

		public String[] getParameterValues(String arg0) {
			// TODO Auto-generated method stub
			return null;
		}

		public String getProtocol() {
			// TODO Auto-generated method stub
			return null;
		}

		public BufferedReader getReader() throws IOException {
			// TODO Auto-generated method stub
			return null;
		}

		public String getRealPath(String arg0) {
			// TODO Auto-generated method stub
			return null;
		}

		public String getRemoteAddr() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getRemoteHost() {
			// TODO Auto-generated method stub
			return null;
		}

		public int getRemotePort() {
			// TODO Auto-generated method stub
			return 0;
		}

		public RequestDispatcher getRequestDispatcher(String arg0) {
			// TODO Auto-generated method stub
			return null;
		}

		public String getScheme() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getServerName() {
			// TODO Auto-generated method stub
			return null;
		}

		public int getServerPort() {
			// TODO Auto-generated method stub
			return 0;
		}

		public ServletContext getServletContext() {
			// TODO Auto-generated method stub
			return null;
		}

		public boolean isAsyncStarted() {
			// TODO Auto-generated method stub
			return false;
		}

		public boolean isAsyncSupported() {
			// TODO Auto-generated method stub
			return false;
		}

		public boolean isSecure() {
			// TODO Auto-generated method stub
			return false;
		}

		public void removeAttribute(String arg0) {
			// TODO Auto-generated method stub
		}

		public void setAttribute(String arg0, Object arg1) {
			// TODO Auto-generated method stub
		}

		public void setCharacterEncoding(String arg0) throws UnsupportedEncodingException {
			// TODO Auto-generated method stub
		}

		public AsyncContext startAsync() throws IllegalStateException {
			// TODO Auto-generated method stub
			return null;
		}

		public AsyncContext startAsync(ServletRequest arg0, ServletResponse arg1)
				throws IllegalStateException {
			// TODO Auto-generated method stub
			return null;
		}

		public boolean authenticate(HttpServletResponse arg0) throws IOException, ServletException {
			// TODO Auto-generated method stub
			return false;
		}

		public String getAuthType() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getContextPath() {
			// TODO Auto-generated method stub
			return null;
		}

		public Cookie[] getCookies() {
			// TODO Auto-generated method stub
			return null;
		}

		public long getDateHeader(String arg0) {
			// TODO Auto-generated method stub
			return 0;
		}

		public String getHeader(String arg0) {
			// TODO Auto-generated method stub
			return null;
		}

		public Enumeration<String> getHeaderNames() {
			// TODO Auto-generated method stub
			return null;
		}

		public Enumeration<String> getHeaders(String arg0) {
			// TODO Auto-generated method stub
			return null;
		}

		public int getIntHeader(String arg0) {
			// TODO Auto-generated method stub
			return 0;
		}

		public String getMethod() {
			// TODO Auto-generated method stub
			return null;
		}

		public Part getPart(String arg0) throws IOException, ServletException {
			// TODO Auto-generated method stub
			return null;
		}

		public Collection<Part> getParts() throws IOException, ServletException {
			// TODO Auto-generated method stub
			return null;
		}

		public String getPathInfo() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getPathTranslated() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getQueryString() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getRemoteUser() {
			return remoteUser;
		}

		public String getRequestURI() {
			// TODO Auto-generated method stub
			return null;
		}

		public StringBuffer getRequestURL() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getRequestedSessionId() {
			// TODO Auto-generated method stub
			return null;
		}

		public String getServletPath() {
			// TODO Auto-generated method stub
			return null;
		}

		public HttpSession getSession() {
			// TODO Auto-generated method stub
			return null;
		}

		public HttpSession getSession(boolean arg0) {
			// TODO Auto-generated method stub
			return null;
		}

		public Principal getUserPrincipal() {
			// TODO Auto-generated method stub
			return null;
		}

		public boolean isRequestedSessionIdFromCookie() {
			// TODO Auto-generated method stub
			return false;
		}

		public boolean isRequestedSessionIdFromURL() {
			// TODO Auto-generated method stub
			return false;
		}

		public boolean isRequestedSessionIdFromUrl() {
			// TODO Auto-generated method stub
			return false;
		}

		public boolean isRequestedSessionIdValid() {
			// TODO Auto-generated method stub
			return false;
		}

		public boolean isUserInRole(String arg0) {
			// TODO Auto-generated method stub
			return false;
		}

		public void login(String arg0, String arg1) throws ServletException {
			// TODO Auto-generated method stub
		}

		public void logout() throws ServletException {
			// TODO Auto-generated method stub
		}
		
	}
}

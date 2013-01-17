package maqetta.server.orion.authentication.ldap;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Properties;

import javax.naming.AuthenticationException;
import javax.naming.Context;
import javax.naming.Name;
import javax.naming.NameNotFoundException;
import javax.naming.NameParser;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;


import org.davinci.server.user.IUser;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;
import org.eclipse.orion.internal.server.servlets.ProtocolConstants;
import org.eclipse.orion.internal.server.servlets.workspace.authorization.AuthorizationService;
import org.eclipse.orion.server.core.LogHelper;
import org.eclipse.orion.server.core.PreferenceHelper;
import org.eclipse.orion.server.core.ServerConstants;
import org.eclipse.orion.server.core.authentication.IAuthenticationService;
import org.eclipse.orion.server.user.profile.IOrionUserProfileConstants;
import org.eclipse.orion.server.user.profile.IOrionUserProfileNode;
import org.eclipse.orion.server.user.profile.IOrionUserProfileService;
import org.eclipse.orion.server.useradmin.IOrionCredentialsService;
import org.eclipse.orion.server.useradmin.UnsupportedUserStoreException;
import org.eclipse.orion.server.useradmin.User;
import org.eclipse.orion.server.useradmin.UserConstants;
import org.json.JSONException;
import org.json.JSONObject;
import org.maqetta.server.ServerManager;
import org.osgi.framework.Version;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LdapAuthenticationService implements IAuthenticationService {

	private static Logger logger = LoggerFactory.getLogger("org.eclipse.orion.server.login"); //$NON-NLS-1$
	private Properties defaultAuthenticationProperties;

	private boolean registered = false;

	private static IOrionCredentialsService userAdmin;

	private static IOrionUserProfileService userProfileService;

	private static boolean allowAnonymousAccountCreation;

	private static String registrationURI;
	
	private static String CONFIG_PROVIDER_URL= "maqetta.auth.ldap.provider.url";
	private static String CONFIG_LOOKUP_PROVIDER_URL = "maqetta.auth.ldap.lookup.provider.url";
	private static String CONFIG_INITIAL_CONTEXT_FACTORY = "maqetta.auth.ldap.initial.context.factory";
	private static String CONFIG_URL_PKG_PREFIXES = "maqetta.auth.ldap.url.pkg.prefixes";
	private static String CONFIG_REFERRAL = "maqetta.auth.ldap.referral";
	private static String CONFIG_SECURITY_AUTHENTICATION = "maqetta.auth.ldap.security.authentication";
	private static String CONFIG_LOOKUP_SECURITY_AUTHENTICATION = "maqetta.auth.ldap.lookup.security.authentication";
	private static String CONFIG_SECURITY_PROTOCOL = "maqetta.auth.ldap.security.protocol";
	private static String CONFIG_LOOKUP_SECURITY_PROTOCOL = "maqetta.auth.ldap.lookup.security.protocol";
	private static String CONFIG_BASE = "maqetta.auth.ldap.base";
	private static String CONFIG_USER_FILTER = "maqetta.auth.ldap.user.filter";
	private static String CONFIG_USER_DISPLAYNAME = "maqetta.auth.ldap.user.displayname";
	private static String CONFIG_USER_EMAIL = "maqetta.auth.ldap.user.email";
	private static String CONFIG_SECURITY_PRINCIPAL = "maqetta.auth.ldap.bind.user";
	private static String CONFIG_SECURITY_CREDENTIALS = "maqetta.auth.ldap.bind.password";
	private static String CONFIG_KEYSTORE = "maqetta.auth.ldap.keystore";
	private static String CONFIG_KEYSTOREPASSWORD = "maqetta.auth.ldap.keystorepassword";
	private static String CONFIG_TRUSTSTORE = "maqetta.auth.ldap.truststore";
	private static String CONFIG_TRUSTSTOREPASSWORD = "maqetta.auth.ldap.truststorepassword";
	private static String CONFIG_TRUSTSTORETYPE = "maqetta.auth.ldap.truststoretype";
	
	private static String PROVIDER_URL = PreferenceHelper.getString(CONFIG_PROVIDER_URL, null); 
	private static String LOOKUP_PROVIDER_URL = PreferenceHelper.getString(CONFIG_LOOKUP_PROVIDER_URL, PROVIDER_URL); 
	private static String INITIAL_CONTEXT_FACTORY = PreferenceHelper.getString(CONFIG_INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
	private static String URL_PKG_PREFIXES = PreferenceHelper.getString(CONFIG_URL_PKG_PREFIXES, "com.sun.jndi.url");
	private static String REFERRAL = PreferenceHelper.getString(CONFIG_REFERRAL, "ignore");
	private static String SECURITY_AUTHENTICATION =  PreferenceHelper.getString(CONFIG_SECURITY_AUTHENTICATION, null);
	private static String LOOKUP_SECURITY_AUTHENTICATION =  PreferenceHelper.getString(CONFIG_LOOKUP_SECURITY_AUTHENTICATION, SECURITY_AUTHENTICATION);
	private static String SECURITY_PROTOCOL = PreferenceHelper.getString(CONFIG_SECURITY_PROTOCOL, null);
	private static String LOOKUP_SECURITY_PROTOCOL = PreferenceHelper.getString(CONFIG_LOOKUP_SECURITY_PROTOCOL, null);
	private static String BASE = PreferenceHelper.getString(CONFIG_BASE, null);
	private static String USER_FILTER = PreferenceHelper.getString(CONFIG_USER_FILTER, "email"); 
	private static String USER_DISPLAYNAME = PreferenceHelper.getString(CONFIG_USER_DISPLAYNAME, "displayname");
	private static String USER_EMAIL = PreferenceHelper.getString(CONFIG_USER_EMAIL, "email");
	private static String TRUSTSTORE = PreferenceHelper.getString(CONFIG_TRUSTSTORE, null);
	private static String TRUSTSTOREPW = PreferenceHelper.getString(CONFIG_TRUSTSTOREPASSWORD, null);
	private static String TRUSTSTORETYPE = PreferenceHelper.getString(CONFIG_TRUSTSTORETYPE, null);
	private static String KEYSTORE = PreferenceHelper.getString(CONFIG_KEYSTORE, null);
	private static String KEYSTOREPW = PreferenceHelper.getString(CONFIG_KEYSTOREPASSWORD, null);
	private static String BIND_USER =  PreferenceHelper.getString(CONFIG_SECURITY_PRINCIPAL, null);
	private static String BIND_PASSWORD = PreferenceHelper.getString(CONFIG_SECURITY_CREDENTIALS, null);
	
		
	static {
		//if there is no list of users authorised to create accounts, it means everyone can create accounts
		allowAnonymousAccountCreation = PreferenceHelper.getString(ServerConstants.CONFIG_AUTH_USER_CREATION, null) == null; //$NON-NLS-1$

		//if there is an alternate URI to handle registrations retrieve it.
		registrationURI = PreferenceHelper.getString(ServerConstants.CONFIG_AUTH_REGISTRATION_URI, null);
	}

	public LdapAuthenticationService(){
		// only have to set the system property once
		if (TRUSTSTORE != null)
			System.setProperty("javax.net.ssl.trustStore",TRUSTSTORE);

		if (TRUSTSTOREPW != null)
			System.setProperty("javax.net.ssl.trustStorePassword",TRUSTSTOREPW);
		
		if (TRUSTSTORETYPE != null)
			System.setProperty("javax.net.ssl.trustStoreType",TRUSTSTORETYPE);
		
		if (KEYSTORE != null)
			System.setProperty("javax.net.ssl.keyStore",KEYSTORE);
		
		if (KEYSTOREPW != null)
			System.setProperty("javax.net.ssl.keyStorePassword",KEYSTOREPW);
	}

	public Properties getDefaultAuthenticationProperties() {
		return defaultAuthenticationProperties;
	}

	public String authenticateUser(HttpServletRequest req, HttpServletResponse resp, Properties properties) throws IOException {
		String user = getAuthenticatedUser(req, resp, properties);
		if (user == null) {
			setNotAuthenticated(req, resp, properties);
		}
		return user;
	}

	/**
	 * Returns the name of the user stored in session.
	 * 
	 * @param req
	 * @return authenticated user name or <code>null</code> if user is not
	 *         authenticated.
	 */
	public String getAuthenticatedUser(HttpServletRequest req, HttpServletResponse resp, Properties properties) {
		HttpSession s = req.getSession(true);
		if (s.getAttribute("user") != null) { //$NON-NLS-1$
			return (String) s.getAttribute("user"); //$NON-NLS-1$
		}

		return null;
	}

	public String getAuthType() {
		// TODO What shall I return?
		return "FORM"; //$NON-NLS-1$
	}

	public void configure(Properties properties) {
		this.defaultAuthenticationProperties = properties;
	}

	private void setNotAuthenticated(HttpServletRequest req, HttpServletResponse resp, Properties properties) throws IOException {
		resp.setHeader("WWW-Authenticate", HttpServletRequest.FORM_AUTH); //$NON-NLS-1$
		resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

		// redirection from FormAuthenticationService.setNotAuthenticated
		String versionString = req.getHeader("Orion-Version"); //$NON-NLS-1$
		Version version = versionString == null ? null : new Version(versionString);

		// TODO: This is a workaround for calls
		// that does not include the WebEclipse version header
		String xRequestedWith = req.getHeader("X-Requested-With"); //$NON-NLS-1$

		if (version == null && !"XMLHttpRequest".equals(xRequestedWith)) { //$NON-NLS-1$
			resp.sendRedirect(req.getContextPath() + "/ldaplogin/LoginWindow.html?redirect=" + req.getRequestURL());
		} else {
			resp.setContentType(ProtocolConstants.CONTENT_TYPE_JSON);
			JSONObject result = new JSONObject();
			try {
				result.put("SignInLocation", "/ldaplogin/LoginWindow.html"); //$NON-NLS-1$
				result.put("label", "Maqetta server");
				result.put("SignInKey", "ldapUser"); //$NON-NLS-1$
			} catch (JSONException e) {
				LogHelper.log(new Status(IStatus.ERROR, Activator.PI_LDAP_SERVLETS, 1, "An error occured during authenitcation", e));
			}
			resp.getWriter().print(result.toString());
		}
	}

	public void setHttpService(HttpService httpService) {
		try {
			httpService.registerServlet("/login", new LdapLoginServlet(this), null, null); //$NON-NLS-1$
			httpService.registerServlet("/logout", new LdapLogoutServlet(), null, null); //$NON-NLS-1$
		} catch (ServletException e) {
			LogHelper.log(new Status(IStatus.ERROR, Activator.PI_LDAP_SERVLETS, 1, "An error occured when registering servlets", e));
		} catch (NamespaceException e) {
			LogHelper.log(new Status(IStatus.ERROR, Activator.PI_LDAP_SERVLETS, 1, "A namespace error occured when registering servlets", e));
		}
	}

	public void unsetHttpService(HttpService httpService) {
		if (httpService != null) {
			httpService.unregister("/login"); //$NON-NLS-1$
			httpService.unregister("/logout"); //$NON-NLS-1$
			httpService = null;
		}
	}

	public void setRegistered(boolean registered) {
		this.registered = registered;
	}

	public boolean getRegistered() {
		return registered;
	}
	
	/**********************************************************************************************/
	/***   Based on org.eclipse.orion.server.authentication.form.core.FormAuthHelper.             */
	/**********************************************************************************************/
	
	/**
	 * Authenticates user by credentials send in <code>login</code> and
	 * <code>password</password> request parameters. If user credentials are correct session attribute <code>user</code>
	 * is set. If user cannot be logged in
	 * {@link HttpServletResponse#SC_UNAUTHORIZED} error is send.
	 * 
	 * @param req
	 * @param resp
	 * @throws IOException
	 * @throws UnsupportedUserStoreException 
	 */
	public static boolean performAuthentication(HttpServletRequest req, HttpServletResponse resp) throws IOException, UnsupportedUserStoreException {
		Logger logger = LoggerFactory.getLogger("org.eclipse.orion.server.login"); //$NON-NLS-1$
		String login = req.getParameter("login");//$NON-NLS-1$
		User user = getUserForCredentials(login, req.getParameter("password")); //$NON-NLS-1$

		if (user != null) {
			String actualLogin = user.getUid();
			if (logger.isInfoEnabled())
				logger.info("Login success: " + actualLogin); //$NON-NLS-1$ 
			req.getSession().setAttribute("user", actualLogin); //$NON-NLS-1$

			IOrionUserProfileNode userProfileNode = getUserProfileService().getUserProfileNode(actualLogin, IOrionUserProfileConstants.GENERAL_PROFILE_PART);
			try {
				// try to store the login timestamp in the user profile
				userProfileNode.put(IOrionUserProfileConstants.LAST_LOGIN_TIMESTAMP, new Long(System.currentTimeMillis()).toString(), false);
				userProfileNode.flush();
			} catch (CoreException e) {
				// just log that the login timestamp was not stored
				LogHelper.log(e);
			}
			return true;
		}
		//don't bother tracing malformed login attempts
		if (login != null)
			logger.info("Login failed: " + login); //$NON-NLS-1$
		return false;
	}

	private static User getUserForCredentials(String login, String password) throws UnsupportedUserStoreException {
		if (userAdmin == null) {
			throw new UnsupportedUserStoreException();
		}
		try {
			JSONObject userJson = getUserObject(login);
			if (userJson != null) {
				String dn = userJson.get("userDN").toString();
				String displayname = userJson.get(USER_DISPLAYNAME).toString();
				String email = userJson.get(USER_EMAIL).toString();
				logger.info("authenticate dn, email, displayname" + " "+dn+ " "+email+ " "+displayname);
				//String json = userHash.get("jsonAttrib").toString();
				authenticate(dn, password);
				/*
				 * FIXME At the present time Maqetta expects the login name to be the email,
				 * So we want to use the email to create/get user from orion so that 
				 * Maqetta remains happy
				 */
				User user = userAdmin.getUser("login", email/*login*/); //$NON-NLS-1$
				if (user == null) {
					user = createOrionUser(email/*login*/);
				}
				return user;
			}
		} 
		catch (AuthenticationException e) {
			logger.info("Invalid Credentials");
		}
		catch (NamingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	private static User createOrionUser(String login) {
		User newUser = new User(login, login, "");  // don't save password
		newUser = userAdmin.createUser(newUser);
		try {
			AuthorizationService.addUserRight(newUser.getUid(), newUser.getLocation());
		} catch (CoreException e) {
			LogHelper.log(e);
		}

		// migrate user (if necessary)
		IUser user = ServerManager.getServerManger().getUserManager().getUser(newUser.getUid());

		return newUser;
	}

	/**
	 * Returns <code>true</code>ue if an unauthorised user can create a new account, 
	 * and <code>false</code> otherwise.
	 */
	public static boolean canAddUsers() {
		return allowAnonymousAccountCreation ? (userAdmin == null ? false : userAdmin.canCreateUsers()) : false;
	}

	/**
	 * Returns a URI to use for account registrations or null if none.
	 * @return String a URI to open when adding user accounts.
	 */
	public static String registrationURI() {
		return registrationURI;
	}

	public static IOrionCredentialsService getDefaultUserAdmin() {
		return userAdmin;
	}

	public void setUserAdmin(IOrionCredentialsService userAdmin) {
		LdapAuthenticationService.userAdmin = userAdmin;
	}

	public void unsetUserAdmin(IOrionCredentialsService userAdmin) {
		if (userAdmin.equals(LdapAuthenticationService.userAdmin)) {
			LdapAuthenticationService.userAdmin = null;
		}
	}

	public static JSONObject getUserJson(String uid, String contextPath) throws JSONException {
		JSONObject obj = new JSONObject();
		obj.put("login", uid); //$NON-NLS-1$

		try {
			User user = userAdmin.getUser(UserConstants.KEY_UID, uid);
			if (user == null) {
				return null;
			}
			// try to add the login timestamp to the user info
			IOrionUserProfileNode generalUserProfile = LdapAuthenticationService.getUserProfileService().getUserProfileNode(uid, IOrionUserProfileConstants.GENERAL_PROFILE_PART);
			obj.put(UserConstants.KEY_UID, uid);
			obj.put(UserConstants.KEY_LOGIN, user.getLogin());
			obj.put("Location", contextPath + user.getLocation());
			obj.put("Name", user.getName());
			if (generalUserProfile.get(IOrionUserProfileConstants.LAST_LOGIN_TIMESTAMP, null) != null) {
				Long lastLogin = Long.parseLong(generalUserProfile.get(IOrionUserProfileConstants.LAST_LOGIN_TIMESTAMP, ""));

				obj.put(IOrionUserProfileConstants.LAST_LOGIN_TIMESTAMP, lastLogin);
			}
		} catch (IllegalArgumentException e) {
			LogHelper.log(e);
		} catch (CoreException e) {
			LogHelper.log(e);
		}

		return obj;

	}

	public static IOrionUserProfileService getUserProfileService() {
		return userProfileService;
	}

	public static void bindUserProfileService(IOrionUserProfileService _userProfileService) {
		userProfileService = _userProfileService;
	}

	public static void unbindUserProfileService(IOrionUserProfileService userProfileService) {
		userProfileService = null;
	}
	
	public static JSONObject getUserObject(String userId) throws NamingException{
		 
		JSONObject user = null;
        
        // Attributes to be fetched..
/*        String attributeList[] = { "cn",
                                   "dn",
                                   "o",
                                   "ou",
                                   "uid"
        							};*/
        List<String> attributeList = new ArrayList<String>();
        attributeList.add("cn");
        attributeList.add("dn");
        attributeList.add("o");
        attributeList.add("ou");
        attributeList.add("uid");
        attributeList.add(USER_DISPLAYNAME);
        attributeList.add(USER_EMAIL);

        // Set up the environment for creating the initial context
        Properties props = new Properties();
        props.setProperty(Context.INITIAL_CONTEXT_FACTORY, INITIAL_CONTEXT_FACTORY);
        props.setProperty(Context.PROVIDER_URL, LOOKUP_PROVIDER_URL);
        props.setProperty(Context.URL_PKG_PREFIXES, URL_PKG_PREFIXES);
        props.setProperty(Context.REFERRAL, REFERRAL);
        props.setProperty(Context.SECURITY_AUTHENTICATION, LOOKUP_SECURITY_AUTHENTICATION);
        if (LOOKUP_SECURITY_PROTOCOL != null) {
        	props.setProperty(Context.SECURITY_PROTOCOL, LOOKUP_SECURITY_PROTOCOL);
        }
        // If LDAP requires authentication to search
        if (BIND_USER != null) {
        	props.setProperty(Context.SECURITY_PRINCIPAL,BIND_USER);
        }
        if (BIND_PASSWORD != null) {
          	props.setProperty(Context.SECURITY_CREDENTIALS,BIND_PASSWORD);
        }

        // Get the environment properties (props) for creating initial
        // context and specifying LDAP service provider parameters..
        
        DirContext ctx = new InitialDirContext(props);
        

        // Search the named object and all of its descendants.
        SearchControls constraints = new SearchControls();
        constraints.setSearchScope(SearchControls.SUBTREE_SCOPE);

        // Retrieve the specified attributes only..
        String[] al = new String[ attributeList.size() ];
        attributeList.toArray(al);
        constraints.setReturningAttributes(al);

        String filter = USER_FILTER +"="+userId;
        
        logger.info("LDAP search '" + filter + "' ");

        // Search the context specified in the String object "base".
        try {
        	NamingEnumeration results = ctx.search(BASE, filter, constraints);
        	
	        if (results.hasMoreElements()) {
	        	logger.info("has returned results..\n");
	            user = new JSONObject();
	            // Since UID is unique across the entire directory,
	            // the search results should contain only one entry.
	            SearchResult sr = (SearchResult) results.next();
	            // we need the DN to authenticate the user
	            NameParser parser = ctx.getNameParser(BASE);
	    		Name userDN = parser.parse(BASE);

	    		if (userDN == (Name) null)
	    		// This should not happen in theory
	    		throw new NameNotFoundException();
	    		else
	    		userDN.addAll(parser.parse(sr.getName()));
	    		user.put("userDN", userDN.toString());
	    			    		
	            // Get all available attribute types and their associated values.
	    		// we can build a user object to return.
	            Attributes attributes = sr.getAttributes();

	            String attrType;
	            Attribute attr;
	            NamingEnumeration ne;

	            // Iterate through the attributes.
	            //String json = "{";
	            for (NamingEnumeration a = attributes.getAll(); a.hasMore();) {
	                attr = (Attribute)a.next();
	                
	                //json = json + attr.getID() + ": { ";
	                String json = "";
	                ne = attr.getAll();
	                while (ne.hasMore()) {
	                    json = json + ne.next(); // should only be one entry for the attributes we retreive + ", ";
	                }

	                //json = json + "\n";
	                user.put(attr.getID(), json);
	            }
	            //json = json + "}";
	            //user.put("jsonAttrib", json);
	        }
	        else {
	        	logger.info("has returned no results..");
	        
	        }
        }
        catch(Exception e)
		{
			e.printStackTrace();
		}
		finally{
			ctx.close();
		}
        return user;
    	
    }
	
	 public static void authenticate (String userDN, String pw) throws Exception 
	 {
	// Return the full user's DN
	 	logger.info("authenticate " + userDN);
		Hashtable env = new Hashtable(11);
		env.put(Context.INITIAL_CONTEXT_FACTORY, INITIAL_CONTEXT_FACTORY );
		env.put(Context.PROVIDER_URL, PROVIDER_URL);
		env.put(Context.SECURITY_AUTHENTICATION, SECURITY_AUTHENTICATION);
		if (SECURITY_PROTOCOL != null) {
			env.put(Context.SECURITY_PROTOCOL, SECURITY_PROTOCOL);
        }
		env.put(Context.SECURITY_PRINCIPAL, userDN);
		env.put(Context.SECURITY_CREDENTIALS,pw); // the actual password.
		

        // Get the environment properties (props) for creating
		
		DirContext ctx = null; 

		try
		{
			ctx = new InitialDirContext(env);
			logger.info("SUCCESSFUL");
		}
		catch(AuthenticationException e)
		{
			throw e;
		}
		catch(Exception e)
		{
			e.printStackTrace();
			throw e;
		}
		finally{
			if (ctx != null){
				try {
					ctx.close();
				} catch (NamingException e) {
					e.printStackTrace();
					throw e;
				}
			}
		}
    }
	
}

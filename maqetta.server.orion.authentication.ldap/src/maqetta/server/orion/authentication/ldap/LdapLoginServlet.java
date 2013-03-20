package maqetta.server.orion.authentication.ldap;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import maqetta.server.orion.authentication.ldap.LdapAuthenticationService.LoginResult;

import org.eclipse.orion.server.core.LogHelper;
import org.eclipse.orion.server.core.resources.Base64;
import org.eclipse.orion.server.servlets.OrionServlet;
import org.eclipse.orion.server.useradmin.UnsupportedUserStoreException;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.framework.Version;

@SuppressWarnings("restriction")
public class LdapLoginServlet extends OrionServlet {

	private LdapAuthenticationService authenticationService;

	public LdapLoginServlet(LdapAuthenticationService authenticationService) {
		super();
		this.authenticationService = authenticationService;
	}

	private static final long serialVersionUID = 4775066421312449563L;

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		String pathInfo = req.getPathInfo() == null ? "" : req.getPathInfo(); //$NON-NLS-1$

		if (pathInfo.startsWith("/form")) { //$NON-NLS-1$
			try {
				LoginResult authResult = LdapAuthenticationService.performAuthentication(req, resp);
				if (authResult == LoginResult.OK) {
					// redirection from
					// FormAuthenticationService.setNotAuthenticated
					String versionString = req.getHeader("Orion-Version"); //$NON-NLS-1$
					Version version = versionString == null ? null : new Version(versionString);

					// TODO: This is a workaround for calls
					// that does not include the WebEclipse version header
					String xRequestedWith = req.getHeader("X-Requested-With"); //$NON-NLS-1$

					if (version == null && !"XMLHttpRequest".equals(xRequestedWith)) { //$NON-NLS-1$
						//
					} else {
						resp.setStatus(HttpServletResponse.SC_OK);
						PrintWriter writer = resp.getWriter();
						String uid = (String) req.getSession().getAttribute("user");
						JSONObject userJson;
						try {
							userJson = LdapAuthenticationService.getUserJson(uid, req.getContextPath());
							writer.print(userJson);
							resp.setContentType("application/json"); //$NON-NLS-1$
						} catch (JSONException e) {/* ignore */
						}
					}
					resp.flushBuffer();
				} else if(authResult == LoginResult.BLOCKED){
					displayError("Your account is not active. Please confirm your email before logging in.", req, resp);
				} else {
					displayError("Invalid user or password", req, resp);
				}
			} catch (UnsupportedUserStoreException e) {
				LogHelper.log(e);
				resp.sendError(HttpServletResponse.SC_NOT_FOUND, e.getMessage());
			}
			return;
		}

		if (pathInfo.startsWith("/canaddusers")) {
			JSONObject jsonResp = new JSONObject();
			try {
				jsonResp.put("CanAddUsers", LdapAuthenticationService.canAddUsers());
				jsonResp.put("ForceEmail", LdapAuthenticationService.forceEmail());
				jsonResp.put("RegistrationURI", LdapAuthenticationService.registrationURI());
			} catch (JSONException e) {
			}
			resp.getWriter().print(jsonResp);
			resp.setContentType("application/json");
			return;
		}

		String user;
		if ((user = authenticationService.getAuthenticatedUser(req, resp, authenticationService.getDefaultAuthenticationProperties())) != null) {
			resp.setStatus(HttpServletResponse.SC_OK);
			try {
				resp.getWriter().print(LdapAuthenticationService.getUserJson(user, req.getContextPath()));
			} catch (JSONException e) {
				handleException(resp, "An error occured when creating JSON object for logged in user", e);
			}
			return;
		}
	}

	private void displayError(String error, HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// redirection from
		// FormAuthenticationService.setNotAuthenticated
		String versionString = req.getHeader("Orion-Version"); //$NON-NLS-1$
		Version version = versionString == null ? null : new Version(versionString);

		// TODO: This is a workaround for calls
		// that does not include the WebEclipse version header
		String xRequestedWith = req.getHeader("X-Requested-With"); //$NON-NLS-1$

		if (version == null && !"XMLHttpRequest".equals(xRequestedWith)) { //$NON-NLS-1$
			String url = "/ldaplogin/LoginWindow.html";
			if (req.getParameter("redirect") != null) {
				url += "?redirect=" + req.getParameter("redirect");
			}

			if (error == null) {
				error = "Invalid login";
			}
			url += url.contains("?") ? "&" : "?";
			url += "error=" + new String(Base64.encode(error.getBytes()));

			resp.sendRedirect(url);

		} else {
			resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			PrintWriter writer = resp.getWriter();
			JSONObject jsonError = new JSONObject();
			try {
				jsonError.put("error", error); //$NON-NLS-1$
				writer.print(jsonError);
				resp.setContentType("application/json"); //$NON-NLS-1$
			} catch (JSONException e) {/* ignore */
			}
		}
		resp.flushBuffer();
	}

	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		RequestDispatcher rd = req.getRequestDispatcher("/w3login/login"); //$NON-NLS-1$
		rd.forward(req, resp);
	}

}

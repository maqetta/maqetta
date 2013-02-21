package maqetta.server.orion.user;

import java.net.URI;

import javax.servlet.http.HttpServletRequest;

import org.eclipse.orion.internal.server.core.IWebResourceDecorator;
import org.eclipse.orion.server.core.LogHelper;
import org.eclipse.orion.server.useradmin.UserConstants;
import org.json.JSONException;
import org.json.JSONObject;

// Companion to LoginFixUpFilter.  Fixes response to remove temporary 'login' value generated in
// LoginFixUpFilter during user registration.

@SuppressWarnings("restriction")
public class LoginFixUpDecorator implements IWebResourceDecorator {

	public void addAtributesFor(HttpServletRequest req, URI resource, JSONObject representation) {
		if (!"POST".equals(req.getMethod()) ||  //$NON-NLS-1$
				!LoginFixUpFilter.USERS_SERVLET_ALIAS.equals(req.getServletPath()) ||
				req.getPathInfo() != null) {
			return;
		}
		
		// handle POST /users/
		try {
			String login = representation.getString(UserConstants.KEY_LOGIN);
			if (login.startsWith(LoginFixUpFilter.ID_TEMPLATE)) {
				// if one of our temporary 'login' values, replace with UID
				String uid = representation.getString(UserConstants.KEY_UID);
				representation.put(UserConstants.KEY_LOGIN, uid);
			}
		} catch (JSONException e) {
			// log and continue
			LogHelper.log(e);
		}
	}

}

package maqetta.server.orion.hosted;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.core.runtime.preferences.IEclipsePreferences;
import org.eclipse.orion.server.core.users.OrionScope;

public class RegistrationFilter implements Filter {



	public void init(FilterConfig filterConfig) throws ServletException {
	}

	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest httpRequest = (HttpServletRequest) request;
		HttpServletResponse httpResponse = (HttpServletResponse) response;
		String path = httpRequest.getPathInfo();
		/* null path means add user request */
		if ("POST".equals(httpRequest.getMethod()) && (path==null)) { //$NON-NLS-1$
			String loginTolken = request.getParameter("loginTolken");
			String login = request.getParameter("login");
			
			IEclipsePreferences signupTokens = new OrionScope().getNode("signup"); //$NON-NLS-1$
	    	
	    	/* index by the token for easy retrival */
			IEclipsePreferences result = (IEclipsePreferences) signupTokens.node(loginTolken);
	    	/* store the email address with the token */
			String storedEmail = result.get("SIGNUP_EMAIL", null);
			if(storedEmail!=null && storedEmail.equals(login)){
				chain.doFilter(request, response);
				return;
			}else{
				httpResponse.sendError(HttpServletResponse.SC_FORBIDDEN);
				return;
			}
			
		}
		chain.doFilter(request, response);
	}

	public void destroy() {
		// nothing to do
	}
}

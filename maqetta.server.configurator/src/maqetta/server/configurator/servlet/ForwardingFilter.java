package maqetta.server.configurator.servlet;

import java.io.IOException;
import javax.servlet.*;
import javax.servlet.http.*;

/**
 * Forward requests to given path.
 */
public class ForwardingFilter implements Filter {

	private String path;

	public void init(FilterConfig filterConfig) throws ServletException {
		path = filterConfig.getInitParameter("path");
	}

	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		if (path == null) {
			chain.doFilter(request, response);
		}

		final HttpServletRequest httpRequest = (HttpServletRequest) request;
		httpRequest.getRequestDispatcher(path).forward(request, response);
	}

	public void destroy() {
	}

}

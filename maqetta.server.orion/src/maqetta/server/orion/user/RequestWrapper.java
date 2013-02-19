package maqetta.server.orion.user;

import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

public class RequestWrapper extends HttpServletRequestWrapper {

	private HashMap<String, String[]> updatedMap = new HashMap<String, String[]>();

	public RequestWrapper(HttpServletRequest request) {
		super(request);
		
		updatedMap.putAll(request.getParameterMap());
	}

	/* (non-Javadoc)
	 * @see javax.servlet.ServletRequestWrapper#getParameter(java.lang.String)
	 */
	@Override
	public String getParameter(String name) {
		String[] values = updatedMap.get(name);
		if (values != null && values.length > 0) {
			return values[0];
		}
		return null;
	}

	/* (non-Javadoc)
	 * @see javax.servlet.ServletRequestWrapper#getParameterMap()
	 */
	@Override
	public Map<String, String[]> getParameterMap() {
		return updatedMap;
	}

	/* (non-Javadoc)
	 * @see javax.servlet.ServletRequestWrapper#getParameterNames()
	 */
	@Override
	public Enumeration<String> getParameterNames() {
		return Collections.enumeration(updatedMap.keySet());
	}

	/* (non-Javadoc)
	 * @see javax.servlet.ServletRequestWrapper#getParameterValues(java.lang.String)
	 */
	@Override
	public String[] getParameterValues(String name) {
		return updatedMap.get(name);
	}

	public void setParameter(String name, String value) {
		String[] values = { value };
		updatedMap.put(name, values);
	}

}

package maqetta.zazl;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.CharArrayWriter;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.GZIPInputStream;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.maqetta.server.IDavinciServerConstants;

public class MaqettaHTMLFilter implements Filter {
	private static final String CACHE_CONTROL = "Cache-Control";
	private static final String PRAGMA = "Pragma";
	private static final String EXPIRES = "Expires";
	
	private static Logger logger = Logger.getLogger("maqetta.zazl");
	private StringBuffer configScriptTag = null;
	private MaqettaOSGiResourceLoader resourceLoader = null;

	public MaqettaHTMLFilter(MaqettaOSGiResourceLoader resourceLoader) {
		this.resourceLoader = resourceLoader;
		configScriptTag = new StringBuffer();
		configScriptTag.append("<script type=\"text/javascript\">\n");
		configScriptTag.append("var dojoConfig = __DOJOCONFIG__;\n");
		configScriptTag.append("var zazlConfig = {\n");
		configScriptTag.append("	directInject: true,\n");
		configScriptTag.append("	warmupLoader: '__URLPREFIX__/dojo/dojo.js',\n");
		//configScriptTag.append("	debug: true,\n");
		configScriptTag.append("	injectUrl: '__CONTEXT_PATH__/_javascript',\n");
		configScriptTag.append("	packages:[\n");
		configScriptTag.append("		{'name':'dojo','location':'__URLPREFIX__/dojo'},\n");
		configScriptTag.append("		{'name':'dijit','location':'__URLPREFIX__/dijit'},\n");
		configScriptTag.append("		{'name':'dojox','location':'__URLPREFIX__/dojox'}\n");
		configScriptTag.append("	],\n	paths: {\n__PATHS__\n	}\n");
		configScriptTag.append("};\n");
		configScriptTag.append("dojoConfig.baseUrl='__CONTEXT_PATH__./';\n");
		configScriptTag.append("dojoConfig.packages = zazlConfig.packages;\n");
		configScriptTag.append("dojoConfig.paths = zazlConfig.paths;\n");
		configScriptTag.append("</script>\n");
	}
	
	public void init(FilterConfig filterConfig) throws ServletException {}

	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		if (!resourceLoader.contextPathSet()) {
			resourceLoader.setContextPath(((HttpServletRequest)request).getContextPath());
		}
		String pathInfo = ((HttpServletRequest)request).getPathInfo();
		boolean isZazlRequest = false;
		String strIsZazlRequest = request.getParameter("zazl");
		if (strIsZazlRequest != null && strIsZazlRequest.equals("true")) {
			isZazlRequest = true;
		}
		if (isZazlRequest && pathInfo.endsWith(".html") && pathInfo.startsWith(IDavinciServerConstants.USER_URL)) {
			HttpServletResponse resp = (HttpServletResponse)response;
			if (resp.containsHeader(EXPIRES)) {
				resp.setDateHeader(EXPIRES, 0);
				resp.setHeader(CACHE_CONTROL, "no-cache");
				resp.setHeader(PRAGMA, "no-cache");
			}
			PrintWriter out = response.getWriter();
			String requestURI = ((HttpServletRequest)request).getRequestURI();
			RequestWrapper requestWrapper = new RequestWrapper((HttpServletRequest)request);
			ResponseWrapper responseWrapper = new ResponseWrapper((HttpServletResponse)response);
			chain.doFilter(requestWrapper, responseWrapper);
			String responseText = responseWrapper.toString();
			if (responseText != null && responseText.length() > 0) {
				String result = responseText;
				CharArrayWriter caw = new CharArrayWriter();
				// Maqetta's servlet overrides the encoding with UTF-8, as does the HTML META tag in
				// typical Maqetta content.  Not clear if either of those get picked up.  Hard-code UTF-8, for now.
				HTMLParser parser = new HTMLParser(caw, /*response.getCharacterEncoding()*/ "UTF-8", configScriptTag.toString().replace("__CONTEXT_PATH__", request.getServletContext().getContextPath()), pathInfo);
				parser.parse(responseText);
				result = caw.toString();
				if (logger.isLoggable(Level.FINEST)) {
					logger.logp(Level.FINEST, getClass().getName(), "doFilter", "filter response : "+result);
				}
				response.setContentLength(result.length());
				out.write(result);
				out.close();
			}
		} else {
			chain.doFilter(request, response);
		}
	}
	
	public void destroy() {}

	public class ServletOutputStreamWrapper extends ServletOutputStream {
		private ByteArrayOutputStream baos = null;
		private DataOutputStream stream = null;
		
		public ServletOutputStreamWrapper() {
			baos = new ByteArrayOutputStream(1024 * 64);
			stream = new DataOutputStream(baos);
		}
		
		public void write(int b) throws IOException {
			stream.write(b);
		}
		
		public void write(byte[] b) throws IOException  { 
		    stream.write(b); 
		}

		public void write(byte[] b, int off, int len) throws IOException  {
			stream.write(b, off, len); 
		} 
		
		public String toString(String encoding) {
			GZIPInputStream gzipis = null;
			try {
				byte[] bytes = baos.toByteArray();
				if (bytes.length < 1) {
					return "";
				}
				if ((bytes[0] & 0xFF) == 0x1F && (bytes[1] & 0xFF) == 0x8B && (bytes[2] & 0xFF) == 0x08) {
					if (logger.isLoggable(Level.FINEST)) {
						logger.logp(Level.FINEST, getClass().getName(), "toString", "response content is gzipped");
					}
					gzipis = new GZIPInputStream(new ByteArrayInputStream(bytes));
					BufferedReader br = new BufferedReader(new InputStreamReader(gzipis, encoding));
					StringBuffer sb = new StringBuffer();
					String s = null;
					while ((s = br.readLine()) != null) {
						sb.append(s);
						sb.append("\n");
					}
					return sb.toString();
				} else {
					return baos.toString(encoding);
				}
			} catch (IOException e) {
				e.printStackTrace();
				return null;
			} finally {
				if (gzipis != null) { try { gzipis.close(); } catch (IOException e) {}}
			}
		}
	}
	
	public class ResponseWrapper extends HttpServletResponseWrapper {
		private CharArrayWriter writer = null;
		private PrintWriter pw = null;
		private ServletOutputStreamWrapper stream = null;
		private int status;
		private String charset = null;

		public ResponseWrapper(HttpServletResponse response) {
			super(response);
			charset = response.getCharacterEncoding();
		}

		public PrintWriter getWriter() {
			if (stream != null) {
	            throw new IllegalStateException("Cannot call getWriter() after getOutputStream()");
	        }
			
			if (writer == null) {
				writer = new CharArrayWriter();
				pw = new PrintWriter(writer); 
			}
			return pw;
		}
		
		public ServletOutputStream getOutputStream() {
			if (writer != null) {
	            throw new IllegalStateException("Cannot call getOutputStream() after getWriter()");
	        }
			if (stream == null) {
				stream = new ServletOutputStreamWrapper();
			}
			return stream;
		}
		
		public String toString() {
			if (writer != null) {
				return writer.toString();
			} else if (stream != null) {
				return stream.toString(charset);
			} else {
				return null;
			}
		}
		
		public void	setStatus(int sc) {
			super.setStatus(sc);
			status = sc;
		}
		
		public void	setStatus(int sc, String sm) {
			super.setStatus(sc, sm);
			status = sc;
		}
		
		public int getStatus() {
			return status;
		}
		
		public void setCharacterEncoding(String charset) {
			super.setCharacterEncoding(charset);
			this.charset = charset;
		}
		
		public void setHeader(String name, String value) {
		}

		public void addHeader(String name, String value) {
		}
	}
	
	public class RequestWrapper extends HttpServletRequestWrapper {

		public RequestWrapper(HttpServletRequest request) {
			super(request);
		}

		public String getHeader(String name) {
			logger.logp(Level.FINE, getClass().getName(), "getHeader", "getting header with name ["+name+"]");
			if (name.equalsIgnoreCase("If-None-Match") || name.equalsIgnoreCase("If-Modified-Since") || name.equalsIgnoreCase("If-Match")) {
				logger.logp(Level.FINE, getClass().getName(), "getHeader", "Skipping adding header ["+name+"]");
				return null;
			} else {
				return super.getHeader(name);
			}
		}
		
		public Enumeration getHeaderNames() {
			HttpServletRequest request = (HttpServletRequest)getRequest();
			List<String> headerNamelist = new ArrayList<String>();
			for (Enumeration<String> e = ((HttpServletRequest)request).getHeaderNames(); e.hasMoreElements();) {
				String headerName = e.nextElement();
				if (!headerName.equalsIgnoreCase("If-None-Match") && !headerName.equalsIgnoreCase("If-Modified-Since") && !headerName.equalsIgnoreCase("If-Match")) {
					headerNamelist.add(headerName);
				} else {
					logger.logp(Level.FINE, getClass().getName(), "getHeader", "Skipping adding header ["+headerName+"]");
				}
			}
			
			return Collections.enumeration(headerNamelist);
		}
	}
}

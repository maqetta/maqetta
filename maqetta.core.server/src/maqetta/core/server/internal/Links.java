package maqetta.core.server.internal;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.davinci.server.util.XMLFile;
import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.ILink;
import org.maqetta.server.ILinks;
import org.maqetta.server.IStorage;
import org.w3c.dom.Element;

public class Links extends XMLFile implements ILinks {

    public static final int SYSTEM_PATH     = 1;
    static final String     STR_SYSTEM_PATH = "systemPath";

    ILink[]                  links;
    IStorage                    linksFile;

    public static class Link implements ILink {
        public String path;
        public String location;
        int           type;
        public String parentPath;
        public String name;

        Link(String path, String location, int type) {
            this.path = path;
            this.location = location.trim();
            this.type = type;

            int inx = this.path.lastIndexOf('/');
            if (inx < 0) {
                this.parentPath = "";
                this.name = path;
            } else {
                this.parentPath = this.path.substring(0, inx);
                this.name = this.path.substring(inx + 1);
            }
        }
    }

    public Links(IStorage dir) {
        linksFile = dir.newInstance(dir, IDavinciServerConstants.LINKS_FILE);
        ArrayList list = this.load(linksFile);
        links = (ILink[]) list.toArray(new ILink[list.size()]);
    }

    /* (non-Javadoc)
	 * @see maqetta.core.server.internal.ILinks#findLinks(java.lang.String)
	 */
    public List findLinks(String path) {
        if (path.startsWith("./")) {
            path = path.substring(2);
        } else if (path.charAt(0) == '.') {
            path = path.substring(1);
        }
        ArrayList list = new ArrayList();
        for (int i = 0; i < this.links.length; i++) {
            if (this.links[i].parentPath.equals(path)) {
                list.add(this.links[i]);
            }
        }
        return list;
    }

    /* (non-Javadoc)
	 * @see maqetta.core.server.internal.ILinks#isLinkTarget(java.lang.String)
	 */
    public ILink isLinkTarget(String path) {
        for (int i = 0; i < this.links.length; i++) {
            if (this.links[i].location.equals(path)) {
                return this.links[i];
            }
        }
        return null;
    }

    /* (non-Javadoc)
	 * @see maqetta.core.server.internal.ILinks#findPath(java.lang.String)
	 */
    public String findPath(String path) {
        for (int i = 0; i < this.links.length; i++) {
            if (this.links[i].path.equals(path)) {
                return this.links[i].location;
            }
        }
        return null;
    }

    /* (non-Javadoc)
	 * @see maqetta.core.server.internal.ILinks#hasLink(java.lang.String)
	 */
    public ILink hasLink(String path) {
        for (int i = 0; i < this.links.length; i++) {
            if (path.startsWith(this.links[i].path)) {
                return this.links[i];
            }
        }
        return null;
    }

    /* (non-Javadoc)
	 * @see maqetta.core.server.internal.ILinks#addLink(java.lang.String, java.lang.String, int)
	 */
    public boolean addLink(String path, String location, int type) throws IOException {
        String loc = findPath(path);
        if (loc != null) {
            return false;
        }
        Link link = new Link(path, location, type);

        Link[] newLinks = new Link[links.length + 1];
        System.arraycopy(links, 0, newLinks, 0, links.length);
        newLinks[links.length] = link;
        this.links = newLinks;

        this.save();

        return true;
    }

    /* (non-Javadoc)
	 * @see maqetta.core.server.internal.ILinks#allLinks()
	 */
    public ILink[] allLinks() {
        return this.links;
    }

    /* (non-Javadoc)
	 * @see maqetta.core.server.internal.ILinks#removeLink(java.lang.String)
	 */
    public boolean removeLink(String path) throws IOException {
        for (int i = 0; i < this.links.length; i++) {
            if (this.links[i].path.equals(path)) {
                Link[] newLinks = new Link[links.length - 1];
                System.arraycopy(links, 0, newLinks, 0, i);
                System.arraycopy(links, i + 1, newLinks, i, links.length - 1 - i);
                this.links = newLinks;

                this.save();

                return true;
            }
        }
        return false;

    }

    private void save() throws IOException {
        this.save(linksFile, Arrays.asList(this.links));
    }

    protected Object createObject(Element element, String[] attributeNames, String[] attributes) {
        int type = 0;
        if (Links.STR_SYSTEM_PATH.equals(attributes[2])) {
            type = Links.SYSTEM_PATH;
        }
        ILink link = new Link(attributes[0], attributes[1], type);
        return link;
    }

    
    protected String[] getAttributeNames() {
        return new String[] { "path", "location", "type" };
    }

    protected String[] getAttributeValues(Object object) {
        Link link = (Link) object;
        String linkAttr = null;
        if (link.type == Links.SYSTEM_PATH) {
            linkAttr = Links.STR_SYSTEM_PATH;
        }
        return new String[] { link.path, link.location, linkAttr };
    }

    @Override
    protected String getElementTag() {
        return "link";
    }

    @Override
    protected String getRootTag() {
        return "links";
    }

	@Override
	protected String getAttributeValue(String attribute, Object object) {
		// TODO Auto-generated method stub
		Link link = (Link)object;
		if(attribute.equalsIgnoreCase("path")){
			return link.path;
		}
		
		if(attribute.equalsIgnoreCase("location")){
			return link.location;
		}
		
		if(attribute.equalsIgnoreCase("type")){
			 String linkAttr = null;
		        if (link.type == Links.SYSTEM_PATH) {
		            linkAttr = Links.STR_SYSTEM_PATH;
		        }
		        return linkAttr;
		}
		return null;
	}

}

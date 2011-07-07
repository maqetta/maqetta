package org.davinci.server.internal;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.davinci.server.IDavinciServerConstants;
import org.davinci.server.util.XMLFile;
import org.w3c.dom.Element;

public class Links extends XMLFile {

    public static final int SYSTEM_PATH     = 1;
    static final String     STR_SYSTEM_PATH = "systemPath";

    Link[]                  links;
    File                    linksFile;

    public static class Link {
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

    public Links(File dir) {
        linksFile = new File(dir, IDavinciServerConstants.LINKS_FILE);
        ArrayList list = this.load(linksFile);
        links = (Link[]) list.toArray(new Link[list.size()]);
    }

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

    public Link isLinkTarget(String path) {
        for (int i = 0; i < this.links.length; i++) {
            if (this.links[i].location.equals(path)) {
                return this.links[i];
            }
        }
        return null;
    }

    public String findPath(String path) {
        for (int i = 0; i < this.links.length; i++) {
            if (this.links[i].path.equals(path)) {
                return this.links[i].location;
            }
        }
        return null;
    }

    public Link hasLink(String path) {
        for (int i = 0; i < this.links.length; i++) {
            if (path.startsWith(this.links[i].path)) {
                return this.links[i];
            }
        }
        return null;
    }

    public boolean addLink(String path, String location, int type) {
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

    public Link[] allLinks() {
        return this.links;
    }

    public boolean removeLink(String path) {
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

    private void save() {
        this.save(linksFile, Arrays.asList(this.links));
    }

    @Override
    protected Object createObject(Element element, String[] attributes) {
        int type = 0;
        if (Links.STR_SYSTEM_PATH.equals(attributes[2])) {
            type = Links.SYSTEM_PATH;
        }
        Link link = new Link(attributes[0], attributes[1], type);
        return link;
    }

    @Override
    protected String[] getAttributeNames() {
        return new String[] { "path", "location", "type" };
    }

    @Override
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

}

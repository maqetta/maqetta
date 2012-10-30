package maqetta.core.server.util;

import java.util.ArrayList;
import java.util.Arrays;

import org.davinci.server.user.IUser;
import org.davinci.server.util.JSONWriter;

import org.maqetta.server.IDavinciServerConstants;
import org.maqetta.server.IVResource;
import org.maqetta.server.IVResourceFilter;
import org.maqetta.server.VLibraryResource;

public class Resource {

    static ArrayList resourceFilter = new ArrayList();
    static {
        DirectoryFilter df = new DirectoryFilter(new String[] { IDavinciServerConstants.SETTINGS_DIRECTORY_NAME,
            IDavinciServerConstants.DOWNLOAD_DIRECTORY_NAME, IDavinciServerConstants.SVN_DIRECTORY_NAME, IDavinciServerConstants.REVIEW_DIRECTORY_NAME});

        Resource.addFilter(df);
        Resource.addFilter(new WorkingCopyFilter());
    }

    public static void addFilter(IVResourceFilter filterName) {
        Resource.resourceFilter.add(filterName);
    }

    public static boolean isHidden(IVResource file) {
        for (int i = 0; i < Resource.resourceFilter.size(); i++) {
            IVResourceFilter filter = (IVResourceFilter) Resource.resourceFilter.get(i);
            if (filter.isHidden(file)) {
                return true;
            }
        }

        return false;
    }

    public static String vRsourcesToJson(IVResource listFiles[], boolean fullPath) {

        JSONWriter jsonWriter = new JSONWriter(true);
        for (int j = 0; j < listFiles.length; j++) {
            if (Resource.isHidden(listFiles[j])) {
                continue;
            }

            String pathName = null;
            if (fullPath) {
                pathName = listFiles[j].getPath();
            } else {
                pathName = listFiles[j].getName();
            }

            jsonWriter.startObject().addField("name", pathName);
            jsonWriter.addField("isDir", listFiles[j].isDirectory());
            jsonWriter.addField("isNew", listFiles[j].isNew());
            jsonWriter.addField("readOnly", listFiles[j].readOnly());
            jsonWriter.addField("isDirty", listFiles[j].isDirty());
            if (listFiles[j] instanceof VLibraryResource) {
                VLibraryResource r = (VLibraryResource) listFiles[j];
                jsonWriter.addField("libraryId", r.getLibraryId());
                jsonWriter.addField("libVersion", r.getLibraryVersion());
            }

            jsonWriter.endObject();
        }
        return jsonWriter.getJSON();
    }

    public static String foundVRsourcesToJson(IVResource listFiles[], IUser user) {

        JSONWriter jsonWriter = new JSONWriter(true);
        for (int i = 0; i < listFiles.length; i++) {
            ArrayList parents = new ArrayList();
            // parents.add(workspace);
            if (Resource.isHidden(listFiles[i])) {
                continue;
            }
            parents.addAll(Arrays.asList(listFiles[i].getParents()));

            String name = listFiles[i].getPath();
            jsonWriter.startObject().addField("file", name).addFieldName("parents").startArray();
            for (int j = 0; j < parents.size(); j++) {
                if (Resource.isHidden((IVResource) parents.get(j))) {
                    continue;
                }
                jsonWriter.startObject().addField("name", ((IVResource) parents.get(j)).getName());
                jsonWriter.addFieldName("members").startArray();

                String parentPath = ((IVResource) parents.get(j)).getPath();

                IVResource[] members = user.listFiles(parentPath);
                for (int k = 0; k < members.length; k++) {
                    if (Resource.isHidden(members[k])) {
                        continue;
                    }
                    jsonWriter.startObject().addField("isDir", members[k].isDirectory());
                    jsonWriter.addField("name", members[k].getName());
                    jsonWriter.addField("readOnly", members[k].readOnly());
                    jsonWriter.addField("isDirty", members[k].isDirty());
                    if (members[k] instanceof VLibraryResource) {
                        VLibraryResource r = (VLibraryResource) members[k];
                        jsonWriter.addField("libraryId", r.getLibraryId());
                        jsonWriter.addField("libVersion", r.getLibraryVersion());
                    }

                    jsonWriter.endObject();
                }
                jsonWriter.endArray();
                jsonWriter.endObject();

            }
            jsonWriter.endArray();
            jsonWriter.endObject();
        }
        return jsonWriter.getJSON();
    }

}

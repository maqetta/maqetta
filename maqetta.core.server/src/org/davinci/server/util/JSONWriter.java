package org.davinci.server.util;

public class JSONWriter {
    StringBuffer sb       = new StringBuffer();

    boolean      wasOne[] = new boolean[100];
    int          stackPtr = 0;
    boolean      isArray;

    public JSONWriter(boolean isArray) {
        this.isArray = isArray;
        if (isArray) {
            startArray();
        } else {
            sb.append("{");
        }
    }

    public JSONWriter startObject() {
        if (wasOne[stackPtr]) {
            sb.append(", ");
        }
        wasOne[stackPtr] = true;

        wasOne[++stackPtr] = false;
        sb.append("{");
        return this;
    }

    public JSONWriter startArray() {
        wasOne[++stackPtr] = false;
        sb.append("[");
        return this;
    }

    public JSONWriter endObject() {
        sb.append("}");
        stackPtr--;
        return this;
    }

    public JSONWriter endArray() {
        sb.append("]");
        stackPtr--;
        return this;
    }

    public JSONWriter addFieldName(String name) {
        if (wasOne[stackPtr]) {
            sb.append(", ");
        }
        sb.append('"').append(name).append('"').append(" : ");
        wasOne[stackPtr] = true;
        return this;
    }

    public JSONWriter addField(String name, boolean value) {
        this.addFieldName(name);
        sb.append(value);
        return this;
    }

    public JSONWriter addField(String name, int value) {
        this.addFieldName(name);
        sb.append(value);
        return this;
    }

    public JSONWriter addField(String name, String val) {
        this.addFieldName(name);
        String value = val == null ? "" : val;

        sb.append('"');
        char[] chars = null;
        int i = 0;
        loop: for (; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"':
                    chars = value.toCharArray();
                    sb.append(chars, 0, i);
                    sb.append("\\\"");
                    break loop;
                case '\\':
                    chars = value.toCharArray();
                    sb.append(chars, 0, i);
                    sb.append("\\\\");
                    break loop;
                case '\n':
                    chars = value.toCharArray();
                    sb.append(chars, 0, i);
                    sb.append("\\n");
                    break loop;
                case '\r':
                    chars = value.toCharArray();
                    sb.append(chars, 0, i);
                    sb.append("\\r");
                    break loop;
                case '\t':
                    chars = value.toCharArray();
                    sb.append(chars, 0, i);
                    sb.append("\\t");
                    break loop;
                case '\f':
                    chars = value.toCharArray();
                    sb.append(chars, 0, i);
                    sb.append("\\f");
                    break loop;
                case '\b':
                    chars = value.toCharArray();
                    sb.append(chars, 0, i);
                    sb.append("\\b");
                    break loop;

                default:
                    continue;
            }
        }
        if (chars == null) {
            sb.append(value);
        } else {
            i++;
            for (; i < value.length(); i++) {
                char c = value.charAt(i);
                switch (c) {
                    case '"':
                        sb.append("\\\"");
                        continue;
                    case '\\':
                        sb.append("\\\\");
                        continue;
                    case '\n':
                        sb.append("\\n");
                        continue;
                    case '\r':
                        sb.append("\\r");
                        continue;
                    case '\t':
                        sb.append("\\t");
                        continue;
                    case '\f':
                        sb.append("\\f");
                        continue;
                    case '\b':
                        sb.append("\\b");
                        continue;

                    default:
                        sb.append(c);
                        continue;
                }
            }
        }

        sb.append('"');

        return this;
    }

    public JSONWriter addField(String name, String[] array) {
        this.addFieldName(name);

        for (int ll = 0; ll < array.length; ll++) {
            if (ll > 0) {
                sb.append(",");
            }
            sb.append("[");
            String value = array[ll];
            sb.append('"');
            char[] chars = null;
            int i = 0;
            loop: for (; i < value.length(); i++) {
                char c = value.charAt(i);
                switch (c) {
                    case '"':
                        chars = value.toCharArray();
                        sb.append(chars, 0, i);
                        sb.append("\\\"");
                        break loop;
                    case '\\':
                        chars = value.toCharArray();
                        sb.append(chars, 0, i);
                        sb.append("\\\\");
                        break loop;
                    case '\n':
                        chars = value.toCharArray();
                        sb.append(chars, 0, i);
                        sb.append("\\n");
                        break loop;
                    case '\r':
                        chars = value.toCharArray();
                        sb.append(chars, 0, i);
                        sb.append("\\r");
                        break loop;
                    case '\t':
                        chars = value.toCharArray();
                        sb.append(chars, 0, i);
                        sb.append("\\t");
                        break loop;
                    case '\f':
                        chars = value.toCharArray();
                        sb.append(chars, 0, i);
                        sb.append("\\f");
                        break loop;
                    case '\b':
                        chars = value.toCharArray();
                        sb.append(chars, 0, i);
                        sb.append("\\b");
                        break loop;

                    default:
                        continue;
                }
            }
            if (chars == null) {
                sb.append(value);
            } else {
                i++;
                for (; i < value.length(); i++) {
                    char c = value.charAt(i);
                    switch (c) {
                        case '"':
                            sb.append("\\\"");
                            continue;
                        case '\\':
                            sb.append("\\\\");
                            continue;
                        case '\n':
                            sb.append("\\n");
                            continue;
                        case '\r':
                            sb.append("\\r");
                            continue;
                        case '\t':
                            sb.append("\\t");
                            continue;
                        case '\f':
                            sb.append("\\f");
                            continue;
                        case '\b':
                            sb.append("\\b");
                            continue;

                        default:
                            sb.append(c);
                            continue;
                    }
                }
            }

            sb.append('"');
            sb.append("]");
        }
        return this;
    }

    public String getJSON() {
        if (this.isArray) {
            this.endArray();
        } else {
            sb.append("}");
        }
        return sb.toString();
    }

    public String toString() {
        if (this.sb == null) {
            return "EMPTY";
        }

        return this.sb.toString();
    }

    public boolean isEmpty() {
        int ptr = this.stackPtr;
        while (ptr >= 0) {
            if (wasOne[ptr--]) {
                return false;
            }
        }
        return true;
    }
}

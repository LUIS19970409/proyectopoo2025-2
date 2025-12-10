package com.example.users;

import java.util.*;
import java.io.*;
import java.nio.file.*;
import java.util.regex.*;

public class UsuarioManager {
    private final List<Usuario> usuarios = new ArrayList<>();
    private static final String STORAGE_FILE = "users_db.json";

    public void addUsuario(Usuario u) {
        // Evitar añadir usuarios con username duplicado
        if (findByUsername(u.getUsername()) != null) {
            return;
        }
        usuarios.add(u);
    }

    public Usuario findByUsername(String username) {
        for (Usuario u : usuarios) {
            if (u.getUsername().equals(username)) return u;
        }
        return null;
    }

    public boolean autenticar(String username, String password) {
        Usuario u = findByUsername(username);
        return u != null && u.checkPassword(password);
    }

    // Serializa manualmente la lista de usuarios a JSON (sin dependencias externas)
    public void saveToFile() throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("[\n");
        for (int i = 0; i < usuarios.size(); i++) {
            Usuario u = usuarios.get(i);
            sb.append("  {\n");
            sb.append(String.format("    \"password\": \"%s\",\n", escape(u.getPassword())));
            sb.append(String.format("    \"role\": \"%s\",\n", escape(u.getRole())));
            sb.append(String.format("    \"nombre\": \"%s\",\n", escape(u.getNombre())));
            if (u instanceof Administrador) {
                sb.append(String.format("    \"nivel\": %d,\n", ((Administrador)u).getNivel()));
            }
            if (u instanceof Rector) {
                sb.append(String.format("    \"facultad\": \"%s\",\n", escape(((Rector)u).getFacultad())));
            }
            if (u instanceof Abogado) {
                sb.append(String.format("    \"especialidad\": \"%s\",\n", escape(((Abogado)u).getEspecialidad())));
            }
            sb.append(String.format("    \"email\": \"%s\",\n", escape(u.getEmail())));
            sb.append(String.format("    \"username\": \"%s\"\n", escape(u.getUsername())));
            sb.append(i == usuarios.size() - 1 ? "  \n  }\n" : "  },\n");
        }
        sb.append("]\n");
        Files.write(Paths.get(STORAGE_FILE), sb.toString().getBytes("UTF-8"));
    }

    // Carga desde JSON con un parser simple, tolerante al formato producido por saveToFile
    public void loadFromFile() throws IOException {
        Path p = Paths.get(STORAGE_FILE);
        if (!Files.exists(p)) return;
        String content = new String(Files.readAllBytes(p), "UTF-8");
        // Extraer objetos individuales dividiendo por '},' que separa objetos en un array
        String inner = content.trim();
        if (!inner.startsWith("[")) return;
        inner = inner.substring(1, inner.lastIndexOf(']'));
        String[] parts = inner.split("\\},\\s*\\{");
        usuarios.clear();
            Pattern stringProp = Pattern.compile("\"([^\"]+)\"\\s*:\\s*\"([^\"]*)\"");
            Pattern numberProp = Pattern.compile("\"([^\"]+)\"\\s*:\\s*(\\d+)");
        for (String raw : parts) {
            String obj = raw.trim();
            if (!obj.startsWith("{")) obj = "{" + obj;
            if (!obj.endsWith("}")) obj = obj + "}";
            Map<String, String> map = new HashMap<>();
            Matcher m = stringProp.matcher(obj);
            while (m.find()) {
                map.put(m.group(1), m.group(2));
            }
            Matcher m2 = numberProp.matcher(obj);
            while (m2.find()) {
                map.put(m2.group(1), m2.group(2));
            }
            String role = map.getOrDefault("role", "");
            String username = map.getOrDefault("username", "");
            String password = map.getOrDefault("password", "");
            String nombre = map.getOrDefault("nombre", "");
            String email = map.getOrDefault("email", "");
            if ("ABOGADO".equalsIgnoreCase(role)) {
                String esp = map.getOrDefault("especialidad", "");
                addUsuario(new Abogado(username, password, nombre, email, esp));
            } else if ("RECTOR".equalsIgnoreCase(role)) {
                String fac = map.getOrDefault("facultad", "");
                addUsuario(new Rector(username, password, nombre, email, fac));
            } else if ("ADMIN".equalsIgnoreCase(role)) {
                int nivel;
                try { nivel = Integer.parseInt(map.getOrDefault("nivel", "0")); } catch (NumberFormatException e) { nivel = 0; }
                addUsuario(new Administrador(username, password, nombre, email, nivel));
            }
        }
    }

    public List<Usuario> getUsuarios() {
        return usuarios;
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}

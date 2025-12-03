package com.example.users;

import java.util.*;
import java.io.*;
import com.google.gson.*;
import com.google.gson.reflect.*;

public class UsuarioManager {
    private List<Usuario> usuarios = new ArrayList<>();
    private static final String STORAGE_FILE = "users_db.json";
    private Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public void addUsuario(Usuario u) {
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
        return u != null && u.getPassword().equals(password);
    }

    public void saveToFile() throws IOException {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Usuario u : usuarios) {
            Map<String,Object> m = new HashMap<>();
            m.put("role", u.getRole());
            m.put("username", u.getUsername());
            m.put("password", u.getPassword());
            m.put("nombre", u.getNombre());
            m.put("email", u.getEmail());
            if (u instanceof Abogado) m.put("especialidad", ((Abogado)u).getEspecialidad());
            if (u instanceof Rector) m.put("facultad", ((Rector)u).getFacultad());
            if (u instanceof Administrador) m.put("nivel", ((Administrador)u).getNivel());
            rows.add(m);
        }
        try (Writer w = new FileWriter(STORAGE_FILE)) {
            gson.toJson(rows, w);
        }
    }

    public void loadFromFile() throws IOException {
        File f = new File(STORAGE_FILE);
        if (!f.exists()) return;
        try (Reader r = new FileReader(f)) {
            TypeToken<List<Map<String,Object>>> tt = new TypeToken<List<Map<String,Object>>>(){};
            List<Map<String,Object>> rows = gson.fromJson(r, tt.getType());
            usuarios.clear();
            for (Map<String,Object> m : rows) {
                String role = (String)m.get("role");
                String username = (String)m.get("username");
                String password = (String)m.get("password");
                String nombre = (String)m.get("nombre");
                String email = (String)m.get("email");
                if ("ABOGADO".equals(role)) {
                    String esp = (String)m.getOrDefault("especialidad", "");
                    usuarios.add(new Abogado(username,password,nombre,email,esp));
                } else if ("RECTOR".equals(role)) {
                    String fac = (String)m.getOrDefault("facultad", "");
                    usuarios.add(new Rector(username,password,nombre,email,fac));
                } else if ("ADMIN".equals(role)) {
                    Double nivelD = m.get("nivel") instanceof Number ? ((Number)m.get("nivel")).doubleValue() : 0;
                    usuarios.add(new Administrador(username,password,nombre,email, nivelD.intValue()));
                }
            }
        }
    }

    public List<Usuario> getUsuarios() {
        return usuarios;
    }
}

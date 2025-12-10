package com.example.users;

public class Rector extends Usuario {
    private final String facultad;

    public Rector(String username, String password, String nombre, String email, String facultad) {
        super(username, password, nombre, email);
        this.facultad = facultad;
    }

    public String getFacultad() { return facultad; }

    @Override
    public String getRole() { return "RECTOR"; }

    @Override
    public String getRoleDescription() {
        return "Rector de la facultad: " + (facultad == null || facultad.isEmpty() ? "(no especificada)" : facultad);
    }
}

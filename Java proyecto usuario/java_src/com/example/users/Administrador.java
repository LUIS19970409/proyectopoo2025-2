package com.example.users;

public class Administrador extends Usuario {
    private final int nivel;

    public Administrador(String username, String password, String nombre, String email, int nivel) {
        super(username, password, nombre, email);
        this.nivel = nivel;
    }

    public int getNivel() { return nivel; }

    @Override
    public String getRole() { return "ADMIN"; }

    @Override
    public String getRoleDescription() {
        return "Administrador (nivel: " + nivel + ")";
    }
}

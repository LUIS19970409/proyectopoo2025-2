package com.example.users;

public abstract class Usuario {
    protected String username;
    protected String password;
    protected String nombre;
    protected String email;

    public Usuario(String username, String password, String nombre, String email) {
        this.username = username;
        this.password = password;
        this.nombre = nombre;
        this.email = email;
    }

    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getNombre() { return nombre; }
    public String getEmail() { return email; }

    public abstract String getRole();

    @Override
    public String toString() {
        return String.format("{role:%s, username:%s, nombre:%s, email:%s}", getRole(), username, nombre, email);
    }
}

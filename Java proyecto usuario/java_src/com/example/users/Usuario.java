package com.example.users;

public abstract class Usuario {
    private final String username;
    private String password;
    private String nombre;
    private String email;

    public Usuario(String username, String password, String nombre, String email) {
        this.username = username;
        this.password = password;
        this.nombre = nombre;
        this.email = email;
    }


    // Encapsulación: acceso controlado a campos
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getNombre() { return nombre; }
    public String getEmail() { return email; }

    public void setPassword(String newPassword) { this.password = newPassword; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setEmail(String email) { this.email = email; }

    // Método seguro para comprobar contraseña (uso preferible a comparar el campo directamente)
    public boolean checkPassword(String candidate) {
        if (candidate == null) return false;
        return this.password.equals(candidate);
    }

    // Herencia / Polimorfismo: cada subclase define su rol y una descripción
    public abstract String getRole();
    public abstract String getRoleDescription();

    @Override
    public String toString() {
        return String.format("{role:%s, username:%s, nombre:%s, email:%s}", getRole(), username, nombre, email);
    }
}

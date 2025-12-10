package com.example.users;

public class Abogado extends Usuario {
    private final String especialidad;

    public Abogado(String username, String password, String nombre, String email, String especialidad) {
        super(username, password, nombre, email);
        this.especialidad = especialidad;
    }

    public String getEspecialidad() { return especialidad; }

    @Override
    public String getRole() { return "ABOGADO"; }

    @Override
    public String getRoleDescription() {
        return "Abogado especializado en: " + (especialidad == null || especialidad.isEmpty() ? "(no especificado)" : especialidad);
    }
}

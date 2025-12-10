package com.example.users;

import java.io.IOException;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        UsuarioManager um = new UsuarioManager();
        try {
            um.loadFromFile();
            System.out.println("Usuarios cargados: " + um.getUsuarios().size());
        } catch (IOException e) {
            System.out.println("No se pudo cargar la base temporal: " + e.getMessage());
        }

        // Demo: crear usuarios basicos y guardar
        um.addUsuario(new Administrador("admin","admin123","Admin","admin@example.com", 9));
        um.addUsuario(new Rector("rector","rector123","Rector","rector@example.com","Ciencias" ));
        um.addUsuario(new Abogado("abog","abog123","Abogado","abog@example.com","Penal" ));

        try {
            um.saveToFile();
            System.out.println("Usuarios guardados en users_db.json");
        } catch (IOException e) {
            System.out.println("Error guardando: " + e.getMessage());
        }

        // Demostración de polimorfismo: cada usuario puede describir su rol
        System.out.println("-- Descripciones por rol (polimorfismo) --");
        for (Usuario ux : um.getUsuarios()) {
            System.out.println(ux.getUsername() + " -> " + ux.getRole() + " : " + ux.getRoleDescription());
        }

        // Autenticacion sencilla por consola
        try (Scanner sc = new Scanner(System.in)) {
            System.out.print("Usuario: "); String u = sc.nextLine();
            System.out.print("Clave: "); String p = sc.nextLine();
            if (um.autenticar(u,p)) {
                System.out.println("Autenticado! -> " + u);
            } else {
                System.out.println("Credenciales invalidas.");
            }
        }
    }
}

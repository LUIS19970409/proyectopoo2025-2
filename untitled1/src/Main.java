import java.swing.*;
public class Main {
    public static void main(String[] args) {
        JFrame frame = new JFrame("Usuario");
        frame.setContentPane(new Usuario().panel1);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.pack();
        frame.setVisible(true);
    }



}

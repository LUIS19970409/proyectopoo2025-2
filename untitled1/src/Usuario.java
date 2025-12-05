import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class Usuario {
    private JPanel panel1;
    private JTextField txtNombreRegistrar;
    private JButton registrarButton;
    private JLabel tituloRegistrarLabel;
    private JLabel nombreLabelRegistrar;
    private JLabel cedulaLabelRegistrar;
    private JLabel correoLabelRegistrar;
    private JLabel usuarioLabelRegistrar;
    private JLabel contraseniaLabelRegistar;
    private JTextField txtContraseniaRegistrar;
    private JTextField txtRegistarUsuario;
    private JTextField txtCorreoRegistrar;
    private JTextField txtCedulaRegistrar;


    public Usuario() {
        registrarButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                System.out.println("la sapa");
            }
        });
    }
}

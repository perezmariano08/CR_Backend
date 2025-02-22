const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.ML_CONTACTO_USER,
        pass: process.env.ML_CONTACTO_PASSWORD,
    },
});

const userMessageContact = async (req, res) => {
    const { nombre, email, mensaje } = req.body;
    try {
        const mailOptions = {
            from: process.env.ML_CONTACTO_USER,
            to: process.env.ML_CONTACTO_USER,
            subject: `Nuevo mensaje de ${nombre}`,
            text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`,
            replyTo: email,
            html: `
                <h2>Nuevo mensaje de contacto</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mensaje:</strong> ${mensaje}</p>
            `,
        };
        
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado con éxito', nombre, email, mensaje);

        // ENVÍO DE RESPUESTA AL CLIENTE
        return res.status(200).json({ message: 'Correo enviado correctamente' });

    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return res.status(500).json({ error: 'Error al enviar el correo' });
    }
};

module.exports = {
    userMessageContact
};

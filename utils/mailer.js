const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { URL_FRONT, URL_BACK } = require('./utils');

// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` para el puerto 465, `false` para otros puertos
    auth: {
        user: "jpozzocontacto@gmail.com",
        pass: "ikju mtir gyft vota",
    },
});

const sendVerificationEmail = async (email, dni, nombre) => {
    try {
        // Leer y procesar la plantilla HTML
        const templatePath = path.join(__dirname, '..', 'templates', 'email-template.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        // Reemplazar los marcadores en la plantilla
        const currentYear = new Date().getFullYear();
        html = html.replace('{{url}}', `${URL_BACK}/auth/activar-cuenta?dni=${dni}`);
        html = html.replace('{{year}}', currentYear);
        html = html.replace('{{nombre}}', nombre)

        // Enviar el correo
        await transporter.sendMail({
            from: '"Validar cuenta 👻" <jpozzocontacto@gmail.com>',
            to: email,
            subject: "Validar cuenta ✔",
            html: html
        });

        console.log('Correo de verificación enviado');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('Error al enviar el correo'); // Re-lanzar el error para manejarlo en la función de creación de cuenta
    }
};

const forgotPassword = async (email, dni) => {
    try {
        //Generar token Y CAMBIAR KEYS
        const token = jwt.sign({ dni }, 'your-secret-key', {expiresIn: '1h'})

        // Leer y procesar la plantilla HTML
        const templatePath = path.join(__dirname, '..', 'templates', 'forgot-password-template.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        // Reemplazar los marcadores en la plantilla
        const currentYear = new Date().getFullYear();
        html = html.replace('{{url}}', `${URL_FRONT}/create-password?token=${token}`);
        html = html.replace('{{year}}', currentYear);

        // Enviar el correo
        await transporter.sendMail({
            from: '"Recuperar contraseña" <jpozzocontacto@gmail.com>',
            to: email,
            subject: "Recuperar contraseña",
            html: html
        });

        console.log('Correo de recuperación enviado');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('Error al enviar el correo');
    }
};

module.exports = {
    transporter,
    sendVerificationEmail,
    forgotPassword
};

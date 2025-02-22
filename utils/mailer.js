const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { URL_FRONT, URL_BACK } = require('./utils');

dotenv.config();

// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.ML_USER,
        pass: process.env.ML_PASSWORD,
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
        html = html.replace('{{nombre}}', nombre);

        // Enviar el correo
        await transporter.sendMail({
            from: '"Copa Relámpago" <soporte@coparelampago.com>',
            to: email,
            subject: "Copa Relámpago - Mail de validación",
            html: html
        });

        console.log('Correo de verificación enviado');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('Error al enviar el correo');
    }
};

const sendVerificationChangeEmail = async (email, dni, nombre) => {
    try {
        // Leer y procesar la plantilla HTML
        const templatePath = path.join(__dirname, '..', 'templates', 'change-email-template.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        // Reemplazar los marcadores en la plantilla
        const currentYear = new Date().getFullYear();
        html = html.replace('{{url}}', `${URL_BACK}/auth/activar-email?dni=${dni}`);
        html = html.replace('{{year}}', currentYear);
        html = html.replace('{{nombre}}', nombre);

        // Enviar el correo
        await transporter.sendMail({
            from: '"Copa Relámpago" <soporte@coparelampago.com>',
            to: email,
            subject: "Copa Relámpago - Mail de validación",
            html: html
        });

        console.log('Correo de verificación enviado');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('Error al enviar el correo');
    }
};

const forgotPassword = async (email, dni) => {
    try {
        // Generar token de recuperación
        const token = jwt.sign({ dni }, 'your-secret-key', { expiresIn: '3m' });

        // Leer y procesar la plantilla HTML
        const templatePath = path.join(__dirname, '..', 'templates', 'forgot-password-template.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        // Reemplazar los marcadores en la plantilla
        const currentYear = new Date().getFullYear();
        html = html.replace('{{url}}', `${URL_FRONT}/create-password?token=${token}`);
        html = html.replace('{{year}}', currentYear);

        // Enviar el correo
        await transporter.sendMail({
            from: '"Copa Relámpago" <soporte@coparelampago.com>',
            to: email,
            subject: "Copa Relámpago - Mail de recuperación de contraseña",
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
    forgotPassword,
    sendVerificationChangeEmail
};
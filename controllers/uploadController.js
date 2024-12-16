const FTPClient = require("ftp");
const fs = require("fs");

const uploadToFTP = (filePath, remotePath) => {
    return new Promise((resolve, reject) => {
        const client = new FTPClient();

        client.on("ready", () => {
            client.put(filePath, remotePath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve("Archivo subido exitosamente.");
                }
                client.end();
            });
        });

        client.on("error", (err) => {
            reject(err);
        });

        client.connect({
            host: "185.245.180.126",
            user: "u436441116.coparelampago.com",
            password: "mK:Y0^~cAwKHK^9c",
        });
    });
};

exports.uploadImage = async (req, res) => {
    try {
        // Validar si el archivo existe
        if (!req.file) {
            return res.status(400).json({ error: "No se ha enviado ningún archivo." });
        }

        const localPath = req.file.path; // Ruta temporal donde Multer guarda el archivo
        const remotePath = `/public_html/uploads/Equipos/${req.file.originalname}`;

        console.log("Subiendo archivo...");
        const result = await uploadToFTP(localPath, remotePath);

        // Elimina el archivo temporal después de subirlo
        fs.unlinkSync(localPath);

        res.status(200).json({ message: result, path: remotePath });
    } catch (error) {
        console.error("Error en la subida de imagen:", error);
        res.status(500).json({ error: "Error al subir la imagen." });
    }
};

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
            host: "46.202.145.151",
            user: "u117252722.coparelampago.com",
            password: "~Is2JoT|J>V2Ir[I",
        });
    });
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se ha enviado ningún archivo." });
        }

        const directory = req.body.directory;
        if (!directory) {
            return res.status(400).json({ error: "El nombre del directorio es obligatorio." });
        }

        const localPath = req.file.path;
        const remotePath = `/public_html/uploads/${directory}/${req.file.originalname}`;

        console.log("Subiendo archivo...");
        const result = await uploadToFTP(localPath, remotePath);

        fs.unlinkSync(localPath);

        res.status(200).json({ message: result, path: remotePath });
    } catch (error) {
        console.error("Error en la subida de imagen:", error);
        res.status(500).json({ error: "Error al subir la imagen." });
    }
};


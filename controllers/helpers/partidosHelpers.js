const esPartidoVuelta = (id_partido, id_zona, db) => {
    const getZoneTypeQuery = 'SELECT tipo_zona FROM zonas WHERE id_zona = ?';

    return new Promise((resolve, reject) => {
        db.query(getZoneTypeQuery, [id_zona], (err, results) => {
            if (err) {
                console.error('Error al obtener el tipo de zona:', err);
                return reject(err);
            }

            // Log para ver el tipo de zona
            console.log('Resultado tipo_zona:', results);

            if (results.length > 0) {
                let tipoZona = results[0].tipo_zona;
                console.log('Tipo de zona:', tipoZona);  // Log de tipo de zona

                // Asegurarse de que tipoZona es una cadena y limpiarlo de posibles espacios adicionales
                tipoZona = tipoZona.trim();
                console.log('Tipo de zona después de trim():', tipoZona);  // Log para verificar si se eliminan espacios

                if (tipoZona === 'eliminacion-directa-ida-vuelta') {
                    console.log('Zona es de tipo "eliminacion-directa-ida-vuelta"');

                    const checkIfReturnMatchQuery = 'SELECT vuelta FROM partidos WHERE id_partido = ? AND id_zona = ? AND vuelta = ?';
                    
                    db.query(checkIfReturnMatchQuery, [id_partido, id_zona, id_partido], (err, matchResults) => {
                        if (err) {
                            console.error('Error al verificar si es partido de vuelta:', err);
                            return reject(err);
                        }

                        // Log para ver los resultados del partido de vuelta
                        console.log('Resultado partido de vuelta:', matchResults);

                        if (matchResults.length > 0) {
                            console.log('Es un partido de vuelta');
                            resolve(true);  // Es un partido de vuelta
                        } else {
                            console.log('No es un partido de vuelta');
                            resolve(false);  // No es partido de vuelta
                        }
                    });
                } else {
                    console.log('La zona no es "eliminacion-directa-ida-vuelta"');
                    resolve(false);  // No es zona de ida-vuelta
                }
            } else {
                console.log('No se encontró zona con ese ID');
                resolve(false);  // No se encontró la zona
            }
        });
    });
};

module.exports = { esPartidoVuelta };

const db = require("../utils/db");

const insertarJugadorDestacado = async (req, res) => {
  const { id_jugador, id_equipo } = req.body; 
  const { id_categoria, id_partido } = req.query;

  if (!id_jugador || !id_equipo || !id_partido || !id_categoria) {
    return res.status(400).json({ error: "Faltan datos del jugador, id_partido o id_categoria." });
  }

  try {
    const insertQuery = 
      `INSERT INTO jugadores_destacados (id_partido, id_equipo, id_jugador, id_categoria, dt, posicion)
      VALUES (?, ?, ?, ?, ?, ?);`;

    const posicion = "Posición no especificada"; 

    await db.query(insertQuery, [
      id_partido,
      id_equipo,
      id_jugador,
      id_categoria,
      'N',
      posicion,
    ]);

    req.io.emit('jugadoresDestacadosActualizados', id_partido);

    res.status(201).json({ message: "Jugador destacado insertado correctamente." });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "El jugador ya está destacado en este partido." });
    }
    console.error("Error al insertar el jugador destacado:", error);
    res.status(500).json({ error: "Error al insertar el jugador destacado." });
  }
};

const eliminarJugadorDestacado = async (req, res) => {
  const { id_partido, id_categoria, id_jugador } = req.query;

  if (!id_jugador || !id_partido || !id_categoria) {
    return res
      .status(400)
      .json({ error: "Faltan datos del jugador, id_partido o id_categoria." });
  }

  try {
    const deleteQuery = `
            DELETE FROM jugadores_destacados 
            WHERE id_partido = ? AND id_jugador = ? AND id_categoria = ?`;

    await db.query(deleteQuery, [id_partido, id_jugador, id_categoria]);

    // Consulta para obtener todos los jugadores destacados actualizados
    const selectQuery = 
      `SELECT * FROM jugadores_destacados WHERE id_partido = ?;`;

    const jugadoresDestacados = await db.query(selectQuery, [id_partido]);

    const results = Array.isArray(jugadoresDestacados) ? jugadoresDestacados : jugadoresDestacados[0] || [];

    req.io.emit('jugadoresDestacadosActualizados', results);

    res.status(200).json({ message: "Jugador destacado eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el jugador destacado:", error);
    res.status(500).json({ error: "Error al eliminar el jugador destacado." });
  }
};

module.exports = {
  insertarJugadorDestacado,
  eliminarJugadorDestacado,
};

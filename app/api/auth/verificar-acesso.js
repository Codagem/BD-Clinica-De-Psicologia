import pool from "@/lib/db";

export async function verificarPaciente(idPaciente) {
  if (!idPaciente) {
    return {
      autorizado: false,
      erro: "Paciente não identificado.",
    };
  }

  const resultado = await pool.query(
    `
    SELECT id_paciente
    FROM pacientes
    WHERE id_paciente = $1
    `,
    [idPaciente]
  );

  if (resultado.rows.length === 0) {
    return {
      autorizado: false,
      erro: "Paciente não encontrado.",
    };
  }

  return {
    autorizado: true,
    id_paciente: resultado.rows[0].id_paciente,
  };
}
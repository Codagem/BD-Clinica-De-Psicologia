import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id_paciente,
        nome_completo,
        idade,
        motivo_consulta,
        tempo_problema,
        ansiedade
      FROM vw_relatorio_anamnese
      ORDER BY nome_completo
    `);

    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ erro: error.message });
  }
}
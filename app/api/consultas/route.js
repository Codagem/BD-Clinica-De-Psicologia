import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        c.id_consulta,
        p.nome_completo AS paciente,
        ps.nome AS psicologo,
        c.data_consulta,
        c.horario,
        c.status_consulta,
        c.tipo_atendimento,
        c.observacoes
      FROM consultas c
      JOIN pacientes p ON c.id_paciente = p.id_paciente
      JOIN psicologos ps ON c.id_psicologo = ps.id_psicologo
      ORDER BY c.data_consulta, c.horario
    `);

    return Response.json(result.rows);
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      id_paciente,
      id_psicologo,
      data_consulta,
      horario,
      tipo_atendimento,
      status_consulta,
      observacoes,
    } = body;

    await pool.query(
      `
      INSERT INTO consultas
      (
        id_paciente,
        id_psicologo,
        data_consulta,
        horario,
        tipo_atendimento,
        status_consulta,
        observacoes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        id_paciente,
        id_psicologo,
        data_consulta,
        horario,
        tipo_atendimento,
        status_consulta,
        observacoes,
      ]
    );

    return Response.json({
      mensagem: "Consulta cadastrada",
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}
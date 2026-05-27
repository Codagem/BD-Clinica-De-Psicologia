import pool from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idPaciente = searchParams.get("id_paciente");

    if (!idPaciente) {
      return Response.json({
        erro: "ID do paciente não informado.",
      });
    }

    const paciente = await pool.query(
      `
      SELECT
        id_paciente,
        nome_completo,
        cpf,
        telefone,
        profissao
      FROM pacientes
      WHERE id_paciente = $1
      `,
      [Number(idPaciente)]
    );

    const consultas = await pool.query(
      `
      SELECT
        c.id_consulta,
        c.data_consulta,
        c.horario,
        c.tipo_atendimento,
        c.status_consulta,
        c.observacoes,
        ps.nome AS psicologo
      FROM consultas c
      JOIN psicologos ps ON c.id_psicologo = ps.id_psicologo
      WHERE c.id_paciente = $1
      ORDER BY c.data_consulta DESC, c.horario DESC
      `,
      [Number(idPaciente)]
    );

    return Response.json({
      paciente: paciente.rows[0] || null,
      consultas: consultas.rows,
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const {
      id_consulta,
      status_consulta,
    } = body;

    if (!id_consulta || !status_consulta) {
      return Response.json({
        erro: "Dados inválidos.",
      });
    }

    await pool.query(
      `
      UPDATE consultas
      SET status_consulta = $1
      WHERE id_consulta = $2
      `,
      [
        status_consulta,
        Number(id_consulta),
      ]
    );

    return Response.json({
      mensagem: "Consulta atualizada com sucesso.",
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}
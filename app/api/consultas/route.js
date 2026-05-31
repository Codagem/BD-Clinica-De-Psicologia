import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        c.id_consulta,
        c.id_paciente,
        c.id_psicologo,
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
        Number(id_paciente),
        Number(id_psicologo),
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

export async function PUT(req) {
  try {
    const body = await req.json();

    const {
      id_consulta,
      id_paciente,
      id_psicologo,
      data_consulta,
      horario,
      tipo_atendimento,
      status_consulta,
      observacoes,
    } = body;

    if (!id_consulta) {
      return Response.json({
        erro: "ID da consulta não informado.",
      });
    }

    await pool.query(
      `
      UPDATE consultas
      SET
        id_paciente = $1,
        id_psicologo = $2,
        data_consulta = $3,
        horario = $4,
        tipo_atendimento = $5,
        status_consulta = $6,
        observacoes = $7
      WHERE id_consulta = $8
      `,
      [
        Number(id_paciente),
        Number(id_psicologo),
        data_consulta,
        horario,
        tipo_atendimento,
        status_consulta,
        observacoes,
        Number(id_consulta),
      ]
    );

    return Response.json({
      mensagem: "Consulta atualizada",
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();

    const { id_consulta } = body;

    if (!id_consulta) {
      return Response.json({
        erro: "ID da consulta não informado.",
      });
    }

    const pagamentos = await pool.query(
      `
      SELECT COUNT(*)
      FROM pagamentos
      WHERE id_consulta = $1
      `,
      [Number(id_consulta)]
    );

    if (Number(pagamentos.rows[0].count) > 0) {
      return Response.json({
        erro:
          "Esta consulta possui pagamento vinculado. Exclua o pagamento antes de excluir a consulta.",
      });
    }

    await pool.query(
      `
      DELETE FROM consultas
      WHERE id_consulta = $1
      `,
      [Number(id_consulta)]
    );

    return Response.json({
      mensagem: "Consulta excluída",
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM pacientes ORDER BY id_paciente"
    );

    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ erro: error.message });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const { nome_completo, cpf, telefone, profissao } = body;

    await pool.query(
      `
      INSERT INTO pacientes
      (
        nome_completo,
        cpf,
        telefone,
        profissao
      )
      VALUES ($1, $2, $3, $4)
      `,
      [nome_completo, cpf, telefone, profissao]
    );

    return Response.json({ mensagem: "Paciente cadastrado" });
  } catch (error) {
    return Response.json({ erro: error.message });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const { id, nome_completo, cpf, telefone, profissao } = body;

    await pool.query(
      `
      UPDATE pacientes
      SET
        nome_completo = $1,
        cpf = $2,
        telefone = $3,
        profissao = $4
      WHERE id_paciente = $5
      `,
      [nome_completo, cpf, telefone, profissao, id]
    );

    return Response.json({ mensagem: "Paciente atualizado" });
  } catch (error) {
    return Response.json({ erro: error.message });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    await pool.query(
      `
      DELETE FROM pacientes
      WHERE id_paciente = $1
      `,
      [id]
    );

    return Response.json({ mensagem: "Paciente removido" });
  } catch (error) {
    return Response.json({ erro: error.message });
  }
}
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

    if (body.tipo === "confirmar_consulta") {
      const { id_consulta, status_consulta } = body;

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
        [status_consulta, Number(id_consulta)]
      );

      return Response.json({
        mensagem: "Consulta atualizada com sucesso.",
      });
    }

    if (body.tipo === "alterar_senha") {
      const { id_paciente, senha_atual, nova_senha, confirmar_senha } = body;

      if (!id_paciente || !senha_atual || !nova_senha || !confirmar_senha) {
        return Response.json({
          erro: "Preencha todos os campos.",
        });
      }

      if (nova_senha !== confirmar_senha) {
        return Response.json({
          erro: "A nova senha e a confirmação não são iguais.",
        });
      }

      if (String(nova_senha).length < 3) {
        return Response.json({
          erro: "A nova senha precisa ter pelo menos 3 caracteres.",
        });
      }

      const usuario = await pool.query(
        `
        SELECT id_usuario
        FROM usuarios_pacientes
        WHERE id_paciente = $1
        AND senha = $2
        AND ativo = true
        `,
        [Number(id_paciente), senha_atual]
      );

      if (usuario.rows.length === 0) {
        return Response.json({
          erro: "Senha atual incorreta.",
        });
      }

      await pool.query(
        `
        UPDATE usuarios_pacientes
        SET senha = $1
        WHERE id_paciente = $2
        `,
        [nova_senha, Number(id_paciente)]
      );

      return Response.json({
        mensagem: "Senha alterada com sucesso.",
      });
    }

    return Response.json({
      erro: "Tipo de ação inválido.",
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}
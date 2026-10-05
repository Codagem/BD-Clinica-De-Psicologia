import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { registrarAuditoria } from "@/lib/auditoria";

async function obterSessao(req) {
  const cookie = req.headers.get("cookie") || "";

  const sessaoCookie = cookie
    .split(";")
    .find((item) => item.trim().startsWith("sessao="));

  const token = sessaoCookie
    ? sessaoCookie.trim().substring("sessao=".length)
    : null;

  return await verificarSessao(token);
}

/* =========================================================
   GET — LISTAR PACIENTES
   ========================================================= */

export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return Response.json(
        {
          erro: "Acesso não autorizado.",
        },
        { status: 403 }
      );
    }

    if (
      sessao.tipo_usuario !== "admin" &&
      sessao.tipo_usuario !== "psicologo" &&
      sessao.tipo_usuario !== "estagiario"
    ) {
      return Response.json(
        {
          erro: "Você não possui permissão para acessar os pacientes.",
        },
        { status: 403 }
      );
    }

    /*
     * O estagiário recebe somente os pacientes
     * que estão vinculados a ele.
     */
    if (sessao.tipo_usuario === "estagiario") {
      if (!sessao.id_estagiario) {
        return Response.json(
          {
            erro: "Estagiário não identificado.",
          },
          { status: 403 }
        );
      }

      const result = await pool.query(
        `
        SELECT
          p.id_paciente,
          p.nome_completo,
          p.data_nascimento
        FROM pacientes p
        INNER JOIN estagiarios_pacientes ep
          ON ep.id_paciente = p.id_paciente
        WHERE ep.id_estagiario = $1
          AND ep.status = 'Ativo'
        ORDER BY p.id_paciente
        `,
        [sessao.id_estagiario]
      );

      return Response.json(result.rows);
    }

    /*
     * Administrador e psicólogo podem visualizar
     * os pacientes cadastrados.
     */
    const result = await pool.query(
      "SELECT * FROM pacientes ORDER BY id_paciente"
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("Erro ao carregar pacientes:", error);

    return Response.json(
      {
        erro: "Erro ao carregar pacientes.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST — CADASTRAR PACIENTE
   Somente administrador.
   ========================================================= */

export async function POST(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return Response.json(
        {
          erro: "Acesso não autorizado.",
        },
        { status: 403 }
      );
    }

    if (sessao.tipo_usuario !== "admin") {
      return Response.json(
        {
          erro: "Apenas o administrador pode cadastrar pacientes.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        {
          erro: "Dados inválidos.",
        },
        { status: 400 }
      );
    }

    const {
      nome_completo,
      data_nascimento,
      cpf,
      telefone,
      profissao,
    } = body;

    if (!nome_completo || !data_nascimento || !cpf) {
      return Response.json(
        {
          erro: "Nome, data de nascimento e CPF são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const cpfLimpo = String(cpf).replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      return Response.json(
        {
          erro: "CPF inválido.",
        },
        { status: 400 }
      );
    }

    const pacienteExistente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $1
      `,
      [cpfLimpo]
    );

    if (pacienteExistente.rows.length > 0) {
      return Response.json(
        {
          erro: "Já existe um paciente cadastrado com este CPF.",
        },
        { status: 409 }
      );
    }

    const pacienteCriado = await pool.query(
      `
      INSERT INTO pacientes
      (
        nome_completo,
        data_nascimento,
        cpf,
        telefone,
        profissao
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_paciente
      `,
      [
        nome_completo,
        data_nascimento,
        cpfLimpo,
        telefone || null,
        profissao || null,
      ]
    );

    const idPaciente =
      pacienteCriado.rows[0].id_paciente;

    await registrarAuditoria({
      tipo_usuario: sessao.tipo_usuario,
      id_usuario: null,
      acao: "CRIAR_PACIENTE",
      tabela_afetada: "pacientes",
      registro_id: idPaciente,
      detalhes: "Novo paciente cadastrado pelo administrador.",
    });

    return Response.json(
      {
        mensagem: "Paciente cadastrado",
        id_paciente: idPaciente,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);

    return Response.json(
      {
        erro: "Erro ao cadastrar paciente.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PUT — EDITAR PACIENTE
   Somente administrador.
   ========================================================= */

export async function PUT(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return Response.json(
        {
          erro: "Acesso não autorizado.",
        },
        { status: 403 }
      );
    }

    if (sessao.tipo_usuario !== "admin") {
      return Response.json(
        {
          erro: "Apenas o administrador pode editar pacientes.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        {
          erro: "Dados inválidos.",
        },
        { status: 400 }
      );
    }

    const {
      id,
      nome_completo,
      data_nascimento,
      cpf,
      telefone,
      profissao,
    } = body;

    if (!id || !nome_completo || !data_nascimento || !cpf) {
      return Response.json(
        {
          erro: "ID, nome, data de nascimento e CPF são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const idPaciente = Number(id);

    if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
      return Response.json(
        {
          erro: "ID do paciente inválido.",
        },
        { status: 400 }
      );
    }

    const cpfLimpo = String(cpf).replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      return Response.json(
        {
          erro: "CPF inválido.",
        },
        { status: 400 }
      );
    }

    const pacienteExistente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $1
      AND id_paciente <> $2
      `,
      [cpfLimpo, idPaciente]
    );

    if (pacienteExistente.rows.length > 0) {
      return Response.json(
        {
          erro: "Este CPF já pertence a outro paciente.",
        },
        { status: 409 }
      );
    }

    const pacienteAtualizado = await pool.query(
      `
      UPDATE pacientes
      SET
        nome_completo = $1,
        data_nascimento = $2,
        cpf = $3,
        telefone = $4,
        profissao = $5
      WHERE id_paciente = $6
      RETURNING id_paciente
      `,
      [
        nome_completo,
        data_nascimento,
        cpfLimpo,
        telefone || null,
        profissao || null,
        idPaciente,
      ]
    );

    if (pacienteAtualizado.rows.length === 0) {
      return Response.json(
        {
          erro: "Paciente não encontrado.",
        },
        { status: 404 }
      );
    }

    await registrarAuditoria({
      tipo_usuario: sessao.tipo_usuario,
      id_usuario: null,
      acao: "ALTERAR_PACIENTE",
      tabela_afetada: "pacientes",
      registro_id: idPaciente,
      detalhes: "Dados do paciente alterados pelo administrador.",
    });

    return Response.json({
      mensagem: "Paciente atualizado",
    });
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);

    return Response.json(
      {
        erro: "Erro ao atualizar paciente.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE — EXCLUIR PACIENTE
   Somente administrador.
   ========================================================= */

export async function DELETE(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return Response.json(
        {
          erro: "Acesso não autorizado.",
        },
        { status: 403 }
      );
    }

    if (sessao.tipo_usuario !== "admin") {
      return Response.json(
        {
          erro: "Apenas o administrador pode excluir pacientes.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        {
          erro: "Dados inválidos.",
        },
        { status: 400 }
      );
    }

    const { id } = body;

    if (!id) {
      return Response.json(
        {
          erro: "ID do paciente é obrigatório.",
        },
        { status: 400 }
      );
    }

    const idPaciente = Number(id);

    if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
      return Response.json(
        {
          erro: "ID do paciente inválido.",
        },
        { status: 400 }
      );
    }

    const paciente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE id_paciente = $1
      `,
      [idPaciente]
    );

    if (paciente.rows.length === 0) {
      return Response.json(
        {
          erro: "Paciente não encontrado.",
        },
        { status: 404 }
      );
    }

    const consultas = await pool.query(
      `
      SELECT COUNT(*)
      FROM consultas
      WHERE id_paciente = $1
      `,
      [idPaciente]
    );

    if (Number(consultas.rows[0].count) > 0) {
      return Response.json(
        {
          erro:
            "Este paciente possui consultas cadastradas. Exclua ou remova as consultas antes de excluir o paciente.",
        },
        { status: 409 }
      );
    }

    await pool.query(
      `
      DELETE FROM pacientes
      WHERE id_paciente = $1
      `,
      [idPaciente]
    );

    await registrarAuditoria({
      tipo_usuario: sessao.tipo_usuario,
      id_usuario: null,
      acao: "EXCLUIR_PACIENTE",
      tabela_afetada: "pacientes",
      registro_id: idPaciente,
      detalhes: "Paciente excluído pelo administrador.",
    });

    return Response.json({
      mensagem: "Paciente removido",
    });
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);

    return Response.json(
      {
        erro: "Erro ao excluir paciente.",
      },
      { status: 500 }
    );
  }
}
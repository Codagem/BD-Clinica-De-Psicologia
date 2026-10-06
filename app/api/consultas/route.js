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

function respostaNaoAutorizado(
  mensagem = "Acesso não autorizado."
) {
  return Response.json(
    {
      erro: mensagem,
    },
    {
      status: 403,
    }
  );
}

function respostaDadosInvalidos(
  mensagem = "Dados inválidos."
) {
  return Response.json(
    {
      erro: mensagem,
    },
    {
      status: 400,
    }
  );
}

/* =========================================================
   GET — LISTAR CONSULTAS
   ========================================================= */

export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutorizado();
    }

    if (
      sessao.tipo_usuario !== "admin" &&
      sessao.tipo_usuario !== "psicologo" &&
      sessao.tipo_usuario !== "estagiario"
    ) {
      return respostaNaoAutorizado(
        "Você não possui permissão para acessar as consultas."
      );
    }

    /* =====================================================
       ESTAGIÁRIO
       -----------------------------------------------------
       Somente consultas dos pacientes vinculados a ele.
       ===================================================== */

    if (sessao.tipo_usuario === "estagiario") {
      if (!sessao.id_estagiario) {
        return respostaNaoAutorizado(
          "Estagiário não identificado."
        );
      }

      const idEstagiario = Number(sessao.id_estagiario);

      if (
        !Number.isInteger(idEstagiario) ||
        idEstagiario <= 0
      ) {
        return respostaNaoAutorizado(
          "Estagiário inválido."
        );
      }

      const result = await pool.query(
        `
        SELECT
          c.*,
          p.nome_completo AS nome_paciente,
          ps.nome AS nome_psicologo

        FROM consultas c

        INNER JOIN pacientes p
          ON p.id_paciente = c.id_paciente

        INNER JOIN psicologos ps
          ON ps.id_psicologo = c.id_psicologo

        INNER JOIN estagiarios_pacientes ep
          ON ep.id_paciente = c.id_paciente

        WHERE ep.id_estagiario = $1
          AND ep.status = 'Ativo'

        ORDER BY
          c.data_consulta DESC,
          c.horario DESC
        `,
        [idEstagiario]
      );

      return Response.json(result.rows);
    }

    /* =====================================================
       PSICÓLOGO
       -----------------------------------------------------
       Somente consultas do próprio psicólogo.
       ===================================================== */

    if (sessao.tipo_usuario === "psicologo") {
      if (!sessao.id_psicologo) {
        return respostaNaoAutorizado(
          "Psicólogo não identificado."
        );
      }

      const idPsicologo = Number(sessao.id_psicologo);

      if (
        !Number.isInteger(idPsicologo) ||
        idPsicologo <= 0
      ) {
        return respostaNaoAutorizado(
          "Psicólogo inválido."
        );
      }

      const result = await pool.query(
        `
        SELECT
          c.*,
          p.nome_completo AS nome_paciente,
          ps.nome AS nome_psicologo

        FROM consultas c

        INNER JOIN pacientes p
          ON p.id_paciente = c.id_paciente

        INNER JOIN psicologos ps
          ON ps.id_psicologo = c.id_psicologo

        WHERE c.id_psicologo = $1

        ORDER BY
          c.data_consulta DESC,
          c.horario DESC
        `,
        [idPsicologo]
      );

      return Response.json(result.rows);
    }

    /* =====================================================
       ADMINISTRADOR
       -----------------------------------------------------
       Administrador visualiza todas as consultas.
       ===================================================== */

    const result = await pool.query(`
      SELECT
        c.*,
        p.nome_completo AS nome_paciente,
        ps.nome AS nome_psicologo

      FROM consultas c

      INNER JOIN pacientes p
        ON p.id_paciente = c.id_paciente

      INNER JOIN psicologos ps
        ON ps.id_psicologo = c.id_psicologo

      ORDER BY
        c.data_consulta DESC,
        c.horario DESC
    `);

    return Response.json(result.rows);

  } catch (error) {
    console.error(
      "Erro ao carregar consultas:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao carregar consultas.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST — CRIAR CONSULTA
   Admin e psicólogo.
   ========================================================= */

export async function POST(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutorizado();
    }

    if (
      sessao.tipo_usuario !== "admin" &&
      sessao.tipo_usuario !== "psicologo"
    ) {
      return respostaNaoAutorizado(
        "Você não possui permissão para criar consultas."
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return respostaDadosInvalidos();
    }

    const {
      id_paciente,
      id_psicologo,
      data_consulta,
      horario,
      tipo_atendimento,
      status_consulta,
      observacoes,
    } = body;

    const idPaciente = Number(id_paciente);
    const idPsicologo = Number(id_psicologo);

    if (
      !Number.isInteger(idPaciente) ||
      idPaciente <= 0 ||
      !Number.isInteger(idPsicologo) ||
      idPsicologo <= 0 ||
      !data_consulta ||
      !horario
    ) {
      return respostaDadosInvalidos(
        "Paciente, psicólogo, data e horário são obrigatórios."
      );
    }

    /* =====================================================
       PSICÓLOGO SÓ PODE CRIAR CONSULTA PARA SI MESMO
       ===================================================== */

    if (
      sessao.tipo_usuario === "psicologo" &&
      Number(sessao.id_psicologo) !== idPsicologo
    ) {
      return respostaNaoAutorizado(
        "Você só pode criar consultas para você mesmo."
      );
    }

    /* =====================================================
       VERIFICAR PACIENTE
       ===================================================== */

    const paciente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE id_paciente = $1
      `,
      [idPaciente]
    );

    if (paciente.rowCount === 0) {
      return Response.json(
        {
          erro: "Paciente não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       VERIFICAR PSICÓLOGO
       ===================================================== */

    const psicologo = await pool.query(
      `
      SELECT id_psicologo
      FROM psicologos
      WHERE id_psicologo = $1
      `,
      [idPsicologo]
    );

    if (psicologo.rowCount === 0) {
      return Response.json(
        {
          erro: "Psicólogo não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       INSERIR CONSULTA
       ===================================================== */

    const result = await pool.query(
      `
      INSERT INTO consultas (
        id_paciente,
        id_psicologo,
        data_consulta,
        horario,
        tipo_atendimento,
        status_consulta,
        observacoes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        idPaciente,
        idPsicologo,
        data_consulta,
        horario,
        tipo_atendimento || null,
        status_consulta || "Agendada",
        observacoes || null,
      ]
    );

    /* =====================================================
       AUDITORIA
       ===================================================== */

    await registrarAuditoria({
      tipo_usuario: sessao.tipo_usuario,
      id_usuario:
        sessao.id_usuario ||
        sessao.id_psicologo ||
        null,
      acao: "CRIAR",
      tabela_afetada: "consultas",
      registro_id: result.rows[0].id_consulta,
      detalhes: "Consulta criada.",
    });

    return Response.json(
      result.rows[0],
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "Erro ao criar consulta:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao criar consulta.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PUT — ATUALIZAR CONSULTA
   Admin e psicólogo.
   ========================================================= */

export async function PUT(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutorizado();
    }

    if (
      sessao.tipo_usuario !== "admin" &&
      sessao.tipo_usuario !== "psicologo"
    ) {
      return respostaNaoAutorizado(
        "Você não possui permissão para alterar consultas."
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return respostaDadosInvalidos();
    }

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

    const idConsulta = Number(id_consulta);
    const idPaciente = Number(id_paciente);
    const idPsicologo = Number(id_psicologo);

    if (
      !Number.isInteger(idConsulta) ||
      idConsulta <= 0 ||
      !Number.isInteger(idPaciente) ||
      idPaciente <= 0 ||
      !Number.isInteger(idPsicologo) ||
      idPsicologo <= 0 ||
      !data_consulta ||
      !horario
    ) {
      return respostaDadosInvalidos(
        "Dados da consulta inválidos."
      );
    }

    /* =====================================================
       BUSCAR CONSULTA ATUAL
       ===================================================== */

    const consultaAtual = await pool.query(
      `
      SELECT
        id_consulta,
        id_psicologo
      FROM consultas
      WHERE id_consulta = $1
      `,
      [idConsulta]
    );

    if (consultaAtual.rowCount === 0) {
      return Response.json(
        {
          erro: "Consulta não encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    const psicologoAtual =
      Number(consultaAtual.rows[0].id_psicologo);

    /* =====================================================
       PSICÓLOGO SÓ PODE ALTERAR SUAS PRÓPRIAS CONSULTAS
       ===================================================== */

    if (
      sessao.tipo_usuario === "psicologo" &&
      psicologoAtual !== Number(sessao.id_psicologo)
    ) {
      return respostaNaoAutorizado(
        "Você não pode alterar uma consulta de outro psicólogo."
      );
    }

    if (
      sessao.tipo_usuario === "psicologo" &&
      idPsicologo !== Number(sessao.id_psicologo)
    ) {
      return respostaNaoAutorizado(
        "Você não pode transferir a consulta para outro psicólogo."
      );
    }

    /* =====================================================
       VERIFICAR PACIENTE
       ===================================================== */

    const paciente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE id_paciente = $1
      `,
      [idPaciente]
    );

    if (paciente.rowCount === 0) {
      return Response.json(
        {
          erro: "Paciente não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       VERIFICAR PSICÓLOGO
       ===================================================== */

    const psicologo = await pool.query(
      `
      SELECT id_psicologo
      FROM psicologos
      WHERE id_psicologo = $1
      `,
      [idPsicologo]
    );

    if (psicologo.rowCount === 0) {
      return Response.json(
        {
          erro: "Psicólogo não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       ATUALIZAR
       ===================================================== */

    const result = await pool.query(
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
      RETURNING *
      `,
      [
        idPaciente,
        idPsicologo,
        data_consulta,
        horario,
        tipo_atendimento || null,
        status_consulta || "Agendada",
        observacoes || null,
        idConsulta,
      ]
    );

    /* =====================================================
       AUDITORIA
       ===================================================== */

    await registrarAuditoria({
      tipo_usuario: sessao.tipo_usuario,
      id_usuario:
        sessao.id_usuario ||
        sessao.id_psicologo ||
        null,
      acao: "ATUALIZAR",
      tabela_afetada: "consultas",
      registro_id: idConsulta,
      detalhes: "Consulta atualizada.",
    });

    return Response.json(result.rows[0]);

  } catch (error) {
    console.error(
      "Erro ao atualizar consulta:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao atualizar consulta.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE — EXCLUIR CONSULTA
   Admin e psicólogo.
   ========================================================= */

export async function DELETE(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutorizado();
    }

    if (
      sessao.tipo_usuario !== "admin" &&
      sessao.tipo_usuario !== "psicologo"
    ) {
      return respostaNaoAutorizado(
        "Você não possui permissão para excluir consultas."
      );
    }

    const { searchParams } = new URL(req.url);

    const idConsulta = Number(
      searchParams.get("id")
    );

    if (
      !Number.isInteger(idConsulta) ||
      idConsulta <= 0
    ) {
      return respostaDadosInvalidos(
        "ID da consulta inválido."
      );
    }

    /* =====================================================
       BUSCAR CONSULTA
       ===================================================== */

    const consulta = await pool.query(
      `
      SELECT
        id_consulta,
        id_psicologo
      FROM consultas
      WHERE id_consulta = $1
      `,
      [idConsulta]
    );

    if (consulta.rowCount === 0) {
      return Response.json(
        {
          erro: "Consulta não encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    const idPsicologoConsulta =
      Number(consulta.rows[0].id_psicologo);

    /* =====================================================
       PSICÓLOGO SÓ PODE EXCLUIR SUAS CONSULTAS
       ===================================================== */

    if (
      sessao.tipo_usuario === "psicologo" &&
      idPsicologoConsulta !== Number(sessao.id_psicologo)
    ) {
      return respostaNaoAutorizado(
        "Você não pode excluir uma consulta de outro psicólogo."
      );
    }

    /* =====================================================
       EXCLUIR
       ===================================================== */

    await pool.query(
      `
      DELETE FROM consultas
      WHERE id_consulta = $1
      `,
      [idConsulta]
    );

    /* =====================================================
       AUDITORIA
       ===================================================== */

    await registrarAuditoria({
      tipo_usuario: sessao.tipo_usuario,
      id_usuario:
        sessao.id_usuario ||
        sessao.id_psicologo ||
        null,
      acao: "EXCLUIR",
      tabela_afetada: "consultas",
      registro_id: idConsulta,
      detalhes: "Consulta excluída.",
    });

    return Response.json({
      sucesso: true,
      mensagem: "Consulta excluída com sucesso.",
    });

  } catch (error) {
    console.error(
      "Erro ao excluir consulta:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao excluir consulta.",
      },
      {
        status: 500,
      }
    );
  }
}
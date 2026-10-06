import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { registrarAuditoria } from "@/lib/auditoria";

const STATUS_PADRAO = "Agendada";

/* =========================================================
   OBTER SESSÃO
   ========================================================= */

async function obterSessao(req) {
  const cookie = req.headers.get("cookie") || "";

  const sessaoCookie = cookie
    .split(";")
    .find((item) => item.trim().startsWith("sessao="));

  const token = sessaoCookie
    ? sessaoCookie.trim().substring("sessao=".length)
    : null;

  if (!token) {
    return null;
  }

  return await verificarSessao(token);
}

/* =========================================================
   RESPOSTAS PADRÃO
   ========================================================= */

function respostaNaoAutenticado(mensagem = "Sessão inválida ou expirada.") {
  return Response.json({ erro: mensagem }, { status: 401 });
}

function respostaNaoAutorizado(mensagem = "Acesso não autorizado.") {
  return Response.json({ erro: mensagem }, { status: 403 });
}

function respostaDadosInvalidos(mensagem = "Dados inválidos.") {
  return Response.json({ erro: mensagem }, { status: 400 });
}

function respostaNaoEncontrado(mensagem = "Registro não encontrado.") {
  return Response.json({ erro: mensagem }, { status: 404 });
}

function respostaErroInterno(mensagem = "Erro interno do servidor.") {
  return Response.json({ erro: mensagem }, { status: 500 });
}

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function converterIdPositivo(valor) {
  const numero = Number(valor);

  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

// Lê o corpo sem estourar 500 quando o JSON é inválido
async function lerBody(req) {
  try {
    const body = await req.json();

    return body && typeof body === "object" && !Array.isArray(body)
      ? body
      : null;
  } catch {
    return null;
  }
}

function dataValida(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const data = new Date(`${valor}T00:00:00Z`);

  return (
    !Number.isNaN(data.getTime()) &&
    data.toISOString().slice(0, 10) === valor
  );
}

function horarioValido(valor) {
  return (
    typeof valor === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(valor)
  );
}

function textoOpcional(valor) {
  if (valor === null || valor === undefined) {
    return null;
  }

  const texto = String(valor).trim();

  return texto === "" ? null : texto;
}

function idUsuarioDaSessao(sessao) {
  return sessao.id_usuario || sessao.id_psicologo || null;
}

// Se a auditoria falhar depois da operação já feita, não devolve 500
// (o cliente acharia que a operação falhou). O erro fica no log.
async function auditar(dados) {
  try {
    await registrarAuditoria(dados);
  } catch (error) {
    console.error("Falha ao registrar auditoria:", error);
  }
}

// Verifica paciente e psicólogo em uma única consulta
async function verificarReferencias(idPaciente, idPsicologo) {
  const { rows } = await pool.query(
    `
    SELECT
      EXISTS (
        SELECT 1 FROM pacientes WHERE id_paciente = $1
      ) AS paciente,
      EXISTS (
        SELECT 1 FROM psicologos WHERE id_psicologo = $2
      ) AS psicologo
    `,
    [idPaciente, idPsicologo]
  );

  return rows[0];
}

/* =========================================================
   GET — LISTAR CONSULTAS
   ========================================================= */

export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutenticado();
    }

    /*
      ADMIN: todas as consultas.
      PSICÓLOGO: somente as próprias.
      ESTAGIÁRIO: somente de pacientes com vínculo ativo.
    */

    if (sessao.tipo_usuario === "estagiario") {
      const idEstagiario = converterIdPositivo(sessao.id_estagiario);

      if (!idEstagiario) {
        return respostaNaoAutorizado("Estagiário não identificado.");
      }

      // EXISTS evita linhas duplicadas se houver mais de um vínculo ativo
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

        WHERE EXISTS (
          SELECT 1
          FROM estagiarios_pacientes ep
          WHERE ep.id_paciente = c.id_paciente
            AND ep.id_estagiario = $1
            AND ep.status = 'Ativo'
        )

        ORDER BY
          c.data_consulta DESC,
          c.horario DESC
        `,
        [idEstagiario]
      );

      return Response.json(result.rows);
    }

    if (sessao.tipo_usuario === "psicologo") {
      const idPsicologo = converterIdPositivo(sessao.id_psicologo);

      if (!idPsicologo) {
        return respostaNaoAutorizado("Psicólogo não identificado.");
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

    if (sessao.tipo_usuario === "admin") {
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
    }

    return respostaNaoAutorizado(
      "Você não possui permissão para acessar as consultas."
    );
  } catch (error) {
    console.error("Erro ao carregar consultas:", error);

    return respostaErroInterno("Erro ao carregar consultas.");
  }
}

/* =========================================================
   POST — CRIAR CONSULTA

   Permissões: administrador e psicólogo.
   O psicólogo somente pode criar consulta para ele mesmo.
   ========================================================= */

export async function POST(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutenticado();
    }

    if (
      sessao.tipo_usuario !== "admin" &&
      sessao.tipo_usuario !== "psicologo"
    ) {
      return respostaNaoAutorizado(
        "Você não possui permissão para criar consultas."
      );
    }

    const body = await lerBody(req);

    if (!body) {
      return respostaDadosInvalidos("Corpo da requisição inválido.");
    }

    const idPaciente = converterIdPositivo(body.id_paciente);
    const idPsicologo = converterIdPositivo(body.id_psicologo);

    if (!idPaciente || !idPsicologo) {
      return respostaDadosInvalidos(
        "Paciente e psicólogo são obrigatórios."
      );
    }

    if (!dataValida(body.data_consulta)) {
      return respostaDadosInvalidos(
        "Data inválida. Use o formato AAAA-MM-DD."
      );
    }

    if (!horarioValido(body.horario)) {
      return respostaDadosInvalidos(
        "Horário inválido. Use o formato HH:MM."
      );
    }

    // Psicólogo só pode criar consulta para si mesmo
    if (
      sessao.tipo_usuario === "psicologo" &&
      Number(sessao.id_psicologo) !== idPsicologo
    ) {
      return respostaNaoAutorizado(
        "Você só pode criar consultas para você mesmo."
      );
    }

    const referencias = await verificarReferencias(idPaciente, idPsicologo);

    if (!referencias.paciente) {
      return respostaNaoEncontrado("Paciente não encontrado.");
    }

    if (!referencias.psicologo) {
      return respostaNaoEncontrado("Psicólogo não encontrado.");
    }

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
        body.data_consulta,
        body.horario,
        textoOpcional(body.tipo_atendimento),
        textoOpcional(body.status_consulta) || STATUS_PADRAO,
        textoOpcional(body.observacoes),
      ]
    );

    await auditar({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: idUsuarioDaSessao(sessao),
      acao: "CRIAR",
      tabelaAfetada: "consultas",
      registroId: result.rows[0].id_consulta,
      detalhes: "Consulta criada.",
    });

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar consulta:", error);

    return respostaErroInterno("Erro ao criar consulta.");
  }
}

/* =========================================================
   PUT — ATUALIZAR CONSULTA

   Permissões: administrador e psicólogo.
   O psicólogo somente pode alterar suas próprias consultas
   e não pode transferi-las para outro psicólogo.
   ========================================================= */

export async function PUT(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutenticado();
    }

    if (
      sessao.tipo_usuario !== "admin" &&
      sessao.tipo_usuario !== "psicologo"
    ) {
      return respostaNaoAutorizado(
        "Você não possui permissão para alterar consultas."
      );
    }

    const body = await lerBody(req);

    if (!body) {
      return respostaDadosInvalidos("Corpo da requisição inválido.");
    }

    const idConsulta = converterIdPositivo(body.id_consulta);
    const idPaciente = converterIdPositivo(body.id_paciente);
    const idPsicologo = converterIdPositivo(body.id_psicologo);

    if (!idConsulta || !idPaciente || !idPsicologo) {
      return respostaDadosInvalidos("Dados da consulta inválidos.");
    }

    if (!dataValida(body.data_consulta)) {
      return respostaDadosInvalidos(
        "Data inválida. Use o formato AAAA-MM-DD."
      );
    }

    if (!horarioValido(body.horario)) {
      return respostaDadosInvalidos(
        "Horário inválido. Use o formato HH:MM."
      );
    }

    const consultaAtual = await pool.query(
      `
      SELECT id_consulta, id_psicologo
      FROM consultas
      WHERE id_consulta = $1
      `,
      [idConsulta]
    );

    if (consultaAtual.rowCount === 0) {
      return respostaNaoEncontrado("Consulta não encontrada.");
    }

    if (sessao.tipo_usuario === "psicologo") {
      const idPsicologoSessao = Number(sessao.id_psicologo);

      if (Number(consultaAtual.rows[0].id_psicologo) !== idPsicologoSessao) {
        return respostaNaoAutorizado(
          "Você não pode alterar uma consulta de outro psicólogo."
        );
      }

      if (idPsicologo !== idPsicologoSessao) {
        return respostaNaoAutorizado(
          "Você não pode transferir a consulta para outro psicólogo."
        );
      }
    }

    const referencias = await verificarReferencias(idPaciente, idPsicologo);

    if (!referencias.paciente) {
      return respostaNaoEncontrado("Paciente não encontrado.");
    }

    if (!referencias.psicologo) {
      return respostaNaoEncontrado("Psicólogo não encontrado.");
    }

    // COALESCE: se o status não for enviado, mantém o atual
    // (antes, uma consulta "Realizada" voltava para "Agendada")
    const result = await pool.query(
      `
      UPDATE consultas
      SET
        id_paciente = $1,
        id_psicologo = $2,
        data_consulta = $3,
        horario = $4,
        tipo_atendimento = $5,
        status_consulta = COALESCE($6, status_consulta),
        observacoes = $7
      WHERE id_consulta = $8
      RETURNING *
      `,
      [
        idPaciente,
        idPsicologo,
        body.data_consulta,
        body.horario,
        textoOpcional(body.tipo_atendimento),
        textoOpcional(body.status_consulta),
        textoOpcional(body.observacoes),
        idConsulta,
      ]
    );

    await auditar({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: idUsuarioDaSessao(sessao),
      acao: "ATUALIZAR",
      tabelaAfetada: "consultas",
      registroId: idConsulta,
      detalhes: "Consulta atualizada.",
    });

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar consulta:", error);

    return respostaErroInterno("Erro ao atualizar consulta.");
  }
}

/* =========================================================
   DELETE — EXCLUIR CONSULTA

   Permissões: administrador e psicólogo.
   O psicólogo somente pode excluir suas próprias consultas.
   ========================================================= */

export async function DELETE(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutenticado();
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
    const idConsulta = converterIdPositivo(searchParams.get("id"));

    if (!idConsulta) {
      return respostaDadosInvalidos("ID da consulta inválido.");
    }

    const consulta = await pool.query(
      `
      SELECT id_consulta, id_psicologo
      FROM consultas
      WHERE id_consulta = $1
      `,
      [idConsulta]
    );

    if (consulta.rowCount === 0) {
      return respostaNaoEncontrado("Consulta não encontrada.");
    }

    if (
      sessao.tipo_usuario === "psicologo" &&
      Number(consulta.rows[0].id_psicologo) !== Number(sessao.id_psicologo)
    ) {
      return respostaNaoAutorizado(
        "Você não pode excluir uma consulta de outro psicólogo."
      );
    }

    try {
      await pool.query(
        `
        DELETE FROM consultas
        WHERE id_consulta = $1
        `,
        [idConsulta]
      );
    } catch (error) {
      // 23503 = violação de chave estrangeira (há registros vinculados)
      if (error.code === "23503") {
        return Response.json(
          {
            erro: "Não é possível excluir: há registros vinculados a esta consulta.",
          },
          { status: 409 }
        );
      }

      throw error;
    }

    await auditar({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: idUsuarioDaSessao(sessao),
      acao: "EXCLUIR",
      tabelaAfetada: "consultas",
      registroId: idConsulta,
      detalhes: "Consulta excluída.",
    });

    return Response.json({
      sucesso: true,
      mensagem: "Consulta excluída com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir consulta:", error);

    return respostaErroInterno("Erro ao excluir consulta.");
  }
}
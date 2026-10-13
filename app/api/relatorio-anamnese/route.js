import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { registrarAuditoria } from "@/lib/auditoria";

/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */

async function obterSessao(req) {
  const cookie = req.headers.get("cookie") || "";

  const item = cookie
    .split(";")
    .find((parte) => parte.trim().startsWith("sessao="));

  const token = item
    ? item.trim().substring("sessao=".length)
    : null;

  if (!token) return null;

  return await verificarSessao(token);
}

function resposta(erro, status) {
  return Response.json({ erro }, { status });
}

function converterId(valor) {
  const numero = Number(valor);

  return Number.isSafeInteger(numero) && numero > 0
    ? numero
    : null;
}

function obterIdPsicologo(sessao) {
  return converterId(
    sessao.id_psicologo ??
      sessao.usuario?.id_psicologo ??
      sessao.id_usuario
  );
}

/* =========================================================
   GET — ANAMNESES COMPLETAS
   Administrador: todos os registros.
   Psicólogo: pacientes com consultas vinculadas.
   Estagiário: pacientes com vínculo ativo.
   ========================================================= */

export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return resposta("Sessão inválida ou expirada.", 401);
    }

    if (
      !["admin", "psicologo", "estagiario"].includes(
        sessao.tipo_usuario
      )
    ) {
      return resposta("Acesso não autorizado.", 403);
    }

    let filtro = "";
    const parametros = [];

    if (sessao.tipo_usuario === "psicologo") {
      const idPsicologo = obterIdPsicologo(sessao);

      if (!idPsicologo) {
        return resposta("Psicólogo não identificado.", 403);
      }

      parametros.push(idPsicologo);

      filtro = `
        AND EXISTS (
          SELECT 1
          FROM consultas c
          WHERE c.id_paciente = a.id_paciente
            AND c.id_psicologo = $1
        )
      `;
    } else if (sessao.tipo_usuario === "estagiario") {
      const idEstagiario = converterId(
        sessao.id_estagiario ??
          sessao.usuario?.id_estagiario ??
          sessao.id_usuario
      );

      if (!idEstagiario) {
        return resposta("Estagiário não identificado.", 403);
      }

      parametros.push(idEstagiario);

      filtro = `
        AND EXISTS (
          SELECT 1
          FROM estagiarios_pacientes ep
          WHERE ep.id_paciente = a.id_paciente
            AND ep.id_estagiario = $1
            AND ep.status = 'Ativo'
        )
      `;
    }

    const result = await pool.query(
      `
      SELECT
        a.id_anamnese,
        a.id_paciente,
        p.nome_completo,
        p.idade,
        a.motivo_consulta,
        a.tempo_problema,
        a.fez_terapia,
        a.tempo_terapia,
        a.doencas_fisicas,
        a.uso_medicamentos,
        a.historico_psiquiatrico,
        a.medicacao_controlada,
        a.doencas_mentais_familia,
        a.relacao_familiar,
        a.sono,
        a.alimentacao,
        a.uso_alcool_drogas,
        a.atividade_fisica,
        a.ansiedade,
        a.humor,
        a.estresse,
        a.pensamentos_recorrentes,
        a.objetivo_terapia,
        a.observacoes_psicologo,
        a.data_cadastro
      FROM anamneses a
      INNER JOIN pacientes p
        ON p.id_paciente = a.id_paciente
      WHERE 1 = 1
      ${filtro}
      ORDER BY a.data_cadastro DESC NULLS LAST,
               a.id_anamnese DESC
      `,
      parametros
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("Erro ao carregar anamneses:", error);

    return resposta("Erro ao carregar as anamneses.", 500);
  }
}

/* =========================================================
   POST — CADASTRAR RELATÓRIO DE ANAMNESE
   ========================================================= */

export async function POST(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return resposta("Sessão inválida ou expirada.", 401);
    }

    if (sessao.tipo_usuario !== "psicologo") {
      return resposta(
        "Somente o psicólogo pode cadastrar a anamnese.",
        403
      );
    }

    const idPsicologo = obterIdPsicologo(sessao);

    if (!idPsicologo) {
      return resposta("Psicólogo não identificado.", 403);
    }

    let dados;

    try {
      dados = await req.json();
    } catch {
      return resposta("Corpo da requisição inválido.", 400);
    }

    const idPaciente = converterId(dados?.id_paciente);

    if (!idPaciente) {
      return resposta("Identificador do paciente inválido.", 400);
    }

    // Verifica o vínculo entre paciente e psicólogo.
    const vinculo = await pool.query(
      `
        SELECT 1
        FROM consultas
        WHERE id_paciente = $1
          AND id_psicologo = $2
        LIMIT 1
      `,
      [idPaciente, idPsicologo]
    );

    if (vinculo.rows.length === 0) {
      return resposta(
        "Paciente não encontrado ou sem vínculo com você.",
        403
      );
    }

    const campos = [
      "motivo_consulta",
      "tempo_problema",
      "tempo_terapia",
      "doencas_fisicas",
      "uso_medicamentos",
      "historico_psiquiatrico",
      "medicacao_controlada",
      "doencas_mentais_familia",
      "relacao_familiar",
      "sono",
      "alimentacao",
      "uso_alcool_drogas",
      "atividade_fisica",
      "ansiedade",
      "humor",
      "estresse",
      "pensamentos_recorrentes",
      "objetivo_terapia",
      "observacoes_psicologo",
    ];

    const valores = campos.map((campo) => {
      const valor = dados[campo];

      if (valor === undefined || valor === null) {
        return null;
      }

      return String(valor).trim() || null;
    });

    // valores[0] = motivo_consulta (obrigatório)
    if (!valores[0]) {
      return resposta("O motivo da consulta é obrigatório.", 400);
    }

    // Campos limitados a 255 caracteres.
    const camposCurtos = [
      "tempo_problema",
      "tempo_terapia",
      "ansiedade",
    ];

    for (const campo of camposCurtos) {
      const valor = valores[campos.indexOf(campo)];

      if (valor && valor.length > 255) {
        return resposta(
          `O campo ${campo} deve ter no máximo 255 caracteres.`,
          400
        );
      }
    }

    let fezTerapia = null;

    if (
      dados.fez_terapia === true ||
      dados.fez_terapia === "true"
    ) {
      fezTerapia = true;
    } else if (
      dados.fez_terapia === false ||
      dados.fez_terapia === "false"
    ) {
      fezTerapia = false;
    }

    // 21 colunas = 21 placeholders ($1 a $21)
    const insercao = await pool.query(
      `
        INSERT INTO anamneses (
          id_paciente,
          motivo_consulta,
          tempo_problema,
          fez_terapia,
          tempo_terapia,
          doencas_fisicas,
          uso_medicamentos,
          historico_psiquiatrico,
          medicacao_controlada,
          doencas_mentais_familia,
          relacao_familiar,
          sono,
          alimentacao,
          uso_alcool_drogas,
          atividade_fisica,
          ansiedade,
          humor,
          estresse,
          pensamentos_recorrentes,
          objetivo_terapia,
          observacoes_psicologo
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        )
        RETURNING *
      `,
      [
        idPaciente,
        valores[0],
        valores[1],
        fezTerapia,
        ...valores.slice(2),
      ]
    );

    const anamnese = insercao.rows[0];

    await registrarAuditoria({
      tipoUsuario: "psicologo",
      idUsuario: idPsicologo,
      acao: "CADASTRAR_ANAMNESE",
      tabelaAfetada: "anamneses",
      registroId: anamnese.id_anamnese,
      detalhes: `Relatório de anamnese cadastrado para paciente ${idPaciente}.`,
    });

    return Response.json(
      {
        mensagem: "Relatório de anamnese cadastrado com sucesso.",
        anamnese,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar relatório de anamnese:", error);

    return resposta(
      "Não foi possível cadastrar o relatório de anamnese.",
      500
    );
  }
}
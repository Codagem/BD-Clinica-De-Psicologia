import pool from "@/lib/db";
import { registrarAuditoria } from "@/lib/auditoria";
import { verificarSessao } from "@/lib/sessao";

// =====================================================
// FUNÇÃO — OBTER IP DO CLIENTE
// =====================================================

function obterIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");

  if (realIp) {
    return realIp;
  }

  return null;
}

// =====================================================
// FUNÇÃO — OBTER COOKIE DA SESSÃO
// =====================================================

function obterCookieSessao(req) {
  const cookie = req.headers.get("cookie") || "";

  const cookies = cookie.split(";");

  for (const item of cookies) {
    const [nome, ...resto] = item.trim().split("=");

    if (nome === "sessao") {
      return resto.join("=");
    }
  }

  return null;
}

// =====================================================
// GET — CONSULTAR CONSENTIMENTO
//
// ADMIN       → pode consultar qualquer paciente
// PSICÓLOGO   → pode consultar qualquer paciente
// ESTAGIÁRIO  → pode consultar qualquer paciente
// PACIENTE    → somente o próprio consentimento
//
// Token temporário de consentimento NÃO pode ser usado
// para consultar consentimentos.
// =====================================================

export async function GET(req) {
  try {
    // =================================================
    // OBTER SESSÃO
    // =================================================

    const tokenSessao = obterCookieSessao(req);

    if (!tokenSessao) {
      return Response.json(
        {
          erro: "Não autorizado.",
        },
        {
          status: 403,
        }
      );
    }

    const sessao = await verificarSessao(tokenSessao);

    if (!sessao) {
      return Response.json(
        {
          erro: "Sessão inválida ou expirada.",
        },
        {
          status: 403,
        }
      );
    }

    // =================================================
    // IDENTIFICAR USUÁRIO
    // =================================================

    const tipoUsuario = sessao.tipo_usuario;

    const tiposPermitidos = [
      "admin",
      "psicologo",
      "estagiario",
      "paciente",
    ];

    if (!tiposPermitidos.includes(tipoUsuario)) {
      return Response.json(
        {
          erro: "Sessão sem permissão para consultar consentimentos.",
        },
        {
          status: 403,
        }
      );
    }

    // =================================================
    // OBTER ID DO PACIENTE SOLICITADO
    // =================================================

    const { searchParams } = new URL(req.url);

    const idPacienteInformado = searchParams.get("id_paciente");

    if (!idPacienteInformado) {
      return Response.json(
        {
          erro: "Paciente não informado.",
        },
        {
          status: 400,
        }
      );
    }

    const idPaciente = Number(idPacienteInformado);

    if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
      return Response.json(
        {
          erro: "Paciente inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // REGRA ESPECIAL PARA PACIENTE
    //
    // O paciente só pode consultar o próprio consentimento.
    // =================================================

    if (tipoUsuario === "paciente") {
      const idPacienteSessao = Number(sessao.id_paciente);

      if (
        !Number.isInteger(idPacienteSessao) ||
        idPacienteSessao !== idPaciente
      ) {
        return Response.json(
          {
            erro:
              "Acesso negado. Você só pode consultar o seu próprio consentimento.",
          },
          {
            status: 403,
          }
        );
      }
    }

    // =================================================
    // BUSCAR CONSENTIMENTO
    // =================================================

    const resultado = await pool.query(
      `
      SELECT
        id_consentimento,
        id_paciente,
        aceitou,
        data_aceite,
        ip_aceite
      FROM consentimentos
      WHERE id_paciente = $1
      ORDER BY data_aceite DESC
      LIMIT 1
      `,
      [idPaciente]
    );

    return Response.json(resultado.rows[0] || null);
  } catch (error) {
    console.error(
      "Erro ao buscar consentimento:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao buscar consentimento.",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST — REGISTRAR CONSENTIMENTO
//
// Usa token temporário vinculado ao paciente.
// =====================================================

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      token_consentimento,
      aceitou,
    } = body;

    // =================================================
    // VALIDAR TOKEN
    // =================================================

    if (!token_consentimento) {
      return Response.json(
        {
          erro: "Token de consentimento não informado.",
        },
        {
          status: 403,
        }
      );
    }

    const token = await verificarSessao(
      token_consentimento
    );

    if (!token) {
      return Response.json(
        {
          erro:
            "Token de consentimento inválido ou expirado.",
        },
        {
          status: 403,
        }
      );
    }

    // =================================================
    // VALIDAR FINALIDADE DO TOKEN
    // =================================================

    if (token.tipo !== "consentimento") {
      return Response.json(
        {
          erro: "Token inválido para esta operação.",
        },
        {
          status: 403,
        }
      );
    }

    const idPaciente = Number(token.id_paciente);

    if (
      !Number.isInteger(idPaciente) ||
      idPaciente <= 0
    ) {
      return Response.json(
        {
          erro: "Paciente inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // VALIDAR ACEITE
    // =================================================

    if (aceitou !== true) {
      return Response.json(
        {
          erro:
            "O Termo de Consentimento e Privacidade deve ser aceito.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // VERIFICAR PACIENTE
    // =================================================

    const paciente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE id_paciente = $1
      LIMIT 1
      `,
      [idPaciente]
    );

    if (paciente.rows.length === 0) {
      return Response.json(
        {
          erro: "Paciente não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    // =================================================
    // IMPEDIR REUTILIZAÇÃO
    // =================================================

    const consentimentoExistente = await pool.query(
      `
      SELECT id_consentimento
      FROM consentimentos
      WHERE id_paciente = $1
      LIMIT 1
      `,
      [idPaciente]
    );

    if (consentimentoExistente.rows.length > 0) {
      return Response.json(
        {
          erro:
            "O consentimento deste paciente já foi registrado.",
        },
        {
          status: 409,
        }
      );
    }

    // =================================================
    // OBTER IP
    // =================================================

    const ipAceite = obterIp(req);

    // =================================================
    // REGISTRAR CONSENTIMENTO
    // =================================================

    const resultado = await pool.query(
      `
      INSERT INTO consentimentos
      (
        id_paciente,
        aceitou,
        ip_aceite
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING
        id_consentimento,
        id_paciente,
        aceitou,
        data_aceite,
        ip_aceite
      `,
      [
        idPaciente,
        true,
        ipAceite,
      ]
    );

    const consentimento = resultado.rows[0];

    // =================================================
    // AUDITORIA
    // =================================================

    await registrarAuditoria({
      tipoUsuario: "paciente",
      idUsuario: idPaciente,
      acao: "ACEITE DE TERMO LGPD",
      tabelaAfetada: "consentimentos",
      registroId: consentimento.id_consentimento,
      detalhes:
        "Paciente aceitou o Termo de Consentimento e Privacidade.",
    });

    // =================================================
    // RESPOSTA
    // =================================================

    return Response.json(
      {
        mensagem:
          "Consentimento registrado com sucesso.",
        consentimento,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Erro ao salvar consentimento:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao salvar consentimento.",
      },
      {
        status: 500,
      }
    );
  }
}
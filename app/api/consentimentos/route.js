import pool from "@/lib/db";
import { registrarAuditoria } from "@/lib/auditoria";

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
// GET — VERIFICAR CONSENTIMENTO DO PACIENTE
// =====================================================

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const idPaciente = searchParams.get("id_paciente");

    if (!idPaciente) {
      return Response.json(
        {
          erro: "Paciente não informado.",
        },
        {
          status: 400,
        }
      );
    }

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

    return Response.json(
      resultado.rows[0] || null
    );
  } catch (error) {
    console.error(
      "Erro ao buscar consentimento:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao buscar consentimento.",
        mensagem: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST — REGISTRAR CONSENTIMENTO
// =====================================================

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      id_paciente,
      aceitou,
    } = body;

    // =================================================
    // VALIDAR PACIENTE
    // =================================================

    if (!id_paciente) {
      return Response.json(
        {
          erro: "Paciente obrigatório.",
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
    // OBTER IP NO SERVIDOR
    // =================================================

    const ipAceite = obterIp(req);

    // =================================================
    // VERIFICAR SE O PACIENTE EXISTE
    // =================================================

    const paciente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE id_paciente = $1
      LIMIT 1
      `,
      [id_paciente]
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
        id_paciente,
        true,
        ipAceite,
      ]
    );

    const consentimento = resultado.rows[0];

    // =================================================
    // REGISTRAR AUDITORIA
    // =================================================

    await registrarAuditoria({
      tipoUsuario: "paciente",
      idUsuario: Number(id_paciente),
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
        mensagem: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
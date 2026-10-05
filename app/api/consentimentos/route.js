import pool from "@/lib/db";
import { registrarAuditoria } from "@/lib/auditoria";

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
      SELECT *
      FROM consentimentos
      WHERE id_paciente = $1
      ORDER BY data_aceite DESC
      LIMIT 1
      `,
      [idPaciente]
    );

    return Response.json(resultado.rows[0] || null);
  } catch (error) {
    console.error("Erro ao buscar consentimento:", error);

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
// POST — SALVAR CONSENTIMENTO
// =====================================================

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      id_paciente,
      aceitou,
      ip_aceite,
    } = body;

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
    // SALVAR CONSENTIMENTO
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

      RETURNING *
      `,
      [
        id_paciente,
        aceitou ?? false,
        ip_aceite || null,
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
        mensagem: "Consentimento registrado com sucesso.",
        consentimento,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Erro ao salvar consentimento:", error);

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
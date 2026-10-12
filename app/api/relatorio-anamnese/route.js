
import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";

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
      const idPsicologo = converterId(sessao.id_psicologo);

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
      const idEstagiario = converterId(sessao.id_estagiario);

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
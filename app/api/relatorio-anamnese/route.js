import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";

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

export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    if (
      !sessao ||
      (sessao.tipo_usuario !== "admin" &&
        sessao.tipo_usuario !== "psicologo" &&
        sessao.tipo_usuario !== "estagiario")
    ) {
      return Response.json(
        {
          erro: "Acesso não autorizado.",
        },
        { status: 403 }
      );
    }

    let query = `
      SELECT
        v.id_paciente,
        v.nome_completo,
        v.idade,
        v.motivo_consulta,
        v.tempo_problema,
        v.ansiedade
      FROM vw_relatorio_anamnese v
    `;

    let parametros = [];

    if (sessao.tipo_usuario === "estagiario") {
      if (!sessao.id_estagiario) {
        return Response.json(
          {
            erro: "Estagiário não identificado.",
          },
          { status: 403 }
        );
      }

      query += `
        INNER JOIN estagiarios_pacientes ep
          ON ep.id_paciente = v.id_paciente
        WHERE ep.id_estagiario = $1
          AND ep.status = 'Ativo'
      `;

      parametros = [Number(sessao.id_estagiario)];
    }

    query += `
      ORDER BY v.nome_completo
    `;

    const result = await pool.query(query, parametros);

    return Response.json(result.rows);
  } catch (error) {
    console.error("Erro ao carregar relatório de anamnese:", error);

    return Response.json(
      {
        erro: "Erro ao carregar relatório de anamnese.",
      },
      { status: 500 }
    );
  }
}
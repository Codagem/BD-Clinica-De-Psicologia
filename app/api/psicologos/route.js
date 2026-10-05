import db from "@/lib/db";
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

    if (!sessao) {
      return Response.json(
        {
          erro: "Acesso não autorizado.",
        },
        {
          status: 403,
        }
      );
    }

    const tiposPermitidos = [
      "admin",
      "psicologo",
      "estagiario",
    ];

    if (!tiposPermitidos.includes(sessao.tipo_usuario)) {
      return Response.json(
        {
          erro:
            "Você não possui permissão para acessar os psicólogos.",
        },
        {
          status: 403,
        }
      );
    }

    let resultado;

    if (sessao.tipo_usuario === "estagiario") {
      resultado = await db.query(`
        SELECT
          id_psicologo,
          nome,
          especialidade
        FROM psicologos
        ORDER BY nome ASC
      `);
    } else {
      resultado = await db.query(`
        SELECT
          id_psicologo,
          nome,
          especialidade,
          telefone,
          email
        FROM psicologos
        ORDER BY nome ASC
      `);
    }

    return Response.json(resultado.rows);
  } catch (error) {
    console.error(
      "Erro ao listar psicólogos:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao listar psicólogos.",
      },
      {
        status: 500,
      }
    );
  }
}
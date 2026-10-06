import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";

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

export async function GET(req) {
  try {
    // ==========================================
    // VERIFICAR SESSÃO
    // ==========================================

    const token = obterCookieSessao(req);

    if (!token) {
      return Response.json(
        { erro: "Não autorizado." },
        { status: 403 }
      );
    }

    const sessao = await verificarSessao(token);

    if (!sessao) {
      return Response.json(
        { erro: "Sessão inválida ou expirada." },
        { status: 403 }
      );
    }

    // ==========================================
    // AUDITORIA É EXCLUSIVA DO ADMINISTRADOR
    // ==========================================

    if (sessao.tipo_usuario !== "admin") {
      return Response.json(
        { erro: "Acesso negado. Apenas administradores podem consultar a auditoria." },
        { status: 403 }
      );
    }

    // ==========================================
    // BUSCAR AUDITORIA
    // ==========================================

    const resultado = await pool.query(`
      SELECT
        id_auditoria,
        tipo_usuario,
        id_usuario,
        acao,
        tabela_afetada,
        registro_id,
        detalhes,
        data_hora
      FROM auditoria
      ORDER BY data_hora DESC
      LIMIT 100
    `);


    return Response.json(resultado.rows);

  } catch (error) {
    console.error("Erro auditoria:", error);

    return Response.json(
      {
        erro: "Erro ao buscar auditoria.",
        mensagem: error.message,
      },
      { status: 500 }
    );
  }
}

import db from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";

// =========================================================
// OBTER SESSÃO DO USUÁRIO
// =========================================================
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

// =========================================================
// GET - LISTAR PSICÓLOGOS
// =========================================================
export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    // Verifica autenticação
    if (!sessao) {
      return Response.json(
        { erro: "Acesso não autorizado." },
        { status: 403 }
      );
    }

    // Verifica permissão
    const tiposPermitidos = [
      "admin",
      "psicologo",
      "estagiario",
    ];

    if (!tiposPermitidos.includes(sessao.tipo_usuario)) {
      return Response.json(
        {
          erro: "Você não possui permissão para acessar os psicólogos.",
        },
        { status: 403 }
      );
    }

    let resultado;

    // =========================================================
    // PSICÓLOGO
    // Visualiza somente o próprio cadastro
    // =========================================================
    if (sessao.tipo_usuario === "psicologo") {
      if (!sessao.id_psicologo) {
        return Response.json(
          { erro: "Psicólogo não identificado na sessão." },
          { status: 403 }
        );
      }

      resultado = await db.query(
        `
          SELECT
            id_psicologo,
            nome,
            cpf,
            TO_CHAR(data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
            crp,
            especialidade,
            telefone,
            email
          FROM public.psicologos
          WHERE id_psicologo = $1
        `,
        [sessao.id_psicologo]
      );
    }

    // =========================================================
    // ESTAGIÁRIO
    // Visualiza somente os dados necessários para consulta
    // =========================================================
    else if (sessao.tipo_usuario === "estagiario") {
      resultado = await db.query(`
        SELECT
          id_psicologo,
          nome,
          especialidade
        FROM public.psicologos
        ORDER BY nome ASC
      `);
    }

    // =========================================================
    // ADMINISTRADOR
    // Visualiza os dados cadastrais de todos os psicólogos
    // =========================================================
    else if (sessao.tipo_usuario === "admin") {
      resultado = await db.query(`
        SELECT
          id_psicologo,
          nome,
          cpf,
          TO_CHAR(data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
          crp,
          especialidade,
          telefone,
          email
        FROM public.psicologos
        ORDER BY nome ASC
      `);
    }

    return Response.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao listar psicólogos:", error);

    return Response.json(
      { erro: "Erro ao listar psicólogos." },
      { status: 500 }
    );
  }
}
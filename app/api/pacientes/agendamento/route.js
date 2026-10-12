import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";

/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */

async function obterSessao(req) {
  const cookie = req.headers.get("cookie") || "";

  const sessaoCookie = cookie
    .split(";")
    .find((item) => item.trim().startsWith("sessao="));

  const token = sessaoCookie
    ? sessaoCookie.trim().substring("sessao=".length)
    : null;

  if (!token) return null;

  return await verificarSessao(token);
}

/* =========================================================
   GET — PACIENTES DISPONÍVEIS PARA AGENDAMENTO

   Administrador e psicólogo podem agendar para pacientes
   cadastrados na clínica.

   Esta rota retorna somente os dados necessários ao seletor.
   Ela não libera acesso a prontuários ou anamneses.
   ========================================================= */

export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return Response.json(
        { erro: "Sessão inválida ou expirada." },
        { status: 401 }
      );
    }

    if (
      !["admin", "psicologo"].includes(sessao.tipo_usuario)
    ) {
      return Response.json(
        {
          erro:
            "Você não possui permissão para consultar pacientes para agendamento.",
        },
        { status: 403 }
      );
    }

    if (
      sessao.tipo_usuario === "psicologo" &&
      !Number.isSafeInteger(Number(sessao.id_psicologo))
    ) {
      return Response.json(
        { erro: "Psicólogo não identificado na sessão." },
        { status: 403 }
      );
    }

    const resultado = await pool.query(
      `
      SELECT
        id_paciente,
        nome_completo
      FROM pacientes
      ORDER BY nome_completo ASC
      `
    );

    return Response.json(resultado.rows, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Erro ao carregar pacientes para agendamento:",
      error
    );

    return Response.json(
      { erro: "Erro ao carregar pacientes para agendamento." },
      { status: 500 }
    );
  }
}
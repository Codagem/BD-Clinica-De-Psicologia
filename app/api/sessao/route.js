import { verificarSessao } from "@/lib/sessao";

function obterCookieSessao(req) {
  const cookie = req.headers.get("cookie") || "";

  const cookies = cookie.split(";");

  for (const item of cookies) {
    const partes = item.trim().split("=");

    const nome = partes.shift();

    if (nome === "sessao") {
      return partes.join("=") || null;
    }
  }

  return null;
}

export async function GET(req) {
  try {
    const token = obterCookieSessao(req);

    if (!token) {
      return Response.json(
        {
          autenticado: false,
        },
        {
          status: 401,
        }
      );
    }

    const sessao = await verificarSessao(token);

    if (!sessao || !sessao.tipo_usuario) {
      return Response.json(
        {
          autenticado: false,
        },
        {
          status: 401,
        }
      );
    }

    return Response.json({
      autenticado: true,
      tipo_usuario: sessao.tipo_usuario,
      id_paciente: sessao.id_paciente || null,
      id_psicologo: sessao.id_psicologo || null,
      id_estagiario: sessao.id_estagiario || null,
    });
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);

    return Response.json(
      {
        autenticado: false,
      },
      {
        status: 401,
      }
    );
  }
}

export async function DELETE() {
  try {
    const resposta = Response.json({
      sucesso: true,
      mensagem: "Sessão encerrada com sucesso.",
    });

    resposta.headers.set(
      "Set-Cookie",
      [
        "sessao=",
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        "Max-Age=0",
        process.env.NODE_ENV === "production" ? "Secure" : "",
      ]
        .filter(Boolean)
        .join("; ")
    );

    return resposta;
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);

    return Response.json(
      {
        sucesso: false,
        erro: "Não foi possível encerrar a sessão.",
      },
      {
        status: 500,
      }
    );
  }
}
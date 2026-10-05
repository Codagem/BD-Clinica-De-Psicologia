import { criarSessao } from "@/lib/sessao";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        {
          erro: "Dados de login inválidos.",
        },
        { status: 400 }
      );
    }

    const usuario = String(body.usuario || "").trim();
    const senha = String(body.senha || "");

    if (!usuario || !senha) {
      return Response.json(
        {
          erro: "Usuário e senha são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const usuarioAdmin = String(process.env.ADMIN_USUARIO || "");
    const senhaAdmin = String(process.env.ADMIN_SENHA || "");

    if (!usuarioAdmin || !senhaAdmin) {
      console.error("Credenciais administrativas não configuradas.");

      return Response.json(
        {
          erro: "Erro ao realizar login.",
        },
        { status: 500 }
      );
    }

    if (usuario !== usuarioAdmin || senha !== senhaAdmin) {
      return Response.json(
        {
          erro: "Usuário ou senha de administrador inválidos.",
        },
        { status: 401 }
      );
    }

    const token = await criarSessao({
      tipo_usuario: "admin",
    });

    const secureCookie =
      process.env.NODE_ENV === "production" ? " Secure;" : "";

    return Response.json(
      {
        mensagem: "Login de administrador realizado.",
        tipo_usuario: "admin",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie":
            `sessao=${token}; ` +
            `HttpOnly; ` +
            `Path=/; ` +
            `Max-Age=28800; ` +
            `SameSite=Lax;` +
            secureCookie,
        },
      }
    );
  } catch (error) {
    console.error("Erro no login do administrador:", error);

    return Response.json(
      {
        erro: "Erro ao realizar login.",
      },
      { status: 500 }
    );
  }
}
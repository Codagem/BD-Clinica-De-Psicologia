import pool from "@/lib/db";
import { criarSessao } from "@/lib/sessao";

function limparCPF(cpf) {
  return String(cpf || "").replace(/\D/g, "");
}

function validarCPF(cpf) {
  if (!cpf || cpf.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = soma % 11;
  const primeiroDigito = resto < 2 ? 0 : 11 - resto;

  if (primeiroDigito !== Number(cpf[9])) {
    return false;
  }

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = soma % 11;
  const segundoDigito = resto < 2 ? 0 : 11 - resto;

  return segundoDigito === Number(cpf[10]);
}

function normalizarData(data) {
  const valor = String(data || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    const [dia, mes, ano] = valor.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  return "";
}

function validarData(data) {
  if (!data) return false;

  const dataObj = new Date(`${data}T00:00:00`);

  if (Number.isNaN(dataObj.getTime())) {
    return false;
  }

  const hoje = new Date();

  if (dataObj > hoje) {
    return false;
  }

  return dataObj.getFullYear() >= 1900;
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        { erro: "Dados de login inválidos." },
        { status: 400 }
      );
    }

    const cpf = limparCPF(body.usuario);
    const dataNascimento = normalizarData(body.senha);

    if (!cpf || !dataNascimento) {
      return Response.json(
        {
          erro: "CPF e data de nascimento são obrigatórios.",
        },
        { status: 400 }
      );
    }

    if (!validarCPF(cpf)) {
      return Response.json(
        {
          erro: "CPF ou data de nascimento inválidos.",
        },
        { status: 401 }
      );
    }

    if (!validarData(dataNascimento)) {
      return Response.json(
        {
          erro: "CPF ou data de nascimento inválidos.",
        },
        { status: 401 }
      );
    }

    const resultado = await pool.query(
      `
      SELECT
        id_estagiario,
        nome,
        status
      FROM public.estagiarios
      WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $1
      AND data_nascimento = $2::date
      LIMIT 1
      `,
      [cpf, dataNascimento]
    );

    if (resultado.rows.length === 0) {
      return Response.json(
        {
          erro: "CPF ou data de nascimento inválidos.",
        },
        { status: 401 }
      );
    }

    const estagiario = resultado.rows[0];

    if (estagiario.status !== "Ativo") {
      return Response.json(
        {
          erro: "Este estagiário está com o acesso inativo.",
        },
        { status: 403 }
      );
    }

    const token = await criarSessao({
      tipo_usuario: "estagiario",
      id_estagiario: estagiario.id_estagiario,
    });

    const secureCookie =
      process.env.NODE_ENV === "production" ? " Secure;" : "";

    return Response.json(
      {
        mensagem: "Login realizado com sucesso.",
        id_estagiario: estagiario.id_estagiario,
        nome: estagiario.nome,
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
    console.error("Erro no login do estagiário:", error);

    return Response.json(
      {
        erro: "Erro ao realizar login.",
      },
      { status: 500 }
    );
  }
}
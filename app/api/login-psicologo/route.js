import pool from "@/lib/db";
import { criarSessao } from "@/lib/sessao";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const HASH_FALSO = bcrypt.hashSync("senha-falsa-para-timing", 10);
const MENSAGEM_INVALIDO = "CPF ou credencial inválidos.";

function limparCPF(cpf) {
  return String(cpf || "").replace(/\D/g, "");
}

function validarCPF(cpf) {
  if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = soma % 11;
  const primeiro = resto < 2 ? 0 : 11 - resto;

  if (primeiro !== Number(cpf[9])) {
    return false;
  }

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = soma % 11;
  const segundo = resto < 2 ? 0 : 11 - resto;

  return segundo === Number(cpf[10]);
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const [ano, mes, dia] = data.split("-").map(Number);
  const dataObj = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    dataObj.getUTCFullYear() === ano &&
    dataObj.getUTCMonth() === mes - 1 &&
    dataObj.getUTCDate() === dia &&
    ano >= 1900 &&
    dataObj.getTime() <= Date.now()
  );
}

export async function POST(req) {
  try {
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { erro: "Requisição inválida." },
        { status: 400 }
      );
    }

    const cpf = limparCPF(body?.usuario);
    const senha = String(body?.senha || "");

    if (!validarCPF(cpf) || !senha || senha.length > 72) {
      return NextResponse.json(
        { erro: MENSAGEM_INVALIDO },
        { status: 401 }
      );
    }

    const resultado = await pool.query(
      `
      SELECT
        id_psicologo,
        nome,
        TO_CHAR(data_nascimento, 'YYYY-MM-DD') AS data_nascimento,
        senha_hash,
        trocar_senha
      FROM public.psicologos
      WHERE REGEXP_REPLACE(COALESCE(cpf, ''), '[^0-9]', '', 'g') = $1
      LIMIT 1
      `,
      [cpf]
    );

    if (resultado.rows.length === 0) {
      await bcrypt.compare(senha, HASH_FALSO);

      return NextResponse.json(
        { erro: MENSAGEM_INVALIDO },
        { status: 401 }
      );
    }

    const psicologo = resultado.rows[0];
    const semSenhaCadastrada =
      !psicologo.senha_hash ||
      !String(psicologo.senha_hash).trim();

    if (semSenhaCadastrada) {
      const dataInformada = normalizarData(senha);
      const dataBanco = psicologo.data_nascimento || "";

      if (
        !validarData(dataInformada) ||
        !dataBanco ||
        dataBanco !== dataInformada
      ) {
        return NextResponse.json(
          { erro: MENSAGEM_INVALIDO },
          { status: 401 }
        );
      }
    } else {
      const senhaCorreta = await bcrypt.compare(
        senha,
        psicologo.senha_hash
      );

      if (!senhaCorreta) {
        return NextResponse.json(
          { erro: MENSAGEM_INVALIDO },
          { status: 401 }
        );
      }
    }

    // O psicólogo entra normalmente mesmo se ainda não criou senha.
    const senhaPendente =
      semSenhaCadastrada || Boolean(psicologo.trocar_senha);

    const token = await criarSessao({
      tipo_usuario: "psicologo",
      id_psicologo: psicologo.id_psicologo,
      senha_pendente: senhaPendente,
    });

    const resposta = NextResponse.json({
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      id_psicologo: psicologo.id_psicologo,
      nome: psicologo.nome,
      precisaTrocarSenha: senhaPendente,
    });

    resposta.cookies.set("sessao", token, {
      httpOnly: true,
      path: "/",
      maxAge: 28800,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Remove eventual cookie temporário do fluxo antigo.
    resposta.cookies.set("troca_senha_psicologo", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return resposta;
  } catch (error) {
    console.error("Erro no login do psicólogo:", error);

    return NextResponse.json(
      { erro: "Erro ao realizar login." },
      { status: 500 }
    );
  }
}

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { criarSessao } from "@/lib/sessao";

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

function normalizarData(valor) {
  const texto = String(valor || "").trim();

  let ano;
  let mes;
  let dia;

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    [ano, mes, dia] = texto.split("-");
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    [dia, mes, ano] = texto.split("/");
  } else {
    return "";
  }

  const data = new Date(
    Date.UTC(Number(ano), Number(mes) - 1, Number(dia))
  );

  if (
    data.getUTCFullYear() !== Number(ano) ||
    data.getUTCMonth() !== Number(mes) - 1 ||
    data.getUTCDate() !== Number(dia) ||
    Number(ano) < 1900
  ) {
    return "";
  }

  const hoje = new Date();
  const hojeUTC = Date.UTC(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate()
  );

  if (data.getTime() > hojeUTC) {
    return "";
  }

  return `${ano}-${mes}-${dia}`;
}

function erro(mensagem, status) {
  return Response.json({ erro: mensagem }, { status });
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return erro("Dados de login inválidos.", 400);
    }

    const cpf = limparCPF(body.usuario);
    const senha = String(body.senha || "");

    if (!validarCPF(cpf) || !senha || senha.length > 72) {
      return erro("CPF ou senha inválidos.", 401);
    }

    const resultado = await pool.query(
      `SELECT
         id_paciente,
         nome_completo,
         data_nascimento,
         senha_hash
       FROM public.pacientes
       WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $1
       LIMIT 1`,
      [cpf]
    );

    if (resultado.rows.length === 0) {
      return erro("CPF ou senha inválidos.", 401);
    }

    const paciente = resultado.rows[0];
    let senhaValida = false;
    let precisaCriarSenha = false;

    if (paciente.senha_hash) {
      // Paciente que já cadastrou uma senha pessoal.
      senhaValida = await bcrypt.compare(
        senha,
        paciente.senha_hash
      );
    } else {
      // Compatibilidade para pacientes que ainda usam a data de nascimento.
      const dataInformada = normalizarData(senha);

      if (dataInformada && paciente.data_nascimento) {
        const dataBanco =
          paciente.data_nascimento instanceof Date
            ? paciente.data_nascimento.toISOString().slice(0, 10)
            : String(paciente.data_nascimento).slice(0, 10);

        senhaValida = dataInformada === dataBanco;
        precisaCriarSenha = senhaValida;
      }
    }

    if (!senhaValida) {
      return erro("CPF ou senha inválidos.", 401);
    }

    const token = await criarSessao({
      tipo_usuario: "paciente",
      id_paciente: paciente.id_paciente,
    });

    const secureCookie =
      process.env.NODE_ENV === "production" ? " Secure;" : "";

    return Response.json(
      {
        mensagem: "Login realizado com sucesso.",
        id_paciente: paciente.id_paciente,
        nome: paciente.nome_completo,
        precisaCriarSenha,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie":
            `sessao=${token}; ` +
            "HttpOnly; " +
            "Path=/; " +
            "Max-Age=28800; " +
            "SameSite=Lax;" +
            secureCookie,
        },
      }
    );
  } catch (error) {
    console.error("Erro no login do paciente:", error);

    return erro("Erro ao realizar login.", 500);
  }
}
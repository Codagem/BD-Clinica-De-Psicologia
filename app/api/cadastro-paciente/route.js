import pool from "@/lib/db";
import { registrarAuditoria } from "@/lib/auditoria";
import { criarSessao } from "@/lib/sessao";

function limparCPF(cpf) {
  return String(cpf || "").replace(/\D/g, "");
}

function validarCPF(cpf) {
  if (!cpf || cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = soma % 11;
  let primeiroDigito = resto < 2 ? 0 : 11 - resto;

  if (primeiroDigito !== Number(cpf[9])) {
    return false;
  }

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = soma % 11;
  let segundoDigito = resto < 2 ? 0 : 11 - resto;

  return segundoDigito === Number(cpf[10]);
}

function validarDataNascimento(data) {
  if (!data) {
    return false;
  }

  const dataNascimento = new Date(`${data}T00:00:00`);

  if (Number.isNaN(dataNascimento.getTime())) {
    return false;
  }

  const hoje = new Date();

  if (dataNascimento > hoje) {
    return false;
  }

  const ano = dataNascimento.getFullYear();

  if (ano < 1900) {
    return false;
  }

  return true;
}

function validarEmail(email) {
  if (!email) {
    return true;
  }

  if (String(email).length > 150) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

function limitarTexto(valor, limite) {
  if (valor === null || valor === undefined) {
    return null;
  }

  const texto = String(valor).trim();

  if (!texto) {
    return null;
  }

  if (texto.length > limite) {
    return null;
  }

  return texto;
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return Response.json(
        {
          erro: "Dados de cadastro inválidos.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      nome_completo,
      data_nascimento,
      cpf,
      telefone,
      email,
      endereco,
      profissao,
      estado_civil,
    } = body;

    const nome = limitarTexto(nome_completo, 150);
    const dataNascimento = String(data_nascimento || "").trim();
    const cpfLimpo = limparCPF(cpf);
    const telefoneLimpo = limitarTexto(telefone, 30);
    const emailLimpo = limitarTexto(email, 150);
    const enderecoLimpo = limitarTexto(endereco, 255);
    const profissaoLimpa = limitarTexto(profissao, 100);
    const estadoCivilLimpo = limitarTexto(estado_civil, 50);

    // =========================
    // VALIDAÇÕES OBRIGATÓRIAS
    // =========================

    if (!nome || !dataNascimento || !cpfLimpo) {
      return Response.json(
        {
          erro: "Nome, CPF e data de nascimento são obrigatórios.",
        },
        {
          status: 400,
        }
      );
    }

    if (String(nome).length < 3) {
      return Response.json(
        {
          erro: "Nome inválido.",
        },
        {
          status: 400,
        }
      );
    }

    if (String(nome).length > 150) {
      return Response.json(
        {
          erro: "Nome muito longo.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VALIDAÇÃO DO CPF
    // =========================

    if (!validarCPF(cpfLimpo)) {
      return Response.json(
        {
          erro: "CPF inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VALIDAÇÃO DA DATA
    // =========================

    if (!validarDataNascimento(dataNascimento)) {
      return Response.json(
        {
          erro: "Data de nascimento inválida.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VALIDAÇÃO DO E-MAIL
    // =========================

    if (!validarEmail(emailLimpo)) {
      return Response.json(
        {
          erro: "E-mail inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // LIMITES DOS CAMPOS
    // =========================

    if (
      (telefone && telefoneLimpo === null) ||
      (email && emailLimpo === null) ||
      (endereco && enderecoLimpo === null) ||
      (profissao && profissaoLimpa === null) ||
      (estado_civil && estadoCivilLimpo === null)
    ) {
      return Response.json(
        {
          erro: "Um ou mais campos possuem tamanho inválido.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VERIFICA DUPLICIDADE
    // =========================

    const existente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $1
      LIMIT 1
      `,
      [cpfLimpo]
    );

    if (existente.rows.length > 0) {
      return Response.json(
        {
          erro: "Este CPF já está cadastrado.",
        },
        {
          status: 409,
        }
      );
    }

    // =========================
    // CADASTRO
    // =========================

    const resultado = await pool.query(
      `
      INSERT INTO pacientes (
        nome_completo,
        data_nascimento,
        cpf,
        telefone,
        email,
        endereco,
        profissao,
        estado_civil
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_paciente, nome_completo
      `,
      [
        nome,
        dataNascimento,
        cpfLimpo,
        telefoneLimpo,
        emailLimpo,
        enderecoLimpo,
        profissaoLimpa,
        estadoCivilLimpo,
      ]
    );

    const paciente = resultado.rows[0];

    // =========================
    // AUDITORIA
    // =========================

    await registrarAuditoria({
      tipoUsuario: "publico",
      idUsuario: paciente.id_paciente,
      acao: "CADASTRO DE PACIENTE",
      tabelaAfetada: "pacientes",
      registroId: paciente.id_paciente,
      detalhes: "Novo paciente realizou cadastro público.",
    });

    // =====================================================
    // TOKEN TEMPORÁRIO PARA REGISTRAR O CONSENTIMENTO
    // =====================================================

    const tokenConsentimento = await criarSessao(
      {
        tipo: "consentimento",
        id_paciente: paciente.id_paciente,
      },
      "10m"
    );

    // =========================
    // RESPOSTA
    // =========================

    return Response.json(
      {
        mensagem: "Paciente cadastrado com sucesso.",
        id_paciente: paciente.id_paciente,
        nome: paciente.nome_completo,
        token_consentimento: tokenConsentimento,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);

    return Response.json(
      {
        erro: "Erro ao realizar cadastro.",
      },
      {
        status: 500,
      }
    );
  }
}
import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { registrarAuditoria } from "@/lib/auditoria";

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

function resposta(erro, status) {
  return Response.json({ erro }, { status });
}

function converterId(valor) {
  const numero = Number(valor);

  return Number.isSafeInteger(numero) && numero > 0
    ? numero
    : null;
}

async function lerBody(req) {
  try {
    const body = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return null;
    }

    return body;
  } catch {
    return null;
  }
}

function limparTexto(valor) {
  if (valor === null || valor === undefined) return null;

  const texto = String(valor).trim();

  return texto || null;
}

function dataNascimentoValida(valor) {
  if (
    typeof valor !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return false;
  }

  const data = new Date(`${valor}T00:00:00.000Z`);

  if (
    Number.isNaN(data.getTime()) ||
    data.toISOString().slice(0, 10) !== valor
  ) {
    return false;
  }

  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);

  return data <= hoje;
}

function cpfValido(valor) {
  const cpf = String(valor ?? "").replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  if (resto !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  return resto === Number(cpf[10]);
}

async function auditar(dados) {
  try {
    await registrarAuditoria(dados);
  } catch (error) {
    console.error("Falha ao registrar auditoria:", error);
  }
}

function somenteAdmin(sessao) {
  return sessao?.tipo_usuario === "admin";
}

/* =========================================================
   GET — LISTAR PACIENTES
   Administrador, psicólogo e estagiário.
   ========================================================= */

export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return resposta("Sessão inválida ou expirada.", 401);
    }

    if (
      !["admin", "psicologo", "estagiario"].includes(
        sessao.tipo_usuario
      )
    ) {
      return resposta(
        "Você não possui permissão para acessar pacientes.",
        403
      );
    }

    if (sessao.tipo_usuario === "estagiario") {
      const idEstagiario = converterId(sessao.id_estagiario);

      if (!idEstagiario) {
        return resposta("Estagiário não identificado.", 403);
      }

      const result = await pool.query(
        `
        SELECT DISTINCT
          p.id_paciente,
          p.nome_completo,
          p.data_nascimento
        FROM pacientes p
        INNER JOIN estagiarios_pacientes ep
          ON ep.id_paciente = p.id_paciente
        WHERE ep.id_estagiario = $1
          AND ep.status = 'Ativo'
        ORDER BY p.nome_completo
        `,
        [idEstagiario]
      );

      return Response.json(result.rows);
    }

    
    // Psicólogo: somente pacientes com consultas vinculadas ao seu cadastro.
    if (sessao.tipo_usuario === "psicologo") {
      const idPsicologo = converterId(sessao.id_psicologo);

      if (!idPsicologo) {
        return resposta("Psicólogo não identificado na sessão.", 403);
      }

      const result = await pool.query(
        `
        SELECT p.*
        FROM pacientes p
        WHERE EXISTS (
          SELECT 1
          FROM consultas c
          WHERE c.id_paciente = p.id_paciente
            AND c.id_psicologo = $1
        )
        ORDER BY p.nome_completo
        `,
        [idPsicologo]
      );

      return Response.json(result.rows);
    }

    // Administrador: mantém a visualização geral.
    const result = await pool.query(
      `
      SELECT *
      FROM pacientes
      ORDER BY id_paciente
      `
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("Erro ao carregar pacientes:", error);

    return resposta("Erro ao carregar pacientes.", 500);
  }
}

/* =========================================================
   POST — CADASTRAR PACIENTE
   Somente administrador.
   ========================================================= */

export async function POST(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return resposta("Sessão inválida ou expirada.", 401);
    }

    if (!somenteAdmin(sessao)) {
      return resposta(
        "Apenas o administrador pode cadastrar pacientes.",
        403
      );
    }

    const body = await lerBody(req);

    if (!body) {
      return resposta("Dados inválidos.", 400);
    }

    const nome = limparTexto(body.nome_completo);
    const dataNascimento = body.data_nascimento;
    const cpf = String(body.cpf ?? "").replace(/\D/g, "");
    const telefone = limparTexto(body.telefone);
    const profissao = limparTexto(body.profissao);

    if (!nome || !dataNascimento || !cpf) {
      return resposta(
        "Nome, data de nascimento e CPF são obrigatórios.",
        400
      );
    }

    if (!dataNascimentoValida(dataNascimento)) {
      return resposta(
        "Data de nascimento inválida ou futura.",
        400
      );
    }

    if (!cpfValido(cpf)) {
      return resposta("CPF inválido.", 400);
    }

    const existente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $1
      LIMIT 1
      `,
      [cpf]
    );

    if (existente.rowCount > 0) {
      return resposta(
        "Já existe um paciente cadastrado com este CPF.",
        409
      );
    }

    const resultado = await pool.query(
      `
      INSERT INTO pacientes (
        nome_completo,
        data_nascimento,
        cpf,
        telefone,
        profissao
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_paciente
      `,
      [nome, dataNascimento, cpf, telefone, profissao]
    );

    const idPaciente = resultado.rows[0].id_paciente;

    await auditar({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: sessao.id_usuario ?? null,
      acao: "CRIAR_PACIENTE",
      tabelaAfetada: "pacientes",
      registroId: idPaciente,
      detalhes: "Novo paciente cadastrado pelo administrador.",
    });

    return Response.json(
      {
        mensagem: "Paciente cadastrado com sucesso.",
        id_paciente: idPaciente,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);

    if (error.code === "23505") {
      return resposta(
        "Já existe um cadastro com esses dados únicos.",
        409
      );
    }

    return resposta("Erro ao cadastrar paciente.", 500);
  }
}

/* =========================================================
   PUT — EDITAR PACIENTE
   Somente administrador.
   ========================================================= */

export async function PUT(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return resposta("Sessão inválida ou expirada.", 401);
    }

    if (!somenteAdmin(sessao)) {
      return resposta(
        "Apenas o administrador pode editar pacientes.",
        403
      );
    }

    const body = await lerBody(req);

    if (!body) {
      return resposta("Dados inválidos.", 400);
    }

    const idPaciente = converterId(body.id);
    const nome = limparTexto(body.nome_completo);
    const dataNascimento = body.data_nascimento;
    const cpf = String(body.cpf ?? "").replace(/\D/g, "");
    const telefone = limparTexto(body.telefone);
    const profissao = limparTexto(body.profissao);

    if (!idPaciente || !nome || !dataNascimento || !cpf) {
      return resposta(
        "ID, nome, data de nascimento e CPF são obrigatórios.",
        400
      );
    }

    if (!dataNascimentoValida(dataNascimento)) {
      return resposta(
        "Data de nascimento inválida ou futura.",
        400
      );
    }

    if (!cpfValido(cpf)) {
      return resposta("CPF inválido.", 400);
    }

    const existente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $1
        AND id_paciente <> $2
      LIMIT 1
      `,
      [cpf, idPaciente]
    );

    if (existente.rowCount > 0) {
      return resposta(
        "Este CPF já pertence a outro paciente.",
        409
      );
    }

    const resultado = await pool.query(
      `
      UPDATE pacientes
      SET
        nome_completo = $1,
        data_nascimento = $2,
        cpf = $3,
        telefone = $4,
        profissao = $5
      WHERE id_paciente = $6
      RETURNING id_paciente
      `,
      [
        nome,
        dataNascimento,
        cpf,
        telefone,
        profissao,
        idPaciente,
      ]
    );

    if (resultado.rowCount === 0) {
      return resposta("Paciente não encontrado.", 404);
    }

    await auditar({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: sessao.id_usuario ?? null,
      acao: "ALTERAR_PACIENTE",
      tabelaAfetada: "pacientes",
      registroId: idPaciente,
      detalhes: "Dados do paciente alterados pelo administrador.",
    });

    return Response.json({
      mensagem: "Paciente atualizado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);

    if (error.code === "23505") {
      return resposta(
        "Já existe um cadastro com esses dados únicos.",
        409
      );
    }

    return resposta("Erro ao atualizar paciente.", 500);
  }
}

/* =========================================================
   DELETE — EXCLUIR PACIENTE
   Somente administrador.
   Bloqueia exclusão quando existem consultas vinculadas.
   ========================================================= */

export async function DELETE(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return resposta("Sessão inválida ou expirada.", 401);
    }

    if (!somenteAdmin(sessao)) {
      return resposta(
        "Apenas o administrador pode excluir pacientes.",
        403
      );
    }

    const body = await lerBody(req);

    if (!body) {
      return resposta("Dados inválidos.", 400);
    }

    const idPaciente = converterId(body.id);

    if (!idPaciente) {
      return resposta("ID do paciente inválido.", 400);
    }

    const paciente = await pool.query(
      `
      SELECT id_paciente
      FROM pacientes
      WHERE id_paciente = $1
      `,
      [idPaciente]
    );

    if (paciente.rowCount === 0) {
      return resposta("Paciente não encontrado.", 404);
    }

    const consultas = await pool.query(
      `
      SELECT COUNT(*)::integer AS quantidade
      FROM consultas
      WHERE id_paciente = $1
      `,
      [idPaciente]
    );

    if (consultas.rows[0].quantidade > 0) {
      return resposta(
        "Este paciente possui consultas vinculadas. Preserve o histórico e desative o cadastro em vez de excluir seus dados.",
        409
      );
    }

    await pool.query(
      `
      DELETE FROM pacientes
      WHERE id_paciente = $1
      `,
      [idPaciente]
    );

    await auditar({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: sessao.id_usuario ?? null,
      acao: "EXCLUIR_PACIENTE",
      tabelaAfetada: "pacientes",
      registroId: idPaciente,
      detalhes: "Paciente excluído pelo administrador.",
    });

    return Response.json({
      mensagem: "Paciente removido com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);

    if (error.code === "23503") {
      return resposta(
        "Não é possível excluir este paciente porque existem registros vinculados.",
        409
      );
    }

    return resposta("Erro ao excluir paciente.", 500);
  }
}
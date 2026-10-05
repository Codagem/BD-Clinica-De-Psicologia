import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { registrarAuditoria } from "@/lib/auditoria";

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

function respostaNaoAutorizado(mensagem = "Acesso não autorizado.") {
  return Response.json(
    {
      erro: mensagem,
    },
    { status: 403 }
  );
}

function somenteAdmin(sessao) {
  return sessao?.tipo_usuario === "admin";
}

export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutorizado();
    }

    if (!somenteAdmin(sessao)) {
      return respostaNaoAutorizado(
        "Apenas o administrador pode acessar o financeiro."
      );
    }

    const resumo = await pool.query(`
      SELECT * FROM vw_resumo_financeiro
    `);

    const pagamentos = await pool.query(`
      SELECT
        pg.id_pagamento,
        pg.id_consulta,
        p.id_paciente,
        p.nome_completo AS paciente,
        pg.valor,
        pg.forma_pagamento,
        pg.status_pagamento,
        pg.data_pagamento
      FROM pagamentos pg
      JOIN consultas c
        ON pg.id_consulta = c.id_consulta
      JOIN pacientes p
        ON c.id_paciente = p.id_paciente
      ORDER BY pg.id_pagamento DESC
    `);

    const despesas = await pool.query(`
      SELECT
        id_despesa,
        data_despesa,
        descricao,
        categoria,
        valor
      FROM despesas
      ORDER BY id_despesa DESC
    `);

    return Response.json({
      resumo: resumo.rows[0] || {},
      pagamentos: pagamentos.rows,
      despesas: despesas.rows,
    });
  } catch (error) {
    console.error("Erro ao carregar financeiro:", error);

    return Response.json(
      {
        erro: "Erro ao carregar financeiro.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutorizado();
    }

    if (!somenteAdmin(sessao)) {
      return respostaNaoAutorizado(
        "Apenas o administrador pode cadastrar informações financeiras."
      );
    }

    const body = await req.json();

    if (body.tipo === "pagamento") {
      const {
        id_consulta,
        valor,
        forma_pagamento,
        status_pagamento,
        data_pagamento,
      } = body;

      if (!id_consulta || !valor || !data_pagamento) {
        return Response.json(
          {
            erro: "Preencha consulta, valor e data do pagamento.",
          },
          { status: 400 }
        );
      }

      const idConsulta = Number(id_consulta);
      const valorPagamento = Number(valor);

      if (
        !Number.isInteger(idConsulta) ||
        idConsulta <= 0 ||
        !Number.isFinite(valorPagamento) ||
        valorPagamento <= 0
      ) {
        return Response.json(
          {
            erro: "Consulta ou valor do pagamento inválido.",
          },
          { status: 400 }
        );
      }

      const consulta = await pool.query(
        `
        SELECT id_consulta
        FROM consultas
        WHERE id_consulta = $1
        `,
        [idConsulta]
      );

      if (consulta.rows.length === 0) {
        return Response.json(
          {
            erro: "Consulta não encontrada.",
          },
          { status: 404 }
        );
      }

      const pagamentoCriado = await pool.query(
        `
        INSERT INTO pagamentos
        (
          id_consulta,
          valor,
          forma_pagamento,
          status_pagamento,
          data_pagamento
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_pagamento
        `,
        [
          idConsulta,
          valorPagamento,
          forma_pagamento || null,
          status_pagamento || null,
          data_pagamento,
        ]
      );

      await registrarAuditoria({
        tipoUsuario: sessao.tipo_usuario,
        idUsuario: null,
        acao: "CADASTRO DE PAGAMENTO",
        tabelaAfetada: "pagamentos",
        registroId: pagamentoCriado.rows[0].id_pagamento,
        detalhes: `Pagamento cadastrado para a consulta ${idConsulta}.`,
      });

      return Response.json({
        mensagem: "Pagamento cadastrado",
        id_pagamento: pagamentoCriado.rows[0].id_pagamento,
      });
    }

    if (body.tipo === "despesa") {
      const {
        descricao,
        categoria,
        valor,
        data_despesa,
      } = body;

      if (!descricao || !valor || !data_despesa) {
        return Response.json(
          {
            erro: "Preencha descrição, valor e data da despesa.",
          },
          { status: 400 }
        );
      }

      const valorDespesa = Number(valor);

      if (!Number.isFinite(valorDespesa) || valorDespesa <= 0) {
        return Response.json(
          {
            erro: "Valor da despesa inválido.",
          },
          { status: 400 }
        );
      }

      const despesaCriada = await pool.query(
        `
        INSERT INTO despesas
        (
          descricao,
          categoria,
          valor,
          data_despesa
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id_despesa
        `,
        [
          descricao,
          categoria || null,
          valorDespesa,
          data_despesa,
        ]
      );

      await registrarAuditoria({
        tipoUsuario: sessao.tipo_usuario,
        idUsuario: null,
        acao: "CADASTRO DE DESPESA",
        tabelaAfetada: "despesas",
        registroId: despesaCriada.rows[0].id_despesa,
        detalhes: `Despesa cadastrada: ${descricao}.`,
      });

      return Response.json({
        mensagem: "Despesa cadastrada",
        id_despesa: despesaCriada.rows[0].id_despesa,
      });
    }

    return Response.json(
      {
        erro: "Tipo inválido.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar informação financeira:", error);

    return Response.json(
      {
        erro: "Erro ao cadastrar informação financeira.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutorizado();
    }

    if (!somenteAdmin(sessao)) {
      return respostaNaoAutorizado(
        "Apenas o administrador pode editar informações financeiras."
      );
    }

    const body = await req.json();

    if (body.tipo === "pagamento") {
      const {
        id,
        id_consulta,
        valor,
        forma_pagamento,
        status_pagamento,
        data_pagamento,
      } = body;

      if (!id || !id_consulta || !valor || !data_pagamento) {
        return Response.json(
          {
            erro: "Preencha consulta, valor e data do pagamento.",
          },
          { status: 400 }
        );
      }

      const idPagamento = Number(id);
      const idConsulta = Number(id_consulta);
      const valorPagamento = Number(valor);

      if (
        !Number.isInteger(idPagamento) ||
        idPagamento <= 0 ||
        !Number.isInteger(idConsulta) ||
        idConsulta <= 0 ||
        !Number.isFinite(valorPagamento) ||
        valorPagamento <= 0
      ) {
        return Response.json(
          {
            erro: "Dados do pagamento inválidos.",
          },
          { status: 400 }
        );
      }

      const consulta = await pool.query(
        `
        SELECT id_consulta
        FROM consultas
        WHERE id_consulta = $1
        `,
        [idConsulta]
      );

      if (consulta.rows.length === 0) {
        return Response.json(
          {
            erro: "Consulta não encontrada.",
          },
          { status: 404 }
        );
      }

      const pagamento = await pool.query(
        `
        UPDATE pagamentos
        SET
          id_consulta = $1,
          valor = $2,
          forma_pagamento = $3,
          status_pagamento = $4,
          data_pagamento = $5
        WHERE id_pagamento = $6
        RETURNING id_pagamento
        `,
        [
          idConsulta,
          valorPagamento,
          forma_pagamento || null,
          status_pagamento || null,
          data_pagamento,
          idPagamento,
        ]
      );

      if (pagamento.rows.length === 0) {
        return Response.json(
          {
            erro: "Pagamento não encontrado.",
          },
          { status: 404 }
        );
      }

      await registrarAuditoria({
        tipoUsuario: sessao.tipo_usuario,
        idUsuario: null,
        acao: "ALTERAÇÃO DE PAGAMENTO",
        tabelaAfetada: "pagamentos",
        registroId: idPagamento,
        detalhes: `Pagamento alterado. Consulta: ${idConsulta}. Valor: ${valorPagamento}.`,
      });

      return Response.json({
        mensagem: "Pagamento atualizado",
      });
    }

    if (body.tipo === "despesa") {
      const {
        id,
        descricao,
        categoria,
        valor,
        data_despesa,
      } = body;

      if (!id || !descricao || !valor || !data_despesa) {
        return Response.json(
          {
            erro: "Preencha descrição, valor e data da despesa.",
          },
          { status: 400 }
        );
      }

      const idDespesa = Number(id);
      const valorDespesa = Number(valor);

      if (
        !Number.isInteger(idDespesa) ||
        idDespesa <= 0 ||
        !Number.isFinite(valorDespesa) ||
        valorDespesa <= 0
      ) {
        return Response.json(
          {
            erro: "Dados da despesa inválidos.",
          },
          { status: 400 }
        );
      }

      const despesa = await pool.query(
        `
        UPDATE despesas
        SET
          descricao = $1,
          categoria = $2,
          valor = $3,
          data_despesa = $4
        WHERE id_despesa = $5
        RETURNING id_despesa
        `,
        [
          descricao,
          categoria || null,
          valorDespesa,
          data_despesa,
          idDespesa,
        ]
      );

      if (despesa.rows.length === 0) {
        return Response.json(
          {
            erro: "Despesa não encontrada.",
          },
          { status: 404 }
        );
      }

      await registrarAuditoria({
        tipoUsuario: sessao.tipo_usuario,
        idUsuario: null,
        acao: "ALTERAÇÃO DE DESPESA",
        tabelaAfetada: "despesas",
        registroId: idDespesa,
        detalhes: `Despesa alterada: ${descricao}.`,
      });

      return Response.json({
        mensagem: "Despesa atualizada",
      });
    }

    return Response.json(
      {
        erro: "Tipo inválido.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao atualizar informação financeira:", error);

    return Response.json(
      {
        erro: "Erro ao atualizar informação financeira.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutorizado();
    }

    if (!somenteAdmin(sessao)) {
      return respostaNaoAutorizado(
        "Apenas o administrador pode excluir informações financeiras."
      );
    }

    const body = await req.json();

    const { tipo, id } = body;

    if (!tipo || !id) {
      return Response.json(
        {
          erro: "Tipo e ID são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const idRegistro = Number(id);

    if (!Number.isInteger(idRegistro) || idRegistro <= 0) {
      return Response.json(
        {
          erro: "ID inválido.",
        },
        { status: 400 }
      );
    }

    if (tipo === "pagamento") {
      const pagamento = await pool.query(
        `
        DELETE FROM pagamentos
        WHERE id_pagamento = $1
        RETURNING id_pagamento
        `,
        [idRegistro]
      );

      if (pagamento.rows.length === 0) {
        return Response.json(
          {
            erro: "Pagamento não encontrado.",
          },
          { status: 404 }
        );
      }

      await registrarAuditoria({
        tipoUsuario: sessao.tipo_usuario,
        idUsuario: null,
        acao: "EXCLUSÃO DE PAGAMENTO",
        tabelaAfetada: "pagamentos",
        registroId: idRegistro,
        detalhes: `Pagamento ${idRegistro} excluído.`,
      });

      return Response.json({
        mensagem: "Pagamento excluído",
      });
    }

    if (tipo === "despesa") {
      const despesa = await pool.query(
        `
        DELETE FROM despesas
        WHERE id_despesa = $1
        RETURNING id_despesa
        `,
        [idRegistro]
      );

      if (despesa.rows.length === 0) {
        return Response.json(
          {
            erro: "Despesa não encontrada.",
          },
          { status: 404 }
        );
      }

      await registrarAuditoria({
        tipoUsuario: sessao.tipo_usuario,
        idUsuario: null,
        acao: "EXCLUSÃO DE DESPESA",
        tabelaAfetada: "despesas",
        registroId: idRegistro,
        detalhes: `Despesa ${idRegistro} excluída.`,
      });

      return Response.json({
        mensagem: "Despesa excluída",
      });
    }

    return Response.json(
      {
        erro: "Tipo inválido.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao excluir informação financeira:", error);

    return Response.json(
      {
        erro: "Erro ao excluir informação financeira.",
      },
      { status: 500 }
    );
  }
}
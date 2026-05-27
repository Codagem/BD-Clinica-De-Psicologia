import pool from "@/lib/db";

export async function GET() {
  try {
    const resumo = await pool.query(`
      SELECT * FROM vw_resumo_financeiro
    `);

    const pagamentos = await pool.query(`
      SELECT
        pg.id_pagamento,
        pg.id_consulta,
        p.nome_completo AS paciente,
        pg.valor,
        pg.forma_pagamento,
        pg.status_pagamento,
        pg.data_pagamento
      FROM pagamentos pg
      JOIN consultas c ON pg.id_consulta = c.id_consulta
      JOIN pacientes p ON c.id_paciente = p.id_paciente
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
    return Response.json({
      erro: error.message,
    });
  }
}

export async function POST(req) {
  try {
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
        return Response.json({
          erro: "Preencha consulta, valor e data do pagamento.",
        });
      }

      await pool.query(
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
        `,
        [
          Number(id_consulta),
          Number(valor),
          forma_pagamento,
          status_pagamento,
          data_pagamento,
        ]
      );

      return Response.json({
        mensagem: "Pagamento cadastrado",
      });
    }

    if (body.tipo === "despesa") {
      const { descricao, categoria, valor, data_despesa } = body;

      if (!descricao || !valor || !data_despesa) {
        return Response.json({
          erro: "Preencha descrição, valor e data da despesa.",
        });
      }

      await pool.query(
        `
        INSERT INTO despesas
        (
          descricao,
          categoria,
          valor,
          data_despesa
        )
        VALUES ($1, $2, $3, $4)
        `,
        [descricao, categoria, Number(valor), data_despesa]
      );

      return Response.json({
        mensagem: "Despesa cadastrada",
      });
    }

    return Response.json({
      erro: "Tipo inválido",
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}

export async function PUT(req) {
  try {
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
        return Response.json({
          erro: "Preencha consulta, valor e data do pagamento.",
        });
      }

      await pool.query(
        `
        UPDATE pagamentos
        SET
          id_consulta = $1,
          valor = $2,
          forma_pagamento = $3,
          status_pagamento = $4,
          data_pagamento = $5
        WHERE id_pagamento = $6
        `,
        [
          Number(id_consulta),
          Number(valor),
          forma_pagamento,
          status_pagamento,
          data_pagamento,
          Number(id),
        ]
      );

      return Response.json({
        mensagem: "Pagamento atualizado",
      });
    }

    if (body.tipo === "despesa") {
      const { id, descricao, categoria, valor, data_despesa } = body;

      if (!id || !descricao || !valor || !data_despesa) {
        return Response.json({
          erro: "Preencha descrição, valor e data da despesa.",
        });
      }

      await pool.query(
        `
        UPDATE despesas
        SET
          descricao = $1,
          categoria = $2,
          valor = $3,
          data_despesa = $4
        WHERE id_despesa = $5
        `,
        [descricao, categoria, Number(valor), data_despesa, Number(id)]
      );

      return Response.json({
        mensagem: "Despesa atualizada",
      });
    }

    return Response.json({
      erro: "Tipo inválido",
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();

    const { tipo, id } = body;

    if (!tipo || !id) {
      return Response.json({
        erro: "Tipo e ID são obrigatórios.",
      });
    }

    if (tipo === "pagamento") {
      await pool.query(
        `
        DELETE FROM pagamentos
        WHERE id_pagamento = $1
        `,
        [Number(id)]
      );

      return Response.json({
        mensagem: "Pagamento excluído",
      });
    }

    if (tipo === "despesa") {
      await pool.query(
        `
        DELETE FROM despesas
        WHERE id_despesa = $1
        `,
        [Number(id)]
      );

      return Response.json({
        mensagem: "Despesa excluída",
      });
    }

    return Response.json({
      erro: "Tipo inválido",
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}
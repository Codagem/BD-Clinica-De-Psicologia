import pool from "@/lib/db";

export async function GET() {
  try {
    const resumo = await pool.query(`
      SELECT * FROM vw_resumo_financeiro
    `);

    const pagamentos = await pool.query(`
      SELECT
        pg.id_pagamento,
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
          erro: "Preencha ID da consulta, valor e data do pagamento.",
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
      const {
        descricao,
        categoria,
        valor,
        data_despesa,
      } = body;

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
        [
          descricao,
          categoria,
          Number(valor),
          data_despesa,
        ]
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
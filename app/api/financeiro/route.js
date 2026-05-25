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
      ORDER BY pg.id_pagamento
    `);

    const despesas = await pool.query(`
      SELECT
        id_despesa,
        data_despesa,
        descricao,
        categoria,
        valor
      FROM despesas
      ORDER BY id_despesa
    `);

    return Response.json({
      resumo: resumo.rows[0],
      pagamentos: pagamentos.rows,
      despesas: despesas.rows,
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}
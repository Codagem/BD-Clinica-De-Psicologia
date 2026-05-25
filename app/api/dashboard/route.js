import pool from "@/lib/db";

export async function GET() {
  try {
    const pacientes = await pool.query(
      "SELECT COUNT(*) FROM pacientes"
    );

    const consultas = await pool.query(
      "SELECT COUNT(*) FROM consultas"
    );

    const financeiro = await pool.query(
      "SELECT * FROM vw_resumo_financeiro"
    );

    const estoqueBaixo = await pool.query(
      "SELECT COUNT(*) FROM vw_estoque_baixo"
    );

    return Response.json({
      pacientes: pacientes.rows[0].count,
      consultas: consultas.rows[0].count,
      receitas: financeiro.rows[0]?.total_receitas || 0,
      despesas: financeiro.rows[0]?.total_despesas || 0,
      lucro: financeiro.rows[0]?.lucro_liquido || 0,
      estoqueBaixo: estoqueBaixo.rows[0].count,
    });

  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}
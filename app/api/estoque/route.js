import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id_produto,
        nome,
        categoria,
        quantidade_atual,
        quantidade_minima,
        fornecedor
      FROM estoque
      ORDER BY id_produto
    `);

    return Response.json(result.rows);
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      nome,
      categoria,
      quantidade_atual,
      quantidade_minima,
      fornecedor,
    } = body;

    await pool.query(
      `
      INSERT INTO estoque
      (
        nome,
        categoria,
        quantidade_atual,
        quantidade_minima,
        fornecedor
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        nome,
        categoria,
        quantidade_atual,
        quantidade_minima,
        fornecedor,
      ]
    );

    return Response.json({
      mensagem: "Produto cadastrado",
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}
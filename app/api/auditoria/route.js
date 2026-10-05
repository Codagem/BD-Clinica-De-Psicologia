import pool from "@/lib/db";

export async function GET() {
  try {

    const resultado = await pool.query(`
      SELECT
        id_auditoria,
        tipo_usuario,
        id_usuario,
        acao,
        tabela_afetada,
        registro_id,
        detalhes,
        data_hora
      FROM auditoria
      ORDER BY data_hora DESC
      LIMIT 100
    `);


    return Response.json(resultado.rows);


  } catch(error) {

    console.error("Erro auditoria:", error);


    return Response.json(
      {
        erro:"Erro ao buscar auditoria."
      },
      {
        status:500
      }
    );

  }
}
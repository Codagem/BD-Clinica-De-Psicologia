// =========================================
// IMPORTAÇÃO DO BANCO
// =========================================

import db from "@/lib/db";

// =========================================
// GET - LISTAR PSICÓLOGOS
// =========================================

export async function GET() {
  try {
    const resultado = await db.query(`
      SELECT 
        id_psicologo,
        nome,
        especialidade,
        telefone,
        email
      FROM psicologos
      ORDER BY nome ASC
    `);

    return Response.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao listar psicólogos:", error);

    return Response.json(
      { erro: "Erro ao listar psicólogos." },
      { status: 500 }
    );
  }
}
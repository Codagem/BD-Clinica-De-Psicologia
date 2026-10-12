
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function verificar() {
  try {
    await client.connect();

    const resultado = await client.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE cpf IS NOT NULL AND BTRIM(cpf) <> ''
        )::int AS com_cpf,
        COUNT(*) FILTER (
          WHERE data_nascimento IS NOT NULL
        )::int AS com_nascimento
      FROM public.psicologos;
    `);

    console.table(resultado.rows);
  } catch (erro) {
    console.error("Erro na consulta:", erro.message);
  } finally {
    await client.end();
  }
}

verificar();
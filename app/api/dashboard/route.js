import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";

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

export async function GET(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao) {
      return Response.json(
        {
          erro: "Acesso não autorizado.",
        },
        { status: 403 }
      );
    }

    if (sessao.tipo_usuario !== "admin") {
      return Response.json(
        {
          erro: "Apenas o administrador pode acessar o dashboard.",
        },
        { status: 403 }
      );
    }

    const pacientes = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM pacientes
    `);

    const consultas = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM consultas
    `);

    const financeiro = await pool.query(`
      SELECT *
      FROM vw_resumo_financeiro
    `);

    const estoqueBaixo = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM vw_estoque_baixo
    `);

    const consultasSemanaBanco = await pool.query(`
      SELECT
        EXTRACT(DOW FROM data_consulta)::int AS dia_numero,
        COUNT(*)::int AS total
      FROM consultas
      GROUP BY dia_numero
      ORDER BY dia_numero
    `);

    const diasSemana = [
      { numero: 0, dia: "Dom" },
      { numero: 1, dia: "Seg" },
      { numero: 2, dia: "Ter" },
      { numero: 3, dia: "Qua" },
      { numero: 4, dia: "Qui" },
      { numero: 5, dia: "Sex" },
      { numero: 6, dia: "Sáb" },
    ];

    const consultasSemana = diasSemana.map((item) => {
      const encontrado = consultasSemanaBanco.rows.find(
        (linha) =>
          Number(linha.dia_numero) === item.numero
      );

      return {
        dia: item.dia,
        consultas: encontrado
          ? Number(encontrado.total)
          : 0,
      };
    });

    return Response.json({
      pacientes: pacientes.rows[0].total,
      consultas: consultas.rows[0].total,
      receitas:
        financeiro.rows[0]?.total_receitas || 0,
      despesas:
        financeiro.rows[0]?.total_despesas || 0,
      lucro:
        financeiro.rows[0]?.lucro_liquido || 0,
      estoqueBaixo:
        estoqueBaixo.rows[0].total,
      consultasSemana,
    });
  } catch (error) {
    console.error(
      "Erro ao carregar dashboard:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao carregar dashboard.",
      },
      { status: 500 }
    );
  }
}
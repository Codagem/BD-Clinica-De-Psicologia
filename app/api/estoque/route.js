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

function respostaNaoAutorizado(
  mensagem = "Acesso não autorizado."
) {
  return Response.json(
    {
      erro: mensagem,
    },
    {
      status: 403,
    }
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
        "Apenas o administrador pode acessar o estoque."
      );
    }

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
    console.error(
      "Erro ao carregar estoque:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao carregar estoque.",
      },
      {
        status: 500,
      }
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
        "Apenas o administrador pode cadastrar produtos."
      );
    }

    const body = await req.json();

    const {
      nome,
      categoria,
      quantidade_atual,
      quantidade_minima,
      fornecedor,
    } = body;

    if (!nome) {
      return Response.json(
        {
          erro: "O nome do produto é obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    const quantidadeAtual = Number(
      quantidade_atual
    );

    const quantidadeMinima = Number(
      quantidade_minima
    );

    if (
      !Number.isFinite(quantidadeAtual) ||
      quantidadeAtual < 0 ||
      !Number.isFinite(quantidadeMinima) ||
      quantidadeMinima < 0
    ) {
      return Response.json(
        {
          erro: "As quantidades informadas são inválidas.",
        },
        {
          status: 400,
        }
      );
    }

    const resultado = await pool.query(
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
      RETURNING id_produto, nome
      `,
      [
        nome,
        categoria || null,
        quantidadeAtual,
        quantidadeMinima,
        fornecedor || null,
      ]
    );

    const produto = resultado.rows[0];

    await registrarAuditoria({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: null,
      acao: "CADASTRO DE PRODUTO",
      tabelaAfetada: "estoque",
      registroId: produto.id_produto,
      detalhes: `Produto cadastrado: ${produto.nome}.`,
    });

    return Response.json({
      mensagem: "Produto cadastrado",
      produto,
    });
  } catch (error) {
    console.error(
      "Erro ao cadastrar produto:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao cadastrar produto.",
      },
      {
        status: 500,
      }
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
        "Apenas o administrador pode editar produtos."
      );
    }

    const body = await req.json();

    const {
      id,
      nome,
      categoria,
      quantidade_atual,
      quantidade_minima,
      fornecedor,
    } = body;

    if (!id || !nome) {
      return Response.json(
        {
          erro: "ID e nome do produto são obrigatórios.",
        },
        {
          status: 400,
        }
      );
    }

    const idProduto = Number(id);

    const quantidadeAtual = Number(
      quantidade_atual
    );

    const quantidadeMinima = Number(
      quantidade_minima
    );

    if (
      !Number.isInteger(idProduto) ||
      idProduto <= 0
    ) {
      return Response.json(
        {
          erro: "ID do produto inválido.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(quantidadeAtual) ||
      quantidadeAtual < 0 ||
      !Number.isFinite(quantidadeMinima) ||
      quantidadeMinima < 0
    ) {
      return Response.json(
        {
          erro: "As quantidades informadas são inválidas.",
        },
        {
          status: 400,
        }
      );
    }

    const resultado = await pool.query(
      `
      UPDATE estoque
      SET
        nome = $1,
        categoria = $2,
        quantidade_atual = $3,
        quantidade_minima = $4,
        fornecedor = $5
      WHERE id_produto = $6
      RETURNING id_produto, nome
      `,
      [
        nome,
        categoria || null,
        quantidadeAtual,
        quantidadeMinima,
        fornecedor || null,
        idProduto,
      ]
    );

    if (resultado.rows.length === 0) {
      return Response.json(
        {
          erro: "Produto não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    const produto = resultado.rows[0];

    await registrarAuditoria({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: null,
      acao: "ALTERAÇÃO DE PRODUTO",
      tabelaAfetada: "estoque",
      registroId: produto.id_produto,
      detalhes: `Produto alterado: ${produto.nome}.`,
    });

    return Response.json({
      mensagem: "Produto atualizado",
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar produto:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao atualizar produto.",
      },
      {
        status: 500,
      }
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
        "Apenas o administrador pode excluir produtos."
      );
    }

    const body = await req.json();

    const { id } = body;

    if (!id) {
      return Response.json(
        {
          erro: "ID do produto é obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    const idProduto = Number(id);

    if (
      !Number.isInteger(idProduto) ||
      idProduto <= 0
    ) {
      return Response.json(
        {
          erro: "ID do produto inválido.",
        },
        {
          status: 400,
        }
      );
    }

    const resultado = await pool.query(
      `
      DELETE FROM estoque
      WHERE id_produto = $1
      RETURNING id_produto, nome
      `,
      [idProduto]
    );

    if (resultado.rows.length === 0) {
      return Response.json(
        {
          erro: "Produto não encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    const produto = resultado.rows[0];

    await registrarAuditoria({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: null,
      acao: "EXCLUSÃO DE PRODUTO",
      tabelaAfetada: "estoque",
      registroId: produto.id_produto,
      detalhes: `Produto excluído: ${produto.nome}.`,
    });

    return Response.json({
      mensagem: "Produto excluído",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir produto:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao excluir produto.",
      },
      {
        status: 500,
      }
    );
  }
}
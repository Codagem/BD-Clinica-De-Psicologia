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
        "Apenas o administrador pode acessar os profissionais."
      );
    }

    const psicologosResult = await pool.query(`
      SELECT
        id_psicologo,
        nome,
        crp,
        especialidade,
        telefone,
        email,
        cpf,
        data_nascimento
      FROM psicologos
      ORDER BY nome ASC
    `);

    const estagiariosResult = await pool.query(`
      SELECT
        e.id_estagiario,
        e.nome,
        e.cpf,
        e.data_nascimento,
        e.telefone,
        e.email,
        e.faculdade,
        e.curso,
        e.periodo,
        e.supervisor_id,
        e.status,
        p.nome AS supervisor_nome
      FROM estagiarios e
      LEFT JOIN psicologos p
        ON e.supervisor_id = p.id_psicologo
      ORDER BY e.nome ASC
    `);

    return Response.json({
      psicologos: psicologosResult.rows,
      estagiarios: estagiariosResult.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);

    return Response.json(
      {
        erro: "Erro ao buscar profissionais.",
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
        "Apenas o administrador pode cadastrar profissionais."
      );
    }

    const body = await req.json();

    const {
      tipo,
      nome,
      cpf,
      data_nascimento,
      crp,
      especialidade,
      telefone,
      email,
      faculdade,
      curso,
      periodo,
      supervisor_id,
    } = body;

    if (!tipo || !nome || !cpf || !data_nascimento) {
      return Response.json(
        {
          erro: "Preencha os campos obrigatórios.",
        },
        {
          status: 400,
        }
      );
    }

    const cpfLimpo = String(cpf).replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      return Response.json(
        {
          erro: "CPF inválido.",
        },
        {
          status: 400,
        }
      );
    }

    if (tipo === "Psicólogo") {
      if (!crp) {
        return Response.json(
          {
            erro: "O CRP é obrigatório para psicólogos.",
          },
          {
            status: 400,
          }
        );
      }

      const existente = await pool.query(
        `
        SELECT id_psicologo
        FROM psicologos
        WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $1
        `,
        [cpfLimpo]
      );

      if (existente.rows.length > 0) {
        return Response.json(
          {
            erro: "Este CPF já está cadastrado.",
          },
          {
            status: 409,
          }
        );
      }

      const resultado = await pool.query(
        `
        INSERT INTO psicologos (
          nome,
          crp,
          especialidade,
          telefone,
          email,
          cpf,
          data_nascimento
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id_psicologo, nome
        `,
        [
          nome,
          crp,
          especialidade || null,
          telefone || null,
          email || null,
          cpfLimpo,
          data_nascimento,
        ]
      );

      const psicologo = resultado.rows[0];

      await registrarAuditoria({
        tipoUsuario: sessao.tipo_usuario,
        idUsuario: null,
        acao: "CADASTRO DE PSICÓLOGO",
        tabelaAfetada: "psicologos",
        registroId: psicologo.id_psicologo,
        detalhes: `Psicólogo cadastrado: ${psicologo.nome}.`,
      });

      return Response.json({
        mensagem: "Psicólogo cadastrado com sucesso.",
        profissional: psicologo,
      });
    }

    if (tipo === "Estagiário") {
      const existente = await pool.query(
        `
        SELECT id_estagiario
        FROM estagiarios
        WHERE REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') = $1
        `,
        [cpfLimpo]
      );

      if (existente.rows.length > 0) {
        return Response.json(
          {
            erro: "Este CPF já está cadastrado.",
          },
          {
            status: 409,
          }
        );
      }

      let supervisorId = null;

      if (supervisor_id) {
        supervisorId = Number(supervisor_id);

        if (
          !Number.isInteger(supervisorId) ||
          supervisorId <= 0
        ) {
          return Response.json(
            {
              erro: "Supervisor inválido.",
            },
            {
              status: 400,
            }
          );
        }

        const supervisor = await pool.query(
          `
          SELECT id_psicologo
          FROM psicologos
          WHERE id_psicologo = $1
          `,
          [supervisorId]
        );

        if (supervisor.rows.length === 0) {
          return Response.json(
            {
              erro: "Psicólogo supervisor não encontrado.",
            },
            {
              status: 404,
            }
          );
        }
      }

      const resultado = await pool.query(
        `
        INSERT INTO estagiarios (
          nome,
          cpf,
          data_nascimento,
          telefone,
          email,
          faculdade,
          curso,
          periodo,
          supervisor_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id_estagiario, nome
        `,
        [
          nome,
          cpfLimpo,
          data_nascimento,
          telefone || null,
          email || null,
          faculdade || null,
          curso || null,
          periodo || null,
          supervisorId,
        ]
      );

      const estagiario = resultado.rows[0];

      await registrarAuditoria({
        tipoUsuario: sessao.tipo_usuario,
        idUsuario: null,
        acao: "CADASTRO DE ESTAGIÁRIO",
        tabelaAfetada: "estagiarios",
        registroId: estagiario.id_estagiario,
        detalhes: `Estagiário cadastrado: ${estagiario.nome}.`,
      });

      return Response.json({
        mensagem: "Estagiário cadastrado com sucesso.",
        profissional: estagiario,
      });
    }

    return Response.json(
      {
        erro: "Tipo de profissional inválido.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error("Erro ao cadastrar profissional:", error);

    return Response.json(
      {
        erro: "Erro ao cadastrar profissional.",
      },
      {
        status: 500,
      }
    );
  }
}
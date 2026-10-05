import pool from "@/lib/db";
import { verificarPaciente } from "../auth/verificar-acesso";
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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idPaciente = searchParams.get("id_paciente");

    if (!idPaciente) {
      return Response.json(
        {
          erro: "ID do paciente não informado.",
        },
        { status: 400 }
      );
    }

    const idPacienteNumero = Number(idPaciente);

    if (
      !Number.isInteger(idPacienteNumero) ||
      idPacienteNumero <= 0
    ) {
      return Response.json(
        {
          erro: "ID do paciente inválido.",
        },
        { status: 400 }
      );
    }

    const sessao = await obterSessao(req);

    if (
      !sessao ||
      sessao.tipo_usuario !== "paciente" ||
      Number(sessao.id_paciente) !== idPacienteNumero
    ) {
      return Response.json(
        {
          erro: "Acesso não autorizado.",
        },
        { status: 403 }
      );
    }

    const acesso = await verificarPaciente(idPacienteNumero);

    if (!acesso.autorizado) {
      return Response.json(
        {
          erro: acesso.erro,
        },
        { status: 403 }
      );
    }

    const paciente = await pool.query(
      `
      SELECT
        id_paciente,
        nome_completo,
        cpf,
        data_nascimento,
        telefone,
        email,
        profissao
      FROM pacientes
      WHERE id_paciente = $1
      `,
      [idPacienteNumero]
    );

    if (paciente.rows.length === 0) {
      return Response.json(
        {
          erro: "Paciente não encontrado.",
        },
        { status: 404 }
      );
    }

    const consultas = await pool.query(
      `
      SELECT
        c.id_consulta,
        c.data_consulta,
        c.horario,
        c.tipo_atendimento,
        c.status_consulta,
        c.observacoes,
        ps.nome AS psicologo
      FROM consultas c
      JOIN psicologos ps
        ON c.id_psicologo = ps.id_psicologo
      WHERE c.id_paciente = $1
      ORDER BY c.data_consulta DESC, c.horario DESC
      `,
      [idPacienteNumero]
    );

    return Response.json({
      paciente: paciente.rows[0],
      consultas: consultas.rows,
    });
  } catch (error) {
    console.error(
      "Erro ao carregar dados do paciente:",
      error
    );

    return Response.json(
      {
        erro: "Erro ao carregar dados do paciente.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const sessao = await obterSessao(req);

    if (!sessao || sessao.tipo_usuario !== "paciente") {
      return Response.json(
        {
          erro: "Acesso não autorizado.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (body.tipo !== "confirmar_consulta") {
      return Response.json(
        {
          erro: "Tipo de ação inválido.",
        },
        { status: 400 }
      );
    }

    const { id_consulta, status_consulta } = body;

    if (!id_consulta || !status_consulta) {
      return Response.json(
        {
          erro: "Dados inválidos.",
        },
        { status: 400 }
      );
    }

    const idConsulta = Number(id_consulta);

    if (!Number.isInteger(idConsulta) || idConsulta <= 0) {
      return Response.json(
        {
          erro: "ID da consulta inválido.",
        },
        { status: 400 }
      );
    }

    const statusPermitidos = [
      "Confirmado",
      "Cancelado",
    ];

    if (!statusPermitidos.includes(status_consulta)) {
      return Response.json(
        {
          erro: "Status de consulta não permitido para o paciente.",
        },
        { status: 400 }
      );
    }

    // O paciente só pode alterar a própria consulta.
    // Além disso, consultas já finalizadas ou canceladas
    // não podem ser alteradas pelo paciente.
    const consultaAtual = await pool.query(
      `
      SELECT
        id_consulta,
        status_consulta
      FROM consultas
      WHERE id_consulta = $1
      AND id_paciente = $2
      `,
      [
        idConsulta,
        Number(sessao.id_paciente),
      ]
    );

    if (consultaAtual.rows.length === 0) {
      return Response.json(
        {
          erro:
            "Consulta não encontrada ou não pertence ao paciente.",
        },
        { status: 403 }
      );
    }

    const statusAtual = consultaAtual.rows[0].status_consulta;

    const statusBloqueados = [
      "Realizado",
      "Cancelada",
    ];

    if (statusBloqueados.includes(statusAtual)) {
      return Response.json(
        {
          erro:
            "Esta consulta não pode mais ser alterada pelo paciente.",
        },
        { status: 403 }
      );
    }

    const consulta = await pool.query(
      `
      UPDATE consultas
      SET status_consulta = $1
      WHERE id_consulta = $2
      AND id_paciente = $3
      RETURNING id_consulta, status_consulta
      `,
      [
        status_consulta,
        idConsulta,
        Number(sessao.id_paciente),
      ]
    );

    if (consulta.rows.length === 0) {
      return Response.json(
        {
          erro:
            "Consulta não encontrada ou não pertence ao paciente.",
        },
        { status: 403 }
      );
    }

    await registrarAuditoria({
      tipoUsuario: sessao.tipo_usuario,
      idUsuario: Number(sessao.id_paciente),
      acao: "ALTERAÇÃO DE CONSULTA",
      tabelaAfetada: "consultas",
      registroId: idConsulta,
      detalhes:
        `Paciente alterou o status da consulta para: ${status_consulta}.`,
    });

    return Response.json({
      mensagem: "Consulta atualizada com sucesso.",
    });
  } catch (error) {
    console.error("Erro na API do paciente:", error);

    return Response.json(
      {
        erro: "Erro ao processar a solicitação.",
      },
      { status: 500 }
    );
  }
}
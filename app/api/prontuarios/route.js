
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { registrarAuditoria } from "@/lib/auditoria";

// Lê e valida a sessão autenticada.
async function obterSessao(request) {
  try {
    const token = request.cookies.get("sessao")?.value;

    if (!token) return null;

    return await verificarSessao(token);
  } catch {
    return null;
  }
}

function converterId(valor) {
  const id = Number(valor);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function normalizarStatus(valor) {
  return String(valor || "").trim().toLowerCase();
}

// GET /api/prontuarios?id_paciente=123
export async function GET(request) {
  try {
    const sessao = await obterSessao(request);

    if (!sessao) {
      return NextResponse.json(
        { erro: "Sessão não autenticada." },
        { status: 401 }
      );
    }

    const tipo = sessao.tipo_usuario;

    if (!["admin", "psicologo"].includes(tipo)) {
      return NextResponse.json(
        { erro: "Você não tem permissão para consultar prontuários." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idPacienteInformado = searchParams.get("id_paciente");

    let sql = `
      SELECT
        pr.id_prontuario,
        pr.id_paciente,
        pr.id_psicologo,
        pr.id_consulta,
        pr.relato_sessao,
        pr.observacoes_clinicas,
        pr.plano_proxima_sessao,
        pr.data_cadastro,
        p.nome_completo AS nome_paciente,
        c.data_consulta,
        c.horario,
        c.status_consulta
      FROM prontuarios pr
      INNER JOIN pacientes p
        ON p.id_paciente = pr.id_paciente
      INNER JOIN consultas c
        ON c.id_consulta = pr.id_consulta
      WHERE 1 = 1
    `;

    const parametros = [];

    if (tipo === "psicologo") {
      const idPsicologo = converterId(sessao.id_psicologo);

      if (!idPsicologo) {
        return NextResponse.json(
          { erro: "Não foi possível identificar o psicólogo." },
          { status: 403 }
        );
      }

      parametros.push(idPsicologo);
      sql += ` AND pr.id_psicologo = $${parametros.length}`;
    }

    if (idPacienteInformado) {
      const idPaciente = converterId(idPacienteInformado);

      if (!idPaciente) {
        return NextResponse.json(
          { erro: "ID do paciente inválido." },
          { status: 400 }
        );
      }

      parametros.push(idPaciente);
      sql += ` AND pr.id_paciente = $${parametros.length}`;
    }

    sql += " ORDER BY c.data_consulta DESC, c.horario DESC, pr.id_prontuario DESC";

    const resultado = await pool.query(sql, parametros);

    return NextResponse.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao consultar prontuários:", error);

    return NextResponse.json(
      { erro: "Não foi possível carregar os prontuários." },
      { status: 500 }
    );
  }
}

// POST /api/prontuarios
export async function POST(request) {
  try {
    const sessao = await obterSessao(request);

    if (!sessao) {
      return NextResponse.json(
        { erro: "Sessão não autenticada." },
        { status: 401 }
      );
    }

    if (sessao.tipo_usuario !== "psicologo") {
      return NextResponse.json(
        { erro: "Somente o psicólogo responsável pode registrar a evolução." },
        { status: 403 }
      );
    }

    const idPsicologo = converterId(sessao.id_psicologo);

    if (!idPsicologo) {
      return NextResponse.json(
        { erro: "Não foi possível identificar o psicólogo." },
        { status: 403 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { erro: "Os dados enviados são inválidos." },
        { status: 400 }
      );
    }

    const idConsulta = converterId(body.id_consulta);
    const relatoSessao = String(body.relato_sessao || "").trim();
    const observacoesClinicas = String(
      body.observacoes_clinicas || ""
    ).trim();
    const planoProximaSessao = String(
      body.plano_proxima_sessao || ""
    ).trim();

    if (!idConsulta) {
      return NextResponse.json(
        { erro: "Selecione uma consulta válida." },
        { status: 400 }
      );
    }

    if (!relatoSessao) {
      return NextResponse.json(
        { erro: "Descreva o relato da sessão." },
        { status: 400 }
      );
    }

    if (
      relatoSessao.length > 20000 ||
      observacoesClinicas.length > 20000 ||
      planoProximaSessao.length > 20000
    ) {
      return NextResponse.json(
        { erro: "Um dos campos ultrapassou o limite permitido." },
        { status: 400 }
      );
    }

    // A consulta precisa pertencer ao psicólogo autenticado.
    const consultaResultado = await pool.query(
      `
        SELECT
          id_consulta,
          id_paciente,
          id_psicologo,
          status_consulta
        FROM consultas
        WHERE id_consulta = $1
          AND id_psicologo = $2
        LIMIT 1
      `,
      [idConsulta, idPsicologo]
    );

    if (consultaResultado.rows.length === 0) {
      return NextResponse.json(
        { erro: "Consulta não encontrada ou sem autorização." },
        { status: 403 }
      );
    }

    const consulta = consultaResultado.rows[0];

    if (
      normalizarStatus(consulta.status_consulta) !== "realizado" &&
      normalizarStatus(consulta.status_consulta) !== "realizada"
    ) {
      return NextResponse.json(
        {
          erro: "Só é possível registrar a evolução de uma consulta realizada.",
        },
        { status: 400 }
      );
    }

    const resultado = await pool.query(
      `
        INSERT INTO prontuarios (
          id_paciente,
          id_psicologo,
          id_consulta,
          relato_sessao,
          observacoes_clinicas,
          plano_proxima_sessao
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        consulta.id_paciente,
        idPsicologo,
        idConsulta,
        relatoSessao,
        observacoesClinicas || null,
        planoProximaSessao || null,
      ]
    );

    const prontuario = resultado.rows[0];

    await registrarAuditoria({
      tipoUsuario: "psicologo",
      idUsuario: idPsicologo,
      acao: "CRIAR",
      tabelaAfetada: "prontuarios",
      registroId: prontuario.id_prontuario,
      detalhes: `Evolução clínica registrada para a consulta ${idConsulta}.`,
    });

    return NextResponse.json(
      {
        mensagem: "Evolução clínica registrada com sucesso.",
        prontuario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar evolução clínica:", error);

    return NextResponse.json(
      { erro: "Não foi possível registrar a evolução clínica." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { registrarAuditoria } from "@/lib/auditoria";

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("sessao")?.value;

    if (!token) {
      return NextResponse.json(
        { erro: "Sessão não autenticada." },
        { status: 401 }
      );
    }

    const sessao = await verificarSessao(token);

    if (sessao.tipo_usuario !== "psicologo") {
      return NextResponse.json(
        { erro: "Acesso permitido somente ao psicólogo." },
        { status: 403 }
      );
    }

    const idPsicologo = Number(
      sessao.id_psicologo ??
      sessao.usuario?.id_psicologo ??
      sessao.id_usuario
    );

    const { id } = await params;
    const idPaciente = Number(id);

    if (
      !Number.isSafeInteger(idPsicologo) ||
      idPsicologo <= 0 ||
      !Number.isSafeInteger(idPaciente) ||
      idPaciente <= 0
    ) {
      return NextResponse.json(
        { erro: "Identificador inválido." },
        { status: 400 }
      );
    }

    // Confere o vínculo antes de liberar qualquer dado clínico.
    const pacienteResultado = await pool.query(
      `
        SELECT
          p.id_paciente,
          p.nome_completo,
          p.data_nascimento,
          p.cpf,
          p.telefone,
          p.profissao
        FROM pacientes p
        WHERE p.id_paciente = $1
          AND EXISTS (
            SELECT 1
            FROM consultas c
            WHERE c.id_paciente = p.id_paciente
              AND c.id_psicologo = $2
          )
        LIMIT 1
      `,
      [idPaciente, idPsicologo]
    );

    if (pacienteResultado.rows.length === 0) {
      return NextResponse.json(
        { erro: "Paciente não encontrado ou sem vínculo com você." },
        { status: 404 }
      );
    }

    const [anamnesesResultado, consultasResultado, prontuariosResultado] =
      await Promise.all([
        pool.query(
          `
            SELECT *
            FROM anamneses
            WHERE id_paciente = $1
            ORDER BY data_cadastro DESC, id_anamnese DESC
          `,
          [idPaciente]
        ),

        pool.query(
          `
            SELECT
              c.id_consulta,
              c.id_paciente,
              c.data_consulta,
              c.horario,
              c.tipo_atendimento,
              c.status_consulta,
              c.observacoes
            FROM consultas c
            WHERE c.id_paciente = $1
              AND c.id_psicologo = $2
            ORDER BY c.data_consulta DESC, c.horario DESC
          `,
          [idPaciente, idPsicologo]
        ),

        pool.query(
          `
            SELECT
              pr.id_prontuario,
              pr.id_paciente,
              pr.id_consulta,
              pr.relato_sessao,
              pr.observacoes_clinicas,
              pr.plano_proxima_sessao,
              pr.data_cadastro,
              c.data_consulta,
              c.horario,
              c.status_consulta
            FROM prontuarios pr
            INNER JOIN consultas c
              ON c.id_consulta = pr.id_consulta
            WHERE pr.id_paciente = $1
              AND pr.id_psicologo = $2
            ORDER BY c.data_consulta DESC, c.horario DESC,
                     pr.id_prontuario DESC
          `,
          [idPaciente, idPsicologo]
        ),
      ]);

    await registrarAuditoria({
      tipoUsuario: "psicologo",
      idUsuario: idPsicologo,
      acao: "CONSULTAR_FICHA",
      tabelaAfetada: "pacientes",
      registroId: idPaciente,
      detalhes: "Ficha clínica consultada pelo psicólogo responsável.",
    });

    return NextResponse.json({
      paciente: pacienteResultado.rows[0],
      anamneses: anamnesesResultado.rows,
      consultas: consultasResultado.rows,
      prontuarios: prontuariosResultado.rows,
    });
  } catch (error) {
    console.error("Erro ao carregar ficha clínica:", error);

    return NextResponse.json(
      { erro: "Não foi possível carregar a ficha clínica." },
      { status: 500 }
    );
  }
}
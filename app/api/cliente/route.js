import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { verificarPaciente } from "../auth/verificar-acesso";
import { registrarAuditoria } from "@/lib/auditoria";

const STATUS_OCUPADOS = [
  "Pendente de confirmação",
  "Agendada",
  "Agendado",
  "Confirmado",
];

const PRECO_CONSULTA = 180;
const DURACAO_MINUTOS = 60;

async function obterSessao(req) {
  const cookie = req.headers.get("cookie") || "";

  const sessaoCookie = cookie
    .split(";")
    .find((item) => item.trim().startsWith("sessao="));

  const token = sessaoCookie
    ? sessaoCookie.trim().substring("sessao=".length)
    : null;

  if (!token) return null;

  return verificarSessao(token);
}

function dataValida(valor) {
  if (
    typeof valor !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return false;
  }

  const data = new Date(`${valor}T00:00:00Z`);

  return (
    !Number.isNaN(data.getTime()) &&
    data.toISOString().slice(0, 10) === valor
  );
}

function dataAtualRecife() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Recife",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value])
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
}

function diaUtil(dataTexto) {
  const dia = new Date(`${dataTexto}T12:00:00Z`).getUTCDay();
  return dia >= 1 && dia <= 5;
}

function dataPermitida(dataTexto) {
  return (
    dataValida(dataTexto) &&
    dataTexto >= dataAtualRecife() &&
    diaUtil(dataTexto)
  );
}

function horarioPermitido(horario) {
  return (
    typeof horario === "string" &&
    /^(08|09|10|11|12|13|14|15|16|17):00$/.test(horario)
  );
}

function erro(mensagem, status = 400) {
  return Response.json({ erro: mensagem }, { status });
}

async function autenticarPaciente(req) {
  const sessao = await obterSessao(req);

  if (
    !sessao ||
    sessao.tipo_usuario !== "paciente" ||
    !Number.isInteger(Number(sessao.id_paciente)) ||
    Number(sessao.id_paciente) <= 0
  ) {
    return {
      erro: erro("Sessão de paciente inválida ou expirada.", 401),
    };
  }

  const idPaciente = Number(sessao.id_paciente);
  const acesso = await verificarPaciente(idPaciente);

  if (!acesso.autorizado) {
    return {
      erro: erro(acesso.erro || "Acesso não autorizado.", 403),
    };
  }

  return { sessao, idPaciente };
}

/*
 * GET
 * Lista os psicólogos e, quando recebe data e psicólogo,
 * retorna somente os horários livres.
 */
export async function GET(req) {
  try {
    const autenticacao = await autenticarPaciente(req);

    if (autenticacao.erro) return autenticacao.erro;

    const { searchParams } = new URL(req.url);
    const data = searchParams.get("data");
    const idPsicologoTexto = searchParams.get("id_psicologo");

    const psicologosResult = await pool.query(`
      SELECT id_psicologo, nome, especialidade
      FROM psicologos
      ORDER BY nome
    `);

    const resposta = {
      psicologos: psicologosResult.rows,
      horarios: [],
    };

    if (!data && !idPsicologoTexto) {
      return Response.json(resposta);
    }

    if (!dataPermitida(data)) {
      return erro(
        "Escolha uma data de segunda a sexta-feira, a partir de hoje."
      );
    }

    const idPsicologo = Number(idPsicologoTexto);

    if (!Number.isInteger(idPsicologo) || idPsicologo <= 0) {
      return erro("Selecione um psicólogo válido.");
    }

    const psicologoExiste = psicologosResult.rows.some(
      (psicologo) =>
        Number(psicologo.id_psicologo) === idPsicologo
    );

    if (!psicologoExiste) {
      return erro("Psicólogo não encontrado.", 404);
    }

    const horariosPossiveis = [];

    for (let hora = 8; hora <= 17; hora++) {
      horariosPossiveis.push(
        `${String(hora).padStart(2, "0")}:00`
      );
    }

    for (const horario of horariosPossiveis) {
      const ocupado = await pool.query(
        `
        SELECT EXISTS (
          SELECT 1
          FROM consultas c
          WHERE c.data_consulta = $1::date
            AND c.status_consulta = ANY($4::varchar[])
            AND (
              c.id_psicologo = $2
              OR c.id_paciente = $3
            )
            AND c.data_consulta + c.horario
                  < $1::date + $5::time + interval '60 minutes'
            AND c.data_consulta + c.horario
                  + interval '60 minutes' > $1::date + $5::time
        ) AS ocupado
        `,
        [
          data,
          idPsicologo,
          autenticacao.idPaciente,
          STATUS_OCUPADOS,
          horario,
        ]
      );

      if (!ocupado.rows[0].ocupado) {
        resposta.horarios.push(horario);
      }
    }

    return Response.json(resposta);
  } catch (error) {
    console.error("Erro ao consultar horários:", error);

    return erro("Não foi possível carregar os horários disponíveis.", 500);
  }
}

/*
 * POST
 * Registra uma solicitação pendente.
 * Não cria pagamento e não marca a consulta como paga.
 */
export async function POST(req) {
  try {
    const autenticacao = await autenticarPaciente(req);

    if (autenticacao.erro) return autenticacao.erro;

    let body;

    try {
      body = await req.json();
    } catch {
      return erro("Corpo da solicitação inválido.");
    }

    const idPsicologo = Number(body.id_psicologo);
    const data = body.data_consulta;
    const horario = body.horario;

    if (!Number.isInteger(idPsicologo) || idPsicologo <= 0) {
      return erro("Selecione um psicólogo válido.");
    }

    if (!dataPermitida(data)) {
      return erro(
        "A data deve ser um dia útil a partir de hoje."
      );
    }

    if (!horarioPermitido(horario)) {
      return erro(
        "Escolha um horário entre 08:00 e 17:00, em intervalos de uma hora."
      );
    }

    const psicologo = await pool.query(
      `
      SELECT id_psicologo
      FROM psicologos
      WHERE id_psicologo = $1
      `,
      [idPsicologo]
    );

    if (psicologo.rowCount === 0) {
      return erro("Psicólogo não encontrado.", 404);
    }

    const resultado = await pool.query(
      `
      INSERT INTO consultas (
        id_paciente,
        id_psicologo,
        data_consulta,
        horario,
        tipo_atendimento,
        status_consulta,
        observacoes
      )
      VALUES ($1, $2, $3::date, $4::time, $5, $6, $7)
      RETURNING
        id_consulta,
        id_paciente,
        id_psicologo,
        data_consulta,
        horario,
        tipo_atendimento,
        status_consulta,
        observacoes
      `,
      [
        autenticacao.idPaciente,
        idPsicologo,
        data,
        horario,
        "Presencial",
        "Pendente de confirmação",
        `Solicitação pelo portal. Duração: ${DURACAO_MINUTOS} minutos. Valor: R$ ${PRECO_CONSULTA},00. Pagamento presencial na clínica.`,
      ]
    );

    try {
      await registrarAuditoria({
        tipoUsuario: "paciente",
        idUsuario: autenticacao.idPaciente,
        acao: "SOLICITAR AGENDAMENTO",
        tabelaAfetada: "consultas",
        registroId: resultado.rows[0].id_consulta,
        detalhes:
          "Solicitação de consulta presencial registrada como pendente de confirmação.",
      });
    } catch (auditError) {
      console.error("Falha ao registrar auditoria:", auditError);
    }

    return Response.json(
      {
        mensagem:
          "Solicitação enviada! Aguarde a confirmação da clínica.",
        consulta: resultado.rows[0],
        valor: PRECO_CONSULTA,
        duracao_minutos: DURACAO_MINUTOS,
        pagamento: "Presencial na clínica",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === "23P01") {
      return erro(
        "Esse horário acabou de ser ocupado para você ou para o psicólogo. Escolha outro horário.",
        409
      );
    }

    console.error("Erro ao solicitar agendamento:", error);

    return erro("Não foi possível registrar o agendamento.", 500);
  }
}
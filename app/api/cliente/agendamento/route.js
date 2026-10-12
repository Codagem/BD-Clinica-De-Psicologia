import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { verificarPaciente } from "@/app/api/auth/verificar-acesso";
import { registrarAuditoria } from "@/lib/auditoria";

const STATUS_OCUPADOS = [
  "Pendente de confirmação",
  "Agendada",
  "Agendado",
  "Confirmado",
];

const PRECO_CONSULTA = 180;
const DURACAO_MINUTOS = 60;

function erro(mensagem, status = 400) {
  return Response.json({ erro: mensagem }, { status });
}

// Data (YYYY-MM-DD) e hora atuais no fuso de Recife.
function agoraRecife() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Recife",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valor = (tipo) => partes.find((p) => p.type === tipo).value;

  return {
    data: `${valor("year")}-${valor("month")}-${valor("day")}`,
    hora: Number(valor("hour")),
  };
}

async function autenticarPaciente(req) {
  const cookie = req.headers.get("cookie") || "";
  const item = cookie
    .split(";")
    .find((parte) => parte.trim().startsWith("sessao="));

  const token = item ? item.trim().substring("sessao=".length) : null;

  if (!token) {
    return { erro: erro("Faça login novamente para continuar.", 401) };
  }

  const sessao = await verificarSessao(token);

  if (
    !sessao ||
    sessao.tipo_usuario !== "paciente" ||
    !Number.isInteger(Number(sessao.id_paciente)) ||
    Number(sessao.id_paciente) <= 0
  ) {
    return { erro: erro("Sessão de paciente inválida ou expirada.", 401) };
  }

  const idPaciente = Number(sessao.id_paciente);
  const acesso = await verificarPaciente(idPaciente);

  if (!acesso.autorizado) {
    return { erro: erro(acesso.erro || "Acesso não autorizado.", 403) };
  }

  return { idPaciente };
}

function dataValida(data) {
  if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const d = new Date(`${data}T00:00:00Z`);

  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== data) {
    return false;
  }

  const diaSemana = d.getUTCDay();

  return data >= agoraRecife().data && diaSemana >= 1 && diaSemana <= 5;
}

function horarioValido(horario) {
  return (
    typeof horario === "string" &&
    /^(08|09|10|11|12|13|14|15|16|17):00$/.test(horario)
  );
}

// Retorna true se o horário já começou no dia de hoje.
function horarioPassou(data, horario) {
  const agora = agoraRecife();
  return data === agora.data && Number(horario.slice(0, 2)) <= agora.hora;
}

async function buscarPsicologos() {
  const resultado = await pool.query(`
    SELECT id_psicologo, nome, especialidade
    FROM psicologos
    ORDER BY nome
  `);

  return resultado.rows;
}

async function horarioOcupado(data, horario, idPsicologo, idPaciente) {
  const resultado = await pool.query(
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
        AND c.data_consulta + c.horario + interval '60 minutes'
            > $1::date + $5::time
    ) AS ocupado
    `,
    [data, idPsicologo, idPaciente, STATUS_OCUPADOS, horario]
  );

  return resultado.rows[0].ocupado;
}

export async function GET(req) {
  try {
    const autenticacao = await autenticarPaciente(req);
    if (autenticacao.erro) return autenticacao.erro;

    const { searchParams } = new URL(req.url);
    const data = searchParams.get("data");
    const idPsicologoTexto = searchParams.get("id_psicologo");

    const psicologos = await buscarPsicologos();

    if (!data && !idPsicologoTexto) {
      return Response.json({ psicologos, horarios: [] });
    }

    if (!dataValida(data)) {
      return erro(
        "Escolha uma data válida de segunda a sexta-feira, a partir de hoje."
      );
    }

    const idPsicologo = Number(idPsicologoTexto);

    if (!Number.isInteger(idPsicologo) || idPsicologo <= 0) {
      return erro("Selecione um psicólogo válido.");
    }

    if (!psicologos.some((p) => Number(p.id_psicologo) === idPsicologo)) {
      return erro("Psicólogo não encontrado.", 404);
    }

    const horarios = [];

    for (let hora = 8; hora <= 17; hora++) {
      const horario = `${String(hora).padStart(2, "0")}:00`;

      if (horarioPassou(data, horario)) continue;

      const ocupado = await horarioOcupado(
        data,
        horario,
        idPsicologo,
        autenticacao.idPaciente
      );

      if (!ocupado) horarios.push(horario);
    }

    return Response.json({ psicologos, horarios });
  } catch (error) {
    console.error("Erro ao carregar agendamento:", error);
    return erro("Não foi possível carregar os psicólogos ou horários.", 500);
  }
}

export async function POST(req) {
  try {
    const autenticacao = await autenticarPaciente(req);
    if (autenticacao.erro) return autenticacao.erro;

    let body;

    try {
      body = await req.json();
    } catch {
      return erro("Dados do agendamento inválidos.");
    }

    const idPsicologo = Number(body.id_psicologo);
    const data = body.data_consulta;
    const horario = body.horario;

    if (!Number.isInteger(idPsicologo) || idPsicologo <= 0) {
      return erro("Selecione um psicólogo válido.");
    }

    if (!dataValida(data)) {
      return erro(
        "Escolha uma data válida de segunda a sexta-feira, a partir de hoje."
      );
    }

    if (!horarioValido(horario)) {
      return erro("Escolha um horário entre 08:00 e 17:00.");
    }

    if (horarioPassou(data, horario)) {
      return erro("Esse horário já passou. Escolha outro horário.");
    }

    const psicologo = await pool.query(
      "SELECT id_psicologo FROM psicologos WHERE id_psicologo = $1",
      [idPsicologo]
    );

    if (psicologo.rowCount === 0) {
      return erro("Psicólogo não encontrado.", 404);
    }

    const ocupado = await horarioOcupado(
      data,
      horario,
      idPsicologo,
      autenticacao.idPaciente
    );

    if (ocupado) {
      return erro("Esse horário já está ocupado. Escolha outro horário.", 409);
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
        detalhes: "Solicitação presencial pendente de confirmação.",
      });
    } catch (auditError) {
      console.error("Falha ao registrar auditoria:", auditError);
    }

    return Response.json(
      {
        mensagem: "Solicitação enviada! Aguarde a confirmação da clínica.",
        consulta: resultado.rows[0],
        valor: PRECO_CONSULTA,
        duracao_minutos: DURACAO_MINUTOS,
        pagamento: "Presencial na clínica",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === "23P01" || error?.code === "23505") {
      return erro("Esse horário já está ocupado. Escolha outro horário.", 409);
    }

    console.error("Erro ao solicitar agendamento:", error);
    return erro("Não foi possível registrar o agendamento.", 500);
  }
}
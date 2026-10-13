
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { verificarSessao } from "@/lib/sessao";
import { verificarPaciente } from "../auth/verificar-acesso";
import { registrarAuditoria } from "@/lib/auditoria";

// Status que ocupam um horário.
// Mantive a grafia antiga para compatibilidade com os registros existentes.
const STATUS_OCUPADOS = [
  "Pendente de confirmação",
  "Pendente de confirmação",
  "Agendada",
  "Agendado",
  "Confirmado",
];

const PRECO_CONSULTA = 180;
const DURACAO_MINUTOS = 60;

// ============================================================
// HELPERS
// ============================================================

function erro(mensagem, status = 400) {
  return Response.json({ erro: mensagem }, { status });
}

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

// Aceita datas de nascimento nos formatos AAAA-MM-DD ou DD/MM/AAAA.
function normalizarDataSenha(valor) {
  const texto = String(valor || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto;
  }

  const partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (partes) {
    return `${partes[3]}-${partes[2]}-${partes[1]}`;
  }

  return "";
}

// ============================================================
// DADOS DO PACIENTE AUTENTICADO
// ============================================================

async function carregarPerfilEConsultas(idPaciente) {
  const pacienteResult = await pool.query(
    `
    SELECT
      id_paciente,
      nome_completo,
      cpf,
      telefone,
      email,
      profissao,
      data_nascimento
    FROM pacientes
    WHERE id_paciente = $1
    `,
    [idPaciente]
  );

  if (pacienteResult.rowCount === 0) {
    return null;
  }

  const consultasResult = await pool.query(
    `
    SELECT
      c.id_consulta,
      c.id_paciente,
      c.id_psicologo,
      c.data_consulta,
      c.horario,
      c.tipo_atendimento,
      c.status_consulta,
      c.observacoes,
      p.nome AS psicologo
    FROM consultas c
    LEFT JOIN psicologos p
      ON p.id_psicologo = c.id_psicologo
    WHERE c.id_paciente = $1
    ORDER BY c.data_consulta DESC, c.horario DESC
    `,
    [idPaciente]
  );

  return {
    paciente: pacienteResult.rows[0],
    consultas: consultasResult.rows,
  };
}

// ============================================================
// GET
// Carrega perfil, consultas, psicólogos e horários disponíveis.
// ============================================================

export async function GET(req) {
  try {
    const autenticacao = await autenticarPaciente(req);

    if (autenticacao.erro) return autenticacao.erro;

    const { searchParams } = new URL(req.url);
    const data = searchParams.get("data");
    const idPsicologoTexto = searchParams.get("id_psicologo");

    const dados = await carregarPerfilEConsultas(
      autenticacao.idPaciente
    );

    if (!dados) {
      return erro("Paciente não encontrado.", 404);
    }

    const psicologosResult = await pool.query(`
      SELECT
        id_psicologo,
        nome,
        especialidade
      FROM psicologos
      ORDER BY nome
    `);

    const resposta = {
      paciente: dados.paciente,
      consultas: dados.consultas,
      psicologos: psicologosResult.rows,
      horarios: [],
    };

    // Sem filtros de horário, retorna os dados do portal.
    if (!data && !idPsicologoTexto) {
      return Response.json(resposta, {
        headers: { "Cache-Control": "no-store" },
      });
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

    return Response.json(resposta, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Erro na API do portal do paciente:", error);

    return erro("Não foi possível carregar os dados do paciente.", 500);
  }
}

// ============================================================
// POST
// Registra uma solicitação de consulta.
// ============================================================

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
      return erro("A data deve ser um dia útil a partir de hoje.");
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
        "Pendente de confirmaÃ§Ã£o",
        `Solicitação pelo portal. Duração: ${DURACAO_MINUTOS} minutos. Valor: R$ ${PRECO_CONSULTA},00. Pagamento presencial na clínica.`,
      ]
    );

    await registrarAuditoria({
      tipoUsuario: "paciente",
      idUsuario: autenticacao.idPaciente,
      acao: "SOLICITAR AGENDAMENTO",
      tabelaAfetada: "consultas",
      registroId: resultado.rows[0].id_consulta,
      detalhes: "Solicitação de consulta pelo portal do paciente.",
    });

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

// ============================================================
// PUT
// Permite alterar a senha ou confirmar uma consulta do próprio
// paciente. O ID do paciente sempre vem da sessão autenticada.
// ============================================================

export async function PUT(req) {
  try {
    const autenticacao = await autenticarPaciente(req);

    if (autenticacao.erro) return autenticacao.erro;

    let body;

    try {
      body = await req.json();
    } catch {
      return erro("Corpo da solicitação inválido.");
    }

    const idPaciente = autenticacao.idPaciente;

    // --------------------------------------------------------
    // ALTERAÇÃO DE SENHA
    // --------------------------------------------------------

    if (body.tipo === "alterar_senha") {
      const senhaAtual = String(body.senha_atual || "");
      const novaSenha = String(body.nova_senha || "");
      const confirmarSenha = String(body.confirmar_senha || "");

      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        return erro("Preencha todos os campos de senha.");
      }

      if (novaSenha.length < 8) {
        return erro("A nova senha deve ter pelo menos 8 caracteres.");
      }

      if (novaSenha.length > 72) {
        return erro("A nova senha excede o limite permitido.");
      }

      if (novaSenha !== confirmarSenha) {
        return erro("A confirmação da nova senha não confere.");
      }

      if (senhaAtual === novaSenha) {
        return erro("A nova senha deve ser diferente da senha atual.");
      }

      const pacienteResult = await pool.query(
        `
        SELECT
          id_paciente,
          data_nascimento,
          senha_hash
        FROM pacientes
        WHERE id_paciente = $1
        `,
        [idPaciente]
      );

      if (pacienteResult.rowCount === 0) {
        return erro("Paciente não encontrado.", 404);
      }

      const paciente = pacienteResult.rows[0];
      let senhaAtualValida = false;

      // Login de pacientes que já possuem senha criptografada.
      if (paciente.senha_hash) {
        try {
          senhaAtualValida = await bcrypt.compare(
            senhaAtual,
            paciente.senha_hash
          );
        } catch (error) {
          console.error("Erro ao verificar senha do paciente:", error);
          return erro("Não foi possível verificar a senha atual.", 500);
        }
      } else if (paciente.data_nascimento) {
        // Compatibilidade com o primeiro acesso usando nascimento.
        const dataBanco =
          paciente.data_nascimento instanceof Date
            ? paciente.data_nascimento.toISOString().slice(0, 10)
            : String(paciente.data_nascimento).slice(0, 10);

        senhaAtualValida =
          normalizarDataSenha(senhaAtual) === dataBanco;
      }

      if (!senhaAtualValida) {
        return erro("A senha atual está incorreta.", 401);
      }

      const novoHash = await bcrypt.hash(novaSenha, 12);

      await pool.query(
        `
        UPDATE pacientes
        SET senha_hash = $1
        WHERE id_paciente = $2
        `,
        [novoHash, idPaciente]
      );

      await registrarAuditoria({
        tipoUsuario: "paciente",
        idUsuario: idPaciente,
        acao: "ALTERAR SENHA",
        tabelaAfetada: "pacientes",
        registroId: idPaciente,
        detalhes: "Senha do paciente alterada pelo próprio portal.",
      });

      return Response.json({
        mensagem: "Senha alterada com sucesso.",
      });
    }

    // --------------------------------------------------------
    // CONFIRMAÇÃO DE PRESENÇA
    // --------------------------------------------------------

    if (body.tipo === "confirmar_consulta") {
      const idConsulta = Number(body.id_consulta);

      if (!Number.isInteger(idConsulta) || idConsulta <= 0) {
        return erro("Consulta inválida.");
      }

      // A consulta só pode ser confirmada pelo paciente a quem pertence.
      const atualizacao = await pool.query(
        `
        UPDATE consultas
        SET status_consulta = 'Confirmado'
        WHERE id_consulta = $1
          AND id_paciente = $2
          AND status_consulta = 'Agendado'
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
        [idConsulta, idPaciente]
      );

      if (atualizacao.rowCount === 0) {
        const consultaExistente = await pool.query(
          `
          SELECT id_consulta, status_consulta
          FROM consultas
          WHERE id_consulta = $1
            AND id_paciente = $2
          `,
          [idConsulta, idPaciente]
        );

        if (consultaExistente.rowCount === 0) {
          return erro("Consulta não encontrada para este paciente.", 404);
        }

        return erro(
          "Esta consulta não está disponível para confirmação. Atualize a página e tente novamente.",
          409
        );
      }

      await registrarAuditoria({
        tipoUsuario: "paciente",
        idUsuario: idPaciente,
        acao: "CONFIRMAR PRESENÇA",
        tabelaAfetada: "consultas",
        registroId: idConsulta,
        detalhes: "Paciente confirmou presença pelo portal.",
      });

      return Response.json({
        mensagem: "Presença confirmada com sucesso.",
        consulta: atualizacao.rows[0],
      });
    }

    return erro("Tipo de operação inválido.");
  } catch (error) {
    console.error("Erro ao atualizar dados do paciente:", error);

    return erro("Não foi possível concluir a operação.", 500);
  }
}
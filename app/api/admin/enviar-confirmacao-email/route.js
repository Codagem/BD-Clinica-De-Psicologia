
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { Resend } from "resend";
import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";

export async function POST(req) {
  const client = await pool.connect();

  try {
    // 1. Verificar a sessão do administrador
    const cookieStore = await cookies();
    const tokenSessao = cookieStore.get("sessao")?.value;

    if (!tokenSessao) {
      return Response.json(
        { erro: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const sessao = await verificarSessao(tokenSessao);

    if (sessao?.tipo_usuario !== "admin") {
      return Response.json(
        { erro: "Apenas administradores podem solicitar o envio." },
        { status: 403 }
      );
    }

    // 2. Validar o paciente solicitado
    const body = await req.json();
    const idPaciente = Number(body.id_paciente);

    if (
      !Number.isSafeInteger(idPaciente) ||
      idPaciente <= 0
    ) {
      return Response.json(
        { erro: "Informe um ID de paciente válido." },
        { status: 400 }
      );
    }

    const resultado = await client.query(
      `SELECT id_paciente, nome_completo, email, email_verificado
       FROM public.pacientes
       WHERE id_paciente = $1
       LIMIT 1`,
      [idPaciente]
    );

    if (resultado.rows.length === 0) {
      return Response.json(
        { erro: "Paciente não encontrado." },
        { status: 404 }
      );
    }

    const paciente = resultado.rows[0];

    if (!paciente.email) {
      return Response.json(
        { erro: "Este paciente não possui e-mail cadastrado." },
        { status: 400 }
      );
    }

    if (paciente.email_verificado) {
      return Response.json({
        mensagem: "O e-mail deste paciente já está confirmado.",
      });
    }

    // 3. Gerar um token aleatório de uso único
    const token = randomBytes(32).toString("hex");

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const urlBase =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL;

    if (!urlBase) {
      return Response.json(
        { erro: "A URL pública do sistema não está configurada." },
        { status: 500 }
      );
    }

    const link =
      `${urlBase.replace(/\/$/, "")}` +
      `/confirmar-email?token=${token}`;

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return Response.json(
        { erro: "O serviço de e-mail não está configurado." },
        { status: 500 }
      );
    }

    // 4. Guardar somente o hash do token
    await client.query("BEGIN");

    await client.query(
      `UPDATE public.verificacoes_email
       SET usado_em = NOW()
       WHERE id_paciente = $1
         AND usado_em IS NULL`,
      [idPaciente]
    );

    await client.query(
      `INSERT INTO public.verificacoes_email
         (id_paciente, token_hash, expira_em)
       VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`,
      [idPaciente, tokenHash]
    );

    await client.query("COMMIT");

    // 5. Enviar a mensagem
    const resend = new Resend(apiKey);

    const envio = await resend.emails.send({
      from: "Clínica Psi <onboarding@resend.dev>",
      to: [paciente.email],
      subject: "Confirme seu e-mail — Clínica Psi",
      text:
        `Olá, ${paciente.nome_completo}!\n\n` +
        "Recebemos uma solicitação para confirmar seu e-mail.\n\n" +
        "Acesse o link abaixo para confirmar seu endereço. " +
        "Ele expira em 30 minutos e só pode ser usado uma vez:\n\n" +
        `${link}\n\n` +
        "Se você não solicitou esta confirmação, ignore esta mensagem.",
    });

    if (envio.error) {
      console.error("Erro do Resend:", envio.error);

      return Response.json(
        {
          erro:
            "Não foi possível enviar o e-mail. Verifique a configuração do Resend.",
        },
        { status: 502 }
      );
    }

    return Response.json({
      mensagem: "E-mail de confirmação enviado ao endereço cadastrado.",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("Erro ao enviar confirmação:", error);

    return Response.json(
      { erro: "Erro interno ao solicitar a confirmação." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
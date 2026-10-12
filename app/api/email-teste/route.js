
import { Resend } from "resend";

export async function POST(req) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return Response.json(
        { erro: "RESEND_API_KEY não configurada." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const destinatario = String(body?.email || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinatario)) {
      return Response.json(
        { erro: "Informe um e-mail válido." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "Clínica Psi <onboarding@resend.dev>",
      to: [destinatario],
      subject: "Teste de e-mail — Clínica Psi",
      text: "Este é um teste de envio de e-mail da Clínica Psi.",
      html: "<h2>Clínica Psi</h2><p>Este é um teste de envio de e-mail.</p>",
    });

    if (error) {
      console.error("Erro do Resend:", error);

      return Response.json(
        { erro: "O serviço de e-mail recusou o envio." },
        { status: 502 }
      );
    }

    return Response.json({
      mensagem: "Solicitação de envio aceita pelo Resend.",
      id: data?.id,
    });
  } catch (error) {
    console.error("Falha no teste de e-mail:", error);

    return Response.json(
      { erro: "Não foi possível realizar o teste de e-mail." },
      { status: 500 }
    );
  }
}
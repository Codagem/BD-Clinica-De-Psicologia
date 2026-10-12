import { createHash } from "node:crypto";
import pool from "@/lib/db";

export async function POST(req) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const token = body?.token;

    // Valida o token recebido pelo link do e-mail
    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return Response.json(
        { erro: "Link de confirmação inválido." },
        { status: 400 }
      );
    }

    // O banco armazena somente o hash do token
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    await client.query("BEGIN");

    // Procura um token válido, ainda não utilizado
    const resultado = await client.query(
      `SELECT id_verificacao, id_paciente
       FROM public.verificacoes_email
       WHERE token_hash = $1
         AND usado_em IS NULL
         AND expira_em > NOW()
       FOR UPDATE`,
      [tokenHash]
    );

    if (resultado.rows.length === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        {
          erro: "Link inválido, expirado ou já utilizado. Solicite um novo e-mail de confirmação."
        },
        { status: 400 }
      );
    }

    const verificacao = resultado.rows[0];

    // Confirma o e-mail do paciente
    const paciente = await client.query(
      `UPDATE public.pacientes
       SET email_verificado = TRUE
       WHERE id_paciente = $1`,
      [verificacao.id_paciente]
    );

    if (paciente.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        { erro: "Paciente não encontrado." },
        { status: 404 }
      );
    }

    // Marca o token utilizado
    await client.query(
      `UPDATE public.verificacoes_email
       SET usado_em = NOW()
       WHERE id_verificacao = $1`,
      [verificacao.id_verificacao]
    );

    // Invalida outros links pendentes desse paciente
    await client.query(
      `UPDATE public.verificacoes_email
       SET usado_em = NOW()
       WHERE id_paciente = $1
         AND usado_em IS NULL`,
      [verificacao.id_paciente]
    );

    await client.query("COMMIT");

    return Response.json({
      mensagem: "E-mail confirmado com sucesso! Você já pode entrar."
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("Erro ao confirmar e-mail:", error);

    return Response.json(
      { erro: "Não foi possível confirmar o e-mail. Tente novamente." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
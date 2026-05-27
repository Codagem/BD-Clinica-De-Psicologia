import pool from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const usuario = String(body.usuario || "").trim().toLowerCase();
    const senha = String(body.senha || "").trim();

    const result = await pool.query(
      `
      SELECT
        id_paciente,
        usuario
      FROM public.usuarios_pacientes
      WHERE LOWER(TRIM(usuario)) = $1
      AND TRIM(senha) = $2
      AND ativo = true
      `,
      [usuario, senha]
    );

    if (result.rows.length === 0) {
      return Response.json({
        erro: "Usuário ou senha inválidos.",
      });
    }

    return Response.json({
      mensagem: "Login realizado",
      id_paciente: result.rows[0].id_paciente,
    });
  } catch (error) {
    return Response.json({
      erro: error.message,
    });
  }
}
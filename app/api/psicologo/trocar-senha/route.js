
import pool from "@/lib/db";
import { criarSessao, verificarSessao } from "@/lib/sessao";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    // Primeiro, tenta autenticar pela sessão normal.
    let sessao = null;
    const tokenNormal = req.cookies.get("sessao")?.value;

    if (tokenNormal) {
      const verificada = await verificarSessao(tokenNormal);

      if (
        verificada?.tipo_usuario === "psicologo" &&
        verificada?.id_psicologo
      ) {
        sessao = verificada;
      }
    }

    // Compatibilidade com o fluxo temporário antigo.
    if (!sessao) {
      const tokenTemporario =
        req.cookies.get("troca_senha_psicologo")?.value;

      if (tokenTemporario) {
        const verificada = await verificarSessao(tokenTemporario);

        if (
          verificada?.tipo_usuario === "psicologo_troca_senha" &&
          verificada?.id_psicologo
        ) {
          sessao = verificada;
        }
      }
    }

    if (!sessao) {
      return NextResponse.json(
        { erro: "Sessão inválida ou expirada. Faça login novamente." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const novaSenha = String(body?.novaSenha || "");
    const confirmarSenha = String(body?.confirmarSenha || "");
    const senhaAtual = String(body?.senhaAtual || "");

    if (novaSenha.length < 8 || novaSenha.length > 72) {
      return NextResponse.json(
        { erro: "A senha deve ter entre 8 e 72 caracteres." },
        { status: 400 }
      );
    }

    if (
      !/[a-z]/.test(novaSenha) ||
      !/[A-Z]/.test(novaSenha) ||
      !/[0-9]/.test(novaSenha)
    ) {
      return NextResponse.json(
        { erro: "Use letras maiúsculas, minúsculas e pelo menos um número." },
        { status: 400 }
      );
    }

    if (novaSenha !== confirmarSenha) {
      return NextResponse.json(
        { erro: "As senhas não coincidem." },
        { status: 400 }
      );
    }

    const consulta = await pool.query(
      `SELECT id_psicologo, nome, senha_hash
       FROM public.psicologos
       WHERE id_psicologo = $1
       LIMIT 1`,
      [sessao.id_psicologo]
    );

    if (consulta.rowCount !== 1) {
      return NextResponse.json(
        { erro: "Psicólogo não encontrado." },
        { status: 404 }
      );
    }

    const psicologo = consulta.rows[0];
    const temSenha =
      Boolean(psicologo.senha_hash) &&
      String(psicologo.senha_hash).trim() !== "";

    // Se já existe senha, exige a senha atual para substituí-la.
    if (temSenha) {
      if (!senhaAtual) {
        return NextResponse.json(
          { erro: "Informe sua senha atual para alterá-la." },
          { status: 400 }
        );
      }

      const senhaAtualCorreta = await bcrypt.compare(
        senhaAtual,
        psicologo.senha_hash
      );

      if (!senhaAtualCorreta) {
        return NextResponse.json(
          { erro: "A senha atual está incorreta." },
          { status: 401 }
        );
      }
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);

    await pool.query(
      `UPDATE public.psicologos
       SET senha_hash = $1, trocar_senha = FALSE
       WHERE id_psicologo = $2`,
      [senhaHash, psicologo.id_psicologo]
    );

    const novaSessao = await criarSessao({
      tipo_usuario: "psicologo",
      id_psicologo: psicologo.id_psicologo,
      senha_pendente: false,
    });

    const resposta = NextResponse.json({
      sucesso: true,
      mensagem: "Senha salva com sucesso.",
      id_psicologo: psicologo.id_psicologo,
      nome: psicologo.nome,
    });

    const seguro = process.env.NODE_ENV === "production";

    resposta.cookies.set("sessao", novaSessao, {
      httpOnly: true,
      path: "/",
      maxAge: 28800,
      sameSite: "lax",
      secure: seguro,
    });

    resposta.cookies.set("troca_senha_psicologo", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: seguro,
    });

    return resposta;
  } catch (error) {
    console.error("Erro ao trocar senha do psicólogo:", error);

    return NextResponse.json(
      { erro: "Não foi possível alterar a senha neste momento." },
      { status: 500 }
    );
  }
}
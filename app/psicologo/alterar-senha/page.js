"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

// O bcrypt considera no máximo 72 BYTES (acentos e emojis ocupam mais de 1).
function tamanhoEmBytes(texto) {
  return new TextEncoder().encode(texto).length;
}

export default function AlterarSenhaPsicologo() {
  const router = useRouter();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [temSenhaCadastrada, setTemSenhaCadastrada] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const redirecionamento = useRef(null);

  // Limpa o timer de redirecionamento se a página for desmontada.
  useEffect(() => {
    return () => {
      if (redirecionamento.current) clearTimeout(redirecionamento.current);
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      try {
        const resposta = await fetch("/api/sessao", {
          cache: "no-store",
        });

        const sessao = resposta.ok ? await resposta.json() : null;

        if (!ativo) return;

        // CORREÇÃO PRINCIPAL: no primeiro acesso, a API de login cria apenas
        // a sessão temporária "psicologo_troca_senha". Antes, só "psicologo"
        // era aceito, e o psicólogo era mandado de volta para o login.
        const tiposPermitidos = ["psicologo", "psicologo_troca_senha"];

        if (
          !sessao?.autenticado ||
          !tiposPermitidos.includes(sessao.tipo_usuario) ||
          !sessao.id_psicologo
        ) {
          router.replace("/login");
          return;
        }

        if (sessao.tipo_usuario === "psicologo_troca_senha") {
          // Primeiro acesso: entrou com a data de nascimento, então não existe
          // senha atual para digitar (a menos que a API diga o contrário).
          setTemSenhaCadastrada(sessao.senha_pendente === false);
        } else {
          setTemSenhaCadastrada(sessao.senha_pendente !== true);
        }
      } catch {
        if (ativo) {
          setErro("Não foi possível verificar sua sessão. Entre novamente.");
        }
      } finally {
        if (ativo) setCarregandoSessao(false);
      }
    }

    verificarSessao();

    return () => {
      ativo = false;
    };
  }, [router]);

  async function salvarSenha(e) {
    e.preventDefault();

    if (carregando || sucesso) return;

    setErro("");
    setSucesso("");

    if (temSenhaCadastrada === null) {
      setErro(
        "Não foi possível confirmar o estado da sua conta. Tente entrar novamente."
      );
      return;
    }

    if (temSenhaCadastrada && !senhaAtual) {
      setErro("Digite sua senha atual.");
      return;
    }

    if (novaSenha.length < 8 || tamanhoEmBytes(novaSenha) > 72) {
      setErro(
        "A nova senha deve ter no mínimo 8 caracteres e no máximo 72 bytes (acentos contam mais)."
      );
      return;
    }

    if (
      !/[a-z]/.test(novaSenha) ||
      !/[A-Z]/.test(novaSenha) ||
      !/[0-9]/.test(novaSenha)
    ) {
      setErro("Use pelo menos uma letra maiúscula, uma minúscula e um número.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A nova senha e a confirmação não coincidem.");
      return;
    }

    if (temSenhaCadastrada && senhaAtual === novaSenha) {
      setErro("A nova senha deve ser diferente da senha atual.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/psicologo/trocar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senhaAtual: temSenhaCadastrada ? senhaAtual : undefined,
          novaSenha,
          confirmarSenha,
        }),
      });

      const resultado = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        setErro(resultado?.erro || "Não foi possível salvar a nova senha.");
        return;
      }

      // Limpa os campos da memória e bloqueia novo envio durante o redirect.
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSucesso("Senha alterada com sucesso! Redirecionando...");

      redirecionamento.current = setTimeout(() => {
        router.replace("/psicologo");
      }, 1200);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoSessao) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-gray-500">
        <LoaderCircle className="mr-2 animate-spin" size={20} />
        Verificando sua conta...
      </main>
    );
  }

  // Falha ao verificar a sessão: não mostra um formulário que não pode ser enviado.
  if (temSenhaCadastrada === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4">
        <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl">
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {erro || "Não foi possível verificar sua conta."}
          </p>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-6 w-full rounded-xl bg-[#1d3557] p-4 font-semibold text-white transition hover:bg-[#294a75]"
          >
            Voltar ao login
          </button>
        </section>
      </main>
    );
  }

  const bloqueado = carregando || Boolean(sucesso);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-8">
      <section className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-10">
        {/* No primeiro acesso ainda não há sessão completa para abrir o perfil. */}
        {temSenhaCadastrada && (
          <button
            type="button"
            onClick={() => router.push("/psicologo/perfil")}
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#1d3557] hover:underline"
          >
            <ArrowLeft size={18} />
            Voltar ao perfil
          </button>
        )}

        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-[#1d3557]/10 p-4 text-[#1d3557]">
            <LockKeyhole size={32} />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-[#1d3557]">
          {temSenhaCadastrada ? "Alterar senha" : "Criar senha pessoal"}
        </h1>

        <p className="mt-3 text-center leading-relaxed text-gray-500">
          {temSenhaCadastrada
            ? "Confirme sua senha atual para cadastrar uma nova senha com segurança."
            : "Crie uma senha pessoal para proteger sua conta profissional."}
        </p>

        <form onSubmit={salvarSenha} className="mt-8 space-y-5" noValidate>
          {temSenhaCadastrada && (
            <div>
              <label
                htmlFor="senhaAtual"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Senha atual
              </label>

              <div className="relative">
                <input
                  id="senhaAtual"
                  type={mostrarAtual ? "text" : "password"}
                  autoComplete="current-password"
                  value={senhaAtual}
                  onChange={(e) => {
                    setErro("");
                    setSenhaAtual(e.target.value);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white p-4 pr-12 text-black outline-none focus:border-[#1d3557]"
                  placeholder="Digite sua senha atual"
                />

                <button
                  type="button"
                  onClick={() => setMostrarAtual(!mostrarAtual)}
                  aria-label={
                    mostrarAtual ? "Ocultar senha atual" : "Mostrar senha atual"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#1d3557]"
                >
                  {mostrarAtual ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="novaSenha"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Nova senha
            </label>

            <div className="relative">
              <input
                id="novaSenha"
                type={mostrarNova ? "text" : "password"}
                autoComplete="new-password"
                value={novaSenha}
                onChange={(e) => {
                  setErro("");
                  setNovaSenha(e.target.value);
                }}
                maxLength={72}
                className="w-full rounded-xl border border-gray-200 bg-white p-4 pr-12 text-black outline-none focus:border-[#1d3557]"
                placeholder="Digite sua nova senha"
              />

              <button
                type="button"
                onClick={() => setMostrarNova(!mostrarNova)}
                aria-label={
                  mostrarNova ? "Ocultar nova senha" : "Mostrar nova senha"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#1d3557]"
              >
                {mostrarNova ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmarSenha"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirmar nova senha
            </label>

            <div className="relative">
              <input
                id="confirmarSenha"
                type={mostrarConfirmacao ? "text" : "password"}
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(e) => {
                  setErro("");
                  setConfirmarSenha(e.target.value);
                }}
                maxLength={72}
                className="w-full rounded-xl border border-gray-200 bg-white p-4 pr-12 text-black outline-none focus:border-[#1d3557]"
                placeholder="Digite novamente a nova senha"
              />

              <button
                type="button"
                onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                aria-label={
                  mostrarConfirmacao
                    ? "Ocultar confirmação"
                    : "Mostrar confirmação"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#1d3557]"
              >
                {mostrarConfirmacao ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-[#1d3557]"
                size={19}
              />
              <p>
                Use de 8 a 72 caracteres, com letra maiúscula, letra minúscula
                e número. Não reutilize uma senha de outro serviço.
              </p>
            </div>
          </div>

          {erro && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {erro}
            </p>
          )}

          {sucesso && (
            <p
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
            >
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            disabled={bloqueado}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d3557] p-4 font-semibold text-white transition hover:bg-[#294a75] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando && <LoaderCircle size={19} className="animate-spin" />}
            {carregando
              ? "Salvando..."
              : temSenhaCadastrada
                ? "Alterar minha senha"
                : "Criar minha senha"}
          </button>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            disabled={bloqueado}
            className="w-full p-2 text-sm text-gray-500 hover:text-[#1d3557] disabled:opacity-60"
          >
            Voltar ao login
          </button>
        </form>
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const SUPORTE_WHATSAPP = "5581999875045";

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

async function enviarLogin(url, usuario, senha) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ usuario, senha }),
  });

  const resultado = await lerJson(resposta);

  return {
    sucesso:
      resposta.ok &&
      !!resultado &&
      !resultado.erro,
    resultado,
    status: resposta.status,
  };
}

function salvarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, String(valor));
  } catch {
    // LocalStorage indisponível.
  }
}

function removerLocal(...chaves) {
  try {
    chaves.forEach((chave) => localStorage.removeItem(chave));
  } catch {
    // Ignora indisponibilidade do LocalStorage.
  }
}

function formatarCPF(valor) {
  const cpf = valor.replace(/\D/g, "").slice(0, 11);

  if (cpf.length <= 3) return cpf;

  if (cpf.length <= 6) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  }

  if (cpf.length <= 9) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(
    6,
    9
  )}-${cpf.slice(9)}`;
}

function validarCPF(valor) {
  const cpf = valor.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcularDigito = (base, pesoInicial) => {
    const soma = base
      .split("")
      .reduce(
        (total, numero, indice) =>
          total + Number(numero) * (pesoInicial - indice),
        0
      );

    const resto = (soma * 10) % 11;

    return resto === 10 ? 0 : resto;
  };

  const primeiroDigito = calcularDigito(cpf.slice(0, 9), 10);
  const segundoDigito = calcularDigito(cpf.slice(0, 10), 11);

  return (
    primeiroDigito === Number(cpf[9]) &&
    segundoDigito === Number(cpf[10])
  );
}

function dataNascimentoValida(valor) {
  const partes = valor.split("/");

  if (partes.length !== 3) return false;

  const [dia, mes, ano] = partes.map(Number);

  if (!dia || !mes || !ano || ano < 1900) {
    return false;
  }

  const data = new Date(ano, mes - 1, dia);

  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia &&
    data <= new Date()
  );
}

function mascararData(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
}

/* =========================================================
   PÁGINA DE LOGIN
   ========================================================= */

export default function Login() {
  const router = useRouter();

  const [tipoAcesso, setTipoAcesso] = useState("paciente");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const ehAdmin = tipoAcesso === "admin";
  const ehProfissional = tipoAcesso === "profissional";
  const ehPaciente = tipoAcesso === "paciente";

  /* ------------------------- ENTRAR ------------------------- */

  async function entrar(e) {
    e.preventDefault();

    if (carregando) return;

    setErro("");

    if (!usuario.trim() || !senha.trim()) {
      setErro("Preencha os campos.");
      return;
    }

    if (!ehAdmin && !validarCPF(usuario)) {
      setErro("CPF inválido. Confira os números digitados.");
      return;
    }

    if (ehPaciente && !dataNascimentoValida(senha)) {
      setErro(
        "Data de nascimento inválida. Use o formato DD/MM/AAAA."
      );
      return;
    }

    setCarregando(true);

    let loginConcluido = false;

    try {
      /* ---------------- ADMINISTRADOR ---------------- */

      if (ehAdmin) {
        const admin = await enviarLogin(
          "/api/login-admin",
          usuario.trim(),
          senha
        );

        if (!admin.sucesso) {
          setErro(
            admin.status >= 500
              ? "Serviço indisponível no momento. Tente novamente."
              : admin.resultado?.erro ||
                  "Usuário ou senha de administrador inválidos."
          );
          return;
        }

        salvarLocal("logado", "true");
        salvarLocal("tipo_usuario", "admin");

        removerLocal(
          "id_paciente",
          "id_psicologo",
          "id_estagiario"
        );

        loginConcluido = true;
        router.replace("/admin");
        return;
      }

      /* ------------- PSICÓLOGO OU ESTAGIÁRIO ------------- */

      if (ehProfissional) {
        const psicologo = await enviarLogin(
          "/api/login-psicologo",
          usuario,
          senha
        );

        if (psicologo.sucesso) {
          salvarLocal("logado", "true");
          salvarLocal("tipo_usuario", "psicologo");

          salvarLocal(
            "id_psicologo",
            psicologo.resultado.id_psicologo
          );

          removerLocal("id_paciente", "id_estagiario");

          loginConcluido = true;

          /*
           * Primeiro acesso ou troca obrigatória:
           * encaminha para criar uma senha pessoal.
           */
          if (
            psicologo.resultado.precisaTrocarSenha === true
          ) {
            router.replace("/psicologo/alterar-senha");
          } else {
            router.replace("/psicologo");
          }

          return;
        }

        const estagiario = await enviarLogin(
          "/api/login-estagiario",
          usuario,
          senha
        );

        if (estagiario.sucesso) {
          salvarLocal("logado", "true");
          salvarLocal("tipo_usuario", "estagiario");

          salvarLocal(
            "id_estagiario",
            estagiario.resultado.id_estagiario
          );

          removerLocal("id_paciente", "id_psicologo");

          loginConcluido = true;
          router.replace("/estagiario");
          return;
        }

        if (
          psicologo.status >= 500 ||
          estagiario.status >= 500
        ) {
          setErro(
            "Serviço indisponível no momento. Tente novamente."
          );
          return;
        }

        setErro(
          psicologo.resultado?.erro &&
            estagiario.status === 404
            ? psicologo.resultado.erro
            : "Usuário ou senha inválidos."
        );

        return;
      }

      /* ---------------------- PACIENTE ---------------------- */

      const paciente = await enviarLogin(
        "/api/login-paciente",
        usuario,
        senha
      );

      if (!paciente.sucesso) {
        setErro(
          paciente.status >= 500
            ? "Serviço indisponível no momento. Tente novamente."
            : paciente.resultado?.erro ||
                "CPF ou data de nascimento inválidos."
        );
        return;
      }

      salvarLocal("logado", "true");
      salvarLocal("tipo_usuario", "paciente");

      salvarLocal(
        "id_paciente",
        paciente.resultado.id_paciente
      );

      removerLocal("id_psicologo", "id_estagiario");

      loginConcluido = true;
      router.replace("/cliente");
    } catch (error) {
      console.error("Erro no login:", error);

      setErro(
        "Erro ao realizar login. Verifique sua conexão e tente novamente."
      );
    } finally {
      if (!loginConcluido) {
        setCarregando(false);
      }
    }
  }

  /* ------------------------ SUPORTE ------------------------ */

  function abrirSuporte() {
    const mensagem = encodeURIComponent(
      "Olá, preciso de suporte para acessar o sistema da clínica."
    );

    window.open(
      `https://wa.me/${SUPORTE_WHATSAPP}?text=${mensagem}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* ------------------- TIPO DE ACESSO ------------------- */

  function selecionarAcesso(tipo) {
    setTipoAcesso(tipo);
    setUsuario("");
    setSenha("");
    setMostrarSenha(false);
    setErro("");
  }

  /* ------------------------ TEXTOS ------------------------ */

  const tituloCampoUsuario = ehAdmin ? "Usuário" : "CPF";

  const placeholderUsuario = ehAdmin
    ? "Digite seu usuário"
    : "Digite seu CPF";

  const tituloSenha = ehAdmin
    ? "Senha"
    : ehProfissional
      ? "Senha ou data de nascimento no primeiro acesso"
      : "Data de nascimento";

  const placeholderSenha = ehAdmin
    ? "Digite sua senha"
    : ehProfissional
      ? "DD/MM/AAAA no primeiro acesso"
      : "DD/MM/AAAA";

  const classeBotaoTipo = (ativo) =>
    `p-3 rounded-2xl border transition ${
      ativo
        ? "bg-[#1d3557] text-white border-[#1d3557]"
        : "bg-white text-[#1d3557] border-gray-200 hover:border-[#1d3557]"
    }`;

  /* -------------------------- TELA -------------------------- */

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-[34px] overflow-hidden shadow-2xl grid md:grid-cols-2">

        {/* IMAGEM */}

        <div className="hidden md:block relative min-h-[680px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/login-clinica.jpg.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute bottom-12 left-10 text-white">
            <p className="text-xl font-light leading-relaxed">
              Cuidar da mente
              <br />
              é cuidar da vida.
            </p>

            <div className="w-14 h-[2px] bg-white mt-6" />
          </div>
        </div>

        {/* LOGIN */}

        <div className="flex items-center justify-center p-8 md:p-14">
          <div className="w-full max-w-md text-center">

            <div className="mb-8 flex justify-start">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="group inline-flex items-center gap-2 rounded-full border border-[#1d3557]/10 bg-[#f8f7f4] px-4 py-2 text-sm font-medium text-[#1d3557]/70 transition duration-300 hover:border-[#1d3557]/20 hover:bg-white hover:text-[#1d3557]"
              >
                <ArrowLeft
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
                Voltar para o início
              </button>
            </div>

            <div
              className="text-[#1d3557] text-5xl mb-4"
              aria-hidden="true"
            >
              Ψ
            </div>

            <h1 className="text-5xl font-serif text-[#1d3557] mb-2">
              Clínica Psi
            </h1>

            <p className="text-gray-500 mb-8">
              Acesso ao sistema da clínica
            </p>

            <form
              onSubmit={entrar}
              className="space-y-5 text-left"
              noValidate
            >
              {/* USUÁRIO / CPF */}

              <div>
                <label
                  htmlFor="usuario"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  {tituloCampoUsuario}
                </label>

                <input
                  id="usuario"
                  type="text"
                  inputMode={ehAdmin ? "text" : "numeric"}
                  autoComplete={ehAdmin ? "username" : "off"}
                  placeholder={placeholderUsuario}
                  value={usuario}
                  maxLength={ehAdmin ? 50 : 14}
                  onChange={(e) => {
                    setErro("");

                    setUsuario(
                      ehAdmin
                        ? e.target.value
                        : formatarCPF(e.target.value)
                    );
                  }}
                  className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e] transition"
                />
              </div>

              {/* SENHA / DATA DE NASCIMENTO */}

              <div>
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  {tituloSenha}
                </label>

                <input
                  id="senha"
                  type={
                    ehAdmin || ehProfissional
                      ? mostrarSenha
                        ? "text"
                        : "password"
                      : "text"
                  }
                  inputMode={ehPaciente ? "numeric" : "text"}
                  autoComplete={
                    ehPaciente ? "off" : "current-password"
                  }
                  placeholder={placeholderSenha}
                  value={senha}
                  maxLength={
                    ehProfissional ? 72 : ehAdmin ? 50 : 10
                  }
                  onChange={(e) => {
                    setErro("");

                    setSenha(
                      ehPaciente
                        ? mascararData(e.target.value)
                        : e.target.value
                    );
                  }}
                  className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e] transition"
                />

                {(ehAdmin || ehProfissional) && (
                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenha((anterior) => !anterior)
                    }
                    aria-label={
                      mostrarSenha
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                    className="mt-2 flex items-center gap-2 text-sm text-gray-500 hover:text-[#1d3557] transition"
                  >
                    {mostrarSenha ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}

                    {mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"}
                  </button>
                )}

                {ehProfissional && (
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">
                    No primeiro acesso do psicólogo, informe sua
                    data de nascimento no formato DD/MM/AAAA.
                    Você será encaminhado para cadastrar uma
                    senha pessoal antes de acessar o painel.
                  </p>
                )}
              </div>

              {/* ERRO */}

              {erro && (
                <p
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-[#2b4c7e] hover:bg-[#244267] text-white rounded-2xl p-4 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            {/* TIPO DE ACESSO */}

            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-3">
                Acessar como
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selecionarAcesso("admin")}
                  aria-pressed={ehAdmin}
                  className={classeBotaoTipo(ehAdmin)}
                >
                  Administrador
                </button>

                <button
                  type="button"
                  onClick={() => selecionarAcesso("profissional")}
                  aria-pressed={ehProfissional}
                  className={classeBotaoTipo(ehProfissional)}
                >
                  Psicólogo / Estagiário
                </button>
              </div>

              <button
                type="button"
                onClick={() => selecionarAcesso("paciente")}
                aria-pressed={ehPaciente}
                className={`w-full mt-3 p-3 rounded-2xl border transition ${
                  ehPaciente
                    ? "bg-[#f8f7f4] text-[#1d3557] border-[#1d3557]/30"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1d3557]"
                }`}
              >
                Paciente
              </button>
            </div>

            {/* SUPORTE */}

            <button
              type="button"
              onClick={abrirSuporte}
              className="mt-6 text-sm text-gray-500 hover:text-[#1d3557] transition"
            >
              Esqueci minha senha
            </button>

            {/* CADASTRO DE PACIENTE */}

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500">
                Ainda não possui cadastro?
              </p>

              <button
                type="button"
                onClick={() => router.push("/cadastro")}
                className="mt-2 text-[#1d3557] font-semibold hover:underline transition"
              >
                Cadastre-se como paciente
              </button>
            </div>

            {/* ACESSO RESTRITO */}

            <div className="mt-8 bg-[#f8f7f4] rounded-3xl p-5 text-left border border-gray-100">
              <p className="text-sm text-gray-500 mb-2 font-semibold">
                Acesso restrito
              </p>

              <p className="text-sm text-gray-600 leading-relaxed">
                Este sistema é destinado apenas a usuários
                autorizados da clínica. Para recuperar o acesso
                ou solicitar suporte, entre em contato com a
                administração.
              </p>

              <button
                type="button"
                onClick={abrirSuporte}
                className="mt-4 w-full border border-[#1d3557]/15 text-[#1d3557] py-3 rounded-2xl hover:bg-white transition"
              >
                Falar com suporte
              </button>
            </div>

            <p className="text-center text-gray-400 mt-8 text-sm">
              Clínica Psi © Sistema de Gestão Clínica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
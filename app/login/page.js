"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

// Lê o JSON sem quebrar caso a API devolva HTML ou texto
async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

// Envia as credenciais e devolve um resultado padronizado
async function enviarLogin(url, usuario, senha) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha }),
  });

  const resultado = await lerJson(resposta);

  return {
    sucesso: resposta.ok && !!resultado && !resultado.erro,
    resultado,
    status: resposta.status,
  };
}

function salvarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, String(valor));
  } catch {
    // localStorage indisponível
  }
}

function removerLocal(...chaves) {
  try {
    chaves.forEach((chave) => localStorage.removeItem(chave));
  } catch {
    // ignora
  }
}

function formatarData(valor) {
  let data = valor.replace(/\D/g, "").slice(0, 8);

  if (data.length > 2) {
    data = data.slice(0, 2) + "/" + data.slice(2);
  }

  if (data.length > 5) {
    data = data.slice(0, 5) + "/" + data.slice(5);
  }

  return data;
}

function formatarCPF(valor) {
  let cpf = valor.replace(/\D/g, "").slice(0, 11);

  if (cpf.length > 3) {
    cpf = cpf.slice(0, 3) + "." + cpf.slice(3);
  }

  if (cpf.length > 7) {
    cpf = cpf.slice(0, 7) + "." + cpf.slice(7);
  }

  if (cpf.length > 11) {
    cpf = cpf.slice(0, 11) + "-" + cpf.slice(11);
  }

  return cpf;
}

// Confere se DD/MM/AAAA é uma data real (rejeita 99/99/9999, 31/02/2000 etc.)
function dataNascimentoValida(valor) {
  const [dia, mes, ano] = valor.split("/").map(Number);

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

/* =========================================================
   PÁGINA
   ========================================================= */

export default function Login() {
  const router = useRouter();

  const [tipoAcesso, setTipoAcesso] = useState("paciente");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const ehAdmin = tipoAcesso === "admin";

  /* ---------- ENTRAR ---------- */

  async function entrar(e) {
    e.preventDefault();

    if (carregando) {
      return;
    }

    if (!usuario.trim() || !senha.trim()) {
      alert("Preencha os campos.");
      return;
    }

    if (!ehAdmin) {
      if (usuario.replace(/\D/g, "").length !== 11) {
        alert("CPF inválido. Informe os 11 dígitos.");
        return;
      }

      if (!dataNascimentoValida(senha)) {
        alert("Data de nascimento inválida. Use o formato DD/MM/AAAA.");
        return;
      }
    }

    setCarregando(true);

    let loginConcluido = false;

    try {
      /* ===== ADMINISTRADOR ===== */

      if (ehAdmin) {
        const admin = await enviarLogin("/api/login-admin", usuario, senha);

        if (!admin.sucesso) {
          alert(
            admin.resultado?.erro ||
              "Usuário ou senha de administrador inválidos."
          );
          return;
        }

        salvarLocal("logado", "true");
        salvarLocal("tipo_usuario", "admin");
        removerLocal("id_paciente", "id_psicologo", "id_estagiario");

        loginConcluido = true;
        router.push("/admin");
        return;
      }

      /* ===== PSICÓLOGO OU ESTAGIÁRIO ===== */

      if (tipoAcesso === "profissional") {
        const psicologo = await enviarLogin(
          "/api/login-psicologo",
          usuario,
          senha
        );

        if (psicologo.sucesso) {
          salvarLocal("logado", "true");
          salvarLocal("tipo_usuario", "psicologo");
          salvarLocal("id_psicologo", psicologo.resultado.id_psicologo);
          removerLocal("id_paciente", "id_estagiario");

          loginConcluido = true;
          router.push("/psicologo");
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
          salvarLocal("id_estagiario", estagiario.resultado.id_estagiario);
          removerLocal("id_paciente", "id_psicologo");

          loginConcluido = true;
          router.push("/estagiario");
          return;
        }

        // Mensagem genérica: a última API consultada (estagiário) responderia
        // "não encontrado" mesmo para um psicólogo que errou a senha, e
        // mensagens diferentes revelariam se o CPF existe no sistema.
        alert("Usuário ou senha inválidos.");
        return;
      }

      /* ===== PACIENTE ===== */

      const paciente = await enviarLogin("/api/login-paciente", usuario, senha);

      if (!paciente.sucesso) {
        alert(
          paciente.resultado?.erro || "CPF ou data de nascimento inválidos."
        );
        return;
      }

      salvarLocal("logado", "true");
      salvarLocal("tipo_usuario", "paciente");
      salvarLocal("id_paciente", paciente.resultado.id_paciente);
      removerLocal("id_psicologo", "id_estagiario");

      loginConcluido = true;
      router.push("/cliente");
    } catch (error) {
      console.error("Erro no login:", error);

      alert("Erro ao realizar login. Verifique sua conexão e tente novamente.");
    } finally {
      if (!loginConcluido) {
        setCarregando(false);
      }
    }
  }

  /* ---------- SUPORTE ---------- */

  function abrirSuporte() {
    const mensagem = encodeURIComponent(
      "Olá, preciso de suporte para acessar o sistema da clínica."
    );

    window.open(
      `https://wa.me/5581999875045?text=${mensagem}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* ---------- ALTERAR TIPO DE ACESSO ---------- */

  function selecionarAcesso(tipo) {
    setTipoAcesso(tipo);
    setUsuario("");
    setSenha("");
  }

  /* ---------- TEXTOS DOS CAMPOS ---------- */

  const tituloCampoUsuario = ehAdmin ? "Usuário" : "CPF";
  const placeholderUsuario = ehAdmin ? "Digite seu usuário" : "Digite seu CPF";
  const tituloSenha = ehAdmin ? "Senha" : "Data de nascimento";
  const placeholderSenha = ehAdmin ? "Digite sua senha" : "DD/MM/AAAA";

  const classeBotaoTipo = (ativo) =>
    `p-3 rounded-2xl border transition ${
      ativo
        ? "bg-[#1d3557] text-white border-[#1d3557]"
        : "bg-white text-[#1d3557] border-gray-200 hover:border-[#1d3557]"
    }`;

  /* ---------- TELA ---------- */

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-[34px] overflow-hidden shadow-2xl grid md:grid-cols-2">
        {/* =====================================================
            IMAGEM
        ===================================================== */}
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

        {/* =====================================================
            LOGIN
        ===================================================== */}
        <div className="flex items-center justify-center p-8 md:p-14">
          <div className="w-full max-w-md text-center">
            {/* VOLTAR PARA O INÍCIO */}
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

            {/* LOGO */}
            <div className="text-[#1d3557] text-5xl mb-4" aria-hidden="true">
              Ψ
            </div>

            <h1 className="text-5xl font-serif text-[#1d3557] mb-2">
              Clínica Psi
            </h1>

            <p className="text-gray-500 mb-8">Acesso ao sistema da clínica</p>

            {/* FORMULÁRIO */}
            <form onSubmit={entrar} className="space-y-5 text-left">
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
                  onChange={(e) =>
                    setUsuario(
                      ehAdmin ? e.target.value : formatarCPF(e.target.value)
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e] transition"
                />
              </div>

              {/* SENHA / DATA */}
              <div>
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  {tituloSenha}
                </label>

                <input
                  id="senha"
                  type={ehAdmin ? "password" : "text"}
                  inputMode={ehAdmin ? "text" : "numeric"}
                  autoComplete={ehAdmin ? "current-password" : "off"}
                  placeholder={placeholderSenha}
                  value={senha}
                  maxLength={ehAdmin ? 50 : 10}
                  onChange={(e) =>
                    setSenha(
                      ehAdmin ? e.target.value : formatarData(e.target.value)
                    )
                  }
                  className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e] transition"
                />
              </div>

              {/* ENTRAR */}
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
              <p className="text-sm text-gray-500 mb-3">Acessar como</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selecionarAcesso("admin")}
                  aria-pressed={tipoAcesso === "admin"}
                  className={classeBotaoTipo(tipoAcesso === "admin")}
                >
                  Administrador
                </button>

                <button
                  type="button"
                  onClick={() => selecionarAcesso("profissional")}
                  aria-pressed={tipoAcesso === "profissional"}
                  className={classeBotaoTipo(tipoAcesso === "profissional")}
                >
                  Psicólogo / Estagiário
                </button>
              </div>

              <button
                type="button"
                onClick={() => selecionarAcesso("paciente")}
                aria-pressed={tipoAcesso === "paciente"}
                className={`w-full mt-3 p-3 rounded-2xl border transition ${
                  tipoAcesso === "paciente"
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

            {/* CADASTRO DO PACIENTE */}
            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500">Ainda não possui cadastro?</p>

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
                Este sistema é destinado apenas a usuários autorizados da
                clínica. Para recuperar o acesso ou solicitar suporte, entre em
                contato com a administração.
              </p>

              <button
                type="button"
                onClick={abrirSuporte}
                className="mt-4 w-full border border-[#1d3557]/15 text-[#1d3557] py-3 rounded-2xl hover:bg-white transition"
              >
                Falar com suporte
              </button>
            </div>

            {/* RODAPÉ */}
            <p className="text-center text-gray-400 mt-8 text-sm">
              Clínica Psi © Sistema de Gestão Clínica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
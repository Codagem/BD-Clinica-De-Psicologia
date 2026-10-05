"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [tipoAcesso, setTipoAcesso] = useState("paciente");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  // =========================================
  // FORMATAR DATA
  // =========================================

  function formatarData(valor) {
    let data = valor.replace(/\D/g, "");

    if (data.length > 2) {
      data = data.slice(0, 2) + "/" + data.slice(2);
    }

    if (data.length > 5) {
      data = data.slice(0, 5) + "/" + data.slice(5);
    }

    return data.slice(0, 10);
  }

  // =========================================
  // FORMATAR CPF
  // =========================================

  function formatarCPF(valor) {
    let cpf = valor.replace(/\D/g, "");

    if (cpf.length > 3) {
      cpf = cpf.slice(0, 3) + "." + cpf.slice(3);
    }

    if (cpf.length > 7) {
      cpf = cpf.slice(0, 7) + "." + cpf.slice(7);
    }

    if (cpf.length > 11) {
      cpf = cpf.slice(0, 11) + "-" + cpf.slice(11);
    }

    return cpf.slice(0, 14);
  }

  // =========================================
  // ENTRAR
  // =========================================

  async function entrar(e) {
    e.preventDefault();

    if (!usuario.trim() || !senha.trim()) {
      alert("Preencha os campos.");
      return;
    }

    setCarregando(true);

    try {
      // =========================================
      // ADMINISTRADOR
      // =========================================

      if (tipoAcesso === "admin") {
        const respostaAdmin = await fetch(
          "/api/login-admin",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usuario,
              senha,
            }),
          }
        );

        const resultadoAdmin =
          await respostaAdmin.json();

        if (resultadoAdmin.erro) {
          alert(
            resultadoAdmin.erro ||
              "Usuário ou senha de administrador inválidos."
          );

          setCarregando(false);
          return;
        }

        localStorage.setItem("logado", "true");
        localStorage.setItem(
          "tipo_usuario",
          "admin"
        );

        localStorage.removeItem("id_paciente");
        localStorage.removeItem("id_psicologo");
        localStorage.removeItem("id_estagiario");

        router.push("/");
        return;
      }

      // =========================================
      // ÁREA PROFISSIONAL
      // PSICÓLOGO OU ESTAGIÁRIO
      // =========================================

      if (tipoAcesso === "profissional") {
        // -----------------------------------------
        // TENTA PSICÓLOGO
        // -----------------------------------------

        const respostaPsicologo = await fetch(
          "/api/login-psicologo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usuario,
              senha,
            }),
          }
        );

        const resultadoPsicologo =
          await respostaPsicologo.json();

        if (!resultadoPsicologo.erro) {
          localStorage.setItem("logado", "true");
          localStorage.setItem(
            "tipo_usuario",
            "psicologo"
          );

          localStorage.setItem(
            "id_psicologo",
            resultadoPsicologo.id_psicologo
          );

          localStorage.removeItem("id_paciente");
          localStorage.removeItem("id_estagiario");

          router.push("/psicologo");
          return;
        }

        // -----------------------------------------
        // TENTA ESTAGIÁRIO
        // -----------------------------------------

        const respostaEstagiario = await fetch(
          "/api/login-estagiario",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usuario,
              senha,
            }),
          }
        );

        const resultadoEstagiario =
          await respostaEstagiario.json();

        if (!resultadoEstagiario.erro) {
          localStorage.setItem("logado", "true");
          localStorage.setItem(
            "tipo_usuario",
            "estagiario"
          );

          localStorage.setItem(
            "id_estagiario",
            resultadoEstagiario.id_estagiario
          );

          localStorage.removeItem("id_paciente");
          localStorage.removeItem("id_psicologo");

          router.push("/estagiario");
          return;
        }

        alert(
          resultadoEstagiario.erro ||
            resultadoPsicologo.erro ||
            "CPF ou data de nascimento inválidos."
        );

        setCarregando(false);
        return;
      }

      // =========================================
      // PACIENTE
      // =========================================

      const respostaPaciente = await fetch(
        "/api/login-paciente",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario,
            senha,
          }),
        }
      );

      const resultadoPaciente =
        await respostaPaciente.json();

      if (resultadoPaciente.erro) {
        alert(
          resultadoPaciente.erro ||
            "CPF ou data de nascimento inválidos."
        );

        setCarregando(false);
        return;
      }

      localStorage.setItem("logado", "true");
      localStorage.setItem(
        "tipo_usuario",
        "paciente"
      );

      localStorage.setItem(
        "id_paciente",
        resultadoPaciente.id_paciente
      );

      localStorage.removeItem("id_psicologo");
      localStorage.removeItem("id_estagiario");

      router.push("/cliente");
    } catch (error) {
      console.error("Erro no login:", error);

      alert("Erro ao realizar login.");

      setCarregando(false);
    }
  }

  // =========================================
  // SUPORTE
  // =========================================

  function abrirSuporte() {
    window.open(
      "https://wa.me/5581999875045?text=Olá,%20preciso%20de%20suporte%20para%20acessar%20o%20sistema%20da%20clínica.",
      "_blank"
    );
  }

  // =========================================
  // ALTERAR TIPO DE ACESSO
  // =========================================

  function selecionarAcesso(tipo) {
    setTipoAcesso(tipo);
    setUsuario("");
    setSenha("");
  }

  // =========================================
  // TÍTULOS
  // =========================================

  const tituloCampoUsuario =
    tipoAcesso === "admin"
      ? "Usuário"
      : "CPF";

  const placeholderUsuario =
    tipoAcesso === "admin"
      ? "Digite seu usuário"
      : "Digite seu CPF";

  const tituloSenha =
    tipoAcesso === "admin"
      ? "Senha"
      : "Data de nascimento";

  const placeholderSenha =
    tipoAcesso === "admin"
      ? "Digite sua senha"
      : "DD/MM/AAAA";

  // =========================================
  // TELA
  // =========================================

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-[34px] overflow-hidden shadow-2xl grid md:grid-cols-2">

        {/* =========================================
            IMAGEM
        ========================================= */}

        <div className="hidden md:block relative min-h-[680px]">
          <img
            src="/login-clinica.jpg.png"
            alt="Clínica Psi"
            className="w-full h-full object-cover"
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

        {/* =========================================
            LOGIN
        ========================================= */}

        <div className="flex items-center justify-center p-8 md:p-14">
          <div className="w-full max-w-md text-center">

            <div className="text-[#1d3557] text-5xl mb-4">
              Ψ
            </div>

            <h1 className="text-5xl font-serif text-[#1d3557] mb-2">
              Clínica Psi
            </h1>

            <p className="text-gray-500 mb-8">
              Acesso ao sistema da clínica
            </p>

            {/* =========================================
                FORMULÁRIO
            ========================================= */}

            <form
              onSubmit={entrar}
              className="space-y-5 text-left"
            >

              {/* USUÁRIO / CPF */}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  {tituloCampoUsuario}
                </label>

                <input
                  type="text"
                  inputMode={
                    tipoAcesso === "admin"
                      ? "text"
                      : "numeric"
                  }
                  placeholder={placeholderUsuario}
                  value={usuario}
                  onChange={(e) => {
                    if (tipoAcesso === "admin") {
                      setUsuario(e.target.value);
                    } else {
                      setUsuario(
                        formatarCPF(e.target.value)
                      );
                    }
                  }}
                  className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e] transition"
                />
              </div>

              {/* SENHA / DATA */}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  {tituloSenha}
                </label>

                <input
                  type={
                    tipoAcesso === "admin"
                      ? "password"
                      : "text"
                  }
                  inputMode={
                    tipoAcesso === "admin"
                      ? "text"
                      : "numeric"
                  }
                  placeholder={placeholderSenha}
                  value={senha}
                  maxLength={
                    tipoAcesso === "admin"
                      ? 50
                      : 10
                  }
                  onChange={(e) => {
                    if (tipoAcesso === "admin") {
                      setSenha(e.target.value);
                    } else {
                      setSenha(
                        formatarData(e.target.value)
                      );
                    }
                  }}
                  className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e] transition"
                />
              </div>

              {/* ENTRAR */}

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-[#2b4c7e] hover:bg-[#244267] text-white rounded-2xl p-4 font-semibold transition disabled:opacity-60"
              >
                {carregando
                  ? "Entrando..."
                  : "Entrar"}
              </button>
            </form>

            {/* =========================================
                TIPO DE ACESSO
            ========================================= */}

            <div className="mt-8">

              <p className="text-sm text-gray-500 mb-3">
                Acessar como
              </p>

              <div className="grid grid-cols-2 gap-3">

                {/* ADMINISTRADOR */}

                <button
                  type="button"
                  onClick={() =>
                    selecionarAcesso("admin")
                  }
                  className={`p-3 rounded-2xl border transition ${
                    tipoAcesso === "admin"
                      ? "bg-[#1d3557] text-white border-[#1d3557]"
                      : "bg-white text-[#1d3557] border-gray-200 hover:border-[#1d3557]"
                  }`}
                >
                  Administrador
                </button>

                {/* PROFISSIONAL */}

                <button
                  type="button"
                  onClick={() =>
                    selecionarAcesso("profissional")
                  }
                  className={`p-3 rounded-2xl border transition ${
                    tipoAcesso === "profissional"
                      ? "bg-[#1d3557] text-white border-[#1d3557]"
                      : "bg-white text-[#1d3557] border-gray-200 hover:border-[#1d3557]"
                  }`}
                >
                  Psicólogo / Estagiário
                </button>

              </div>

              {/* PACIENTE */}

              <button
                type="button"
                onClick={() =>
                  selecionarAcesso("paciente")
                }
                className={`w-full mt-3 p-3 rounded-2xl border transition ${
                  tipoAcesso === "paciente"
                    ? "bg-[#f8f7f4] text-[#1d3557] border-[#1d3557]/30"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1d3557]"
                }`}
              >
                Paciente
              </button>

            </div>

            {/* =========================================
                SUPORTE
            ========================================= */}

            <button
              type="button"
              onClick={abrirSuporte}
              className="mt-6 text-sm text-gray-500 hover:text-[#1d3557] transition"
            >
              Esqueci minha senha
            </button>

            {/* =========================================
                ACESSO RESTRITO
            ========================================= */}

            <div className="mt-8 bg-[#f8f7f4] rounded-3xl p-5 text-left border border-gray-100">

              <p className="text-sm text-gray-500 mb-2 font-semibold">
                Acesso restrito
              </p>

              <p className="text-sm text-gray-600 leading-relaxed">
                Este sistema é destinado apenas a usuários
                autorizados da clínica. Para recuperar o
                acesso ou solicitar suporte, entre em contato
                com a administração.
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
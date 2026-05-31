"use client";

// =========================================
// IMPORTAÇÕES
// =========================================

import { useRouter } from "next/navigation";
import { useState } from "react";

// =========================================
// COMPONENTE LOGIN
// =========================================

export default function Login() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  // =========================================
  // ENTRAR NO SISTEMA
  // =========================================

  async function entrar(e) {
    e.preventDefault();

    if (!usuario.trim() || !senha.trim()) {
      alert("Preencha usuário e senha.");
      return;
    }

    setCarregando(true);

    // =========================================
    // LOGIN ADMIN
    // =========================================

    if (usuario === "admin" && senha === "123") {
      localStorage.setItem("logado", "true");
      localStorage.setItem("tipo_usuario", "admin");
      localStorage.removeItem("id_paciente");

      router.push("/");
      return;
    }

    // =========================================
    // LOGIN PACIENTE PELO BANCO
    // =========================================

    try {
      const resposta = await fetch("/api/login-paciente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario,
          senha,
        }),
      });

      const resultado = await resposta.json();

      if (resultado.erro) {
        alert(resultado.erro);
        setCarregando(false);
        return;
      }

      localStorage.setItem("logado", "true");
      localStorage.setItem("tipo_usuario", "paciente");
      localStorage.setItem("id_paciente", resultado.id_paciente);

      router.push("/cliente");
    } catch (error) {
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
  // TELA
  // =========================================

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-[34px] overflow-hidden shadow-2xl grid md:grid-cols-2">
        <div className="hidden md:block relative min-h-[620px]">
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

        <div className="flex items-center justify-center p-8 md:p-14">
          <div className="w-full max-w-md text-center">
            <div className="text-[#1d3557] text-5xl mb-4">Ψ</div>

            <h1 className="text-5xl font-serif text-[#1d3557] mb-2">
              Clínica Psi
            </h1>

            <p className="text-gray-500 mb-10">
              Sistema de gestão clínica
            </p>

            <form onSubmit={entrar} className="space-y-5 text-left">
              <input
                type="text"
                placeholder="Usuário"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e]"
              />

              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e]"
              />

              <div className="flex justify-end items-center text-sm text-gray-500">
                <button
                  type="button"
                  onClick={abrirSuporte}
                  className="hover:text-[#1d3557] transition"
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-[#2b4c7e] hover:bg-[#244267] text-white rounded-2xl p-4 font-semibold transition disabled:opacity-60"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-10 bg-[#f8f7f4] rounded-3xl p-5 text-left border border-gray-100">
              <p className="text-sm text-gray-500 mb-2 font-semibold">
                Acesso restrito
              </p>

              <p className="text-sm text-gray-600 leading-relaxed">
                Este sistema é destinado apenas a usuários autorizados da
                clínica. Para recuperar acesso ou solicitar suporte, entre em
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

            <p className="text-center text-gray-400 mt-10 text-sm">
              Clínica Psi © Sistema de Gestão Clínica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  function entrar(e) {
    e.preventDefault();

    // LOGIN ADMIN
    if (usuario === "admin" && senha === "123") {
      localStorage.setItem("logado", "true");
      localStorage.setItem("tipo_usuario", "admin");

      router.push("/");
      return;
    }

    // LOGIN PACIENTE
    if (usuario === "paciente" && senha === "123") {
      localStorage.setItem("logado", "true");
      localStorage.setItem("tipo_usuario", "paciente");

      // ID fictício do paciente
      localStorage.setItem("id_paciente", "1");

      router.push("/cliente");
      return;
    }

    alert("Usuário ou senha inválidos");
  }

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

            <div className="text-[#1d3557] text-5xl mb-4">
              Ψ
            </div>

            <h1 className="text-5xl font-serif text-[#1d3557] mb-2">
              Clínica Psi
            </h1>

            <p className="text-gray-500 mb-10">
              Acesse o sistema
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

              <div className="flex justify-between items-center text-sm text-gray-500">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Lembrar de mim
                </label>

                <span>Esqueci minha senha</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2b4c7e] hover:bg-[#244267] text-white rounded-2xl p-4 font-semibold transition"
              >
                Entrar
              </button>
            </form>

            <div className="mt-10 bg-[#f8f7f4] rounded-3xl p-5 text-left border border-gray-100">
              <p className="text-sm text-gray-500 mb-3 font-semibold">
                Acessos de teste
              </p>

              <div className="space-y-3 text-sm">

                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                  <p className="font-semibold text-[#1d3557]">
                    Administração
                  </p>

                  <p className="text-gray-600 mt-1">
                    Usuário: admin
                  </p>

                  <p className="text-gray-600">
                    Senha: 123
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                  <p className="font-semibold text-[#1d3557]">
                    Paciente
                  </p>

                  <p className="text-gray-600 mt-1">
                    Usuário: paciente
                  </p>

                  <p className="text-gray-600">
                    Senha: 123
                  </p>
                </div>

              </div>
            </div>

            <p className="text-center text-gray-400 mt-10 text-sm">
              Precisa de ajuda? Entre em contato conosco.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
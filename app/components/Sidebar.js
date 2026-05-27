"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  function sair() {
    localStorage.removeItem("logado");
    router.push("/login");
  }

  function fecharMenu() {
    setAberto(false);
  }

  return (
    <>
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed top-4 left-4 z-50 bg-[#1d3557] text-white p-3 rounded-2xl md:hidden shadow-lg"
      >
        ☰
      </button>

      {aberto && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={fecharMenu}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-72 bg-[#fcfbf8] border-r border-black/5
          z-50 transition-transform duration-300 overflow-y-auto
          ${aberto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="min-h-screen flex flex-col justify-between">
          <div>
            <div className="p-6 md:p-8">
              <h1 className="text-5xl font-serif text-[#1d3557]">
                Ψ
              </h1>

              <h2 className="text-3xl font-serif text-[#1d3557] mt-2">
                Clínica Psi
              </h2>

              <p className="text-gray-500 mt-2">
                Gestão psicológica
              </p>
            </div>

            <nav className="px-5 mt-2 flex flex-col gap-2">
              <Link
                href="/"
                onClick={fecharMenu}
                className="bg-[#1d3557]/10 text-[#1d3557] font-medium p-4 rounded-2xl transition hover:bg-[#1d3557]/20"
              >
                🏠 Início
              </Link>

              <Link
                href="/pacientes"
                onClick={fecharMenu}
                className="text-[#1d3557] p-4 rounded-2xl transition hover:bg-[#1d3557]/10"
              >
                👥 Pacientes
              </Link>

              <Link
                href="/consultas"
                onClick={fecharMenu}
                className="text-[#1d3557] p-4 rounded-2xl transition hover:bg-[#1d3557]/10"
              >
                📋 Consultas
              </Link>

              <Link
                href="/financeiro"
                onClick={fecharMenu}
                className="text-[#1d3557] p-4 rounded-2xl transition hover:bg-[#1d3557]/10"
              >
                💰 Financeiro
              </Link>

              <Link
                href="/estoque"
                onClick={fecharMenu}
                className="text-[#1d3557] p-4 rounded-2xl transition hover:bg-[#1d3557]/10"
              >
                📦 Estoque
              </Link>
            </nav>
          </div>

          <div className="p-5 pb-6">
            <div className="bg-[#f5f1eb] rounded-3xl p-5 mb-4 border border-black/5">
              <p className="text-[#1d3557] font-semibold mb-2">
                Precisa de ajuda?
              </p>

              <p className="text-gray-500 text-sm mb-4">
                Fale com nossa equipe.
              </p>

              <button className="w-full border border-[#1d3557]/20 text-[#1d3557] p-3 rounded-2xl hover:bg-white transition">
                Entrar em contato
              </button>
            </div>

            <button
              onClick={sair}
              className="w-full bg-[#1d3557] hover:bg-[#16304d] text-white p-4 rounded-2xl transition"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
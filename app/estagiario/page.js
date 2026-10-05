"use client";

import { useState } from "react";
import {
  Home,
  Users,
  CalendarDays,
  FileText,
  Files,
  UserCircle,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

export default function EstagiarioPage() {
  const [menuAberto, setMenuAberto] = useState(false);

  const menu = [
    {
      nome: "Início",
      icone: Home,
      ativo: true,
    },
    {
      nome: "Meus pacientes",
      icone: Users,
    },
    {
      nome: "Minhas sessões",
      icone: CalendarDays,
    },
    {
      nome: "Minhas anotações",
      icone: FileText,
    },
    {
      nome: "Documentos",
      icone: Files,
    },
    {
      nome: "Meu perfil",
      icone: UserCircle,
    },
  ];

  function sair() {
    localStorage.removeItem("logado");
    localStorage.removeItem("tipo_usuario");
    localStorage.removeItem("id_estagiario");

    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">

      {/* BOTÃO MOBILE */}
      <button
        onClick={() => setMenuAberto(true)}
        className="fixed top-4 left-4 z-40 md:hidden bg-[#1d3557] text-white p-3 rounded-xl shadow-lg"
      >
        <Menu size={22} />
      </button>

      {/* FUNDO DO MENU MOBILE */}
      {menuAberto && (
        <div
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-[#1d3557] text-white
          flex flex-col
          transition-transform duration-300
          ${menuAberto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >

        {/* LOGO */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">

          <div className="flex items-center gap-3">

            <div className="bg-white/10 p-2 rounded-xl">
              <GraduationCap size={24} />
            </div>

            <div>
              <h1 className="font-bold text-lg">
                Clínica Psi
              </h1>

              <p className="text-xs text-white/60">
                Área do Estagiário
              </p>
            </div>

          </div>

          <button
            onClick={() => setMenuAberto(false)}
            className="md:hidden text-white/70 hover:text-white"
          >
            <X size={22} />
          </button>

        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2">

          {menu.map((item) => {

            const Icone = item.icone;

            return (
              <button
                key={item.nome}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  text-left transition
                  ${
                    item.ativo
                      ? "bg-white text-[#1d3557] shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }
                `}
              >

                <Icone size={20} />

                <span className="font-medium">
                  {item.nome}
                </span>

              </button>
            );
          })}

        </nav>

        {/* SAIR */}
        <div className="p-4 border-t border-white/10">

          <button
            onClick={sair}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:bg-red-500/20 hover:text-white transition"
          >
            <LogOut size={20} />

            <span className="font-medium">
              Sair
            </span>
          </button>

        </div>

      </aside>

      {/* CONTEÚDO */}
      <main className="min-h-screen md:ml-64 p-6 md:p-8">

        <div className="max-w-7xl mx-auto">

          {/* CABEÇALHO */}
          <div className="mb-8 pt-12 md:pt-0">

            <p className="text-sm text-gray-500 mb-1">
              Área do Estagiário
            </p>

            <h1 className="text-3xl font-bold text-[#1d3557]">
              Olá, estagiário! 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Acompanhe seus pacientes, sessões e atividades.
            </p>

          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Meus pacientes
                  </p>

                  <p className="text-3xl font-bold text-[#1d3557] mt-2">
                    0
                  </p>
                </div>

                <div className="bg-[#1d3557]/10 text-[#1d3557] p-3 rounded-xl">
                  <Users size={24} />
                </div>

              </div>

            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Próximas sessões
                  </p>

                  <p className="text-3xl font-bold text-[#1d3557] mt-2">
                    0
                  </p>
                </div>

                <div className="bg-[#1d3557]/10 text-[#1d3557] p-3 rounded-xl">
                  <CalendarDays size={24} />
                </div>

              </div>

            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Anotações
                  </p>

                  <p className="text-3xl font-bold text-[#1d3557] mt-2">
                    0
                  </p>
                </div>

                <div className="bg-[#1d3557]/10 text-[#1d3557] p-3 rounded-xl">
                  <FileText size={24} />
                </div>

              </div>

            </div>

          </div>

          {/* AVISO */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

            <div className="flex items-start gap-4">

              <div className="bg-[#1d3557]/10 text-[#1d3557] p-3 rounded-xl">
                <GraduationCap size={24} />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-[#1d3557]">
                  Área de estágio
                </h2>

                <p className="text-gray-500 mt-1 leading-relaxed">
                  Nesta área você poderá acompanhar os pacientes que
                  foram autorizados pelo seu supervisor, consultar suas
                  sessões e registrar as anotações permitidas.
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
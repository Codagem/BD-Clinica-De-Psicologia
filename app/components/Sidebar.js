"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  function sair() {
    localStorage.removeItem("logado");
    router.push("/login");
  }

  function fecharMenu() {
    setAberto(false);
  }

  const links = [
    { href: "/", label: "Início", icon: "⌂" },
    { href: "/pacientes", label: "Pacientes", icon: "◉" },
    { href: "/consultas", label: "Consultas", icon: "□" },
    { href: "/financeiro", label: "Financeiro", icon: "$" },
    { href: "/estoque", label: "Estoque", icon: "▣" },
  ];

  function estaAtivo(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed top-4 left-4 z-[60] md:hidden bg-[#1d3557] text-white w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition"
      >
        ☰
      </button>

      {aberto && (
        <div
          className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-40 md:hidden"
          onClick={fecharMenu}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-72 z-50
          bg-[#fcfbf8]/95 backdrop-blur-xl
          border-r border-[#1d3557]/10
          transition-transform duration-300 ease-out
          ${aberto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="h-full flex flex-col">
          <div className="px-7 pt-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-[#1d3557] text-white flex items-center justify-center shadow-sm">
                <span className="text-3xl font-serif">Ψ</span>
              </div>

              <div>
                <h1 className="text-2xl font-serif text-[#1d3557] leading-tight">
                  Clínica Psi
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Cuidado que transforma
                </p>
              </div>
            </div>
          </div>

          <nav className="px-4 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {links.map((link) => {
                const ativo = estaAtivo(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={fecharMenu}
                    className={`
                      group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl
                      transition-all duration-200
                      ${
                        ativo
                          ? "bg-[#1d3557] text-white shadow-sm"
                          : "text-[#1d3557] hover:bg-[#1d3557]/8 hover:translate-x-1"
                      }
                    `}
                  >
                    <span
                      className={`
                        w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-semibold
                        ${
                          ativo
                            ? "bg-white/15 text-white"
                            : "bg-[#1d3557]/8 text-[#1d3557]"
                        }
                      `}
                    >
                      {link.icon}
                    </span>

                    <span className="font-medium">
                      {link.label}
                    </span>

                    {ativo && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 px-4 py-5 rounded-3xl bg-gradient-to-br from-[#1d3557]/10 to-[#f3f1eb] border border-[#1d3557]/10">
              <p className="text-xs uppercase tracking-[0.2em] text-[#1d3557]/60 font-semibold">
                Sistema
              </p>

              <p className="text-[#1d3557] font-semibold mt-2">
                Clínica premium
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Gestão moderna para atendimento psicológico.
              </p>
            </div>
          </nav>

          <div className="p-4">
            <div className="rounded-3xl bg-white border border-[#1d3557]/10 shadow-sm p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1d3557]/10 text-[#1d3557] flex items-center justify-center font-bold">
                  D
                </div>

                <div className="min-w-0">
                  <p className="text-[#1d3557] font-semibold truncate">
                    Dra. Juliana
                  </p>

                  <p className="text-xs text-gray-500">
                    Psicóloga clínica
                  </p>
                </div>
              </div>

              <button className="w-full mt-4 border border-[#1d3557]/15 text-[#1d3557] py-3 rounded-2xl hover:bg-[#f3f1eb] transition">
                Suporte
              </button>
            </div>

            <button
              onClick={sair}
              className="w-full bg-[#1d3557] hover:bg-[#16304d] text-white py-4 rounded-2xl shadow-sm transition active:scale-[0.98]"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
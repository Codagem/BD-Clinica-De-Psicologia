"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  LogOut,
  LifeBuoy,
  Menu,
  X,
  User,
  ShieldCheck,
  Brain,
  GraduationCap,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [aberto, setAberto] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState("");

  // CARREGA O TIPO DE USUÁRIO SALVO NO NAVEGADOR
  useEffect(() => {
    const tipo = localStorage.getItem("tipo_usuario");
    setTipoUsuario(tipo || "admin");
  }, []);

  // FECHA O MENU MOBILE AO TROCAR DE PÁGINA
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  async function sair() {
    try {
      await fetch("/api/sessao", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
    } finally {
      localStorage.removeItem("logado");
      localStorage.removeItem("tipo_usuario");
      localStorage.removeItem("id_paciente");
      router.push("/login");
    }
  }

  function fecharMenu() {
    setAberto(false);
  }

  // MENU DO ADMINISTRADOR
  // A página geral /profissionais foi removida do menu.
  const linksAdmin = [
    { href: "/admin", label: "Início", icon: LayoutDashboard },
    { href: "/pacientes", label: "Pacientes", icon: Users },
    { href: "/consultas", label: "Consultas", icon: CalendarDays },
    { href: "/profissionais/psicologos", label: "Psicólogos", icon: Brain },
    {
      href: "/profissionais/estagiarios",
      label: "Estagiários",
      icon: GraduationCap,
    },
    { href: "/financeiro", label: "Financeiro", icon: Wallet },
    { href: "/admin/auditoria", label: "Auditoria", icon: ShieldCheck },
  ];

  // MENU DO PACIENTE
  const linksPaciente = [
    { href: "/cliente", label: "Minha área", icon: User },
  ];

  // NÃO MOSTRA NENHUM MENU ATÉ SABER QUEM É O USUÁRIO
  const links = !tipoUsuario
    ? []
    : tipoUsuario === "paciente"
    ? linksPaciente
    : linksAdmin;

  // DESTACA SOMENTE A PÁGINA ATUAL E SUAS SUBPÁGINAS
  function estaAtivo(href) {
    // "Início" só fica ativo em /admin exato,
    // para não competir com /admin/auditoria
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // SUPORTE
  function abrirSuporte() {
    window.open(
      "https://wa.me/5581999875045?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20sistema%20da%20cl%C3%ADnica.",
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      {/* BOTÃO DO MENU PARA CELULARES */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        className="fixed left-4 top-4 z-[60] flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d3557] text-white shadow-lg transition active:scale-95 md:hidden"
      >
        {aberto ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* FUNDO ESCURO DO MENU MOBILE */}
      {aberto && (
        <div
          className="fixed inset-0 z-40 bg-[#0f172a]/40 backdrop-blur-sm md:hidden"
          onClick={fecharMenu}
        />
      )}

      {/* BARRA LATERAL */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-[#1d3557]/10 bg-[#fcfbf8]/95 backdrop-blur-xl transition-transform duration-300 ease-out ${
          aberto ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* IDENTIDADE VISUAL */}
          <div className="px-7 pb-6 pt-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#1d3557] text-white shadow-sm">
                <span className="font-serif text-3xl">Ψ</span>
              </div>

              <div>
                <h1 className="font-serif text-2xl leading-tight text-[#1d3557]">
                  Clínica Psi
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Cuidado que transforma
                </p>
              </div>
            </div>
          </div>

          {/* NAVEGAÇÃO */}
          <nav className="flex-1 overflow-y-auto px-4">
            <div className="space-y-1">
              {links.map((link) => {
                const ativo = estaAtivo(link.href);
                const Icone = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={fecharMenu}
                    className={`group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                      ativo
                        ? "bg-[#1d3557] text-white shadow-sm"
                        : "text-[#1d3557] hover:translate-x-1 hover:bg-[#1d3557]/10"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200 ${
                        ativo
                          ? "bg-white/15 text-white"
                          : "bg-[#1d3557]/10 text-[#1d3557] group-hover:bg-white"
                      }`}
                    >
                      <Icone size={18} />
                    </span>

                    <span className="font-medium">{link.label}</span>

                    {ativo && (
                      <motion.span
                        layoutId="sidebar-active-dot"
                        className="ml-auto h-2 w-2 rounded-full bg-white"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* INFORMAÇÕES DO SISTEMA */}
            <div className="mt-8 rounded-3xl border border-[#1d3557]/10 bg-gradient-to-br from-[#1d3557]/10 to-[#f3f1eb] px-4 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d3557]/60">
                Sistema
              </p>

              <p className="mt-2 font-semibold text-[#1d3557]">
                {tipoUsuario === "paciente"
                  ? "Portal do paciente"
                  : "Clínica premium"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {tipoUsuario === "paciente"
                  ? "Acompanhe suas consultas e seus dados."
                  : "Gestão moderna para atendimento psicológico."}
              </p>
            </div>
          </nav>

          {/* SUPORTE E SESSÃO */}
          <div className="p-4">
            <div className="mb-4 rounded-3xl border border-[#1d3557]/10 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d3557]/10 font-bold text-[#1d3557]">
                  {tipoUsuario === "paciente" ? "P" : "D"}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1d3557]">
                    {tipoUsuario === "paciente" ? "Paciente" : "Dra. Juliana"}
                  </p>

                  <p className="text-xs text-gray-500">
                    {tipoUsuario === "paciente"
                      ? "Área do paciente"
                      : "Psicóloga clínica"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={abrirSuporte}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1d3557]/15 py-3 text-[#1d3557] transition hover:bg-[#f3f1eb]"
              >
                <LifeBuoy size={17} />
                Suporte
              </button>
            </div>

            {/* SAIR DO SISTEMA */}
            <button
              type="button"
              onClick={sair}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1d3557] py-4 text-white shadow-sm transition hover:bg-[#16304d] active:scale-[0.98]"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
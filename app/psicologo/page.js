"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  FileText,
  UserRound,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Clock3,
  CheckCircle2,
  CalendarCheck2,
  UserPlus,
  ClipboardPlus,
  ShieldCheck,
} from "lucide-react";

export default function Psicologo() {
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [nomePsicologo, setNomePsicologo] = useState("Psicólogo");

  useEffect(() => {
    const tipoUsuario = localStorage.getItem("tipo_usuario");
    const idPsicologo = localStorage.getItem("id_psicologo");
    const nomeUsuario = localStorage.getItem("nome_usuario");

    if (tipoUsuario !== "psicologo" || !idPsicologo) {
      router.push("/login");
      return;
    }

    if (nomeUsuario) {
      setNomePsicologo(nomeUsuario);
    }
  }, [router]);

  function sair() {
    localStorage.removeItem("logado");
    localStorage.removeItem("tipo_usuario");
    localStorage.removeItem("id_psicologo");
    localStorage.removeItem("nome_usuario");

    router.push("/login");
  }

  const menu = [
    {
      nome: "Dashboard",
      href: "/psicologo",
      icone: LayoutDashboard,
      ativo: true,
    },
    {
      nome: "Consultas",
      href: "/psicologo/consultas",
      icone: CalendarDays,
    },
    {
      nome: "Pacientes",
      href: "/psicologo/pacientes",
      icone: Users,
    },
    {
      nome: "Anamneses",
      href: "/psicologo/anamneses",
      icone: ClipboardList,
    },
    {
      nome: "Prontuários",
      href: "/psicologo/prontuarios",
      icone: FileText,
    },
    {
      nome: "Meu perfil",
      href: "/psicologo/perfil",
      icone: UserRound,
    },
  ];

  const metricas = [
    {
      titulo: "Meus pacientes",
      valor: "0",
      descricao: "Pacientes cadastrados",
      icone: Users,
    },
    {
      titulo: "Consultas hoje",
      valor: "0",
      descricao: "Atendimentos agendados",
      icone: CalendarCheck2,
    },
    {
      titulo: "Próximas consultas",
      valor: "0",
      descricao: "Atendimentos futuros",
      icone: Clock3,
    },
    {
      titulo: "Consultas realizadas",
      valor: "0",
      descricao: "Atendimentos concluídos",
      icone: CheckCircle2,
    },
  ];

  const atalhos = [
    {
      titulo: "Nova consulta",
      descricao: "Agendar atendimento",
      icone: CalendarCheck2,
      href: "/psicologo/consultas",
    },
    {
      titulo: "Meus pacientes",
      descricao: "Visualizar pacientes",
      icone: Users,
      href: "/psicologo/pacientes",
    },
    {
      titulo: "Nova anamnese",
      descricao: "Registrar informações",
      icone: ClipboardPlus,
      href: "/psicologo/anamneses",
    },
    {
      titulo: "Prontuários",
      descricao: "Consultar registros",
      icone: FileText,
      href: "/psicologo/prontuarios",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-gray-800">
      {/* MENU MOBILE */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-[#1d3557] text-white shadow-xl transition-transform duration-300 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* TOPO */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-200">
              Clínica
            </p>

            <h1 className="text-xl font-bold">
              Clínica Psi
            </h1>
          </div>

          <button
            onClick={() => setMenuAberto(false)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* PERFIL */}
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
              <UserRound size={22} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {nomePsicologo}
              </p>

              <p className="text-xs text-blue-200">
                Psicólogo
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Menu principal
          </p>

          {menu.map((item) => {
            const Icone = item.icone;

            return (
              <button
                key={item.nome}
                onClick={() => {
                  setMenuAberto(false);
                  router.push(item.href);
                }}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  item.ativo
                    ? "bg-white text-[#1d3557] shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icone size={19} />

                <span className="flex-1">
                  {item.nome}
                </span>

                {!item.ativo && (
                  <ChevronRight
                    size={16}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* SEGURANÇA */}
        <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-blue-200"
            />

            <div>
              <p className="text-xs font-semibold">
                Ambiente protegido
              </p>

              <p className="mt-1 text-[11px] leading-4 text-blue-200">
                Seus dados e informações dos pacientes são protegidos.
              </p>
            </div>
          </div>
        </div>

        {/* SAIR */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={sair}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut size={19} />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="lg:ml-72">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-5 shadow-sm backdrop-blur md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuAberto(true)}
              className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Área profissional
              </p>

              <h2 className="text-lg font-bold text-[#1d3557]">
                Dashboard
              </h2>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1d3557] text-sm font-bold text-white">
              {nomePsicologo.charAt(0).toUpperCase()}
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-700">
                {nomePsicologo}
              </p>

              <p className="text-xs text-gray-400">
                Psicólogo
              </p>
            </div>
          </div>
        </header>

        {/* DASHBOARD */}
        <div className="p-5 md:p-8">
          <div className="mx-auto max-w-7xl">
            {/* HERO */}
            <section className="overflow-hidden rounded-3xl bg-[#1d3557] p-6 text-white shadow-lg md:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="mb-2 text-sm font-medium text-blue-200">
                    Bem-vindo de volta
                  </p>

                  <h1 className="text-2xl font-bold md:text-3xl">
                    Olá, {nomePsicologo} 👋
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
                    Acompanhe seus atendimentos, pacientes e registros
                    clínicos em um único lugar.
                  </p>
                </div>

                <div className="hidden h-20 w-20 items-center justify-center rounded-2xl bg-white/10 md:flex">
                  <UserRound size={38} />
                </div>
              </div>
            </section>

            {/* MÉTRICAS */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metricas.map((item) => {
                const Icone = item.icone;

                return (
                  <div
                    key={item.titulo}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          {item.titulo}
                        </p>

                        <p className="mt-2 text-3xl font-bold text-[#1d3557]">
                          {item.valor}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {item.descricao}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d3557]/10 text-[#1d3557]">
                        <Icone size={21} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* GRID PRINCIPAL */}
            <section className="mt-6 grid gap-6 xl:grid-cols-3">
              {/* AGENDA */}
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <h3 className="font-bold text-[#1d3557]">
                      Agenda de hoje
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      Seus próximos atendimentos
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/psicologo/consultas")}
                    className="text-sm font-semibold text-[#1d3557] hover:underline"
                  >
                    Ver agenda
                  </button>
                </div>

                <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1d3557]/10 text-[#1d3557]">
                    <CalendarDays size={30} />
                  </div>

                  <h4 className="mt-4 font-semibold text-gray-700">
                    Nenhum atendimento agendado
                  </h4>

                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
                    Quando houver consultas marcadas para hoje, elas
                    aparecerão aqui.
                  </p>

                  <button
                    onClick={() => router.push("/psicologo/consultas")}
                    className="mt-5 rounded-xl bg-[#1d3557] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Acessar consultas
                  </button>
                </div>
              </div>

              {/* RESUMO */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-[#1d3557]">
                  Resumo profissional
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  Informações da sua área
                </p>

                <div className="mt-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1d3557]">
                      <Users size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Pacientes
                      </p>

                      <p className="text-xs text-gray-400">
                        Acesse sua lista de pacientes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1d3557]">
                      <ClipboardList size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Anamneses
                      </p>

                      <p className="text-xs text-gray-400">
                        Registros clínicos iniciais
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1d3557]">
                      <FileText size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Prontuários
                      </p>

                      <p className="text-xs text-gray-400">
                        Histórico dos atendimentos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ATALHOS */}
            <section className="mt-6">
              <div className="mb-4">
                <h3 className="font-bold text-[#1d3557]">
                  Acesso rápido
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Acesse rapidamente as principais funções
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {atalhos.map((item) => {
                  const Icone = item.icone;

                  return (
                    <button
                      key={item.titulo}
                      onClick={() => router.push(item.href)}
                      className="group rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d3557]/10 text-[#1d3557] transition group-hover:bg-[#1d3557] group-hover:text-white">
                          <Icone size={21} />
                        </div>

                        <ChevronRight
                          size={18}
                          className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#1d3557]"
                        />
                      </div>

                      <h4 className="mt-4 font-semibold text-gray-700">
                        {item.titulo}
                      </h4>

                      <p className="mt-1 text-xs text-gray-400">
                        {item.descricao}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* RODAPÉ */}
            <footer className="mt-10 border-t border-gray-200 py-6 text-center">
              <p className="text-xs text-gray-400">
                Clínica Psi • Área profissional
              </p>

              <p className="mt-1 text-[11px] text-gray-300">
                Sistema protegido para gerenciamento clínico.
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  Clock3,
  CheckCircle2,
  CalendarCheck2,
  ClipboardPlus,
} from "lucide-react";

/* =========================================================
   CONSTANTES E UTILITÁRIOS
   ========================================================= */

const MENU = [
  { nome: "Dashboard", href: "/psicologo", icone: LayoutDashboard, ativo: true },
  { nome: "Consultas", href: "/psicologo/consultas", icone: CalendarDays },
  { nome: "Pacientes", href: "/psicologo/pacientes", icone: Users },
  { nome: "Anamneses", href: "/psicologo/anamneses", icone: ClipboardList },
  { nome: "Prontuários", href: "/psicologo/prontuarios", icone: FileText },
  { nome: "Meu perfil", href: "/psicologo/perfil", icone: UserRound },
];

const ATALHOS = [
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

const RESUMO = [
  {
    titulo: "Pacientes",
    descricao: "Acesse sua lista de pacientes",
    href: "/psicologo/pacientes",
    icone: Users,
  },
  {
    titulo: "Anamneses",
    descricao: "Registros clínicos iniciais",
    href: "/psicologo/anamneses",
    icone: ClipboardList,
  },
  {
    titulo: "Prontuários",
    descricao: "Histórico dos atendimentos",
    href: "/psicologo/prontuarios",
    icone: FileText,
  },
];

async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

// Retorna a lista ou null (nunca lança erro)
async function buscarLista(url) {
  try {
    const resposta = await fetch(url, { method: "GET", cache: "no-store" });

    if (!resposta.ok) {
      return null;
    }

    const dados = await lerJson(resposta);

    return Array.isArray(dados) ? dados : null;
  } catch {
    return null;
  }
}

// Data de hoje no fuso do navegador, no formato AAAA-MM-DD
function hojeISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

// Usa só os 10 primeiros caracteres (AAAA-MM-DD) para evitar
// que o fuso horário mude o dia ao converter com new Date()
function diaDaConsulta(valor) {
  return typeof valor === "string" ? valor.slice(0, 10) : "";
}

function statusDaConsulta(consulta) {
  return String(consulta?.status_consulta || "").trim().toLowerCase();
}

function salvarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // localStorage indisponível (modo privado, por exemplo)
  }
}

function removerLocal(chave) {
  try {
    localStorage.removeItem(chave);
  } catch {
    // ignora
  }
}

/* =========================================================
   PÁGINA
   ========================================================= */

export default function Psicologo() {
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [nomePsicologo, setNomePsicologo] = useState("Psicólogo");
  const [especialidade, setEspecialidade] = useState("");
  const [consultas, setConsultas] = useState([]);
  const [totalPacientes, setTotalPacientes] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    let redirecionando = false;

    async function carregarPainel() {
      try {
        /* ---------- 1. SESSÃO ---------- */

        const respostaSessao = await fetch("/api/sessao", {
          method: "GET",
          cache: "no-store",
        });

        const sessao = respostaSessao.ok
          ? await lerJson(respostaSessao)
          : null;

        if (
          !sessao?.autenticado ||
          sessao.tipo_usuario !== "psicologo" ||
          !sessao.id_psicologo
        ) {
          redirecionando = true;
          router.replace("/login");
          return;
        }

        const idPsicologo = Number(sessao.id_psicologo);

        /* ---------- 2. DADOS (em paralelo) ---------- */

        const [psicologos, listaConsultas, listaPacientes] =
          await Promise.all([
            buscarLista("/api/psicologos"),
            buscarLista("/api/consultas"),
            buscarLista("/api/pacientes"),
          ]);

        if (!ativo) {
          return;
        }

        // Procura o psicólogo logado pelo ID da sessão,
        // em vez de assumir que ele é o primeiro da lista
        const psicologo = psicologos?.find(
          (item) => Number(item.id_psicologo) === idPsicologo
        );

        if (psicologo) {
          setNomePsicologo(psicologo.nome || "Psicólogo");
          setEspecialidade(psicologo.especialidade || "");

          // Mantém o nome disponível para telas que ainda usam localStorage
          salvarLocal("nome_usuario", psicologo.nome || "Psicólogo");
          salvarLocal("id_psicologo", String(idPsicologo));
        }

        setConsultas(listaConsultas ?? []);
        setTotalPacientes(listaPacientes ? listaPacientes.length : null);
      } catch (error) {
        console.error("Erro ao carregar o painel do psicólogo:", error);

        // Sem conseguir confirmar a sessão, não exibe a área restrita
        redirecionando = true;
        router.replace("/login");
      } finally {
        // Se está redirecionando, mantém a tela de carregamento
        if (ativo && !redirecionando) {
          setCarregando(false);
        }
      }
    }

    carregarPainel();

    return () => {
      ativo = false;
    };
  }, [router]);

  async function sair() {
    try {
      await fetch("/api/sessao", { method: "DELETE" });
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
    } finally {
      removerLocal("logado");
      removerLocal("tipo_usuario");
      removerLocal("id_psicologo");
      removerLocal("nome_usuario");

      router.replace("/login");
    }
  }

  /* ---------- MÉTRICAS E AGENDA ---------- */

  const { consultasHoje, metricas } = useMemo(() => {
    const hoje = hojeISO();

    const doDia = consultas
      .filter(
        (c) =>
          diaDaConsulta(c.data_consulta) === hoje &&
          statusDaConsulta(c) !== "cancelada"
      )
      .sort((a, b) => String(a.horario).localeCompare(String(b.horario)));

    const proximas = consultas.filter(
      (c) =>
        diaDaConsulta(c.data_consulta) > hoje &&
        statusDaConsulta(c) === "agendada"
    );

    const realizadas = consultas.filter(
      (c) => statusDaConsulta(c) === "realizada"
    );

    return {
      consultasHoje: doDia,
      metricas: [
        {
          titulo: "Meus pacientes",
          valor: totalPacientes === null ? "–" : String(totalPacientes),
          descricao: "Pacientes cadastrados",
          icone: Users,
        },
        {
          titulo: "Consultas hoje",
          valor: String(doDia.length),
          descricao: "Atendimentos agendados",
          icone: CalendarCheck2,
        },
        {
          titulo: "Próximas consultas",
          valor: String(proximas.length),
          descricao: "Atendimentos futuros",
          icone: Clock3,
        },
        {
          titulo: "Consultas realizadas",
          valor: String(realizadas.length),
          descricao: "Atendimentos concluídos",
          icone: CheckCircle2,
        },
      ],
    };
  }, [consultas, totalPacientes]);

  /* ---------- TELA DE CARREGAMENTO ---------- */

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] text-gray-500">
        Carregando...
      </div>
    );
  }

  /* ---------- PÁGINA ---------- */

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

            <p className="text-xl font-bold">Clínica Psi</p>
          </div>

          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* PERFIL */}
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
              {nomePsicologo.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold">{nomePsicologo}</p>

              <p className="truncate text-xs text-blue-200">
                {especialidade || "Psicólogo"}
              </p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-blue-200">
            Menu principal
          </p>

          <div className="space-y-1">
            {MENU.map((item) => {
              const Icone = item.icone;

              return (
                <Link
                  key={item.nome}
                  href={item.href}
                  onClick={() => setMenuAberto(false)}
                  aria-current={item.ativo ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                    item.ativo
                      ? "bg-white/10 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icone size={19} />

                  <span className="text-sm font-medium">{item.nome}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* RODAPÉ */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={sair}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="min-h-screen lg:ml-72">
        {/* HEADER MOBILE */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMenuAberto(true)}
            className="rounded-xl p-2 text-gray-700 hover:bg-gray-100"
          >
            <Menu size={23} />
          </button>

          <div className="text-right">
            <p className="text-sm font-semibold text-[#1d3557]">
              {nomePsicologo}
            </p>

            <p className="text-xs text-gray-500">Área profissional</p>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="p-5 md:p-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-[#1d3557]">
              Área profissional
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Olá, {nomePsicologo} 👋
            </h1>

            <p className="mt-2 max-w-2xl text-gray-500">
              Acompanhe seus atendimentos, pacientes e registros clínicos em
              um único lugar.
            </p>
          </div>

          {/* MÉTRICAS */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricas.map((metrica) => {
              const Icone = metrica.icone;

              return (
                <div
                  key={metrica.titulo}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d3557]/10 text-[#1d3557]">
                      <Icone size={20} />
                    </div>
                  </div>

                  <p className="text-sm font-medium text-gray-500">
                    {metrica.titulo}
                  </p>

                  <p className="mt-1 text-3xl font-bold text-gray-900">
                    {metrica.valor}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {metrica.descricao}
                  </p>
                </div>
              );
            })}
          </div>

          {/* AGENDA */}
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Agenda de hoje
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Seus próximos atendimentos
                  </p>
                </div>

                <Link
                  href="/psicologo/consultas"
                  className="text-sm font-semibold text-[#1d3557] hover:underline"
                >
                  Ver agenda
                </Link>
              </div>

              {consultasHoje.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                  <CalendarDays
                    className="mx-auto mb-3 text-gray-400"
                    size={30}
                  />

                  <p className="font-semibold text-gray-700">
                    Nenhum atendimento agendado
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Quando houver consultas marcadas para hoje, elas aparecerão
                    aqui.
                  </p>
                </div>
              ) : (
                <ul className="mt-6 space-y-3">
                  {consultasHoje.map((consulta, index) => (
                    <li
                      key={consulta.id_consulta ?? index}
                      className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4"
                    >
                      <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-[#1d3557]/10 text-sm font-bold text-[#1d3557]">
                        {String(consulta.horario || "").slice(0, 5) || "--:--"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900">
                          {consulta.nome_paciente || "Paciente"}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {consulta.tipo_atendimento || "Atendimento"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {consulta.status_consulta || "Agendada"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5">
                <Link
                  href="/psicologo/consultas"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d3557]"
                >
                  Acessar consultas
                </Link>
              </div>
            </div>

            {/* RESUMO */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Resumo profissional
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Informações da sua área
              </p>

              <div className="mt-6 space-y-3">
                {RESUMO.map((item) => {
                  const Icone = item.icone;

                  return (
                    <Link
                      key={item.titulo}
                      href={item.href}
                      className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4 transition hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d3557]/10 text-[#1d3557]">
                        <Icone size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.titulo}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.descricao}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ACESSO RÁPIDO */}
          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Acesso rápido
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Acesse rapidamente as principais funções
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {ATALHOS.map((atalho) => {
                const Icone = atalho.icone;

                return (
                  <Link
                    key={atalho.titulo}
                    href={atalho.href}
                    className="group rounded-2xl border border-gray-200 p-5 transition hover:-translate-y-0.5 hover:border-[#1d3557]/20 hover:shadow-sm"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d3557]/10 text-[#1d3557]">
                      <Icone size={20} />
                    </div>

                    <p className="font-semibold text-gray-900">
                      {atalho.titulo}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {atalho.descricao}
                    </p>

                    <div className="mt-4 text-xs font-semibold text-[#1d3557]">
                      Acessar →
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RODAPÉ */}
          <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
            Clínica Psi • Área profissional
            <br />
            Sistema protegido para gerenciamento clínico.
          </div>
        </div>
      </main>
    </div>
  );
}
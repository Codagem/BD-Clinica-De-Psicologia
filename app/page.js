"use client";

// =========================================
// IMPORTAÇÕES
// =========================================

import Protegido from "./components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Users,
  Wallet,
  Package,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

// =========================================
// COMPONENTE PRINCIPAL
// =========================================

export default function Dashboard() {
  // =========================================
  // STATES PRINCIPAIS
  // =========================================

  const [carregando, setCarregando] = useState(true);
  const [consultas, setConsultas] = useState([]);

  const [dados, setDados] = useState({
    pacientes: 0,
    consultas: 0,
    receitas: 0,
    despesas: 0,
    lucro: 0,
    estoqueBaixo: 0,
  });

  // =========================================
  // CARREGAR DASHBOARD
  // =========================================

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const respostaDashboard = await fetch("/api/dashboard");
        const resultadoDashboard = await respostaDashboard.json();

        const respostaConsultas = await fetch("/api/consultas");
        const resultadoConsultas = await respostaConsultas.json();

        setDados(resultadoDashboard);

        if (Array.isArray(resultadoConsultas)) {
          setConsultas(resultadoConsultas);
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  // =========================================
  // FORMATAR VALOR
  // =========================================

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // =========================================
  // FORMATAR DATA INPUT
  // =========================================

  function formatarDataInput(data) {
    if (!data) return "";
    return String(data).slice(0, 10);
  }

  // =========================================
  // FORMATAR HORA
  // =========================================

  function formatarHora(hora) {
    return hora?.slice(0, 5) || "-";
  }

  // =========================================
  // DATA DE HOJE
  // =========================================

  function dataHojeInput() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  // =========================================
  // CONSULTAS DE HOJE
  // =========================================

  const consultasHoje = consultas
    .filter((consulta) => formatarDataInput(consulta.data_consulta) === dataHojeInput())
    .sort((a, b) => String(a.horario || "").localeCompare(String(b.horario || "")));

  // =========================================
  // GRÁFICO DE STATUS
  // =========================================

  const dadosStatus = [
    {
      nome: "Agendadas",
      valor: consultas.filter((c) => c.status_consulta === "Agendado").length,
    },
    {
      nome: "Confirmadas",
      valor: consultas.filter((c) => c.status_consulta === "Confirmado").length,
    },
    {
      nome: "Realizadas",
      valor: consultas.filter((c) => c.status_consulta === "Realizado").length,
    },
    {
      nome: "Canceladas",
      valor: consultas.filter((c) => c.status_consulta === "Cancelado").length,
    },
    {
      nome: "Faltou",
      valor: consultas.filter((c) => c.status_consulta === "Faltou").length,
    },
  ];

  // =========================================
  // GRÁFICO POR TIPO
  // =========================================

  const dadosTipo = [
    {
      nome: "Presencial",
      valor: consultas.filter((c) => c.tipo_atendimento === "Presencial").length,
    },
    {
      nome: "Online",
      valor: consultas.filter((c) => c.tipo_atendimento === "Online").length,
    },
  ];

  // =========================================
  // GRÁFICO FINANCEIRO
  // =========================================

  const dadosFinanceiros = [
    { nome: "Receitas", valor: Number(dados.receitas || 0) },
    { nome: "Despesas", valor: Number(dados.despesas || 0) },
    { nome: "Lucro", valor: Number(dados.lucro || 0) },
  ];

  // =========================================
  // GRÁFICO SEMANAL SIMPLES
  // =========================================

  const dadosGrafico = [
    { dia: "Seg", consultas: 8 },
    { dia: "Ter", consultas: 12 },
    { dia: "Qua", consultas: 6 },
    { dia: "Qui", consultas: 15 },
    { dia: "Sex", consultas: 10 },
    { dia: "Sáb", consultas: 4 },
    { dia: "Dom", consultas: 2 },
  ];

  // =========================================
  // CORES DOS GRÁFICOS
  // =========================================

  const cores = ["#1d3557", "#2b4c7e", "#457b9d", "#e63946", "#f4a261"];

  // =========================================
  // TELA
  // =========================================

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          {/* =========================================
              CABEÇALHO
          ========================================= */}

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
            <div>
              <p className="text-[#2b4c7e] font-semibold mb-2">
                Painel principal
              </p>

              <h1 className="text-3xl md:text-5xl font-bold text-[#1d3557] tracking-tight">
                Olá, Dra. Juliana 👋
              </h1>

              <p className="text-gray-500 mt-3 max-w-xl">
                Acompanhe pacientes, consultas, finanças e a rotina da clínica
                em um painel moderno e organizado.
              </p>
            </div>

            <div className="bg-white rounded-3xl px-5 py-4 shadow-sm border border-[#1d3557]/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1d3557]/10 text-[#1d3557] flex items-center justify-center font-bold">
                D
              </div>

              <div>
                <p className="text-sm text-gray-500">Perfil ativo</p>
                <p className="font-semibold text-[#1d3557]">
                  Dra. Juliana Mendes
                </p>
              </div>
            </div>
          </div>

          {carregando ? (
            <SkeletonDashboard />
          ) : (
            <>
              {/* =========================================
                  CARDS PRINCIPAIS
              ========================================= */}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                <Card
                  titulo="Consultas"
                  valor={dados.consultas}
                  descricao="Atendimentos registrados"
                  icone={<ClipboardList size={26} />}
                />

                <Card
                  titulo="Pacientes"
                  valor={dados.pacientes}
                  descricao="Base ativa da clínica"
                  icone={<Users size={26} />}
                />

                <Card
                  titulo="Receitas"
                  valor={formatarValor(dados.receitas)}
                  descricao="Total recebido"
                  icone={<Wallet size={26} />}
                  menor
                />

                <Card
                  titulo="Estoque baixo"
                  valor={dados.estoqueBaixo}
                  descricao="Itens precisam atenção"
                  icone={<Package size={26} />}
                />
              </div>

              {/* =========================================
                  VISÃO GERAL
              ========================================= */}

              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 mb-6">
                <div className="bg-white rounded-[34px] border border-[#1d3557]/10 shadow-sm p-6 md:p-8 overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                      <div>
                        <p className="text-[#2b4c7e] font-semibold mb-2">
                          Visão geral
                        </p>

                        <h2 className="text-3xl md:text-4xl font-bold text-[#1d3557]">
                          Clínica em crescimento
                        </h2>

                        <p className="text-gray-500 mt-3 max-w-md">
                          Um resumo visual da operação para facilitar decisões no dia a dia.
                        </p>
                      </div>

                      <Link
                        href="/consultas"
                        className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition text-center"
                      >
                        Novo agendamento
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Indicador
                        titulo="Lucro líquido"
                        valor={formatarValor(dados.lucro)}
                        detalhe="Resultado atual"
                      />

                      <Indicador
                        titulo="Despesas"
                        valor={formatarValor(dados.despesas)}
                        detalhe="Custos registrados"
                      />

                      <Indicador
                        titulo="Receitas"
                        valor={formatarValor(dados.receitas)}
                        detalhe="Entradas financeiras"
                      />
                    </div>

                    <div className="mt-8 bg-[#f3f1eb] rounded-3xl p-5">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dadosGrafico}>
                            <XAxis dataKey="dia" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />

                            <Tooltip
                              cursor={{ fill: "transparent" }}
                              contentStyle={{
                                borderRadius: "16px",
                                border: "none",
                                background: "#1d3557",
                                color: "white",
                              }}
                            />

                            <Bar
                              dataKey="consultas"
                              radius={[12, 12, 0, 0]}
                              fill="#1d3557"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <p className="text-xs text-gray-500 mt-4">
                        Consultas previstas por dia da semana
                      </p>
                    </div>
                  </div>

                  <div className="absolute right-8 bottom-0 text-[220px] opacity-[0.04] text-[#1d3557] select-none">
                    Ψ
                  </div>
                </div>

                {/* =========================================
                    AGENDA DE HOJE
                ========================================= */}

                <div className="bg-[#1d3557] rounded-[34px] shadow-sm p-6 md:p-7 text-white overflow-hidden relative">
                  <div className="relative z-10">
                    <p className="text-blue-100 font-semibold mb-2">
                      Agenda de hoje
                    </p>

                    <h2 className="text-3xl font-bold mb-6">
                      Próximos horários
                    </h2>

                    <div className="space-y-3">
                      {consultasHoje.slice(0, 5).map((consulta) => (
                        <Agendamento
                          key={consulta.id_consulta}
                          hora={formatarHora(consulta.horario)}
                          nome={consulta.paciente || "Paciente"}
                          tipo={consulta.tipo_atendimento || "Consulta"}
                        />
                      ))}

                      {consultasHoje.length === 0 && (
                        <div className="bg-white/10 rounded-2xl p-5 text-blue-100">
                          Nenhuma consulta marcada para hoje.
                        </div>
                      )}
                    </div>

                    <Link
                      href="/consultas"
                      className="block w-full mt-6 bg-white text-[#1d3557] py-3 rounded-2xl font-semibold hover:bg-[#f3f1eb] hover:scale-[1.02] active:scale-[0.98] transition text-center"
                    >
                      Ver agenda completa
                    </Link>
                  </div>

                  <div className="absolute -right-10 -bottom-12 w-44 h-44 rounded-full bg-white/10" />
                  <div className="absolute right-16 top-20 w-20 h-20 rounded-full bg-white/10" />
                </div>
              </div>

              {/* =========================================
                  GRÁFICOS PROFISSIONAIS
              ========================================= */}

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <GraficoCard titulo="Status das consultas">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={dadosStatus}
                        dataKey="valor"
                        nameKey="nome"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {dadosStatus.map((item, index) => (
                          <Cell
                            key={item.nome}
                            fill={cores[index % cores.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </GraficoCard>

                <GraficoCard titulo="Tipos de atendimento">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dadosTipo}>
                      <XAxis dataKey="nome" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />

                      <Bar
                        dataKey="valor"
                        radius={[12, 12, 0, 0]}
                        fill="#1d3557"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </GraficoCard>

                <GraficoCard titulo="Financeiro">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={dadosFinanceiros}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="nome" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="valor"
                        stroke="#1d3557"
                        strokeWidth={4}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </GraficoCard>
              </div>

              {/* =========================================
                  MINI CARDS
              ========================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <MiniCard
                  titulo="Agenda"
                  texto="Organize horários, retornos e novos atendimentos."
                  icone={<CalendarDays size={26} />}
                />

                <MiniCard
                  titulo="Consultas"
                  texto="Acompanhe consultas marcadas, realizadas e canceladas."
                  icone={<ClipboardList size={26} />}
                />

                <MiniCard
                  titulo="Pacientes"
                  texto="Gerencie cadastros, telefones e dados principais."
                  icone={<Users size={26} />}
                />

                <MiniCard
                  titulo="Crescimento"
                  texto="Acompanhe indicadores da clínica em tempo real."
                  icone={<TrendingUp size={26} />}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </Protegido>
  );
}

// =========================================
// SKELETON
// =========================================

function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white rounded-3xl p-6 border border-[#1d3557]/10 shadow-sm"
          >
            <div className="h-4 w-28 bg-[#e8e3d8] rounded-full mb-5" />
            <div className="h-10 w-24 bg-[#e8e3d8] rounded-full mb-4" />
            <div className="h-3 w-36 bg-[#e8e3d8] rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white rounded-[34px] p-8 border border-[#1d3557]/10 shadow-sm">
          <div className="h-5 w-32 bg-[#e8e3d8] rounded-full mb-5" />
          <div className="h-10 w-80 max-w-full bg-[#e8e3d8] rounded-full mb-5" />
          <div className="h-4 w-96 max-w-full bg-[#e8e3d8] rounded-full mb-8" />
          <div className="h-64 bg-[#f3f1eb] rounded-3xl" />
        </div>

        <div className="bg-[#1d3557] rounded-[34px] p-7 shadow-sm">
          <div className="h-4 w-32 bg-white/20 rounded-full mb-5" />
          <div className="h-9 w-56 bg-white/20 rounded-full mb-8" />

          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-16 bg-white/10 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================
// CARD PRINCIPAL
// =========================================

function Card({ titulo, valor, descricao, icone, menor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl p-6 border border-[#1d3557]/10 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-gray-500 text-sm">{titulo}</p>

          <h2
            className={`font-bold text-[#1d3557] mt-3 ${
              menor ? "text-2xl md:text-3xl" : "text-4xl"
            }`}
          >
            {valor}
          </h2>

          <p className="text-xs text-gray-400 mt-2">{descricao}</p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#1d3557]/10 flex items-center justify-center text-2xl text-[#1d3557]">
          {icone}
        </div>
      </div>
    </motion.div>
  );
}

// =========================================
// INDICADOR
// =========================================

function Indicador({ titulo, valor, detalhe }) {
  return (
    <div className="bg-[#fbfaf7] rounded-3xl p-5 border border-[#1d3557]/10">
      <p className="text-gray-500 text-sm">{titulo}</p>
      <h3 className="text-xl font-bold text-[#1d3557] mt-2">{valor}</h3>
      <p className="text-xs text-gray-400 mt-1">{detalhe}</p>
    </div>
  );
}

// =========================================
// AGENDAMENTO
// =========================================

function Agendamento({ hora, nome, tipo }) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-3 bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
      <strong className="text-white">{hora}</strong>

      <div>
        <p className="font-semibold">{nome}</p>
        <p className="text-sm text-blue-100">{tipo}</p>
      </div>
    </div>
  );
}

// =========================================
// MINI CARD
// =========================================

function MiniCard({ titulo, texto, icone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl p-6 border border-[#1d3557]/10 shadow-sm hover:shadow-md transition"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#1d3557]/10 flex items-center justify-center text-2xl text-[#1d3557] mb-5">
        {icone}
      </div>

      <h3 className="text-xl font-bold text-[#1d3557] mb-2">{titulo}</h3>

      <p className="text-gray-500 text-sm leading-relaxed">{texto}</p>
    </motion.div>
  );
}

// =========================================
// CARD DE GRÁFICO
// =========================================

function GraficoCard({ titulo, children }) {
  return (
    <div className="bg-white rounded-[34px] border border-[#1d3557]/10 shadow-sm p-6">
      <h3 className="text-xl font-bold text-[#1d3557] mb-5">{titulo}</h3>
      {children}
    </div>
  );
}
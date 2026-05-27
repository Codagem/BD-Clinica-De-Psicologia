"use client";

import Protegido from "./components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";

export default function Dashboard() {
  const [dados, setDados] = useState({
    pacientes: 0,
    consultas: 0,
    receitas: 0,
    despesas: 0,
    lucro: 0,
    estoqueBaixo: 0,
  });

  useEffect(() => {
    async function carregarDashboard() {
      const resposta = await fetch("/api/dashboard");
      const resultado = await resposta.json();
      setDados(resultado);
    }

    carregarDashboard();
  }, []);

  return (
    <Protegido>
      <div className="min-h-screen bg-[#fbfaf7] overflow-x-hidden">
        <Sidebar />

        <main className="md:ml-72 p-4 pt-20 md:p-10 md:w-[calc(100%-18rem)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-[#1d3557]">
                Olá, Dra. Juliana! 👋
              </h1>

              <p className="text-gray-500 mt-2">
                Aqui está o resumo da sua clínica hoje.
              </p>
            </div>

            <div className="bg-white rounded-3xl px-5 py-4 shadow-sm border border-black/5">
              <p className="text-sm text-gray-500">Perfil</p>
              <p className="font-semibold text-[#1d3557]">
                Dra. Juliana Mendes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            <Card titulo="Agendamentos hoje" valor={dados.consultas} icone="📅" />
            <Card titulo="Consultas hoje" valor={dados.consultas} icone="📋" />
            <Card titulo="Pacientes ativos" valor={dados.pacientes} icone="👥" />
            <Card titulo="Faturamento" valor={`R$ ${dados.receitas}`} icone="💰" menor />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-[32px] border border-black/5 shadow-sm p-8 min-h-[280px] overflow-hidden relative">
              <div className="relative z-10 max-w-md">
                <h2 className="text-3xl md:text-4xl font-serif text-[#1d3557]">
                  Cuidado, ciência
                  <br />
                  e empatia.
                </h2>

                <p className="text-gray-500 mt-5">
                  Gerencie sua clínica de forma organizada e foque no que
                  realmente importa: seus pacientes.
                </p>

                <button className="bg-[#1d3557] text-white px-6 py-4 rounded-2xl mt-8 hover:bg-[#16304d] transition">
                  Novo agendamento
                </button>
              </div>

              <div className="absolute right-6 bottom-0 text-[180px] opacity-[0.06] text-[#1d3557]">
                Ψ
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-black/5 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-serif text-[#1d3557]">
                  Próximos agendamentos
                </h2>

                <span className="text-sm text-[#1d3557] font-medium">
                  Ver agenda →
                </span>
              </div>

              <div className="space-y-3">
                <Agendamento hora="08:00" nome="Maria Oliveira" tipo="Consulta" />
                <Agendamento hora="09:30" nome="Carlos Souza" tipo="Retorno" />
                <Agendamento hora="11:00" nome="Ana Clara" tipo="Consulta" />
                <Agendamento hora="14:00" nome="João Pedro" tipo="Consulta" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <MiniCard titulo="Agenda" texto="Veja os horários e próximos atendimentos." icone="📅" />
            <MiniCard titulo="Consultas" texto="Acompanhe consultas marcadas e realizadas." icone="📋" />
            <MiniCard titulo="Pacientes" texto="Gerencie cadastros, telefones e dados clínicos." icone="👥" />
            <MiniCard titulo="Financeiro" texto={`Receitas: R$ ${dados.receitas}`} icone="💰" />
          </div>
        </main>
      </div>
    </Protegido>
  );
}

function Card({ titulo, valor, icone, menor }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-gray-500">{titulo}</p>
          <h2
            className={`font-bold text-[#1d3557] mt-3 ${
              menor ? "text-2xl md:text-3xl" : "text-4xl"
            }`}
          >
            {valor}
          </h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#1d3557]/10 flex items-center justify-center text-2xl">
          {icone}
        </div>
      </div>
    </div>
  );
}

function Agendamento({ hora, nome, tipo }) {
  return (
    <div className="grid grid-cols-[70px_1fr_auto] items-center gap-3 border-b border-gray-100 pb-3 text-sm">
      <strong className="text-[#1d3557]">{hora}</strong>
      <span className="text-gray-700">{nome}</span>
      <span className="bg-[#1d3557]/10 text-[#1d3557] px-3 py-1 rounded-full">
        {tipo}
      </span>
    </div>
  );
}

function MiniCard({ titulo, texto, icone }) {
  return (
    <div className="bg-white rounded-[28px] p-6 border border-black/5 shadow-sm hover:-translate-y-1 transition">
      <div className="w-12 h-12 rounded-2xl bg-[#1d3557]/10 flex items-center justify-center text-2xl mb-5">
        {icone}
      </div>

      <h3 className="text-xl font-serif text-[#1d3557] mb-2">{titulo}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{texto}</p>
    </div>
  );
}
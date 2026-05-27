"use client";

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
} from "lucide-react";

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

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
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
                  <div className="flex items-end gap-3 h-40">
                    <Barra dia="Seg" valor="8" altura="45%" />
                    <Barra dia="Ter" valor="12" altura="65%" />
                    <Barra dia="Qua" valor="6" altura="35%" />
                    <Barra dia="Qui" valor="15" altura="85%" />
                    <Barra dia="Sex" valor="10" altura="60%" />
                    <Barra dia="Sáb" valor="4" altura="25%" />
                    <Barra dia="Dom" valor="2" altura="15%" />
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

            <div className="bg-[#1d3557] rounded-[34px] shadow-sm p-6 md:p-7 text-white overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-blue-100 font-semibold mb-2">
                  Agenda de hoje
                </p>

                <h2 className="text-3xl font-bold mb-6">
                  Próximos horários
                </h2>

                <div className="space-y-3">
                  <Agendamento
                    hora="08:00"
                    nome="Maria Oliveira"
                    tipo="Consulta"
                  />

                  <Agendamento
                    hora="09:30"
                    nome="Carlos Souza"
                    tipo="Retorno"
                  />

                  <Agendamento
                    hora="11:00"
                    nome="Ana Clara"
                    tipo="Consulta"
                  />

                  <Agendamento
                    hora="14:00"
                    nome="João Pedro"
                    tipo="Consulta"
                  />
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
              titulo="Financeiro"
              texto={`Receitas atuais: ${formatarValor(dados.receitas)}`}
              icone={<Wallet size={26} />}
            />
          </div>
        </main>
      </div>
    </Protegido>
  );
}

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
          <p className="text-gray-500 text-sm">
            {titulo}
          </p>

          <h2
            className={`font-bold text-[#1d3557] mt-3 ${
              menor ? "text-2xl md:text-3xl" : "text-4xl"
            }`}
          >
            {valor}
          </h2>

          <p className="text-xs text-gray-400 mt-2">
            {descricao}
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#1d3557]/10 flex items-center justify-center text-2xl text-[#1d3557]">
          {icone}
        </div>
      </div>
    </motion.div>
  );
}

function Indicador({ titulo, valor, detalhe }) {
  return (
    <div className="bg-[#fbfaf7] rounded-3xl p-5 border border-[#1d3557]/10">
      <p className="text-gray-500 text-sm">
        {titulo}
      </p>

      <h3 className="text-xl font-bold text-[#1d3557] mt-2">
        {valor}
      </h3>

      <p className="text-xs text-gray-400 mt-1">
        {detalhe}
      </p>
    </div>
  );
}

function Barra({ dia, valor, altura }) {
  return (
    <div className="flex-1 h-full flex flex-col justify-end items-center gap-2">
      <span className="text-xs font-semibold text-[#1d3557]">
        {valor}
      </span>

      <div className="w-full bg-white rounded-full overflow-hidden flex items-end h-full">
        <div
          className="w-full bg-[#1d3557] rounded-full transition-all"
          style={{ height: altura }}
        />
      </div>

      <span className="text-xs text-gray-500">
        {dia}
      </span>
    </div>
  );
}

function Agendamento({ hora, nome, tipo }) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-3 bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
      <strong className="text-white">
        {hora}
      </strong>

      <div>
        <p className="font-semibold">
          {nome}
        </p>

        <p className="text-sm text-blue-100">
          {tipo}
        </p>
      </div>
    </div>
  );
}

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

      <h3 className="text-xl font-bold text-[#1d3557] mb-2">
        {titulo}
      </h3>

      <p className="text-gray-500 text-sm leading-relaxed">
        {texto}
      </p>
    </motion.div>
  );
}
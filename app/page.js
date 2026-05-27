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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
              <p className="text-gray-500">Pacientes ativos</p>
              <h2 className="text-4xl font-bold text-[#1d3557] mt-3">
                {dados.pacientes}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
              <p className="text-gray-500">Consultas</p>
              <h2 className="text-4xl font-bold text-[#1d3557] mt-3">
                {dados.consultas}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
              <p className="text-gray-500">Receitas</p>
              <h2 className="text-3xl font-bold text-[#1d3557] mt-3">
                R$ {dados.receitas}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
              <p className="text-gray-500">Estoque baixo</p>
              <h2 className="text-4xl font-bold text-[#1d3557] mt-3">
                {dados.estoqueBaixo}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-6">
            <div className="bg-white rounded-[32px] border border-black/5 shadow-sm p-8 min-h-[260px] flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1d3557]">
                Cuidado, ciência
                <br />
                e empatia.
              </h2>

              <p className="text-gray-500 mt-5 max-w-lg">
                Gerencie sua clínica de forma organizada e foque no que
                realmente importa: seus pacientes.
              </p>

              <button className="bg-[#1d3557] text-white px-6 py-4 rounded-2xl mt-8 w-fit hover:bg-[#16304d] transition">
                Novo agendamento
              </button>
            </div>

            <div className="bg-white rounded-[32px] border border-black/5 shadow-sm p-8">
              <h2 className="text-2xl font-serif text-[#1d3557] mb-6">
                Resumo financeiro
              </h2>

              <div className="space-y-5">
                <div className="flex justify-between border-b pb-4">
                  <span className="text-gray-500">Receitas</span>
                  <strong className="text-[#1d3557]">
                    R$ {dados.receitas}
                  </strong>
                </div>

                <div className="flex justify-between border-b pb-4">
                  <span className="text-gray-500">Despesas</span>
                  <strong className="text-[#1d3557]">
                    R$ {dados.despesas}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Lucro líquido</span>
                  <strong className="text-[#1d3557]">
                    R$ {dados.lucro}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Protegido>
  );
}
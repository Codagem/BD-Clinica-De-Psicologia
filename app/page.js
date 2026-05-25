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
      <div className="bg-gray-100 min-h-screen">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-black">
            Dashboard
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow">
              <h2 className="text-gray-500 text-base md:text-lg">Pacientes</h2>
              <p className="text-3xl md:text-4xl font-bold text-black mt-4 break-words">
                {dados.pacientes}
              </p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl shadow">
              <h2 className="text-gray-500 text-base md:text-lg">Consultas</h2>
              <p className="text-3xl md:text-4xl font-bold text-black mt-4 break-words">
                {dados.consultas}
              </p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl shadow">
              <h2 className="text-gray-500 text-base md:text-lg">Receitas</h2>
              <p className="text-3xl md:text-4xl font-bold text-black mt-4 break-words">
                R$ {dados.receitas}
              </p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl shadow">
              <h2 className="text-gray-500 text-base md:text-lg">
                Estoque Baixo
              </h2>
              <p className="text-3xl md:text-4xl font-bold text-black mt-4 break-words">
                {dados.estoqueBaixo}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow">
              <h2 className="text-gray-500 text-base md:text-lg">Despesas</h2>
              <p className="text-3xl md:text-4xl font-bold text-black mt-4 break-words">
                R$ {dados.despesas}
              </p>
            </div>

            <div className="bg-black p-5 md:p-6 rounded-2xl shadow md:col-span-2">
              <h2 className="text-gray-300 text-base md:text-lg">
                Lucro Líquido
              </h2>
              <p className="text-3xl md:text-4xl font-bold text-white mt-4 break-words">
                R$ {dados.lucro}
              </p>
            </div>
          </div>
        </main>
      </div>
    </Protegido>
  );
}
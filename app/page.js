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

      const resposta = await fetch(
        "/api/dashboard"
      );

      const resultado = await resposta.json();

      setDados(resultado);

    }

    carregarDashboard();

  }, []);

  return (

    <Protegido>

      <div className="flex bg-gray-100 min-h-screen">

        <Sidebar />

        <main className="ml-64 p-10 w-full">

          <h1 className="text-4xl font-bold mb-10 text-black">
            Dashboard
          </h1>

          <div className="grid grid-cols-4 gap-6">

            <div className="bg-white p-6 rounded-2xl shadow">

              <h2 className="text-gray-500">
                Pacientes
              </h2>

              <p className="text-4xl font-bold text-black mt-4">
                {dados.pacientes}
              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow">

              <h2 className="text-gray-500">
                Consultas
              </h2>

              <p className="text-4xl font-bold text-black mt-4">
                {dados.consultas}
              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow">

              <h2 className="text-gray-500">
                Receitas
              </h2>

              <p className="text-4xl font-bold text-black mt-4">
                R$ {dados.receitas}
              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow">

              <h2 className="text-gray-500">
                Estoque Baixo
              </h2>

              <p className="text-4xl font-bold text-black mt-4">
                {dados.estoqueBaixo}
              </p>

            </div>

          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">

            <div className="bg-white p-6 rounded-2xl shadow">

              <h2 className="text-gray-500">
                Despesas
              </h2>

              <p className="text-4xl font-bold text-black mt-4">
                R$ {dados.despesas}
              </p>

            </div>

            <div className="bg-black p-6 rounded-2xl shadow col-span-2">

              <h2 className="text-gray-300">
                Lucro Líquido
              </h2>

              <p className="text-4xl font-bold text-white mt-4">
                R$ {dados.lucro}
              </p>

            </div>

          </div>

        </main>

      </div>

    </Protegido>

  );
}
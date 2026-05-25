"use client";

import Protegido from "../components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Financeiro() {
  const [dados, setDados] = useState({
    resumo: {},
    pagamentos: [],
    despesas: [],
  });

  async function carregarFinanceiro() {
    const resposta = await fetch(
      "/api/financeiro"
    );

    const resultado = await resposta.json();

    setDados(resultado);
  }

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  return (

    <Protegido>

      <div className="flex bg-gray-100 min-h-screen">

        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">

          <h1 className="text-4xl font-bold text-black mb-10">
            Financeiro
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">

            <div className="bg-white p-6 rounded-2xl shadow">

              <h2 className="text-gray-500">
                Receitas
              </h2>

              <p className="text-4xl font-bold text-black mt-4">
                R$ {dados.resumo.total_receitas || 0}
              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow">

              <h2 className="text-gray-500">
                Despesas
              </h2>

              <p className="text-4xl font-bold text-black mt-4">
                R$ {dados.resumo.total_despesas || 0}
              </p>

            </div>

            <div className="bg-black p-6 rounded-2xl shadow">

              <h2 className="text-gray-300">
                Lucro Líquido
              </h2>

              <p className="text-4xl font-bold text-white mt-4">
                R$ {dados.resumo.lucro_liquido || 0}
              </p>

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow overflow-hidden mb-10">

            <div className="bg-black text-white p-4 text-xl font-bold">
              Pagamentos
            </div>

            <table className="w-full">

              <thead className="bg-gray-200 text-black">

                <tr>

                  <th className="text-left p-4">
                    Paciente
                  </th>

                  <th className="text-left p-4">
                    Valor
                  </th>

                  <th className="text-left p-4">
                    Forma
                  </th>

                  <th className="text-left p-4">
                    Status
                  </th>

                  <th className="text-left p-4">
                    Data
                  </th>

                </tr>

              </thead>

              <tbody className="text-black">

                {dados.pagamentos.map((pagamento) => (

                  <tr
                    key={pagamento.id_pagamento}
                    className="border-b"
                  >

                    <td className="p-4">
                      {pagamento.paciente}
                    </td>

                    <td className="p-4">
                      R$ {pagamento.valor}
                    </td>

                    <td className="p-4">
                      {pagamento.forma_pagamento}
                    </td>

                    <td className="p-4">

                      <span className="bg-gray-200 px-3 py-1 rounded-full">

                        {pagamento.status_pagamento}

                      </span>

                    </td>

                    <td className="p-4">
                      {formatarData(pagamento.data_pagamento)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div className="bg-white rounded-2xl shadow overflow-x-auto">

            <div className="bg-black text-white p-4 text-xl font-bold">
              Despesas
            </div>

            <table className="w-full min-w-[1000px]">

              <thead className="bg-gray-200 text-black">

                <tr>

                  <th className="text-left p-4">
                    Descrição
                  </th>

                  <th className="text-left p-4">
                    Categoria
                  </th>

                  <th className="text-left p-4">
                    Valor
                  </th>

                  <th className="text-left p-4">
                    Data
                  </th>

                </tr>

              </thead>

              <tbody className="text-black">

                {dados.despesas.map((despesa) => (

                  <tr
                    key={despesa.id_despesa}
                    className="border-b"
                  >

                    <td className="p-4">
                      {despesa.descricao}
                    </td>

                    <td className="p-4">
                      {despesa.categoria}
                    </td>

                    <td className="p-4">
                      R$ {despesa.valor}
                    </td>

                    <td className="p-4">
                      {formatarData(despesa.data_despesa)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </main>

      </div>

    </Protegido>

  );
}
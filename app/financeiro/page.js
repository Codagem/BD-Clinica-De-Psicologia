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
    const resposta = await fetch("/api/financeiro");
    const resultado = await resposta.json();
    setDados(resultado);
  }

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function corStatus(status) {
    if (status === "Pago")
      return "bg-green-100 text-green-700";

    if (status === "Pendente")
      return "bg-yellow-100 text-yellow-700";

    if (status === "Cancelado")
      return "bg-red-100 text-red-700";

    return "bg-[#e8eadf] text-[#1d3557]";
  }

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">

          <div className="mb-10">

            <h1 className="text-3xl md:text-4xl font-bold text-[#1d3557]">
              Financeiro
            </h1>

            <p className="text-gray-500 mt-2">
              Controle financeiro da clínica de psicologia.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">

              <p className="text-gray-500 text-sm">
                Receitas
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-[#1d3557] mt-3">
                {formatarValor(dados.resumo.total_receitas)}
              </h2>

            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">

              <p className="text-gray-500 text-sm">
                Despesas
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-red-500 mt-3">
                {formatarValor(dados.resumo.total_despesas)}
              </h2>

            </div>

            <div className="bg-[#1d3557] p-6 rounded-3xl shadow-sm">

              <p className="text-blue-100 text-sm">
                Lucro Líquido
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
                {formatarValor(dados.resumo.lucro_liquido)}
              </h2>

            </div>

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">

            <div className="p-6 border-b border-gray-100">

              <h2 className="text-2xl font-bold text-[#1d3557]">
                Pagamentos
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Histórico de pagamentos recebidos.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px]">

                <thead className="bg-[#f3f1eb] text-[#1d3557]">

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
                      className="border-b border-gray-100 hover:bg-[#fbfaf7] transition"
                    >

                      <td className="p-4 font-medium">
                        {pagamento.paciente}
                      </td>

                      <td className="p-4">
                        {formatarValor(pagamento.valor)}
                      </td>

                      <td className="p-4">
                        {pagamento.forma_pagamento}
                      </td>

                      <td className="p-4">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${corStatus(
                            pagamento.status_pagamento
                          )}`}
                        >

                          {pagamento.status_pagamento}

                        </span>

                      </td>

                      <td className="p-4">
                        {formatarData(pagamento.data_pagamento)}
                      </td>

                    </tr>

                  ))}

                  {dados.pagamentos.length === 0 && (

                    <tr>

                      <td
                        colSpan="5"
                        className="p-8 text-center text-gray-500"
                      >

                        Nenhum pagamento encontrado.

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            <div className="p-6 border-b border-gray-100">

              <h2 className="text-2xl font-bold text-[#1d3557]">
                Despesas
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Controle de gastos da clínica.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-[#f3f1eb] text-[#1d3557]">

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
                      className="border-b border-gray-100 hover:bg-[#fbfaf7] transition"
                    >

                      <td className="p-4 font-medium">
                        {despesa.descricao}
                      </td>

                      <td className="p-4">
                        {despesa.categoria}
                      </td>

                      <td className="p-4 text-red-500 font-semibold">
                        {formatarValor(despesa.valor)}
                      </td>

                      <td className="p-4">
                        {formatarData(despesa.data_despesa)}
                      </td>

                    </tr>

                  ))}

                  {dados.despesas.length === 0 && (

                    <tr>

                      <td
                        colSpan="4"
                        className="p-8 text-center text-gray-500"
                      >

                        Nenhuma despesa encontrada.

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>
      </div>
    </Protegido>
  );
}
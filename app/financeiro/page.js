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
    if (status === "Pago") return "bg-green-100 text-green-700";
    if (status === "Pendente") return "bg-yellow-100 text-yellow-700";
    if (status === "Cancelado") return "bg-red-100 text-red-700";

    return "bg-[#e8eadf] text-[#1d3557]";
  }

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          <div className="mb-10">
            <p className="text-[#2b4c7e] font-semibold mb-2">
              Gestão financeira
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1d3557]">
              Financeiro
            </h1>

            <p className="text-gray-500 mt-2">
              Controle receitas, despesas e pagamentos da clínica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
            <ResumoCard
              titulo="Receitas"
              valor={formatarValor(dados.resumo.total_receitas)}
              descricao="Entradas registradas"
            />

            <ResumoCard
              titulo="Despesas"
              valor={formatarValor(dados.resumo.total_despesas)}
              descricao="Custos da clínica"
              vermelho
            />

            <ResumoCard
              titulo="Lucro líquido"
              valor={formatarValor(dados.resumo.lucro_liquido)}
              descricao="Resultado financeiro"
              destaque
            />
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

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-[#f3f1eb] text-[#1d3557]">
                  <tr>
                    <th className="text-left p-4">Paciente</th>
                    <th className="text-left p-4">Valor</th>
                    <th className="text-left p-4">Forma</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Data</th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {dados.pagamentos.map((pagamento) => (
                    <tr
                      key={pagamento.id_pagamento}
                      className="border-b border-gray-100 hover:bg-[#fbfaf7] transition"
                    >
                      <td className="p-4 font-medium">
                        {pagamento.paciente || "-"}
                      </td>

                      <td className="p-4 font-semibold text-[#1d3557]">
                        {formatarValor(pagamento.valor)}
                      </td>

                      <td className="p-4">
                        {pagamento.forma_pagamento || "-"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${corStatus(
                            pagamento.status_pagamento
                          )}`}
                        >
                          {pagamento.status_pagamento || "Indefinido"}
                        </span>
                      </td>

                      <td className="p-4">
                        {formatarData(pagamento.data_pagamento)}
                      </td>
                    </tr>
                  ))}

                  {dados.pagamentos.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        Nenhum pagamento encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-4">
              {dados.pagamentos.map((pagamento) => (
                <div
                  key={pagamento.id_pagamento}
                  className="bg-[#fbfaf7] rounded-3xl p-5 border border-[#1d3557]/10 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Pagamento recebido
                      </p>

                      <h3 className="text-2xl font-bold text-[#1d3557] mt-1">
                        {formatarValor(pagamento.valor)}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${corStatus(
                        pagamento.status_pagamento
                      )}`}
                    >
                      {pagamento.status_pagamento || "Indefinido"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Info label="Paciente" valor={pagamento.paciente || "-"} />
                    <Info
                      label="Forma"
                      valor={pagamento.forma_pagamento || "-"}
                    />
                    <Info
                      label="Data"
                      valor={formatarData(pagamento.data_pagamento)}
                    />
                  </div>
                </div>
              ))}

              {dados.pagamentos.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum pagamento encontrado.
                </div>
              )}
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

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#f3f1eb] text-[#1d3557]">
                  <tr>
                    <th className="text-left p-4">Descrição</th>
                    <th className="text-left p-4">Categoria</th>
                    <th className="text-left p-4">Valor</th>
                    <th className="text-left p-4">Data</th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {dados.despesas.map((despesa) => (
                    <tr
                      key={despesa.id_despesa}
                      className="border-b border-gray-100 hover:bg-[#fbfaf7] transition"
                    >
                      <td className="p-4 font-medium">
                        {despesa.descricao || "-"}
                      </td>

                      <td className="p-4">
                        {despesa.categoria || "-"}
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
                      <td colSpan="4" className="p-8 text-center text-gray-500">
                        Nenhuma despesa encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-4">
              {dados.despesas.map((despesa) => (
                <div
                  key={despesa.id_despesa}
                  className="bg-[#fbfaf7] rounded-3xl p-5 border border-red-100 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Despesa registrada
                      </p>

                      <h3 className="text-2xl font-bold text-red-500 mt-1">
                        {formatarValor(despesa.valor)}
                      </h3>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Saída
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Info label="Descrição" valor={despesa.descricao || "-"} />
                    <Info label="Categoria" valor={despesa.categoria || "-"} />
                    <Info
                      label="Data"
                      valor={formatarData(despesa.data_despesa)}
                    />
                  </div>
                </div>
              ))}

              {dados.despesas.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma despesa encontrada.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Protegido>
  );
}

function ResumoCard({ titulo, valor, descricao, destaque, vermelho }) {
  return (
    <div
      className={`rounded-3xl p-6 shadow-sm border ${
        destaque
          ? "bg-[#1d3557] border-[#1d3557] text-white"
          : "bg-white border-gray-100"
      }`}
    >
      <p
        className={`text-sm ${
          destaque ? "text-blue-100" : "text-gray-500"
        }`}
      >
        {titulo}
      </p>

      <h2
        className={`text-3xl md:text-4xl font-bold mt-3 ${
          destaque
            ? "text-white"
            : vermelho
            ? "text-red-500"
            : "text-[#1d3557]"
        }`}
      >
        {valor}
      </h2>

      <p
        className={`text-xs mt-2 ${
          destaque ? "text-blue-100" : "text-gray-400"
        }`}
      >
        {descricao}
      </p>
    </div>
  );
}

function Info({ label, valor }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-[#1d3557] font-medium text-right">{valor}</span>
    </div>
  );
}
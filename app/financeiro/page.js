"use client";

import Protegido from "../components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

export default function Financeiro() {
  const [dados, setDados] = useState({
    resumo: {},
    pagamentos: [],
    despesas: [],
  });

  const [mostrarPagamento, setMostrarPagamento] = useState(false);
  const [mostrarDespesa, setMostrarDespesa] = useState(false);

  const [idConsulta, setIdConsulta] = useState("");
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [statusPagamento, setStatusPagamento] = useState("Pago");
  const [dataPagamento, setDataPagamento] = useState("");

  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valorDespesa, setValorDespesa] = useState("");
  const [dataDespesa, setDataDespesa] = useState("");

  async function carregarFinanceiro() {
    const resposta = await fetch("/api/financeiro");
    const resultado = await resposta.json();
    setDados(resultado);
  }

  async function cadastrarPagamento() {
    try {
      await fetch("/api/financeiro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "pagamento",
          id_consulta: idConsulta,
          valor: valorPagamento,
          forma_pagamento: formaPagamento,
          status_pagamento: statusPagamento,
          data_pagamento: dataPagamento,
        }),
      });

      toast.success("Pagamento cadastrado com sucesso!");

      setIdConsulta("");
      setValorPagamento("");
      setFormaPagamento("Pix");
      setStatusPagamento("Pago");
      setDataPagamento("");
      setMostrarPagamento(false);

      carregarFinanceiro();
    } catch (error) {
      toast.error("Erro ao cadastrar pagamento.");
    }
  }

  async function cadastrarDespesa() {
    try {
      await fetch("/api/financeiro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "despesa",
          descricao,
          categoria,
          valor: valorDespesa,
          data_despesa: dataDespesa,
        }),
      });

      toast.success("Despesa cadastrada com sucesso!");

      setDescricao("");
      setCategoria("");
      setValorDespesa("");
      setDataDespesa("");
      setMostrarDespesa(false);

      carregarFinanceiro();
    } catch (error) {
      toast.error("Erro ao cadastrar despesa.");
    }
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

  const dadosGrafico = [
    {
      nome: "Receitas",
      valor: Number(dados.resumo.total_receitas || 0),
    },
    {
      nome: "Despesas",
      valor: Number(dados.resumo.total_despesas || 0),
    },
    {
      nome: "Lucro",
      valor: Number(dados.resumo.lucro_liquido || 0),
    },
  ];

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-10">
            <div>
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

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => {
                  setMostrarPagamento(!mostrarPagamento);
                  setMostrarDespesa(false);
                }}
                className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                + Pagamento
              </button>

              <button
                onClick={() => {
                  setMostrarDespesa(!mostrarDespesa);
                  setMostrarPagamento(false);
                }}
                className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                + Despesa
              </button>
            </div>
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

          {mostrarPagamento && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
                Novo Pagamento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <input
                  type="number"
                  placeholder="ID da consulta"
                  value={idConsulta}
                  onChange={(e) => setIdConsulta(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />

                <input
                  type="number"
                  placeholder="Valor"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />

                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                >
                  <option>Pix</option>
                  <option>Dinheiro</option>
                  <option>Cartão</option>
                  <option>Transferência</option>
                </select>

                <select
                  value={statusPagamento}
                  onChange={(e) => setStatusPagamento(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                >
                  <option>Pago</option>
                  <option>Pendente</option>
                  <option>Cancelado</option>
                </select>

                <input
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />
              </div>

              <button
                onClick={cadastrarPagamento}
                className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl mt-5 shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Salvar Pagamento
              </button>
            </motion.div>
          )}

          {mostrarDespesa && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
                Nova Despesa
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Descrição"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />

                <input
                  type="text"
                  placeholder="Categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />

                <input
                  type="number"
                  placeholder="Valor"
                  value={valorDespesa}
                  onChange={(e) => setValorDespesa(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />

                <input
                  type="date"
                  value={dataDespesa}
                  onChange={(e) => setDataDespesa(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />
              </div>

              <button
                onClick={cadastrarDespesa}
                className="bg-red-500 text-white px-6 py-3 rounded-2xl mt-5 shadow hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Salvar Despesa
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-10">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1d3557]">
                  Resumo financeiro
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Comparativo entre receitas, despesas e lucro.
                </p>
              </div>

              <div className="bg-[#f8f7f4] rounded-3xl p-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico} barSize={70}>
                    <XAxis dataKey="nome" axisLine={false} tickLine={false} />

                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      formatter={(value) => formatarValor(value)}
                      contentStyle={{
                        borderRadius: "18px",
                        border: "none",
                        background: "#1d3557",
                        color: "#fff",
                      }}
                    />

                    <Bar
                      dataKey="valor"
                      fill="#1d3557"
                      radius={[18, 18, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1d3557] rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-blue-100 text-sm mb-2">
                  Visão financeira
                </p>

                <h2 className="text-3xl font-bold mb-6">
                  Painel financeiro
                </h2>

                <div className="space-y-4">
                  <div className="bg-white/10 rounded-3xl p-5">
                    <p className="text-blue-100 text-sm">Receitas</p>

                    <h3 className="text-3xl font-bold mt-2">
                      {formatarValor(dados.resumo.total_receitas)}
                    </h3>
                  </div>

                  <div className="bg-white/10 rounded-3xl p-5">
                    <p className="text-blue-100 text-sm">Despesas</p>

                    <h3 className="text-3xl font-bold mt-2">
                      {formatarValor(dados.resumo.total_despesas)}
                    </h3>
                  </div>

                  <div className="bg-white rounded-3xl p-5 text-[#1d3557]">
                    <p className="text-sm text-gray-500">Lucro líquido</p>

                    <h3 className="text-3xl font-bold mt-2">
                      {formatarValor(dados.resumo.lucro_liquido)}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10" />
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
                <motion.div
                  key={pagamento.id_pagamento}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
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
                </motion.div>
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
                <motion.div
                  key={despesa.id_despesa}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
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
                </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 shadow-sm border ${
        destaque
          ? "bg-[#1d3557] border-[#1d3557] text-white"
          : "bg-white border-gray-100"
      }`}
    >
      <p className={`text-sm ${destaque ? "text-blue-100" : "text-gray-500"}`}>
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
    </motion.div>
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
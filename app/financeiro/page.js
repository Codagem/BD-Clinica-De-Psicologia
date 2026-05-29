"use client";

// =========================================
// IMPORTAÇÕES
// =========================================

import Protegido from "../components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

// =========================================
// COMPONENTE PRINCIPAL
// =========================================

export default function Financeiro() {
  // =========================================
  // STATES PRINCIPAIS
  // =========================================

  const [dados, setDados] = useState({
    resumo: {},
    pagamentos: [],
    despesas: [],
  });

  const [consultas, setConsultas] = useState([]);

  // =========================================
  // STATES DE FORMULÁRIOS
  // =========================================

  const [mostrarPagamento, setMostrarPagamento] = useState(false);
  const [mostrarDespesa, setMostrarDespesa] = useState(false);

  const [editandoPagamentoId, setEditandoPagamentoId] = useState(null);
  const [editandoDespesaId, setEditandoDespesaId] = useState(null);

  // =========================================
  // STATES DO PAGAMENTO
  // =========================================

  const [idConsulta, setIdConsulta] = useState("");
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [statusPagamento, setStatusPagamento] = useState("Pago");
  const [dataPagamento, setDataPagamento] = useState("");

  // =========================================
  // STATES DA DESPESA
  // =========================================

  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valorDespesa, setValorDespesa] = useState("");
  const [dataDespesa, setDataDespesa] = useState("");

  // =========================================
  // STATES DOS FILTROS
  // =========================================

  const [pesquisaPagamento, setPesquisaPagamento] = useState("");
  const [filtroStatusPagamento, setFiltroStatusPagamento] = useState("Todos");
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState("Todos");
  const [dataInicioPagamento, setDataInicioPagamento] = useState("");
  const [dataFimPagamento, setDataFimPagamento] = useState("");

  const [pesquisaDespesa, setPesquisaDespesa] = useState("");
  const [categoriaDespesaFiltro, setCategoriaDespesaFiltro] = useState("");
  const [dataInicioDespesa, setDataInicioDespesa] = useState("");
  const [dataFimDespesa, setDataFimDespesa] = useState("");

  // =========================================
  // CARREGAR FINANCEIRO
  // =========================================

  async function carregarFinanceiro() {
    const resposta = await fetch("/api/financeiro");
    const resultado = await resposta.json();
    setDados(resultado);
  }

  // =========================================
  // CARREGAR CONSULTAS
  // =========================================

  async function carregarConsultas() {
    const resposta = await fetch("/api/consultas");
    const resultado = await resposta.json();

    if (Array.isArray(resultado)) {
      setConsultas(resultado);
    } else {
      setConsultas([]);
    }
  }

  // =========================================
  // FORMATAR DATA INPUT
  // =========================================

  function formatarDataInput(data) {
    if (!data) return "";
    return String(data).slice(0, 10);
  }

  // =========================================
  // LIMPAR PAGAMENTO
  // =========================================

  function limparPagamento() {
    setEditandoPagamentoId(null);
    setIdConsulta("");
    setValorPagamento("");
    setFormaPagamento("Pix");
    setStatusPagamento("Pago");
    setDataPagamento("");
    setMostrarPagamento(false);
  }

  // =========================================
  // LIMPAR DESPESA
  // =========================================

  function limparDespesa() {
    setEditandoDespesaId(null);
    setDescricao("");
    setCategoria("");
    setValorDespesa("");
    setDataDespesa("");
    setMostrarDespesa(false);
  }

  // =========================================
  // LIMPAR FILTROS
  // =========================================

  function limparFiltros() {
    setPesquisaPagamento("");
    setFiltroStatusPagamento("Todos");
    setFiltroFormaPagamento("Todos");
    setDataInicioPagamento("");
    setDataFimPagamento("");

    setPesquisaDespesa("");
    setCategoriaDespesaFiltro("");
    setDataInicioDespesa("");
    setDataFimDespesa("");
  }

  // =========================================
  // CADASTRAR OU EDITAR PAGAMENTO
  // =========================================

  async function cadastrarPagamento() {
    try {
      const resposta = await fetch("/api/financeiro", {
        method: editandoPagamentoId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "pagamento",
          id: editandoPagamentoId,
          id_consulta: Number(idConsulta),
          valor: Number(valorPagamento),
          forma_pagamento: formaPagamento,
          status_pagamento: statusPagamento,
          data_pagamento: dataPagamento,
        }),
      });

      const resultado = await resposta.json();

      if (resultado.erro) {
        toast.error(resultado.erro);
        return;
      }

      toast.success(
        editandoPagamentoId
          ? "Pagamento atualizado com sucesso!"
          : "Pagamento cadastrado com sucesso!"
      );

      limparPagamento();
      carregarFinanceiro();
    } catch (error) {
      toast.error("Erro ao salvar pagamento.");
    }
  }

  // =========================================
  // CADASTRAR OU EDITAR DESPESA
  // =========================================

  async function cadastrarDespesa() {
    try {
      const resposta = await fetch("/api/financeiro", {
        method: editandoDespesaId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "despesa",
          id: editandoDespesaId,
          descricao,
          categoria,
          valor: Number(valorDespesa),
          data_despesa: dataDespesa,
        }),
      });

      const resultado = await resposta.json();

      if (resultado.erro) {
        toast.error(resultado.erro);
        return;
      }

      toast.success(
        editandoDespesaId
          ? "Despesa atualizada com sucesso!"
          : "Despesa cadastrada com sucesso!"
      );

      limparDespesa();
      carregarFinanceiro();
    } catch (error) {
      toast.error("Erro ao salvar despesa.");
    }
  }

  // =========================================
  // EDITAR PAGAMENTO
  // =========================================

  function editarPagamento(pagamento) {
    setEditandoPagamentoId(pagamento.id_pagamento);
    setIdConsulta(pagamento.id_consulta || "");
    setValorPagamento(pagamento.valor || "");
    setFormaPagamento(pagamento.forma_pagamento || "Pix");
    setStatusPagamento(pagamento.status_pagamento || "Pago");
    setDataPagamento(formatarDataInput(pagamento.data_pagamento));
    setMostrarPagamento(true);
    setMostrarDespesa(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================
  // EDITAR DESPESA
  // =========================================

  function editarDespesa(despesa) {
    setEditandoDespesaId(despesa.id_despesa);
    setDescricao(despesa.descricao || "");
    setCategoria(despesa.categoria || "");
    setValorDespesa(despesa.valor || "");
    setDataDespesa(formatarDataInput(despesa.data_despesa));
    setMostrarDespesa(true);
    setMostrarPagamento(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================
  // EXCLUIR PAGAMENTO
  // =========================================

  async function excluirPagamento(id) {
    const confirmar = confirm("Deseja realmente excluir este pagamento?");
    if (!confirmar) return;

    try {
      const resposta = await fetch("/api/financeiro", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "pagamento",
          id,
        }),
      });

      const resultado = await resposta.json();

      if (resultado.erro) {
        toast.error(resultado.erro);
        return;
      }

      toast.success("Pagamento excluído com sucesso!");
      carregarFinanceiro();
    } catch (error) {
      toast.error("Erro ao excluir pagamento.");
    }
  }

  // =========================================
  // EXCLUIR DESPESA
  // =========================================

  async function excluirDespesa(id) {
    const confirmar = confirm("Deseja realmente excluir esta despesa?");
    if (!confirmar) return;

    try {
      const resposta = await fetch("/api/financeiro", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "despesa",
          id,
        }),
      });

      const resultado = await resposta.json();

      if (resultado.erro) {
        toast.error(resultado.erro);
        return;
      }

      toast.success("Despesa excluída com sucesso!");
      carregarFinanceiro();
    } catch (error) {
      toast.error("Erro ao excluir despesa.");
    }
  }

  // =========================================
  // CARREGAMENTO INICIAL
  // =========================================

  useEffect(() => {
    carregarFinanceiro();
    carregarConsultas();
  }, []);

  // =========================================
  // FORMATAR DATA
  // =========================================

  function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  }
  // =========================================
// EXPORTAR PDF FINANCEIRO
// =========================================

function exportarPDF() {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Clínica de Psicologia", 14, 20);

  doc.setFontSize(11);
  doc.text(
    `Relatório Financeiro - ${new Date().toLocaleDateString("pt-BR")}`,
    14,
    30
  );

  doc.setFontSize(12);

  doc.text(
    `Receitas: ${formatarValor(totalPagamentosFiltrados)}`,
    14,
    45
  );

  doc.text(
    `Despesas: ${formatarValor(totalDespesasFiltradas)}`,
    14,
    55
  );

  doc.text(
    `Saldo: ${formatarValor(saldoFiltrado)}`,
    14,
    65
  );

  autoTable(doc, {
    startY: 80,

    head: [
      [
        "Paciente",
        "Valor",
        "Forma",
        "Status",
        "Data"
      ]
    ],

    body: pagamentosFiltrados.map((item) => [
      item.paciente || "-",
      formatarValor(item.valor),
      item.forma_pagamento || "-",
      item.status_pagamento || "-",
      formatarData(item.data_pagamento)
    ])
  });

  doc.save("financeiro-clinica.pdf");
}

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
  // COR DO STATUS
  // =========================================

  function corStatus(status) {
    if (status === "Pago") return "bg-green-100 text-green-700";
    if (status === "Pendente") return "bg-yellow-100 text-yellow-700";
    if (status === "Cancelado") return "bg-red-100 text-red-700";
    return "bg-[#e8eadf] text-[#1d3557]";
  }

  // =========================================
  // FILTRAR PAGAMENTOS
  // =========================================

  const pagamentosFiltrados = dados.pagamentos.filter((pagamento) => {
    const paciente = pagamento.paciente || "";
    const data = formatarDataInput(pagamento.data_pagamento);

    const batePesquisa = paciente
      .toLowerCase()
      .includes(pesquisaPagamento.toLowerCase());

    const bateStatus =
      filtroStatusPagamento === "Todos" ||
      pagamento.status_pagamento === filtroStatusPagamento;

    const bateForma =
      filtroFormaPagamento === "Todos" ||
      pagamento.forma_pagamento === filtroFormaPagamento;

    const bateDataInicio = !dataInicioPagamento || data >= dataInicioPagamento;
    const bateDataFim = !dataFimPagamento || data <= dataFimPagamento;

    return (
      batePesquisa &&
      bateStatus &&
      bateForma &&
      bateDataInicio &&
      bateDataFim
    );
  });

  // =========================================
  // FILTRAR DESPESAS
  // =========================================

  const despesasFiltradas = dados.despesas.filter((despesa) => {
    const texto = `${despesa.descricao || ""} ${despesa.categoria || ""}`;
    const data = formatarDataInput(despesa.data_despesa);

    const batePesquisa = texto
      .toLowerCase()
      .includes(pesquisaDespesa.toLowerCase());

    const bateCategoria =
      !categoriaDespesaFiltro ||
      (despesa.categoria || "")
        .toLowerCase()
        .includes(categoriaDespesaFiltro.toLowerCase());

    const bateDataInicio = !dataInicioDespesa || data >= dataInicioDespesa;
    const bateDataFim = !dataFimDespesa || data <= dataFimDespesa;

    return batePesquisa && bateCategoria && bateDataInicio && bateDataFim;
  });

  // =========================================
  // CÁLCULOS
  // =========================================

  const lucroNegativo = Number(dados.resumo.lucro_liquido || 0) < 0;

  const totalPagamentosFiltrados = pagamentosFiltrados.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  const totalDespesasFiltradas = despesasFiltradas.reduce(
    (total, item) => total + Number(item.valor || 0),
    0
  );

  const saldoFiltrado = totalPagamentosFiltrados - totalDespesasFiltradas;

  const dadosGrafico = [
    {
      nome: "Receitas",
      valor: Number(dados.resumo.total_receitas || 0),
    },
    {
      nome: "Despesas",
      valor: Number(dados.resumo.total_despesas || 0),
    },
  ];

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
                onClick={exportarPDF}
                className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Exportar PDF
              </button>

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

          {/* =========================================
              CARDS DE RESUMO
          ========================================= */}

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

          {/* =========================================
              FORMULÁRIO PAGAMENTO
          ========================================= */}

          {mostrarPagamento && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
                {editandoPagamentoId ? "Editar Pagamento" : "Novo Pagamento"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <select
                  value={idConsulta}
                  onChange={(e) => setIdConsulta(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                >
                  <option value="">Selecione a consulta</option>

                  {consultas.map((consulta) => (
                    <option
                      key={consulta.id_consulta}
                      value={consulta.id_consulta}
                    >
                      #{consulta.id_consulta} - {consulta.paciente} -{" "}
                      {formatarData(consulta.data_consulta)} -{" "}
                      {consulta.horario?.slice(0, 5)}
                    </option>
                  ))}
                </select>

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
                  lang="en-CA"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-5">
                <button
                  onClick={cadastrarPagamento}
                  className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  {editandoPagamentoId
                    ? "Atualizar Pagamento"
                    : "Salvar Pagamento"}
                </button>

                <button
                  onClick={limparPagamento}
                  className="bg-[#f3f1eb] text-[#1d3557] px-6 py-3 rounded-2xl hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================
              FORMULÁRIO DESPESA
          ========================================= */}

          {mostrarDespesa && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
                {editandoDespesaId ? "Editar Despesa" : "Nova Despesa"}
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
                  lang="en-CA"
                  value={dataDespesa}
                  onChange={(e) => setDataDespesa(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-5">
                <button
                  onClick={cadastrarDespesa}
                  className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  {editandoDespesaId ? "Atualizar Despesa" : "Salvar Despesa"}
                </button>

                <button
                  onClick={limparDespesa}
                  className="bg-[#f3f1eb] text-[#1d3557] px-6 py-3 rounded-2xl hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================
              FILTROS FINANCEIROS
          ========================================= */}

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-[#1d3557]">
                  Filtros financeiros
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Filtre pagamentos e despesas por busca, status, forma e período.
                </p>
              </div>

              <button
                onClick={limparFiltros}
                className="bg-[#f3f1eb] text-[#1d3557] px-5 py-3 rounded-2xl hover:bg-gray-200 transition"
              >
                Limpar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-[#fbfaf7] rounded-3xl p-5 border border-gray-100">
                <h3 className="font-bold text-[#1d3557] mb-4">
                  Filtros de pagamentos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Pesquisar paciente..."
                    value={pesquisaPagamento}
                    onChange={(e) => setPesquisaPagamento(e.target.value)}
                    className="border border-gray-200 p-3 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  />

                  <select
                    value={filtroStatusPagamento}
                    onChange={(e) => setFiltroStatusPagamento(e.target.value)}
                    className="border border-gray-200 p-3 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  >
                    <option value="Todos">Todos os status</option>
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>

                  <select
                    value={filtroFormaPagamento}
                    onChange={(e) => setFiltroFormaPagamento(e.target.value)}
                    className="border border-gray-200 p-3 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  >
                    <option value="Todos">Todas as formas</option>
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Transferência">Transferência</option>
                  </select>

                  <input
                    type="date"
                    value={dataInicioPagamento}
                    onChange={(e) => setDataInicioPagamento(e.target.value)}
                    className="border border-gray-200 p-3 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  />

                  <input
                    type="date"
                    value={dataFimPagamento}
                    onChange={(e) => setDataFimPagamento(e.target.value)}
                    className="border border-gray-200 p-3 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557] md:col-span-2"
                  />
                </div>
              </div>

              <div className="bg-[#fbfaf7] rounded-3xl p-5 border border-gray-100">
                <h3 className="font-bold text-[#1d3557] mb-4">
                  Filtros de despesas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Pesquisar despesa..."
                    value={pesquisaDespesa}
                    onChange={(e) => setPesquisaDespesa(e.target.value)}
                    className="border border-gray-200 p-3 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  />

                  <input
                    type="text"
                    placeholder="Categoria..."
                    value={categoriaDespesaFiltro}
                    onChange={(e) => setCategoriaDespesaFiltro(e.target.value)}
                    className="border border-gray-200 p-3 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  />

                  <input
                    type="date"
                    value={dataInicioDespesa}
                    onChange={(e) => setDataInicioDespesa(e.target.value)}
                    className="border border-gray-200 p-3 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  />

                  <input
                    type="date"
                    value={dataFimDespesa}
                    onChange={(e) => setDataFimDespesa(e.target.value)}
                    className="border border-gray-200 p-3 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              RESUMO FILTRADO
          ========================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
            <ResumoCard
              titulo="Receitas filtradas"
              valor={formatarValor(totalPagamentosFiltrados)}
              descricao={`${pagamentosFiltrados.length} pagamentos encontrados`}
            />

            <ResumoCard
              titulo="Despesas filtradas"
              valor={formatarValor(totalDespesasFiltradas)}
              descricao={`${despesasFiltradas.length} despesas encontradas`}
              vermelho
            />

            <ResumoCard
              titulo="Saldo filtrado"
              valor={formatarValor(saldoFiltrado)}
              descricao="Receitas filtradas - despesas filtradas"
              destaque
            />
          </div>

          {/* =========================================
              GRÁFICO E PAINEL
          ========================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-10">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#1d3557]">
                  Entradas x Saídas
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Comparativo entre entradas e saídas financeiras.
                </p>
              </div>

              <div className="bg-[#f8f7f4] rounded-3xl p-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico} barSize={90}>
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

                  <div
                    className={`rounded-3xl p-5 ${
                      lucroNegativo
                        ? "bg-red-50 text-red-600"
                        : "bg-white text-[#1d3557]"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        lucroNegativo ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      Lucro líquido
                    </p>

                    <h3 className="text-3xl font-bold mt-2">
                      {formatarValor(dados.resumo.lucro_liquido)}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10" />
            </div>
          </div>

          {/* =========================================
              PAGAMENTOS
          ========================================= */}

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
              <table className="w-full min-w-[950px]">
                <thead className="bg-[#f3f1eb] text-[#1d3557]">
                  <tr>
                    <th className="text-left p-4">Paciente</th>
                    <th className="text-left p-4">Valor</th>
                    <th className="text-left p-4">Forma</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Data</th>
                    <th className="text-left p-4">Ações</th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {pagamentosFiltrados.map((pagamento) => (
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

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editarPagamento(pagamento)}
                            className="bg-[#1d3557] text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              excluirPagamento(pagamento.id_pagamento)
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {pagamentosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        Nenhum pagamento encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-4">
              {pagamentosFiltrados.map((pagamento) => (
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

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <button
                      onClick={() => editarPagamento(pagamento)}
                      className="bg-[#1d3557] text-white py-3 rounded-2xl font-semibold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluirPagamento(pagamento.id_pagamento)}
                      className="bg-red-500 text-white py-3 rounded-2xl font-semibold"
                    >
                      Excluir
                    </button>
                  </div>
                </motion.div>
              ))}

              {pagamentosFiltrados.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum pagamento encontrado.
                </div>
              )}
            </div>
          </div>

          {/* =========================================
              DESPESAS
          ========================================= */}

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
              <table className="w-full min-w-[1000px]">
                <thead className="bg-[#f3f1eb] text-[#1d3557]">
                  <tr>
                    <th className="text-left p-4">Descrição</th>
                    <th className="text-left p-4">Categoria</th>
                    <th className="text-left p-4">Valor</th>
                    <th className="text-left p-4">Data</th>
                    <th className="text-left p-4">Ações</th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {despesasFiltradas.map((despesa) => (
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

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editarDespesa(despesa)}
                            className="bg-[#1d3557] text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => excluirDespesa(despesa.id_despesa)}
                            className="bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {despesasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        Nenhuma despesa encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-4">
              {despesasFiltradas.map((despesa) => (
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

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <button
                      onClick={() => editarDespesa(despesa)}
                      className="bg-[#1d3557] text-white py-3 rounded-2xl font-semibold"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluirDespesa(despesa.id_despesa)}
                      className="bg-red-500 text-white py-3 rounded-2xl font-semibold"
                    >
                      Excluir
                    </button>
                  </div>
                </motion.div>
              ))}

              {despesasFiltradas.length === 0 && (
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

// =========================================
// CARD DE RESUMO
// =========================================

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

// =========================================
// INFO MOBILE
// =========================================

function Info({ label, valor }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-[#1d3557] font-medium text-right">{valor}</span>
    </div>
  );
}
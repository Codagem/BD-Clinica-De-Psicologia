"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Protegido from "../components/Protegido";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [quantidadeAtual, setQuantidadeAtual] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [fornecedor, setFornecedor] = useState("");

  async function carregarProdutos() {
    const resposta = await fetch("/api/estoque");
    const dados = await resposta.json();
    setProdutos(dados);
  }

  async function cadastrarProduto() {
    try {
      await fetch("/api/estoque", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          categoria,
          quantidade_atual: quantidadeAtual,
          quantidade_minima: quantidadeMinima,
          fornecedor,
        }),
      });

      toast.success("Produto cadastrado com sucesso!");

      carregarProdutos();

      setNome("");
      setCategoria("");
      setQuantidadeAtual("");
      setQuantidadeMinima("");
      setFornecedor("");
      setMostrarFormulario(false);
    } catch (error) {
      toast.error("Erro ao cadastrar produto.");
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  function estoqueBaixo(produto) {
    return (
      Number(produto.quantidade_atual) <= Number(produto.quantidade_minima)
    );
  }

  const totalProdutos = produtos.length;

  const produtosBaixos = produtos.filter((produto) =>
    estoqueBaixo(produto)
  ).length;

  const produtosNormais = totalProdutos - produtosBaixos;

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-[#2b4c7e] font-semibold mb-2">
                Controle interno
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-[#1d3557]">
                Estoque
              </h1>

              <p className="text-gray-500 mt-2">
                Controle produtos, materiais e fornecedores da clínica.
              </p>
            </div>

            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              + Novo Produto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <ResumoCard
              titulo="Total de produtos"
              valor={totalProdutos}
              descricao="Itens cadastrados"
            />

            <ResumoCard
              titulo="Estoque normal"
              valor={produtosNormais}
              descricao="Itens em quantidade segura"
              verde
            />

            <ResumoCard
              titulo="Estoque baixo"
              valor={produtosBaixos}
              descricao="Itens precisam reposição"
              destaque
            />
          </div>

          {mostrarFormulario && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
                Novo Produto
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={nome}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setNome(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Categoria"
                  value={categoria}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setCategoria(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Quantidade"
                  value={quantidadeAtual}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setQuantidadeAtual(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Qtd. mínima"
                  value={quantidadeMinima}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setQuantidadeMinima(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Fornecedor"
                  value={fornecedor}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setFornecedor(e.target.value)}
                />
              </div>

              <button
                onClick={cadastrarProduto}
                className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl mt-5 shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Salvar Produto
              </button>
            </motion.div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#1d3557]">
                Lista de Produtos
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Acompanhe os itens cadastrados no estoque.
              </p>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#f3f1eb] text-[#1d3557]">
                  <tr>
                    <th className="text-left p-4">Produto</th>
                    <th className="text-left p-4">Categoria</th>
                    <th className="text-left p-4">Quantidade</th>
                    <th className="text-left p-4">Mínimo</th>
                    <th className="text-left p-4">Fornecedor</th>
                    <th className="text-left p-4">Status</th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {produtos.map((produto) => {
                    const baixo = estoqueBaixo(produto);

                    return (
                      <tr
                        key={produto.id_produto}
                        className="border-b border-gray-100 hover:bg-[#fbfaf7] transition"
                      >
                        <td className="p-4 font-medium">
                          {produto.nome || "-"}
                        </td>

                        <td className="p-4">
                          {produto.categoria || "-"}
                        </td>

                        <td className="p-4">
                          {produto.quantidade_atual}
                        </td>

                        <td className="p-4">
                          {produto.quantidade_minima}
                        </td>

                        <td className="p-4">
                          {produto.fornecedor || "-"}
                        </td>

                        <td className="p-4">
                          {baixo ? (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                              Baixo
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {produtos.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        Nenhum produto cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-4">
              {produtos.map((produto) => {
                const baixo = estoqueBaixo(produto);

                return (
                  <motion.div
                    key={produto.id_produto}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-3xl p-5 border shadow-sm ${
                      baixo
                        ? "bg-red-50 border-red-100"
                        : "bg-[#fbfaf7] border-[#1d3557]/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Produto em estoque
                        </p>

                        <h3 className="font-bold text-[#1d3557] mt-1">
                          {produto.nome || "Produto"}
                        </h3>
                      </div>

                      {baixo ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                          Baixo
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          Normal
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500">Atual</p>

                        <h4 className="text-2xl font-bold text-[#1d3557] mt-1">
                          {produto.quantidade_atual}
                        </h4>
                      </div>

                      <div className="bg-white rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500">Mínimo</p>

                        <h4
                          className={`text-2xl font-bold mt-1 ${
                            baixo ? "text-red-500" : "text-[#1d3557]"
                          }`}
                        >
                          {produto.quantidade_minima}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <Info label="Categoria" valor={produto.categoria || "-"} />
                      <Info
                        label="Fornecedor"
                        valor={produto.fornecedor || "-"}
                      />
                    </div>
                  </motion.div>
                );
              })}

              {produtos.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum produto cadastrado ainda.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Protegido>
  );
}

function ResumoCard({ titulo, valor, descricao, destaque, verde }) {
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
            : verde
            ? "text-green-600"
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
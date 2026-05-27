"use client";

import { useEffect, useState } from "react";
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

    carregarProdutos();

    setNome("");
    setCategoria("");
    setQuantidadeAtual("");
    setQuantidadeMinima("");
    setFornecedor("");
    setMostrarFormulario(false);
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  const totalProdutos = produtos.length;

  const produtosBaixos = produtos.filter(
    (produto) =>
      Number(produto.quantidade_atual) <= Number(produto.quantidade_minima)
  ).length;

  const produtosNormais = totalProdutos - produtosBaixos;

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1d3557]">
                Estoque
              </h1>

              <p className="text-gray-500 mt-2">
                Controle de produtos, materiais e fornecedores da clínica.
              </p>
            </div>

            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 transition"
            >
              + Novo Produto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Total de produtos</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1d3557] mt-3">
                {totalProdutos}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Estoque normal</p>
              <h2 className="text-3xl md:text-4xl font-bold text-green-600 mt-3">
                {produtosNormais}
              </h2>
            </div>

            <div className="bg-[#1d3557] p-6 rounded-3xl shadow-sm">
              <p className="text-blue-100 text-sm">Estoque baixo</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
                {produtosBaixos}
              </h2>
            </div>
          </div>

          {mostrarFormulario && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
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
                className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl mt-5 shadow hover:opacity-90 transition"
              >
                Salvar Produto
              </button>
            </div>
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

            <div className="overflow-x-auto">
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
                    const estoqueBaixo =
                      Number(produto.quantidade_atual) <=
                      Number(produto.quantidade_minima);

                    return (
                      <tr
                        key={produto.id_produto}
                        className="border-b border-gray-100 hover:bg-[#fbfaf7] transition"
                      >
                        <td className="p-4 font-medium">{produto.nome}</td>
                        <td className="p-4">{produto.categoria}</td>
                        <td className="p-4">{produto.quantidade_atual}</td>
                        <td className="p-4">{produto.quantidade_minima}</td>
                        <td className="p-4">{produto.fornecedor}</td>
                        <td className="p-4">
                          {estoqueBaixo ? (
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
          </div>
        </main>
      </div>
    </Protegido>
  );
}
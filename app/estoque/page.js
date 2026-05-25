"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

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

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <main className="ml-64 w-full p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">
            Estoque
          </h1>

          <button
            onClick={() =>
              setMostrarFormulario(!mostrarFormulario)
            }
            className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800"
          >
            Novo Produto
          </button>
        </div>

        {mostrarFormulario && (

          <div className="bg-white p-6 rounded-2xl shadow mb-8">

            <h2 className="text-2xl font-bold text-black mb-4">
              Novo Produto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

              <input
                type="text"
                placeholder="Nome"
                value={nome}
                className="border p-3 rounded-xl text-black bg-white"
                onChange={(e) => setNome(e.target.value)}
              />

              <input
                type="text"
                placeholder="Categoria"
                value={categoria}
                className="border p-3 rounded-xl text-black bg-white"
                onChange={(e) => setCategoria(e.target.value)}
              />

              <input
                type="number"
                placeholder="Quantidade"
                value={quantidadeAtual}
                className="border p-3 rounded-xl text-black bg-white"
                onChange={(e) =>
                  setQuantidadeAtual(e.target.value)
                }
              />

              <input
                type="number"
                placeholder="Qtd. mínima"
                value={quantidadeMinima}
                className="border p-3 rounded-xl text-black bg-white"
                onChange={(e) =>
                  setQuantidadeMinima(e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Fornecedor"
                value={fornecedor}
                className="border p-3 rounded-xl text-black bg-white"
                onChange={(e) =>
                  setFornecedor(e.target.value)
                }
              />

            </div>

            <button
              onClick={cadastrarProduto}
              className="bg-black text-white px-5 py-3 rounded-xl mt-4 hover:bg-gray-800"
            >
              Salvar Produto
            </button>

          </div>

        )}

        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-black text-white">

              <tr>

                <th className="text-left p-4">
                  Produto
                </th>

                <th className="text-left p-4">
                  Categoria
                </th>

                <th className="text-left p-4">
                  Quantidade
                </th>

                <th className="text-left p-4">
                  Mínimo
                </th>

                <th className="text-left p-4">
                  Fornecedor
                </th>

                <th className="text-left p-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="text-black">

              {produtos.map((produto) => (

                <tr
                  key={produto.id_produto}
                  className="border-b"
                >

                  <td className="p-4">
                    {produto.nome}
                  </td>

                  <td className="p-4">
                    {produto.categoria}
                  </td>

                  <td className="p-4">
                    {produto.quantidade_atual}
                  </td>

                  <td className="p-4">
                    {produto.quantidade_minima}
                  </td>

                  <td className="p-4">
                    {produto.fornecedor}
                  </td>

                  <td className="p-4">

                    {produto.quantidade_atual <= produto.quantidade_minima ? (

                      <span className="bg-red-200 px-3 py-1 rounded-full">
                        Baixo
                      </span>

                    ) : (

                      <span className="bg-green-200 px-3 py-1 rounded-full">
                        Normal
                      </span>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}
"use client";

import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  Users,
  UserRound,
  GraduationCap,
  Plus,
  Pencil,
  X,
} from "lucide-react";

export default function ProfissionaisPage() {
  const [filtro, setFiltro] = useState("Todos");
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoCadastro, setTipoCadastro] = useState("Psicólogo");

  useEffect(() => {
    async function carregarProfissionais() {
      try {
        const resposta = await fetch("/api/profissionais");
        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.erro || "Erro ao carregar profissionais."
          );
        }

        const psicologos = (dados.psicologos || []).map((psicologo) => ({
          id: psicologo.id_psicologo,
          nome: psicologo.nome,
          tipo: "Psicólogo",
          especialidade: psicologo.especialidade || "-",
          status: "Ativo",
        }));

        setProfissionais(psicologos);
      } catch (error) {
        console.error(error);
        setErro("Não foi possível carregar os profissionais.");
      } finally {
        setCarregando(false);
      }
    }

    carregarProfissionais();
  }, []);

  const profissionaisFiltrados =
    filtro === "Todos"
      ? profissionais
      : profissionais.filter(
          (profissional) => profissional.tipo === filtro
        );

  const total = profissionais.length;

  const psicologos = profissionais.filter(
    (profissional) => profissional.tipo === "Psicólogo"
  ).length;

  const estagiarios = profissionais.filter(
    (profissional) => profissional.tipo === "Estagiário"
  ).length;

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-[#f7f8fa] p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">

          {/* CABEÇALHO */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#1d3557]">
                Profissionais
              </h1>

              <p className="text-gray-500 mt-1">
                Gerencie psicólogos e estagiários da clínica.
              </p>

              {/* NAVEGAÇÃO INTERNA */}
              <div className="flex flex-wrap gap-3 mt-5">

                <a
                  href="/profissionais"
                  className="px-4 py-2 rounded-xl bg-[#1d3557] text-white text-sm font-medium"
                >
                  Visão geral
                </a>

                <a
                  href="/profissionais/psicologos"
                  className="px-4 py-2 rounded-xl bg-white text-[#1d3557] border border-gray-200 hover:bg-gray-50 text-sm font-medium transition"
                >
                  Psicólogos
                </a>

                <a
                  href="/profissionais/estagiarios"
                  className="px-4 py-2 rounded-xl bg-white text-[#1d3557] border border-gray-200 hover:bg-gray-50 text-sm font-medium transition"
                >
                  Estagiários
                </a>

              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="flex items-center justify-center gap-2 bg-[#1d3557] text-white px-5 py-3 rounded-xl hover:opacity-90 transition"
            >
              <Plus size={20} />
              Cadastrar profissional
            </button>
          </div>

          {/* ERRO */}
          {erro && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              {erro}
            </div>
          )}

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            {/* TOTAL */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">

                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users
                    className="text-[#1d3557]"
                    size={24}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total
                  </p>

                  <p className="text-2xl font-bold text-gray-800">
                    {carregando ? "..." : total}
                  </p>
                </div>

              </div>
            </div>

            {/* PSICÓLOGOS */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">

                <div className="p-3 bg-blue-50 rounded-xl">
                  <UserRound
                    className="text-[#1d3557]"
                    size={24}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Psicólogos
                  </p>

                  <p className="text-2xl font-bold text-gray-800">
                    {carregando ? "..." : psicologos}
                  </p>
                </div>

              </div>
            </div>

            {/* ESTAGIÁRIOS */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">

                <div className="p-3 bg-blue-50 rounded-xl">
                  <GraduationCap
                    className="text-[#1d3557]"
                    size={24}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Estagiários
                  </p>

                  <p className="text-2xl font-bold text-gray-800">
                    {carregando ? "..." : estagiarios}
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* FILTROS */}
          <div className="flex gap-3 mb-6">

            {["Todos", "Psicólogo", "Estagiário"].map(
              (opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setFiltro(opcao)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
                    filtro === opcao
                      ? "bg-[#1d3557] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {opcao}
                </button>
              )
            )}

          </div>

          {/* TABELA */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {carregando ? (
              <div className="p-8 text-center text-gray-500">
                Carregando profissionais...
              </div>
            ) : profissionaisFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhum profissional encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>

                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Nome
                      </th>

                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Tipo
                      </th>

                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Especialidade
                      </th>

                      <th className="text-left p-4 text-sm font-semibold text-gray-600">
                        Status
                      </th>

                      <th className="text-right p-4 text-sm font-semibold text-gray-600">
                        Ações
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {profissionaisFiltrados.map(
                      (profissional) => (
                        <tr
                          key={profissional.id}
                          className="border-b border-gray-100 last:border-0"
                        >

                          <td className="p-4 font-medium text-gray-800">
                            {profissional.nome}
                          </td>

                          <td className="p-4 text-gray-600">
                            {profissional.tipo}
                          </td>

                          <td className="p-4 text-gray-600">
                            {profissional.especialidade}
                          </td>

                          <td className="p-4">

                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              {profissional.status}
                            </span>

                          </td>

                          <td className="p-4 text-right">

                            <button
                              type="button"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#1d3557] hover:bg-gray-100 transition"
                            >
                              <Pencil size={16} />
                              Editar
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>

        {/* MODAL DE CADASTRO */}
        {modalAberto && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">

              {/* CABEÇALHO DO MODAL */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">

                <div>
                  <h2 className="text-2xl font-bold text-[#1d3557]">
                    Cadastrar profissional
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Preencha os dados do novo profissional.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={20} />
                </button>

              </div>

              {/* FORMULÁRIO */}
              <div className="p-6">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de profissional
                </label>

                <select
                  value={tipoCadastro}
                  onChange={(e) =>
                    setTipoCadastro(e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-xl p-3 mb-6 outline-none focus:border-[#1d3557] bg-white text-gray-800"
                >
                  <option value="Psicólogo">
                    Psicólogo
                  </option>

                  <option value="Estagiário">
                    Estagiário
                  </option>
                </select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* NOME */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo
                    </label>

                    <input
                      type="text"
                      placeholder="Nome completo"
                      className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                    />
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF
                    </label>

                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                    />
                  </div>

                  {/* DATA DE NASCIMENTO */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de nascimento
                    </label>

                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                    />
                  </div>

                  {/* CAMPOS DO PSICÓLOGO */}
                  {tipoCadastro === "Psicólogo" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CRP
                        </label>

                        <input
                          type="text"
                          placeholder="CRP"
                          className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Especialidade
                        </label>

                        <input
                          type="text"
                          placeholder="Ex.: Psicologia infantil"
                          className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* FACULDADE */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Faculdade
                        </label>

                        <input
                          type="text"
                          placeholder="Nome da faculdade"
                          className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                        />
                      </div>

                      {/* CURSO */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Curso
                        </label>

                        <input
                          type="text"
                          placeholder="Ex.: Psicologia"
                          className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                        />
                      </div>

                      {/* PERÍODO */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Período
                        </label>

                        <input
                          type="text"
                          placeholder="Ex.: 7º período"
                          className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                        />
                      </div>
                    </>
                  )}

                  {/* TELEFONE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>

                    <input
                      type="text"
                      placeholder="(00) 00000-0000"
                      className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>

                    <input
                      type="email"
                      placeholder="email@exemplo.com"
                      className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-[#1d3557]"
                    />
                  </div>

                </div>

                {/* BOTÕES */}
                <div className="flex justify-end gap-3 mt-8">

                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="px-5 py-3 rounded-xl bg-[#1d3557] text-white hover:opacity-90"
                  >
                    Cadastrar
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>
    </>
  );
}
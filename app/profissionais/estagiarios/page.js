"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function EstagiariosPage() {
  const [estagiarios, setEstagiarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [formulario, setFormulario] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    telefone: "",
    email: "",
    faculdade: "",
    curso: "",
    periodo: "",
    supervisor_id: "",
  });

  const [psicologos, setPsicologos] = useState([]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch("/api/profissionais");

      if (!resposta.ok) {
        throw new Error("Erro ao buscar profissionais.");
      }

      const dados = await resposta.json();

      setEstagiarios(dados.estagiarios || []);
      setPsicologos(dados.psicologos || []);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os profissionais.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function atualizarCampo(e) {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function formatarCPF(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 3) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    }

    if (numeros.length <= 9) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    }

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(
      6,
      9
    )}-${numeros.slice(9, 11)}`;
  }

  async function cadastrarEstagiario(e) {
    e.preventDefault();

    try {
      setSalvando(true);

      const resposta = await fetch("/api/profissionais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "Estagiário",
          nome: formulario.nome,
          cpf: formulario.cpf,
          data_nascimento: formulario.data_nascimento,
          telefone: formulario.telefone,
          email: formulario.email,
          faculdade: formulario.faculdade,
          curso: formulario.curso,
          periodo: formulario.periodo,
          supervisor_id: formulario.supervisor_id || null,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro || "Não foi possível cadastrar o estagiário.");
        return;
      }

      alert("Estagiário cadastrado com sucesso.");

      setFormulario({
        nome: "",
        cpf: "",
        data_nascimento: "",
        telefone: "",
        email: "",
        faculdade: "",
        curso: "",
        periodo: "",
        supervisor_id: "",
      });

      setModalAberto(false);

      await carregarDados();
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar estagiário.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-[#f7f8fa] p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">

          {/* CABEÇALHO */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#1d3557]">
                Estagiários
              </h1>

              <p className="text-gray-500 mt-1">
                Gerencie os estagiários cadastrados na clínica.
              </p>
            </div>

            <button
              onClick={() => setModalAberto(true)}
              className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl hover:bg-[#16304d] transition"
            >
              + Cadastrar estagiário
            </button>
          </div>

          {/* RESUMO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-500">
                Total de estagiários
              </p>

              <p className="text-3xl font-bold text-[#1d3557] mt-2">
                {estagiarios.length}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-500">
                Estagiários ativos
              </p>

              <p className="text-3xl font-bold text-[#1d3557] mt-2">
                {
                  estagiarios.filter(
                    (estagiario) => estagiario.status === "Ativo"
                  ).length
                }
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="text-lg font-semibold text-green-600 mt-3">
                Sistema ativo
              </p>
            </div>

          </div>

          {/* LISTA */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#1d3557]">
                Estagiários cadastrados
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Lista dos estagiários registrados no sistema.
              </p>
            </div>

            {carregando ? (
              <div className="p-10 text-center text-gray-500">
                Carregando estagiários...
              </div>
            ) : erro ? (
              <div className="p-10 text-center text-red-500">
                {erro}
              </div>
            ) : estagiarios.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                Nenhum estagiário cadastrado.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-[#f7f8fa]">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Nome
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Faculdade
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Curso
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Período
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Supervisor
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Status
                      </th>

                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {estagiarios.map((estagiario) => (
                      <tr
                        key={estagiario.id_estagiario}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >

                        <td className="px-6 py-5">
                          <div className="font-semibold text-[#1d3557]">
                            {estagiario.nome}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {estagiario.faculdade || "—"}
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {estagiario.curso || "—"}
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {estagiario.periodo || "—"}
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {estagiario.supervisor_nome || "—"}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              estagiario.status === "Ativo"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {estagiario.status || "—"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button className="text-[#1d3557] font-medium hover:underline">
                            Editar
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>
      </main>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">

            {/* CABEÇALHO DO MODAL */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">

              <div>
                <h2 className="text-2xl font-bold text-[#1d3557]">
                  Cadastrar estagiário
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Preencha os dados do novo estagiário.
                </p>
              </div>

              <button
                onClick={() => setModalAberto(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                ✕
              </button>

            </div>

            {/* FORMULÁRIO */}
            <form
              onSubmit={cadastrarEstagiario}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* NOME */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome completo *
                  </label>

                  <input
                    type="text"
                    name="nome"
                    value={formulario.nome}
                    onChange={atualizarCampo}
                    required
                    placeholder="Nome completo"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CPF *
                  </label>

                  <input
                    type="text"
                    name="cpf"
                    value={formulario.cpf}
                    onChange={(e) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        cpf: formatarCPF(e.target.value),
                      }))
                    }
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                {/* DATA DE NASCIMENTO */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Data de nascimento *
                  </label>

                  <input
                    type="date"
                    name="data_nascimento"
                    value={formulario.data_nascimento}
                    onChange={atualizarCampo}
                    required
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                {/* TELEFONE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone
                  </label>

                  <input
                    type="text"
                    name="telefone"
                    value={formulario.telefone}
                    onChange={atualizarCampo}
                    placeholder="(00) 00000-0000"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    E-mail
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={atualizarCampo}
                    placeholder="email@exemplo.com"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                {/* FACULDADE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Faculdade
                  </label>

                  <input
                    type="text"
                    name="faculdade"
                    value={formulario.faculdade}
                    onChange={atualizarCampo}
                    placeholder="Nome da faculdade"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                {/* CURSO */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Curso
                  </label>

                  <input
                    type="text"
                    name="curso"
                    value={formulario.curso}
                    onChange={atualizarCampo}
                    placeholder="Ex.: Psicologia"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                {/* PERÍODO */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Período
                  </label>

                  <input
                    type="text"
                    name="periodo"
                    value={formulario.periodo}
                    onChange={atualizarCampo}
                    placeholder="Ex.: 7º período"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                {/* SUPERVISOR */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Supervisor
                  </label>

                  <select
                    name="supervisor_id"
                    value={formulario.supervisor_id}
                    onChange={atualizarCampo}
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#1d3557]"
                  >
                    <option value="">
                      Selecione o supervisor
                    </option>

                    {psicologos.map((psicologo) => (
                      <option
                        key={psicologo.id_psicologo}
                        value={psicologo.id_psicologo}
                      >
                        {psicologo.nome}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* BOTÕES */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">

                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-3 rounded-2xl bg-[#1d3557] text-white hover:bg-[#16304d] transition disabled:opacity-50"
                >
                  {salvando
                    ? "Cadastrando..."
                    : "Cadastrar estagiário"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </>
  );
}
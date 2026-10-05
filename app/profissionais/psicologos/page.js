"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function PsicologosPage() {
  const [psicologos, setPsicologos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erroFormulario, setErroFormulario] = useState("");

  const [formulario, setFormulario] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    crp: "",
    especialidade: "",
    telefone: "",
    email: "",
  });

  async function carregarPsicologos() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch("/api/profissionais");

      if (!resposta.ok) {
        throw new Error("Erro ao buscar psicólogos.");
      }

      const dados = await resposta.json();

      setPsicologos(dados.psicologos || []);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os psicólogos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPsicologos();
  }, []);

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

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  }

  function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  function atualizarCampo(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function abrirModal() {
    setMensagem("");
    setErroFormulario("");

    setFormulario({
      nome: "",
      cpf: "",
      data_nascimento: "",
      crp: "",
      especialidade: "",
      telefone: "",
      email: "",
    });

    setMostrarModal(true);
  }

  function fecharModal() {
    if (salvando) return;

    setMostrarModal(false);
    setMensagem("");
    setErroFormulario("");
  }

  async function cadastrarPsicologo(event) {
    event.preventDefault();

    setSalvando(true);
    setMensagem("");
    setErroFormulario("");

    try {
      const resposta = await fetch("/api/profissionais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "Psicólogo",
          nome: formulario.nome,
          cpf: formulario.cpf,
          data_nascimento: formulario.data_nascimento,
          crp: formulario.crp,
          especialidade: formulario.especialidade,
          telefone: formulario.telefone,
          email: formulario.email,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao cadastrar psicólogo.");
      }

      setMensagem("Psicólogo cadastrado com sucesso!");

      setFormulario({
        nome: "",
        cpf: "",
        data_nascimento: "",
        crp: "",
        especialidade: "",
        telefone: "",
        email: "",
      });

      await carregarPsicologos();

      setTimeout(() => {
        setMostrarModal(false);
        setMensagem("");
      }, 1000);
    } catch (error) {
      console.error(error);
      setErroFormulario(error.message);
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
                Psicólogos
              </h1>

              <p className="text-gray-500 mt-1">
                Gerencie os psicólogos cadastrados na clínica.
              </p>
            </div>

            <button
              onClick={abrirModal}
              className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl hover:bg-[#16304d] transition"
            >
              + Cadastrar psicólogo
            </button>
          </div>

          {/* RESUMO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-500">
                Total de psicólogos
              </p>

              <p className="text-3xl font-bold text-[#1d3557] mt-2">
                {psicologos.length}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-sm text-gray-500">
                Psicólogos cadastrados
              </p>

              <p className="text-3xl font-bold text-[#1d3557] mt-2">
                {psicologos.length}
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
                Psicólogos cadastrados
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Lista dos profissionais registrados no sistema.
              </p>
            </div>

            {carregando ? (
              <div className="p-10 text-center text-gray-500">
                Carregando psicólogos...
              </div>
            ) : erro ? (
              <div className="p-10 text-center text-red-500">
                {erro}
              </div>
            ) : psicologos.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                Nenhum psicólogo cadastrado.
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
                        CRP
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Especialidade
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Telefone
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        E-mail
                      </th>

                      <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {psicologos.map((psicologo) => (
                      <tr
                        key={psicologo.id_psicologo}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >

                        <td className="px-6 py-5">
                          <div className="font-semibold text-[#1d3557]">
                            {psicologo.nome}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {psicologo.crp || "—"}
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {psicologo.especialidade || "—"}
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {psicologo.telefone || "—"}
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {psicologo.email || "—"}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            className="text-[#1d3557] font-medium hover:underline"
                          >
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

      {/* MODAL DE CADASTRO */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* CABEÇALHO DO MODAL */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-[#1d3557]">
                  Cadastrar psicólogo
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Cadastre um novo psicólogo na clínica.
                </p>
              </div>

              <button
                onClick={fecharModal}
                className="text-gray-400 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* FORMULÁRIO */}
            <form
              onSubmit={cadastrarPsicologo}
              className="p-6 space-y-5"
            >

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome completo *
                </label>

                <input
                  type="text"
                  required
                  value={formulario.nome}
                  onChange={(e) =>
                    atualizarCampo("nome", e.target.value)
                  }
                  placeholder="Digite o nome completo"
                  className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CPF *
                  </label>

                  <input
                    type="text"
                    required
                    value={formulario.cpf}
                    onChange={(e) =>
                      atualizarCampo(
                        "cpf",
                        formatarCPF(e.target.value)
                      )
                    }
                    placeholder="000.000.000-00"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Data de nascimento *
                  </label>

                  <input
                    type="date"
                    required
                    value={formulario.data_nascimento}
                    onChange={(e) =>
                      atualizarCampo(
                        "data_nascimento",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#1d3557]"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CRP *
                  </label>

                  <input
                    type="text"
                    required
                    value={formulario.crp}
                    onChange={(e) =>
                      atualizarCampo("crp", e.target.value)
                    }
                    placeholder="Ex.: CRP-02/12345"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Especialidade
                  </label>

                  <input
                    type="text"
                    value={formulario.especialidade}
                    onChange={(e) =>
                      atualizarCampo(
                        "especialidade",
                        e.target.value
                      )
                    }
                    placeholder="Ex.: Psicologia infantil"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone
                  </label>

                  <input
                    type="text"
                    value={formulario.telefone}
                    onChange={(e) =>
                      atualizarCampo(
                        "telefone",
                        formatarTelefone(e.target.value)
                      )
                    }
                    placeholder="(81) 99999-9999"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    E-mail
                  </label>

                  <input
                    type="email"
                    value={formulario.email}
                    onChange={(e) =>
                      atualizarCampo("email", e.target.value)
                    }
                    placeholder="exemplo@email.com"
                    className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white placeholder-gray-400 outline-none focus:border-[#1d3557]"
                  />
                </div>

              </div>

              {/* MENSAGENS */}
              {erroFormulario && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4">
                  {erroFormulario}
                </div>
              )}

              {mensagem && (
                <div className="bg-green-50 border border-green-200 text-green-600 rounded-2xl p-4">
                  {mensagem}
                </div>
              )}

              {/* BOTÕES */}
              <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-3 rounded-2xl bg-[#1d3557] text-white hover:bg-[#16304d] transition disabled:opacity-50"
                >
                  {salvando ? "Salvando..." : "Cadastrar psicólogo"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
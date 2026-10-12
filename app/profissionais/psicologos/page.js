
"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

const FORMULARIO_INICIAL = {
  nome: "",
  cpf: "",
  data_nascimento: "",
  crp: "",
  especialidade: "",
  telefone: "",
  email: "",
};

export default function PsicologosPage() {
  const [psicologos, setPsicologos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erroFormulario, setErroFormulario] = useState("");

  const [formulario, setFormulario] = useState({
    ...FORMULARIO_INICIAL,
  });

  async function carregarPsicologos() {
    try {
      setErro("");

      const resposta = await fetch("/api/profissionais", {
        cache: "no-store",
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível carregar os psicólogos."
        );
      }

      setPsicologos(dados.psicologos || []);
    } catch (error) {
      console.error("Erro ao carregar psicólogos:", error);
      setErro(
        error.message || "Não foi possível carregar os psicólogos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPsicologos();
  }, []);

  function formatarCPF(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 3) return numeros;

    if (numeros.length <= 6) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    }

    if (numeros.length <= 9) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    }

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
  }

  function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) return numeros;

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
    setFormulario({ ...FORMULARIO_INICIAL });
    setMensagem("");
    setErroFormulario("");
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

    if (salvando) return;

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
          nome: formulario.nome.trim(),
          cpf: formulario.cpf,
          data_nascimento: formulario.data_nascimento,
          crp: formulario.crp.trim(),
          especialidade: formulario.especialidade.trim(),
          telefone: formulario.telefone.trim(),
          email: formulario.email.trim(),
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            `Erro ao cadastrar. Código HTTP: ${resposta.status}`
        );
      }

      setMensagem(
        dados.mensagem || "Psicólogo cadastrado com sucesso!"
      );

      setFormulario({ ...FORMULARIO_INICIAL });

      await carregarPsicologos();

      window.setTimeout(() => {
        setMostrarModal(false);
        setMensagem("");
      }, 1200);
    } catch (error) {
      console.error("Erro no cadastro de psicólogo:", error);

      setErroFormulario(
        error.message || "Não foi possível cadastrar o psicólogo."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-[#f7f8fa] p-4 md:ml-64 md:p-6">
        <div className="mx-auto max-w-7xl">
          {/* CABEÇALHO */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1d3557]">
                Psicólogos
              </h1>

              <p className="mt-1 text-gray-500">
                Gerencie os psicólogos cadastrados na clínica.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirModal}
              className="rounded-2xl bg-[#1d3557] px-6 py-3 font-semibold text-white transition hover:bg-[#16304d]"
            >
              + Cadastrar psicólogo
            </button>
          </div>

          {/* RESUMO */}
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Total de psicólogos
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1d3557]">
                {psicologos.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Psicólogos cadastrados
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1d3557]">
                {psicologos.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Status</p>

              <p className="mt-3 text-lg font-semibold text-green-600">
                Sistema ativo
              </p>
            </div>
          </div>

          {/* LISTA DE PSICÓLOGOS */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-[#1d3557]">
                Psicólogos cadastrados
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Lista dos profissionais registrados no sistema.
              </p>
            </div>

            {carregando ? (
              <div className="p-10 text-center text-gray-500">
                Carregando psicólogos...
              </div>
            ) : erro ? (
              <div className="p-6 text-center text-red-600">
                <p>{erro}</p>

                <button
                  type="button"
                  onClick={carregarPsicologos}
                  className="mt-3 font-semibold underline"
                >
                  Tentar novamente
                </button>
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
                      {[
                        "Nome",
                        "CRP",
                        "Especialidade",
                        "Telefone",
                        "E-mail",
                        "Ações",
                      ].map((titulo) => (
                        <th
                          key={titulo}
                          className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-gray-600"
                        >
                          {titulo}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {psicologos.map((psicologo) => (
                      <tr
                        key={psicologo.id_psicologo}
                        className="border-t border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-5 font-semibold text-[#1d3557]">
                          {psicologo.nome}
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

                        <td className="px-6 py-5 text-gray-500">
                          —
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !salvando
            ) {
              fecharModal();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white text-gray-900 shadow-2xl">
            {/* CABEÇALHO */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1d3557]">
                  Cadastrar psicólogo
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados do profissional.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar formulário"
                className="rounded-lg px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* FORMULÁRIO */}
            <form
              onSubmit={cadastrarPsicologo}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nome completo *
                </label>

                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={formulario.nome}
                  onChange={(e) =>
                    atualizarCampo("nome", e.target.value)
                  }
                  placeholder="Digite o nome completo"
                  className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 outline-none focus:border-[#1d3557] focus:ring-2 focus:ring-[#1d3557]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    CPF *
                  </label>

                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    value={formulario.cpf}
                    onChange={(e) =>
                      atualizarCampo(
                        "cpf",
                        formatarCPF(e.target.value)
                      )
                    }
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 outline-none focus:border-[#1d3557] focus:ring-2 focus:ring-[#1d3557]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                    className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 outline-none focus:border-[#1d3557] focus:ring-2 focus:ring-[#1d3557]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                    className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 outline-none focus:border-[#1d3557] focus:ring-2 focus:ring-[#1d3557]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                    className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 outline-none focus:border-[#1d3557] focus:ring-2 focus:ring-[#1d3557]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Telefone
                  </label>

                  <input
                    type="tel"
                    autoComplete="tel"
                    value={formulario.telefone}
                    onChange={(e) =>
                      atualizarCampo(
                        "telefone",
                        formatarTelefone(e.target.value)
                      )
                    }
                    placeholder="(81) 99999-9999"
                    className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 outline-none focus:border-[#1d3557] focus:ring-2 focus:ring-[#1d3557]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    E-mail
                  </label>

                  <input
                    type="email"
                    autoComplete="email"
                    value={formulario.email}
                    onChange={(e) =>
                      atualizarCampo("email", e.target.value)
                    }
                    placeholder="exemplo@email.com"
                    className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 outline-none focus:border-[#1d3557] focus:ring-2 focus:ring-[#1d3557]/10"
                  />
                </div>
              </div>

              {/* MENSAGENS */}
              {erroFormulario && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
                >
                  {erroFormulario}
                </div>
              )}

              {mensagem && (
                <div
                  role="status"
                  className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700"
                >
                  {mensagem}
                </div>
              )}

              {/* BOTÕES */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="rounded-2xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-2xl bg-[#1d3557] px-6 py-3 font-semibold text-white transition hover:bg-[#16304d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {salvando
                    ? "Salvando..."
                    : "Cadastrar psicólogo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
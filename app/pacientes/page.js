"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Protegido from "../components/Protegido";

function formatarCPF(valor) {
  valor = valor.replace(/\D/g, "");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return valor;
}

function formatarTelefone(valor) {
  valor = valor.replace(/\D/g, "");
  valor = valor.replace(/^(\d{2})(\d)/g, "($1)$2");
  valor = valor.replace(/(\d)(\d{4})$/, "$1-$2");
  return valor;
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profissao, setProfissao] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [pesquisa, setPesquisa] = useState("");

  async function carregarPacientes() {
    const resposta = await fetch("/api/pacientes");
    const dados = await resposta.json();

    if (Array.isArray(dados)) {
      setPacientes(dados);
    } else {
      setPacientes([]);
      console.log(dados);
    }
  }

  async function cadastrarPaciente() {
    if (editandoId) {
      await fetch("/api/pacientes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editandoId,
          nome_completo: nome,
          cpf,
          telefone,
          profissao,
        }),
      });
    } else {
      await fetch("/api/pacientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_completo: nome,
          cpf,
          telefone,
          profissao,
        }),
      });
    }

    carregarPacientes();
    limparFormulario();
  }

  async function deletarPaciente(id) {
    const confirmar = confirm("Deseja realmente excluir este paciente?");
    if (!confirmar) return;

    await fetch("/api/pacientes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    carregarPacientes();
  }

  function editarPaciente(paciente) {
    setNome(paciente.nome_completo);
    setCpf(paciente.cpf);
    setTelefone(paciente.telefone);
    setProfissao(paciente.profissao);
    setEditandoId(paciente.id_paciente);
    setMostrarFormulario(true);
  }

  function limparFormulario() {
    setNome("");
    setCpf("");
    setTelefone("");
    setProfissao("");
    setEditandoId(null);
    setMostrarFormulario(false);
  }

  const pacientesFiltrados = pacientes.filter((paciente) =>
    paciente.nome_completo?.toLowerCase().includes(pesquisa.toLowerCase())
  );

  useEffect(() => {
    carregarPacientes();
  }, []);

  return (
    <Protegido>
      <div className="min-h-screen bg-[#fbfaf7] overflow-x-hidden">
        <Sidebar />

        <main className="md:ml-72 p-4 pt-20 md:p-10 md:w-[calc(100%-18rem)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
            <div>
              <p className="text-[#2b4c7e] font-semibold mb-2">
                Gestão de pacientes
              </p>

              <h1 className="text-3xl md:text-4xl font-serif text-[#1d3557]">
                Pacientes
              </h1>

              <p className="text-gray-500 mt-2">
                Cadastre, edite e acompanhe os pacientes da clínica.
              </p>
            </div>

            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-[#1d3557] text-white px-5 py-3 rounded-2xl hover:bg-[#16304d] transition shadow-sm"
            >
              + Novo Paciente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
              <p className="text-gray-500">Total de pacientes</p>
              <h2 className="text-4xl font-bold text-[#1d3557] mt-3">
                {pacientes.length}
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
              <p className="text-gray-500">Resultados da busca</p>
              <h2 className="text-4xl font-bold text-[#1d3557] mt-3">
                {pacientesFiltrados.length}
              </h2>
            </div>

            <div className="bg-[#1d3557] rounded-3xl p-6 shadow-sm">
              <p className="text-white/70">Status</p>
              <h2 className="text-2xl font-bold text-white mt-3">
                Base ativa
              </h2>
            </div>
          </div>

          {mostrarFormulario && (
            <div className="bg-white p-6 rounded-[30px] shadow-sm border border-black/5 mb-8">
              <h2 className="text-2xl font-serif text-[#1d3557] mb-5">
                {editandoId ? "Editar paciente" : "Novo paciente"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  onChange={(e) => setNome(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="CPF"
                  value={cpf}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                />

                <input
                  type="text"
                  placeholder="Telefone"
                  value={telefone}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  onChange={(e) =>
                    setTelefone(formatarTelefone(e.target.value))
                  }
                />

                <input
                  type="text"
                  placeholder="Profissão"
                  value={profissao}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-white outline-none focus:border-[#1d3557]"
                  onChange={(e) => setProfissao(e.target.value)}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={cadastrarPaciente}
                  className="bg-[#1d3557] text-white px-5 py-3 rounded-2xl hover:bg-[#16304d] transition"
                >
                  {editandoId ? "Atualizar paciente" : "Salvar paciente"}
                </button>

                <button
                  type="button"
                  onClick={limparFormulario}
                  className="bg-[#f5f1eb] text-[#1d3557] px-5 py-3 rounded-2xl hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-[28px] shadow-sm border border-black/5 mb-6">
            <input
              type="text"
              placeholder="Pesquisar paciente pelo nome..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="border border-gray-200 p-4 rounded-2xl w-full text-black bg-white outline-none focus:border-[#1d3557]"
            />
          </div>

          <div className="bg-white rounded-[30px] shadow-sm border border-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#1d3557] text-white">
                  <tr>
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Paciente</th>
                    <th className="text-left p-4">CPF</th>
                    <th className="text-left p-4">Telefone</th>
                    <th className="text-left p-4">Profissão</th>
                    <th className="text-left p-4">Ações</th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {pacientesFiltrados.map((paciente) => (
                    <tr
                      key={paciente.id_paciente}
                      className="border-b border-gray-100 hover:bg-[#f5f1eb] transition"
                    >
                      <td className="p-4">{paciente.id_paciente}</td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1d3557]/10 text-[#1d3557] flex items-center justify-center font-bold">
                            {paciente.nome_completo?.charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold text-[#1d3557]">
                              {paciente.nome_completo}
                            </p>
                            <p className="text-xs text-gray-500">
                              Paciente ativo
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">{paciente.cpf}</td>
                      <td className="p-4">{paciente.telefone}</td>
                      <td className="p-4">{paciente.profissao}</td>

                      <td className="p-4">
                        <button
                          onClick={() => editarPaciente(paciente)}
                          className="bg-[#2b4c7e] text-white px-4 py-2 rounded-2xl hover:bg-[#244267] mr-2 transition"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            deletarPaciente(paciente.id_paciente)
                          }
                          className="bg-red-500 text-white px-4 py-2 rounded-2xl hover:bg-red-600 transition"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </Protegido>
  );
}
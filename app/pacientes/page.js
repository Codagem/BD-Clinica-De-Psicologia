"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
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
    try {
      if (editandoId) {
        await fetch("/api/pacientes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editandoId,
            nome_completo: nome,
            cpf,
            telefone,
            profissao,
          }),
        });

        toast.success("Paciente atualizado com sucesso!");
      } else {
        await fetch("/api/pacientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome_completo: nome,
            cpf,
            telefone,
            profissao,
          }),
        });

        toast.success("Paciente cadastrado com sucesso!");
      }

      carregarPacientes();
      limparFormulario();
    } catch (error) {
      toast.error("Erro ao salvar paciente.");
    }
  }

  async function deletarPaciente(id) {
    const confirmar = confirm("Deseja realmente excluir este paciente?");
    if (!confirmar) return;

    try {
      await fetch("/api/pacientes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      toast.success("Paciente excluído com sucesso!");
      carregarPacientes();
    } catch (error) {
      toast.error("Erro ao excluir paciente.");
    }
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
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
            <div>
              <p className="text-[#2b4c7e] font-semibold mb-2">
                Gestão de pacientes
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-[#1d3557]">
                Pacientes
              </h1>

              <p className="text-gray-500 mt-2">
                Cadastre, edite e acompanhe os pacientes da clínica.
              </p>
            </div>

            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              + Novo Paciente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <ResumoCard titulo="Total de pacientes" valor={pacientes.length} />
            <ResumoCard titulo="Resultados da busca" valor={pacientesFiltrados.length} />
            <ResumoCard titulo="Status" valor="Base ativa" destaque />
          </div>

          {mostrarFormulario && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
                {editandoId ? "Editar paciente" : "Novo paciente"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setNome(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="CPF"
                  value={cpf}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                />

                <input
                  type="text"
                  placeholder="Telefone"
                  value={telefone}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) =>
                    setTelefone(formatarTelefone(e.target.value))
                  }
                />

                <input
                  type="text"
                  placeholder="Profissão"
                  value={profissao}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setProfissao(e.target.value)}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={cadastrarPaciente}
                  className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  {editandoId ? "Atualizar paciente" : "Salvar paciente"}
                </button>

                <button
                  type="button"
                  onClick={limparFormulario}
                  className="bg-[#f3f1eb] text-[#1d3557] px-6 py-3 rounded-2xl hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <input
              type="text"
              placeholder="Pesquisar paciente pelo nome..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="border border-gray-200 p-4 rounded-2xl w-full text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#1d3557]">
                Lista de Pacientes
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Visualize os pacientes cadastrados na clínica.
              </p>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#f3f1eb] text-[#1d3557]">
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
                      className="border-b border-gray-100 hover:bg-[#fbfaf7] transition"
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => editarPaciente(paciente)}
                            className="bg-[#2b4c7e] text-white px-4 py-2 rounded-2xl hover:opacity-90 transition"
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
                        </div>
                      </td>
                    </tr>
                  ))}

                  {pacientesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        Nenhum paciente encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-4">
              {pacientesFiltrados.map((paciente) => (
                <motion.div
                  key={paciente.id_paciente}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#fbfaf7] rounded-3xl p-5 border border-[#1d3557]/10 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1d3557]/10 text-[#1d3557] flex items-center justify-center font-bold">
                      {paciente.nome_completo?.charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-bold text-[#1d3557]">
                        {paciente.nome_completo}
                      </h3>

                      <p className="text-xs text-gray-500">
                        Paciente #{paciente.id_paciente}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Info label="CPF" valor={paciente.cpf || "-"} />
                    <Info label="Telefone" valor={paciente.telefone || "-"} />
                    <Info label="Profissão" valor={paciente.profissao || "-"} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <button
                      onClick={() => editarPaciente(paciente)}
                      className="bg-[#2b4c7e] text-white py-3 rounded-2xl hover:opacity-90 transition"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deletarPaciente(paciente.id_paciente)}
                      className="bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition"
                    >
                      Excluir
                    </button>
                  </div>
                </motion.div>
              ))}

              {pacientesFiltrados.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum paciente encontrado.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Protegido>
  );
}

function ResumoCard({ titulo, valor, destaque }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 shadow-sm border ${
        destaque
          ? "bg-[#1d3557] border-[#1d3557] text-white"
          : "bg-white border-gray-100 text-[#1d3557]"
      }`}
    >
      <p className={`text-sm ${destaque ? "text-blue-100" : "text-gray-500"}`}>
        {titulo}
      </p>

      <h2 className="text-3xl md:text-4xl font-bold mt-3">
        {valor}
      </h2>
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
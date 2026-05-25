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

    const resposta = await fetch(
      "/api/pacientes"
    );

    const dados = await resposta.json();

    setPacientes(dados);

  }

  async function cadastrarPaciente() {

    if (editandoId) {

      await fetch(
        "/api/pacientes",
        {

          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            id: editandoId,
            nome_completo: nome,
            cpf,
            telefone,
            profissao

          })

        }
      );

    } else {

      await fetch(
        "/api/pacientes",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            nome_completo: nome,
            cpf,
            telefone,
            profissao

          })

        }
      );

    }

    carregarPacientes();

    setNome("");
    setCpf("");
    setTelefone("");
    setProfissao("");

    setEditandoId(null);

    setMostrarFormulario(false);

  }

  async function deletarPaciente(id) {

    const confirmar = confirm(
      "Deseja realmente excluir este paciente?"
    );

    if (!confirmar) {
      return;
    }

    await fetch(
      "/api/pacientes",
      {

        method: "DELETE",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({ id })

      }
    );

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

  function cancelarEdicao() {

    setNome("");
    setCpf("");
    setTelefone("");
    setProfissao("");

    setEditandoId(null);

    setMostrarFormulario(false);

  }

  const pacientesFiltrados = pacientes.filter((paciente) =>

    paciente.nome_completo
      .toLowerCase()
      .includes(
        pesquisa.toLowerCase()
      )

  );

  useEffect(() => {

    carregarPacientes();

  }, []);

  return (

    <Protegido>

      <div className="flex bg-gray-100 min-h-screen">

        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

            <h1 className="text-4xl font-bold text-black">
              Pacientes
            </h1>

            <button
              onClick={() =>
                setMostrarFormulario(!mostrarFormulario)
              }
              className="bg-black text-white px-5 py-3 rounded-xl cursor-pointer hover:bg-gray-800"
            >
              Novo Paciente
            </button>

          </div>

          {mostrarFormulario && (

            <div className="bg-white p-6 rounded-2xl shadow mb-8">

              <h2 className="text-2xl font-bold text-black mb-4">

                {editandoId
                  ? "Editar Paciente"
                  : "Novo Paciente"}

              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <input
                  type="text"
                  placeholder="Nome"
                  value={nome}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) => setNome(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="CPF"
                  value={cpf}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) =>
                    setCpf(
                      formatarCPF(e.target.value)
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Telefone"
                  value={telefone}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) =>
                    setTelefone(
                      formatarTelefone(e.target.value)
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Profissão"
                  value={profissao}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) => setProfissao(e.target.value)}
                />

              </div>

              <div className="flex gap-3 mt-4">

                <button
                  type="button"
                  onClick={cadastrarPaciente}
                  className="bg-black text-white px-5 py-3 rounded-xl cursor-pointer hover:bg-gray-800"
                >

                  {editandoId
                    ? "Atualizar Paciente"
                    : "Salvar Paciente"}

                </button>

                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="bg-gray-300 text-black px-5 py-3 rounded-xl cursor-pointer hover:bg-gray-400"
                >
                  Cancelar
                </button>

              </div>

            </div>

          )}

          <div className="bg-white p-6 rounded-2xl shadow mb-6">

            <input
              type="text"
              placeholder="Pesquisar paciente..."
              value={pesquisa}
              onChange={(e) =>
                setPesquisa(e.target.value)
              }
              className="border p-4 rounded-xl w-full text-black bg-white"
            />

          </div>

          <div className="bg-white rounded-2xl shadow overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-black text-white">

                <tr>

                  <th className="text-left p-4">
                    ID
                  </th>

                  <th className="text-left p-4">
                    Nome
                  </th>

                  <th className="text-left p-4">
                    CPF
                  </th>

                  <th className="text-left p-4">
                    Telefone
                  </th>

                  <th className="text-left p-4">
                    Profissão
                  </th>

                  <th className="text-left p-4">
                    Ações
                  </th>

                </tr>

              </thead>

              <tbody className="text-black">

                {pacientesFiltrados.map((paciente) => (

                  <tr
                    key={paciente.id_paciente}
                    className="border-b"
                  >

                    <td className="p-4">
                      {paciente.id_paciente}
                    </td>

                    <td className="p-4">
                      {paciente.nome_completo}
                    </td>

                    <td className="p-4">
                      {paciente.cpf}
                    </td>

                    <td className="p-4">
                      {paciente.telefone}
                    </td>

                    <td className="p-4">
                      {paciente.profissao}
                    </td>

                    <td className="p-4">

                      <button
                        onClick={() =>
                          editarPaciente(paciente)
                        }
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 mr-2"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          deletarPaciente(paciente.id_paciente)
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                      >
                        Excluir
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </main>

      </div>

    </Protegido>

  );

}
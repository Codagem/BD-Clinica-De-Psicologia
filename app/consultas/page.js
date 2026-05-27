"use client";

import Protegido from "../components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [idPaciente, setIdPaciente] = useState("");
  const [idPsicologo, setIdPsicologo] = useState("");
  const [dataConsulta, setDataConsulta] = useState("");
  const [horario, setHorario] = useState("");
  const [tipoAtendimento, setTipoAtendimento] = useState("Presencial");
  const [statusConsulta, setStatusConsulta] = useState("Agendado");
  const [observacoes, setObservacoes] = useState("");

  async function carregarConsultas() {
    const resposta = await fetch("/api/consultas");
    const dados = await resposta.json();
    setConsultas(dados);
  }

  async function cadastrarConsulta() {
    await fetch("/api/consultas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_paciente: idPaciente,
        id_psicologo: idPsicologo,
        data_consulta: dataConsulta,
        horario,
        tipo_atendimento: tipoAtendimento,
        status_consulta: statusConsulta,
        observacoes,
      }),
    });

    carregarConsultas();

    setIdPaciente("");
    setIdPsicologo("");
    setDataConsulta("");
    setHorario("");
    setTipoAtendimento("Presencial");
    setStatusConsulta("Agendado");
    setObservacoes("");
    setMostrarFormulario(false);
  }

  useEffect(() => {
    carregarConsultas();
  }, []);

  function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarHora(hora) {
    return hora?.slice(0, 5) || "-";
  }

  function corStatus(status) {
    if (status === "Confirmado") return "bg-green-100 text-green-700";
    if (status === "Realizado") return "bg-blue-100 text-blue-700";
    if (status === "Cancelado") return "bg-red-100 text-red-700";
    if (status === "Faltou") return "bg-orange-100 text-orange-700";
    return "bg-[#e8eadf] text-[#1d3557]";
  }

  const totalConsultas = consultas.length;
  const agendadas = consultas.filter((c) => c.status_consulta === "Agendado").length;
  const confirmadas = consultas.filter((c) => c.status_consulta === "Confirmado").length;
  const realizadas = consultas.filter((c) => c.status_consulta === "Realizado").length;

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1d3557]">
                Consultas
              </h1>
              <p className="text-gray-500 mt-1">
                Gerencie os atendimentos da clínica de forma organizada.
              </p>
            </div>

            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 transition"
            >
              + Nova Consulta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Total de consultas</p>
              <h2 className="text-3xl font-bold text-[#1d3557] mt-2">{totalConsultas}</h2>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Agendadas</p>
              <h2 className="text-3xl font-bold text-[#1d3557] mt-2">{agendadas}</h2>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Confirmadas</p>
              <h2 className="text-3xl font-bold text-[#1d3557] mt-2">{confirmadas}</h2>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Realizadas</p>
              <h2 className="text-3xl font-bold text-[#1d3557] mt-2">{realizadas}</h2>
            </div>
          </div>

          {mostrarFormulario && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
                Nova Consulta
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="number"
                  placeholder="ID do Paciente"
                  value={idPaciente}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setIdPaciente(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="ID do Psicólogo"
                  value={idPsicologo}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setIdPsicologo(e.target.value)}
                />

                <input
                  type="date"
                  value={dataConsulta}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setDataConsulta(e.target.value)}
                />

                <input
                  type="time"
                  value={horario}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setHorario(e.target.value)}
                />

                <select
                  value={tipoAtendimento}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setTipoAtendimento(e.target.value)}
                >
                  <option>Presencial</option>
                  <option>Online</option>
                </select>

                <select
                  value={statusConsulta}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setStatusConsulta(e.target.value)}
                >
                  <option>Agendado</option>
                  <option>Confirmado</option>
                  <option>Realizado</option>
                  <option>Cancelado</option>
                  <option>Faltou</option>
                </select>

                <input
                  type="text"
                  placeholder="Observações"
                  value={observacoes}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557] lg:col-span-2"
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <button
                onClick={cadastrarConsulta}
                className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl mt-5 shadow hover:opacity-90 transition"
              >
                Salvar Consulta
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1d3557]">
                Lista de Consultas
              </h2>
              <p className="text-gray-500 text-sm">
                Visualize todos os atendimentos cadastrados.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-[#f3f1eb] text-[#1d3557]">
                  <tr>
                    <th className="text-left p-4">Paciente</th>
                    <th className="text-left p-4">Psicólogo</th>
                    <th className="text-left p-4">Data</th>
                    <th className="text-left p-4">Hora</th>
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Observações</th>
                  </tr>
                </thead>

                <tbody className="text-black">
                  {consultas.map((consulta) => (
                    <tr
                      key={consulta.id_consulta}
                      className="border-b border-gray-100 hover:bg-[#fbfaf7] transition"
                    >
                      <td className="p-4 font-medium">{consulta.paciente}</td>
                      <td className="p-4">{consulta.psicologo}</td>
                      <td className="p-4">{formatarData(consulta.data_consulta)}</td>
                      <td className="p-4">{formatarHora(consulta.horario)}</td>
                      <td className="p-4">{consulta.tipo_atendimento}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${corStatus(
                            consulta.status_consulta
                          )}`}
                        >
                          {consulta.status_consulta}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {consulta.observacoes || "-"}
                      </td>
                    </tr>
                  ))}

                  {consultas.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        Nenhuma consulta cadastrada ainda.
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
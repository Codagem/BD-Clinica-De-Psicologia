"use client";

import toast from "react-hot-toast";
import Protegido from "../components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  User,
  Video,
  MapPin,
} from "lucide-react";

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
    try {
      await fetch("/api/consultas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      toast.success("Consulta cadastrada com sucesso!");

      carregarConsultas();

      setIdPaciente("");
      setIdPsicologo("");
      setDataConsulta("");
      setHorario("");
      setTipoAtendimento("Presencial");
      setStatusConsulta("Agendado");
      setObservacoes("");
      setMostrarFormulario(false);
    } catch (error) {
      toast.error("Erro ao cadastrar consulta.");
    }
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

  const agendadas = consultas.filter(
    (c) => c.status_consulta === "Agendado"
  ).length;

  const confirmadas = consultas.filter(
    (c) => c.status_consulta === "Confirmado"
  ).length;

  const realizadas = consultas.filter(
    (c) => c.status_consulta === "Realizado"
  ).length;

  const consultasOrdenadas = [...consultas].sort((a, b) => {
    const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
    const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;
    return dataA.localeCompare(dataB);
  });

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-[#2b4c7e] font-semibold mb-2">
                Agenda clínica
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-[#1d3557]">
                Consultas
              </h1>

              <p className="text-gray-500 mt-2">
                Gerencie os atendimentos, horários e status da clínica.
              </p>
            </div>

            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              + Nova Consulta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <ResumoCard titulo="Total de consultas" valor={totalConsultas} />
            <ResumoCard titulo="Agendadas" valor={agendadas} />
            <ResumoCard titulo="Confirmadas" valor={confirmadas} />
            <ResumoCard titulo="Realizadas" valor={realizadas} destaque />
          </div>

          {mostrarFormulario && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8"
            >
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
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6 mb-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-[#1d3557]">
                  Agenda visual
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Próximos atendimentos organizados por horário.
                </p>
              </div>

              <div className="p-4 space-y-4">
                {consultasOrdenadas.slice(0, 5).map((consulta) => (
                  <motion.div
                    key={consulta.id_consulta}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#fbfaf7] rounded-3xl p-5 border border-[#1d3557]/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-[#1d3557] text-white flex flex-col items-center justify-center">
                        <Clock size={18} />

                        <span className="text-sm font-bold mt-1">
                          {formatarHora(consulta.horario)}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-[#1d3557]">
                              {consulta.paciente || "Paciente"}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                              {formatarData(consulta.data_consulta)}
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${corStatus(
                              consulta.status_consulta
                            )}`}
                          >
                            {consulta.status_consulta}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Tag
                            icon={
                              consulta.tipo_atendimento === "Online" ? (
                                <Video size={14} />
                              ) : (
                                <MapPin size={14} />
                              )
                            }
                            texto={consulta.tipo_atendimento || "-"}
                          />

                          <Tag
                            icon={<User size={14} />}
                            texto={consulta.psicologo || "-"}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {consultas.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    Nenhuma consulta cadastrada ainda.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1d3557] rounded-3xl p-6 text-white overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <CalendarDays size={24} />
                  </div>

                  <div>
                    <p className="text-blue-100 text-sm">Resumo da agenda</p>
                    <h2 className="text-2xl font-bold">Rotina da clínica</h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <AgendaMini titulo="Manhã" valor="3" />
                  <AgendaMini titulo="Tarde" valor="4" />
                  <AgendaMini titulo="Online" valor="2" />
                  <AgendaMini titulo="Presencial" valor="5" />
                </div>

                <p className="text-blue-100 text-sm mt-6">
                  Use essa visão para acompanhar rapidamente o fluxo de
                  atendimentos do dia.
                </p>
              </div>

              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10" />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#1d3557]">
                Lista de Consultas
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Visualize todos os atendimentos cadastrados.
              </p>
            </div>

            <div className="hidden md:block overflow-x-auto">
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
                      <td className="p-4 font-medium">
                        {consulta.paciente || "-"}
                      </td>

                      <td className="p-4">{consulta.psicologo || "-"}</td>

                      <td className="p-4">
                        {formatarData(consulta.data_consulta)}
                      </td>

                      <td className="p-4">{formatarHora(consulta.horario)}</td>

                      <td className="p-4">
                        {consulta.tipo_atendimento || "-"}
                      </td>

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

            <div className="md:hidden p-4 space-y-4">
              {consultas.map((consulta) => (
                <div
                  key={consulta.id_consulta}
                  className="bg-[#fbfaf7] rounded-3xl p-5 border border-[#1d3557]/10 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1d3557] text-white flex items-center justify-center font-bold">
                        {formatarHora(consulta.horario)}
                      </div>

                      <div>
                        <h3 className="font-bold text-[#1d3557]">
                          {consulta.paciente || "Paciente"}
                        </h3>

                        <p className="text-xs text-gray-500">
                          {formatarData(consulta.data_consulta)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${corStatus(
                        consulta.status_consulta
                      )}`}
                    >
                      {consulta.status_consulta}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Info label="Psicólogo" valor={consulta.psicologo || "-"} />
                    <Info label="Tipo" valor={consulta.tipo_atendimento || "-"} />
                    <Info
                      label="Observações"
                      valor={consulta.observacoes || "-"}
                    />
                  </div>
                </div>
              ))}

              {consultas.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma consulta cadastrada ainda.
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
      className={`rounded-3xl p-5 shadow-sm border ${
        destaque
          ? "bg-[#1d3557] border-[#1d3557] text-white"
          : "bg-white border-gray-100 text-[#1d3557]"
      }`}
    >
      <p className={`text-sm ${destaque ? "text-blue-100" : "text-gray-500"}`}>
        {titulo}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {valor}
      </h2>
    </motion.div>
  );
}

function Tag({ icon, texto }) {
  return (
    <span className="inline-flex items-center gap-1 bg-white text-[#1d3557] border border-[#1d3557]/10 px-3 py-1 rounded-full text-xs font-medium">
      {icon}
      {texto}
    </span>
  );
}

function AgendaMini({ titulo, valor }) {
  return (
    <div className="bg-white/10 rounded-3xl p-4">
      <p className="text-blue-100 text-sm">{titulo}</p>
      <h3 className="text-3xl font-bold mt-2">{valor}</h3>
    </div>
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
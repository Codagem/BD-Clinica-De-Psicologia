"use client";

// =========================================
// IMPORTAÇÕES
// =========================================

import toast from "react-hot-toast";
import Protegido from "../components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import {
  CalendarDays,
  User,
  Video,
  MapPin,
} from "lucide-react";

// =========================================
// COMPONENTE PRINCIPAL
// =========================================

export default function Consultas() {
  // =========================================
  // STATES PRINCIPAIS
  // =========================================

  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [psicologos, setPsicologos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // =========================================
  // STATES DO FORMULÁRIO
  // =========================================

  const [idPaciente, setIdPaciente] = useState("");
  const [idPsicologo, setIdPsicologo] = useState("");
  const [dataConsulta, setDataConsulta] = useState("");
  const [horario, setHorario] = useState("");
  const [tipoAtendimento, setTipoAtendimento] = useState("Presencial");
  const [statusConsulta, setStatusConsulta] = useState("Agendado");
  const [observacoes, setObservacoes] = useState("");

  // =========================================
  // CARREGAR PACIENTES
  // =========================================

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

  // =========================================
  // CARREGAR PSICÓLOGOS
  // =========================================

  async function carregarPsicologos() {
    const resposta = await fetch("/api/psicologos");
    const dados = await resposta.json();

    if (Array.isArray(dados)) {
      setPsicologos(dados);
    } else {
      setPsicologos([]);
      console.log(dados);
    }
  }

  // =========================================
  // CARREGAR CONSULTAS
  // =========================================

  async function carregarConsultas() {
    const resposta = await fetch("/api/consultas");
    const dados = await resposta.json();

    if (Array.isArray(dados)) {
      setConsultas(dados);
    } else {
      setConsultas([]);
      console.log(dados);
    }
  }

  // =========================================
  // CADASTRAR OU EDITAR CONSULTA
  // =========================================

  async function salvarConsulta() {
    try {
      if (!idPaciente || !idPsicologo || !dataConsulta || !horario) {
        toast.error("Preencha paciente, psicólogo, data e horário.");
        return;
      }

      const resposta = await fetch("/api/consultas", {
        method: editandoId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_consulta: editandoId,
          id_paciente: idPaciente,
          id_psicologo: idPsicologo,
          data_consulta: dataConsulta,
          horario,
          tipo_atendimento: tipoAtendimento,
          status_consulta: statusConsulta,
          observacoes,
        }),
      });

      const resultado = await resposta.json();

      if (resultado.erro) {
        toast.error(resultado.erro);
        return;
      }

      toast.success(
        editandoId
          ? "Consulta atualizada com sucesso!"
          : "Consulta cadastrada com sucesso!"
      );

      carregarConsultas();
      limparFormulario();
    } catch (error) {
      toast.error("Erro ao salvar consulta.");
    }
  }

  // =========================================
  // EDITAR CONSULTA
  // =========================================

  function editarConsulta(consulta) {
    setEditandoId(consulta.id_consulta);
    setIdPaciente(consulta.id_paciente || "");
    setIdPsicologo(consulta.id_psicologo || "");
    setDataConsulta(formatarDataInput(consulta.data_consulta));
    setHorario(formatarHora(consulta.horario));
    setTipoAtendimento(consulta.tipo_atendimento || "Presencial");
    setStatusConsulta(consulta.status_consulta || "Agendado");
    setObservacoes(consulta.observacoes || "");
    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================
  // EXCLUIR CONSULTA
  // =========================================

  async function excluirConsulta(idConsulta) {
    const confirmar = confirm("Deseja realmente excluir esta consulta?");
    if (!confirmar) return;

    try {
      const resposta = await fetch("/api/consultas", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_consulta: idConsulta,
        }),
      });

      const resultado = await resposta.json();

      if (resultado.erro) {
        toast.error(resultado.erro);
        return;
      }

      toast.success("Consulta excluída com sucesso!");
      carregarConsultas();
    } catch (error) {
      toast.error("Erro ao excluir consulta.");
    }
  }

  // =========================================
  // LIMPAR FORMULÁRIO
  // =========================================

  function limparFormulario() {
    setEditandoId(null);
    setIdPaciente("");
    setIdPsicologo("");
    setDataConsulta("");
    setHorario("");
    setTipoAtendimento("Presencial");
    setStatusConsulta("Agendado");
    setObservacoes("");
    setMostrarFormulario(false);
  }

  // =========================================
  // CARREGAMENTO INICIAL
  // =========================================

  useEffect(() => {
    carregarConsultas();
    carregarPacientes();
    carregarPsicologos();
  }, []);

  // =========================================
  // FUNÇÕES DE FORMATAÇÃO
  // =========================================

  function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarDataInput(data) {
    if (!data) return "";
    return String(data).slice(0, 10);
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

  // =========================================
  // CÁLCULOS DOS CARDS
  // =========================================

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

  const consultasHoje = consultasOrdenadas.filter((consulta) => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    return formatarData(consulta.data_consulta) === hoje;
  });

  const online = consultas.filter(
    (consulta) => consulta.tipo_atendimento === "Online"
  ).length;

  const presenciais = consultas.filter(
    (consulta) => consulta.tipo_atendimento === "Presencial"
  ).length;

  // =========================================
  // TELA
  // =========================================

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">
          {/* =========================================
              CABEÇALHO
          ========================================= */}

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
              onClick={() => {
                if (mostrarFormulario) {
                  limparFormulario();
                } else {
                  setMostrarFormulario(true);
                }
              }}
              className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              + Nova Consulta
            </button>
          </div>

          {/* =========================================
              CARDS DE RESUMO
          ========================================= */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <ResumoCard titulo="Total de consultas" valor={totalConsultas} />
            <ResumoCard titulo="Agendadas" valor={agendadas} />
            <ResumoCard titulo="Confirmadas" valor={confirmadas} />
            <ResumoCard titulo="Realizadas" valor={realizadas} destaque />
          </div>

          {/* =========================================
              FORMULÁRIO
          ========================================= */}

          {mostrarFormulario && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
                {editandoId ? "Editar Consulta" : "Nova Consulta"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* =========================================
                    SELECT DE PACIENTE
                ========================================= */}

                <select
                  value={idPaciente}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setIdPaciente(e.target.value)}
                >
                  <option value="">Selecione o paciente</option>

                  {pacientes.map((paciente) => (
                    <option
                      key={paciente.id_paciente}
                      value={paciente.id_paciente}
                    >
                      {paciente.nome_completo}
                    </option>
                  ))}
                </select>

                {/* =========================================
                    SELECT DE PSICÓLOGO
                ========================================= */}

                <select
                  value={idPsicologo}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setIdPsicologo(e.target.value)}
                >
                  <option value="">Selecione o psicólogo</option>

                  {psicologos.map((psicologo) => (
                    <option
                      key={psicologo.id_psicologo}
                      value={psicologo.id_psicologo}
                    >
                      {psicologo.nome}
                    </option>
                  ))}
                </select>

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

              <div className="flex flex-col md:flex-row gap-3 mt-5">
                <button
                  onClick={salvarConsulta}
                  className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 transition"
                >
                  {editandoId ? "Atualizar Consulta" : "Salvar Consulta"}
                </button>

                <button
                  onClick={limparFormulario}
                  className="bg-[#f3f1eb] text-[#1d3557] px-6 py-3 rounded-2xl hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================
              AGENDA VISUAL
          ========================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6 mb-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#1d3557]">
                    Agenda visual
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    Visualização profissional dos atendimentos por data e horário.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Legenda cor="bg-[#e8eadf]" texto="Agendado" />
                  <Legenda cor="bg-green-100" texto="Confirmado" />
                  <Legenda cor="bg-blue-100" texto="Realizado" />
                  <Legenda cor="bg-red-100" texto="Cancelado" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {consultasOrdenadas.map((consulta) => (
                    <motion.div
                      key={consulta.id_consulta}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-[130px_1fr] border-b border-gray-100 hover:bg-[#fbfaf7] transition"
                    >
                      <div className="p-6 border-r border-gray-100 bg-[#faf8f3]">
                        <p className="text-sm text-gray-500">
                          {formatarData(consulta.data_consulta)}
                        </p>

                        <h3 className="text-2xl font-bold text-[#1d3557] mt-1">
                          {formatarHora(consulta.horario)}
                        </h3>
                      </div>

                      <div className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-xl font-bold text-[#1d3557]">
                                {consulta.paciente || "Paciente"}
                              </h3>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${corStatus(
                                  consulta.status_consulta
                                )}`}
                              >
                                {consulta.status_consulta}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                              <Tag
                                icon={<User size={14} />}
                                texto={consulta.psicologo || "-"}
                              />

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
                            </div>

                            {consulta.observacoes && (
                              <p className="text-gray-500 mt-4 text-sm">
                                {consulta.observacoes}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-start lg:items-end gap-3">
                            <h4 className="font-bold text-[#1d3557]">
                              #{consulta.id_consulta}
                            </h4>

                            <div className="flex gap-2">
                              <button
                                onClick={() => editarConsulta(consulta)}
                                className="bg-[#1d3557] text-white px-4 py-2 rounded-xl text-sm hover:opacity-90 transition"
                              >
                                Editar
                              </button>

                              <button
                                onClick={() =>
                                  excluirConsulta(consulta.id_consulta)
                                }
                                className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600 transition"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {consultas.length === 0 && (
                    <div className="p-16 text-center text-gray-500">
                      Nenhuma consulta cadastrada ainda.
                    </div>
                  )}
                </div>
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
                  <AgendaMini titulo="Hoje" valor={consultasHoje.length} />
                  <AgendaMini titulo="Total" valor={totalConsultas} />
                  <AgendaMini titulo="Online" valor={online} />
                  <AgendaMini titulo="Presencial" valor={presenciais} />
                </div>
              </div>

              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10" />
            </div>
          </div>

          {/* =========================================
              LISTA DE CONSULTAS
          ========================================= */}

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
              <table className="w-full min-w-[1100px]">
                <thead className="bg-[#f3f1eb] text-[#1d3557]">
                  <tr>
                    <th className="text-left p-4">Paciente</th>
                    <th className="text-left p-4">Psicólogo</th>
                    <th className="text-left p-4">Data</th>
                    <th className="text-left p-4">Hora</th>
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Observações</th>
                    <th className="text-left p-4">Ações</th>
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

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editarConsulta(consulta)}
                            className="bg-[#1d3557] text-white px-4 py-2 rounded-xl text-sm"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() =>
                              excluirConsulta(consulta.id_consulta)
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {consultas.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
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

// =========================================
// COMPONENTES AUXILIARES
// =========================================

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

      <h2 className="text-3xl font-bold mt-2">{valor}</h2>
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

function Legenda({ cor, texto }) {
  return (
    <div className="flex items-center gap-2 bg-[#fbfaf7] px-3 py-2 rounded-2xl border border-gray-100">
      <div className={`w-3 h-3 rounded-full ${cor}`} />

      <span className="text-sm text-[#1d3557] font-medium">{texto}</span>
    </div>
  );
}
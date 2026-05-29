"use client";

// =========================================
// IMPORTAÇÕES
// =========================================

import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Protegido from "../components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// =========================================
// COMPONENTE PRINCIPAL
// =========================================

export default function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [psicologos, setPsicologos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [pesquisaPaciente, setPesquisaPaciente] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroPsicologo, setFiltroPsicologo] = useState("Todos");
  const [filtroData, setFiltroData] = useState("");

  const [dataAgenda, setDataAgenda] = useState(dataHojeInput());

  const [idPaciente, setIdPaciente] = useState("");
  const [idPsicologo, setIdPsicologo] = useState("");
  const [dataConsulta, setDataConsulta] = useState("");
  const [horario, setHorario] = useState("");
  const [tipoAtendimento, setTipoAtendimento] = useState("Presencial");
  const [statusConsulta, setStatusConsulta] = useState("Agendado");
  const [observacoes, setObservacoes] = useState("");

  function dataHojeInput() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  async function carregarPacientes() {
    const resposta = await fetch("/api/pacientes");
    const dados = await resposta.json();
    setPacientes(Array.isArray(dados) ? dados : []);
  }

  async function carregarPsicologos() {
    const resposta = await fetch("/api/psicologos");
    const dados = await resposta.json();
    setPsicologos(Array.isArray(dados) ? dados : []);
  }

  async function carregarConsultas() {
    const resposta = await fetch("/api/consultas");
    const dados = await resposta.json();
    setConsultas(Array.isArray(dados) ? dados : []);
  }

  async function salvarConsulta() {
    try {
      if (!idPaciente || !idPsicologo || !dataConsulta || !horario) {
        toast.error("Preencha paciente, psicólogo, data e horário.");
        return;
      }

      const resposta = await fetch("/api/consultas", {
        method: editandoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
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

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluirConsulta(idConsulta) {
    const confirmar = confirm("Deseja realmente excluir esta consulta?");
    if (!confirmar) return;

    try {
      const resposta = await fetch("/api/consultas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_consulta: idConsulta }),
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

  function limparFiltros() {
    setPesquisaPaciente("");
    setFiltroStatus("Todos");
    setFiltroPsicologo("Todos");
    setFiltroData("");
  }

  function mudarDiaAgenda(dias) {
    const data = new Date(`${dataAgenda}T00:00:00`);
    data.setDate(data.getDate() + dias);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    setDataAgenda(`${ano}-${mes}-${dia}`);
  }

  useEffect(() => {
    carregarConsultas();
    carregarPacientes();
    carregarPsicologos();
  }, []);

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

  function exportarPDFConsultas() {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Clínica de Psicologia", 14, 20);

    doc.setFontSize(11);
    doc.text(
      `Relatório de Consultas - ${new Date().toLocaleDateString("pt-BR")}`,
      14,
      30
    );

    doc.setFontSize(12);
    doc.text(`Total de consultas: ${consultasFiltradas.length}`, 14, 45);

    autoTable(doc, {
      startY: 55,
      head: [["Paciente", "Psicólogo", "Data", "Hora", "Tipo", "Status"]],
      body: consultasFiltradas.map((consulta) => [
        consulta.paciente || "-",
        consulta.psicologo || "-",
        formatarData(consulta.data_consulta),
        formatarHora(consulta.horario),
        consulta.tipo_atendimento || "-",
        consulta.status_consulta || "-",
      ]),
    });

    doc.save("consultas-clinica.pdf");
  }

  function corStatus(status) {
    if (status === "Confirmado") return "bg-green-100 text-green-700";
    if (status === "Realizado") return "bg-blue-100 text-blue-700";
    if (status === "Cancelado") return "bg-red-100 text-red-700";
    if (status === "Faltou") return "bg-orange-100 text-orange-700";
    return "bg-[#e8eadf] text-[#1d3557]";
  }

  function bordaStatus(status) {
    if (status === "Confirmado") return "border-green-300";
    if (status === "Realizado") return "border-blue-300";
    if (status === "Cancelado") return "border-red-300";
    if (status === "Faltou") return "border-orange-300";
    return "border-[#1d3557]/20";
  }

  const consultasFiltradas = consultas.filter((consulta) => {
    const nomePaciente = consulta.paciente || "";
    const nomePsicologo = consulta.psicologo || "";
    const dataFormatada = formatarDataInput(consulta.data_consulta);

    const batePaciente = nomePaciente
      .toLowerCase()
      .includes(pesquisaPaciente.toLowerCase());

    const bateStatus =
      filtroStatus === "Todos" || consulta.status_consulta === filtroStatus;

    const batePsicologo =
      filtroPsicologo === "Todos" || nomePsicologo === filtroPsicologo;

    const bateData = !filtroData || dataFormatada === filtroData;

    return batePaciente && bateStatus && batePsicologo && bateData;
  });

  const consultasOrdenadas = [...consultasFiltradas].sort((a, b) => {
    const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
    const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;
    return dataA.localeCompare(dataB);
  });

  const horariosAgenda = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const consultasDoDiaAgenda = consultasFiltradas
    .filter((consulta) => formatarDataInput(consulta.data_consulta) === dataAgenda)
    .sort((a, b) =>
      String(a.horario || "").localeCompare(String(b.horario || ""))
    );

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

  const consultasHoje = consultas.filter((consulta) => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    return formatarData(consulta.data_consulta) === hoje;
  });

  const online = consultasFiltradas.filter(
    (consulta) => consulta.tipo_atendimento === "Online"
  ).length;

  const presenciais = consultasFiltradas.filter(
    (consulta) => consulta.tipo_atendimento === "Presencial"
  ).length;
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

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={exportarPDFConsultas}
                className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Exportar PDF
              </button>

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
                {editandoId ? "Editar Consulta" : "Nova Consulta"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-[#1d3557]">
                  Filtros da agenda
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Filtre consultas por paciente, psicólogo, status ou data.
                </p>
              </div>

              <button
                onClick={limparFiltros}
                className="bg-[#f3f1eb] text-[#1d3557] px-5 py-3 rounded-2xl hover:bg-gray-200 transition"
              >
                Limpar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Pesquisar paciente..."
                value={pesquisaPaciente}
                className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                onChange={(e) => setPesquisaPaciente(e.target.value)}
              />

              <select
                value={filtroPsicologo}
                className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                onChange={(e) => setFiltroPsicologo(e.target.value)}
              >
                <option value="Todos">Todos os psicólogos</option>

                {psicologos.map((psicologo) => (
                  <option key={psicologo.id_psicologo} value={psicologo.nome}>
                    {psicologo.nome}
                  </option>
                ))}
              </select>

              <select
                value={filtroStatus}
                className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="Todos">Todos os status</option>
                <option value="Agendado">Agendado</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Realizado">Realizado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Faltou">Faltou</option>
              </select>

              <input
                type="date"
                value={filtroData}
                className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1d3557]">
                  Agenda diária
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Visualização por horário no dia selecionado.
                </p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <button
                  onClick={() => mudarDiaAgenda(-1)}
                  className="bg-[#f3f1eb] text-[#1d3557] p-3 rounded-2xl hover:bg-gray-200 transition"
                >
                  <ChevronLeft size={20} />
                </button>

                <input
                  type="date"
                  value={dataAgenda}
                  onChange={(e) => setDataAgenda(e.target.value)}
                  className="border border-gray-200 p-3 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                />

                <button
                  onClick={() => mudarDiaAgenda(1)}
                  className="bg-[#f3f1eb] text-[#1d3557] p-3 rounded-2xl hover:bg-gray-200 transition"
                >
                  <ChevronRight size={20} />
                </button>

                <button
                  onClick={() => setDataAgenda(dataHojeInput())}
                  className="bg-[#1d3557] text-white px-5 py-3 rounded-2xl hover:opacity-90 transition"
                >
                  Hoje
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
                <div className="space-y-3">
                  {horariosAgenda.map((hora) => {
                    const consultasHorario = consultasDoDiaAgenda.filter(
                      (consulta) => formatarHora(consulta.horario) === hora
                    );

                    return (
                      <div
                        key={hora}
                        className="grid grid-cols-1 md:grid-cols-[90px_1fr] gap-3"
                      >
                        <div className="bg-[#f3f1eb] rounded-2xl p-4 text-[#1d3557] font-bold text-center">
                          {hora}
                        </div>

                        <div className="min-h-[76px] bg-[#fbfaf7] rounded-2xl border border-gray-100 p-3">
                          {consultasHorario.length > 0 ? (
                            <div className="space-y-3">
                              {consultasHorario.map((consulta) => (
                                <div
                                  key={consulta.id_consulta}
                                  className={`bg-white border-l-4 ${bordaStatus(
                                    consulta.status_consulta
                                  )} rounded-2xl p-4 shadow-sm`}
                                >
                                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-bold text-[#1d3557]">
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

                                      <p className="text-sm text-gray-500 mt-2">
                                        Psicólogo: {consulta.psicologo || "-"}
                                      </p>

                                      <p className="text-sm text-gray-500">
                                        Tipo: {consulta.tipo_atendimento || "-"}
                                      </p>
                                    </div>

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
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full min-h-[50px] flex items-center text-sm text-gray-400">
                              Horário livre
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#1d3557] rounded-3xl p-6 text-white h-fit">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      <CalendarDays size={24} />
                    </div>

                    <div>
                      <p className="text-blue-100 text-sm">Resumo do dia</p>
                      <h2 className="text-2xl font-bold">
                        {formatarData(dataAgenda)}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <AgendaMini titulo="No dia" valor={consultasDoDiaAgenda.length} />
                    <AgendaMini titulo="Hoje" valor={consultasHoje.length} />
                    <AgendaMini titulo="Online" valor={online} />
                    <AgendaMini titulo="Presencial" valor={presenciais} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#1d3557]">
                Lista de Consultas
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Visualize todos os atendimentos filtrados.
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
                  {consultasOrdenadas.map((consulta) => (
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

                  {consultasOrdenadas.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        Nenhuma consulta encontrada com os filtros atuais.
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

function AgendaMini({ titulo, valor }) {
  return (
    <div className="bg-white/10 rounded-3xl p-4">
      <p className="text-blue-100 text-sm">{titulo}</p>
      <h3 className="text-3xl font-bold mt-2">{valor}</h3>
    </div>
  );
}
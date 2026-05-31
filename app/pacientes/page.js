"use client";

// =========================================
// IMPORTAÇÕES
// =========================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../components/Sidebar";
import Protegido from "../components/Protegido";

// =========================================
// FORMATAR CPF
// =========================================

function formatarCPF(valor) {
  valor = valor.replace(/\D/g, "");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return valor;
}

// =========================================
// FORMATAR TELEFONE
// =========================================

function formatarTelefone(valor) {
  valor = valor.replace(/\D/g, "");
  valor = valor.replace(/^(\d{2})(\d)/g, "($1)$2");
  valor = valor.replace(/(\d)(\d{4})$/, "$1-$2");
  return valor;
}

// =========================================
// COMPONENTE PRINCIPAL
// =========================================

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [pacienteHistorico, setPacienteHistorico] = useState(null);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profissao, setProfissao] = useState("");

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

  async function carregarFinanceiro() {
    const resposta = await fetch("/api/financeiro");
    const dados = await resposta.json();

    if (Array.isArray(dados.pagamentos)) {
      setPagamentos(dados.pagamentos);
    } else {
      setPagamentos([]);
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
    setNome(paciente.nome_completo || "");
    setCpf(paciente.cpf || "");
    setTelefone(paciente.telefone || "");
    setProfissao(paciente.profissao || "");
    setEditandoId(paciente.id_paciente);
    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function abrirHistorico(paciente) {
    setPacienteHistorico(paciente);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function fecharHistorico() {
    setPacienteHistorico(null);
  }

  function novaConsulta() {
    window.location.href = "/consultas";
  }

  function limparFormulario() {
    setNome("");
    setCpf("");
    setTelefone("");
    setProfissao("");
    setEditandoId(null);
    setMostrarFormulario(false);
  }

  useEffect(() => {
    carregarPacientes();
    carregarConsultas();
    carregarFinanceiro();
  }, []);

  const pacientesFiltrados = pacientes.filter((paciente) =>
    paciente.nome_completo?.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const consultasDoPaciente = pacienteHistorico
    ? consultas.filter(
        (consulta) =>
          Number(consulta.id_paciente) === Number(pacienteHistorico.id_paciente)
      )
    : [];

  const consultasOrdenadas = [...consultasDoPaciente].sort((a, b) => {
    const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
    const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;
    return dataB.localeCompare(dataA);
  });

  const consultasRealizadas = consultasDoPaciente.filter(
    (consulta) => consulta.status_consulta === "Realizado"
  );

  const consultasPendentes = consultasDoPaciente
    .filter(
      (consulta) =>
        consulta.status_consulta === "Agendado" ||
        consulta.status_consulta === "Confirmado"
    )
    .sort((a, b) => {
      const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
      const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;
      return dataA.localeCompare(dataB);
    });

  const proximaConsulta = consultasPendentes[0];

  const ultimaConsulta = [...consultasDoPaciente]
    .sort((a, b) => {
      const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
      const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;
      return dataB.localeCompare(dataA);
    })[0];

  const pagamentosDoPaciente = pacienteHistorico
    ? pagamentos.filter(
        (pagamento) =>
          Number(pagamento.id_paciente) === Number(pacienteHistorico.id_paciente)
      )
    : [];

  const pagamentosPagos = pagamentosDoPaciente.filter(
    (pagamento) => pagamento.status_pagamento === "Pago"
  );

  const pagamentosPendentes = pagamentosDoPaciente.filter(
    (pagamento) => pagamento.status_pagamento === "Pendente"
  );

  const totalRecebidoPaciente = pagamentosPagos.reduce(
    (total, pagamento) => total + Number(pagamento.valor || 0),
    0
  );

  const totalPendentePaciente = pagamentosPendentes.reduce(
    (total, pagamento) => total + Number(pagamento.valor || 0),
    0
  );

  const ultimoPagamento = [...pagamentosDoPaciente]
    .sort((a, b) => {
      const dataA = `${a.data_pagamento || ""}`;
      const dataB = `${b.data_pagamento || ""}`;
      return dataB.localeCompare(dataA);
    })[0];

  function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarHora(hora) {
    return hora?.slice(0, 5) || "-";
  }

  function exportarPDFPacientes() {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Clínica de Psicologia", 14, 20);

    doc.setFontSize(11);
    doc.text(
      `Relatório de Pacientes - ${new Date().toLocaleDateString("pt-BR")}`,
      14,
      30
    );

    doc.text(`Total de pacientes: ${pacientes.length}`, 14, 45);

    autoTable(doc, {
      startY: 55,
      head: [["ID", "Nome", "CPF", "Telefone", "Profissão"]],
      body: pacientes.map((paciente) => [
        paciente.id_paciente,
        paciente.nome_completo || "-",
        paciente.cpf || "-",
        paciente.telefone || "-",
        paciente.profissao || "-",
      ]),
    });

    doc.save("pacientes-clinica.pdf");
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function corStatus(status) {
    if (status === "Confirmado") return "bg-green-100 text-green-700";
    if (status === "Realizado") return "bg-blue-100 text-blue-700";
    if (status === "Cancelado") return "bg-red-100 text-red-700";
    if (status === "Faltou") return "bg-orange-100 text-orange-700";

    return "bg-[#e8eadf] text-[#1d3557]";
  }

  function corPagamento(status) {
    if (status === "Pago") return "bg-green-100 text-green-700";
    if (status === "Pendente") return "bg-yellow-100 text-yellow-700";
    if (status === "Cancelado") return "bg-red-100 text-red-700";

    return "bg-[#e8eadf] text-[#1d3557]";
  }

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

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={exportarPDFPacientes}
                className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-green-700 transition"
              >
                Exportar PDF
              </button>

              <button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                + Novo Paciente
              </button>
            </div>
          </div>

          {pacienteHistorico && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-8 overflow-hidden"
            >
              <div className="bg-[#1d3557] p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-blue-100 text-sm">
                    Prontuário do paciente
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold mt-1">
                    {pacienteHistorico.nome_completo}
                  </h2>

                  <p className="text-blue-100 text-sm mt-2">
                    Paciente #{pacienteHistorico.id_paciente}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    onClick={novaConsulta}
                    className="bg-white text-[#1d3557] px-5 py-3 rounded-2xl hover:bg-blue-50 transition"
                  >
                    Nova consulta
                  </button>

                  <button
                    onClick={() => editarPaciente(pacienteHistorico)}
                    className="bg-white/10 text-white px-5 py-3 rounded-2xl hover:bg-white/20 transition"
                  >
                    Editar paciente
                  </button>

                  <button
                    onClick={fecharHistorico}
                    className="bg-white/10 text-white px-5 py-3 rounded-2xl hover:bg-white/20 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <HistoricoCard
                    titulo="Total de consultas"
                    valor={consultasDoPaciente.length}
                  />

                  <HistoricoCard
                    titulo="Realizadas"
                    valor={consultasRealizadas.length}
                  />

                  <HistoricoCard
                    titulo="Próxima consulta"
                    valor={
                      proximaConsulta
                        ? `${formatarData(proximaConsulta.data_consulta)}`
                        : "Sem agenda"
                    }
                    descricao={
                      proximaConsulta
                        ? `${formatarHora(proximaConsulta.horario)}`
                        : "Nenhum horário"
                    }
                  />

                  <HistoricoCard
                    titulo="Recebido"
                    valor={formatarValor(totalRecebidoPaciente)}
                    descricao="Pagamentos pagos"
                    destaque
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-6">
                    <div className="bg-[#fbfaf7] rounded-3xl p-5 border border-gray-100">
                      <h3 className="text-xl font-bold text-[#1d3557] mb-4">
                        Dados do paciente
                      </h3>

                      <div className="space-y-3 text-sm">
                        <Info label="CPF" valor={pacienteHistorico.cpf || "-"} />
                        <Info
                          label="Telefone"
                          valor={pacienteHistorico.telefone || "-"}
                        />
                        <Info
                          label="Profissão"
                          valor={pacienteHistorico.profissao || "-"}
                        />
                      </div>
                    </div>

                    <div className="bg-[#fbfaf7] rounded-3xl p-5 border border-gray-100">
                      <h3 className="text-xl font-bold text-[#1d3557] mb-4">
                        Resumo clínico
                      </h3>

                      <div className="space-y-3 text-sm">
                        <Info
                          label="Última consulta"
                          valor={
                            ultimaConsulta
                              ? formatarData(ultimaConsulta.data_consulta)
                              : "-"
                          }
                        />

                        <Info
                          label="Próxima consulta"
                          valor={
                            proximaConsulta
                              ? formatarData(proximaConsulta.data_consulta)
                              : "-"
                          }
                        />

                        <Info
                          label="Pendentes"
                          valor={consultasPendentes.length}
                        />
                      </div>

                      <button
                        disabled
                        className="w-full mt-5 bg-gray-300 text-gray-500 py-3 rounded-2xl font-semibold cursor-not-allowed"
                      >
                        Anamnese em desenvolvimento
                      </button>
                    </div>

                    <div className="bg-[#fbfaf7] rounded-3xl p-5 border border-gray-100">
                      <h3 className="text-xl font-bold text-[#1d3557] mb-4">
                        Resumo financeiro
                      </h3>

                      <div className="space-y-3 text-sm">
                        <Info
                          label="Total recebido"
                          valor={formatarValor(totalRecebidoPaciente)}
                        />

                        <Info
                          label="Pendente"
                          valor={formatarValor(totalPendentePaciente)}
                        />

                        <Info
                          label="Pagamentos"
                          valor={pagamentosDoPaciente.length}
                        />

                        <Info
                          label="Último pagamento"
                          valor={
                            ultimoPagamento
                              ? formatarData(ultimoPagamento.data_pagamento)
                              : "-"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-[#fbfaf7] rounded-3xl p-5 border border-gray-100">
                    <h3 className="text-xl font-bold text-[#1d3557] mb-4">
                      Linha do tempo de consultas
                    </h3>

                    <div className="space-y-4">
                      {consultasOrdenadas.map((consulta) => (
                        <div
                          key={consulta.id_consulta}
                          className="relative bg-white rounded-2xl p-4 border border-gray-100"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <p className="font-bold text-[#1d3557]">
                                {formatarData(consulta.data_consulta)} às{" "}
                                {formatarHora(consulta.horario)}
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Psicólogo: {consulta.psicologo || "-"}
                              </p>

                              <p className="text-sm text-gray-500">
                                Tipo: {consulta.tipo_atendimento || "-"}
                              </p>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${corStatus(
                                consulta.status_consulta
                              )}`}
                            >
                              {consulta.status_consulta}
                            </span>
                          </div>

                          {consulta.observacoes && (
                            <p className="text-sm text-gray-600 mt-3 border-t border-gray-100 pt-3">
                              {consulta.observacoes}
                            </p>
                          )}
                        </div>
                      ))}

                      {consultasDoPaciente.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                          Nenhuma consulta encontrada para este paciente.
                        </div>
                      )}
                    </div>

                    <div className="mt-6 bg-white rounded-3xl p-5 border border-gray-100">
                      <h3 className="text-xl font-bold text-[#1d3557] mb-4">
                        Pagamentos do paciente
                      </h3>

                      <div className="space-y-3">
                        {pagamentosDoPaciente.map((pagamento) => (
                          <div
                            key={pagamento.id_pagamento}
                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#fbfaf7] rounded-2xl p-4 border border-gray-100"
                          >
                            <div>
                              <p className="font-bold text-[#1d3557]">
                                {formatarValor(pagamento.valor)}
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                {pagamento.forma_pagamento || "-"} •{" "}
                                {formatarData(pagamento.data_pagamento)}
                              </p>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${corPagamento(
                                pagamento.status_pagamento
                              )}`}
                            >
                              {pagamento.status_pagamento || "Indefinido"}
                            </span>
                          </div>
                        ))}

                        {pagamentosDoPaciente.length === 0 && (
                          <div className="p-6 text-center text-gray-500">
                            Nenhum pagamento encontrado para este paciente.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <ResumoCard titulo="Total de pacientes" valor={pacientes.length} />

            <ResumoCard
              titulo="Resultados da busca"
              valor={pacientesFiltrados.length}
            />

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
              <table className="w-full min-w-[1000px]">
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
                            onClick={() => abrirHistorico(paciente)}
                            className="bg-[#1d3557] text-white px-4 py-2 rounded-2xl hover:opacity-90 transition"
                          >
                            Histórico
                          </button>

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

                  <div className="grid grid-cols-1 gap-3 mt-5">
                    <button
                      onClick={() => abrirHistorico(paciente)}
                      className="bg-[#1d3557] text-white py-3 rounded-2xl hover:opacity-90 transition"
                    >
                      Histórico
                    </button>

                    <div className="grid grid-cols-2 gap-3">
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

// =========================================
// CARD DE RESUMO
// =========================================

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

      <h2 className="text-3xl md:text-4xl font-bold mt-3">{valor}</h2>
    </motion.div>
  );
}

// =========================================
// CARD DO HISTÓRICO
// =========================================

function HistoricoCard({ titulo, valor, descricao, destaque }) {
  return (
    <div
      className={`rounded-3xl p-5 border ${
        destaque
          ? "bg-[#1d3557] border-[#1d3557] text-white"
          : "bg-[#fbfaf7] border-gray-100 text-[#1d3557]"
      }`}
    >
      <p className={`text-sm ${destaque ? "text-blue-100" : "text-gray-500"}`}>
        {titulo}
      </p>

      <h3 className="text-2xl font-bold mt-2">{valor}</h3>

      {descricao && (
        <p
          className={`text-xs mt-1 ${
            destaque ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {descricao}
        </p>
      )}
    </div>
  );
}

// =========================================
// INFO
// =========================================

function Info({ label, valor }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-[#1d3557] font-medium text-right">{valor}</span>
    </div>
  );
}

"use client";

// =====================================================
// IMPORTAÇÕES
// =====================================================
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "../components/Sidebar";
import Protegido from "../components/Protegido";

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function formatarCPF(valor = "") {
  const cpf = String(valor).replace(/\D/g, "").slice(0, 11);

  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return cpf.replace(/^(\d{3})(\d+)$/, "$1.$2");
  if (cpf.length <= 9) {
    return cpf.replace(/^(\d{3})(\d{3})(\d+)$/, "$1.$2.$3");
  }

  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
}

function formatarTelefone(valor = "") {
  const telefone = String(valor).replace(/\D/g, "").slice(0, 11);

  if (telefone.length <= 2) return telefone;
  if (telefone.length <= 6) {
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
  }
  if (telefone.length <= 10) {
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`;
  }

  return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
}

function normalizarStatus(status) {
  return String(status || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatarData(data) {
  if (!data) return "-";

  const texto = String(data).slice(0, 10);
  const partes = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (partes) {
    return `${partes[3]}/${partes[2]}/${partes[1]}`;
  }

  const convertida = new Date(data);
  if (Number.isNaN(convertida.getTime())) return "-";

  return convertida.toLocaleDateString("pt-BR");
}

function formatarHora(hora) {
  return hora ? String(hora).slice(0, 5) : "-";
}

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function lerResposta(resposta) {
  let dados = {};

  try {
    dados = await resposta.json();
  } catch {
    dados = {};
  }

  if (!resposta.ok) {
    throw new Error(
      dados?.erro ||
        dados?.mensagem ||
        `A operação falhou (HTTP ${resposta.status}).`
    );
  }

  return dados;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [anamneses, setAnamneses] = useState([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [pacienteHistorico, setPacienteHistorico] = useState(null);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profissao, setProfissao] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  const [carregandoPacientes, setCarregandoPacientes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [enviandoEmailId, setEnviandoEmailId] = useState(null);

  // =====================================================
  // CARREGAR PACIENTES
  // =====================================================

  const carregarPacientes = useCallback(async () => {
    setCarregandoPacientes(true);

    try {
      const resposta = await fetch("/api/pacientes", {
        method: "GET",
        cache: "no-store",
      });

      const dados = await lerResposta(resposta);

      if (!Array.isArray(dados)) {
        throw new Error("A API não retornou uma lista de pacientes.");
      }

      setPacientes(dados);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      toast.error(error.message || "Não foi possível carregar os pacientes.");
    } finally {
      setCarregandoPacientes(false);
    }
  }, []);

  // =====================================================
  // CARREGAR CONSULTAS
  // =====================================================

  const carregarConsultas = useCallback(async () => {
    try {
      const resposta = await fetch("/api/consultas", {
        cache: "no-store",
      });

      const dados = await lerResposta(resposta);

      setConsultas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar consultas:", error);
      setConsultas([]);
    }
  }, []);

  // =====================================================
  // CARREGAR PAGAMENTOS
  // =====================================================

  const carregarFinanceiro = useCallback(async () => {
    try {
      const resposta = await fetch("/api/financeiro", {
        cache: "no-store",
      });

      const dados = await lerResposta(resposta);
      const lista = Array.isArray(dados) ? dados : dados?.pagamentos;

      setPagamentos(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
      setPagamentos([]);
    }
  }, []);

  // =====================================================
  // CARREGAR ANAMNESES
  // =====================================================

  const carregarAnamneses = useCallback(async () => {
    try {
      const resposta = await fetch("/api/relatorio-anamnese", {
        cache: "no-store",
      });

      const dados = await lerResposta(resposta);

      setAnamneses(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar anamneses:", error);
      setAnamneses([]);
    }
  }, []);

  // =====================================================
  // CARREGAR DADOS INICIAIS
  // =====================================================

  useEffect(() => {
    carregarPacientes();
    carregarConsultas();
    carregarFinanceiro();
    carregarAnamneses();
  }, [
    carregarPacientes,
    carregarConsultas,
    carregarFinanceiro,
    carregarAnamneses,
  ]);

  // =====================================================
  // LIMPAR FORMULÁRIO
  // =====================================================

  function limparFormulario() {
    setNome("");
    setDataNascimento("");
    setCpf("");
    setTelefone("");
    setProfissao("");
    setEditandoId(null);
    setMostrarFormulario(false);
  }

  // =====================================================
  // CADASTRAR OU ATUALIZAR PACIENTE
  // =====================================================

  async function cadastrarPaciente() {
    if (salvando) return;

    if (!nome.trim() || !dataNascimento || !cpf.trim()) {
      toast.error("Preencha nome, data de nascimento e CPF.");
      return;
    }

    if (cpf.replace(/\D/g, "").length !== 11) {
      toast.error("Informe um CPF com 11 números.");
      return;
    }

    if (dataNascimento > new Date().toISOString().slice(0, 10)) {
      toast.error("A data de nascimento não pode estar no futuro.");
      return;
    }

    setSalvando(true);

    try {
      const dadosPaciente = {
        nome_completo: nome.trim(),
        data_nascimento: dataNascimento,
        cpf: cpf.replace(/\D/g, ""),
        telefone: telefone.trim(),
        profissao: profissao.trim(),
      };

      const resposta = await fetch("/api/pacientes", {
        method: editandoId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editandoId
            ? { ...dadosPaciente, id: editandoId }
            : dadosPaciente
        ),
      });

      const dados = await lerResposta(resposta);

      toast.success(
        dados?.mensagem ||
          (editandoId
            ? "Paciente atualizado com sucesso!"
            : "Paciente cadastrado com sucesso!")
      );

      limparFormulario();
      await carregarPacientes();
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      toast.error(error.message || "Não foi possível salvar o paciente.");
    } finally {
      setSalvando(false);
    }
  }

  // =====================================================
  // REENVIAR CONFIRMAÇÃO DE E-MAIL
  // =====================================================

  async function reenviarConfirmacaoEmail(paciente) {
    if (enviandoEmailId !== null) return;

    const confirmar = window.confirm(
      `Deseja enviar um e-mail de confirmação para ${paciente.nome_completo}?`
    );

    if (!confirmar) return;

    setEnviandoEmailId(paciente.id_paciente);

    try {
      const resposta = await fetch(
        "/api/admin/enviar-confirmacao-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_paciente: paciente.id_paciente,
          }),
        }
      );

      const dados = await lerResposta(resposta);

      toast.success(
        dados?.mensagem || "Solicitação processada com sucesso."
      );
    } catch (error) {
      console.error("Erro ao enviar confirmação:", error);
      toast.error(error.message || "Não foi possível enviar o e-mail.");
    } finally {
      setEnviandoEmailId(null);
    }
  }

  // =====================================================
  // EXCLUIR PACIENTE
  // =====================================================

  async function deletarPaciente(id) {
    if (excluindoId !== null) return;

    const confirmar = window.confirm(
      "Deseja realmente excluir este paciente? Essa operação não poderá ser desfeita."
    );

    if (!confirmar) return;

    setExcluindoId(id);

    try {
      const resposta = await fetch("/api/pacientes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const dados = await lerResposta(resposta);

      toast.success(dados?.mensagem || "Paciente excluído com sucesso!");

      if (
        pacienteHistorico &&
        Number(pacienteHistorico.id_paciente) === Number(id)
      ) {
        setPacienteHistorico(null);
      }

      await carregarPacientes();
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      toast.error(error.message || "Não foi possível excluir o paciente.");
    } finally {
      setExcluindoId(null);
    }
  }

  // =====================================================
  // EDITAR PACIENTE
  // =====================================================

  function editarPaciente(paciente) {
    setNome(paciente.nome_completo || "");
    setDataNascimento(String(paciente.data_nascimento || "").slice(0, 10));
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

  // =====================================================
  // HISTÓRICO
  // =====================================================

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

  // =====================================================
  // FILTROS E DADOS DO HISTÓRICO
  // =====================================================

  const pacientesFiltrados = pacientes.filter((paciente) =>
    String(paciente.nome_completo || "")
      .toLowerCase()
      .includes(pesquisa.toLowerCase().trim())
  );

  const consultasDoPaciente = pacienteHistorico
    ? consultas.filter(
        (consulta) =>
          Number(consulta.id_paciente) ===
          Number(pacienteHistorico.id_paciente)
      )
    : [];

  const consultasOrdenadas = [...consultasDoPaciente].sort((a, b) => {
    const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
    const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;

    return dataB.localeCompare(dataA);
  });

  const consultasRealizadas = consultasDoPaciente.filter((consulta) =>
    ["realizado", "realizada"].includes(
      normalizarStatus(consulta.status_consulta)
    )
  );

  const consultasPendentes = consultasDoPaciente
    .filter((consulta) =>
      ["agendada", "agendado", "confirmado", "confirmada"].includes(
        normalizarStatus(consulta.status_consulta)
      )
    )
    .sort((a, b) => {
      const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
      const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;

      return dataA.localeCompare(dataB);
    });

  const proximaConsulta = consultasPendentes[0];

  const ultimaConsulta = [...consultasDoPaciente].sort((a, b) => {
    const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
    const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;

    return dataB.localeCompare(dataA);
  })[0];

  const anamneseDoPaciente = pacienteHistorico
    ? anamneses.find(
        (anamnese) =>
          Number(anamnese.id_paciente) ===
          Number(pacienteHistorico.id_paciente)
      )
    : null;

  const pagamentosDoPaciente = pacienteHistorico
    ? pagamentos.filter(
        (pagamento) =>
          Number(pagamento.id_paciente) ===
          Number(pacienteHistorico.id_paciente)
      )
    : [];

  const pagamentosPagos = pagamentosDoPaciente.filter(
    (pagamento) =>
      normalizarStatus(pagamento.status_pagamento) === "pago"
  );

  const pagamentosPendentes = pagamentosDoPaciente.filter(
    (pagamento) =>
      normalizarStatus(pagamento.status_pagamento) === "pendente"
  );

  const totalRecebidoPaciente = pagamentosPagos.reduce(
    (total, pagamento) => total + Number(pagamento.valor || 0),
    0
  );

  const totalPendentePaciente = pagamentosPendentes.reduce(
    (total, pagamento) => total + Number(pagamento.valor || 0),
    0
  );

  const ultimoPagamento = [...pagamentosDoPaciente].sort((a, b) =>
    String(b.data_pagamento || "").localeCompare(
      String(a.data_pagamento || "")
    )
  )[0];

  // =====================================================
  // EXPORTAR PDF
  // =====================================================

  function exportarPDFPacientes() {
    try {
      if (pacientes.length === 0) {
        toast.error("Não há pacientes para exportar.");
        return;
      }

      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("Clinica de Psicologia", 14, 20);

      doc.setFontSize(11);
      doc.text(
        `Relatorio de Pacientes - ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        30
      );

      doc.text(`Total de pacientes: ${pacientes.length}`, 14, 45);

      autoTable(doc, {
        startY: 55,
        head: [["ID", "Nome", "Telefone", "Profissão"]],
        body: pacientes.map((paciente) => [
          paciente.id_paciente,
          paciente.nome_completo || "-",
          paciente.telefone || "-",
          paciente.profissao || "-",
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [29, 53, 87],
        },
      });

      doc.save("pacientes-clinica.pdf");
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Não foi possível gerar o relatório PDF.");
    }
  }

  // =====================================================
  // CORES DOS STATUS
  // =====================================================

  function corStatus(status) {
    const valor = normalizarStatus(status);

    if (valor === "confirmado" || valor === "confirmada") {
      return "bg-green-100 text-green-700";
    }

    if (valor === "realizado" || valor === "realizada") {
      return "bg-blue-100 text-blue-700";
    }

    if (valor === "cancelado" || valor === "cancelada") {
      return "bg-red-100 text-red-700";
    }

    if (valor === "faltou") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-[#e8eadf] text-[#1d3557]";
  }

  function corPagamento(status) {
    const valor = normalizarStatus(status);

    if (valor === "pago") return "bg-green-100 text-green-700";
    if (valor === "pendente") return "bg-yellow-100 text-yellow-700";

    if (valor === "cancelado" || valor === "cancelada") {
      return "bg-red-100 text-red-700";
    }

    return "bg-[#e8eadf] text-[#1d3557]";
  }

  // =====================================================
  // BOTÃO DE REENVIO DE E-MAIL
  // =====================================================

  function BotaoEmail({ paciente }) {
    return (
    <button
    type="button"
    onClick={() => reenviarConfirmacaoEmail(paciente)}
    disabled={enviandoEmailId !== null}
    className="w-full bg-indigo-600 text-white font-bold px-4 py-3 rounded-xl border-2 border-indigo-800 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
    {enviandoEmailId === paciente.id_paciente
    ? "Enviando confirmação..."
    : "✉️ REENVIAR CONFIRMAÇÃO DE E-MAIL"} </button>
    );
    }


  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <Protegido>
      <div className="flex min-h-screen bg-[#fbfaf7]">
        <Sidebar />

        <main className="md:ml-64 w-full min-w-0 p-4 pt-20 md:p-10">
          {/* CABEÇALHO */}
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

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={exportarPDFPacientes}
                className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-green-700 transition"
              >
                Exportar PDF
              </button>

              <button
                type="button"
                onClick={() => {
                  if (mostrarFormulario) {
                    limparFormulario();
                  } else {
                    setMostrarFormulario(true);
                  }
                }}
                className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 transition"
              >
                {mostrarFormulario ? "Fechar formulário" : "+ Novo Paciente"}
              </button>
            </div>
          </div>

          {/* HISTÓRICO DO PACIENTE */}
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

                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={novaConsulta}
                    className="bg-white text-[#1d3557] px-5 py-3 rounded-2xl hover:bg-blue-50 transition"
                  >
                    Nova consulta
                  </button>

                  <button
                    type="button"
                    onClick={() => editarPaciente(pacienteHistorico)}
                    className="bg-white/10 text-white px-5 py-3 rounded-2xl hover:bg-white/20 transition"
                  >
                    Editar paciente
                  </button>

                  <button
                    type="button"
                    onClick={fecharHistorico}
                    className="bg-white/10 text-white px-5 py-3 rounded-2xl hover:bg-white/20 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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
                        ? formatarData(proximaConsulta.data_consulta)
                        : "Sem agenda"
                    }
                    descricao={
                      proximaConsulta
                        ? formatarHora(proximaConsulta.horario)
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
                          label="Nascimento"
                          valor={formatarData(pacienteHistorico.data_nascimento)}
                        />
                        <Info
                          label="Telefone"
                          valor={pacienteHistorico.telefone || "-"}
                        />
                        <Info
                          label="Profissão"
                          valor={pacienteHistorico.profissao || "-"}
                        />
                        <Info
                          label="E-mail"
                          valor={pacienteHistorico.email || "-"}
                        />
                      </div>
                    </div>

                    <div className="bg-[#fbfaf7] rounded-3xl p-5 border border-gray-100">
                      <h3 className="text-xl font-bold text-[#1d3557] mb-4">
                        Resumo da anamnese
                      </h3>

                      <div className="space-y-3 text-sm">
                        <Info
                          label="Motivo"
                          valor={anamneseDoPaciente?.motivo_consulta || "-"}
                        />
                        <Info
                          label="Tempo do problema"
                          valor={anamneseDoPaciente?.tempo_problema || "-"}
                        />
                        <Info
                          label="Ansiedade"
                          valor={anamneseDoPaciente?.ansiedade || "-"}
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

                  {/* LINHA DO TEMPO */}
                  <div className="lg:col-span-2 bg-[#fbfaf7] rounded-3xl p-4 md:p-5 border border-gray-100 min-w-0">
                    <h3 className="text-xl font-bold text-[#1d3557] mb-4">
                      Linha do tempo de consultas
                    </h3>

                    <div className="space-y-4">
                      {consultasOrdenadas.map((consulta) => (
                        <div
                          key={consulta.id_consulta}
                          className="bg-white rounded-2xl p-4 border border-gray-100"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-[#1d3557]">
                                {formatarData(consulta.data_consulta)} às{" "}
                                {formatarHora(consulta.horario)}
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                Psicólogo:{" "}
                                {consulta.nome_psicologo ||
                                  consulta.psicologo ||
                                  "-"}
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
                              {consulta.status_consulta || "Indefinido"}
                            </span>
                          </div>

                          {consulta.observacoes && (
                            <p className="text-sm text-gray-600 mt-3 border-t border-gray-100 pt-3 break-words">
                              {consulta.observacoes}
                            </p>
                          )}
                        </div>
                      ))}

                      {consultasDoPaciente.length === 0 && (
                        <div className="p-6 text-center text-gray-500 bg-white rounded-2xl">
                          Nenhuma consulta encontrada para este paciente.
                        </div>
                      )}
                    </div>

                    {/* PAGAMENTOS */}
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

          {/* INDICADORES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8">
            <ResumoCard titulo="Total de pacientes" valor={pacientes.length} />
            <ResumoCard
              titulo="Resultados da busca"
              valor={pacientesFiltrados.length}
            />
            <ResumoCard titulo="Status" valor="Base ativa" destaque />
          </div>

          {/* FORMULÁRIO */}
          {mostrarFormulario && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
                {editandoId ? "Editar paciente" : "Novo paciente"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nome completo"
                  autoComplete="name"
                  value={nome}
                  maxLength={150}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setNome(e.target.value)}
                />

                <input
                  type="date"
                  aria-label="Data de nascimento"
                  value={dataNascimento}
                  max={new Date().toISOString().slice(0, 10)}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setDataNascimento(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="CPF"
                  inputMode="numeric"
                  autoComplete="off"
                  value={cpf}
                  maxLength={14}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                />

                <input
                  type="tel"
                  placeholder="Telefone"
                  autoComplete="tel"
                  inputMode="tel"
                  value={telefone}
                  maxLength={16}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                />

                <input
                  type="text"
                  placeholder="Profissão"
                  autoComplete="organization-title"
                  value={profissao}
                  maxLength={120}
                  className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  onChange={(e) => setProfissao(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={cadastrarPaciente}
                  disabled={salvando}
                  className="bg-[#1d3557] text-white px-6 py-3 rounded-2xl shadow hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {salvando
                    ? "Salvando..."
                    : editandoId
                      ? "Atualizar paciente"
                      : "Salvar paciente"}
                </button>

                <button
                  type="button"
                  onClick={limparFormulario}
                  disabled={salvando}
                  className="bg-[#f3f1eb] text-[#1d3557] px-6 py-3 rounded-2xl hover:bg-gray-200 transition disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}

          {/* PESQUISA */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <label
              htmlFor="pesquisa-pacientes"
              className="block text-sm font-medium text-[#1d3557] mb-2"
            >
              Pesquisar pacientes
            </label>

            <input
              id="pesquisa-pacientes"
              type="search"
              placeholder="Pesquisar paciente pelo nome..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="border border-gray-200 p-4 rounded-2xl w-full text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
            />
          </div>

          {/* LISTA DE PACIENTES */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#1d3557]">
                Lista de pacientes
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Visualize os pacientes disponíveis para o seu perfil.
              </p>
            </div>

            {carregandoPacientes ? (
              <div className="p-10 text-center text-gray-500">
                Carregando pacientes...
              </div>
            ) : (
              <>
                {/* TABELA DESKTOP */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[1200px]">
                    <thead className="bg-[#f3f1eb] text-[#1d3557]">
                      <tr>
                        <th className="text-left p-4">ID</th>
                        <th className="text-left p-4">Paciente</th>
                        <th className="text-left p-4">Idade</th>
                        <th className="text-left p-4">Nascimento</th>
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
                              <div className="w-10 h-10 shrink-0 rounded-full bg-[#1d3557]/10 text-[#1d3557] flex items-center justify-center font-bold">
                                {paciente.nome_completo?.charAt(0) || "P"}
                              </div>

                              <div>
                                <p className="font-semibold text-[#1d3557]">
                                  {paciente.nome_completo || "-"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Paciente #{paciente.id_paciente}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            {paciente.idade != null
                              ? `${paciente.idade} anos`
                              : "-"}
                          </td>

                          <td className="p-4">
                            {formatarData(paciente.data_nascimento)}
                          </td>

                          <td className="p-4">{paciente.cpf || "-"}</td>
                          <td className="p-4">{paciente.telefone || "-"}</td>
                          <td className="p-4">{paciente.profissao || "-"}</td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => abrirHistorico(paciente)}
                                className="bg-[#1d3557] text-white px-4 py-2 rounded-xl hover:opacity-90 transition"
                              >
                                Histórico
                              </button>

                              <button
                                type="button"
                                onClick={() => editarPaciente(paciente)}
                                className="bg-[#2b4c7e] text-white px-4 py-2 rounded-xl hover:opacity-90 transition"
                              >
                                Editar
                              </button>

                              <BotaoEmail paciente={paciente} />

                              <button
                                type="button"
                                disabled={excluindoId !== null}
                                onClick={() =>
                                  deletarPaciente(paciente.id_paciente)
                                }
                                className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition disabled:opacity-50"
                              >
                                {excluindoId === paciente.id_paciente
                                  ? "Excluindo..."
                                  : "Excluir"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {pacientesFiltrados.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="p-8 text-center text-gray-500"
                          >
                            Nenhum paciente encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* CARDS MOBILE */}
                <div className="md:hidden p-4 space-y-4">
                  {pacientesFiltrados.map((paciente) => (
                    <motion.div
                      key={paciente.id_paciente}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#fbfaf7] rounded-3xl p-5 border border-[#1d3557]/10 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#1d3557]/10 text-[#1d3557] flex items-center justify-center font-bold">
                          {paciente.nome_completo?.charAt(0) || "P"}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-[#1d3557] break-words">
                            {paciente.nome_completo || "-"}
                          </h3>

                          <p className="text-xs text-gray-500">
                            Paciente #{paciente.id_paciente}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <Info
                          label="Nascimento"
                          valor={formatarData(paciente.data_nascimento)}
                        />
                        <Info label="CPF" valor={paciente.cpf || "-"} />
                        <Info
                          label="Telefone"
                          valor={paciente.telefone || "-"}
                        />
                        <Info
                          label="Profissão"
                          valor={paciente.profissao || "-"}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 mt-5">
                        <button
                          type="button"
                          onClick={() => abrirHistorico(paciente)}
                          className="bg-[#1d3557] text-white py-3 rounded-2xl hover:opacity-90 transition"
                        >
                          Histórico
                        </button>

                        <button
                          type="button"
                          onClick={() => editarPaciente(paciente)}
                          className="bg-[#2b4c7e] text-white py-3 rounded-2xl hover:opacity-90 transition"
                        >
                          Editar paciente
                        </button>

                        <BotaoEmail paciente={paciente} />

                        <button
                          type="button"
                          disabled={excluindoId !== null}
                          onClick={() => deletarPaciente(paciente.id_paciente)}
                          className="bg-red-500 text-white py-3 rounded-2xl hover:bg-red-600 transition disabled:opacity-50"
                        >
                          {excluindoId === paciente.id_paciente
                            ? "Excluindo..."
                            : "Excluir paciente"}
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
              </>
            )}
          </div>
        </main>
      </div>
    </Protegido>
  );
}

// =====================================================
// CARD DE RESUMO
// =====================================================

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

// =====================================================
// CARD DO HISTÓRICO
// =====================================================

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

// =====================================================
// COMPONENTE DE INFORMAÇÃO
// =====================================================

function Info({ label, valor }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2">
      <span className="text-gray-500 shrink-0">{label}</span>

      <span className="text-[#1d3557] font-medium text-right break-words min-w-0">
        {valor}
      </span>
    </div>
  );
}
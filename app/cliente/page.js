"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const frases = [
  "Você não precisa vencer todos os dias. Alguns dias, apenas continuar já é uma grande vitória.",
  "Cuidar da mente é um gesto de coragem, respeito e amor por si mesmo.",
  "Seu processo tem valor, mesmo quando os avanços parecem pequenos.",
  "Respire. Você está fazendo o melhor que pode com o que tem hoje.",
  "A cura não é uma linha reta, mas cada passo importa.",
  "Você merece acolhimento, descanso e cuidado.",
  "Pequenos progressos ainda são progressos.",
];

const abas = [
  { id: "inicio", label: "Início", icone: "⌂" },
  { id: "consultas", label: "Consultas", icone: "▦" },
  { id: "dados", label: "Meus dados", icone: "♙" },
  { id: "seguranca", label: "Segurança", icone: "♢" },
];

const STATUS_CANCELADOS = ["Cancelado", "Cancelada"];
const STATUS_ENCERRADOS = [
  "Realizado",
  "Realizada",
  "Faltou",
  "Cancelado",
  "Cancelada",
];

export default function Cliente() {
  const router = useRouter();

  const [abaAtiva, setAbaAtiva] = useState("inicio");
  const [frase, setFrase] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [idPaciente, setIdPaciente] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [confirmandoConsulta, setConfirmandoConsulta] = useState(null);

  // Estados do agendamento
  const [mostrarAgendamento, setMostrarAgendamento] = useState(false);
  const [psicologosAgendamento, setPsicologosAgendamento] = useState([]);
  const [psicologoSelecionado, setPsicologoSelecionado] = useState("");
  const [dataAgendamento, setDataAgendamento] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [carregandoPsicologos, setCarregandoPsicologos] = useState(false);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [enviandoAgendamento, setEnviandoAgendamento] = useState(false);

  // Estados da senha
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    const logado = localStorage.getItem("logado");
    const tipoUsuario = localStorage.getItem("tipo_usuario");
    const pacienteId = localStorage.getItem("id_paciente");

    if (
      logado !== "true" ||
      tipoUsuario !== "paciente" ||
      !pacienteId
    ) {
      router.replace("/login");
      return;
    }

    setIdPaciente(pacienteId);
    setFrase(frases[Math.floor(Math.random() * frases.length)]);
    carregarDadosPaciente(pacienteId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function carregarDadosPaciente(pacienteId, mostrarErro = true) {
    try {
      setCarregando(true);

      const resposta = await fetch(
        `/api/cliente?id_paciente=${encodeURIComponent(pacienteId)}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.erro) {
        if (resposta.status === 401 || resposta.status === 403) {
          toast.error("Sua sessão expirou. Entre novamente.");
          sair();
          return;
        }

        if (mostrarErro) {
          toast.error(
            resultado.erro || "Não foi possível carregar seus dados."
          );
        }

        return;
      }

      setPaciente(resultado.paciente);
      setConsultas(resultado.consultas || []);
    } catch (error) {
      console.error("Erro ao carregar dados do paciente:", error);

      if (mostrarErro) {
        toast.error("Erro de conexão ao carregar seus dados.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarConsulta(idConsulta) {
    try {
      setConfirmandoConsulta(idConsulta);

      const resposta = await fetch("/api/cliente", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "confirmar_consulta",
          id_paciente: idPaciente,
          id_consulta: idConsulta,
          status_consulta: "Confirmado",
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.erro) {
        toast.error(
          resultado.erro || "Não foi possível confirmar a consulta."
        );
        return;
      }

      toast.success("Consulta confirmada com sucesso!");
      await carregarDadosPaciente(idPaciente, false);
    } catch (error) {
      console.error("Erro ao confirmar consulta:", error);
      toast.error("Erro de conexão ao confirmar consulta.");
    } finally {
      setConfirmandoConsulta(null);
    }
  }

  // Abre o formulário e carrega os profissionais disponíveis.
  async function abrirAgendamento() {
    setMostrarAgendamento(true);

    if (psicologosAgendamento.length > 0) return;

    try {
      setCarregandoPsicologos(true);

      const resposta = await fetch("/api/cliente/agendamento", {
        cache: "no-store",
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        toast.error(
          resultado.erro || "Não foi possível carregar os psicólogos."
        );
        return;
      }

      setPsicologosAgendamento(resultado.psicologos || []);
    } catch (error) {
      console.error("Erro ao carregar psicólogos:", error);
      toast.error("Erro de conexão ao carregar os psicólogos.");
    } finally {
      setCarregandoPsicologos(false);
    }
  }

  // Busca os horários livres para a data e o profissional escolhidos.
  async function carregarHorariosDisponiveis(data, idPsicologo) {
    setDataAgendamento(data);
    setPsicologoSelecionado(idPsicologo);
    setHorarioSelecionado("");
    setHorariosDisponiveis([]);

    if (!data || !idPsicologo) return;

    try {
      setCarregandoHorarios(true);

      const parametros = new URLSearchParams({
        data,
        id_psicologo: idPsicologo,
      });

      const resposta = await fetch(
        `/api/cliente/agendamento?${parametros.toString()}`,
        { cache: "no-store" }
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        toast.error(
          resultado.erro || "Não foi possível consultar os horários."
        );
        return;
      }

      setHorariosDisponiveis(resultado.horarios || []);

      if (!resultado.horarios?.length) {
        toast("Não há horários disponíveis nessa data.");
      }
    } catch (error) {
      console.error("Erro ao consultar horários:", error);
      toast.error("Erro de conexão ao consultar horários.");
    } finally {
      setCarregandoHorarios(false);
    }
  }

  // Envia a solicitação sem criar pagamento.
  async function solicitarAgendamento(event) {
    event.preventDefault();

    if (
      !psicologoSelecionado ||
      !dataAgendamento ||
      !horarioSelecionado
    ) {
      toast.error("Selecione o psicólogo, a data e o horário.");
      return;
    }

    try {
      setEnviandoAgendamento(true);

      const resposta = await fetch("/api/cliente/agendamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_psicologo: Number(psicologoSelecionado),
          data_consulta: dataAgendamento,
          horario: horarioSelecionado,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        toast.error(
          resultado.erro || "Não foi possível solicitar o agendamento."
        );

        // Se a vaga foi ocupada por outra solicitação,
        // consulta novamente os horários.
        if (resposta.status === 409) {
          await carregarHorariosDisponiveis(
            dataAgendamento,
            psicologoSelecionado
          );
        }

        return;
      }

      toast.success(
        "Solicitação enviada! Aguarde a confirmação da clínica."
      );

      setMostrarAgendamento(false);
      setPsicologoSelecionado("");
      setDataAgendamento("");
      setHorarioSelecionado("");
      setHorariosDisponiveis([]);

      await carregarDadosPaciente(idPaciente, false);
    } catch (error) {
      console.error("Erro ao solicitar agendamento:", error);
      toast.error("Erro de conexão ao solicitar o agendamento.");
    } finally {
      setEnviandoAgendamento(false);
    }
  }

  async function alterarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error("Preencha todos os campos de senha.");
      return;
    }

    if (novaSenha.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("A nova senha e a confirmação não são iguais.");
      return;
    }

    if (senhaAtual === novaSenha) {
      toast.error("A nova senha deve ser diferente da senha atual.");
      return;
    }

    try {
      setSalvandoSenha(true);

      const resposta = await fetch("/api/cliente", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "alterar_senha",
          id_paciente: idPaciente,
          senha_atual: senhaAtual,
          nova_senha: novaSenha,
          confirmar_senha: confirmarSenha,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.erro) {
        toast.error(
          resultado.erro || "Não foi possível alterar a senha."
        );
        return;
      }

      toast.success("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setMostrarSenha(false);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro de conexão ao alterar senha.");
    } finally {
      setSalvandoSenha(false);
    }
  }

  function sair() {
    localStorage.removeItem("logado");
    localStorage.removeItem("tipo_usuario");
    localStorage.removeItem("id_paciente");
    router.replace("/login");
  }

  function formatarData(data) {
    if (!data) return "-";

    const dataTexto = String(data).slice(0, 10);
    const partes = dataTexto.split("-");

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    const d = new Date(data);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
  }

  function formatarHora(hora) {
    return hora ? String(hora).slice(0, 5) : "-";
  }

  function corStatus(status) {
    if (status === "Confirmado") return "bg-green-100 text-green-700";

    if (
      status === "Pendente de confirmação" ||
      status === "Agendado" ||
      status === "Agendada"
    ) {
      return "bg-amber-100 text-amber-800";
    }

    if (status === "Realizado" || status === "Realizada") {
      return "bg-blue-100 text-blue-700";
    }

    if (STATUS_CANCELADOS.includes(status)) {
      return "bg-red-100 text-red-700";
    }

    if (status === "Faltou") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-[#e8eadf] text-[#1d3557]";
  }

  // Data local do navegador para os filtros da tela.
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Data mínima do campo de agendamento, em formato YYYY-MM-DD.
  const hojeTexto = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");

  const consultasFuturas = consultas
    .filter((consulta) => {
      if (!consulta.data_consulta) return false;

      const dataTexto = String(consulta.data_consulta).slice(0, 10);
      const partes = dataTexto.split("-");
      const dataConsulta =
        partes.length === 3
          ? new Date(
              Number(partes[0]),
              Number(partes[1]) - 1,
              Number(partes[2])
            )
          : new Date(consulta.data_consulta);

      return (
        dataConsulta >= hoje &&
        !STATUS_ENCERRADOS.includes(consulta.status_consulta)
      );
    })
    .sort((a, b) => {
      const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
      const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;
      return dataA.localeCompare(dataB);
    });

  const historicoConsultas = consultas
    .filter((consulta) => {
      if (!consulta.data_consulta) return false;

      const dataTexto = String(consulta.data_consulta).slice(0, 10);
      const partes = dataTexto.split("-");
      const dataConsulta =
        partes.length === 3
          ? new Date(
              Number(partes[0]),
              Number(partes[1]) - 1,
              Number(partes[2])
            )
          : new Date(consulta.data_consulta);

      return (
        dataConsulta < hoje ||
        STATUS_ENCERRADOS.includes(consulta.status_consulta)
      );
    })
    .sort((a, b) => {
      const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
      const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;
      return dataB.localeCompare(dataA);
    });

  const proximaConsulta = consultasFuturas[0];

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      <main className="mx-auto max-w-7xl p-4 md:p-8">
        {/* CABEÇALHO */}
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-[32px] bg-[#1d3557] p-6 text-white shadow-xl md:mb-8 md:rounded-[40px] md:p-12"
        >
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mb-3 font-semibold text-blue-100">
                Portal do Paciente
              </p>

              <h1 className="break-words text-3xl font-bold tracking-tight md:text-5xl">
                Olá, {paciente?.nome_completo || "paciente"}
              </h1>

              <p className="mt-4 max-w-2xl leading-relaxed text-blue-100">
                Acompanhe suas consultas e suas informações em um ambiente
                reservado.
              </p>
            </div>

            <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md lg:w-60 lg:shrink-0">
              <p className="text-sm text-blue-100">Acesso ativo</p>
              <h2 className="mt-1 text-xl font-bold">Área reservada</h2>

              <button
                type="button"
                onClick={sair}
                className="mt-5 w-full rounded-2xl bg-white py-3 font-semibold text-[#1d3557] transition hover:bg-[#f3f1eb]"
              >
                Sair da conta
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute bottom-0 right-8 select-none text-[180px] opacity-[0.06] md:text-[220px]">
            Ψ
          </div>
        </motion.header>

        {/* NAVEGAÇÃO ENTRE AS ABAS */}
        <nav
          aria-label="Navegação do portal"
          className="mb-6 rounded-3xl border border-[#1d3557]/10 bg-white p-2 shadow-sm md:mb-8 md:p-3"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {abas.map((aba) => (
              <button
                key={aba.id}
                type="button"
                onClick={() => setAbaAtiva(aba.id)}
                aria-current={abaAtiva === aba.id ? "page" : undefined}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition md:text-base ${
                  abaAtiva === aba.id
                    ? "bg-[#1d3557] text-white shadow-sm"
                    : "bg-[#fbfaf7] text-[#1d3557] hover:bg-[#e8eadf]"
                }`}
              >
                <span aria-hidden="true" className="text-lg">
                  {aba.icone}
                </span>
                {aba.label}
              </button>
            ))}
          </div>
        </nav>

        {carregando ? (
          <div className="rounded-3xl border border-[#1d3557]/10 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#1d3557]/20 border-t-[#1d3557]" />
            <p className="text-[#1d3557]">Carregando seus dados...</p>
          </div>
        ) : (
          <>
            {/* ABA INÍCIO */}
            {abaAtiva === "inicio" && (
              <motion.section
                key="inicio"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <section className="rounded-[30px] border border-[#1d3557]/10 bg-white p-6 shadow-sm md:rounded-[34px] md:p-8">
                    <p className="mb-2 font-semibold text-[#2b4c7e]">
                      Próximo atendimento
                    </p>

                    <h2 className="mb-6 text-2xl font-bold text-[#1d3557] md:text-3xl">
                      Sua próxima consulta
                    </h2>

                    {proximaConsulta ? (
                      <div className="rounded-3xl border border-[#1d3557]/10 bg-[#fbfaf7] p-5 md:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="mb-1 text-sm text-gray-500">
                              Data e horário
                            </p>

                            <h3 className="text-3xl font-bold text-[#1d3557] md:text-4xl">
                              {formatarData(proximaConsulta.data_consulta)}
                            </h3>

                            <p className="mt-1 text-xl font-semibold text-[#2b4c7e]">
                              às {formatarHora(proximaConsulta.horario)}
                            </p>
                          </div>

                          <span
                            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${corStatus(
                              proximaConsulta.status_consulta
                            )}`}
                          >
                            {proximaConsulta.status_consulta}
                          </span>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <MiniInfo
                            titulo="Psicólogo(a)"
                            valor={proximaConsulta.psicologo || "-"}
                          />
                          <MiniInfo
                            titulo="Atendimento"
                            valor={proximaConsulta.tipo_atendimento || "-"}
                          />
                        </div>

                        {proximaConsulta.observacoes && (
                          <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-4">
                            <p className="text-xs text-gray-500">
                              Observações
                            </p>
                            <p className="mt-1 break-words font-medium text-[#1d3557]">
                              {proximaConsulta.observacoes}
                            </p>
                          </div>
                        )}

                        {proximaConsulta.status_consulta === "Agendado" && (
                          <button
                            type="button"
                            disabled={
                              confirmandoConsulta ===
                              proximaConsulta.id_consulta
                            }
                            onClick={() =>
                              confirmarConsulta(proximaConsulta.id_consulta)
                            }
                            className="mt-6 w-full rounded-2xl bg-[#1d3557] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                          >
                            {confirmandoConsulta === proximaConsulta.id_consulta
                              ? "Confirmando..."
                              : "Confirmar presença"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-[#1d3557]/10 bg-[#fbfaf7] p-8 text-center">
                        <div className="mb-4 text-5xl">🌿</div>
                        <h3 className="text-xl font-bold text-[#1d3557] md:text-2xl">
                          Nenhuma consulta futura
                        </h3>
                        <p className="mt-2 text-gray-500">
                          Você pode solicitar uma consulta diretamente pelo
                          portal.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setAbaAtiva("consultas");
                            abrirAgendamento();
                          }}
                          className="mt-5 rounded-2xl bg-[#1d3557] px-5 py-3 font-semibold text-white transition hover:opacity-90"
                        >
                          Solicitar consulta
                        </button>
                      </div>
                    )}
                  </section>

                  <section className="rounded-[30px] border border-[#1d3557]/10 bg-white p-6 shadow-sm md:rounded-[34px] md:p-8">
                    <p className="mb-2 font-semibold text-[#2b4c7e]">
                      Mensagem para hoje
                    </p>

                    <h2 className="text-2xl font-serif leading-tight text-[#1d3557] md:text-3xl">
                      “{frase}”
                    </h2>

                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <CardInfo
                        titulo="Consultas futuras"
                        valor={consultasFuturas.length}
                        texto="Atendimentos pendentes ou confirmados"
                      />
                      <CardInfo
                        titulo="Histórico"
                        valor={historicoConsultas.length}
                        texto="Atendimentos anteriores ou encerrados"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setAbaAtiva("dados")}
                      className="mt-6 w-full rounded-2xl border border-[#1d3557]/15 px-5 py-3 font-semibold text-[#1d3557] transition hover:bg-[#fbfaf7]"
                    >
                      Consultar meus dados pessoais
                    </button>
                  </section>
                </div>
              </motion.section>
            )}

            {/* ABA CONSULTAS */}
            {abaAtiva === "consultas" && (
              <motion.section
                key="consultas"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[30px] border border-[#1d3557]/10 bg-white shadow-sm md:rounded-[34px]"
              >
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                  <div>
                    <p className="mb-1 font-semibold text-[#2b4c7e]">
                      Seus atendimentos
                    </p>
                    <h2 className="text-2xl font-bold text-[#1d3557] md:text-3xl">
                      Minhas consultas
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Consulte seus atendimentos ou solicite uma nova consulta.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-2xl bg-[#f3f1eb] px-4 py-2 text-sm font-semibold text-[#1d3557]">
                      {consultasFuturas.length} futura(s)
                    </span>
                    <span className="rounded-2xl bg-[#f3f1eb] px-4 py-2 text-sm font-semibold text-[#1d3557]">
                      {consultas.length} no total
                    </span>
                  </div>
                </div>

                {/* FORMULÁRIO DE AGENDAMENTO */}
                <section className="border-b border-gray-100 bg-[#f5f1eb] p-5 md:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#2b4c7e]">
                        Agendamento online
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-[#1d3557]">
                        Solicite sua consulta
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        60 minutos · R$ 180,00 · Pagamento presencial
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (mostrarAgendamento) {
                          setMostrarAgendamento(false);
                        } else {
                          abrirAgendamento();
                        }
                      }}
                      className="rounded-2xl bg-[#1d3557] px-5 py-3 font-semibold text-white transition hover:opacity-90"
                    >
                      {mostrarAgendamento
                        ? "Fechar formulário"
                        : "Solicitar agendamento"}
                    </button>
                  </div>

                  {mostrarAgendamento && (
                    <form
                      onSubmit={solicitarAgendamento}
                      className="mt-6 rounded-3xl border border-[#1d3557]/10 bg-white p-5 md:p-6"
                    >
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-[#1d3557]">
                            Psicólogo(a)
                          </span>

                          <select
                            required
                            value={psicologoSelecionado}
                            disabled={
                              carregandoPsicologos || enviandoAgendamento
                            }
                            onChange={(event) =>
                              carregarHorariosDisponiveis(
                                dataAgendamento,
                                event.target.value
                              )
                            }
                            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-black outline-none focus:border-[#1d3557] disabled:opacity-60"
                          >
                            <option value="">
                              {carregandoPsicologos
                                ? "Carregando psicólogos..."
                                : "Selecione o profissional"}
                            </option>

                            {psicologosAgendamento.map((psicologo) => (
                              <option
                                key={psicologo.id_psicologo}
                                value={psicologo.id_psicologo}
                              >
                                {psicologo.nome}
                                {psicologo.especialidade
                                  ? ` — ${psicologo.especialidade}`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-[#1d3557]">
                            Data da consulta
                          </span>

                          <input
                            type="date"
                            required
                            min={hojeTexto}
                            value={dataAgendamento}
                            disabled={enviandoAgendamento}
                            onChange={(event) =>
                              carregarHorariosDisponiveis(
                                event.target.value,
                                psicologoSelecionado
                              )
                            }
                            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-black outline-none focus:border-[#1d3557] disabled:opacity-60"
                          />

                          <span className="mt-2 block text-xs text-gray-500">
                            Segunda a sexta-feira, das 08h às 18h.
                          </span>
                        </label>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold text-[#1d3557]">
                          Horários disponíveis
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          Cada consulta dura uma hora. Os horários começam de
                          hora em hora, das 08h às 17h.
                        </p>

                        {carregandoHorarios ? (
                          <p className="mt-4 text-sm text-gray-500">
                            Consultando disponibilidade...
                          </p>
                        ) : !dataAgendamento || !psicologoSelecionado ? (
                          <p className="mt-4 text-sm text-gray-500">
                            Selecione o profissional e a data para consultar
                            as vagas.
                          </p>
                        ) : horariosDisponiveis.length === 0 ? (
                          <p className="mt-4 rounded-2xl bg-[#fbfaf7] p-4 text-sm text-gray-600">
                            Nenhum horário disponível nessa data. Experimente
                            outro dia útil.
                          </p>
                        ) : (
                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                            {horariosDisponiveis.map((horario) => (
                              <button
                                key={horario}
                                type="button"
                                disabled={enviandoAgendamento}
                                onClick={() => setHorarioSelecionado(horario)}
                                className={`rounded-2xl border px-4 py-3 font-semibold transition ${
                                  horarioSelecionado === horario
                                    ? "border-[#1d3557] bg-[#1d3557] text-white"
                                    : "border-[#1d3557]/15 bg-[#fbfaf7] text-[#1d3557] hover:border-[#1d3557]"
                                }`}
                              >
                                {horario}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 rounded-2xl border border-[#1d3557]/10 bg-[#fbfaf7] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-gray-600">
                            Valor da consulta
                          </span>
                          <span className="text-xl font-bold text-[#1d3557]">
                            R$ 180,00
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                          Sua solicitação ficará pendente até a confirmação da
                          clínica. O pagamento será presencial. Não há cobrança
                          nem pagamento online por este formulário.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={
                          enviandoAgendamento ||
                          carregandoHorarios ||
                          !horarioSelecionado
                        }
                        className="mt-5 w-full rounded-2xl bg-[#1d3557] px-6 py-4 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {enviandoAgendamento
                          ? "Enviando solicitação..."
                          : "Confirmar solicitação"}
                      </button>
                    </form>
                  )}
                </section>

                {/* LISTA DE CONSULTAS */}
                {consultas.length === 0 ? (
                  <div className="p-8 text-center md:p-12">
                    <div className="mb-4 text-5xl">📅</div>
                    <h3 className="text-xl font-bold text-[#1d3557]">
                      Você ainda não tem consultas
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-gray-500">
                      Quando você solicitar ou a clínica cadastrar um
                      atendimento, os detalhes aparecerão nesta área.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="border-b border-gray-100 bg-[#fbfaf7] p-5">
                      <h3 className="font-bold text-[#1d3557]">
                        Próximas consultas
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {consultasFuturas.length} atendimento(s) futuro(s)
                      </p>
                    </div>

                    {consultasFuturas.length === 0 ? (
                      <p className="p-6 text-sm text-gray-500">
                        Não há consultas futuras no momento.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-6">
                        {consultasFuturas.map((consulta) => (
                          <article
                            key={consulta.id_consulta}
                            className="rounded-3xl border border-[#1d3557]/10 bg-[#fbfaf7] p-5"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Data e horário
                                </p>
                                <h3 className="mt-1 text-xl font-bold text-[#1d3557]">
                                  {formatarData(consulta.data_consulta)}
                                </h3>
                                <p className="mt-1 font-semibold text-[#2b4c7e]">
                                  às {formatarHora(consulta.horario)}
                                </p>
                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${corStatus(
                                  consulta.status_consulta
                                )}`}
                              >
                                {consulta.status_consulta}
                              </span>
                            </div>

                            <div className="mt-5 space-y-3">
                              <Info
                                label="Psicólogo(a)"
                                valor={consulta.psicologo || "-"}
                              />
                              <Info
                                label="Tipo"
                                valor={consulta.tipo_atendimento || "-"}
                              />
                              {consulta.observacoes && (
                                <Info
                                  label="Observações"
                                  valor={consulta.observacoes}
                                />
                              )}
                            </div>

                            {consulta.status_consulta === "Agendado" && (
                              <button
                                type="button"
                                disabled={
                                  confirmandoConsulta === consulta.id_consulta
                                }
                                onClick={() =>
                                  confirmarConsulta(consulta.id_consulta)
                                }
                                className="mt-5 w-full rounded-2xl bg-[#1d3557] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                              >
                                {confirmandoConsulta === consulta.id_consulta
                                  ? "Confirmando..."
                                  : "Confirmar presença"}
                              </button>
                            )}
                          </article>
                        ))}
                      </div>
                    )}

                    <div className="border-y border-gray-100 bg-[#fbfaf7] p-5">
                      <h3 className="font-bold text-[#1d3557]">
                        Histórico de consultas
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {historicoConsultas.length} atendimento(s) no histórico
                      </p>
                    </div>

                    {historicoConsultas.length === 0 ? (
                      <p className="p-6 text-sm text-gray-500">
                        Seu histórico aparecerá aqui após os atendimentos
                        serem concluídos ou encerrados.
                      </p>
                    ) : (
                      <div className="space-y-3 p-4 md:p-6">
                        {historicoConsultas.map((consulta) => (
                          <article
                            key={consulta.id_consulta}
                            className="rounded-2xl border border-gray-100 p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-[#1d3557]">
                                  {formatarData(consulta.data_consulta)} às{" "}
                                  {formatarHora(consulta.horario)}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  {consulta.psicologo || "-"} ·{" "}
                                  {consulta.tipo_atendimento || "-"}
                                </p>
                              </div>
                              <span
                                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${corStatus(
                                  consulta.status_consulta
                                )}`}
                              >
                                {consulta.status_consulta}
                              </span>
                            </div>

                            {consulta.observacoes && (
                              <p className="mt-3 break-words text-sm text-gray-500">
                                {consulta.observacoes}
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.section>
            )}

            {/* ABA MEUS DADOS */}
            {abaAtiva === "dados" && (
              <motion.section
                key="dados"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[30px] border border-[#1d3557]/10 bg-white p-6 shadow-sm md:rounded-[34px] md:p-8"
              >
                <p className="mb-2 font-semibold text-[#2b4c7e]">
                  Meu perfil
                </p>
                <h2 className="text-2xl font-bold text-[#1d3557] md:text-3xl">
                  Meus dados pessoais
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Confira as informações cadastradas em seu perfil. Se algum
                  dado precisar de correção, solicite a atualização à clínica.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CampoDado
                    titulo="Nome completo"
                    valor={paciente?.nome_completo}
                  />
                  <CampoDado titulo="CPF" valor={paciente?.cpf} />
                  <CampoDado titulo="Telefone" valor={paciente?.telefone} />
                  <CampoDado titulo="E-mail" valor={paciente?.email} />
                  <CampoDado titulo="Profissão" valor={paciente?.profissao} />
                  <CampoDado
                    titulo="Data de nascimento"
                    valor={formatarData(paciente?.data_nascimento)}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-[#1d3557]/10 bg-[#fbfaf7] p-4">
                  <p className="font-semibold text-[#1d3557]">
                    Precisa corrigir algum dado?
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    Entre em contato com a clínica para solicitar uma
                    atualização segura do seu cadastro.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAbaAtiva("seguranca")}
                  className="mt-6 rounded-2xl bg-[#1d3557] px-5 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  Ir para Segurança
                </button>
              </motion.section>
            )}

            {/* ABA SEGURANÇA */}
            {abaAtiva === "seguranca" && (
              <motion.section
                key="seguranca"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[30px] border border-[#1d3557]/10 bg-white p-6 shadow-sm md:rounded-[34px] md:p-8"
              >
                <p className="mb-2 font-semibold text-[#2b4c7e]">
                  Proteção da conta
                </p>
                <h2 className="text-2xl font-bold text-[#1d3557] md:text-3xl">
                  Segurança e senha
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Use uma senha forte e não a compartilhe com outras pessoas.
                </p>

                <div className="mt-6 max-w-3xl rounded-3xl border border-[#1d3557]/10 bg-[#fbfaf7] p-5 md:p-6">
                  {!mostrarSenha ? (
                    <div>
                      <h3 className="text-lg font-bold text-[#1d3557]">
                        Alterar minha senha
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        Para continuar, você precisará informar sua senha atual
                        e confirmar a nova senha.
                      </p>
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(true)}
                        className="mt-5 w-full rounded-2xl bg-[#1d3557] px-5 py-3 font-semibold text-white transition hover:opacity-90 sm:w-auto"
                      >
                        Alterar senha
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        alterarSenha();
                      }}
                    >
                      <h3 className="text-lg font-bold text-[#1d3557]">
                        Defina sua nova senha
                      </h3>

                      <div className="mt-5 grid grid-cols-1 gap-4">
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-[#1d3557]">
                            Senha atual
                          </span>
                          <input
                            type="password"
                            autoComplete="current-password"
                            required
                            value={senhaAtual}
                            onChange={(event) =>
                              setSenhaAtual(event.target.value)
                            }
                            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-black outline-none transition focus:border-[#1d3557]"
                            placeholder="Digite sua senha atual"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-[#1d3557]">
                            Nova senha
                          </span>
                          <input
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                            value={novaSenha}
                            onChange={(event) =>
                              setNovaSenha(event.target.value)
                            }
                            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-black outline-none transition focus:border-[#1d3557]"
                            placeholder="Mínimo de 8 caracteres"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-[#1d3557]">
                            Confirmar nova senha
                          </span>
                          <input
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                            value={confirmarSenha}
                            onChange={(event) =>
                              setConfirmarSenha(event.target.value)
                            }
                            className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-black outline-none transition focus:border-[#1d3557]"
                            placeholder="Digite a nova senha novamente"
                          />
                        </label>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="submit"
                          disabled={salvandoSenha}
                          className="rounded-2xl bg-[#1d3557] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {salvandoSenha
                            ? "Salvando..."
                            : "Salvar nova senha"}
                        </button>

                        <button
                          type="button"
                          disabled={salvandoSenha}
                          onClick={() => {
                            setMostrarSenha(false);
                            setSenhaAtual("");
                            setNovaSenha("");
                            setConfirmarSenha("");
                          }}
                          className="rounded-2xl border border-gray-200 px-6 py-3 font-semibold text-[#1d3557] transition hover:bg-white disabled:opacity-60"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="font-semibold text-[#1d3557]">
                    Dica de segurança
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    Evite usar senhas repetidas em outros sites. Nunca informe
                    sua senha por mensagem ou a pessoas que entrarem em contato
                    dizendo ser da clínica.
                  </p>
                </div>
              </motion.section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Info({ label, valor }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="break-words text-right font-medium text-[#1d3557]">
        {valor || "-"}
      </span>
    </div>
  );
}

function MiniInfo({ titulo, valor }) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4">
      <p className="text-xs text-gray-500">{titulo}</p>
      <p className="mt-1 break-words font-semibold text-[#1d3557]">
        {valor || "-"}
      </p>
    </div>
  );
}

function CardInfo({ titulo, valor, texto }) {
  return (
    <div className="min-w-0 rounded-3xl border border-[#1d3557]/10 bg-[#fbfaf7] p-5">
      <p className="text-sm text-gray-500">{titulo}</p>
      <h3 className="mt-2 text-3xl font-bold text-[#1d3557] md:text-4xl">
        {valor}
      </h3>
      <p className="mt-1 text-xs text-gray-500">{texto}</p>
    </div>
  );
}

function CampoDado({ titulo, valor }) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-100 bg-[#fbfaf7] p-4">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="mt-1 break-words font-semibold text-[#1d3557]">
        {valor || "-"}
      </p>
    </div>
  );
}
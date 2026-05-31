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

export default function Cliente() {
  const router = useRouter();

  const [frase, setFrase] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [idPaciente, setIdPaciente] = useState(null);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    const logado = localStorage.getItem("logado");
    const tipoUsuario = localStorage.getItem("tipo_usuario");
    const pacienteId = localStorage.getItem("id_paciente");

    if (logado !== "true" || tipoUsuario !== "paciente") {
      router.push("/login");
      return;
    }

    setIdPaciente(pacienteId);
    setFrase(frases[Math.floor(Math.random() * frases.length)]);
    carregarDadosPaciente(pacienteId);
  }, [router]);

  async function carregarDadosPaciente(pacienteId) {
    const resposta = await fetch(`/api/cliente?id_paciente=${pacienteId}`);
    const resultado = await resposta.json();

    if (resultado.erro) {
      console.log(resultado.erro);
      return;
    }

    setPaciente(resultado.paciente);
    setConsultas(resultado.consultas || []);
  }

  async function confirmarConsulta(idConsulta) {
    try {
      const resposta = await fetch("/api/cliente", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "confirmar_consulta",
          id_consulta: idConsulta,
          status_consulta: "Confirmado",
        }),
      });

      const resultado = await resposta.json();

      if (resultado.erro) {
        toast.error(resultado.erro);
        return;
      }

      toast.success("Consulta confirmada com sucesso!");
      carregarDadosPaciente(idPaciente);
    } catch (error) {
      toast.error("Erro ao confirmar consulta.");
    }
  }

  async function alterarSenha() {
    try {
      const resposta = await fetch("/api/cliente", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "alterar_senha",
          id_paciente: idPaciente,
          senha_atual: senhaAtual,
          nova_senha: novaSenha,
          confirmar_senha: confirmarSenha,
        }),
      });

      const resultado = await resposta.json();

      if (resultado.erro) {
        toast.error(resultado.erro);
        return;
      }

      toast.success("Senha alterada com sucesso!");

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setMostrarSenha(false);
    } catch (error) {
      toast.error("Erro ao alterar senha.");
    }
  }

  function sair() {
    localStorage.removeItem("logado");
    localStorage.removeItem("tipo_usuario");
    localStorage.removeItem("id_paciente");
    router.push("/login");
  }

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

  const hoje = new Date();

  const consultasFuturas = consultas
    .filter((consulta) => {
      const dataConsulta = new Date(consulta.data_consulta);
      return dataConsulta >= new Date(hoje.toDateString());
    })
    .sort((a, b) => {
      const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
      const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;
      return dataA.localeCompare(dataB);
    });

  const historicoConsultas = consultas
    .filter((consulta) => {
      const dataConsulta = new Date(consulta.data_consulta);
      return dataConsulta < new Date(hoje.toDateString());
    })
    .sort((a, b) => {
      const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
      const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;
      return dataB.localeCompare(dataA);
    });

  const proximaConsulta = consultasFuturas[0];

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[40px] bg-[#1d3557] text-white p-7 md:p-12 shadow-xl mb-8"
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-blue-100 font-semibold mb-3">
                Portal Premium do Paciente
              </p>

              <h1 className="text-3xl md:text-6xl font-bold tracking-tight">
                Olá, {paciente?.nome_completo || "paciente"}
              </h1>

              <p className="text-blue-100 mt-4 max-w-2xl leading-relaxed">
                Acompanhe suas consultas, confirme sua presença e veja suas
                informações cadastradas em um ambiente reservado e seguro.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-5 min-w-[240px]">
              <p className="text-blue-100 text-sm">Acesso ativo</p>
              <h2 className="text-2xl font-bold mt-1">Área reservada</h2>

              <button
                onClick={sair}
                className="mt-5 w-full bg-white text-[#1d3557] py-3 rounded-2xl font-semibold hover:bg-[#f3f1eb] transition"
              >
                Sair
              </button>
            </div>
          </div>

          <div className="absolute right-8 bottom-0 text-[220px] opacity-[0.06] select-none">
            Ψ
          </div>

          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute right-40 bottom-10 w-24 h-24 bg-white/10 rounded-full" />
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 mb-8">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[34px] p-6 md:p-8 border border-[#1d3557]/10 shadow-sm"
          >
            <p className="text-[#2b4c7e] font-semibold mb-2">
              Próximo atendimento
            </p>

            <h2 className="text-3xl font-bold text-[#1d3557] mb-6">
              Sua próxima consulta
            </h2>

            {proximaConsulta ? (
              <div className="bg-[#fbfaf7] rounded-3xl p-6 border border-[#1d3557]/10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">
                      Data e horário
                    </p>

                    <h3 className="text-3xl md:text-4xl font-bold text-[#1d3557]">
                      {formatarData(proximaConsulta.data_consulta)}
                    </h3>

                    <p className="text-xl font-semibold text-[#2b4c7e] mt-1">
                      às {formatarHora(proximaConsulta.horario)}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${corStatus(
                      proximaConsulta.status_consulta
                    )}`}
                  >
                    {proximaConsulta.status_consulta}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                  <MiniInfo
                    titulo="Psicólogo(a)"
                    valor={proximaConsulta.psicologo || "-"}
                  />

                  <MiniInfo
                    titulo="Atendimento"
                    valor={proximaConsulta.tipo_atendimento || "-"}
                  />

                  <MiniInfo
                    titulo="Observações"
                    valor={proximaConsulta.observacoes || "-"}
                  />
                </div>

                {proximaConsulta.status_consulta === "Agendado" && (
                  <button
                    onClick={() =>
                      confirmarConsulta(proximaConsulta.id_consulta)
                    }
                    className="mt-6 bg-[#1d3557] text-white px-6 py-3 rounded-2xl font-semibold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition"
                  >
                    Confirmar presença
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#fbfaf7] rounded-3xl p-8 text-center border border-[#1d3557]/10">
                <div className="text-5xl mb-4">🌿</div>

                <h3 className="text-2xl font-bold text-[#1d3557]">
                  Nenhuma consulta futura
                </h3>

                <p className="text-gray-500 mt-2">
                  Quando uma nova consulta for agendada, ela aparecerá aqui.
                </p>
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[34px] p-6 md:p-8 border border-[#1d3557]/10 shadow-sm"
          >
            <p className="text-[#2b4c7e] font-semibold mb-2">
              Mensagem para hoje
            </p>

            <h2 className="text-2xl md:text-3xl font-serif text-[#1d3557] leading-tight">
              “{frase}”
            </h2>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardInfo
                titulo="Consultas futuras"
                valor={consultasFuturas.length}
                texto="Atendimentos agendados"
              />

              <CardInfo
                titulo="Histórico"
                valor={historicoConsultas.length}
                texto="Consultas anteriores"
              />
            </div>
          </motion.section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 mb-8">
          <section className="bg-white rounded-[34px] p-6 border border-[#1d3557]/10 shadow-sm h-fit">
            <p className="text-[#2b4c7e] font-semibold mb-2">Meus dados</p>

            <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
              Informações cadastradas
            </h2>

            <div className="space-y-3">
              <Info label="Nome" valor={paciente?.nome_completo || "-"} />
              <Info label="CPF" valor={paciente?.cpf || "-"} />
              <Info label="Telefone" valor={paciente?.telefone || "-"} />
              <Info label="Profissão" valor={paciente?.profissao || "-"} />
            </div>

            <button
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="mt-6 w-full bg-[#1d3557] text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition"
            >
              {mostrarSenha ? "Cancelar alteração" : "Alterar senha"}
            </button>
          </section>

          <section className="bg-white rounded-[34px] p-6 border border-[#1d3557]/10 shadow-sm">
            <p className="text-[#2b4c7e] font-semibold mb-2">
              Segurança da conta
            </p>

            <h2 className="text-2xl font-bold text-[#1d3557] mb-5">
              Alteração de senha
            </h2>

            {mostrarSenha ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="password"
                    placeholder="Senha atual"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  />

                  <input
                    type="password"
                    placeholder="Nova senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  />

                  <input
                    type="password"
                    placeholder="Confirmar nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="border border-gray-200 p-4 rounded-2xl text-black bg-[#fbfaf7] outline-none focus:border-[#1d3557]"
                  />
                </div>

                <button
                  onClick={alterarSenha}
                  className="mt-5 bg-[#1d3557] text-white px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition"
                >
                  Salvar nova senha
                </button>
              </motion.div>
            ) : (
              <div className="bg-[#fbfaf7] rounded-3xl p-6 border border-[#1d3557]/10">
                <p className="text-gray-500 leading-relaxed">
                  Para manter sua conta segura, você pode alterar sua senha a
                  qualquer momento. Clique em “Alterar senha” para abrir o
                  formulário.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className="bg-white rounded-[34px] border border-[#1d3557]/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1d3557]">
                Minhas consultas
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Veja seus atendimentos agendados e seu histórico.
              </p>
            </div>

            <div className="bg-[#f3f1eb] text-[#1d3557] px-4 py-2 rounded-2xl text-sm font-semibold">
              {consultas.length} consulta(s)
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-[#f3f1eb] text-[#1d3557]">
                <tr>
                  <th className="text-left p-4">Data</th>
                  <th className="text-left p-4">Hora</th>
                  <th className="text-left p-4">Psicólogo</th>
                  <th className="text-left p-4">Tipo</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Observações</th>
                  <th className="text-left p-4">Ação</th>
                </tr>
              </thead>

              <tbody className="text-black">
                {consultas.map((consulta) => (
                  <tr
                    key={consulta.id_consulta}
                    className="border-b border-gray-100 hover:bg-[#fbfaf7]"
                  >
                    <td className="p-4">
                      {formatarData(consulta.data_consulta)}
                    </td>

                    <td className="p-4">{formatarHora(consulta.horario)}</td>

                    <td className="p-4">{consulta.psicologo || "-"}</td>

                    <td className="p-4">{consulta.tipo_atendimento || "-"}</td>

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
                      {consulta.status_consulta === "Agendado" ? (
                        <button
                          onClick={() =>
                            confirmarConsulta(consulta.id_consulta)
                          }
                          className="bg-[#1d3557] text-white px-4 py-2 rounded-xl text-sm hover:opacity-90 transition"
                        >
                          Confirmar
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}

                {consultas.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      Nenhuma consulta encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden p-4 space-y-4">
            {consultas.map((consulta) => (
              <motion.div
                key={consulta.id_consulta}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#fbfaf7] rounded-3xl p-5 border border-[#1d3557]/10 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Consulta</p>

                    <h3 className="text-xl font-bold text-[#1d3557] mt-1">
                      {formatarData(consulta.data_consulta)} às{" "}
                      {formatarHora(consulta.horario)}
                    </h3>
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

                {consulta.status_consulta === "Agendado" && (
                  <button
                    onClick={() => confirmarConsulta(consulta.id_consulta)}
                    className="mt-5 w-full bg-[#1d3557] text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition"
                  >
                    Confirmar presença
                  </button>
                )}
              </motion.div>
            ))}

            {consultas.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nenhuma consulta encontrada.
              </div>
            )}
          </div>
        </section>
      </main>
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

function MiniInfo({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <p className="text-xs text-gray-500">{titulo}</p>
      <p className="text-[#1d3557] font-semibold mt-1">{valor}</p>
    </div>
  );
}

function CardInfo({ titulo, valor, texto }) {
  return (
    <div className="bg-[#fbfaf7] rounded-3xl p-5 border border-[#1d3557]/10">
      <p className="text-gray-500 text-sm">{titulo}</p>
      <h3 className="text-4xl font-bold text-[#1d3557] mt-2">{valor}</h3>
      <p className="text-gray-400 text-xs mt-1">{texto}</p>
    </div>
  );
}
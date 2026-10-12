
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Search,
  Plus,
  Pencil,
  X,
  RefreshCw,
  Clock,
  UserRound,
} from "lucide-react";

const FORMULARIO_INICIAL = {
  id_consulta: "",
  id_paciente: "",
  data_consulta: "",
  horario: "",
  tipo_atendimento: "Presencial",
  status_consulta: "Agendada",
  observacoes: "",
};

const STATUS_TERMINAIS = [
  "Cancelado",
  "Realizado",
  "Faltou",
];

function normalizarStatus(status) {
  const valor = String(status || "").trim().toLowerCase();

  const equivalencias = {
    agendada: "Agendada",
    agendado: "Agendada",
    confirmado: "Confirmado",
    confirmada: "Confirmado",
    realizada: "Realizado",
    realizado: "Realizado",
    cancelada: "Cancelado",
    cancelado: "Cancelado",
    faltou: "Faltou",
  };

  return equivalencias[valor] || status || "Agendada";
}

function dataParaTela(valor) {
  if (!valor) return "—";

  const texto = String(valor).slice(0, 10);
  const partes = texto.split("-");

  if (partes.length !== 3) return texto;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function consultaPodeSerCancelada(status) {
  return !STATUS_TERMINAIS.includes(normalizarStatus(status));
}

async function lerResposta(resposta) {
  return resposta.json().catch(() => ({}));
}

function mensagemDaResposta(resultado, padrao) {
  return (
    resultado?.erro ||
    resultado?.error ||
    resultado?.mensagem ||
    resultado?.message ||
    padrao
  );
}

export default function ConsultasPsicologoPage() {
  const router = useRouter();

  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [cancelandoId, setCancelandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [idPsicologo, setIdPsicologo] = useState(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const respostaSessao = await fetch("/api/sessao", {
        cache: "no-store",
        credentials: "include",
      });

      if (!respostaSessao.ok) {
        router.replace("/login");
        return;
      }

      const sessao = await lerResposta(respostaSessao);

      if (
        sessao.autenticado === false ||
        sessao.tipo_usuario !== "psicologo"
      ) {
        router.replace("/login");
        return;
      }

      const identificador =
        sessao.id_psicologo ??
        sessao.usuario?.id_psicologo ??
        sessao.id_usuario;

      if (!identificador) {
        setErro(
          "Não foi possível identificar o psicólogo da sessão. Verifique os dados retornados pelo login."
        );
        return;
      }

      setIdPsicologo(identificador);

      const [respostaConsultas, respostaPacientes] =
        await Promise.all([
          fetch("/api/consultas", {
            cache: "no-store",
            credentials: "include",
          }),
          fetch("/api/pacientes/agendamento", {
            cache: "no-store",
            credentials: "include",
          }),
        ]);

      const [dadosConsultas, dadosPacientes] = await Promise.all([
        lerResposta(respostaConsultas),
        lerResposta(respostaPacientes),
      ]);

      if (!respostaConsultas.ok) {
        throw new Error(
          mensagemDaResposta(
            dadosConsultas,
            "Não foi possível carregar as consultas."
          )
        );
      }

      if (!respostaPacientes.ok) {
        throw new Error(
          mensagemDaResposta(
            dadosPacientes,
            "Não foi possível carregar os pacientes."
          )
        );
      }

      setConsultas(
        Array.isArray(dadosConsultas) ? dadosConsultas : []
      );

      setPacientes(
        Array.isArray(dadosPacientes) ? dadosPacientes : []
      );
    } catch (error) {
      setErro(error.message || "Erro ao carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function abrirNovaConsulta() {
    setMensagem("");
    setErro("");
    setFormulario({ ...FORMULARIO_INICIAL });
    setModalAberto(true);
  }

  function abrirEdicao(consulta) {
    setMensagem("");
    setErro("");

    setFormulario({
      id_consulta: String(consulta.id_consulta),
      id_paciente: String(consulta.id_paciente ?? ""),
      data_consulta: String(consulta.data_consulta ?? "").slice(0, 10),
      horario: String(consulta.horario ?? "").slice(0, 5),
      tipo_atendimento: consulta.tipo_atendimento || "Presencial",
      status_consulta: normalizarStatus(consulta.status_consulta),
      observacoes: consulta.observacoes || "",
    });

    setModalAberto(true);
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setErro("");
  }

  async function salvarConsulta(evento) {
    evento.preventDefault();

    if (salvando) return;

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      if (!idPsicologo) {
        throw new Error("Não foi possível identificar o psicólogo.");
      }

      if (!formulario.id_paciente) {
        throw new Error("Selecione um paciente.");
      }

      if (!formulario.data_consulta || !formulario.horario) {
        throw new Error("Informe a data e o horário da consulta.");
      }

      const editando = Boolean(formulario.id_consulta);

      const resposta = await fetch("/api/consultas", {
        method: editando ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editando
            ? { id_consulta: Number(formulario.id_consulta) }
            : {}),
          id_paciente: Number(formulario.id_paciente),
          id_psicologo: Number(idPsicologo),
          data_consulta: formulario.data_consulta,
          horario: formulario.horario,
          tipo_atendimento: formulario.tipo_atendimento,
          status_consulta: formulario.status_consulta,
          observacoes: formulario.observacoes,
        }),
      });

      const resultado = await lerResposta(resposta);

      if (!resposta.ok) {
        if (resposta.status === 409) {
          throw new Error(
            mensagemDaResposta(
              resultado,
              "Existe um conflito de horário. Escolha outro horário."
            )
          );
        }

        throw new Error(
          mensagemDaResposta(
            resultado,
            "Não foi possível salvar a consulta."
          )
        );
      }

      setModalAberto(false);
      setMensagem(
        editando
          ? "Consulta atualizada com sucesso."
          : "Consulta agendada com sucesso."
      );

      await carregarDados();
    } catch (error) {
      setErro(error.message || "Erro ao salvar a consulta.");
    } finally {
      setSalvando(false);
    }
  }

  async function cancelarConsulta(consulta) {
    const statusAtual = normalizarStatus(consulta.status_consulta);

    if (!consultaPodeSerCancelada(statusAtual)) {
      setErro(
        "Esta consulta já foi cancelada, realizada ou está marcada como falta."
      );
      setMensagem("");
      return;
    }

    const confirmar = window.confirm(
      `Deseja cancelar a consulta de ${
        consulta.nome_paciente || "este paciente"
      }, marcada para ${dataParaTela(
        consulta.data_consulta
      )} às ${String(consulta.horario || "").slice(0, 5)}? O registro e os pagamentos serão preservados.`
    );

    if (!confirmar) return;

    setErro("");
    setMensagem("");
    setCancelandoId(consulta.id_consulta);

    try {
      const resposta = await fetch(
        `/api/consultas?id=${encodeURIComponent(consulta.id_consulta)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const resultado = await lerResposta(resposta);

      if (!resposta.ok) {
        throw new Error(
          mensagemDaResposta(
            resultado,
            "Não foi possível cancelar a consulta."
          )
        );
      }

      setMensagem(
        resultado.mensagem ||
          resultado.message ||
          "Consulta cancelada com sucesso. O histórico e os pagamentos foram preservados."
      );

      await carregarDados();
    } catch (error) {
      setErro(error.message || "Erro ao cancelar a consulta.");
    } finally {
      setCancelandoId(null);
    }
  }

  const consultasFiltradas = consultas.filter((consulta) => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return true;

    return [
      consulta.nome_paciente,
      consulta.data_consulta,
      consulta.status_consulta,
      consulta.tipo_atendimento,
      consulta.horario,
    ].some((valor) =>
      String(valor ?? "").toLowerCase().includes(termo)
    );
  });

  return (
    <main className="min-h-screen bg-[#fbfaf7] p-4 text-[#1d3557] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/psicologo"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#1d3557] hover:underline"
        >
          <ArrowLeft size={18} />
          Voltar ao painel
        </Link>

        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={18} />
              Área do psicólogo
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Minhas consultas
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Consulte sua agenda e gerencie seus atendimentos.
              Cada consulta tem duração padrão de 60 minutos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={carregarDados}
              disabled={carregando}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={carregando ? "animate-spin" : ""}
              />
              Atualizar
            </button>

            <button
              type="button"
              onClick={abrirNovaConsulta}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d3557] px-4 py-3 text-sm font-semibold text-white hover:bg-[#29496f]"
            >
              <Plus size={18} />
              Agendar consulta
            </button>
          </div>
        </header>

        {mensagem && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {mensagem}
          </div>
        )}

        {erro && !modalAberto && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {erro}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3">
                <CalendarDays size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  Consultas carregadas
                </p>
                <p className="text-2xl font-bold">
                  {carregando ? "…" : consultas.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3">
                <UserRound size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  Pacientes disponíveis
                </p>
                <p className="text-2xl font-bold">
                  {carregando ? "…" : pacientes.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <label className="flex max-w-lg items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
              <Search size={19} className="shrink-0 text-slate-400" />
              <input
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Pesquisar paciente, data ou status..."
                aria-label="Pesquisar consultas"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>

          {carregando ? (
            <div className="p-10 text-center text-slate-500">
              Carregando consultas...
            </div>
          ) : consultasFiltradas.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarDays
                size={36}
                className="mx-auto mb-3 text-slate-300"
              />
              <p className="font-semibold">Nenhuma consulta encontrada</p>
              <p className="mt-1 text-sm text-slate-500">
                Tente outra pesquisa ou agende uma consulta.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Paciente</th>
                    <th className="px-5 py-4 font-semibold">Data</th>
                    <th className="px-5 py-4 font-semibold">Horário</th>
                    <th className="px-5 py-4 font-semibold">Tipo</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {consultasFiltradas.map((consulta) => {
                    const status = normalizarStatus(
                      consulta.status_consulta
                    );

                    const podeCancelar = consultaPodeSerCancelada(status);
                    const operacaoEmAndamento =
                      cancelandoId === consulta.id_consulta;

                    return (
                      <tr
                        key={consulta.id_consulta}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-medium">
                          {consulta.nome_paciente || "Paciente"}
                        </td>

                        <td className="px-5 py-4">
                          {dataParaTela(consulta.data_consulta)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={15} />
                            {String(consulta.horario || "—").slice(0, 5)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {consulta.tipo_atendimento || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              status === "Cancelado"
                                ? "bg-red-50 text-red-700"
                                : status === "Realizado"
                                  ? "bg-green-50 text-green-700"
                                  : status === "Faltou"
                                    ? "bg-amber-50 text-amber-800"
                                    : status === "Confirmado"
                                      ? "bg-indigo-50 text-indigo-700"
                                      : "bg-blue-50 text-blue-800"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => abrirEdicao(consulta)}
                              disabled={salvando || cancelandoId !== null}
                              title="Editar consulta"
                              aria-label="Editar consulta"
                              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => cancelarConsulta(consulta)}
                              title={
                                podeCancelar
                                  ? "Cancelar consulta"
                                  : "Consulta encerrada"
                              }
                              aria-label="Cancelar consulta"
                              disabled={
                                !podeCancelar ||
                                operacaoEmAndamento ||
                                salvando
                              }
                              className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {operacaoEmAndamento ? (
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <X size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario"
            className="my-auto max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-7"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 id="titulo-formulario" className="text-xl font-bold">
                  {formulario.id_consulta
                    ? "Editar consulta"
                    : "Agendar consulta"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preencha os dados do atendimento. Duração padrão: 60 minutos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!salvando) {
                    setModalAberto(false);
                    setErro("");
                  }
                }}
                disabled={salvando}
                aria-label="Fechar formulário"
                className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={salvarConsulta} className="space-y-5">
              <div>
                <label
                  htmlFor="id_paciente"
                  className="mb-2 block text-sm font-semibold"
                >
                  Paciente *
                </label>

                <select
                  id="id_paciente"
                  name="id_paciente"
                  value={formulario.id_paciente}
                  onChange={atualizarCampo}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                >
                  <option value="">Selecione um paciente</option>

                  {pacientes.map((paciente) => (
                    <option
                      key={paciente.id_paciente}
                      value={paciente.id_paciente}
                    >
                      {paciente.nome_completo}
                    </option>
                  ))}
                </select>

                {pacientes.length === 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    Nenhum paciente disponível. Verifique o acesso à API de pacientes.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="data_consulta"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Data *
                  </label>

                  <input
                    id="data_consulta"
                    name="data_consulta"
                    type="date"
                    value={formulario.data_consulta}
                    onChange={atualizarCampo}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="horario"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Horário de início *
                  </label>

                  <input
                    id="horario"
                    name="horario"
                    type="time"
                    value={formulario.horario}
                    onChange={atualizarCampo}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="tipo_atendimento"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Tipo de atendimento
                  </label>

                  <select
                    id="tipo_atendimento"
                    name="tipo_atendimento"
                    value={formulario.tipo_atendimento}
                    onChange={atualizarCampo}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Online">Online</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status_consulta"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Status
                  </label>

                  <select
                    id="status_consulta"
                    name="status_consulta"
                    value={formulario.status_consulta}
                    onChange={atualizarCampo}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                  >
                    <option value="Agendada">Agendada</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Realizado">Realizado</option>
                    <option value="Cancelado">Cancelado</option>
                    <option value="Faltou">Faltou</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="observacoes"
                  className="mb-2 block text-sm font-semibold"
                >
                  Observações
                </label>

                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formulario.observacoes}
                  onChange={atualizarCampo}
                  rows={3}
                  maxLength={2000}
                  placeholder="Observações administrativas sobre o atendimento..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                />
              </div>

              {erro && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {erro}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!salvando) {
                      setModalAberto(false);
                      setErro("");
                    }
                  }}
                  disabled={salvando}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={salvando || pacientes.length === 0}
                  className="rounded-xl bg-[#1d3557] px-5 py-3 text-sm font-semibold text-white hover:bg-[#29496f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {salvando
                    ? "Salvando..."
                    : formulario.id_consulta
                      ? "Salvar alterações"
                      : "Agendar consulta"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
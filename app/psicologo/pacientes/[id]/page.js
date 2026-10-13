"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  ClipboardList,
  CalendarDays,
  FileText,
  Save,
  RefreshCw,
  LockKeyhole,
} from "lucide-react";

const CAMPOS_ANAMNESE = [
  ["motivo_consulta", "Motivo da consulta"],
  ["tempo_problema", "Há quanto tempo ocorre"],
  ["fez_terapia", "Já fez terapia"],
  ["tempo_terapia", "Tempo de terapia anterior"],
  ["doencas_fisicas", "Doenças físicas"],
  ["uso_medicamentos", "Uso de medicamentos"],
  ["historico_psiquiatrico", "Histórico psiquiátrico"],
  ["medicacao_controlada", "Medicação controlada"],
  ["doencas_mentais_familia", "Histórico familiar"],
  ["relacao_familiar", "Relação familiar"],
  ["sono", "Sono"],
  ["alimentacao", "Alimentação"],
  ["uso_alcool_drogas", "Uso de álcool ou drogas"],
  ["atividade_fisica", "Atividade física"],
  ["ansiedade", "Ansiedade"],
  ["humor", "Humor"],
  ["estresse", "Estresse"],
  ["pensamentos_recorrentes", "Pensamentos recorrentes"],
  ["objetivo_terapia", "Objetivo da terapia"],
  ["observacoes_psicologo", "Observações do psicólogo"],
];

const CAMPOS_CURTOS = ["tempo_problema", "tempo_terapia", "ansiedade"];
const CAMPOS_GRANDES = [
  "motivo_consulta",
  "objetivo_terapia",
  "observacoes_psicologo",
];

const ANAMNESE_VAZIA = Object.fromEntries(
  CAMPOS_ANAMNESE.map(([campo]) => [campo, ""])
);

const EVOLUCAO_VAZIA = {
  id_consulta: "",
  relato_sessao: "",
  observacoes_clinicas: "",
  plano_proxima_sessao: "",
};

function formatarData(valor) {
  if (!valor) return "Não informada";

  const texto = String(valor).slice(0, 10);
  const partes = texto.split("-");

  if (partes.length !== 3) return texto;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarDataHora(valor) {
  if (!valor) return "Não informada";

  return new Date(valor).toLocaleString("pt-BR");
}

function formatarValor(valor) {
  if (valor === true) return "Sim";
  if (valor === false) return "Não";
  if (valor === null || valor === undefined || valor === "") {
    return "Não informado";
  }

  return String(valor);
}

function normalizarStatus(valor) {
  return String(valor || "").trim().toLowerCase();
}

async function lerResposta(resposta) {
  return resposta.json().catch(() => ({}));
}

export default function FichaPacientePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [ficha, setFicha] = useState(null);
  const [secao, setSecao] = useState("dados");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvandoAnamnese, setSalvandoAnamnese] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [formAnamnese, setFormAnamnese] = useState(ANAMNESE_VAZIA);
  const [formulario, setFormulario] = useState(EVOLUCAO_VAZIA);

  const paciente = ficha?.paciente;
  const consultas = ficha?.consultas || [];
  const prontuarios = ficha?.prontuarios || [];
  const anamneses = ficha?.anamneses || [];

  const carregarFicha = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(
        `/api/pacientes/${encodeURIComponent(id)}/ficha`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const dados = await lerResposta(resposta);

      if (resposta.status === 401 || resposta.status === 403) {
        router.replace("/login");
        return;
      }

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível carregar a ficha do paciente."
        );
      }

      setFicha(dados);
    } catch (error) {
      setErro(error.message || "Erro ao carregar a ficha.");
    } finally {
      setCarregando(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) carregarFicha();
  }, [id, carregarFicha]);

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function atualizarCampoAnamnese(evento) {
    const { name, value } = evento.target;

    setFormAnamnese((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function salvarEvolucao(evento) {
    evento.preventDefault();

    if (salvando) return;

    setErro("");
    setMensagem("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/prontuarios", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const resultado = await lerResposta(resposta);

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || "Não foi possível salvar a evolução."
        );
      }

      setMensagem("Evolução clínica registrada com sucesso.");
      setFormulario(EVOLUCAO_VAZIA);

      await carregarFicha();
    } catch (error) {
      setErro(error.message || "Erro ao registrar evolução.");
    } finally {
      setSalvando(false);
    }
  }

  async function salvarAnamnese(evento) {
    evento.preventDefault();

    if (salvandoAnamnese || !paciente) return;

    setErro("");
    setMensagem("");
    setSalvandoAnamnese(true);

    try {
      const resposta = await fetch("/api/relatorio-anamnese", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_paciente: paciente.id_paciente,
          ...formAnamnese,
          fez_terapia:
            formAnamnese.fez_terapia === ""
              ? null
              : formAnamnese.fez_terapia === "true",
        }),
      });

      const resultado = await lerResposta(resposta);

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || "Não foi possível salvar a anamnese."
        );
      }

      setMensagem("Relatório de anamnese salvo com sucesso!");
      setFormAnamnese(ANAMNESE_VAZIA);

      await carregarFicha();
    } catch (error) {
      setErro(error.message || "Erro ao salvar a anamnese.");
    } finally {
      setSalvandoAnamnese(false);
    }
  }

  const consultasRealizadas = consultas.filter((consulta) => {
    const status = normalizarStatus(consulta.status_consulta);

    return status === "realizado" || status === "realizada";
  });

  const secoes = [
    { id: "dados", label: "Dados pessoais", icon: UserRound },
    { id: "anamnese", label: "Anamnese", icon: FileText },
    { id: "prontuario", label: "Prontuário", icon: ClipboardList },
    { id: "consultas", label: "Consultas", icon: CalendarDays },
  ];

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] p-6 text-[#1d3557]">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin" size={22} />
          Carregando ficha clínica...
        </div>
      </main>
    );
  }

  if (!ficha || !paciente) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] p-6 text-[#1d3557]">
        <Link
          href="/psicologo/pacientes"
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar aos pacientes
        </Link>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-bold">Ficha indisponível</h1>
          <p className="mt-2 text-sm text-red-700">
            {erro || "Não foi possível localizar este paciente."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-6 text-[#1d3557] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/psicologo/pacientes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
        >
          <ArrowLeft size={18} />
          Voltar aos pacientes
        </Link>

        <header className="mb-6 rounded-3xl bg-[#1d3557] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-blue-200">
                <LockKeyhole size={17} />
                Ficha clínica protegida
              </div>

              <h1 className="break-words text-2xl font-bold sm:text-3xl">
                {paciente.nome_completo}
              </h1>

              <p className="mt-2 text-sm text-blue-100">
                Prontuário individual do paciente
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs text-blue-100">Consultas</p>
                <p className="mt-1 text-2xl font-bold">{consultas.length}</p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs text-blue-100">Evoluções</p>
                <p className="mt-1 text-2xl font-bold">{prontuarios.length}</p>
              </div>
            </div>
          </div>
        </header>

        {mensagem && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        <nav className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {secoes.map(({ id: idSecao, label, icon: Icon }) => (
            <button
              key={idSecao}
              type="button"
              onClick={() => {
                setSecao(idSecao);
                setErro("");
                setMensagem("");
              }}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                secao === idSecao
                  ? "bg-[#1d3557] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        {secao === "dados" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-6 text-xl font-bold">Dados pessoais</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <Campo label="Nome completo" valor={paciente.nome_completo} />
              <Campo label="CPF" valor={paciente.cpf} />
              <Campo
                label="Data de nascimento"
                valor={formatarData(paciente.data_nascimento)}
              />
              <Campo label="Telefone" valor={paciente.telefone} />
              <Campo label="Profissão" valor={paciente.profissao} />
              <Campo label="Identificador" valor={paciente.id_paciente} />
            </div>
          </section>
        )}

        {secao === "anamnese" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold">Relatório de anamnese</h2>
              <p className="mt-1 text-sm text-slate-500">
                Registre as informações da avaliação inicial do paciente.
              </p>

              <form onSubmit={salvarAnamnese} className="mt-6 space-y-5">
                {CAMPOS_ANAMNESE.map(([campo, titulo]) => (
                  <div key={campo}>
                    <label
                      htmlFor={`anamnese-${campo}`}
                      className="mb-2 block text-sm font-semibold"
                    >
                      {titulo}
                      {campo === "motivo_consulta" ? " *" : ""}
                    </label>

                    {campo === "fez_terapia" ? (
                      <select
                        id={`anamnese-${campo}`}
                        name={campo}
                        value={formAnamnese[campo]}
                        onChange={atualizarCampoAnamnese}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                      >
                        <option value="">Não informado</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                      </select>
                    ) : (
                      <textarea
                        id={`anamnese-${campo}`}
                        name={campo}
                        value={formAnamnese[campo]}
                        onChange={atualizarCampoAnamnese}
                        required={campo === "motivo_consulta"}
                        maxLength={CAMPOS_CURTOS.includes(campo) ? 255 : 10000}
                        rows={CAMPOS_GRANDES.includes(campo) ? 3 : 2}
                        placeholder={`Informe ${titulo.toLowerCase()}...`}
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={salvandoAnamnese}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d3557] px-5 py-3 font-semibold text-white hover:bg-[#29496f] disabled:opacity-50 sm:w-auto"
                >
                  {salvandoAnamnese ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {salvandoAnamnese
                    ? "Salvando relatório..."
                    : "Salvar relatório de anamnese"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold">Relatórios registrados</h2>

              {anamneses.length === 0 ? (
                <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
                  Nenhum relatório de anamnese foi registrado para este
                  paciente.
                </p>
              ) : (
                <div className="mt-5 space-y-6">
                  {anamneses.map((anamnese) => (
                    <article
                      key={anamnese.id_anamnese}
                      className="rounded-xl border border-slate-200 p-4 sm:p-5"
                    >
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                        <h3 className="font-bold">
                          Relatório #{anamnese.id_anamnese}
                        </h3>
                        <span className="text-xs text-slate-500">
                          Cadastro: {formatarDataHora(anamnese.data_cadastro)}
                        </span>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        {CAMPOS_ANAMNESE.map(([campo, titulo]) => (
                          <Campo
                            key={campo}
                            label={titulo}
                            valor={anamnese[campo]}
                          />
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {secao === "prontuario" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold">Registrar evolução clínica</h2>
              <p className="mt-2 text-sm text-slate-500">
                Cada envio cria um novo registro. Evoluções anteriores são
                preservadas.
              </p>

              {consultasRealizadas.length === 0 ? (
                <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  Não há consultas realizadas disponíveis para registrar uma
                  evolução. Marque uma consulta como realizada na agenda
                  primeiro.
                </p>
              ) : (
                <form onSubmit={salvarEvolucao} className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="id_consulta"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Consulta realizada *
                    </label>

                    <select
                      id="id_consulta"
                      name="id_consulta"
                      value={formulario.id_consulta}
                      onChange={atualizarCampo}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                    >
                      <option value="">Selecione a consulta</option>

                      {consultasRealizadas.map((consulta) => (
                        <option
                          key={consulta.id_consulta}
                          value={consulta.id_consulta}
                        >
                          {formatarData(consulta.data_consulta)} às{" "}
                          {String(consulta.horario || "").slice(0, 5)}
                          {" — Consulta #"}
                          {consulta.id_consulta}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="relato_sessao"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Relato da sessão *
                    </label>

                    <textarea
                      id="relato_sessao"
                      name="relato_sessao"
                      value={formulario.relato_sessao}
                      onChange={atualizarCampo}
                      required
                      maxLength={20000}
                      rows={5}
                      placeholder="Registre os aspectos relevantes da sessão..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="observacoes_clinicas"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Observações clínicas
                    </label>

                    <textarea
                      id="observacoes_clinicas"
                      name="observacoes_clinicas"
                      value={formulario.observacoes_clinicas}
                      onChange={atualizarCampo}
                      maxLength={20000}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="plano_proxima_sessao"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Plano para a próxima sessão
                    </label>

                    <textarea
                      id="plano_proxima_sessao"
                      name="plano_proxima_sessao"
                      value={formulario.plano_proxima_sessao}
                      onChange={atualizarCampo}
                      maxLength={20000}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#1d3557]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={salvando}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d3557] px-5 py-3 font-semibold text-white hover:bg-[#29496f] disabled:opacity-50 sm:w-auto"
                  >
                    {salvando ? (
                      <RefreshCw size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {salvando ? "Salvando..." : "Salvar evolução"}
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold">Histórico de evoluções</h2>

              {prontuarios.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">
                  Nenhuma evolução clínica registrada até o momento.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {prontuarios.map((registro) => (
                    <article
                      key={registro.id_prontuario}
                      className="rounded-xl border border-slate-200 p-4 sm:p-5"
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold">
                          Evolução #{registro.id_prontuario}
                        </h3>
                        <span className="text-xs text-slate-500">
                          Consulta de {formatarData(registro.data_consulta)}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <Campo
                          label="Relato da sessão"
                          valor={registro.relato_sessao}
                        />
                        <Campo
                          label="Observações clínicas"
                          valor={registro.observacoes_clinicas}
                        />
                        <Campo
                          label="Plano para a próxima sessão"
                          valor={registro.plano_proxima_sessao}
                        />
                        <Campo
                          label="Registro criado em"
                          valor={formatarDataHora(registro.data_cadastro)}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {secao === "consultas" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold">Histórico de consultas</h2>

            {consultas.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">
                Nenhuma consulta encontrada.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {consultas.map((consulta) => (
                  <article
                    key={consulta.id_consulta}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-semibold">
                        {formatarData(consulta.data_consulta)} às{" "}
                        {String(consulta.horario || "").slice(0, 5)}
                      </h3>

                      <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1d3557]">
                        {consulta.status_consulta || "Sem status"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      Tipo: {consulta.tipo_atendimento || "Não informado"}
                    </p>

                    {consulta.observacoes && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                        {consulta.observacoes}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      Consulta #{consulta.id_consulta}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function Campo({ label, valor }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
        {formatarValor(valor)}
      </p>
    </div>
  );
}
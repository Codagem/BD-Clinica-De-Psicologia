
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  FileText,
  UserRound,
  CalendarDays,
  LoaderCircle,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

function texto(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "Não informado";
  }

  if (typeof valor === "boolean") {
    return valor ? "Sim" : "Não";
  }

  return String(valor);
}

function formatarData(data) {
  if (!data) return "Não informada";

  const valor = String(data).slice(0, 10);
  const partes = valor.split("-");

  if (partes.length !== 3) return valor;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function Campo({ titulo, valor }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#fbfaf7] p-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {titulo}
      </p>

      <p className="break-words text-sm text-[#1d3557]">
        {texto(valor)}
      </p>
    </div>
  );
}

export default function ProntuariosPsicologo() {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [anamneses, setAnamneses] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const respostas = await Promise.all([
          fetch("/api/pacientes"),
          fetch("/api/consultas"),
          fetch("/api/relatorio-anamnese"),
        ]);

        const dados = await Promise.all(
          respostas.map(async (resposta) => {
            const json = await resposta.json();

            if (!resposta.ok) {
              throw new Error(
                json?.erro || "Não foi possível carregar os dados."
              );
            }

            if (!Array.isArray(json)) {
              throw new Error(
                "Uma das APIs retornou dados em formato inesperado."
              );
            }

            return json;
          })
        );

        if (!ativo) return;

        setPacientes(dados[0]);
        setConsultas(dados[1]);
        setAnamneses(dados[2]);
      } catch (error) {
        if (ativo) {
          setErro(
            error.message ||
              "Não foi possível carregar os prontuários."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    return pacientes.filter((paciente) =>
      (paciente.nome_completo || "")
        .toLowerCase()
        .includes(termo)
    );
  }, [pacientes, pesquisa]);

  const consultasPaciente = useMemo(() => {
    if (!pacienteSelecionado) return [];

    return consultas
      .filter(
        (consulta) =>
          Number(consulta.id_paciente) ===
          Number(pacienteSelecionado.id_paciente)
      )
      .sort((a, b) => {
        const dataA = `${a.data_consulta || ""} ${a.horario || ""}`;
        const dataB = `${b.data_consulta || ""} ${b.horario || ""}`;

        return dataB.localeCompare(dataA);
      });
  }, [consultas, pacienteSelecionado]);

  const anamnesePaciente = useMemo(() => {
    if (!pacienteSelecionado) return null;

    return anamneses.find(
      (anamnese) =>
        Number(anamnese.id_paciente) ===
        Number(pacienteSelecionado.id_paciente)
    );
  }, [anamneses, pacienteSelecionado]);

  return (
    <main className="min-h-screen bg-[#fbfaf7] p-4 pt-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/psicologo"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1d3557] hover:underline"
        >
          <ArrowLeft size={18} />
          Voltar ao painel
        </Link>

        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-2xl bg-[#1d3557] p-3 text-white">
              <FileText size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#1d3557]">
                Prontuários
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Consulte os dados clínicos e o histórico dos seus pacientes.
              </p>
            </div>
          </div>
        </header>

        {erro && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />

            <div>
              <p className="font-semibold">
                Não foi possível carregar os prontuários
              </p>

              <p className="mt-1 text-sm">{erro}</p>
            </div>
          </div>
        )}

        {carregando ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl bg-white p-12 text-[#1d3557] shadow-sm">
            <LoaderCircle className="animate-spin" size={24} />
            Carregando prontuários...
          </div>
        ) : !erro ? (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1d3557]">
                <UserRound size={20} />
                Pacientes ({pacientesFiltrados.length})
              </h2>

              <div className="relative mb-4">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  placeholder="Buscar paciente..."
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#1d3557]"
                />
              </div>

              <div className="space-y-2">
                {pacientesFiltrados.map((paciente) => {
                  const selecionado =
                    Number(pacienteSelecionado?.id_paciente) ===
                    Number(paciente.id_paciente);

                  return (
                    <button
                      key={paciente.id_paciente}
                      onClick={() => setPacienteSelecionado(paciente)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selecionado
                          ? "border-[#1d3557] bg-blue-50"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold text-[#1d3557]">
                        {paciente.nome_completo}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Paciente #{paciente.id_paciente}
                      </p>
                    </button>
                  );
                })}

                {pacientesFiltrados.length === 0 && (
                  <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                    Nenhum paciente encontrado.
                  </p>
                )}
              </div>
            </section>

            <section className="min-w-0 lg:col-span-2">
              {!pacienteSelecionado ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <ClipboardList
                    size={42}
                    className="mb-4 text-gray-400"
                  />

                  <h2 className="text-xl font-bold text-[#1d3557]">
                    Selecione um paciente
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    O prontuário clínico será exibido aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-[#1d3557] p-6 text-white">
                    <p className="mb-2 text-sm text-blue-100">
                      Prontuário clínico
                    </p>

                    <h2 className="text-2xl font-bold">
                      {pacienteSelecionado.nome_completo}
                    </h2>

                    <p className="mt-2 text-sm text-blue-100">
                      Paciente #{pacienteSelecionado.id_paciente}
                    </p>
                  </div>

                  <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-[#1d3557]">
                      Dados do paciente
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Campo
                        titulo="Data de nascimento"
                        valor={formatarData(
                          pacienteSelecionado.data_nascimento
                        )}
                      />

                      <Campo
                        titulo="Profissão"
                        valor={pacienteSelecionado.profissao}
                      />

                      <Campo
                        titulo="Telefone"
                        valor={pacienteSelecionado.telefone}
                      />

                      <Campo
                        titulo="E-mail"
                        valor={pacienteSelecionado.email}
                      />
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1d3557]">
                      <ClipboardList size={20} />
                      Anamnese
                    </h3>

                    {anamnesePaciente ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Campo
                          titulo="Data do registro"
                          valor={formatarData(
                            anamnesePaciente.data_cadastro
                          )}
                        />

                        <Campo
                          titulo="Motivo da consulta"
                          valor={anamnesePaciente.motivo_consulta}
                        />

                        <Campo
                          titulo="Tempo do problema"
                          valor={anamnesePaciente.tempo_problema}
                        />

                        <Campo
                          titulo="Já fez terapia?"
                          valor={texto(anamnesePaciente.fez_terapia)}
                        />

                        <Campo
                          titulo="Ansiedade"
                          valor={anamnesePaciente.ansiedade}
                        />

                        <Campo
                          titulo="Humor"
                          valor={anamnesePaciente.humor}
                        />

                        <Campo
                          titulo="Estresse"
                          valor={anamnesePaciente.estresse}
                        />

                        <Campo
                          titulo="Sono"
                          valor={anamnesePaciente.sono}
                        />

                        <Campo
                          titulo="Alimentação"
                          valor={anamnesePaciente.alimentacao}
                        />

                        <Campo
                          titulo="Histórico psiquiátrico"
                          valor={anamnesePaciente.historico_psiquiatrico}
                        />

                        <Campo
                          titulo="Medicamentos"
                          valor={anamnesePaciente.uso_medicamentos}
                        />

                        <Campo
                          titulo="Objetivo da terapia"
                          valor={anamnesePaciente.objetivo_terapia}
                        />

                        <div className="sm:col-span-2">
                          <Campo
                            titulo="Observações clínicas"
                            valor={anamnesePaciente.observacoes_psicologo}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                        Este paciente ainda não possui anamnese registrada.
                      </p>
                    )}
                  </section>

                  <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1d3557]">
                      <CalendarDays size={20} />
                      Histórico de consultas ({consultasPaciente.length})
                    </h3>

                    {consultasPaciente.length > 0 ? (
                      <div className="space-y-3">
                        {consultasPaciente.map((consulta) => (
                          <article
                            key={consulta.id_consulta}
                            className="rounded-xl border border-gray-100 p-4"
                          >
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                              <div>
                                <p className="font-semibold text-[#1d3557]">
                                  {formatarData(consulta.data_consulta)}
                                  {" · "}
                                  {String(consulta.horario || "").slice(0, 5) || "Horário não informado"}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                  {texto(consulta.tipo_atendimento)}
                                </p>
                              </div>

                              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1d3557]">
                                {texto(consulta.status_consulta)}
                              </span>
                            </div>

                            {consulta.observacoes && (
                              <div className="mt-3 border-t border-gray-100 pt-3">
                                <p className="text-xs font-semibold uppercase text-gray-500">
                                  Observações da consulta
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                                  {consulta.observacoes}
                                </p>
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                        Nenhuma consulta encontrada para este paciente.
                      </p>
                    )}
                  </section>
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
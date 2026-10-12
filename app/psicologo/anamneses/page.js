
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  ClipboardList,
  UserRound,
  AlertCircle,
  LoaderCircle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from "lucide-react";

function exibir(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "Não informado";
  }

  if (typeof valor === "boolean") {
    return valor ? "Sim" : "Não";
  }

  return String(valor);
}

function formatarData(valor) {
  if (!valor) return "Data não informada";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "Data não informada";

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Campo({ titulo, valor }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-600">
        {titulo}
      </h3>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
        {exibir(valor)}
      </p>
    </div>
  );
}

export default function AnamnesesPsicologoPage() {
  const router = useRouter();

  const [anamneses, setAnamneses] = useState([]);
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const sessaoResponse = await fetch("/api/sessao", {
          cache: "no-store",
        });

        if (!sessaoResponse.ok) {
          router.replace("/login");
          return;
        }

        const sessao = await sessaoResponse.json();

        if (
          !sessao.autenticado ||
          sessao.tipo_usuario !== "psicologo"
        ) {
          router.replace("/login");
          return;
        }

        const response = await fetch("/api/relatorio-anamnese", {
          cache: "no-store",
        });

        const dados = await response.json();

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            dados.erro || "Não foi possível carregar as anamneses."
          );
        }

        if (!Array.isArray(dados)) {
          throw new Error("A API retornou dados em formato inválido.");
        }

        if (ativo) setAnamneses(dados);
      } catch (error) {
        if (ativo) {
          setErro(error.message || "Erro ao carregar as anamneses.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [router]);

  const filtradas = anamneses.filter((item) => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return true;

    return [
      item.nome_completo,
      item.id_paciente,
      item.motivo_consulta,
      item.objetivo_terapia,
    ].some((valor) =>
      String(valor ?? "").toLowerCase().includes(termo)
    );
  });

  return (
    <main className="min-h-screen bg-[#fbfaf7] p-4 text-slate-800 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/psicologo"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#1d3557] hover:underline"
        >
          <ArrowLeft size={18} />
          Voltar ao painel
        </Link>

        <header className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-[#1d3557] p-3 text-white">
            <ClipboardList size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Anamneses
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Consulte os registros clínicos dos seus pacientes.
            </p>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <label
            htmlFor="busca-anamnese"
            className="mb-2 block text-sm font-semibold"
          >
            Buscar paciente ou motivo da consulta
          </label>

          <div className="relative">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="busca-anamnese"
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Digite o nome, código ou motivo..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-[#1d3557] focus:ring-2 focus:ring-[#1d3557]/10"
            />
          </div>

          {!carregando && !erro && (
            <p className="mt-3 text-sm text-slate-500">
              {filtradas.length} registro(s) encontrado(s)
            </p>
          )}
        </section>

        {carregando && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border bg-white p-10 text-slate-600">
            <LoaderCircle size={22} className="animate-spin" />
            Carregando registros clínicos...
          </div>
        )}

        {!carregando && erro && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle size={20} />
              Não foi possível carregar as anamneses.
            </div>
            <p className="mt-2 text-sm">{erro}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && filtradas.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <ClipboardList
              size={38}
              className="mx-auto mb-3 text-slate-400"
            />
            <h2 className="font-semibold">
              Nenhuma anamnese encontrada
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {busca
                ? "Tente pesquisar com outros termos."
                : "Não existem registros disponíveis para os pacientes vinculados ao seu cadastro."}
            </p>
          </div>
        )}

        {!carregando && !erro && (
          <div className="space-y-4">
            {filtradas.map((item) => {
              const expandida = aberta === item.id_anamnese;

              return (
                <article
                  key={item.id_anamnese}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-full bg-slate-100 p-3 text-[#1d3557]">
                        <UserRound size={22} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="break-words font-semibold">
                          {item.nome_completo || "Paciente sem nome"}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          Paciente #{item.id_paciente}
                          {" · "}
                          Anamnese #{item.id_anamnese}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          {item.motivo_consulta || "Motivo não informado"}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays size={14} />
                          Cadastro: {formatarData(item.data_cadastro)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setAberta(
                          expandida ? null : item.id_anamnese
                        )
                      }
                      aria-expanded={expandida}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1d3557] px-4 py-3 text-sm font-semibold text-white hover:bg-[#294b78]"
                    >
                      {expandida ? "Fechar detalhes" : "Ver anamnese"}
                      {expandida ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>

                  {expandida && (
                    <div className="border-t border-slate-200 p-5 sm:p-6">
                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-bold text-[#1d3557]">
                          Informações iniciais
                        </h3>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Campo
                            titulo="Idade"
                            valor={item.idade}
                          />
                          <Campo
                            titulo="Motivo da consulta"
                            valor={item.motivo_consulta}
                          />
                          <Campo
                            titulo="Tempo do problema"
                            valor={item.tempo_problema}
                          />
                          <Campo
                            titulo="Já fez terapia?"
                            valor={item.fez_terapia}
                          />
                          <Campo
                            titulo="Tempo de terapia anterior"
                            valor={item.tempo_terapia}
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-bold text-[#1d3557]">
                          Histórico de saúde
                        </h3>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Campo
                            titulo="Doenças físicas"
                            valor={item.doencas_fisicas}
                          />
                          <Campo
                            titulo="Uso de medicamentos"
                            valor={item.uso_medicamentos}
                          />
                          <Campo
                            titulo="Medicação controlada"
                            valor={item.medicacao_controlada}
                          />
                          <Campo
                            titulo="Histórico psiquiátrico"
                            valor={item.historico_psiquiatrico}
                          />
                          <Campo
                            titulo="Doenças mentais na família"
                            valor={item.doencas_mentais_familia}
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-bold text-[#1d3557]">
                          Hábitos e bem-estar
                        </h3>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Campo
                            titulo="Sono"
                            valor={item.sono}
                          />
                          <Campo
                            titulo="Alimentação"
                            valor={item.alimentacao}
                          />
                          <Campo
                            titulo="Uso de álcool e outras drogas"
                            valor={item.uso_alcool_drogas}
                          />
                          <Campo
                            titulo="Atividade física"
                            valor={item.atividade_fisica}
                          />
                          <Campo
                            titulo="Relação familiar"
                            valor={item.relacao_familiar}
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-bold text-[#1d3557]">
                          Aspectos emocionais
                        </h3>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Campo
                            titulo="Ansiedade"
                            valor={item.ansiedade}
                          />
                          <Campo
                            titulo="Humor"
                            valor={item.humor}
                          />
                          <Campo
                            titulo="Estresse"
                            valor={item.estresse}
                          />
                          <Campo
                            titulo="Pensamentos recorrentes"
                            valor={item.pensamentos_recorrentes}
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 text-lg font-bold text-[#1d3557]">
                          Acompanhamento terapêutico
                        </h3>

                        <div className="grid gap-3">
                          <Campo
                            titulo="Objetivo da terapia"
                            valor={item.objetivo_terapia}
                          />
                          <Campo
                            titulo="Observações do psicólogo"
                            valor={item.observacoes_psicologo}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
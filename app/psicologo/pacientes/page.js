
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Users,
  UserRound,
  RefreshCw,
  CalendarDays,
  AlertCircle,
  LoaderCircle,
  ClipboardList,
} from "lucide-react";

export default function PacientesPsicologo() {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarPacientes = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/pacientes", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!resposta.ok) {
        if (resposta.status === 401 || resposta.status === 403) {
          throw new Error(
            "Sua sessão não permite consultar os pacientes. Entre novamente no sistema ou verifique as permissões."
          );
        }

        throw new Error("Não foi possível carregar os pacientes.");
      }

      const dados = await resposta.json();

      // Aceita tanto uma lista direta quanto uma resposta com a propriedade pacientes.
      const lista = Array.isArray(dados)
        ? dados
        : Array.isArray(dados.pacientes)
        ? dados.pacientes
        : [];

      setPacientes(lista);
    } catch (error) {
      setErro(
        error.message ||
          "Ocorreu um erro ao carregar os pacientes. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarPacientes();
  }, [carregarPacientes]);

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return pacientes;

    return pacientes.filter((paciente) => {
      const nome = String(
        paciente.nome_completo ?? paciente.nome ?? ""
      ).toLowerCase();

      const cpf = String(paciente.cpf ?? "").toLowerCase();

      return nome.includes(termo) || cpf.includes(termo);
    });
  }, [pacientes, busca]);

  function formatarCPF(cpf) {
    if (!cpf) return "Não informado";

    const numeros = String(cpf).replace(/\D/g, "");

    if (numeros.length !== 11) return String(cpf);

    return numeros.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4"
    );
  }

  function formatarData(data) {
    if (!data) return "Não informada";

    // Evita mudança de dia causada pelo fuso horário.
    const valor = String(data).slice(0, 10);
    const partes = valor.split("-");

    if (
      partes.length === 3 &&
      partes[0].length === 4 &&
      partes[1].length === 2 &&
      partes[2].length === 2
    ) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return valor;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-[#1d3557] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <header className="mb-8">
          <Link
            href="/psicologo"
            className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition hover:text-[#1d3557]"
          >
            <ArrowLeft size={18} />
            Voltar ao painel
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1d3557] text-white">
                  <Users size={25} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Meus pacientes
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Consulte os pacientes disponíveis para seu acesso.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={carregarPacientes}
              disabled={carregando}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={carregando ? "animate-spin" : ""}
              />
              Atualizar lista
            </button>
          </div>
        </header>

        {/* Indicadores */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Pacientes carregados
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {carregando ? "—" : pacientes.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1d3557]">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Resultados da busca
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {carregando ? "—" : pacientesFiltrados.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Search size={24} />
              </div>
            </div>
          </div>
        </section>

        {/* Pesquisa */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold">Lista de pacientes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pesquise pelo nome completo ou CPF.
            </p>

            <div className="relative mt-5">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Digite o nome ou CPF do paciente..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1d3557] focus:bg-white focus:ring-2 focus:ring-[#1d3557]/10"
              />
            </div>
          </div>

          {/* Carregamento */}
          {carregando && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <LoaderCircle
                size={35}
                className="animate-spin text-[#1d3557]"
              />
              <p className="mt-4 font-medium">Carregando pacientes...</p>
              <p className="mt-1 text-sm text-slate-500">
                Aguarde enquanto consultamos o sistema.
              </p>
            </div>
          )}

          {/* Erro */}
          {!carregando && erro && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-5 sm:m-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={22}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-red-800">
                    Não foi possível carregar a lista
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{erro}</p>

                  <button
                    type="button"
                    onClick={carregarPacientes}
                    className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista vazia */}
          {!carregando && !erro && pacientesFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <UserRound size={30} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-700">
                {busca
                  ? "Nenhum paciente encontrado"
                  : "Nenhum paciente disponível"}
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {busca
                  ? "Tente pesquisar com outro nome ou CPF."
                  : "Quando houver pacientes disponíveis para seu acesso, eles aparecerão aqui."}
              </p>
            </div>
          )}

          {/* Tabela para telas maiores */}
          {!carregando &&
            !erro &&
            pacientesFiltrados.length > 0 && (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Paciente</th>
                        <th className="px-6 py-4 font-semibold">CPF</th>
                        <th className="px-6 py-4 font-semibold">
                          Nascimento
                        </th>
                        <th className="px-6 py-4 font-semibold">Telefone</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {pacientesFiltrados.map((paciente, indice) => (
                        <tr
                          key={
                            paciente.id_paciente ??
                            paciente.id ??
                            `${paciente.cpf}-${indice}`
                          }
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1d3557]">
                                <UserRound size={20} />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {paciente.nome_completo ??
                                    paciente.nome ??
                                    "Nome não informado"}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  Paciente
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {formatarCPF(paciente.cpf)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays
                                size={15}
                                className="text-slate-400"
                              />
                              {formatarData(paciente.data_nascimento)}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {paciente.telefone || "Não informado"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cartões para celular */}
                <div className="space-y-3 p-4 md:hidden">
                  {pacientesFiltrados.map((paciente, indice) => (
                    <article
                      key={
                        paciente.id_paciente ??
                        paciente.id ??
                        `${paciente.cpf}-${indice}`
                      }
                      className="rounded-xl border border-slate-100 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1d3557]">
                          <UserRound size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="break-words font-semibold text-slate-800">
                            {paciente.nome_completo ??
                              paciente.nome ??
                              "Nome não informado"}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            CPF: {formatarCPF(paciente.cpf)}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Nascimento:{" "}
                            {formatarData(paciente.data_nascimento)}
                          </p>

                          <p className="mt-1 break-words text-sm text-slate-500">
                            Telefone: {paciente.telefone || "Não informado"}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
                  Exibindo {pacientesFiltrados.length} de {pacientes.length}{" "}
                  paciente(s).
                </div>
              </>
            )}
        </section>

        {/* Acesso a outras áreas */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/psicologo"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Painel do psicólogo
          </Link>

          <Link
            href="/consultas"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1d3557] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#142640]"
          >
            <ClipboardList size={17} />
            Consultas
          </Link>
        </div>
      </div>
    </main>
  );
}
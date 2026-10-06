"use client";

import { useEffect, useState } from "react";

export default function AuditoriaPage() {
  const [auditorias, setAuditorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAuditoria() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch("/api/auditoria", {
          method: "GET",
          cache: "no-store",
        });

        const dados = await resposta.json();

        console.log("RESPOSTA DA API AUDITORIA:", dados);

        if (!resposta.ok) {
          throw new Error(
            dados?.erro ||
              dados?.mensagem ||
              "Erro ao buscar auditoria"
          );
        }

        const registros = Array.isArray(dados)
          ? dados
          : Array.isArray(dados?.registros)
            ? dados.registros
            : [];

        setAuditorias(registros);
      } catch (error) {
        console.error("ERRO AO CARREGAR AUDITORIA:", error);

        setErro(
          error?.message ||
            "Não foi possível carregar os registros de auditoria."
        );

        setAuditorias([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarAuditoria();
  }, []);

  function formatarData(data) {
    if (!data) return "-";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
      return "-";
    }

    return dataFormatada.toLocaleString("pt-BR");
  }

  function formatarUsuario(tipo, id) {
    if (!tipo && id == null) {
      return "-";
    }

    if (id == null) {
      return tipo;
    }

    return `${tipo} (ID: ${id})`;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-6 text-black md:p-8">

      {/* CABEÇALHO */}
      <div className="mb-8 rounded-[35px] bg-[#1d3557] p-8 shadow-xl">
        <p className="font-semibold text-blue-200">
          Segurança da Informação
        </p>

        <h1 className="mt-2 text-4xl font-bold text-white">
          Dashboard de Auditoria
        </h1>

        <p className="mt-3 text-blue-100">
          Monitoramento dos eventos críticos realizados no sistema.
        </p>
      </div>

      {/* TABELA */}
      <div className="overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-[#1d3557]">
            Registros de Auditoria
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Histórico das ações realizadas no sistema.
          </p>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="m-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Erro ao carregar auditoria
            </p>

            <p className="mt-1 text-sm text-red-600">
              {erro}
            </p>
          </div>
        )}

        {/* CARREGANDO */}
        {carregando && (
          <div className="p-6">
            <p className="text-black">
              Carregando registros de auditoria...
            </p>
          </div>
        )}

        {/* VAZIO */}
        {!carregando &&
          !erro &&
          auditorias.length === 0 && (
            <div className="p-6">
              <p className="text-black">
                Nenhum registro de auditoria encontrado.
              </p>
            </div>
          )}

        {/* REGISTROS */}
        {!carregando &&
          !erro &&
          auditorias.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-black">

                <thead className="bg-gray-50 text-sm text-gray-700">
                  <tr>

                    <th className="px-6 py-4 font-semibold">
                      Data
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Usuário
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Ação
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Tabela
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Registro
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Detalhes
                    </th>

                  </tr>
                </thead>

                <tbody className="bg-white">

                  {auditorias.map((item, index) => (

                    <tr
                      key={item.id_auditoria ?? index}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >

                      {/* DATA */}
                      <td className="whitespace-nowrap px-6 py-4 text-black">
                        {formatarData(item.data_hora)}
                      </td>

                      {/* USUÁRIO */}
                      <td className="px-6 py-4 text-black">
                        <div className="font-semibold">
                          {formatarUsuario(
                            item.tipo_usuario,
                            item.id_usuario
                          )}
                        </div>
                      </td>

                      {/* AÇÃO */}
                      <td className="px-6 py-4 font-semibold text-black">
                        {item.acao || "-"}
                      </td>

                      {/* TABELA */}
                      <td className="px-6 py-4 text-black">
                        {item.tabela_afetada || "-"}
                      </td>

                      {/* REGISTRO */}
                      <td className="px-6 py-4 text-black">
                        {item.registro_id ?? "-"}
                      </td>

                      {/* DETALHES */}
                      <td className="max-w-md px-6 py-4 text-black">
                        {item.detalhes || "-"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

export default function AuditoriaPage() {

  const [auditorias, setAuditorias] = useState([]);
  const [carregando, setCarregando] = useState(true);


  useEffect(() => {

    carregarAuditoria();

  }, []);



  async function carregarAuditoria() {

    try {

      const resposta = await fetch("/api/auditoria");

      const dados = await resposta.json();

      setAuditorias(dados);

    } catch(error) {

      console.error(
        "Erro ao carregar auditoria:",
        error
      );

    } finally {

      setCarregando(false);

    }

  }



  function formatarData(data) {

    if(!data) return "-";

    return new Date(data)
      .toLocaleString("pt-BR");

  }



  return (

    <main className="min-h-screen bg-[#f5f1eb] p-6 md:p-10">


      <div className="max-w-7xl mx-auto">


        <div className="bg-[#1d3557] text-white rounded-[35px] p-8 shadow-xl mb-8">


          <p className="text-blue-200 font-semibold">
            Segurança da Informação
          </p>


          <h1 className="text-4xl font-bold mt-2">
            Dashboard de Auditoria
          </h1>


          <p className="mt-3 text-blue-100">
            Monitoramento dos eventos críticos realizados no sistema.
          </p>


        </div>



        <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">


          <div className="p-6 border-b">

            <h2 className="text-2xl font-bold text-[#1d3557]">
              Trilhas de Auditoria
            </h2>


            <p className="text-gray-500 mt-1">
              Registros de ações realizadas pelos usuários.
            </p>

          </div>




          {carregando ? (

            <div className="p-8 text-center">
              Carregando registros...
            </div>


          ) : auditorias.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              Nenhum registro encontrado.
            </div>


          ) : (


            <div className="overflow-x-auto">


              <table className="w-full">


                <thead className="bg-[#f3f1eb] text-[#1d3557]">

                  <tr>

                    <th className="p-4 text-left">
                      Data
                    </th>

                    <th className="p-4 text-left">
                      Usuário
                    </th>

                    <th className="p-4 text-left">
                      Ação
                    </th>

                    <th className="p-4 text-left">
                      Tabela
                    </th>

                    <th className="p-4 text-left">
                      Detalhes
                    </th>

                  </tr>

                </thead>



                <tbody>


                  {auditorias.map((item)=>(

                    <tr
                      key={item.id_auditoria}
                      className="border-b hover:bg-[#fbfaf7]"
                    >


                      <td className="p-4 text-sm">
                        {formatarData(item.data_hora)}
                      </td>


                      <td className="p-4">
                        {item.tipo_usuario}
                      </td>


                      <td className="p-4 font-semibold text-[#1d3557]">
                        {item.acao}
                      </td>


                      <td className="p-4">
                        {item.tabela_afetada}
                      </td>


                      <td className="p-4 text-gray-600">
                        {item.detalhes}
                      </td>


                    </tr>


                  ))}


                </tbody>


              </table>


            </div>


          )}


        </div>


      </div>


    </main>

  );

}
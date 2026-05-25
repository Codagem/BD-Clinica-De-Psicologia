"use client";

import Protegido from "../components/Protegido";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Consultas() {
  const [consultas, setConsultas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [idPaciente, setIdPaciente] = useState("");
  const [idPsicologo, setIdPsicologo] = useState("");
  const [dataConsulta, setDataConsulta] = useState("");
  const [horario, setHorario] = useState("");
  const [tipoAtendimento, setTipoAtendimento] = useState("Presencial");
  const [statusConsulta, setStatusConsulta] = useState("Agendado");
  const [observacoes, setObservacoes] = useState("");

  async function carregarConsultas() {
    const resposta = await fetch("/api/consultas");
    const dados = await resposta.json();
    setConsultas(dados);
  }

  async function cadastrarConsulta() {
    await fetch("/api/consultas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_paciente: idPaciente,
        id_psicologo: idPsicologo,
        data_consulta: dataConsulta,
        horario,
        tipo_atendimento: tipoAtendimento,
        status_consulta: statusConsulta,
        observacoes,
      }),
    });

    carregarConsultas();

    setIdPaciente("");
    setIdPsicologo("");
    setDataConsulta("");
    setHorario("");
    setTipoAtendimento("Presencial");
    setStatusConsulta("Agendado");
    setObservacoes("");
    setMostrarFormulario(false);
  }

  useEffect(() => {
    carregarConsultas();
  }, []);

  function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarHora(hora) {
    return hora?.slice(0, 5);
  }

  return (

    <Protegido>

      <div className="flex bg-gray-100 min-h-screen">

        <Sidebar />

        <main className="md:ml-64 w-full p-4 pt-20 md:p-10">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

            <h1 className="text-4xl font-bold text-black">
              Consultas
            </h1>

            <button
              onClick={() =>
                setMostrarFormulario(!mostrarFormulario)
              }
              className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800"
            >
              Nova Consulta
            </button>

          </div>

          {mostrarFormulario && (

            <div className="bg-white p-6 rounded-2xl shadow mb-8">

              <h2 className="text-2xl font-bold text-black mb-4">
                Nova Consulta
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <input
                  type="number"
                  placeholder="ID do Paciente"
                  value={idPaciente}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) =>
                    setIdPaciente(e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="ID do Psicólogo"
                  value={idPsicologo}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) =>
                    setIdPsicologo(e.target.value)
                  }
                />

                <input
                  type="date"
                  value={dataConsulta}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) =>
                    setDataConsulta(e.target.value)
                  }
                />

                <input
                  type="time"
                  value={horario}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) =>
                    setHorario(e.target.value)
                  }
                />

                <select
                  value={tipoAtendimento}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) =>
                    setTipoAtendimento(e.target.value)
                  }
                >
                  <option>Presencial</option>
                  <option>Online</option>
                </select>

                <select
                  value={statusConsulta}
                  className="border p-3 rounded-xl text-black bg-white"
                  onChange={(e) =>
                    setStatusConsulta(e.target.value)
                  }
                >
                  <option>Agendado</option>
                  <option>Confirmado</option>
                  <option>Realizado</option>
                  <option>Cancelado</option>
                  <option>Faltou</option>
                </select>

                <input
                  type="text"
                  placeholder="Observações"
                  value={observacoes}
                  className="border p-3 rounded-xl text-black bg-white lg:col-span-2"
                  onChange={(e) =>
                    setObservacoes(e.target.value)
                  }
                />

              </div>

              <button
                onClick={cadastrarConsulta}
                className="bg-black text-white px-5 py-3 rounded-xl mt-4 hover:bg-gray-800"
              >
                Salvar Consulta
              </button>

            </div>

          )}

          <div className="bg-white rounded-2xl shadow overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead className="bg-black text-white">

                <tr>

                  <th className="text-left p-4">
                    Paciente
                  </th>

                  <th className="text-left p-4">
                    Psicólogo
                  </th>

                  <th className="text-left p-4">
                    Data
                  </th>

                  <th className="text-left p-4">
                    Hora
                  </th>

                  <th className="text-left p-4">
                    Tipo
                  </th>

                  <th className="text-left p-4">
                    Status
                  </th>

                  <th className="text-left p-4">
                    Observações
                  </th>

                </tr>

              </thead>

              <tbody className="text-black">

                {consultas.map((consulta) => (

                  <tr
                    key={consulta.id_consulta}
                    className="border-b"
                  >

                    <td className="p-4">
                      {consulta.paciente}
                    </td>

                    <td className="p-4">
                      {consulta.psicologo}
                    </td>

                    <td className="p-4">
                      {formatarData(consulta.data_consulta)}
                    </td>

                    <td className="p-4">
                      {formatarHora(consulta.horario)}
                    </td>

                    <td className="p-4">
                      {consulta.tipo_atendimento}
                    </td>

                    <td className="p-4">

                      <span className="bg-gray-200 px-3 py-1 rounded-full">

                        {consulta.status_consulta}

                      </span>

                    </td>

                    <td className="p-4">
                      {consulta.observacoes}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </main>

      </div>

    </Protegido>

  );
}
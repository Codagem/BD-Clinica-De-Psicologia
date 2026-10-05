"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Psicologo() {
  const router = useRouter();

  useEffect(() => {
    const tipoUsuario = localStorage.getItem("tipo_usuario");
    const idPsicologo = localStorage.getItem("id_psicologo");

    if (tipoUsuario !== "psicologo" || !idPsicologo) {
      router.push("/login");
    }
  }, [router]);

  function sair() {
    localStorage.removeItem("logado");
    localStorage.removeItem("tipo_usuario");
    localStorage.removeItem("id_psicologo");

    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Clínica Psi</p>
            <h1 className="text-3xl font-bold text-[#1d3557]">
              Área do Psicólogo
            </h1>
            <p className="mt-1 text-gray-600">
              Gerencie seus pacientes e atendimentos.
            </p>
          </div>

          <button
            onClick={sair}
            className="rounded-xl bg-[#1d3557] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Sair
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Meus pacientes</p>
            <p className="mt-2 text-3xl font-bold text-[#1d3557]">0</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Sessões</p>
            <p className="mt-2 text-3xl font-bold text-[#1d3557]">0</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Consultas</p>
            <p className="mt-2 text-3xl font-bold text-[#1d3557]">0</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1d3557]">
            Bem-vindo à sua área
          </h2>

          <p className="mt-2 text-gray-600">
            Aqui ficarão os recursos para gerenciamento de pacientes,
            sessões, anamnese, evolução e documentos.
          </p>
        </div>
      </div>
    </main>
  );
}
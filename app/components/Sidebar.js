"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  function sair() {
    localStorage.removeItem("logado");
    router.push("/login");
  }

  return (
    <>
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed top-4 left-4 z-50 bg-black text-white p-3 rounded-xl md:hidden"
      >
        ☰
      </button>

      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-black text-white p-6 flex flex-col justify-between z-40
          transform transition-transform duration-300
          ${aberto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div>
          <h1 className="text-2xl font-bold mb-10">
            Clínica
          </h1>

          <nav className="flex flex-col gap-4">
            <Link href="/" className="hover:bg-gray-800 p-3 rounded-xl">
              Home
            </Link>

            <Link href="/pacientes" className="hover:bg-gray-800 p-3 rounded-xl">
              Pacientes
            </Link>

            <Link href="/consultas" className="hover:bg-gray-800 p-3 rounded-xl">
              Consultas
            </Link>

            <Link href="/financeiro" className="hover:bg-gray-800 p-3 rounded-xl">
              Financeiro
            </Link>

            <Link href="/estoque" className="hover:bg-gray-800 p-3 rounded-xl">
              Estoque
            </Link>
          </nav>
        </div>

        <button
          onClick={sair}
          className="bg-red-600 hover:bg-red-700 p-3 rounded-xl text-white"
        >
          Sair
        </button>
      </aside>
    </>
  );
}
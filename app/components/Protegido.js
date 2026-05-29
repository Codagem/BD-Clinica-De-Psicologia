"use client";

// =========================================
// IMPORTAÇÕES
// =========================================

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// =========================================
// COMPONENTE PROTEGIDO
// =========================================

export default function Protegido({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [autorizado, setAutorizado] = useState(false);

  // =========================================
  // VERIFICAR LOGIN E PERMISSÃO
  // =========================================

  useEffect(() => {
    const logado = localStorage.getItem("logado");
    const tipoUsuario = localStorage.getItem("tipo_usuario");

    if (logado !== "true") {
      router.replace("/login");
      return;
    }

    const rotasBloqueadasPaciente = [
      "/",
      "/pacientes",
      "/consultas",
      "/financeiro",
      "/estoque",
    ];

    if (
      tipoUsuario === "paciente" &&
      rotasBloqueadasPaciente.includes(pathname)
    ) {
      router.replace("/cliente");
      return;
    }

    setAutorizado(true);
  }, [pathname, router]);

  // =========================================
  // CARREGANDO
  // =========================================

  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black bg-[#fbfaf7]">
        Carregando...
      </div>
    );
  }

  return children;
}
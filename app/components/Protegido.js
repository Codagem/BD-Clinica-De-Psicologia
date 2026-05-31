"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Protegido({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const logado = localStorage.getItem("logado");
    const tipoUsuario = localStorage.getItem("tipo_usuario");
    const idPaciente = localStorage.getItem("id_paciente");

    if (logado !== "true") {
      router.replace("/login");
      return;
    }

    if (tipoUsuario === "paciente") {
      if (!idPaciente) {
        router.replace("/login");
        return;
      }

      if (pathname !== "/cliente") {
        router.replace("/cliente");
        return;
      }
    }

    if (tipoUsuario === "admin") {
      if (pathname === "/cliente") {
        router.replace("/");
        return;
      }
    }

    if (tipoUsuario !== "admin" && tipoUsuario !== "paciente") {
      router.replace("/login");
      return;
    }

    setAutorizado(true);
  }, [pathname, router]);

  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] text-[#1d3557] font-semibold">
        Carregando...
      </div>
    );
  }

  return children;
}
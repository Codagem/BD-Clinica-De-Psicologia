"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Protegido({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificarAcesso() {
      try {
        const resposta = await fetch("/api/sessao", {
          method: "GET",
          cache: "no-store",
        });

        const dados = await resposta.json();

        if (!ativo) {
          return;
        }

        if (!resposta.ok || !dados.autenticado) {
          router.replace("/login");
          return;
        }

        const tipoUsuario = dados.tipo_usuario;

        // =========================================
        // PACIENTE
        // =========================================

        if (tipoUsuario === "paciente") {
          if (!dados.id_paciente) {
            router.replace("/login");
            return;
          }

          if (pathname !== "/cliente") {
            router.replace("/cliente");
            return;
          }
        }

        // =========================================
        // ADMINISTRADOR
        // =========================================

        if (tipoUsuario === "admin") {
          if (pathname === "/cliente") {
            router.replace("/");
            return;
          }
        }

        // =========================================
        // PSICÓLOGO
        // =========================================

        if (tipoUsuario === "psicologo") {
          if (!dados.id_psicologo) {
            router.replace("/login");
            return;
          }

          if (
            pathname === "/" ||
            pathname === "/cliente"
          ) {
            router.replace("/psicologo");
            return;
          }
        }

        // =========================================
        // ESTAGIÁRIO
        // =========================================

        if (tipoUsuario === "estagiario") {
          if (!dados.id_estagiario) {
            router.replace("/login");
            return;
          }

          if (
            pathname === "/" ||
            pathname === "/cliente"
          ) {
            router.replace("/estagiario");
            return;
          }
        }

        // =========================================
        // TIPO DE USUÁRIO INVÁLIDO
        // =========================================

        const tiposPermitidos = [
          "admin",
          "paciente",
          "psicologo",
          "estagiario",
        ];

        if (!tiposPermitidos.includes(tipoUsuario)) {
          router.replace("/login");
          return;
        }

        setAutorizado(true);
      } catch (error) {
        console.error(
          "Erro ao verificar sessão:",
          error
        );

        if (ativo) {
          router.replace("/login");
        }
      }
    }

    verificarAcesso();

    return () => {
      ativo = false;
    };
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
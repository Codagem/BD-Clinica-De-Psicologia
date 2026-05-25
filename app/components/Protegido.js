"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Protegido({ children }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const logado = localStorage.getItem("logado");

    if (logado === "true") {
      setAutorizado(true);
    } else {
      router.replace("/login");
    }
  }, []);

  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black">
        Carregando...
      </div>
    );
  }

  return children;
}
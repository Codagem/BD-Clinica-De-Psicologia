"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  function entrar() {
    if (usuario === "admin" && senha === "123456") {
      localStorage.setItem("logado", "true");
      router.push("/");
    } else {
      alert("Usuário ou senha incorretos");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-3xl shadow w-96">
        <h1 className="text-3xl font-bold text-black mb-2">
          Clínica Psi
        </h1>

        <p className="text-gray-500 mb-8">
          Acesse o sistema
        </p>

        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="border p-3 rounded-xl w-full mb-4 text-black bg-white"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="border p-3 rounded-xl w-full mb-6 text-black bg-white"
        />

        <button
          onClick={entrar}
          className="bg-black text-white w-full py-3 rounded-xl hover:bg-gray-800"
        >
          Entrar
        </button>

        <p className="text-sm text-gray-500 mt-5">
          Usuário: admin | Senha: 123456
        </p>
      </div>
    </div>
  );
}
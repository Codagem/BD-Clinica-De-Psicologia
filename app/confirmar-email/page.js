"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// =====================================================
// CONTEÚDO DA PÁGINA DE CONFIRMAÇÃO
// =====================================================

function ConteudoConfirmacao() {
const searchParams = useSearchParams();
const token = searchParams.get("token");

const [status, setStatus] = useState("verificando");
const [mensagem, setMensagem] = useState(
"Estamos verificando seu link de confirmação..."
);

useEffect(() => {
let ativo = true;

```
async function confirmar() {
  if (!token) {
    setStatus("erro");
    setMensagem(
      "O link de confirmação é inválido ou está incompleto."
    );
    return;
  }

  try {
    const resposta = await fetch("/api/confirmar-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const resultado = await resposta.json();

    if (!ativo) return;

    if (!resposta.ok) {
      setStatus("erro");
      setMensagem(
        resultado?.erro ||
          "Não foi possível confirmar seu e-mail. Solicite um novo link."
      );
      return;
    }

    setStatus("sucesso");
    setMensagem(
      resultado?.mensagem ||
        "Seu e-mail foi confirmado com sucesso!"
    );
  } catch {
    if (!ativo) return;

    setStatus("erro");
    setMensagem(
      "Não foi possível verificar o link. Confira sua conexão e tente novamente."
    );
  }
}

confirmar();

return () => {
  ativo = false;
};
```

}, [token]);

return ( <main className="min-h-screen bg-[#f5f1eb] flex items-center justify-center p-4"> <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl"> <div className="mb-4 text-5xl text-[#1d3557]">Ψ</div>

```
    <h1 className="text-3xl font-serif text-[#1d3557]">
      Confirmação de e-mail
    </h1>

    <p className="mt-5 text-gray-600" role="status">
      {mensagem}
    </p>

    {status === "verificando" && (
      <div className="mt-6 animate-pulse text-sm text-gray-500">
        Aguarde um instante...
      </div>
    )}

    {status === "sucesso" && (
      <Link
        href="/login"
        className="mt-7 inline-block w-full rounded-2xl bg-[#1d3557] p-4 font-semibold text-white transition hover:bg-[#2b4c7e]"
      >
        Ir para o login
      </Link>
    )}

    {status === "erro" && (
      <Link
        href="/login"
        className="mt-7 inline-block font-semibold text-[#1d3557] underline"
      >
        Voltar para o login
      </Link>
    )}
  </section>
</main>


);
}

// =====================================================
// PÁGINA COM SUSPENSE PARA A COMPILAÇÃO DO NEXT.JS
// =====================================================

export default function ConfirmarEmail() {
return (
<Suspense
fallback={ <main className="min-h-screen bg-[#f5f1eb] flex items-center justify-center p-4"> <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl"> <div className="mb-4 text-5xl text-[#1d3557]">Ψ</div>

```
        <h1 className="text-3xl font-serif text-[#1d3557]">
          Confirmação de e-mail
        </h1>

        <p className="mt-5 text-gray-600">
          Carregando a confirmação...
        </p>
      </section>
    </main>
  }
>
  <ConteudoConfirmacao />
</Suspense>


);
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  CreditCard,
  CalendarDays,
  Award,
  BriefcaseBusiness,
  LockKeyhole,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
  AtSign,
} from "lucide-react";

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function formatarData(valor) {
  if (!valor) return "Não informado";

  const dataTexto = String(valor).slice(0, 10);
  const partes = dataTexto.split("-");

  if (
    partes.length === 3 &&
    partes[0].length === 4 &&
    partes.every((parte) => /^\d+$/.test(parte))
  ) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return "Não informado";
}

function valorOuPadrao(valor) {
  if (valor === null || valor === undefined || String(valor).trim() === "") {
    return "Não informado";
  }

  return String(valor);
}

async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

/* =========================================================
   COMPONENTES VISUAIS
   ========================================================= */

function CampoPerfil({ icone: Icone, titulo, valor }) {
  return (
    <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-gray-200">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1d3557]/10 text-[#1d3557]">
        <Icone size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {titulo}
        </p>

        <p className="mt-1 break-words font-semibold text-gray-800">
          {valorOuPadrao(valor)}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PÁGINA MEU PERFIL
   ========================================================= */

export default function PerfilPsicologo() {
  const router = useRouter();

  const [psicologo, setPsicologo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      setCarregando(true);
      setErro("");

      try {
        /* 1. Verifica a sessão do usuário */

        const respostaSessao = await fetch("/api/sessao", {
          method: "GET",
          cache: "no-store",
        });

        const sessao = respostaSessao.ok
          ? await lerJson(respostaSessao)
          : null;

        if (
          !sessao?.autenticado ||
          sessao.tipo_usuario !== "psicologo" ||
          !sessao.id_psicologo
        ) {
          router.replace("/login");
          return;
        }

        /* 2. Busca os dados dos psicólogos */

        const respostaPsicologos = await fetch("/api/psicologos", {
          method: "GET",
          cache: "no-store",
        });

        const dados = await lerJson(respostaPsicologos);

        if (!respostaPsicologos.ok) {
          throw new Error(
            dados?.erro || "Não foi possível carregar os dados profissionais."
          );
        }

        // Aceita tanto uma lista quanto um objeto com uma lista.
        const lista = Array.isArray(dados)
          ? dados
          : Array.isArray(dados?.psicologos)
            ? dados.psicologos
            : null;

        if (!lista) {
          throw new Error("A resposta da API de psicólogos é inválida.");
        }

        /* 3. Localiza somente o psicólogo da sessão */

        const encontrado = lista.find(
          (item) =>
            Number(item.id_psicologo) === Number(sessao.id_psicologo)
        );

        if (!encontrado) {
          throw new Error(
            "Não encontramos seu cadastro profissional. Verifique se seu usuário está cadastrado corretamente."
          );
        }

        if (!ativo) return;

        setPsicologo(encontrado);
      } catch (error) {
        if (!ativo) return;

        console.error("Erro ao carregar perfil do psicólogo:", error);

        setErro(
          error.message ||
            "Não foi possível carregar seu perfil. Tente novamente."
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [router]);

  /* =======================================================
     CARREGAMENTO
     ======================================================= */

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <LoaderCircle className="animate-spin text-[#1d3557]" size={23} />

          <p className="text-sm font-medium text-gray-600">
            Carregando seu perfil...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERRO
     ======================================================= */

  if (erro || !psicologo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-8">
        <section className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#1d3557]">
            Não foi possível carregar o perfil
          </h1>

          <p role="alert" className="mt-3 text-sm leading-relaxed text-gray-600">
            {erro || "Os dados do seu perfil não estão disponíveis."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d3557] px-5 py-3 font-semibold text-white transition hover:bg-[#294a75]"
          >
            <RefreshCw size={18} />
            Tentar novamente
          </button>

          <div>
            <Link
              href="/psicologo"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1d3557]"
            >
              <ArrowLeft size={17} />
              Voltar ao painel
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     DADOS DO PERFIL
     ======================================================= */

  const nome = valorOuPadrao(psicologo.nome);
  const inicial = nome === "Não informado" ? "P" : nome.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-gray-800">
      {/* CABEÇALHO */}

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1d3557] text-white">
              <UserRound size={22} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
                Clínica Psi
              </p>

              <p className="truncate font-bold text-[#1d3557]">
                Área profissional
              </p>
            </div>
          </div>

          <Link
            href="/psicologo"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-[#1d3557] sm:px-4"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">Voltar ao painel</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
        </div>
      </header>

      {/* CONTEÚDO */}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TÍTULO */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-[#1d3557]">
            Minha conta
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Meu perfil
          </h1>

          <p className="mt-3 max-w-2xl leading-relaxed text-gray-500">
            Consulte suas informações pessoais e profissionais cadastradas
            na Clínica Psi.
          </p>
        </div>

        {/* CARTÃO PRINCIPAL */}

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="h-2 bg-[#1d3557]" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#1d3557]/10 text-3xl font-bold text-[#1d3557]">
                {inicial}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="break-words text-2xl font-bold text-gray-900">
                  {nome}
                </h2>

                <p className="mt-1 text-gray-500">
                  {valorOuPadrao(psicologo.especialidade)}
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1d3557]">
                  <ShieldCheck size={15} />
                  Conta profissional
                </div>
              </div>

              
            </div>
          </div>
        </section>

        {/* INFORMAÇÕES PESSOAIS */}

        <section className="mt-7 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Informações pessoais
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Dados de identificação e contato.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CampoPerfil
              icone={UserRound}
              titulo="Nome completo"
              valor={psicologo.nome}
            />

            <CampoPerfil
              icone={CreditCard}
              titulo="CPF"
              valor={psicologo.cpf}
            />

            <CampoPerfil
              icone={CalendarDays}
              titulo="Data de nascimento"
              valor={formatarData(psicologo.data_nascimento)}
            />

            <CampoPerfil
              icone={Phone}
              titulo="Telefone"
              valor={psicologo.telefone}
            />

            <CampoPerfil
              icone={Mail}
              titulo="E-mail"
              valor={psicologo.email}
            />

            <CampoPerfil
              icone={AtSign}
              titulo="Identificador profissional"
              valor={psicologo.id_psicologo}
            />
          </div>
        </section>

        {/* INFORMAÇÕES PROFISSIONAIS */}

        <section className="mt-7 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Informações profissionais
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Dados relacionados à sua atuação profissional.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CampoPerfil
              icone={Award}
              titulo="CRP"
              valor={psicologo.crp}
            />

            <CampoPerfil
              icone={BriefcaseBusiness}
              titulo="Especialidade"
              valor={psicologo.especialidade}
            />
          </div>
        </section>

        {/* SEGURANÇA */}

        <section className="mt-7 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1d3557]/10 text-[#1d3557]">
              <LockKeyhole size={22} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">
                Segurança da conta
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-500">
                Mantenha sua senha protegida e não compartilhe suas credenciais
                de acesso com outras pessoas.
              </p>
            </div>
          </div>

          <Link
            href="/psicologo/alterar-senha"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#1d3557] px-5 py-3 font-semibold text-[#1d3557] transition hover:bg-[#1d3557]/5"
          >
            <LockKeyhole size={17} />
            Alterar senha
          </Link>
        </section>

        {/* RODAPÉ */}

        <footer className="mt-8 border-t border-gray-200 py-6 text-center text-xs text-gray-400">
          Clínica Psi • Área profissional
          <p className="mt-1">
            Suas informações são exibidas conforme os dados disponibilizados
            pelo sistema.
          </p>
        </footer>
      </div>
    </main>
  );
}
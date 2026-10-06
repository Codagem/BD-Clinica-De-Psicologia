"use client";

import Link from "next/link";
import {
  ArrowRight,
  Heart,
  ShieldCheck,
  Sparkles,
  Brain,
  Quote,
  ChevronDown,
} from "lucide-react";

/* =========================================================
   DADOS DOS CARDS
   ========================================================= */

const CARDS = [
  {
    icon: Heart,
    title: "Escuta",
    text: "Um espaço onde suas experiências podem ser expressas com liberdade e respeito.",
  },
  {
    icon: Brain,
    title: "Autoconhecimento",
    text: "Compreender pensamentos, sentimentos e comportamentos pode abrir novos caminhos.",
  },
  {
    icon: Sparkles,
    title: "Cuidado",
    text: "Um acompanhamento pensado para respeitar o seu tempo e as suas necessidades.",
  },
];

/* =========================================================
   PÁGINA
   ========================================================= */

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f6f1] text-[#1d3557]">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Fundo decorativo */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-[#dce7e8] opacity-70 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#e8ded2] opacity-70 blur-3xl" />

          <div className="absolute right-[15%] top-[35%] h-40 w-40 rounded-full border border-[#1d3557]/10" />

          <div className="absolute right-[17%] top-[37%] h-24 w-24 rounded-full border border-[#1d3557]/10" />
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 pb-28 sm:px-8 lg:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            {/* LADO ESQUERDO */}
            <div className="max-w-2xl">
              {/* Marca */}
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1d3557] shadow-xl shadow-[#1d3557]/20">
                  <Heart size={27} strokeWidth={1.6} className="text-white" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1d3557]/55">
                    Clínica
                  </p>

                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Psicologia
                  </p>
                </div>
              </div>

              {/* Pequeno destaque */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1d3557]/10 bg-white/60 px-4 py-2 text-xs font-medium tracking-wide shadow-sm backdrop-blur">
                <Sparkles size={14} />
                Um espaço para cuidar de você
              </div>

              {/* Título */}
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
                Cuidar da mente
                <span className="block font-normal italic text-[#49657d]">
                  também é cuidar de si.
                </span>
              </h1>

              {/* Descrição */}
              <p className="mt-8 max-w-xl text-base leading-8 text-[#1d3557]/65 sm:text-lg">
                Um ambiente seguro, acolhedor e preparado para acompanhar você
                em diferentes momentos da vida, com escuta, respeito e cuidado
                profissional.
              </p>

              {/* Botões */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#1d3557] px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-[#1d3557]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#27466c] hover:shadow-2xl"
                >
                  Entrar no sistema
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition group-hover:translate-x-1">
                    <ArrowRight size={16} />
                  </span>
                </Link>

                <a
                  href="#acolhimento"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1d3557]/15 bg-white/50 px-7 py-4 text-sm font-semibold backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white"
                >
                  Conheça nosso cuidado
                </a>
              </div>

              {/* Indicadores */}
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-[#1d3557]/10 pt-7 text-xs font-medium text-[#1d3557]/55">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Ambiente seguro
                </div>

                <div className="flex items-center gap-2">
                  <Heart size={16} />
                  Atendimento humanizado
                </div>

                <div className="flex items-center gap-2">
                  <Brain size={16} />
                  Cuidado psicológico
                </div>
              </div>
            </div>

            {/* LADO DIREITO — CARD */}
            <div className="relative mx-auto w-full max-w-xl">
              {/* Glow */}
              <div
                className="absolute inset-10 rounded-[3rem] bg-[#1d3557]/10 blur-3xl"
                aria-hidden="true"
              />

              {/* Card principal */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/65 p-5 shadow-2xl shadow-[#1d3557]/10 backdrop-blur-xl sm:p-7">
                {/* Moldura interna */}
                <div className="relative overflow-hidden rounded-[2rem] bg-[#1d3557] px-7 py-10 text-white sm:px-10 sm:py-12">
                  {/* Decoração */}
                  <div
                    className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/[0.03]"
                    aria-hidden="true"
                  />

                  <div className="relative">
                    {/* Ícone */}
                    <div className="mb-16 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                        <Heart
                          size={22}
                          strokeWidth={1.5}
                          className="text-white"
                        />
                      </div>

                      <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/45">
                        Espaço de cuidado
                      </span>
                    </div>

                    {/* Frase */}
                    <div className="mb-12">
                      <Quote
                        size={30}
                        strokeWidth={1.4}
                        className="mb-5 text-white/30"
                        aria-hidden="true"
                      />

                      <p className="max-w-md text-3xl font-light leading-tight tracking-[-0.025em] sm:text-4xl">
                        “Você merece um espaço onde possa ser ouvido,
                        compreendido e acolhido.”
                      </p>
                    </div>

                    {/* Linha */}
                    <div className="mb-7 h-px w-full bg-white/10" />

                    {/* Rodapé do card */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Clínica de
                        </p>

                        <p className="mt-1 text-sm font-medium text-white/85">
                          Psicologia
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <ArrowRight
                          size={18}
                          className="-rotate-45"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini informações */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="rounded-2xl bg-[#f8f6f1] px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1d3557]/40">
                      Atendimento
                    </p>

                    <p className="mt-1 text-sm font-semibold">Humanizado</p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f6f1] px-5 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1d3557]/40">
                      Prioridade
                    </p>

                    <p className="mt-1 text-sm font-semibold">Você</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll (posicionado em relação à section) */}
        <a
          href="#acolhimento"
          className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[#1d3557]/40 transition hover:text-[#1d3557]/70 sm:flex"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em]">
            Descubra
          </span>

          <ChevronDown size={17} className="animate-bounce" aria-hidden="true" />
        </a>
      </section>

      {/* =========================================================
          SEÇÃO DE ACOLHIMENTO
      ========================================================= */}
      <section
        id="acolhimento"
        className="relative scroll-mt-6 border-t border-[#1d3557]/10 bg-white px-6 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#1d3557]/45">
                Nosso propósito
              </p>

              <h2 className="max-w-lg text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
                Um lugar para desacelerar, refletir e cuidar de você.
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-8 text-[#1d3557]/60">
              A psicologia pode ser um espaço de descoberta e transformação.
              Aqui, cada pessoa é recebida com respeito à sua história,
              individualidade e momento de vida.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {CARDS.map(({ icon: Icone, title, text }) => (
              <div
                key={title}
                className="group rounded-[2rem] border border-[#1d3557]/10 bg-[#f8f6f1] p-8 transition duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#1d3557]/5"
              >
                <div className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d3557] text-white">
                  <Icone size={21} strokeWidth={1.6} />
                </div>

                <h3 className="text-xl font-semibold">{title}</h3>

                <p className="mt-3 text-sm leading-7 text-[#1d3557]/55">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA FINAL
      ========================================================= */}
      <section className="bg-[#1d3557] px-6 py-24 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/40">
              Comece quando estiver pronto
            </p>

            <h2 className="max-w-2xl text-4xl font-light leading-tight tracking-[-0.035em] sm:text-5xl">
              Cuidar de si também é uma forma de coragem.
            </h2>
          </div>

          <Link
            href="/login"
            className="group flex shrink-0 items-center gap-4 rounded-2xl bg-white px-7 py-4 text-sm font-semibold text-[#1d3557] transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            Acessar o sistema
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d3557]/10 transition group-hover:translate-x-1">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-[#152940] px-6 py-8 text-white/45 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs sm:flex-row sm:items-center">
          <div>
            <p className="font-medium text-white/75">Clínica de Psicologia</p>

            <p className="mt-1">Um espaço para cuidar de você.</p>
          </div>

          <p>© {new Date().getFullYear()} Clínica de Psicologia</p>
        </div>
      </footer>
    </main>
  );
}
"use client";

import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Brain,
  MessageCircleHeart,
} from "lucide-react";

/* =========================================================
   DADOS DOS CARDS
   ========================================================= */

const AJUDAS = [
  {
    icon: HeartHandshake,
    title: "Saúde emocional",
    text: "Um espaço para compreender sentimentos e cuidar melhor da sua saúde emocional.",
  },
  {
    icon: MessageCircleHeart,
    title: "Escuta e acolhimento",
    text: "Fale sobre o que está vivendo em um ambiente seguro, respeitoso e acolhedor.",
  },
  {
    icon: Sparkles,
    title: "Autoconhecimento",
    text: "Conheça melhor seus pensamentos, emoções, comportamentos e necessidades.",
  },
  {
    icon: Brain,
    title: "Acompanhamento",
    text: "Conte com acompanhamento psicológico durante diferentes fases da sua vida.",
  },
];

/* =========================================================
   PÁGINA
   ========================================================= */

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#1d3557]">
      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Fundo */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fbfaf7] via-[#f7f4ee] to-[#e9eef2]" />

          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#1d3557]/5" />

          <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-[#457b9d]/10" />
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* TEXTO */}
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1d3557]/10 bg-white px-4 py-2 shadow-sm">
                <HeartHandshake size={18} className="text-[#457b9d]" />

                <span className="text-sm font-semibold text-[#2b4c7e]">
                  Cuidado, acolhimento e escuta
                </span>
              </div>

              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl xl:text-7xl">
                CLÍNICA DE
                <span className="block text-[#457b9d]">PSICOLOGIA</span>
              </h1>

              <p className="mt-6 text-2xl font-medium text-[#2b4c7e] md:text-3xl">
                Um espaço para cuidar de você.
              </p>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 md:text-xl">
                Um ambiente de acolhimento, escuta e cuidado emocional, pensado
                para que você possa olhar para si com mais calma, segurança e
                compreensão.
              </p>

              {/* BOTÕES */}
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#1d3557] px-7 py-4 font-semibold text-white shadow-lg shadow-[#1d3557]/20 transition hover:-translate-y-1 hover:bg-[#2b4c7e]"
                >
                  Entrar no sistema
                  <ArrowRight
                    size={20}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>

                <a
                  href="#como-podemos-ajudar"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#1d3557]/15 bg-white px-7 py-4 font-semibold transition hover:-translate-y-1 hover:bg-[#f3f1eb]"
                >
                  Conheça a clínica
                </a>
              </div>

              {/* SEGURANÇA */}
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#457b9d]" />
                  Ambiente seguro
                </div>

                <div className="flex items-center gap-2">
                  <HeartHandshake size={18} className="text-[#457b9d]" />
                  Atendimento humanizado
                </div>
              </div>
            </div>

            {/* ÁREA VISUAL */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-lg">
                {/* Cartão principal */}
                <div className="absolute inset-8 overflow-hidden rounded-[42px] border border-[#1d3557]/10 bg-white shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#eef3f5] via-[#f9f8f4] to-[#dfe8ec]" />

                  {/* Decoração */}
                  <div className="absolute right-10 top-12 h-28 w-28 rounded-full bg-[#457b9d]/10" />

                  <div className="absolute bottom-16 left-8 h-36 w-36 rounded-full bg-[#1d3557]/5" />

                  {/* Ilustração */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-10 text-center">
                      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] bg-[#1d3557] text-white shadow-xl">
                        <Brain size={58} strokeWidth={1.5} />
                      </div>

                      <h2 className="mt-8 text-3xl font-bold text-[#1d3557]">
                        Cuidar de si
                      </h2>

                      <p className="mt-3 leading-relaxed text-gray-500">
                        também é uma forma de
                        <br />
                        se fortalecer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card flutuante */}
                <div className="absolute bottom-16 left-0 flex items-center gap-4 rounded-3xl border border-[#1d3557]/10 bg-white p-5 shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d3557]/10">
                    <MessageCircleHeart size={25} className="text-[#1d3557]" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Nosso propósito</p>

                    <p className="font-semibold text-[#1d3557]">
                      Ouvir. Acolher. Cuidar.
                    </p>
                  </div>
                </div>

                {/* Card superior */}
                <div className="absolute right-0 top-10 rounded-3xl bg-[#1d3557] p-5 text-white shadow-xl">
                  <Sparkles size={24} />

                  <p className="mt-2 text-sm font-semibold">Seu bem-estar</p>

                  <p className="mt-1 text-xs text-blue-100">
                    importa para nós.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO PODEMOS AJUDAR */}
      <section
        id="como-podemos-ajudar"
        className="scroll-mt-6 bg-white px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 font-semibold text-[#457b9d]">
              Cuidado psicológico
            </p>

            <h2 className="text-4xl font-bold text-[#1d3557] md:text-5xl">
              Como podemos ajudar?
            </h2>

            <p className="mt-5 text-lg leading-relaxed text-gray-500">
              Cada pessoa possui uma história única. Nosso objetivo é oferecer
              um espaço de escuta e acolhimento para diferentes momentos da
              vida.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {AJUDAS.map(({ icon: Icone, title, text }) => (
              <Card
                key={title}
                icon={<Icone size={28} />}
                title={title}
                text={text}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FRASE DE IMPACTO */}
      <section className="bg-[#1d3557] px-6 py-24 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <HeartHandshake
            size={46}
            className="mx-auto text-blue-200"
            strokeWidth={1.5}
          />

          <h2 className="mt-7 text-4xl font-bold leading-tight md:text-6xl">
            Você não precisa enfrentar
            <span className="block text-blue-200">tudo sozinho.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-blue-100 md:text-xl">
            Procurar ajuda também é um ato de coragem. Estamos aqui para
            oferecer um espaço de escuta, respeito e cuidado.
          </p>

          <Link
            href="/login"
            className="mt-9 inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-4 font-semibold text-[#1d3557] transition hover:-translate-y-1 hover:bg-[#f3f1eb]"
          >
            Entrar no sistema
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="bg-[#fbfaf7] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="font-bold text-[#1d3557]">CLÍNICA DE PSICOLOGIA</p>

            <p className="mt-1 text-sm text-gray-500">
              Um espaço para cuidar de você.
            </p>
          </div>

          <p className="text-sm text-gray-400">Sistema de gestão da clínica</p>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   CARD
   ========================================================= */

function Card({ icon, title, text }) {
  return (
    <div className="group rounded-[30px] border border-[#1d3557]/10 bg-[#fbfaf7] p-7 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1d3557]/10 text-[#1d3557] transition group-hover:bg-[#1d3557] group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-bold text-[#1d3557]">{title}</h3>

      <p className="mt-3 leading-relaxed text-gray-500">{text}</p>
    </div>
  );
}
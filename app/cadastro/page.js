"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Cadastro() {
  const router = useRouter();

  const [formulario, setFormulario] = useState({
    nome_completo: "",
    data_nascimento: "",
    cpf: "",
    telefone: "",
    email: "",
    endereco: "",
    profissao: "",
    estado_civil: "",
  });

  const [aceitouLGPD, setAceitouLGPD] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function alterarCampo(e) {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function cadastrar(e) {
    e.preventDefault();

    if (
      !formulario.nome_completo.trim() ||
      !formulario.data_nascimento ||
      !formulario.cpf.trim()
    ) {
      alert("Preencha nome, CPF e data de nascimento.");
      return;
    }

    if (!aceitouLGPD) {
      alert(
        "É necessário aceitar o Termo de Consentimento e Privacidade para realizar o cadastro."
      );
      return;
    }

    setCarregando(true);

    try {
      // =====================================================
      // 1. CRIAR PACIENTE
      // =====================================================

      const resposta = await fetch("/api/cadastro-paciente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const resultado = await resposta.json();

      if (!resposta.ok || resultado.erro) {
        alert(resultado.erro || "Erro ao realizar cadastro.");
        setCarregando(false);
        return;
      }

      // =====================================================
      // 2. OBTER ID DO PACIENTE CRIADO
      // =====================================================

      const idPaciente = resultado.id_paciente;

      if (!idPaciente) {
        alert(
          "O paciente foi cadastrado, mas não foi possível identificar o cadastro para registrar o consentimento LGPD."
        );

        setCarregando(false);
        return;
      }

      // =====================================================
      // 3. REGISTRAR CONSENTIMENTO LGPD
      // =====================================================

      const respostaConsentimento = await fetch(
        "/api/consentimentos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_paciente: idPaciente,
            aceitou: true,

            // O servidor deve identificar o IP.
            // Não confiamos no navegador para informar esse dado.
            ip_aceite: null,
          }),
        }
      );

      const resultadoConsentimento =
        await respostaConsentimento.json();

      if (
        !respostaConsentimento.ok ||
        resultadoConsentimento.erro
      ) {
        console.error(
          "Erro ao registrar consentimento:",
          resultadoConsentimento
        );

        alert(
          "O paciente foi cadastrado, porém não foi possível registrar o consentimento LGPD. Entre em contato com a clínica."
        );

        setCarregando(false);
        return;
      }

      // =====================================================
      // 4. CADASTRO CONCLUÍDO
      // =====================================================

      alert(
        "Cadastro realizado com sucesso! Seu consentimento de privacidade também foi registrado."
      );

      router.push("/login");
    } catch (error) {
      console.error("Erro no cadastro:", error);

      alert(
        "Não foi possível concluir o cadastro. Verifique sua conexão e tente novamente."
      );

      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[34px] shadow-2xl p-8 md:p-12">

        {/* =====================================================
            CABEÇALHO
        ===================================================== */}

        <div className="text-center mb-10">
          <div className="text-[#1d3557] text-5xl mb-3">
            Ψ
          </div>

          <h1 className="text-4xl font-serif text-[#1d3557]">
            Criar cadastro
          </h1>

          <p className="text-gray-500 mt-2">
            Cadastre seus dados para acessar a Clínica Psi
          </p>
        </div>

        {/* =====================================================
            FORMULÁRIO
        ===================================================== */}

        <form onSubmit={cadastrar} className="space-y-6">

          {/* =====================================================
              NOME
          ===================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Nome completo *
            </label>

            <input
              type="text"
              name="nome_completo"
              value={formulario.nome_completo}
              onChange={alterarCampo}
              placeholder="Digite seu nome completo"
              autoComplete="name"
              required
              className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
            />
          </div>

          {/* =====================================================
              CPF E DATA DE NASCIMENTO
          ===================================================== */}

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                CPF *
              </label>

              <input
                type="text"
                name="cpf"
                inputMode="numeric"
                value={formulario.cpf}
                onChange={alterarCampo}
                placeholder="000.000.000-00"
                autoComplete="off"
                required
                className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Data de nascimento *
              </label>

              <input
                type="date"
                name="data_nascimento"
                value={formulario.data_nascimento}
                onChange={alterarCampo}
                required
                className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
              />
            </div>

          </div>

          {/* =====================================================
              TELEFONE E E-MAIL
          ===================================================== */}

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Telefone
              </label>

              <input
                type="text"
                name="telefone"
                value={formulario.telefone}
                onChange={alterarCampo}
                placeholder="(81) 99999-9999"
                autoComplete="tel"
                className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                E-mail
              </label>

              <input
                type="email"
                name="email"
                value={formulario.email}
                onChange={alterarCampo}
                placeholder="seuemail@email.com"
                autoComplete="email"
                className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
              />
            </div>

          </div>

          {/* =====================================================
              ENDEREÇO
          ===================================================== */}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Endereço
            </label>

            <input
              type="text"
              name="endereco"
              value={formulario.endereco}
              onChange={alterarCampo}
              placeholder="Digite seu endereço"
              autoComplete="street-address"
              className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
            />
          </div>

          {/* =====================================================
              PROFISSÃO E ESTADO CIVIL
          ===================================================== */}

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Profissão
              </label>

              <input
                type="text"
                name="profissao"
                value={formulario.profissao}
                onChange={alterarCampo}
                placeholder="Digite sua profissão"
                className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Estado civil
              </label>

              <select
                name="estado_civil"
                value={formulario.estado_civil}
                onChange={alterarCampo}
                className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e]"
              >
                <option value="">Selecione</option>
                <option value="Solteiro">Solteiro</option>
                <option value="Casado">Casado</option>
                <option value="Divorciado">Divorciado</option>
                <option value="Viúvo">Viúvo</option>
                <option value="União estável">
                  União estável
                </option>
              </select>
            </div>

          </div>

          {/* =====================================================
              CONSENTIMENTO LGPD
          ===================================================== */}

          <div
            className={`border rounded-2xl p-5 transition ${
              aceitouLGPD
                ? "border-[#2b4c7e]/40 bg-[#f1f5f9]"
                : "border-[#1d3557]/15 bg-[#f8f7f4]"
            }`}
          >

            <div className="flex items-start gap-3">

              <input
                type="checkbox"
                id="aceiteLGPD"
                checked={aceitouLGPD}
                onChange={(e) =>
                  setAceitouLGPD(e.target.checked)
                }
                className="mt-1 w-5 h-5 accent-[#2b4c7e] cursor-pointer"
                required
              />

              <label
                htmlFor="aceiteLGPD"
                className="text-sm text-gray-600 leading-relaxed cursor-pointer"
              >
                Li e estou de acordo com o{" "}

                <span className="font-semibold text-[#1d3557]">
                  Termo de Consentimento e Privacidade
                </span>

                . Autorizo o tratamento dos meus dados pessoais
                para as finalidades relacionadas ao atendimento
                psicológico e à utilização do sistema da Clínica
                Psi.
              </label>

            </div>

            {/* =================================================
                INDICAÇÃO VISUAL DO ACEITE
            ================================================= */}

            {aceitouLGPD && (
              <div className="mt-4 text-sm text-green-700 font-medium">
                ✓ Termo aceito. O consentimento será registrado
                junto ao seu cadastro.
              </div>
            )}

          </div>

          {/* =====================================================
              BOTÃO CADASTRAR
          ===================================================== */}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#2b4c7e] hover:bg-[#244267] text-white rounded-2xl p-4 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {carregando
              ? "Cadastrando..."
              : "Criar cadastro"}
          </button>

          {/* =====================================================
              BOTÃO LOGIN
          ===================================================== */}

          <button
            type="button"
            onClick={() => router.push("/login")}
            disabled={carregando}
            className="w-full border border-[#1d3557]/20 text-[#1d3557] rounded-2xl p-4 font-medium hover:bg-[#f8f7f4] transition disabled:opacity-60"
          >
            Voltar para o login
          </button>

        </form>
      </div>
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Lê o JSON sem quebrar caso a API devolva HTML ou texto (ex.: erro 500)
async function lerJson(resposta) {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

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

    // Evita envio duplicado (duplo clique)
    if (carregando) {
      return;
    }

    const cpfNumeros = formulario.cpf.replace(/\D/g, "");

    if (
      !formulario.nome_completo.trim() ||
      !formulario.data_nascimento ||
      !cpfNumeros
    ) {
      alert("Preencha nome, CPF e data de nascimento.");
      return;
    }

    if (cpfNumeros.length !== 11) {
      alert("CPF inválido. Informe os 11 dígitos.");
      return;
    }

    if (!aceitouLGPD) {
      alert(
        "É necessário aceitar o Termo de Consentimento e Privacidade para realizar o cadastro."
      );
      return;
    }

    setCarregando(true);

    let cadastroConcluido = false;

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

      const resultado = await lerJson(resposta);

      if (!resposta.ok || !resultado || resultado.erro) {
        alert(
          resultado?.erro ||
            `Erro ao realizar cadastro (status ${resposta.status}).`
        );
        return;
      }

      // =====================================================
      // 2. OBTER TOKEN DO CONSENTIMENTO
      // =====================================================

      const tokenConsentimento = resultado.token_consentimento;

      if (!resultado.id_paciente || !tokenConsentimento) {
        // Não loga o objeto inteiro: ele contém o token
        console.error("Resposta do cadastro sem ID ou token de consentimento.");

        alert(
          "O paciente foi cadastrado, porém não foi possível obter o token necessário para registrar o consentimento LGPD. Entre em contato com a clínica."
        );
        return;
      }

      // =====================================================
      // 3. REGISTRAR CONSENTIMENTO LGPD
      // =====================================================

      const respostaConsentimento = await fetch("/api/consentimentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token_consentimento: tokenConsentimento,
          aceitou: true,
        }),
      });

      const resultadoConsentimento = await lerJson(respostaConsentimento);

      if (
        !respostaConsentimento.ok ||
        !resultadoConsentimento ||
        resultadoConsentimento.erro
      ) {
        console.error(
          "Erro ao registrar consentimento (status):",
          respostaConsentimento.status
        );

        alert(
          resultadoConsentimento?.erro ||
            "O paciente foi cadastrado, porém não foi possível registrar o consentimento LGPD. Entre em contato com a clínica."
        );
        return;
      }

      // =====================================================
      // 4. CADASTRO CONCLUÍDO
      // =====================================================

      cadastroConcluido = true;

      alert(
        "Cadastro realizado com sucesso! Seu consentimento de privacidade também foi registrado."
      );

      router.push("/login");
    } catch (error) {
      console.error("Erro no cadastro:", error);

      alert(
        "Não foi possível concluir o cadastro. Verifique sua conexão e tente novamente."
      );
    } finally {
      // Em caso de sucesso, mantém o botão travado até a navegação terminar
      if (!cadastroConcluido) {
        setCarregando(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-[34px] shadow-2xl p-8 md:p-12">
        {/* CABEÇALHO */}
        <div className="text-center mb-10">
          <div className="text-[#1d3557] text-5xl mb-3">Ψ</div>

          <h1 className="text-4xl font-serif text-[#1d3557]">Criar cadastro</h1>

          <p className="text-gray-500 mt-2">
            Cadastre seus dados para acessar a Clínica Psi
          </p>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={cadastrar} className="space-y-6">
          {/* NOME */}
          <div>
            <label
              htmlFor="nome_completo"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Nome completo *
            </label>

            <input
              id="nome_completo"
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

          {/* CPF E DATA DE NASCIMENTO */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="cpf"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                CPF *
              </label>

              <input
                id="cpf"
                type="text"
                name="cpf"
                inputMode="numeric"
                maxLength={14}
                value={formulario.cpf}
                onChange={alterarCampo}
                placeholder="000.000.000-00"
                autoComplete="off"
                required
                className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
              />
            </div>

            <div>
              <label
                htmlFor="data_nascimento"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Data de nascimento *
              </label>

              <input
                id="data_nascimento"
                type="date"
                name="data_nascimento"
                value={formulario.data_nascimento}
                onChange={alterarCampo}
                required
                className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
              />
            </div>
          </div>

          {/* TELEFONE E E-MAIL */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Telefone
              </label>

              <input
                id="telefone"
                type="tel"
                name="telefone"
                value={formulario.telefone}
                onChange={alterarCampo}
                placeholder="(81) 99999-9999"
                autoComplete="tel"
                className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                E-mail
              </label>

              <input
                id="email"
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

          {/* ENDEREÇO */}
          <div>
            <label
              htmlFor="endereco"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Endereço
            </label>

            <input
              id="endereco"
              type="text"
              name="endereco"
              value={formulario.endereco}
              onChange={alterarCampo}
              placeholder="Digite seu endereço"
              autoComplete="street-address"
              className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
            />
          </div>

          {/* PROFISSÃO E ESTADO CIVIL */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="profissao"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Profissão
              </label>

              <input
                id="profissao"
                type="text"
                name="profissao"
                value={formulario.profissao}
                onChange={alterarCampo}
                placeholder="Digite sua profissão"
                className="w-full border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-[#2b4c7e]"
              />
            </div>

            <div>
              <label
                htmlFor="estado_civil"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Estado civil
              </label>

              <select
                id="estado_civil"
                name="estado_civil"
                value={formulario.estado_civil}
                onChange={alterarCampo}
                className="w-full border border-gray-200 rounded-2xl p-4 text-black bg-white outline-none focus:border-[#2b4c7e]"
              >
                <option value="">Selecione</option>
                <option value="Solteiro">Solteiro</option>
                <option value="Casado">Casado</option>
                <option value="União estável">União estável</option>
                <option value="Divorciado">Divorciado</option>
                <option value="Viúvo">Viúvo</option>
              </select>
            </div>
          </div>

          {/* CONSENTIMENTO LGPD */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aceitouLGPD}
                onChange={(e) => setAceitouLGPD(e.target.checked)}
                className="mt-1 h-5 w-5 accent-[#1d3557]"
              />

              <span className="text-sm text-gray-700">
                Li e aceito o Termo de Consentimento e Privacidade, autorizando o
                tratamento dos meus dados pessoais pela Clínica Psi, conforme a
                Lei Geral de Proteção de Dados (LGPD).
              </span>
            </label>
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-2xl bg-[#1d3557] p-4 font-semibold text-white transition hover:bg-[#2b4c7e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? "Cadastrando..." : "Criar cadastro"}
          </button>

          {/* LINK PARA LOGIN */}
          <p className="text-center text-sm text-gray-500">
            Já possui cadastro?{" "}
            <a href="/login" className="font-semibold text-[#1d3557] underline">
              Entrar
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
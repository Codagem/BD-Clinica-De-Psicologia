--
-- PostgreSQL database dump
--

\restrict AOyHDuzhateFarVaH2QZuKxHUg5sQd3WP3BnYUG2XKFG1u1FOjOgFTaKaB93uWR

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-05-23 13:26:15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 256 (class 1255 OID 17293)
-- Name: cadastrar_anamnese(integer, text, character varying, boolean, character varying, text, text, text, text, text, text, text, text, text, text, character varying, text, text, text, text, text); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.cadastrar_anamnese(IN p_id_paciente integer, IN p_motivo_consulta text, IN p_tempo_problema character varying, IN p_fez_terapia boolean, IN p_tempo_terapia character varying, IN p_doencas_fisicas text, IN p_uso_medicamentos text, IN p_historico_psiquiatrico text, IN p_medicacao_controlada text, IN p_doencas_mentais_familia text, IN p_relacao_familiar text, IN p_sono text, IN p_alimentacao text, IN p_uso_alcool_drogas text, IN p_atividade_fisica text, IN p_ansiedade character varying, IN p_humor text, IN p_estresse text, IN p_pensamentos_recorrentes text, IN p_objetivo_terapia text, IN p_observacoes_psicologo text)
    LANGUAGE plpgsql
    AS $$
BEGIN

    INSERT INTO anamneses (

        id_paciente,

        motivo_consulta,
        tempo_problema,
        fez_terapia,
        tempo_terapia,

        doencas_fisicas,
        uso_medicamentos,
        historico_psiquiatrico,
        medicacao_controlada,

        doencas_mentais_familia,
        relacao_familiar,

        sono,
        alimentacao,
        uso_alcool_drogas,
        atividade_fisica,

        ansiedade,
        humor,
        estresse,
        pensamentos_recorrentes,

        objetivo_terapia,

        observacoes_psicologo

    )

    VALUES (

        p_id_paciente,

        p_motivo_consulta,
        p_tempo_problema,
        p_fez_terapia,
        p_tempo_terapia,

        p_doencas_fisicas,
        p_uso_medicamentos,
        p_historico_psiquiatrico,
        p_medicacao_controlada,

        p_doencas_mentais_familia,
        p_relacao_familiar,

        p_sono,
        p_alimentacao,
        p_uso_alcool_drogas,
        p_atividade_fisica,

        p_ansiedade,
        p_humor,
        p_estresse,
        p_pensamentos_recorrentes,

        p_objetivo_terapia,

        p_observacoes_psicologo
    );

END;
$$;


ALTER PROCEDURE public.cadastrar_anamnese(IN p_id_paciente integer, IN p_motivo_consulta text, IN p_tempo_problema character varying, IN p_fez_terapia boolean, IN p_tempo_terapia character varying, IN p_doencas_fisicas text, IN p_uso_medicamentos text, IN p_historico_psiquiatrico text, IN p_medicacao_controlada text, IN p_doencas_mentais_familia text, IN p_relacao_familiar text, IN p_sono text, IN p_alimentacao text, IN p_uso_alcool_drogas text, IN p_atividade_fisica text, IN p_ansiedade character varying, IN p_humor text, IN p_estresse text, IN p_pensamentos_recorrentes text, IN p_objetivo_terapia text, IN p_observacoes_psicologo text) OWNER TO postgres;

--
-- TOC entry 257 (class 1255 OID 17294)
-- Name: cadastrar_paciente(character varying, date, character varying, character varying, character varying, text, character varying, character varying); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.cadastrar_paciente(IN p_nome character varying, IN p_data_nascimento date, IN p_cpf character varying, IN p_telefone character varying, IN p_email character varying, IN p_endereco text, IN p_profissao character varying, IN p_estado_civil character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN

    INSERT INTO pacientes(
        nome_completo,
        data_nascimento,
        cpf,
        telefone,
        email,
        endereco,
        profissao,
        estado_civil
    )
    VALUES (
        p_nome,
        p_data_nascimento,
        p_cpf,
        p_telefone,
        p_email,
        p_endereco,
        p_profissao,
        p_estado_civil
    );

END;
$$;


ALTER PROCEDURE public.cadastrar_paciente(IN p_nome character varying, IN p_data_nascimento date, IN p_cpf character varying, IN p_telefone character varying, IN p_email character varying, IN p_endereco text, IN p_profissao character varying, IN p_estado_civil character varying) OWNER TO postgres;

--
-- TOC entry 244 (class 1255 OID 17435)
-- Name: cadastrar_pagamento(integer, numeric, character varying, character varying, date); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.cadastrar_pagamento(IN p_id_consulta integer, IN p_valor numeric, IN p_forma_pagamento character varying, IN p_status_pagamento character varying, IN p_data_pagamento date)
    LANGUAGE plpgsql
    AS $$

BEGIN

    INSERT INTO pagamentos(

        id_consulta,
        valor,
        forma_pagamento,
        status_pagamento,
        data_pagamento

    )

    VALUES(

        p_id_consulta,
        p_valor,
        p_forma_pagamento,
        p_status_pagamento,
        p_data_pagamento

    );

END;

$$;


ALTER PROCEDURE public.cadastrar_pagamento(IN p_id_consulta integer, IN p_valor numeric, IN p_forma_pagamento character varying, IN p_status_pagamento character varying, IN p_data_pagamento date) OWNER TO postgres;

--
-- TOC entry 241 (class 1255 OID 17431)
-- Name: cadastrar_produto(character varying, character varying, integer, integer, character varying); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.cadastrar_produto(IN p_nome character varying, IN p_categoria character varying, IN p_quantidade_atual integer, IN p_quantidade_minima integer, IN p_fornecedor character varying)
    LANGUAGE plpgsql
    AS $$

BEGIN

    INSERT INTO estoque(

        nome,
        categoria,
        quantidade_atual,
        quantidade_minima,
        fornecedor

    )

    VALUES(

        p_nome,
        p_categoria,
        p_quantidade_atual,
        p_quantidade_minima,
        p_fornecedor

    );

END;

$$;


ALTER PROCEDURE public.cadastrar_produto(IN p_nome character varying, IN p_categoria character varying, IN p_quantidade_atual integer, IN p_quantidade_minima integer, IN p_fornecedor character varying) OWNER TO postgres;

--
-- TOC entry 258 (class 1255 OID 17295)
-- Name: calcular_idade(date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_idade(data_nascimento date) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN

    RETURN DATE_PART(
        'year',
        AGE(data_nascimento)
    );

END;
$$;


ALTER FUNCTION public.calcular_idade(data_nascimento date) OWNER TO postgres;

--
-- TOC entry 259 (class 1255 OID 17296)
-- Name: fn_calcular_idade(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_calcular_idade() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN

    NEW.idade := DATE_PART(
        'year',
        AGE(NEW.data_nascimento)
    );

    RETURN NEW;

END;
$$;


ALTER FUNCTION public.fn_calcular_idade() OWNER TO postgres;

--
-- TOC entry 260 (class 1255 OID 17297)
-- Name: total_anamneses(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.total_anamneses() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    total INT;
BEGIN

    SELECT COUNT(*)
    INTO total
    FROM anamneses;

    RETURN total;

END;
$$;


ALTER FUNCTION public.total_anamneses() OWNER TO postgres;

--
-- TOC entry 261 (class 1255 OID 17298)
-- Name: total_pacientes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.total_pacientes() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    total INT;
BEGIN

    SELECT COUNT(*)
    INTO total
    FROM pacientes;

    RETURN total;

END;
$$;


ALTER FUNCTION public.total_pacientes() OWNER TO postgres;

--
-- TOC entry 242 (class 1255 OID 17432)
-- Name: total_produtos_estoque(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.total_produtos_estoque() RETURNS integer
    LANGUAGE plpgsql
    AS $$

DECLARE

    total INT;

BEGIN

    SELECT COUNT(*)

    INTO total

    FROM estoque;

    RETURN total;

END;

$$;


ALTER FUNCTION public.total_produtos_estoque() OWNER TO postgres;

--
-- TOC entry 262 (class 1255 OID 17299)
-- Name: validar_cpf(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_cpf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN

    IF NEW.cpf IS NULL OR NEW.cpf = '' THEN
        RAISE EXCEPTION 'CPF não pode ser vazio.';
    END IF;

    RETURN NEW;

END;
$$;


ALTER FUNCTION public.validar_cpf() OWNER TO postgres;

--
-- TOC entry 243 (class 1255 OID 17433)
-- Name: verificar_estoque_minimo(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.verificar_estoque_minimo() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    IF NEW.quantidade_atual <= NEW.quantidade_minima THEN

        RAISE NOTICE
        'ATENÇÃO: estoque baixo para o produto %',
        NEW.nome;

    END IF;

    RETURN NEW;

END;

$$;


ALTER FUNCTION public.verificar_estoque_minimo() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 17300)
-- Name: anamneses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.anamneses (
    id_anamnese integer NOT NULL,
    id_paciente integer NOT NULL,
    motivo_consulta text,
    tempo_problema character varying(100),
    fez_terapia boolean,
    tempo_terapia character varying(100),
    doencas_fisicas text,
    uso_medicamentos text,
    historico_psiquiatrico text,
    medicacao_controlada text,
    doencas_mentais_familia text,
    relacao_familiar text,
    sono text,
    alimentacao text,
    uso_alcool_drogas text,
    atividade_fisica text,
    ansiedade character varying(20),
    humor text,
    estresse text,
    pensamentos_recorrentes text,
    objetivo_terapia text,
    observacoes_psicologo text,
    data_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.anamneses OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17308)
-- Name: anamneses_id_anamnese_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.anamneses_id_anamnese_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.anamneses_id_anamnese_seq OWNER TO postgres;

--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 220
-- Name: anamneses_id_anamnese_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.anamneses_id_anamnese_seq OWNED BY public.anamneses.id_anamnese;


--
-- TOC entry 221 (class 1259 OID 17309)
-- Name: consultas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultas (
    id_consulta integer NOT NULL,
    id_paciente integer NOT NULL,
    id_psicologo integer NOT NULL,
    data_consulta date NOT NULL,
    horario time without time zone NOT NULL,
    status_consulta character varying(50),
    observacoes text,
    tipo_atendimento character varying(30)
);


ALTER TABLE public.consultas OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17319)
-- Name: consultas_id_consulta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consultas_id_consulta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consultas_id_consulta_seq OWNER TO postgres;

--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 222
-- Name: consultas_id_consulta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consultas_id_consulta_seq OWNED BY public.consultas.id_consulta;


--
-- TOC entry 223 (class 1259 OID 17320)
-- Name: contatos_emergencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contatos_emergencia (
    id_contato integer NOT NULL,
    id_paciente integer NOT NULL,
    nome character varying(150),
    telefone character varying(20),
    relacao character varying(100)
);


ALTER TABLE public.contatos_emergencia OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17325)
-- Name: contatos_emergencia_id_contato_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contatos_emergencia_id_contato_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contatos_emergencia_id_contato_seq OWNER TO postgres;

--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 224
-- Name: contatos_emergencia_id_contato_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contatos_emergencia_id_contato_seq OWNED BY public.contatos_emergencia.id_contato;


--
-- TOC entry 235 (class 1259 OID 17407)
-- Name: despesas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.despesas (
    id_despesa integer NOT NULL,
    data_despesa date NOT NULL,
    descricao text,
    categoria character varying(100),
    valor numeric(10,2)
);


ALTER TABLE public.despesas OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17406)
-- Name: despesas_id_despesa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.despesas_id_despesa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.despesas_id_despesa_seq OWNER TO postgres;

--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 234
-- Name: despesas_id_despesa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.despesas_id_despesa_seq OWNED BY public.despesas.id_despesa;


--
-- TOC entry 237 (class 1259 OID 17418)
-- Name: estoque; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estoque (
    id_produto integer NOT NULL,
    nome character varying(150) NOT NULL,
    categoria character varying(100),
    quantidade_atual integer,
    quantidade_minima integer,
    data_entrada date DEFAULT CURRENT_DATE,
    fornecedor character varying(150)
);


ALTER TABLE public.estoque OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17417)
-- Name: estoque_id_produto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estoque_id_produto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estoque_id_produto_seq OWNER TO postgres;

--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 236
-- Name: estoque_id_produto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estoque_id_produto_seq OWNED BY public.estoque.id_produto;


--
-- TOC entry 225 (class 1259 OID 17326)
-- Name: pacientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pacientes (
    id_paciente integer NOT NULL,
    nome_completo character varying(150) NOT NULL,
    data_nascimento date,
    idade integer,
    cpf character varying(14) NOT NULL,
    telefone character varying(20),
    email character varying(100),
    endereco text,
    profissao character varying(100),
    estado_civil character varying(50)
);


ALTER TABLE public.pacientes OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17334)
-- Name: pacientes_id_paciente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pacientes_id_paciente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pacientes_id_paciente_seq OWNER TO postgres;

--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 226
-- Name: pacientes_id_paciente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pacientes_id_paciente_seq OWNED BY public.pacientes.id_paciente;


--
-- TOC entry 227 (class 1259 OID 17335)
-- Name: pagamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagamentos (
    id_pagamento integer NOT NULL,
    id_consulta integer NOT NULL,
    valor numeric(10,2),
    forma_pagamento character varying(50),
    status_pagamento character varying(50),
    data_pagamento date
);


ALTER TABLE public.pagamentos OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17340)
-- Name: pagamentos_id_pagamento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagamentos_id_pagamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagamentos_id_pagamento_seq OWNER TO postgres;

--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 228
-- Name: pagamentos_id_pagamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagamentos_id_pagamento_seq OWNED BY public.pagamentos.id_pagamento;


--
-- TOC entry 229 (class 1259 OID 17341)
-- Name: psicologos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.psicologos (
    id_psicologo integer NOT NULL,
    nome character varying(150) NOT NULL,
    crp character varying(20) NOT NULL,
    especialidade character varying(100),
    telefone character varying(20),
    email character varying(100)
);


ALTER TABLE public.psicologos OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17347)
-- Name: psicologos_id_psicologo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.psicologos_id_psicologo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.psicologos_id_psicologo_seq OWNER TO postgres;

--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 230
-- Name: psicologos_id_psicologo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.psicologos_id_psicologo_seq OWNED BY public.psicologos.id_psicologo;


--
-- TOC entry 231 (class 1259 OID 17348)
-- Name: vw_ansiedade_intensa; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_ansiedade_intensa AS
 SELECT p.nome_completo,
    p.telefone,
    p.email,
    a.ansiedade,
    a.humor,
    a.estresse
   FROM (public.pacientes p
     JOIN public.anamneses a ON ((p.id_paciente = a.id_paciente)))
  WHERE (lower((a.ansiedade)::text) = 'intensa'::text);


ALTER VIEW public.vw_ansiedade_intensa OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17353)
-- Name: vw_contatos_emergencia; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_contatos_emergencia AS
 SELECT p.nome_completo,
    p.telefone AS telefone_paciente,
    c.nome AS contato_emergencia,
    c.telefone AS telefone_contato,
    c.relacao
   FROM (public.pacientes p
     JOIN public.contatos_emergencia c ON ((p.id_paciente = c.id_paciente)));


ALTER VIEW public.vw_contatos_emergencia OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17427)
-- Name: vw_estoque_baixo; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_estoque_baixo AS
 SELECT nome,
    categoria,
    quantidade_atual,
    quantidade_minima,
    fornecedor
   FROM public.estoque
  WHERE (quantidade_atual <= quantidade_minima);


ALTER VIEW public.vw_estoque_baixo OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17357)
-- Name: vw_relatorio_anamnese; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_relatorio_anamnese AS
 SELECT p.id_paciente,
    p.nome_completo,
    p.idade,
    p.cpf,
    p.telefone,
    a.id_anamnese,
    a.motivo_consulta,
    a.tempo_problema,
    a.ansiedade,
    a.humor,
    a.estresse,
    a.objetivo_terapia,
    a.data_cadastro
   FROM (public.pacientes p
     JOIN public.anamneses a ON ((p.id_paciente = a.id_paciente)));


ALTER VIEW public.vw_relatorio_anamnese OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 17441)
-- Name: vw_relatorio_estoque; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_relatorio_estoque AS
 SELECT id_produto,
    nome,
    categoria,
    quantidade_atual,
    quantidade_minima,
    fornecedor,
        CASE
            WHEN (quantidade_atual <= quantidade_minima) THEN 'ESTOQUE BAIXO'::text
            ELSE 'ESTOQUE NORMAL'::text
        END AS status_estoque
   FROM public.estoque;


ALTER VIEW public.vw_relatorio_estoque OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17436)
-- Name: vw_resumo_financeiro; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_resumo_financeiro AS
 SELECT ( SELECT COALESCE(sum(pagamentos.valor), (0)::numeric) AS "coalesce"
           FROM public.pagamentos
          WHERE ((pagamentos.status_pagamento)::text = 'Pago'::text)) AS total_receitas,
    ( SELECT COALESCE(sum(despesas.valor), (0)::numeric) AS "coalesce"
           FROM public.despesas) AS total_despesas,
    (( SELECT COALESCE(sum(pagamentos.valor), (0)::numeric) AS "coalesce"
           FROM public.pagamentos
          WHERE ((pagamentos.status_pagamento)::text = 'Pago'::text)) - ( SELECT COALESCE(sum(despesas.valor), (0)::numeric) AS "coalesce"
           FROM public.despesas)) AS lucro_liquido;


ALTER VIEW public.vw_resumo_financeiro OWNER TO postgres;

--
-- TOC entry 4926 (class 2604 OID 17362)
-- Name: anamneses id_anamnese; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anamneses ALTER COLUMN id_anamnese SET DEFAULT nextval('public.anamneses_id_anamnese_seq'::regclass);


--
-- TOC entry 4928 (class 2604 OID 17363)
-- Name: consultas id_consulta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas ALTER COLUMN id_consulta SET DEFAULT nextval('public.consultas_id_consulta_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 17364)
-- Name: contatos_emergencia id_contato; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contatos_emergencia ALTER COLUMN id_contato SET DEFAULT nextval('public.contatos_emergencia_id_contato_seq'::regclass);


--
-- TOC entry 4933 (class 2604 OID 17410)
-- Name: despesas id_despesa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas ALTER COLUMN id_despesa SET DEFAULT nextval('public.despesas_id_despesa_seq'::regclass);


--
-- TOC entry 4934 (class 2604 OID 17421)
-- Name: estoque id_produto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque ALTER COLUMN id_produto SET DEFAULT nextval('public.estoque_id_produto_seq'::regclass);


--
-- TOC entry 4930 (class 2604 OID 17365)
-- Name: pacientes id_paciente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes ALTER COLUMN id_paciente SET DEFAULT nextval('public.pacientes_id_paciente_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 17366)
-- Name: pagamentos id_pagamento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamentos ALTER COLUMN id_pagamento SET DEFAULT nextval('public.pagamentos_id_pagamento_seq'::regclass);


--
-- TOC entry 4932 (class 2604 OID 17367)
-- Name: psicologos id_psicologo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.psicologos ALTER COLUMN id_psicologo SET DEFAULT nextval('public.psicologos_id_psicologo_seq'::regclass);


--
-- TOC entry 5116 (class 0 OID 17300)
-- Dependencies: 219
-- Data for Name: anamneses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.anamneses (id_anamnese, id_paciente, motivo_consulta, tempo_problema, fez_terapia, tempo_terapia, doencas_fisicas, uso_medicamentos, historico_psiquiatrico, medicacao_controlada, doencas_mentais_familia, relacao_familiar, sono, alimentacao, uso_alcool_drogas, atividade_fisica, ansiedade, humor, estresse, pensamentos_recorrentes, objetivo_terapia, observacoes_psicologo, data_cadastro) FROM stdin;
1	1	Ansiedade constante	6 meses	t	1 ano	Hipertensão	Antidepressivos	Ansiedade	Clonazepam	Depressão na família	Boa relação familiar	Sono irregular	Alimentação mediana	Álcool socialmente	Academia 3x por semana	moderada	Oscilando	Alto	Pensamentos negativos frequentes	Melhorar controle emocional	Paciente colaborativo	2026-05-15 15:54:18.768745
6	5	Crises de ansiedade	8 meses	f		Nenhuma	Nenhum	Nenhum	Nenhuma	Depressão familiar	Relação distante	Sono ruim	Boa	Não utiliza	Academia	intensa	Oscilando	Muito alto	Pensamentos negativos	Controlar ansiedade	Paciente demonstra nervosismo	2026-05-15 16:04:34.399032
7	6	Baixa autoestima	2 anos	t	3 meses	Diabetes	Insulina	Depressão	Fluoxetina	Histórico depressivo	Boa relação familiar	Sono regular	Boa alimentação	Não utiliza	Musculação	leve	Triste	Moderado	Autocrítica excessiva	Melhorar autoestima	Paciente colaborativo	2026-05-15 16:04:52.073192
8	7	Ansiedade social	1 ano	t	4 meses	Nenhuma	Nenhum	Ansiedade	Nenhuma	Casos familiares	Boa	Sono ruim	Regular	Álcool social	Academia	moderada	Oscilando	Alto	Pensamentos negativos	Melhorar socialização	Paciente tímido	2026-05-15 16:07:58.649429
9	8	Estresse profissional	2 anos	f		Hipertensão	Remédio pressão	Nenhum	Nenhuma	Ansiedade familiar	Boa	Pouco sono	Ruim	Não utiliza	Caminhada	intensa	Cansada	Muito alto	Preocupações constantes	Reduzir estresse	Paciente cansada	2026-05-15 16:07:58.649429
10	9	Baixa autoestima	8 meses	t	2 meses	Nenhuma	Nenhum	Depressão	Fluoxetina	Histórico depressivo	Relação distante	Sono irregular	Boa	Não utiliza	Musculação	leve	Triste	Moderado	Autocrítica	Melhorar autoestima	Paciente colaborativo	2026-05-15 16:07:58.649429
\.


--
-- TOC entry 5118 (class 0 OID 17309)
-- Dependencies: 221
-- Data for Name: consultas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultas (id_consulta, id_paciente, id_psicologo, data_consulta, horario, status_consulta, observacoes, tipo_atendimento) FROM stdin;
2	1	1	2026-05-23	14:00:00	Confirmado	Primeira consulta	Presencial
3	2	2	2026-05-23	09:00:00	Confirmado	Retorno	Online
4	4	3	2026-05-23	10:00:00	Agendado	Primeira sessão	Presencial
5	5	4	2026-05-23	11:00:00	Realizado	Sessão semanal	Online
6	6	5	2026-05-23	13:00:00	Confirmado	Acompanhamento	Presencial
7	7	1	2026-05-23	14:00:00	Cancelado	Paciente cancelou	Online
8	8	2	2026-05-23	15:00:00	Realizado	Sessão tranquila	Presencial
9	9	3	2026-05-23	16:00:00	Faltou	Paciente não compareceu	Online
10	10	4	2026-05-23	17:00:00	Confirmado	Avaliação inicial	Presencial
11	11	5	2026-05-23	18:00:00	Agendado	Primeira consulta	Online
\.


--
-- TOC entry 5120 (class 0 OID 17320)
-- Dependencies: 223
-- Data for Name: contatos_emergencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contatos_emergencia (id_contato, id_paciente, nome, telefone, relacao) FROM stdin;
1	1	João Oliveira	(81)90000-1111	Pai
2	2	Mariana Souza	(81)90000-2222	Esposa
3	4	Pedro Mendes	(81)90000-3333	Irmão
4	5	Luciana Alves	(81)90000-4444	Mãe
5	6	Fernanda Mendes	(81)91111-0000	Esposa
6	7	Carlos Henrique	(81)92222-0000	Pai
7	8	Julia Alves	(81)93333-0000	Mãe
8	9	Marcos Silva	(81)94444-0000	Irmão
9	10	Patricia Gomes	(81)95555-0000	Esposa
10	11	Sandra Rocha	(81)96666-0000	Mãe
11	12	Roberto Lima	(81)97777-0000	Pai
12	13	Clara Mendes	(81)98888-0000	Esposa
13	14	Joana Alves	(81)99999-0000	Irmã
14	15	Ricardo Costa	(81)90000-1234	Pai
15	16	Luciana Ribeiro	(81)90000-5678	Mãe
\.


--
-- TOC entry 5129 (class 0 OID 17407)
-- Dependencies: 235
-- Data for Name: despesas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.despesas (id_despesa, data_despesa, descricao, categoria, valor) FROM stdin;
1	2026-05-23	Aluguel da clínica	Aluguel	2500.00
2	2026-05-23	Conta de internet	Internet	120.00
3	2026-05-23	Compra de materiais	Material	350.00
4	2026-05-23	Anúncios Instagram	Marketing	200.00
5	2026-05-23	Produtos de limpeza	Outros	90.00
\.


--
-- TOC entry 5131 (class 0 OID 17418)
-- Dependencies: 237
-- Data for Name: estoque; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estoque (id_produto, nome, categoria, quantidade_atual, quantidade_minima, data_entrada, fornecedor) FROM stdin;
1	Papel A4	Papelaria	500	100	2026-05-23	Kalunga
4	Lenço de Papel	Higiene	80	20	2026-05-23	Higienex
5	Teste Psicológico Infantil	Testes Psicológicos	15	5	2026-05-23	PsiTools
6	Prancheta	Escritório	12	3	2026-05-23	OfficeMax
7	Marcador de Texto	Papelaria	30	10	2026-05-23	Faber Castell
8	Caderno de Anotações	Papelaria	40	10	2026-05-23	Tilibra
9	Sabonete Líquido	Higiene	25	5	2026-05-23	HigienePro
10	Máscaras Descartáveis	Higiene	100	20	2026-05-23	ProtecMed
2	Caneta Azul	Escritório	5	10	2026-05-23	Bic
11	Agenda Clínica	Escritório	25	5	2026-05-23	Papelaria Recife
3	Álcool Gel	Higiene	2	5	2026-05-23	Limpeza Total
\.


--
-- TOC entry 5122 (class 0 OID 17326)
-- Dependencies: 225
-- Data for Name: pacientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pacientes (id_paciente, nome_completo, data_nascimento, idade, cpf, telefone, email, endereco, profissao, estado_civil) FROM stdin;
1	Maria Oliveira	1998-05-10	\N	123.456.789-10	(81)99999-9999	maria@gmail.com	Rua A	Professora	Solteira
2	Carlos Souza	1995-08-15	30	987.654.321-00	(81)98888-8888	carlos@gmail.com	Rua B	Designer	Casado
4	João Pedro	1990-02-15	36	222.333.444-55	(81)98888-1111	joao@gmail.com	Rua das Flores	Professor	Casado
5	Ana Clara	2001-07-20	24	333.444.555-66	(81)97777-2222	ana@gmail.com	Av. Boa Viagem	Estudante	Solteira
6	Lucas Mendes	1985-10-08	40	444.555.666-77	(81)96666-3333	lucas@gmail.com	Rua Azul	Engenheiro	Divorciado
7	Bruno Henrique	1993-04-12	33	555.111.222-01	(81)91111-1111	bruno@gmail.com	Rua Sol	Motorista	Casado
8	Juliana Alves	1997-09-03	28	555.111.222-02	(81)92222-2222	juliana@gmail.com	Rua Lua	Advogada	Solteira
9	Ricardo Gomes	1988-11-21	37	555.111.222-03	(81)93333-3333	ricardo@gmail.com	Rua Mar	Professor	Divorciado
10	Camila Rocha	2000-06-18	25	555.111.222-04	(81)94444-4444	camila@gmail.com	Rua Verde	Designer	Solteira
11	Felipe Costa	1995-02-25	31	555.111.222-05	(81)95555-5555	felipe@gmail.com	Rua Azul	Programador	Solteiro
12	Patricia Lima	1982-01-15	44	555.111.222-06	(81)96666-6666	patricia@gmail.com	Rua Central	Enfermeira	Casada
13	Gabriel Souza	1999-07-30	26	555.111.222-07	(81)97777-7777	gabriel@gmail.com	Rua Nova	Estudante	Solteiro
14	Larissa Melo	1991-12-05	34	555.111.222-08	(81)98888-8888	larissa@gmail.com	Rua das Palmeiras	Arquiteta	Casada
15	Thiago Martins	1987-08-17	38	555.111.222-09	(81)99999-9999	thiago@gmail.com	Rua Esperança	Médico	Casado
16	Vanessa Ribeiro	1996-03-10	30	555.111.222-10	(81)90000-0000	vanessa@gmail.com	Rua Horizonte	Psicóloga	Solteira
\.


--
-- TOC entry 5124 (class 0 OID 17335)
-- Dependencies: 227
-- Data for Name: pagamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagamentos (id_pagamento, id_consulta, valor, forma_pagamento, status_pagamento, data_pagamento) FROM stdin;
3	2	180.00	Pix	Pago	2026-05-23
4	2	180.00	Pix	Pago	2026-05-23
5	3	200.00	Cartão	Pago	2026-05-23
6	4	150.00	Dinheiro	Pendente	2026-05-23
7	5	220.00	Pix	Pago	2026-05-23
8	6	180.00	Cartão	Pago	2026-05-23
9	7	160.00	Dinheiro	Pendente	2026-05-23
10	8	210.00	Pix	Pago	2026-05-23
11	9	190.00	Cartão	Pago	2026-05-23
12	10	170.00	Pix	Pago	2026-05-23
\.


--
-- TOC entry 5126 (class 0 OID 17341)
-- Dependencies: 229
-- Data for Name: psicologos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.psicologos (id_psicologo, nome, crp, especialidade, telefone, email) FROM stdin;
1	Dra. Mariana Alves	CRP-02/12345	Ansiedade e Depressão	(81)99999-0000	mariana@clinica.com
2	Dr. Carlos Henrique	CRP-02/54321	Terapia Cognitivo-Comportamental	(81)91111-1111	carlos@clinica.com
3	Dra. Fernanda Lima	CRP-02/67890	Psicologia Infantil	(81)92222-2222	fernanda@clinica.com
4	Dr. Rafael Souza	CRP-02/11223	Ansiedade e Estresse	(81)93333-3333	rafael@clinica.com
5	Dra. Juliana Rocha	CRP-02/44556	Psicanálise	(81)94444-4444	juliana@clinica.com
\.


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 220
-- Name: anamneses_id_anamnese_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.anamneses_id_anamnese_seq', 10, true);


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 222
-- Name: consultas_id_consulta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consultas_id_consulta_seq', 11, true);


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 224
-- Name: contatos_emergencia_id_contato_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contatos_emergencia_id_contato_seq', 15, true);


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 234
-- Name: despesas_id_despesa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.despesas_id_despesa_seq', 5, true);


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 236
-- Name: estoque_id_produto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estoque_id_produto_seq', 11, true);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 226
-- Name: pacientes_id_paciente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pacientes_id_paciente_seq', 16, true);


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 228
-- Name: pagamentos_id_pagamento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagamentos_id_pagamento_seq', 12, true);


--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 230
-- Name: psicologos_id_psicologo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.psicologos_id_psicologo_seq', 5, true);


--
-- TOC entry 4937 (class 2606 OID 17369)
-- Name: anamneses anamneses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anamneses
    ADD CONSTRAINT anamneses_pkey PRIMARY KEY (id_anamnese);


--
-- TOC entry 4939 (class 2606 OID 17371)
-- Name: consultas consultas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas
    ADD CONSTRAINT consultas_pkey PRIMARY KEY (id_consulta);


--
-- TOC entry 4941 (class 2606 OID 17373)
-- Name: contatos_emergencia contatos_emergencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contatos_emergencia
    ADD CONSTRAINT contatos_emergencia_pkey PRIMARY KEY (id_contato);


--
-- TOC entry 4953 (class 2606 OID 17416)
-- Name: despesas despesas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas
    ADD CONSTRAINT despesas_pkey PRIMARY KEY (id_despesa);


--
-- TOC entry 4955 (class 2606 OID 17426)
-- Name: estoque estoque_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque
    ADD CONSTRAINT estoque_pkey PRIMARY KEY (id_produto);


--
-- TOC entry 4943 (class 2606 OID 17375)
-- Name: pacientes pacientes_cpf_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_cpf_key UNIQUE (cpf);


--
-- TOC entry 4945 (class 2606 OID 17377)
-- Name: pacientes pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id_paciente);


--
-- TOC entry 4947 (class 2606 OID 17379)
-- Name: pagamentos pagamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamentos
    ADD CONSTRAINT pagamentos_pkey PRIMARY KEY (id_pagamento);


--
-- TOC entry 4949 (class 2606 OID 17381)
-- Name: psicologos psicologos_crp_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.psicologos
    ADD CONSTRAINT psicologos_crp_key UNIQUE (crp);


--
-- TOC entry 4951 (class 2606 OID 17383)
-- Name: psicologos psicologos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.psicologos
    ADD CONSTRAINT psicologos_pkey PRIMARY KEY (id_psicologo);


--
-- TOC entry 4960 (class 2620 OID 17384)
-- Name: pacientes trg_calcular_idade; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_calcular_idade BEFORE INSERT ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.fn_calcular_idade();


--
-- TOC entry 4961 (class 2620 OID 17385)
-- Name: pacientes trg_validar_cpf; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_validar_cpf BEFORE INSERT ON public.pacientes FOR EACH ROW EXECUTE FUNCTION public.validar_cpf();


--
-- TOC entry 4962 (class 2620 OID 17434)
-- Name: estoque trg_verificar_estoque; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_verificar_estoque BEFORE INSERT OR UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION public.verificar_estoque_minimo();


--
-- TOC entry 4959 (class 2606 OID 17386)
-- Name: pagamentos fk_consulta_pagamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamentos
    ADD CONSTRAINT fk_consulta_pagamento FOREIGN KEY (id_consulta) REFERENCES public.consultas(id_consulta);


--
-- TOC entry 4956 (class 2606 OID 17391)
-- Name: anamneses fk_paciente_anamnese; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anamneses
    ADD CONSTRAINT fk_paciente_anamnese FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id_paciente) ON DELETE CASCADE;


--
-- TOC entry 4958 (class 2606 OID 17396)
-- Name: contatos_emergencia fk_paciente_contato; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contatos_emergencia
    ADD CONSTRAINT fk_paciente_contato FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id_paciente) ON DELETE CASCADE;


--
-- TOC entry 4957 (class 2606 OID 17401)
-- Name: consultas fk_psicologo_consulta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultas
    ADD CONSTRAINT fk_psicologo_consulta FOREIGN KEY (id_psicologo) REFERENCES public.psicologos(id_psicologo);


-- Completed on 2026-05-23 13:26:15

--
-- PostgreSQL database dump complete
--

\unrestrict AOyHDuzhateFarVaH2QZuKxHUg5sQd3WP3BnYUG2XKFG1u1FOjOgFTaKaB93uWR


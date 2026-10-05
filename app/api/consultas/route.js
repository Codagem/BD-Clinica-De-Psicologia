import pool from "@/lib/db";
import { verificarSessao } from "@/lib/sessao";
import { registrarAuditoria } from "@/lib/auditoria";

async function obterSessao(req) {
  const cookie = req.headers.get("cookie") || "";

  const sessaoCookie = cookie
    .split(";")
    .find((item) => item.trim().startsWith("sessao="));

  const token = sessaoCookie
    ? sessaoCookie.trim().substring("sessao=".length)
    : null;

  return await verificarSessao(token);
}

function respostaNaoAutorizado(
  mensagem = "Acesso não autorizado."
) {
  return Response.json(
    {
      erro: mensagem,
    },
    {
      status: 403,
    }
  );
}

function respostaDadosInvalidos(
  mensagem = "Dados inválidos."
) {
  return Response.json(
    {
      erro: mensagem,
    },
    {
      status: 400,
    }
  );
}


/* =========================================================
   GET — LISTAR CONSULTAS
   ========================================================= */

export async function GET(req) {

  try {

    const sessao = await obterSessao(req);

    if (!sessao) {
      return respostaNaoAutorizado();
    }


    if (
      sessao.tipo_usuario !== "admin" &&
      sessao.tipo_usuario !== "psicologo" &&
      sessao.tipo_usuario !== "estagiario"
    ) {
      return respostaNaoAutorizado(
        "Você não possui permissão para acessar as consultas."
      );
    }


    let query = `
      SELECT
        c.id_consulta,
        c.id_paciente,
        c.id_psicologo,
        p.nome_completo AS paciente,
        ps.nome AS psicologo,
        c.data_consulta,
        c.horario,
        c.status_consulta,
        c.tipo_atendimento,
        c.observacoes

      FROM consultas c

      JOIN pacientes p
        ON c.id_paciente = p.id_paciente

      JOIN psicologos ps
        ON c.id_psicologo = ps.id_psicologo
    `;


    let parametros = [];


    if(sessao.tipo_usuario === "estagiario") {

      query += `
        INNER JOIN estagiarios_pacientes ep
          ON ep.id_paciente = c.id_paciente

        WHERE ep.id_estagiario = $1
          AND ep.status = 'Ativo'
      `;


      parametros = [
        Number(sessao.id_estagiario)
      ];

    }


    query += `
      ORDER BY 
      c.data_consulta,
      c.horario
    `;


    const resultado = await pool.query(
      query,
      parametros
    );


    return Response.json(
      resultado.rows
    );


  } catch(error) {

    console.error(
      "Erro ao listar consultas:",
      error
    );


    return Response.json(
      {
        erro:"Erro ao carregar consultas."
      },
      {
        status:500
      }
    );

  }

}



/* =========================================================
   POST — CRIAR CONSULTA
   ========================================================= */

export async function POST(req) {


try {


  const sessao = await obterSessao(req);


  if(!sessao){

    return respostaNaoAutorizado();

  }



  if(
    sessao.tipo_usuario !== "admin" &&
    sessao.tipo_usuario !== "psicologo"
  ){

    return respostaNaoAutorizado(
      "Você não possui permissão para criar consultas."
    );

  }



  const body = await req.json();



  const {
    id_paciente,
    id_psicologo,
    data_consulta,
    horario,
    status_consulta,
    tipo_atendimento,
    observacoes

  } = body;



  if(
    !id_paciente ||
    !id_psicologo ||
    !data_consulta ||
    !horario
  ){

    return respostaDadosInvalidos(
      "Paciente, psicólogo, data e horário são obrigatórios."
    );

  }



  const pacienteId = Number(id_paciente);
  const psicologoId = Number(id_psicologo);



  const pacienteExiste = await pool.query(
    `
    SELECT id_paciente
    FROM pacientes
    WHERE id_paciente=$1
    LIMIT 1
    `,
    [
      pacienteId
    ]
  );



  if(
    pacienteExiste.rows.length === 0
  ){

    return respostaDadosInvalidos(
      "Paciente não encontrado."
    );

  }




  const psicologoExiste = await pool.query(
    `
    SELECT id_psicologo
    FROM psicologos
    WHERE id_psicologo=$1
    LIMIT 1
    `,
    [
      psicologoId
    ]
  );



  if(
    psicologoExiste.rows.length === 0
  ){

    return respostaDadosInvalidos(
      "Psicólogo não encontrado."
    );

  }



  const resultado = await pool.query(
    `
    INSERT INTO consultas
    (
      id_paciente,
      id_psicologo,
      data_consulta,
      horario,
      status_consulta,
      tipo_atendimento,
      observacoes
    )

    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    )

    RETURNING *
    `,
    [

      pacienteId,
      psicologoId,
      data_consulta,
      horario,
      status_consulta || "Agendada",
      tipo_atendimento || null,
      observacoes || null

    ]
  );



  const consulta = resultado.rows[0];



  await registrarAuditoria({

    tipo_usuario:sessao.tipo_usuario,

    id_usuario:
      sessao.tipo_usuario === "psicologo"
      ? sessao.id_psicologo
      : null,

    acao:"CRIAR_CONSULTA",

    tabela_afetada:"consultas",

    registro_id:
      consulta.id_consulta,

    detalhes:
      `Consulta criada para paciente ${pacienteId}.`

  });



  return Response.json(

    {
      mensagem:"Consulta criada com sucesso.",
      consulta
    },

    {
      status:201
    }

  );



} catch(error) {


  console.error(
    "ERRO COMPLETO AO CRIAR CONSULTA:",
    error
  );



  if(
    error.message?.includes(
      "O psicólogo já possui uma consulta neste horário."
    )
  ){

    return Response.json(
      {
        erro:error.message
      },
      {
        status:400
      }
    );

  }



  return Response.json(
    {
      erro:error.message
    },
    {
      status:500
    }
  );


}

}
/* =========================================================
   PUT — ATUALIZAR CONSULTA
   ========================================================= */

export async function PUT(req) {

  try {


    const sessao = await obterSessao(req);


    if(!sessao){

      return respostaNaoAutorizado();

    }



    if(
      sessao.tipo_usuario !== "admin" &&
      sessao.tipo_usuario !== "psicologo"
    ){

      return respostaNaoAutorizado(
        "Você não possui permissão para alterar consultas."
      );

    }



    const body = await req.json();



    const idConsulta = Number(
      body.id_consulta
    );



    if(
      !Number.isInteger(idConsulta)
    ){

      return respostaDadosInvalidos(
        "ID da consulta inválido."
      );

    }



    const consultaExiste = await pool.query(
      `
      SELECT *
      FROM consultas
      WHERE id_consulta=$1
      LIMIT 1
      `,
      [
        idConsulta
      ]
    );



    if(
      consultaExiste.rows.length === 0
    ){

      return Response.json(
        {
          erro:"Consulta não encontrada."
        },
        {
          status:404
        }
      );

    }



    const resultado = await pool.query(

      `
      UPDATE consultas

      SET

        id_paciente =
          COALESCE($1,id_paciente),

        id_psicologo =
          COALESCE($2,id_psicologo),

        data_consulta =
          COALESCE($3,data_consulta),

        horario =
          COALESCE($4,horario),

        status_consulta =
          COALESCE($5,status_consulta),

        tipo_atendimento =
          COALESCE($6,tipo_atendimento),

        observacoes =
          COALESCE($7,observacoes)


      WHERE id_consulta=$8


      RETURNING *

      `,

      [

        body.id_paciente ?? null,

        body.id_psicologo ?? null,

        body.data_consulta ?? null,

        body.horario ?? null,

        body.status_consulta ?? null,

        body.tipo_atendimento ?? null,

        body.observacoes ?? null,

        idConsulta

      ]

    );



    const consulta =
      resultado.rows[0];



    await registrarAuditoria({

      tipo_usuario:sessao.tipo_usuario,

      id_usuario:
        sessao.tipo_usuario === "psicologo"
        ? sessao.id_psicologo
        : null,


      acao:"ALTERAR_CONSULTA",

      tabela_afetada:"consultas",

      registro_id:idConsulta,


      detalhes:
        `Consulta ${idConsulta} alterada.`

    });



    return Response.json({

      mensagem:
        "Consulta atualizada com sucesso.",

      consulta

    });



  } catch(error){



    console.error(
      "Erro ao atualizar consulta:",
      error
    );



    if(
      error.message?.includes(
        "O psicólogo já possui uma consulta neste horário."
      )
    ){

      return Response.json(
        {
          erro:error.message
        },
        {
          status:400
        }
      );

    }



    return Response.json(

      {
        erro:
          "Erro ao atualizar consulta.",
        detalhe:
          error.message
      },

      {
        status:500
      }

    );

  }

}





/* =========================================================
   DELETE — EXCLUIR CONSULTA
   ========================================================= */

export async function DELETE(req){


try{


  const sessao = await obterSessao(req);



  if(!sessao){

    return respostaNaoAutorizado();

  }




  if(
    sessao.tipo_usuario !== "admin" &&
    sessao.tipo_usuario !== "psicologo"
  ){

    return respostaNaoAutorizado(
      "Você não possui permissão para excluir consultas."
    );

  }



  const body = await req.json();



  const idConsulta =
    Number(body.id_consulta);



  if(
    !Number.isInteger(idConsulta)
  ){

    return respostaDadosInvalidos(
      "ID da consulta inválido."
    );

  }



  const consultaExiste = await pool.query(

    `
    SELECT id_consulta
    FROM consultas
    WHERE id_consulta=$1
    LIMIT 1
    `,

    [
      idConsulta
    ]

  );



  if(
    consultaExiste.rows.length === 0
  ){

    return Response.json(

      {
        erro:
          "Consulta não encontrada."
      },

      {
        status:404
      }

    );

  }




  await pool.query(

    `
    DELETE FROM consultas
    WHERE id_consulta=$1
    `,

    [
      idConsulta
    ]

  );




  await registrarAuditoria({

    tipo_usuario:
      sessao.tipo_usuario,


    id_usuario:

      sessao.tipo_usuario === "psicologo"

      ? sessao.id_psicologo

      : null,



    acao:
      "EXCLUIR_CONSULTA",



    tabela_afetada:
      "consultas",



    registro_id:
      idConsulta,



    detalhes:
      `Consulta ${idConsulta} excluída.`

  });




  return Response.json({

    mensagem:
      "Consulta excluída com sucesso."

  });




}catch(error){


  console.error(
    "Erro ao excluir consulta:",
    error
  );



  return Response.json(

    {
      erro:
        "Erro ao excluir consulta.",

      detalhe:
        error.message
    },

    {
      status:500
    }

  );


}


}
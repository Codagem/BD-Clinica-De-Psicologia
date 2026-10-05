import pool from "@/lib/db";

export async function registrarAuditoria({
  tipoUsuario,
  idUsuario,
  acao,
  tabelaAfetada,
  registroId,
  detalhes,
}) {
  try {
    await pool.query(
      `
      INSERT INTO auditoria (
        tipo_usuario,
        id_usuario,
        acao,
        tabela_afetada,
        registro_id,
        detalhes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        tipoUsuario,
        idUsuario || null,
        acao,
        tabelaAfetada || null,
        registroId || null,
        detalhes || null,
      ]
    );
    } catch (error) {
    console.error("ERRO AUDITORIA - mensagem:", error.message);
    console.error("ERRO AUDITORIA - código:", error.code);
    console.error("ERRO AUDITORIA - detalhe:", error.detail);
    console.error("ERRO AUDITORIA - tabela:", error.table);
  }
}
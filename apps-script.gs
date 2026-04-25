/**
 * Soci — Waitlist backend (Google Apps Script)
 * Recebe POST JSON (text/plain) do formulário e grava na planilha ativa.
 *
 * Como ativar:
 *  1. Crie uma planilha nova no Google Sheets (nome sugerido: "Soci — Waitlist").
 *  2. Menu: Extensões → Apps Script.
 *  3. Apague o conteúdo do editor e cole este arquivo inteiro.
 *  4. Salve (Ctrl+S), dê um nome ao projeto (ex: "Soci Waitlist API").
 *  5. Clique em "Implantar" → "Nova implantação" → tipo "Aplicativo da Web".
 *  6. Executar como: "Eu" (sua conta).
 *  7. Quem tem acesso: "Qualquer pessoa".
 *  8. Copie a URL "/exec" gerada — essa é a ENDPOINT_URL do index.html.
 */

const SHEET_NAME = "Respostas";

// Cabeçalhos da aba (ordem importa — campos novos sempre no FIM
// pra não misalinhar dados ja gravados em deploys anteriores)
const HEADERS = [
  "timestamp_envio",
  "nome",
  "idade",
  "origem",
  "email",
  "email_aviso_lancamento",
  "email_atualizacoes",
  "whatsapp",
  "whatsapp_digits",
  "whats_aviso_lancamento",
  "whats_atualizacoes",
  "pagina",
  "user_agent",
  "ip_hash",
  "origem_detalhe"
];

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch (_) { payload = e.parameter || {}; }
    } else {
      payload = (e && e.parameter) || {};
    }

    // Honeypot — se preenchido, descarta silenciosamente
    if (payload.empresa_hp) {
      return _json({ ok: true });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }

    const row = [
      payload.timestamp || new Date().toISOString(),
      (payload.nome || "").toString().slice(0, 200),
      payload.idade || "",
      payload.origem || "",
      (payload.email || "").toString().slice(0, 200),
      payload.email_lancamento || "",
      payload.email_atualizacoes || "",
      (payload.whatsapp || "").toString().slice(0, 30),
      (payload.whatsapp_digits || "").toString().slice(0, 20),
      payload.whats_lancamento || "",
      payload.whats_atualizacoes || "",
      (payload.pagina || "").toString().slice(0, 500),
      (payload.user_agent || "").toString().slice(0, 500),
      "", // ip_hash — Apps Script não expõe IP diretamente
      (payload.origem_detalhe || "").toString().slice(0, 200)
    ];

    sheet.appendRow(row);

    return _json({ ok: true });
  } catch (err) {
    console.error(err);
    return _json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return _json({
    ok: true,
    service: "soci-waitlist",
    message: "Use POST para enviar cadastro."
  });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

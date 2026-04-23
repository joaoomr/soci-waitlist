# Soci — Waitlist | Setup & Deploy

Página de captação pré-lançamento. Stack: HTML/CSS/JS puro + Google Apps Script + Google Sheets.

---

## 1. Página (já está online)

O deploy foi feito via **GitHub Pages**. URL ativa no topo da mensagem do chat.

Para atualizar:
```bash
cd soci-waitlist
git add -A
git commit -m "update: <descricao>"
git push
```
GitHub Pages republica automático em ~30s.

---

## 2. Backend: Google Sheet + Apps Script (90 segundos)

> Enquanto você não fizer este passo, os cadastros ficam salvos apenas em `localStorage` do navegador do visitante (não chegam até você). Faça este passo **antes de divulgar**.

### 2.1 — Crie a planilha
1. Abra https://sheets.new (cria uma planilha em branco).
2. Renomeie pra algo como **"Soci — Waitlist"**.

### 2.2 — Cole o Apps Script
1. Na planilha: **Extensões → Apps Script**.
2. Apague tudo que estiver no editor.
3. Abra o arquivo `apps-script.gs` (está nesta pasta) e **copie todo o conteúdo**.
4. Cole no editor do Apps Script.
5. **Ctrl+S** para salvar. Dê um nome ao projeto (ex: *Soci Waitlist API*).

### 2.3 — Publique como Web App
1. Clique em **Implantar** (botão azul, canto superior direito) → **Nova implantação**.
2. Engrenagem ao lado de "Selecionar tipo" → **Aplicativo da Web**.
3. Preencha:
   - **Descrição:** `Soci Waitlist v1`
   - **Executar como:** `Eu (seu@gmail.com)`
   - **Quem tem acesso:** `Qualquer pessoa`
4. **Implantar**.
5. Autorize o acesso (vai pedir permissão pra escrever na planilha).
6. Copie a **URL do Web App** (termina em `/exec`).

### 2.4 — Conecte a página ao backend
1. Abra `index.html` nesta pasta.
2. Procure a linha:
   ```js
   const ENDPOINT_URL = "__APPS_SCRIPT_URL__";
   ```
3. Substitua pela URL `/exec` que você copiou:
   ```js
   const ENDPOINT_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
   ```
4. Commit + push:
   ```bash
   git add index.html
   git commit -m "config: endpoint backend"
   git push
   ```

Pronto. Toda submissão cai direto na aba **"Respostas"** da sua planilha.

---

## 3. Estrutura de dados (colunas da planilha)

Ordem exata na aba `Respostas`:

| # | Coluna | Origem | Observação |
|---|---|---|---|
| 1 | `timestamp_envio` | ISO 8601 | gerado no client |
| 2 | `nome` | texto | obrigatório |
| 3 | `idade` | number | 13–120 |
| 4 | `origem` | select | instagram, linkedin, indicacao, amigos, evento, outro |
| 5 | `email` | email | opcional — exigido se marcou avisos por e-mail |
| 6 | `email_aviso_lancamento` | "sim"/"" | checkbox |
| 7 | `email_atualizacoes` | "sim"/"" | checkbox |
| 8 | `whatsapp` | formatado `(DD) 9XXXX-XXXX` | display |
| 9 | `whatsapp_digits` | só dígitos | pronto pra integrar com API WhatsApp |
| 10 | `whats_aviso_lancamento` | "sim"/"" | checkbox |
| 11 | `whats_atualizacoes` | "sim"/"" | checkbox |
| 12 | `pagina` | URL | útil pra UTMs futuros |
| 13 | `user_agent` | string | diagnóstico |
| 14 | `ip_hash` | vazio | campo reservado |

Esse layout é amigável pra importar em **Supabase**, **Airtable**, **HubSpot**, **n8n**, **Zapier** ou **Make**.

---

## 4. Melhorias rápidas (quando quiser)

- **UTMs**: adicionar `utm_source/medium/campaign` à página e salvar junto.
- **Domínio próprio**: no GitHub Pages → Settings → Pages → Custom domain (ex: `acompanhe.soci.app`). Configure CNAME apontando pro host do GitHub.
- **Notificação de novo cadastro**: no Apps Script, adicione `MailApp.sendEmail("voce@email.com", "Novo cadastro Soci", JSON.stringify(payload, null, 2))` dentro do `doPost`.
- **Dedup**: no Apps Script, antes de `appendRow`, checar se e-mail ou WhatsApp já existem e atualizar em vez de duplicar.
- **Validação server-side**: reforçar validação no Apps Script (regex de e-mail, dígitos do telefone).
- **reCAPTCHA v3**: se começar a receber spam, plugue Google reCAPTCHA v3 (invisível).

---

## 5. Troubleshooting

**"Os cadastros não aparecem na planilha"**
- Cheque que `ENDPOINT_URL` no `index.html` foi trocado pela URL real.
- Cheque que a implantação do Apps Script está com "Quem tem acesso = Qualquer pessoa".
- Cada vez que editar o Apps Script, **crie uma nova implantação** (ou use "Gerenciar implantações" → editar versão). A URL pode mudar.

**"Quero testar o backend direto"**
- Abra a URL `/exec` no navegador. Deve mostrar JSON: `{"ok":true,"service":"soci-waitlist","message":"..."}`.

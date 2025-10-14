# Crona — Agendador e Assinatura Digital

Versão neutra e melhorada do antigo projeto **Kanarô**, voltada a **agendamentos genéricos** (consultas, reuniões, aulas, eventos) com **assinatura digital** do termo.

## ✨ O que mudou
- Vocabulário 100% neutro (remove referências rituais/ayahuasca).
- Campos e textos atualizados: **agendamento** (slot), **local**, **LGPD** genérico.
- Arquitetura idêntica (HTML + Tailwind + JS + IMask + Canvas) para fácil migração.
- URLs das Edge Functions ficam em **constantes configuráveis** (`CRONA_*`).

## 🧩 Estrutura
```
crona/
  ├─ index.html           # Busca por CPF + seleção de data
  ├─ pages/
  │   ├─ termo.html       # Formulário completo + assinatura digital
  │   ├─ sucesso.html     # Confirmação
  │   └─ ja-assinou.html  # Usuário já assinou
  └─ assets/
      └─ js/
          └─ script.js    # Lógica de máscaras, assinatura e envio
```

## ⚙️ Configuração (Supabase Edge Functions)
Crie/aponte suas funções e ajuste as **constantes**:

- Em `index.html`:
  - `CRONA_FN_LOOKUP` — busca participante por CPF para o slot escolhido
  - `CRONA_LIST_URL` — lista de datas/slots disponíveis

- Em `assets/js/script.js`:
  - `CRONA_FN_SUBMIT` — grava assinatura e dados

> Dica: mantenha os payloads compatíveis com o que você já usa (basta adaptar os nomes de campos: `cerimonia_*` → `slot_*`).

## ▶️ Rodando localmente
Abra `index.html` no navegador (ou use o Live Server do VSCode).

## 📝 Licença
MIT — use livremente.

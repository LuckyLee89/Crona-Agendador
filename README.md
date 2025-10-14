# 🕓 Crona — Agendador e Assinatura Digital

**Crona** é uma aplicação web moderna para **agendamentos de eventos, reuniões ou atendimentos**, com fluxo completo de **cadastro**, **termo de consentimento** e **assinatura digital** via canvas.  
Desenvolvida em **HTML, TailwindCSS e JavaScript puro**, integra facilmente com **Supabase**, **APIs REST** ou qualquer backend customizado.

---

## 🚀 Funcionalidades

- ✅ Seleção de data e horário (slot)
- 🧾 Formulário completo de dados do participante
- ✍️ Assinatura digital (desenho ou nome digitado)
- 🔐 Termo de consentimento + LGPD
- 💾 Integração com Supabase Edge Functions
- 🎨 Layout responsivo com TailwindCSS

---

## 🧩 Estrutura do Projeto

```
crona/
├─ index.html              # Tela inicial (CPF + data)
├─ pages/
│  ├─ termo.html           # Formulário + assinatura
│  ├─ sucesso.html         # Confirmação de envio
│  └─ ja-assinou.html      # Mensagem de já assinado
└─ assets/
   └─ js/
      └─ script.js         # Lógica, máscaras e envio
```

---

## ⚙️ Configuração

No código, substitua as URLs das suas funções/API:

### Em `index.html`
```js
const CRONA_FN_LOOKUP = "https://YOUR_PROJECT.functions.supabase.co/lookup_cpf";
const CRONA_LIST_URL  = "https://YOUR_PROJECT.functions.supabase.co/list_slots";
```

### Em `assets/js/script.js`
```js
const CRONA_FN_SUBMIT = "https://YOUR_PROJECT.functions.supabase.co/submit_consent";
```

---

## 💻 Executando Localmente

1. Clone este repositório:
   ```bash
   git clone git@github.com:LuckyLee89/Crona-Agendador.git
   ```
2. Acesse a pasta:
   ```bash
   cd Crona-Agendador
   ```
3. Abra o arquivo `index.html` diretamente no navegador  
   *(ou use a extensão **Live Server** do VSCode).*

---

## 🧠 Tecnologias Utilizadas

- **HTML5**
- **TailwindCSS**
- **JavaScript Vanilla (ES6)**
- **IMask.js**
- **Canvas API**
- **Supabase Edge Functions (opcional)**

---

## 📸 Demonstração Visual (Opcional)
> Adicione aqui uma captura de tela da interface (ex: `assets/preview.png`)

---

## 🧾 Licença

Este projeto está sob a licença **MIT** — uso livre para fins pessoais e profissionais.  
Desenvolvido por [Lincon Antunes Pereira](https://github.com/LuckyLee89) 💡

---

### ⭐ Dica para Portfólio
O **Crona** é um excelente exemplo de aplicação **frontend pura** integrável a qualquer API.  
Você pode hospedá-lo gratuitamente no **GitHub Pages**, **Vercel** ou **Fly.io**.

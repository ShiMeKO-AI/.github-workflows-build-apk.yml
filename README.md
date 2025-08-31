# RH Physio SPA

Projeto estático preparado para Netlify e Supabase.

## Pré-requisitos
- Conta Supabase com projeto existente
- Autenticação por email ativada
- Substituir a ANON KEY no `assets/app.js` se necessário (já preenchida)

## Instalação
1. Abrir o editor SQL do Supabase e executar `sql/update_schema.sql`.
2. Fazer upload do conteúdo deste projeto para um novo site no Netlify (Deploy via upload).

## Utilização
- Registar novo utilizador via formulário.
- Fazer login e gerir Clínicas, Terapeutas, Cabines e Planeamento semanal.
- Exportar o planeamento para CSV através do botão correspondente.

## Netlify
O ficheiro `netlify.toml` inclui redirect SPA e cabeçalhos de segurança.

## FAQ
- **CORS**: utilizar o domínio fornecido pelo Netlify.
- **RLS**: todas as tabelas têm políticas para utilizadores autenticados.
- **Personalização**: editar `assets/styles.css` e o objeto `translations` em `assets/app.js`.
- **Adicionar clínicas**: utilizar o formulário em Dashboard > Clínicas.


# Passos Perdidos - Plataforma de Acompanhamento Legislativo

Uma aplicação web moderna para acompanhar iniciativas legislativas em Portugal, construída com Next.js, React e Tailwind CSS.

## Sobre o Projeto

Passos Perdidos fornece uma interface amigável para navegar, pesquisar e acompanhar propostas legislativas. A plataforma oferece opções abrangentes de filtragem, visualizações detalhadas das iniciativas e informações atualizadas sobre o estado de projetos de lei e propostas.

## Funcionalidades

- **Filtragem Avançada**: Filtre iniciativas legislativas por tipo, fase, autor e intervalo de datas.
- **Pesquisa em Tempo Real**: Pesquise em toda a base de dados de propostas legislativas.
- **Visualizações Detalhadas**: Informações completas sobre cada iniciativa.
- **Contexto de Partido Político**: Indicadores visuais do partido político por trás de cada iniciativa
- **Design Responsivo**: Interface totalmente adaptável que funciona em todos os dispositivos

## Stack 

- **Frontend**:
  - [Next.js](https://nextjs.org/) (App Router)
  - [React](https://reactjs.org/) com TypeScript
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/)
  - [date-fns](https://date-fns.org/) 
  - [Lucide React](https://lucide.dev/)

- **Backend**:
  - [Django](https://www.djangoproject.com/) para o servidor de aplicação
  - [Django Rest Framework (DRF)](https://www.django-rest-framework.org/) para construção da API
  - Sistema de autenticação baseado em JWT

- **Integração com API**:
  - Consumo de API RESTful
  - Autenticação JWT
  - Tratamento de paginação
  - Tratamento de erros e tentativas de reconexão
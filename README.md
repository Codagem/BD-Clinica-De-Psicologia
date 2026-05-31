<h1 align="center">🧠 BD Clínica de Psicologia</h1>

<p align="center">
Banco de dados desenvolvido para gerenciamento administrativo, clínico e financeiro de uma clínica de psicologia.
</p>

<p align="center">
<img src="https://img.shields.io/badge/PostgreSQL-18-blue?style=for-the-badge&logo=postgresql">
<img src="https://img.shields.io/badge/PLpgSQL-SQL-336791?style=for-the-badge">
<img src="https://img.shields.io/badge/Status-Funcional-success?style=for-the-badge">
</p>

<hr>

<h2>📌 Sobre o projeto</h2>

<p>
Este projeto consiste em um banco de dados relacional desenvolvido em PostgreSQL com o objetivo de centralizar o gerenciamento de uma clínica de psicologia.
</p>

<p>
A estrutura foi planejada para atender tanto a parte clínica quanto a administrativa da clínica, permitindo controlar pacientes, psicólogos, consultas, anamneses, pagamentos, despesas e estoque interno de forma integrada.
</p>

<p>
Além das tabelas relacionais, o projeto também utiliza procedures, functions, triggers e views para automatizar processos, validar dados e facilitar a geração de relatórios.
</p>

<hr>

<h2>🗂️ Estrutura das Tabelas</h2>

<h3>👤 Pacientes</h3>
<p>Armazena os dados cadastrais dos pacientes atendidos pela clínica.</p>

<p align="center">
<img width="600" alt="tablea pac 2" src="https://github.com/user-attachments/assets/74d8d40f-7346-4b85-b146-6f5018d55d81" />
</p>

<hr>

<h3>🧑‍⚕️ Psicólogos</h3>
<p>Contém os dados dos profissionais responsáveis pelos atendimentos.</p>

<p align="center">
<img width="650" alt="Captura de tela 2026-05-26 223519" src="https://github.com/user-attachments/assets/b76f38b2-bb37-4bd5-9c14-668827e794d1" />
</p>

<hr>

<h3>📅 Consultas</h3>
<p>Registra agendamentos, retornos, atendimentos realizados, cancelados ou pendentes.</p>

<p align="center">
<img width="650" alt="Captura de tela 2026-05-26 223638" src="https://github.com/user-attachments/assets/98dd037e-46ba-46c2-bc02-b7e1c2d383a5" />
</p>

<hr>

<h3>📝 Anamneses</h3>
<p>
Tabela responsável pelo registro da avaliação clínica inicial dos pacientes, contendo informações psicológicas, emocionais e hábitos do dia a dia.
</p>

<p align="center">
<img width="700" alt="Captura de tela 2026-05-26 223844" src="https://github.com/user-attachments/assets/f9b93ae8-9d82-4862-be63-280f918ae29b" />
</p>

<hr>

<h3>💳 Pagamentos</h3>
<p>Controla os pagamentos vinculados às consultas realizadas.</p>

<p align="center">
<img width="600" alt="Captura de tela 2026-05-26 224048" src="https://github.com/user-attachments/assets/300f89ec-9557-47cc-a846-7407fa0062b1" />
</p>

<hr>

<h3>💰 Despesas</h3>
<p>Registra despesas administrativas e operacionais da clínica.</p>

<p align="center">
<img width="620" alt="Captura de tela 2026-05-26 224610" src="https://github.com/user-attachments/assets/50f3fb0c-f74a-4a18-9582-befb6a3812ba" />
</p>

<hr>

<h3>📦 Estoque</h3>
<p>Gerencia materiais utilizados no funcionamento interno da clínica.</p>

<p align="center">
<img width="650" alt="Captura de tela 2026-05-26 224716" src="https://github.com/user-attachments/assets/d0fdd73b-5656-4fab-b725-a0e649b6a3dc" />
</p>

<hr>

<h2>🔧 Functions</h2>

<p>
As functions foram criadas para automatizar cálculos e consultas recorrentes dentro do banco, reduzindo repetição de código SQL e facilitando o acesso rápido às informações.
</p>

<ul>
<li>
<b>calcular_idade(data_nascimento)</b><br>
Recebe a data de nascimento do paciente e retorna sua idade automaticamente.
</li>

<li>
<b>fn_calcular_idade()</b><br>
Função utilizada internamente pela trigger responsável por preencher a idade antes do insert do paciente.
</li>

<li>
<b>total_pacientes()</b><br>
Retorna a quantidade total de pacientes cadastrados no sistema.
</li>

<li>
<b>total_anamneses()</b><br>
Retorna o total de anamneses registradas.
</li>

<li>
<b>total_produtos_estoque()</b><br>
Retorna a quantidade total de produtos presentes no estoque.
</li>
</ul>

<p align="center">
<img width="600" alt="Captura de tela 2026-05-26 225856" src="https://github.com/user-attachments/assets/156ac43c-1742-4290-8ad1-ad2248809236" />
</p>

<hr>

<h2>⚡ Triggers</h2>

<p>
As triggers executam automaticamente ações antes ou depois de inserções e atualizações no banco, garantindo integridade e automação dos processos.
</p>

<ul>
<li>
<b>trg_calcular_idade</b><br>
Executada antes do cadastro de um paciente, calcula automaticamente sua idade com base na data de nascimento.
</li>

<li>
<b>trg_validar_cpf</b><br>
Valida se o CPF foi informado antes de salvar o paciente no banco.
</li>

<li>
<b>trg_verificar_estoque</b><br>
Ao inserir ou atualizar um produto, verifica se a quantidade está abaixo do mínimo e emite um aviso no sistema.
</li>
</ul>

<p align="center">
<img width="550" alt="Captura de tela 2026-05-29 222055" src="https://github.com/user-attachments/assets/7d5db579-6d3a-474c-8099-b004179dcd28" />
</p>

<hr>

<h2>👁️ Views</h2>

<p>
As views foram criadas para simplificar consultas complexas e facilitar a geração de relatórios administrativos e clínicos.
</p>

<ul>
<li>
<b>vw_relatorio_anamnese</b><br>
Une informações dos pacientes e anamneses em um único relatório clínico.
</li>

<li>
<b>vw_ansiedade_intensa</b><br>
Lista pacientes com nível de ansiedade classificado como intenso.
</li>

<li>
<b>vw_contatos_emergencia</b><br>
Relaciona pacientes e seus respectivos contatos emergenciais.
</li>

<li>
<b>vw_estoque_baixo</b><br>
Exibe apenas produtos com estoque abaixo do mínimo.
</li>

<li>
<b>vw_relatorio_estoque</b><br>
Mostra todos os itens do estoque com indicador de situação.
</li>

<li>
<b>vw_resumo_financeiro</b><br>
Resume receitas, despesas e lucro líquido da clínica.
</li>
</ul>

<p align="center">
<img width="600" alt="Captura de tela 2026-05-26 230945" src="https://github.com/user-attachments/assets/1a1e82f4-bc38-4b96-a6b0-f5e6aad7adbf" />
</p>

<hr>

<h2>⚙️ Procedures</h2>

<p>
As procedures foram utilizadas para padronizar cadastros e operações recorrentes dentro do banco de dados.
</p>

<p>
Com elas, a aplicação pode executar chamadas simples para registrar informações sem precisar repetir comandos INSERT manualmente.
</p>

<ul>
<li><b>cadastrar_paciente()</b> → realiza cadastro completo de pacientes.</li>
<li><b>cadastrar_anamnese()</b> → registra anamnese clínica detalhada.</li>
<li><b>cadastrar_pagamento()</b> → insere pagamento vinculado à consulta.</li>
<li><b>cadastrar_produto()</b> → cadastra itens do estoque.</li>
</ul>

<p align="center">
<img width="700" alt="Captura de tela 2026-05-26 232006" src="https://github.com/user-attachments/assets/8cc73882-2a1b-4560-a582-a8a237181e1e" />
</p>

<hr>

<h2>▶️ Como executar</h2>

<ol>
<li>Baixe o arquivo <code>clinica_psicologia.sql</code></li>
<li>Abra o <b>pgAdmin</b> ou outro cliente PostgreSQL</li>
<li>Crie um banco de dados</li>
<li>Importe o script SQL</li>
<li>Execute o arquivo</li>
</ol>

<hr>

<h2>🗄️ Como adentrar no servidor</h2>

<ol>
<li> Entre no pgAdmin4 no PostgreSQL</li>
<li> Abra a parte de <b>Servers</b> e registre um server</li>
<li> Coloque um <b>nome</b> e siga para a aba <b>connection</b></li>
<li> Preencha o hostname com <code>dpg-d894s8ugvqtc73bl081g-a.oregon-postgres.render.com</code></li>
<li> Após isso, insira o Maintenance database comn <b>psicologia1</b></li>
<li> Em Username coloque <b>admin</b></li>
<li> Insira está senha, <code>zLNjE5GE7MVUGXsvkFBZDtOb39QFPHaX</code></li>
<li> Aperte no botão <b>save</b></li>
</ol>

<hr>

<h2>📊 Funcionalidades atendidas</h2>

✅ Cadastro de pacientes<br>
✅ Cadastro de psicólogos<br>
✅ Controle de consultas<br>
✅ Registro de anamneses<br>
✅ Gestão financeira<br>
✅ Controle de pagamentos<br>
✅ Gestão de despesas<br>
✅ Controle de estoque<br>
✅ Relatórios automatizados com views<br>
✅ Regras automatizadas com triggers<br>
✅ Inserções padronizadas com procedures

<hr>

<h2>💰 Custo de Implementação</h2>

<p> O custo de implementação deste programa será de R$10.000,00.</p>
<p> E seu valor mensal de R$350,00.</p>

<hr>

<h2>▶️ Front-End do projeto</h2>

<p></p>

<hr>

<p align="center">
Desenvolvido para fins acadêmicos e gerenciamento clínico 🧠
</p>

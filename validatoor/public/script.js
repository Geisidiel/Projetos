async function listar() {
  const pasta = document.getElementById('pasta').value;
  const status = document.getElementById('status');
  const tabelaAntes = document.querySelector('#tabelaAntes tbody');
  tabelaAntes.innerHTML = '';
  status.textContent = '🔍 Carregando arquivos...';

  try {
    const resposta = await fetch('/listar-pdfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pasta }),
    });

    const resultado = await resposta.json();

    if (resultado.status === 'ok') {
      let linhas = '';
      resultado.arquivos.forEach((arquivo) => {
        linhas += `<tr><td>${arquivo.nome}</td><td>${arquivo.paginas}</td></tr>`;
      });
      tabelaAntes.innerHTML = linhas;
      status.textContent = `📁 ${resultado.arquivos.length} arquivos encontrados.`;
    } else {
      status.textContent = '❌ Erro ao listar arquivos.';
    }
  } catch (error) {
    status.textContent = '❌ Erro ao listar arquivos.';
    console.error(error);
  }
}

async function enviar() {
  const pasta = document.getElementById('pasta').value.trim();
  const status = document.getElementById('status');
  const tempo = document.getElementById('tempo');
  const barra = document.getElementById('barraProgresso');
  const percentual = document.getElementById('percentualProgresso');

  if (!pasta) {
    alert('Informe a pasta antes de iniciar o processamento.');
    return;
  }

  status.textContent = '⏳ Iniciando...';
  tempo.textContent = '';
  barra.value = 0;
  percentual.textContent = '0%';

  const resposta = await fetch('/iniciar-processamento', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pasta }),
  });

  const dados = await resposta.json();
  if (!resposta.ok || dados.status !== 'ok') {
    status.textContent = '❌ Erro ao iniciar processamento.';
    return;
  }

  status.textContent = '🔄 Processando...';

  const interval = setInterval(async () => {
    const res = await fetch('/progresso');
    const prog = await res.json();

    if (prog.total > 0) {
      const pct = Math.round((prog.atual / prog.total) * 100);
      barra.value = pct;
      percentual.textContent = `${pct}%`;
    }

    if (prog.status === 'finalizado') {
      clearInterval(interval);
      barra.value = 100;
      percentual.textContent = '100%';
      status.textContent = '✅ Processamento finalizado!';
      tempo.textContent = `⏱ Tempo total: ${prog.tempo}`;

      // Buscar e mostrar resultados detalhados
      const resResultados = await fetch('/resultado');
      const dadosResultados = await resResultados.json();

      if (dadosResultados.status === 'ok') {
        const tbody = document.querySelector('#tabelaDepois tbody');
        tbody.innerHTML = ''; // limpa tabela

        dadosResultados.resultados.forEach(({ nome, paginasAntes, paginasDepois, excluidas }) => {
          const linha = `<tr>
            <td>${nome}</td>
            <td>${paginasAntes}</td>
            <td>${paginasDepois}</td>
            <td>${excluidas}</td>
          </tr>`;
          tbody.innerHTML += linha;
        });
      }
    }

    if (prog.status === 'erro') {
      clearInterval(interval);
      status.textContent = '❌ Erro durante o processamento.';
    }
  }, 1000);
}

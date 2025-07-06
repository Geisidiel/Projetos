const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { PDFDocument } = require('pdf-lib');
const { analisarDocumento } = require('./utils/analisador');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

let progresso = {
  total: 0,
  atual: 0,
  status: 'aguardando',
  tempo: null,
};

let processamentoAtivo = false;

app.post('/listar-pdfs', async (req, res) => {
  const { pasta } = req.body;
  try {
    const arquivos = await fs.readdir(pasta);
    const pdfs = arquivos.filter((a) => a.toLowerCase().endsWith('.pdf'));
    const lista = [];

    for (const arquivo of pdfs) {
      const caminho = path.join(pasta, arquivo);
      try {
        const pdfDoc = await PDFDocument.load(await fs.readFile(caminho));
        const totalPaginas = pdfDoc.getPageCount();
        lista.push({ nome: arquivo, paginas: totalPaginas });
      } catch {
        lista.push({ nome: arquivo, paginas: 'Erro ao ler' });
      }
    }

    res.json({ status: 'ok', arquivos: lista });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'erro', mensagem: 'Erro ao listar arquivos.' });
  }
});

app.post('/iniciar-processamento', async (req, res) => {
  const { pasta } = req.body;

  if (processamentoAtivo) {
    return res.status(409).json({ status: 'erro', mensagem: 'Processamento já em andamento.' });
  }

  progresso = {
    total: 0,
    atual: 0,
    status: 'processando',
    tempo: null,
  };

  processamentoAtivo = true;

  try {
    const arquivos = await fs.readdir(pasta);
    const pdfs = arquivos.filter((a) => a.toLowerCase().endsWith('.pdf'));
    progresso.total = pdfs.length;

    const resultados = [];
    const inicio = Date.now();

    (async () => {
      for (const arquivo of pdfs) {
        const caminho = path.join(pasta, arquivo);
        const antes = await PDFDocument.load(await fs.readFile(caminho));
        const paginasAntes = antes.getPageCount();

        await analisarDocumento(caminho);

        const depois = await PDFDocument.load(await fs.readFile(caminho));
        const paginasDepois = depois.getPageCount();

        resultados.push({
          nome: arquivo,
          paginasAntes,
          paginasDepois,
          excluidas: paginasAntes - paginasDepois,
        });

        progresso.atual++;
      }

      const fim = Date.now();
      progresso.status = 'finalizado';
      progresso.tempo = ((fim - inicio) / 1000).toFixed(2) + ' segundos';
      processamentoAtivo = false;
    })();

    res.json({ status: 'ok', mensagem: 'Processamento iniciado.' });
  } catch (err) {
    console.error(err);
    progresso.status = 'erro';
    processamentoAtivo = false;
    res.status(500).json({ status: 'erro', mensagem: 'Erro ao iniciar processamento.' });
  }
});

app.get('/progresso', (req, res) => {
  res.json(progresso);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});

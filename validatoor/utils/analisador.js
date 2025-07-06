const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const { convert } = require('pdf-poppler');

function detectarRotacao(ocrOrientation) {
  const angle = ocrOrientation?.orientation?.degrees || 0;
  if (angle === 90) return -90;
  if (angle === 270) return 90;
  if (angle === 180) return 180;
  return 0;
}

function avaliarQualidadeImagem(imageBuffer) {
  return sharp(imageBuffer)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const totalPixels = info.width * info.height;
      let sum = 0;
      for (let i = 0; i < totalPixels; i++) {
        sum += data[i];
      }
      const media = sum / totalPixels;
      return media < 10 || media > 245; // Muito escuro ou muito claro
    });
}

async function analisarDocumento(caminhoPDF) {
  const nomeArquivo = path.basename(caminhoPDF);
  const pasta = path.dirname(caminhoPDF);
  const pdfOriginal = await PDFDocument.load(await fs.readFile(caminhoPDF));
  const totalPaginas = pdfOriginal.getPageCount();
  const novoPDF = await PDFDocument.create();
  const erros = [];

  for (let i = 0; i < totalPaginas; i++) {
    const tempPDF = await PDFDocument.create();
    const [pagina] = await tempPDF.copyPages(pdfOriginal, [i]);
    tempPDF.addPage(pagina);
    const pdfBytes = await tempPDF.save();

    const prefix = `pagina_${i}_${Date.now()}`;
    const imgPath = path.join(os.tmpdir(), `${prefix}-1.png`);

    try {
      await convert(caminhoPDF, {
        format: 'png',
        out_dir: os.tmpdir(),
        out_prefix: prefix,
        page: i + 1,
        scale: 150
      });

      if (!(await fs.pathExists(imgPath))) {
        erros.push(`Página ${i + 1}: erro ao gerar imagem`);
        continue;
      }

      const resultado = await Tesseract.recognize(imgPath, 'por', { logger: m => null });
      const texto = resultado.data.text.trim();
      const textoLimpo = texto.toLowerCase().replace(/\s+/g, '');
      const rotacao = detectarRotacao(resultado.data);
      const imagemRuim = await avaliarQualidadeImagem(await fs.readFile(imgPath));
      const imagemBranca = await sharp(imgPath).stats().then(stats => stats.channels[0].stdev < 3);

      if (
        textoLimpo === '' ||
        ['embranco', 'folhaembranco', 'páginaembranco'].some(f => textoLimpo.includes(f)) ||
        imagemBranca
      ) {
        erros.push(`Página ${i + 1}: página em branco removida`);
        continue;
      }

      let imagemFinal = imgPath;

      if (rotacao !== 0) {
        const imgRotated = path.join(os.tmpdir(), `${prefix}_rotated.png`);
        await sharp(imgPath).rotate(rotacao).toFile(imgRotated);
        imagemFinal = imgRotated;
        erros.push(`Página ${i + 1}: rotação corrigida (${rotacao}°)`);
      }

      if (imagemRuim) {
        erros.push(`Página ${i + 1}: possível imagem com problema (muito clara ou escura)`);
      }

      const imagemBuffer = await fs.readFile(imagemFinal);
      const novaPagina = await PDFDocument.create();
      const img = await novaPagina.embedPng(imagemBuffer);
      const page = novaPagina.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

      const [paginaCorrigida] = await novoPDF.copyPages(novaPagina, [0]);
      novoPDF.addPage(paginaCorrigida);
    } catch (err) {
      console.error(`Erro na página ${i + 1}:`, err);
      erros.push(`Página ${i + 1}: erro inesperado`);
    } finally {
      await fs.remove(imgPath).catch(() => {});
    }
  }

  await fs.writeFile(caminhoPDF, await novoPDF.save());

  if (erros.length) {
    const relatorio = `Arquivo: ${nomeArquivo}\n` +
      erros.map(e => `- ${e}`).join('\n') +
      `\nTotal de páginas no resultado final: ${novoPDF.getPageCount()}\n\n`;
    await fs.appendFile(path.join(pasta, 'relatorio_erros.txt'), relatorio);
  }

  console.log(`✅ ${nomeArquivo} processado com sucesso`);
}

module.exports = { analisarDocumento };

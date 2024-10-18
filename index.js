const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const app = express();

// Endpoint para a raiz
app.get('/', (req, res) => {
  res.send('Bem-vindo à API de Cartas! Use /figu?avatar=URL_DO_AVATAR&cor=HEX_DA_COR para gerar uma carta.');
});

// Endpoint para gerar a carta
app.get('/figu', async (req, res) => {
  const avatarUrl = req.query.avatar;
  const color = req.query.cor || '#ffffff'; // Cor padrão é branca se não for fornecida

  if (!avatarUrl) {
    return res.status(400).send('Avatar URL is required.');
  }

  try {
    // Baixa a imagem do avatar
    const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    const avatar = await loadImage(Buffer.from(response.data, 'binary'));

    // Cria um canvas de 400x600 (tamanho da carta)
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');

    // Cria um fundo transparente
    ctx.clearRect(0, 0, 400, 600);

    // Desenha a carta com bordas arredondadas
    ctx.fillStyle = color;
    ctx.beginPath();
    const x = 20; // Posição x da carta
    const y = 20; // Posição y da carta
    const radius = 20; // Raio das bordas arredondadas
    ctx.moveTo(x + radius, y); // Canto superior esquerdo
    ctx.lineTo(x + 400 - radius, y); // Canto superior direito
    ctx.arcTo(x + 400, y, x + 400, y + 600, radius); // Canto inferior direito
    ctx.lineTo(x + 400, y + 600 - radius); // Canto inferior direito
    ctx.arcTo(x + 400, y + 600, x, y + 600, radius); // Canto inferior esquerdo
    ctx.lineTo(x, y + radius); // Canto inferior esquerdo
    ctx.arcTo(x, y, x + radius, y, radius); // Canto superior esquerdo
    ctx.closePath();
    ctx.fill();

    // Desenha o avatar no centro da carta
    ctx.drawImage(avatar, 100, 150, 200, 200);

    // Retorna a imagem gerada
    res.setHeader('Content-Type', 'image/png');
    res.send(canvas.toBuffer());
  } catch (error) {
    res.status(500).send('Error generating image.');
  }
});

// A Vercel ou Render usará a variável de ambiente PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

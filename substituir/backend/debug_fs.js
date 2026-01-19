
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navegando para Flashscore...');
    await page.goto('https://www.flashscore.pt', { waitUntil: 'networkidle2' });

    // Aceitar cookies se aparecer
    try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
        await page.click('#onetrust-accept-btn-handler');
        console.log('Cookies aceitos.');
    } catch (e) { }

    console.log('Aguardando lista de jogos...');
    await page.waitForSelector('.sportName.soccer');

    // Pegar o HTML do primeiro container de jogo e do primeiro jogo
    const html = await page.evaluate(() => {
        const match = document.querySelector('.event__match');
        return match ? match.outerHTML : 'NENHUM JOGO ENCONTRADO';
    });

    console.log('Salvando HTML...');
    fs.writeFileSync('flashscore_dump.html', html);

    console.log('Feito! Verifique flashscore_dump.html');
    await browser.close();
})();

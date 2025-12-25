import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { initDatabase } from './database.js';

const BASE_URL = 'https://logodetimes.com';

const CHAMPIONSHIPS = {
    'Brasil': {
        'Brasileirão – Série A': '/brasileirao-serie-a/',
        'Brasileirão – Série B': '/brasileirao-serie-b/',
        'Brasileirão – Série C': '/brasileirao-serie-c/',
        'Paulistão – Série A1': '/paulistao-serie-a1/',
        'Cariocão – Série A': '/cariocao-serie-a/',
        'Mineirão – Módulo I': '/mineirao-modulo-i/'
    },
    'Espanha': {
        'La Liga': '/times-la-liga/'
    },
    'Inglaterra': {
        'Premier League': '/times-premiere-league/'
    },
    'Alemanha': {
        'Bundesliga': '/times-bundesliga/'
    },
    'França': {
        'Ligue 1': '/times-ligue-1/'
    },
    'Itália': {
        'Serie A TIM': '/times-serie-a-tim/'
    },
    'Argentina': {
        'Primera División': '/primeira-division-argentina/'
    }
};

export class LogoScraper {
    constructor() {
        this.db = initDatabase();
        this.browser = null;
    }

    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async decodeBase64Url(encoded) {
        try {
            const buffer = Buffer.from(encoded, 'base64');
            const decoded = buffer.toString('utf-8');
            const parts = decoded.split('|');
            return parts.length > 0 ? parts[0] : null;
        } catch (e) {
            return null;
        }
    }

    async extractTeamLogos(page, teamUrl, teamName, country, league) {
        try {
            console.log(`    ↳ Acessando: ${teamUrl}`);
            await page.goto(teamUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Extract download links
            const logoLinks = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('table td a[href*="/download/"]'));
                return links.map(link => link.getAttribute('href'));
            });

            let savedCount = 0;
            for (const href of logoLinks) {
                if (href && href.includes('time=')) {
                    const encoded = href.split('time=')[1];
                    const logoUrl = await this.decodeBase64Url(encoded);

                    if (logoUrl) {
                        let resolution = 'unknown';
                        if (logoUrl.includes('-4096.png')) resolution = '4096x4096';
                        else if (logoUrl.includes('-2048.png')) resolution = '2048x2048';
                        else if (logoUrl.includes('-1536.png')) resolution = '1536x1536';
                        else if (logoUrl.includes('-1024.png')) resolution = '1024x1024';
                        else if (logoUrl.includes('-512.png')) resolution = '512x512';
                        else if (logoUrl.includes('-256.png')) resolution = '256x256';

                        // Save to DB
                        await this.db.query(`
                            INSERT INTO team_logos (team_name, country, league, logo_url, resolution)
                            VALUES ($1, $2, $3, $4, $5)
                            ON CONFLICT (team_name, resolution) DO UPDATE SET
                            logo_url = EXCLUDED.logo_url,
                            updated_at = NOW()
                        `, [teamName, country, league, logoUrl, resolution]);
                        savedCount++;
                    }
                }
            }
            console.log(`    ✅ ${savedCount} logos salvas para ${teamName}`);

        } catch (error) {
            console.error(`    ❌ Erro ao extrair logos de ${teamName}:`, error.message);
        }
    }

    async runScraper() {
        console.log('🚀 Iniciando Logo Scraper...');
        await this.init();

        try {
            const page = await this.browser.newPage();

            for (const [country, leagues] of Object.entries(CHAMPIONSHIPS)) {
                console.log(`\n🌍 PAÍS: ${country}`);
                
                for (const [league, path] of Object.entries(leagues)) {
                    console.log(`  🏆 Liga: ${league}`);
                    
                    let currentPage = 1;
                    let hasNextPage = true;

                    while (hasNextPage) {
                        const url = `${BASE_URL}${path}${currentPage > 1 ? `page/${currentPage}/` : ''}`;
                        console.log(`  📄 Página ${currentPage}: ${url}`);
                        
                        try {
                            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

                            // Extract teams from list
                            const teams = await page.evaluate(() => {
                                const nodes = document.querySelectorAll('main#main article h3 a, main#main h3 a');
                                return Array.from(nodes).map(node => ({
                                    name: node.textContent.trim(),
                                    url: node.href
                                }));
                            });

                            if (teams.length === 0) {
                                hasNextPage = false;
                                break;
                            }

                            console.log(`    Encontrados ${teams.length} times. Processando...`);

                            // Process each team
                            for (const team of teams) {
                                await this.extractTeamLogos(page, team.url, team.name, country, league);
                                // Go back to list page is not needed because we have the URL, but using same page object
                                // might require reloading the list page or using a separate tab.
                                // Simplest: Just navigate. Puppeteer is fast enough.
                            }

                            // Check for next page
                            // Since we navigated away, we need to go back to the list URL to check pagination? 
                            // Or just try next page index blindly until 404/empty?
                            // The Python script checked `soup.select_one('a[rel="next"]')`.
                            // Let's reload the list page to check pagination properly.
                            await page.goto(url, { waitUntil: 'domcontentloaded' });
                            const nextLink = await page.$('a[rel="next"]');
                            if (!nextLink) {
                                hasNextPage = false;
                            } else {
                                currentPage++;
                            }

                        } catch (e) {
                            console.error(`  ❌ Erro na página ${currentPage}:`, e.message);
                            hasNextPage = false;
                        }
                    }
                }
            }

        } catch (error) {
            console.error('❌ Erro geral no Scraper:', error);
        } finally {
            await this.close();
            console.log('🏁 Logo Scraper Finalizado.');
        }
    }
}

// Allow running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const scraper = new LogoScraper();
    scraper.runScraper();
}

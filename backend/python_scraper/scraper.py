import os
import time
from datetime import datetime, timedelta
from urllib.parse import urljoin

import psycopg2
from psycopg2.extras import DictCursor
import requests
from bs4 import BeautifulSoup

# ========== CONFIGURAÇÃO GERAL ==========

BASE_URL = "https://www.flashscore.pt"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# Credenciais do Postgres (ajusta para o teu ambiente)
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = int(os.getenv("PG_PORT", "5432"))
PG_DB   = os.getenv("PG_DB", "flashscore")
PG_USER = os.getenv("PG_USER", "flashscore_user")
PG_PASS = os.getenv("PG_PASS", "flashscore_pass")

POLL_INTERVAL_SECONDS = 120          # intervalo entre ciclos completos
STATS_REQUEST_SLEEP = 1.0            # delay entre requests de stats por jogo


# ========== CONEXÃO E MODELO DE DADOS ==========

def get_pg_conn():
    conn = psycopg2.connect(
        host=PG_HOST,
        port=PG_PORT,
        dbname=PG_DB,
        user=PG_USER,
        password=PG_PASS,
        cursor_factory=DictCursor,
    )
    conn.autocommit = True
    return conn


def init_db():
    try:
        conn = get_pg_conn()
        cur = conn.cursor()

        cur.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            id TEXT PRIMARY KEY,
            date DATE,
            league TEXT,
            home_team TEXT,
            away_team TEXT,
            home_score INTEGER,
            away_score INTEGER,
            status TEXT,
            is_live BOOLEAN,
            match_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS match_stats (
            id SERIAL PRIMARY KEY,
            match_id TEXT REFERENCES matches(id),
            period TEXT,
            category TEXT,
            home_value DOUBLE PRECISION,
            away_value DOUBLE PRECISION,
            captured_at TIMESTAMPTZ DEFAULT NOW()
        );
        """)

        cur.close()
        conn.close()
        print("✅ Tabelas inicializadas no Postgres.")
    except Exception as e:
        print(f"❌ Erro ao inicializar DB: {e}")


def upsert_match(match_dict, match_date):
    """
    UPSERT de um jogo em matches.
    """
    conn = get_pg_conn()
    cur = conn.cursor()

    sql = """
        INSERT INTO matches (
            id, date, league, home_team, away_team,
            home_score, away_score, status, is_live,
            match_url, created_at, updated_at
        ) VALUES (
            %(id)s, %(date)s, %(league)s, %(home_team)s, %(away_team)s,
            %(home_score)s, %(away_score)s, %(status)s, %(is_live)s,
            %(match_url)s, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            date        = EXCLUDED.date,
            league      = EXCLUDED.league,
            home_team   = EXCLUDED.home_team,
            away_team   = EXCLUDED.away_team,
            home_score  = EXCLUDED.home_score,
            away_score  = EXCLUDED.away_score,
            status      = EXCLUDED.status,
            is_live     = EXCLUDED.is_live,
            match_url   = EXCLUDED.match_url,
            updated_at  = NOW();
    """

    params = {
        "id": match_dict["id"],
        "date": match_date,
        "league": match_dict.get("league"),
        "home_team": match_dict.get("home_team"),
        "away_team": match_dict.get("away_team"),
        "home_score": match_dict.get("home_score"),
        "away_score": match_dict.get("away_score"),
        "status": match_dict.get("status"),
        "is_live": bool(match_dict.get("is_live", False)),
        "match_url": match_dict.get("match_url"),
    }

    cur.execute(sql, params)
    cur.close()
    conn.close()


def insert_stats(match_id, period, stats_list):
    """
    Insere uma coleção de estatísticas (snapshot) em match_stats.
    """
    if not stats_list:
        return

    conn = get_pg_conn()
    cur = conn.cursor()

    sql = """
        INSERT INTO match_stats (
            match_id, period, category,
            home_value, away_value, captured_at
        ) VALUES (%s, %s, %s, %s, %s, NOW());
    """

    for st in stats_list:
        cur.execute(
            sql,
            (
                match_id,
                period,
                st["category"],
                st["home"],
                st["away"],
            ),
        )

    cur.close()
    conn.close()


# ========== SCRAPER (LISTA DE JOGOS) ==========

def get_daily_matches_for_date(date_obj):
    """
    Pega jogos de futebol da data indicada.
    """
    # IMPORTANTE: Flashscore usa timezone local ou cookies para data. 
    # A URL /futebol/ mostra HOJE. Para navegar, precisaria de lógica extra (Selenium ou cookies 'd').
    # Aqui mantemos a lógica original do script fornecido que varre a url base /futebol/ 
    # (assumindo que o usuario vai adaptar a navegação se quiser histórico profundo no requests puro)
    
    url = f"{BASE_URL}/futebol/"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"Erro ao acessar {url}: {e}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    matches = []

    for match_el in soup.select(".event__match"):
        try:
            league_el = match_el.find_previous("div", class_="event__title")
            league_name = league_el.get_text(strip=True) if league_el else None

            home_team_el = match_el.select_one(".event__participant--home")
            away_team_el = match_el.select_one(".event__participant--away")
            if not home_team_el or not away_team_el:
                continue

            home_team = home_team_el.get_text(strip=True)
            away_team = away_team_el.get_text(strip=True)

            score_home_el = match_el.select_one(".event__score--home")
            score_away_el = match_el.select_one(".event__score--away")
            home_score = None
            away_score = None
            if score_home_el:
                try:
                    home_score = int(score_home_el.get_text(strip=True))
                except ValueError:
                    pass
            if score_away_el:
                try:
                    away_score = int(score_away_el.get_text(strip=True))
                except ValueError:
                    pass

            status_el = match_el.select_one(".event__stage, .event__time")
            status = status_el.get_text(strip=True) if status_el else ""

            status_lower = status.lower()
            is_live = any(k in status_lower for k in ["'", "meio", "int", "ao vivo"])

            link_el = match_el.select_one("a")
            match_url = urljoin(BASE_URL, link_el["href"]) if link_el and link_el.has_attr("href") else None

            mid = match_el.get("id") or match_el.get("data-id", None)
            if not mid:
                if match_url and "/jogo/" in match_url:
                    mid = match_url.split("/jogo/")[-1].split("/")[0]
                else:
                    continue

            # Limpar ID se vier com prefixo g_1_
            mid = mid.replace("g_1_", "")

            matches.append({
                "id": mid,
                "league": league_name,
                "status": status,
                "is_live": is_live,
                "home_team": home_team,
                "away_team": away_team,
                "home_score": home_score,
                "away_score": away_score,
                "match_url": match_url,
            })
        except Exception:
            continue

    return matches


# ========== SCRAPER (ESTATÍSTICAS DO JOGO) ==========

def parse_stats_from_html(html):
    """
    Lê o HTML das estatísticas e devolve lista stats.
    """
    soup = BeautifulSoup(html, "html.parser")
    stats = []

    rows = soup.select(".stat__row")
    if not rows:
        rows = soup.select("div.statRow, tr")

    for row in rows:
        try:
            category_el = row.select_one(".stat__category") or row.select_one(".statCategory")
            home_el = row.select_one(".stat__homeValue") or row.select_one(".statHome")
            away_el = row.select_one(".stat__awayValue") or row.select_one(".statAway")

            if not category_el or not home_el or not away_el:
                continue

            category = category_el.get_text(strip=True)
            home_val_raw = home_el.get_text(strip=True).replace("%", "")
            away_val_raw = away_el.get_text(strip=True).replace("%", "")

            def to_number(v):
                v = v.replace(",", ".")
                try:
                    return int(v)
                except ValueError:
                    try:
                        return float(v)
                    except ValueError:
                        return v

            home_val = to_number(home_val_raw)
            away_val = to_number(away_val_raw)

            stats.append({
                "category": category,
                "home": home_val,
                "away": away_val
            })
        except Exception:
            continue

    return stats


def get_match_stats(match_url):
    """
    Para uma URL de jogo, baixa stats de periodos.
    """
    if not match_url:
        return {}

    if not match_url.endswith("/"):
        match_url += "/"

    endpoints = {
        "full": urljoin(match_url, "sumario/estatisticas/0/"),
        "1st_half": urljoin(match_url, "sumario/estatisticas/1/"),
        "2nd_half": urljoin(match_url, "sumario/estatisticas/2/"),
    }

    all_stats = {}

    for period_key, url in endpoints.items():
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                continue
            period_stats = parse_stats_from_html(resp.text)
            if period_stats:
                all_stats[period_key] = period_stats
        except Exception:
            continue

    return all_stats


# ========== JANELA DE 7 DIAS E LOOP ==========

def get_week_dates_around_today():
    """
    Devolve lista de 7 datas: hoje-3 até hoje+3.
    """
    today = datetime.now().date()
    # Para o script simples que só lê /futebol/, vamos apenas listar as datas
    # A implementação real de navegação precisaria passar 'd' param.
    return [today + timedelta(days=offset) for offset in range(-3, 4)]


def run_cycle():
    """
    Um ciclo:
      - Coleta lista de jogos e faz UPSERT.
      - Para jogos ao vivo: coleta stats e insere snapshots.
    """
    # Neste script base, ele varre a pagina principal para simular o dia.
    # Em produção com suporte a historico, iterariamos sobre week_dates
    # e ajustariamos a URL ou cookie.
    
    print(f"[{datetime.now().isoformat()}] Coletando jogos (Homepage)...")
    today = datetime.now().date()

    matches = get_daily_matches_for_date(today)
    print(f"   > Encontrados {len(matches)} jogos.")

    for m in matches:
        upsert_match(m, today)

        if m.get("is_live") and m.get("match_url"):
            print(f"   > Coletando stats AO VIVO: {m['home_team']} vs {m['away_team']}")
            stats_by_period = get_match_stats(m["match_url"])
            for period, stats_list in stats_by_period.items():
                insert_stats(m["id"], period, stats_list)
                time.sleep(STATS_REQUEST_SLEEP)


def main_loop():
    print("🚀 Serviço Flashscore (Python) iniciado.")
    # Tenta conectar
    try:
        init_db()
    except:
        print("⚠️  Não foi possível conectar ao Postgres. Verifique as credenciais.")
        return

    while True:
        start = datetime.now()
        print(f"[{start.isoformat()}] Iniciando ciclo...")
        try:
            run_cycle()
        except Exception as e:
            print(f"❌ Erro no ciclo: {e}")
        
        end = datetime.now()
        elapsed = (end - start).total_seconds()
        sleep_time = max(0, POLL_INTERVAL_SECONDS - elapsed)
        print(f"[{end.isoformat()}] Ciclo fim. Dormindo {sleep_time:.1f}s.")
        time.sleep(sleep_time)


if __name__ == "__main__":
    main_loop()

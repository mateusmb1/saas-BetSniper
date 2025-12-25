import os
import time
import datetime as dt
from typing import List, Dict, Any, Optional, Tuple
import json

import requests
import psycopg2
from psycopg2.extras import Json

# ==========================
# Config
# ==========================

SPORTDB_BASE_URL = "https://sportdb.dev"
SPORTDB_API_KEY = os.environ.get("SPORTDB_API_KEY")
DATABASE_URL = os.environ.get("DATABASE_URL")

# quais esportes quer monitorar
SPORTS = ["football", "basketball", "tennis"]

LIVE_POLL_INTERVAL = 30          # segundos
FIXTURES_POLL_INTERVAL = 60 * 10 # 10 minutos

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# ==========================
# HTTP helper
# ==========================

def sportdb_get(path: str, params: Optional[Dict[str, Any]] = None) -> Any:
    headers = {}
    if SPORTDB_API_KEY:
        headers["Authorization"] = f"Bearer {SPORTDB_API_KEY}"
    url = f"{SPORTDB_BASE_URL}{path}"
    try:
        r = requests.get(url, headers=headers, params=params, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"[ERROR] Request failed for {url}: {e}")
        return {}

# ==========================
# Endpoints SportDB
# ==========================

def get_countries(sport: str) -> List[Dict[str, Any]]:
    data = sportdb_get(f"/api/{sport}/countries")
    return data.get("countries", data) if isinstance(data, dict) else data

def get_country_detail(sport: str, country_slug: str) -> Dict[str, Any]:
    return sportdb_get(f"/api/{sport}/{country_slug}")

def get_competitions_from_country_payload(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    return payload.get("competitions", [])

def get_fixtures(sport: str, country_slug: str, competition_slug: str, season: str) -> List[Dict[str, Any]]:
    path = f"/api/{sport}/{country_slug}/{competition_slug}/{season}/fixtures"
    data = sportdb_get(path)
    return data.get("matches", data) if isinstance(data, dict) else data

def get_live_matches(sport: str) -> List[Dict[str, Any]]:
    data = sportdb_get(f"/api/{sport}/live")
    return data.get("matches", data) if isinstance(data, dict) else data

def get_match_stats(match_id: int) -> Dict[str, Any]:
    return sportdb_get(f"/api/match/{match_id}/stats")

# ==========================
# DB helpers
# ==========================

def upsert_competition(
    sport: str,
    country_slug: str,
    comp: Dict[str, Any],
    season: str
) -> int:
    comp_slug = comp.get("slug") or comp.get("competition_slug")
    name = comp.get("name") or comp_slug
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            sql = """
                INSERT INTO competitions (sport, country_slug, competition_slug, name, season)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (sport, country_slug, competition_slug, season)
                DO UPDATE SET name = EXCLUDED.name
                RETURNING id;
            """
            cur.execute(sql, (sport, country_slug, comp_slug, name, season))
            row = cur.fetchone()
            conn.commit()
            if row:
                return row[0]
            
            # Fallback (should not be reached due to RETURNING, but just in case of conflict without update if we used DO NOTHING)
            cur.execute("""
                SELECT id FROM competitions 
                WHERE sport=%s AND country_slug=%s AND competition_slug=%s AND season=%s
            """, (sport, country_slug, comp_slug, season))
            row = cur.fetchone()
            return row[0] if row else None
    finally:
        conn.close()

def upsert_match(
    sport: str,
    competition_id: Optional[int],
    payload: Dict[str, Any],
    is_live: bool
) -> None:
    match_id = payload.get("id")
    if not match_id:
        return

    start_time = payload.get("start_time") or payload.get("kickoff_time")
    home_team = payload.get("home_team") or payload.get("home", {}).get("name")
    away_team = payload.get("away_team") or payload.get("away", {}).get("name")
    home_score = payload.get("home_score") or payload.get("home", {}).get("score")
    away_score = payload.get("away_score") or payload.get("away", {}).get("score")
    status = payload.get("status")

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            sql = """
                INSERT INTO matches (
                    id, competition_id, sport, status, start_time, 
                    home_team, away_team, home_score, away_score, 
                    is_live, raw, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    competition_id = COALESCE(EXCLUDED.competition_id, matches.competition_id),
                    status = EXCLUDED.status,
                    start_time = EXCLUDED.start_time,
                    home_team = EXCLUDED.home_team,
                    away_team = EXCLUDED.away_team,
                    home_score = EXCLUDED.home_score,
                    away_score = EXCLUDED.away_score,
                    is_live = EXCLUDED.is_live,
                    raw = EXCLUDED.raw,
                    updated_at = NOW();
            """
            cur.execute(sql, (
                match_id, competition_id, sport, status, start_time,
                home_team, away_team, home_score, away_score,
                is_live, Json(payload)
            ))
            conn.commit()
    finally:
        conn.close()

def upsert_match_stats_row(match_id: int, stats: Dict[str, Any]) -> None:
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            sql = """
                INSERT INTO match_stats (match_id, stats, updated_at)
                VALUES (%s, %s, NOW())
                ON CONFLICT (match_id) DO UPDATE SET
                    stats = EXCLUDED.stats,
                    updated_at = NOW();
            """
            cur.execute(sql, (match_id, Json(stats)))
            conn.commit()
    finally:
        conn.close()

# ==========================
# Filtros por data
# ==========================

def parse_match_date(payload: Dict[str, Any]) -> Optional[dt.date]:
    start_time = payload.get("start_time") or payload.get("kickoff_time")
    if not start_time:
        return None
    try:
        # assume ISO8601
        d = dt.datetime.fromisoformat(start_time.replace("Z", "+00:00")).date()
        return d
    except Exception:
        return None

def filter_matches_by_date_range(
    matches: List[Dict[str, Any]],
    start: dt.date,
    end: dt.date
) -> List[Dict[str, Any]]:
    result = []
    if not matches:
        return []
    for m in matches:
        d = parse_match_date(m)
        if not d:
            continue
        if start <= d <= end:
            result.append(m)
    return result

def get_week_range() -> Tuple[dt.date, dt.date]:
    today = dt.date.today()
    return today, today + dt.timedelta(days=7)

# ==========================
# Sincronizações
# ==========================

def sync_fixtures_for_week() -> None:
    print(f"[{dt.datetime.now()}] Syncing fixtures for week...")
    start, end = get_week_range()

    for sport in SPORTS:
        countries = get_countries(sport)
        if not countries:
            continue
            
        for country in countries:
            country_slug = country.get("slug") or country.get("code") or country.get("id")
            if not country_slug:
                continue

            country_payload = get_country_detail(sport, country_slug)
            competitions = get_competitions_from_country_payload(country_payload)

            for comp in competitions:
                seasons = comp.get("seasons") or []
                if not seasons:
                    continue

                current = next((s for s in seasons if s.get("current")), seasons[-1])
                season_name = current.get("name") or current.get("season") or str(current.get("id"))

                comp_db_id = upsert_competition(sport, country_slug, comp, season_name)

                fixtures = get_fixtures(sport, country_slug, comp.get("slug"), season_name)
                week_matches = filter_matches_by_date_range(fixtures, start, end)

                for m in week_matches:
                    upsert_match(sport, comp_db_id, m, is_live=False)

def sync_matches_for_day(target_date: Optional[dt.date] = None) -> None:
    if not target_date:
        target_date = dt.date.today()
    print(f"[{dt.datetime.now()}] Syncing matches for day {target_date}...")

    for sport in SPORTS:
        countries = get_countries(sport)
        if not countries:
            continue
            
        for country in countries:
            country_slug = country.get("slug") or country.get("code") or country.get("id")
            if not country_slug:
                continue

            country_payload = get_country_detail(sport, country_slug)
            competitions = get_competitions_from_country_payload(country_payload)

            for comp in competitions:
                seasons = comp.get("seasons") or []
                if not seasons:
                    continue

                current = next((s for s in seasons if s.get("current")), seasons[-1])
                season_name = current.get("name") or current.get("season") or str(current.get("id"))

                comp_db_id = upsert_competition(sport, country_slug, comp, season_name)

                fixtures = get_fixtures(sport, country_slug, comp.get("slug"), season_name)
                day_matches = filter_matches_by_date_range(fixtures, target_date, target_date)

                for m in day_matches:
                    upsert_match(sport, comp_db_id, m, is_live=False)

def sync_live_matches_and_stats() -> None:
    print(f"[{dt.datetime.now()}] Syncing LIVE matches...")
    for sport in SPORTS:
        live_matches = get_live_matches(sport)
        if not live_matches:
            continue
            
        for m in live_matches:
            match_id = m.get("id")
            if not match_id:
                continue
                
            competition_id = m.get("competition_id") # May be None
            upsert_match(sport, competition_id, m, is_live=True)

            try:
                stats = get_match_stats(match_id)
                upsert_match_stats_row(match_id, stats)
            except Exception as e:
                print(f"[WARN] stats erro match {match_id}: {e}")

# ==========================
# Loop principal
# ==========================

def main_loop():
    print("🚀 SportDB Scraper started.")
    last_fixtures_sync = 0.0
    last_day_sync = 0.0

    while True:
        now = time.time()

        if now - last_fixtures_sync > FIXTURES_POLL_INTERVAL:
            try:
                sync_fixtures_for_week()
            except Exception as e:
                print("[ERROR] sync_fixtures_for_week:", e)
            last_fixtures_sync = now

        if now - last_day_sync > FIXTURES_POLL_INTERVAL:
            try:
                sync_matches_for_day()
            except Exception as e:
                print("[ERROR] sync_matches_for_day:", e)
            last_day_sync = now

        try:
            sync_live_matches_and_stats()
        except Exception as e:
            print("[ERROR] sync_live_matches_and_stats:", e)

        time.sleep(LIVE_POLL_INTERVAL)

if __name__ == "__main__":
    if not DATABASE_URL:
        print("❌ DATABASE_URL environment variable not set.")
        exit(1)
    main_loop()

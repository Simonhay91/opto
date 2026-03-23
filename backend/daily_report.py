#!/usr/bin/env python3
"""
Daily Telegram report: top product views + top searches.

Cron example (runs every night at 22:00):
  0 22 * * * python3 /app/backend/daily_report.py >> /var/log/daily_report.log 2>&1
"""

import os
import sys
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHANNEL_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
API_BASE = os.environ.get("REPORT_API_BASE", "http://localhost:8001")


def send_telegram(text: str) -> bool:
    if not BOT_TOKEN or not CHANNEL_ID:
        print("ERROR: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set", file=sys.stderr)
        return False
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    resp = requests.post(url, json={
        "chat_id": CHANNEL_ID,
        "text": text,
        "parse_mode": "Markdown",
    }, timeout=10)
    return resp.ok


def fetch(endpoint: str, date: str) -> list:
    try:
        r = requests.get(f"{API_BASE}{endpoint}?date={date}", timeout=10)
        r.raise_for_status()
        return r.json().get("data", [])
    except Exception as e:
        raise RuntimeError(f"Failed to fetch {endpoint}: {e}")


def build_message(date: str, views: list, searches: list) -> str:
    # Header
    date_fmt = datetime.strptime(date, "%Y-%m-%d").strftime("%-d %b %Y")
    lines = [f"*📊 Статистика за {date_fmt}*", ""]

    # Product views
    lines.append("*📦 Топ товары*")
    if views:
        for i, item in enumerate(views[:10], 1):
            name = item.get("product_name", "—")
            clicks = item.get("clicks", 0)
            lines.append(f"{i}\\. {name} — {clicks} кликов")
    else:
        lines.append("_Нет данных_")

    lines.append("")

    # Search queries
    lines.append("*🔍 Топ запросы*")
    if searches:
        for i, item in enumerate(searches[:10], 1):
            query = item.get("query", "—")
            count = item.get("count", 0)
            no_results = item.get("results_found", 1) == 0
            prefix = "⚠️ " if no_results else ""
            suffix = " _(нет результатов)_" if no_results else ""
            lines.append(f'{prefix}{i}\\. "{query}" — {count}{suffix}')
    else:
        lines.append("_Нет данных_")

    return "\n".join(lines)


def main():
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print(f"[daily_report] Generating report for {date}")

    try:
        views = fetch("/api/stats/product-views", date)
        searches = fetch("/api/stats/searches", date)
    except RuntimeError as e:
        error_msg = f"⚠️ *Ошибка дневного отчёта* ({date})\n`{e}`"
        send_telegram(error_msg)
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    msg = build_message(date, views, searches)
    ok = send_telegram(msg)

    if ok:
        print(f"[daily_report] Report sent successfully")
    else:
        print(f"[daily_report] ERROR: Failed to send Telegram message", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

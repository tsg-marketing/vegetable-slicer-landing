"""
Business: Отдаёт каталог товаров Daribo из БД для фронта с категориями.
Args: event - dict с httpMethod, queryStringParameters; context - объект с request_id
Returns: HTTP response с массивом товаров и категорий
"""
import json
import os
from typing import Any

import psycopg2


def handler(event: dict, context) -> dict:
    '''
    Возвращает список товаров Daribo и их категории. Параметр id — для одного товара.
    '''
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        qs = event.get('queryStringParameters') or {}
        offer_id = (qs.get('id') or '').strip() if qs else ''

        if offer_id:
            safe_id = offer_id.replace("'", "''")
            cur.execute(f"""
                SELECT offer_id, name, url, price, description, brand, available, pictures, params, updated_at, category_id, category_name
                FROM daribo_products WHERE offer_id = '{safe_id}' LIMIT 1
            """)
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {**cors_headers, 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'not found'}),
                    'isBase64Encoded': False,
                }
            item = _row_to_dict(row)
            return {
                'statusCode': 200,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps(item, ensure_ascii=False),
                'isBase64Encoded': False,
            }

        cur.execute("""
            SELECT offer_id, name, url, price, description, brand, available, pictures, params, updated_at, category_id, category_name
            FROM daribo_products ORDER BY available DESC, name ASC
        """)
        items = [_row_to_dict(r) for r in cur.fetchall()]

        cur.execute("""
            SELECT DISTINCT p.category_id, COALESCE(c.name, p.category_name) AS cname
            FROM daribo_products p
            LEFT JOIN daribo_categories c ON c.category_id = p.category_id
            WHERE p.category_id IS NOT NULL AND p.category_id <> ''
            ORDER BY cname
        """)
        categories = [{'category_id': r[0], 'name': r[1] or ''} for r in cur.fetchall()]

        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'items': items, 'categories': categories}, ensure_ascii=False),
            'isBase64Encoded': False,
        }
    finally:
        cur.close()
        conn.close()


def _row_to_dict(row: tuple) -> dict[str, Any]:
    return {
        'offer_id': row[0],
        'name': row[1],
        'url': row[2],
        'price': row[3],
        'description': row[4],
        'brand': row[5],
        'available': row[6],
        'pictures': row[7] or [],
        'params': row[8] or [],
        'updated_at': row[9].isoformat() if row[9] else None,
        'category_id': row[10] or '',
        'category_name': row[11] or '',
    }

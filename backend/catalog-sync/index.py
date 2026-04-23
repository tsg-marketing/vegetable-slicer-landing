"""
Business: Парсит XML-фид t-sib.ru, сохраняет товары бренда Daribo в БД. Запускается планировщиком 2 раза в день.
Args: event - dict с httpMethod; context - объект с request_id
Returns: HTTP response с количеством обновлённых товаров
"""
import json
import os
import urllib.request
import xml.etree.ElementTree as ET
from typing import Any

import psycopg2

FEED_URL = 'https://t-sib.ru/bitrix/catalog_export/export_Vvf.xml'
TARGET_BRAND_TOKENS = ('daribo', 'дарибо')


def fetch_feed() -> bytes:
    req = urllib.request.Request(FEED_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def parse_feed(xml_bytes: bytes):
    root = ET.fromstring(xml_bytes)
    shop = root.find('shop') if root.tag != 'shop' else root
    if shop is None:
        return [], {}

    categories: dict[str, dict[str, str]] = {}
    cats_node = shop.find('categories')
    if cats_node is not None:
        for c in cats_node.findall('category'):
            cid = (c.get('id') or '').strip()
            if not cid:
                continue
            categories[cid] = {
                'name': (c.text or '').strip(),
                'parent_id': (c.get('parentId') or '').strip(),
            }

    offers_node = shop.find('offers')
    if offers_node is None:
        return [], categories

    result: list[dict[str, Any]] = []
    for offer in offers_node.findall('offer'):
        params_list: list[dict[str, str]] = []
        brand_value = ''
        picture_params: list[str] = []

        for p in offer.findall('param'):
            pname = (p.get('name') or '').strip()
            pvalue = (p.text or '').strip()
            punit = (p.get('unit') or '').strip()
            if not pname:
                continue
            if pname.lower() == 'бренд':
                brand_value = pvalue
            if pname.lower() == 'картинки товара':
                picture_params.append(pvalue)
                continue
            params_list.append({'name': pname, 'value': pvalue, 'unit': punit})

        if not any(tok in brand_value.lower() for tok in TARGET_BRAND_TOKENS):
            continue

        pictures: list[str] = []
        main_pic = offer.findtext('picture', default='').strip()
        if main_pic:
            pictures.append(main_pic)
        for raw in picture_params:
            for part in raw.replace('\n', ',').split(','):
                url = part.strip()
                if not url:
                    continue
                if url.startswith('/'):
                    url = 'https://t-sib.ru' + url
                if url not in pictures:
                    pictures.append(url)

        offer_id = offer.get('id', '').strip()
        name = offer.findtext('name', default='').strip()
        url = offer.findtext('url', default='').strip()
        price_raw = offer.findtext('price', default='0').strip()
        try:
            price = int(float(price_raw))
        except ValueError:
            price = 0
        description = offer.findtext('description', default='').strip()
        available = (offer.get('available', 'true').lower() == 'true')
        category_id = offer.findtext('categoryId', default='').strip()
        category_name = categories.get(category_id, {}).get('name', '') if category_id else ''

        result.append({
            'offer_id': offer_id,
            'name': name,
            'url': url,
            'price': price,
            'description': description,
            'brand': brand_value,
            'available': available,
            'pictures': pictures,
            'params': params_list,
            'category_id': category_id,
            'category_name': category_name,
        })
    return result, categories


def sync_to_db(offers: list[dict[str, Any]], categories: dict[str, dict[str, str]]) -> int:
    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        used_cat_ids = {o['category_id'] for o in offers if o.get('category_id')}
        for cid in used_cat_ids:
            info = categories.get(cid, {})
            cname = (info.get('name') or '').replace("'", "''")
            parent = (info.get('parent_id') or '').replace("'", "''")
            safe_cid = cid.replace("'", "''")
            parent_sql = f"'{parent}'" if parent else 'NULL'
            cur.execute(f"""
                INSERT INTO daribo_categories (category_id, name, parent_id, updated_at)
                VALUES ('{safe_cid}', '{cname}', {parent_sql}, NOW())
                ON CONFLICT (category_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    parent_id = EXCLUDED.parent_id,
                    updated_at = NOW()
            """)

        existing_ids = [o['offer_id'] for o in offers if o['offer_id']]
        for o in offers:
            offer_id = o['offer_id'].replace("'", "''")
            name = o['name'].replace("'", "''")
            url = o['url'].replace("'", "''")
            description = o['description'].replace("'", "''")
            brand = o['brand'].replace("'", "''")
            pictures_json = json.dumps(o['pictures'], ensure_ascii=False).replace("'", "''")
            params_json = json.dumps(o['params'], ensure_ascii=False).replace("'", "''")
            price = o['price']
            available = 'TRUE' if o['available'] else 'FALSE'
            category_id = o.get('category_id', '').replace("'", "''")
            category_name = o.get('category_name', '').replace("'", "''")

            cur.execute(f"""
                INSERT INTO daribo_products (offer_id, name, url, price, description, brand, available, pictures, params, category_id, category_name, updated_at)
                VALUES ('{offer_id}', '{name}', '{url}', {price}, '{description}', '{brand}', {available}, '{pictures_json}'::jsonb, '{params_json}'::jsonb, '{category_id}', '{category_name}', NOW())
                ON CONFLICT (offer_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    url = EXCLUDED.url,
                    price = EXCLUDED.price,
                    description = EXCLUDED.description,
                    brand = EXCLUDED.brand,
                    available = EXCLUDED.available,
                    pictures = EXCLUDED.pictures,
                    params = EXCLUDED.params,
                    category_id = EXCLUDED.category_id,
                    category_name = EXCLUDED.category_name,
                    updated_at = NOW()
            """)

        if existing_ids:
            ids_list = ",".join("'" + i.replace("'", "''") + "'" for i in existing_ids)
            cur.execute(f"DELETE FROM daribo_products WHERE offer_id NOT IN ({ids_list})")
        else:
            cur.execute("DELETE FROM daribo_products")
        return len(offers)
    finally:
        cur.close()
        conn.close()


def handler(event: dict, context) -> dict:
    '''
    Синхронизирует каталог Daribo из XML-фида t-sib.ru.
    Вызывается планировщиком дважды в сутки (06:00 и 13:00 Новосибирск / 23:00 и 06:00 UTC).
    '''
    method = event.get('httpMethod', 'POST')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    try:
        xml_bytes = fetch_feed()
        offers, categories = parse_feed(xml_bytes)
        count = sync_to_db(offers, categories)
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'count': count}),
            'isBase64Encoded': False,
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': False, 'error': str(e)}),
            'isBase64Encoded': False,
        }
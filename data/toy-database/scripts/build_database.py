#!/usr/bin/env python3
"""
build_database.py - builds the "dolls & nounours" image database.

Creates, next to the scripts/ folder:
    images/dolls/*.png  images/nounours/*.png   the image files (512 x 512 PNG)
    toys_images.db                               SQLite: metadata + the images as BLOBs
    metadata.csv                                 the same metadata, without image data
    preview_contact_sheet.png                    every image as a thumbnail on one page

Usage:     python build_database.py [--per-category 60] [--seed 2026]
Requires:  Pillow  (pip install pillow)
"""
import argparse
import csv
import hashlib
import json
import math
import os
import random
import sqlite3

from PIL import Image, ImageDraw, ImageFont

import toy_art as art

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CATEGORIES = [  # slug, English name, French name, file prefix
    ('dolls', 'Dolls', 'Poupées', 'doll'),
    ('nounours', 'Teddy bears', 'Nounours', 'nounours'),
]

SCHEMA = """
CREATE TABLE categories (
    id      INTEGER PRIMARY KEY,
    slug    TEXT NOT NULL UNIQUE,            -- 'dolls' | 'nounours'
    name_en TEXT NOT NULL,
    name_fr TEXT NOT NULL
);

CREATE TABLE images (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    filename    TEXT NOT NULL UNIQUE,        -- relative path, e.g. dolls/doll_001.png
    title_en    TEXT NOT NULL,
    title_fr    TEXT NOT NULL,
    description TEXT,
    width       INTEGER NOT NULL,
    height      INTEGER NOT NULL,
    format      TEXT NOT NULL,               -- PNG
    file_size   INTEGER NOT NULL,            -- bytes
    sha256      TEXT NOT NULL,
    split       TEXT NOT NULL CHECK (split IN ('train', 'val', 'test')),
    source      TEXT NOT NULL DEFAULT 'synthetic',   -- 'synthetic', 'photo', ...
    attributes  TEXT,                        -- JSON: the parameters the picture was drawn with
    image_data  BLOB NOT NULL,               -- the PNG file itself
    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE image_tags (
    image_id INTEGER NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    tag_id   INTEGER NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
    PRIMARY KEY (image_id, tag_id)
);

CREATE INDEX idx_images_category ON images(category_id);
CREATE INDEX idx_images_split    ON images(split);
CREATE INDEX idx_image_tags_tag  ON image_tags(tag_id);

-- Easy browsing without the heavy BLOB column
CREATE VIEW v_images AS
SELECT i.id, c.slug AS category, c.name_fr AS categorie, i.filename,
       i.title_en, i.title_fr, i.split, i.source, i.width, i.height, i.file_size,
       (SELECT group_concat(t.name, ', ')
          FROM image_tags it JOIN tags t ON t.id = it.tag_id
         WHERE it.image_id = i.id) AS tags
FROM images i JOIN categories c ON c.id = i.category_id;
"""


def unique_params(slug, count, rng):
    maker = art.random_bear if slug == 'nounours' else art.random_doll
    seen, out, tries = set(), [], 0
    while len(out) < count:
        tries += 1
        if tries > 100000:
            raise SystemExit(f"Cannot make {count} different '{slug}' images; try a smaller number.")
        p = maker(rng)
        key = art.identity_key(p)
        if key not in seen:
            seen.add(key)
            out.append(p)
    return out


def make_splits(n, rng):
    """70 % train / 15 % val / 15 % test, shuffled."""
    order = list(range(n))
    rng.shuffle(order)
    n_train, n_val = round(n * .70), round(n * .15)
    labels = [None] * n
    for rank, i in enumerate(order):
        labels[i] = 'train' if rank < n_train else 'val' if rank < n_train + n_val else 'test'
    return labels


def contact_sheet(blocks, path, thumb=112, cols=12, gap=8, head=56):
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
    except OSError:
        font = ImageFont.load_default()
    width = cols * thumb + (cols + 1) * gap
    layout, y = [], gap
    for title, files in blocks:
        layout.append((title, files, y))
        y += head + math.ceil(len(files) / cols) * (thumb + gap)
    sheet = Image.new('RGB', (width, y + gap), (250, 248, 245))
    d = ImageDraw.Draw(sheet)
    for title, files, y0 in layout:
        d.text((gap + 4, y0 + 10), title, fill=(70, 55, 55), font=font)
        for i, f in enumerate(files):
            im = Image.open(f).convert('RGB').resize((thumb, thumb), Image.Resampling.LANCZOS)
            r, c = divmod(i, cols)
            sheet.paste(im, (gap + c * (thumb + gap), y0 + head + r * (thumb + gap)))
    sheet.save(path)


def build(per_category, seed, root):
    rng = random.Random(seed)
    os.makedirs(root, exist_ok=True)
    db_path = os.path.join(root, 'toys_images.db')
    if os.path.exists(db_path):
        os.remove(db_path)
    con = sqlite3.connect(db_path)
    con.execute('PRAGMA foreign_keys = ON')
    con.executescript(SCHEMA)

    blocks = []
    for slug, name_en, name_fr, prefix in CATEGORIES:
        cat_id = con.execute('INSERT INTO categories (slug, name_en, name_fr) VALUES (?, ?, ?)',
                             (slug, name_en, name_fr)).lastrowid
        folder = os.path.join(root, 'images', slug)
        os.makedirs(folder, exist_ok=True)
        for old in os.listdir(folder):                     # start from a clean folder
            if old.endswith('.png'):
                os.remove(os.path.join(folder, old))

        params = unique_params(slug, per_category, rng)
        splits = make_splits(len(params), rng)
        files = []
        for i, (p, split) in enumerate(zip(params, splits), start=1):
            rel = f"{slug}/{prefix}_{i:03d}.png"
            path = os.path.join(root, 'images', rel)
            img = art.render(p)
            img.save(path, optimize=True)
            with open(path, 'rb') as fh:
                data = fh.read()
            title_en, title_fr, desc, tags = art.describe(p)
            image_id = con.execute(
                'INSERT INTO images (category_id, filename, title_en, title_fr, description, width, height, '
                'format, file_size, sha256, split, source, attributes, image_data) '
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synthetic', ?, ?)",
                (cat_id, rel, title_en, title_fr, desc, img.width, img.height, 'PNG', len(data),
                 hashlib.sha256(data).hexdigest(), split, json.dumps(p, ensure_ascii=False), data)).lastrowid
            for t in tags:
                con.execute('INSERT OR IGNORE INTO tags (name) VALUES (?)', (t,))
                tag_id = con.execute('SELECT id FROM tags WHERE name = ?', (t,)).fetchone()[0]
                con.execute('INSERT OR IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)',
                            (image_id, tag_id))
            files.append(path)
        blocks.append((f"{name_en} / {name_fr}  ({len(files)})", files))
    con.commit()

    # metadata.csv (utf-8 with BOM so Excel shows the French accents correctly)
    rows = con.execute(
        "SELECT i.id, c.slug, i.filename, i.title_en, i.title_fr, i.description, i.split, i.source, "
        "i.width, i.height, i.file_size, i.sha256, "
        "(SELECT group_concat(t.name, '; ') FROM image_tags it JOIN tags t ON t.id = it.tag_id "
        " WHERE it.image_id = i.id), i.attributes "
        "FROM images i JOIN categories c ON c.id = i.category_id ORDER BY i.id").fetchall()
    with open(os.path.join(root, 'metadata.csv'), 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.writer(fh)
        w.writerow(['id', 'category', 'filename', 'title_en', 'title_fr', 'description', 'split', 'source',
                    'width', 'height', 'file_size', 'sha256', 'tags', 'attributes'])
        w.writerows(rows)

    contact_sheet(blocks, os.path.join(root, 'preview_contact_sheet.png'))
    con.execute('VACUUM')
    con.close()
    print(f"Done: {sum(len(f) for _, f in blocks)} images -> {db_path}")


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--per-category', type=int, default=60, help='images per category (default 60)')
    ap.add_argument('--seed', type=int, default=2026, help='random seed (default 2026)')
    ap.add_argument('--out', default=ROOT, help='output folder (default: parent of scripts/)')
    a = ap.parse_args()
    build(a.per_category, a.seed, a.out)

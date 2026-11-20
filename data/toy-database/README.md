# Dolls & Nounours — image database

120 original cartoon illustrations — **60 dolls (poupées)** and **60 teddy bears (nounours)** —
stored both as PNG files and inside a SQLite database, together with English + French titles,
tags and a train / val / test split.

The pictures are drawn by code (see `scripts/`), so they are copyright-free and you can generate
as many more as you like. They are illustrations, not photographs.

## Contents

```
toys_images.db               SQLite database (metadata + the images themselves as BLOBs)
metadata.csv                 the same metadata as a spreadsheet (no image data)
preview_contact_sheet.png    all 120 thumbnails on one page
images/dolls/doll_001.png …            512 x 512 PNG files
images/nounours/nounours_001.png …
scripts/                     the code that draws the images and builds the database
```

## Database tables

| table | what it holds |
|---|---|
| `categories` | `dolls` (Poupées) and `nounours` (Nounours) |
| `images` | one row per picture: `filename`, `title_en`, `title_fr`, `description`, size, `sha256`, `split`, `source`, `attributes` (JSON) and the PNG itself in `image_data` |
| `tags`, `image_tags` | searchable tags such as `crown`, `pigtails`, `blue dress` |
| `v_images` | a view of `images` without the heavy BLOB column, with tags joined into one text field |

`source` is `synthetic` for these drawings. Use another value (for example `photo`) if you later add real photos.

## Useful queries

```sql
-- everything in one list (no BLOBs)
SELECT * FROM v_images;

-- teddy bears with a crown
SELECT i.filename, i.title_fr
FROM images i
JOIN image_tags it ON it.image_id = i.id
JOIN tags t        ON t.id = it.tag_id
WHERE t.name = 'crown';

-- dolls with pigtails
SELECT filename, title_fr FROM v_images
WHERE category = 'dolls' AND tags LIKE '%pigtails%';

-- training set for an image classifier
SELECT filename, category FROM v_images WHERE split = 'train';
```

## Get an image out of the database (Python)

```python
import sqlite3

con = sqlite3.connect("toys_images.db")
data, = con.execute("SELECT image_data FROM images WHERE filename = ?",
                    ("dolls/doll_001.png",)).fetchone()
open("doll_001.png", "wb").write(data)
```

## Make more images

```
pip install pillow
cd scripts
python build_database.py --per-category 200 --seed 7
```

This rebuilds `toys_images.db`, `metadata.csv`, the preview sheet and the `images/` folders from
scratch — the existing ones are replaced.

import os
import json
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC
from PIL import Image
from io import BytesIO

# Folders
SONGS_DIR = "songs"
COVERS_DIR = "covers"
OUTPUT_JSON = "songs.json"

os.makedirs(COVERS_DIR, exist_ok=True)

songs = []

for filename in os.listdir(SONGS_DIR):
    if not filename.lower().endswith(".mp3"):
        continue

    filepath = os.path.join(SONGS_DIR, filename)
    print(f"Processing: {filename}")

    try:
        audio = MP3(filepath, ID3=ID3)
        tags = ID3(filepath)
    except Exception as e:
        print(f"Failed to read {filename}: {e}")
        continue

    # Extract title and artist with fallback to filename
    title = tags.get('TIT2')
    title = title.text[0] if title else os.path.splitext(filename)[0]

    artist = tags.get('TPE1')
    artist = artist.text[0] if artist else "Unknown Artist"

    # Extract cover art
    cover_path = None
    for tag in tags.values():
        if isinstance(tag, APIC):
            image = Image.open(BytesIO(tag.data))
            safe_title = "".join(c if c.isalnum() or c in " _-" else "_" for c in title)
            cover_filename = f"{safe_title}.jpg"
            cover_path = os.path.join(COVERS_DIR, cover_filename)
            image.save(cover_path)
            cover_path = f"./{COVERS_DIR}/{cover_filename}"
            print(f"Extracted cover for {title}")
            break

    if not cover_path:
        # No cover art found - optional: assign default cover image path
        cover_path = "./covers/default.jpg"

    """ 
    song_data = {
        "title": title,
        "artists": artist,
        "file": f"./{SONGS_DIR}/{filename}",
        "cover": cover_path
    }
    """
    song_data = {
        "title": title,
        "artists": artist,
        "file": filename,
        "cover": cover_path
    }
    songs.append(song_data)

# Write JSON file
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(songs, f, indent=2, ensure_ascii=False)

print(f"Generated {OUTPUT_JSON} with {len(songs)} songs.")

#script run: /Library/Frameworks/Python.framework/Versions/3.11/bin/python3 generate_songs_json.py
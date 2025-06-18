import os
import json
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
from supabase import create_client, Client

# === Load env ===
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# === Supabase ===
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# === Folders ===
SONGS_DIR = "songs"
COVERS_DIR = "covers"

os.makedirs(COVERS_DIR, exist_ok=True)

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

    # === Extract title & artist ===
    title = tags.get('TIT2')
    title = title.text[0] if title else os.path.splitext(filename)[0]

    artist = tags.get('TPE1')
    artist = artist.text[0] if artist else "Unknown Artist"

    # === Extract cover ===
    cover_path = None
    cover_filename = None
    for tag in tags.values():
        if isinstance(tag, APIC):
            image = Image.open(BytesIO(tag.data))
            safe_title = "".join(c if c.isalnum() or c in " _-" else "_" for c in title)
            cover_filename = f"{safe_title}.jpg"
            cover_path = os.path.join(COVERS_DIR, cover_filename)
            image.save(cover_path)
            print(f"Extracted cover for {title}")
            break

    # Upload song to Supabase
    song_storage_path = f"{filename}"
    with open(filepath, "rb") as f:
        supabase.storage.from_("songs").upload(song_storage_path, f, file_options={"upsert": True})
    song_public_url = supabase.storage.from_("songs").get_public_url(song_storage_path)

    # Upload cover to Supabase
    if cover_path:
        with open(cover_path, "rb") as f:
            supabase.storage.from_("covers").upload(cover_filename, f, file_options={"upsert": True})
        cover_public_url = supabase.storage.from_("covers").get_public_url(cover_filename)
    else:
        cover_public_url = "https://your-project.supabase.co/storage/v1/object/public/covers/default.jpg"

    # Insert song metadata into Supabase DB
    data = {
        "title": title,
        "artists": artist,
        "file_url": song_public_url,
        "cover_url": cover_public_url
    }

    response = supabase.table("songs").insert(data).execute()
    if response.error:
        print(f"❌ Error inserting {title}: {response.error.message}")
    else:
        print(f"✅ Uploaded and inserted: {title}")

print("All done.")

"""
Create LMS MongoDB collections with schema validation and indexes.
 
Collections:
1) module_content_items
2) media_files
3) test_question_media
"""
 
from datetime import datetime
from pymongo import MongoClient, ASCENDING
from pymongo.errors import CollectionInvalid
 
# -----------------------------
# Configuration
# -----------------------------
MONGODB_URI = "mongodb://localhost:27017"  # Change if needed
DB_NAME = "lms"                             # Your database name
 
# -----------------------------
# Helper: Create collection with validator and indexes
# -----------------------------
def ensure_collection(db, name, validator, indexes):
    """
    Create (or update validator for) a collection, then create indexes.
 
    :param db: Database handle
    :param name: Collection name
    :param validator: JSON schema validator dict
    :param indexes: List of (keys, options) tuples, e.g. [([("module_id", ASCENDING)], {"name": "idx_module_id"})]
    """
    try:
        # Try to create collection with validator
        db.create_collection(name, validator=validator)
        print(f"Created collection: {name}")
    except CollectionInvalid:
        print(f"Collection '{name}' already exists. Updating validator...")
        # Update validator if collection exists
        db.command({
            "collMod": name,
            "validator": validator,
            "validationLevel": "moderate",   # Change to 'strict' if you want stricter enforcement
            "validationAction": "error"
        })
        print(f"Updated validator for: {name}")
 
    # Create indexes (idempotent)
    for keys, options in indexes:
        idx_name = db[name].create_index(keys, **options)
        print(f"  Created index on '{name}': {idx_name}")
 
# -----------------------------
# Validators (JSON Schema)
# -----------------------------
# 1) module_content_items
module_content_items_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["module_id", "content_type", "title", "file_reference", "sequence_order", "created_at", "updated_at"],
        "properties": {
            "_id": {"bsonType": "objectId"},
            "module_id": {"bsonType": "string", "description": "UUID string referencing PostgreSQL modules.module_id"},
            "content_type": {
                "bsonType": "string",
                "enum": ["video", "pdf", "ppt", "document", "link"]
            },
            "title": {"bsonType": "string"},
            "description": {"bsonType": ["string", "null"]},
            "file_reference": {"bsonType": "string", "description": "S3 URL or file path"},
            "file_size_bytes": {"bsonType": ["int", "long", "double"], "minimum": 0},
            "duration_seconds": {"bsonType": ["int", "long", "double"], "minimum": 0},
            "thumbnail_url": {"bsonType": ["string", "null"]},
            "sequence_order": {"bsonType": ["int", "long"], "minimum": 0},
            "metadata": {
                "bsonType": "object",
                "required": ["format", "mime_type"],
                "properties": {
                    "format": {"bsonType": "string"},         # mp4, pdf, pptx
                    "resolution": {"bsonType": ["string", "null"]},  # 1080p, 720p
                    "mime_type": {"bsonType": "string"}       # video/mp4, application/pdf
                },
                "additionalProperties": True
            },
            "created_at": {"bsonType": "date"},
            "updated_at": {"bsonType": "date"}
        },
        "additionalProperties": True
    }
}
 
# 2) media_files
media_files_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["file_type", "title", "file_path", "encoding_status", "created_at", "updated_at"],
        "properties": {
            "_id": {"bsonType": "objectId"},
            "file_type": {
                "bsonType": "string",
                "enum": ["video", "audio", "pdf", "ppt", "image"]
            },
            "title": {"bsonType": "string"},
            "file_path": {"bsonType": "string"},
            "file_size_bytes": {"bsonType": ["int", "long", "double"], "minimum": 0},
            "duration_seconds": {"bsonType": ["int", "long", "double"], "minimum": 0},
            "thumbnail_path": {"bsonType": ["string", "null"]},
            "upload_metadata": {
                "bsonType": "object",
                "required": ["uploaded_by", "upload_date", "original_filename"],
                "properties": {
                    "uploaded_by": {"bsonType": "string", "description": "UUID referencing PostgreSQL users.user_id"},
                    "upload_date": {"bsonType": "date"},
                    "original_filename": {"bsonType": "string"}
                },
                "additionalProperties": True
            },
            "encoding_status": {
                "bsonType": "string",
                "enum": ["pending", "processing", "completed", "failed"]
            },
            "created_at": {"bsonType": "date"},
            "updated_at": {"bsonType": "date"}
        },
        "additionalProperties": True
    }
}
 
# 3) test_question_media
test_question_media_validator = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["question_id", "media_type", "file_reference", "created_at"],
        "properties": {
            "_id": {"bsonType": "objectId"},
            "question_id": {"bsonType": "string", "description": "UUID referencing PostgreSQL test_questions.question_id"},
            "media_type": {
                "bsonType": "string",
                "enum": ["image", "video", "audio"]
            },
            "file_reference": {"bsonType": "string"},
            "file_size_bytes": {"bsonType": ["int", "long", "double"], "minimum": 0},
            "metadata": {
                "bsonType": "object",
                "properties": {
                    "format": {"bsonType": "string"},
                    "dimensions": {"bsonType": ["string", "null"]},     # e.g., "1920x1080"
                    "duration_seconds": {"bsonType": ["int", "long", "double", "null"], "minimum": 0}
                },
                "additionalProperties": True
            },
            "created_at": {"bsonType": "date"}
        },
        "additionalProperties": True
    }
}
 
# -----------------------------
# Index definitions
# -----------------------------
module_content_items_indexes = [
    ([("module_id", ASCENDING)], {"name": "idx_module_id"}),
    ([("sequence_order", ASCENDING)], {"name": "idx_sequence_order"}),
    ([("module_id", ASCENDING), ("sequence_order", ASCENDING)], {"name": "idx_module_id_sequence_order"}),
]
 
media_files_indexes = [
    ([("file_type", ASCENDING)], {"name": "idx_file_type"}),
    ([("encoding_status", ASCENDING)], {"name": "idx_encoding_status"}),
    ([("upload_metadata.uploaded_by", ASCENDING)], {"name": "idx_upload_metadata_uploaded_by"}),
]
 
test_question_media_indexes = [
    ([("question_id", ASCENDING)], {"name": "idx_question_id"}),
    ([("media_type", ASCENDING)], {"name": "idx_media_type"}),
]
 
# -----------------------------
# Main
# -----------------------------
def main():
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    print(f"Connected to MongoDB at {MONGODB_URI}, database: {DB_NAME}")
 
    # Ensure collections
    ensure_collection(db, "module_content_items", module_content_items_validator, module_content_items_indexes)
    ensure_collection(db, "media_files", media_files_validator, media_files_indexes)
    ensure_collection(db, "test_question_media", test_question_media_validator, test_question_media_indexes)
 
    # Optional: Insert a tiny sample to verify (comment out in prod)
    now = datetime.utcnow()
    db.module_content_items.insert_one({
        "module_id": "b9f2e7f4-2a8a-4e8b-9f6f-123456789abc",
        "content_type": "video",
        "title": "Intro to Compliance",
        "description": "Overview video",
        "file_reference": "s3://bucket/key/intro.mp4",
        "file_size_bytes": 1024 * 1024 * 50,
        "duration_seconds": 600,
        "thumbnail_url": "s3://bucket/key/intro-thumb.jpg",
        "sequence_order": 1,
        "metadata": {
            "format": "mp4",
            "resolution": "1080p",
            "mime_type": "video/mp4"
        },
        "created_at": now,
        "updated_at": now
    })
    print("Inserted sample document into 'module_content_items' (for quick validation).")
 
    print("\nDone. Collections and indexes are ready.")
 
if __name__ == "__main__":
    main()
 
 
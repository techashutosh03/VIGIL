from rapidfuzz import fuzz
from metaphone import doublemetaphone
import re

NOISE_WORDS = {
    "pvt", "ltd", "private", "limited", "college", "coll", "institute", "inst",
    "of", "technology", "tech", "engineering", "engg", "the", "and"
}

def normalize_name(name: str) -> str:
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s]", " ", name)
    tokens = [t for t in name.split() if t not in NOISE_WORDS]
    cleaned = " ".join(tokens).strip()
    return cleaned if cleaned else name.strip()

def phonetic_match(a: str, b: str) -> bool:
    pa = doublemetaphone(a)
    pb = doublemetaphone(b)
    return bool(set(pa) & set(pb) and pa[0] != "")

def fuzzy_score(name_a: str, name_b: str) -> dict:
    norm_a, norm_b = normalize_name(name_a), normalize_name(name_b)
    token_sort = fuzz.token_sort_ratio(norm_a, norm_b)
    partial = fuzz.partial_ratio(norm_a, norm_b)
    phonetic = 100 if phonetic_match(norm_a, norm_b) else 0

    combined = token_sort * 0.5 + partial * 0.3 + phonetic * 0.2
    return {
        "normalized_a": norm_a,
        "normalized_b": norm_b,
        "token_sort_ratio": token_sort,
        "partial_ratio": partial,
        "phonetic_match": phonetic == 100,
        "combined_score": round(combined, 2),
    }

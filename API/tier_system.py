from typing import TypedDict

class TierInfo(TypedDict):
    name: str
    level: int
    threshold: int

TIERS = [
    {"name": "None", "level": 0, "threshold": 0},
    {"name": "Bronze", "level": 1, "threshold": 30},
    {"name": "Silver", "level": 2, "threshold": 80},
    {"name": "Gold", "level": 3, "threshold": 130},
    {"name": "Platinum", "level": 4, "threshold": 210},
]

def get_tier_info(exp: int) -> TierInfo:
    """Calculates the current tier based on accumulated EXP."""
    current_tier = TIERS[0]
    for tier in TIERS:
        if exp >= tier["threshold"]:
            current_tier = tier
        else:
            break
    return current_tier

def get_next_tier_info(exp: int) -> TierInfo | None:
    """Returns the information for the next tier level."""
    for tier in TIERS:
        if tier["threshold"] > exp:
            return tier
    return None

def get_tier_below(exp: int) -> int:
    """Returns the EXP threshold for the tier immediately below the current one.
    Used for semester resets."""
    current_level = get_tier_info(exp)["level"]
    if current_level <= 0:
        return 0
    # Level X is at index X. Level X-1 is at index X-1.
    return TIERS[current_level - 1]["threshold"]

EXP_REWARDS = {
    "review": 10,
    "doc_resumo": 30,
    "doc_other": 20
}

"""Gamification service for managing streaks, XP, levels, and achievements."""

from datetime import date, timedelta
from typing import Any

from supabase import Client


class GamificationService:
    """Service for managing gamification features."""

    # XP thresholds for levels
    LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000]

    # Achievement definitions
    ACHIEVEMENTS = {
        "first_practice": {
            "title": "First Steps",
            "description": "Complete your first practice session",
            "icon": "🎯",
        },
        "streak_3": {
            "title": "Getting Started",
            "description": "Maintain a 3-day streak",
            "icon": "🔥",
        },
        "streak_7": {
            "title": "Week Warrior",
            "description": "Maintain a 7-day streak",
            "icon": "💪",
        },
        "streak_30": {
            "title": "Monthly Master",
            "description": "Maintain a 30-day streak",
            "icon": "👑",
        },
        "practice_10": {
            "title": "Dedicated Learner",
            "description": "Complete 10 practice sessions",
            "icon": "📚",
        },
        "practice_50": {
            "title": "Persistent Student",
            "description": "Complete 50 practice sessions",
            "icon": "🌟",
        },
        "practice_100": {
            "title": "Century Club",
            "description": "Complete 100 practice sessions",
            "icon": "💯",
        },
        "perfect_score": {
            "title": "Perfectionist",
            "description": "Achieve a 100% score",
            "icon": "✨",
        },
        "high_scorer": {
            "title": "High Achiever",
            "description": "Average score above 90%",
            "icon": "⭐",
        },
        "level_5": {"title": "Rising Star", "description": "Reach level 5", "icon": "🚀"},
        "level_10": {"title": "Expert Learner", "description": "Reach level 10", "icon": "🏆"},
    }

    def __init__(self, db: Client):
        """Initialize gamification service."""
        self.db = db

    async def update_streak(self, user_id: str) -> dict[str, int]:
        """
        Update user's streak based on last practice date.

        Logic:
        - If last_practice_date is yesterday: increment streak
        - If last_practice_date is today: keep current streak
        - Otherwise: reset to 1

        Args:
            user_id: User's ID

        Returns:
            Dictionary with current_streak and longest_streak
        """
        # Get current user stats
        stats_response = self.db.table("user_stats").select("*").eq("user_id", user_id).execute()

        today = date.today()

        if not stats_response.data:
            # Create new stats
            new_stats = {
                "user_id": user_id,
                "current_streak": 1,
                "longest_streak": 1,
                "last_practice_date": today.isoformat(),
            }
            self.db.table("user_stats").insert(new_stats).execute()
            return {"current_streak": 1, "longest_streak": 1}

        stats = stats_response.data[0]
        last_practice_str = stats.get("last_practice_date")

        if last_practice_str:
            last_practice = date.fromisoformat(last_practice_str)
            yesterday = today - timedelta(days=1)

            if last_practice == yesterday:
                # Increment streak
                current_streak = stats["current_streak"] + 1
            elif last_practice == today:
                # Already practiced today, keep current streak
                current_streak = stats["current_streak"]
            else:
                # Streak broken, reset to 1
                current_streak = 1
        else:
            # No previous practice
            current_streak = 1

        # Update longest streak if needed
        longest_streak = max(stats.get("longest_streak", 0), current_streak)

        # Update database
        self.db.table("user_stats").update(
            {
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "last_practice_date": today.isoformat(),
            }
        ).eq("user_id", user_id).execute()

        return {"current_streak": current_streak, "longest_streak": longest_streak}

    def calculate_xp_gain(self, score: float, duration_seconds: int) -> int:
        """
        Calculate XP gained from a practice session.

        Formula: XP = score × duration_seconds / 10

        Args:
            score: Score achieved (0-100)
            duration_seconds: Duration of practice

        Returns:
            XP gained
        """
        xp = int(score * duration_seconds / 10)
        return max(xp, 1)  # Minimum 1 XP

    def calculate_level(self, total_xp: int) -> int:
        """
        Calculate level based on total XP.

        Args:
            total_xp: Total XP earned

        Returns:
            Current level
        """
        level = 1
        for threshold in self.LEVEL_THRESHOLDS:
            if total_xp >= threshold:
                level += 1
            else:
                break
        return level - 1

    async def update_stats(
        self, user_id: str, score: float, duration_seconds: int
    ) -> dict[str, Any]:
        """
        Update user statistics after a practice session.

        Args:
            user_id: User's ID
            score: Score achieved
            duration_seconds: Duration of practice

        Returns:
            Updated stats dictionary
        """
        # Calculate XP gain
        xp_gained = self.calculate_xp_gain(score, duration_seconds)

        # Get current stats
        stats_response = self.db.table("user_stats").select("*").eq("user_id", user_id).execute()

        if not stats_response.data:
            # Create new stats
            total_xp = xp_gained
            total_practices = 1
            total_time = duration_seconds
            average_score = score
        else:
            stats = stats_response.data[0]
            total_xp = stats.get("total_xp", 0) + xp_gained
            total_practices = stats.get("total_practices", 0) + 1
            total_time = stats.get("total_time_seconds", 0) + duration_seconds

            # Calculate new average score
            old_avg = stats.get("average_score", 0)
            old_count = stats.get("total_practices", 0)
            average_score = round((old_avg * old_count + score) / total_practices, 2)

        # Calculate level
        level = self.calculate_level(total_xp)

        # Update database
        updated_stats = {
            "total_xp": total_xp,
            "level": level,
            "total_practices": total_practices,
            "total_time_seconds": total_time,
            "average_score": average_score,
        }

        self.db.table("user_stats").update(updated_stats).eq("user_id", user_id).execute()

        return {**updated_stats, "xp_gained": xp_gained}

    async def check_achievements(
        self,
        user_id: str,
        score: float,
        current_streak: int,
        total_practices: int,
        level: int,
        average_score: float,
    ) -> list[dict[str, str]]:
        """
        Check and unlock achievements.

        Args:
            user_id: User's ID
            score: Latest score
            current_streak: Current streak
            total_practices: Total practice count
            level: Current level
            average_score: Average score

        Returns:
            List of newly unlocked achievements
        """
        # Get existing achievements
        existing_response = (
            self.db.table("achievements")
            .select("achievement_type")
            .eq("user_id", user_id)
            .execute()
        )
        existing_types = {ach["achievement_type"] for ach in existing_response.data}

        new_achievements = []

        # Check achievement conditions
        achievements_to_unlock = []

        if "first_practice" not in existing_types and total_practices >= 1:
            achievements_to_unlock.append("first_practice")

        if "streak_3" not in existing_types and current_streak >= 3:
            achievements_to_unlock.append("streak_3")

        if "streak_7" not in existing_types and current_streak >= 7:
            achievements_to_unlock.append("streak_7")

        if "streak_30" not in existing_types and current_streak >= 30:
            achievements_to_unlock.append("streak_30")

        if "practice_10" not in existing_types and total_practices >= 10:
            achievements_to_unlock.append("practice_10")

        if "practice_50" not in existing_types and total_practices >= 50:
            achievements_to_unlock.append("practice_50")

        if "practice_100" not in existing_types and total_practices >= 100:
            achievements_to_unlock.append("practice_100")

        if "perfect_score" not in existing_types and score >= 100:
            achievements_to_unlock.append("perfect_score")

        if "high_scorer" not in existing_types and average_score >= 90:
            achievements_to_unlock.append("high_scorer")

        if "level_5" not in existing_types and level >= 5:
            achievements_to_unlock.append("level_5")

        if "level_10" not in existing_types and level >= 10:
            achievements_to_unlock.append("level_10")

        # Unlock new achievements
        for achievement_type in achievements_to_unlock:
            achievement_data = self.ACHIEVEMENTS[achievement_type]
            new_achievement = {
                "user_id": user_id,
                "achievement_type": achievement_type,
                "title": achievement_data["title"],
                "description": achievement_data["description"],
                "icon": achievement_data["icon"],
            }

            self.db.table("achievements").insert(new_achievement).execute()
            new_achievements.append(new_achievement)

        return new_achievements

    async def update_daily_goal(self, user_id: str) -> dict[str, Any]:
        """
        Update daily goal progress.

        Args:
            user_id: User's ID

        Returns:
            Updated daily goal data
        """
        today = date.today()

        # Get or create today's goal
        goal_response = (
            self.db.table("daily_goals")
            .select("*")
            .eq("user_id", user_id)
            .eq("goal_date", today.isoformat())
            .execute()
        )

        if not goal_response.data:
            # Create new daily goal
            new_goal = {
                "user_id": user_id,
                "target_count": 5,
                "completed_count": 1,
                "goal_date": today.isoformat(),
            }
            self.db.table("daily_goals").insert(new_goal).execute()
            return new_goal
        else:
            # Increment completed count
            goal = goal_response.data[0]
            completed_count = goal["completed_count"] + 1

            self.db.table("daily_goals").update({"completed_count": completed_count}).eq(
                "id", goal["id"]
            ).execute()

            return {**goal, "completed_count": completed_count}

"""Run: python seed.py  (from backend/ with venv active)"""
import asyncio
from app.db.session import AsyncSessionLocal, engine
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.board import Board, BoardType, BoardPost
from app.models.mentorship import Mentorship, MentorshipStatus
from app.core.security import hash_password
import app.models  # noqa


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check already seeded
        from sqlalchemy import select
        existing = await db.execute(select(User).where(User.email == "admin@nexus.africa"))
        if existing.scalar_one_or_none():
            print("Already seeded — skipping")
            return

        # Mentors
        mentors = [
            User(name="Dr. James Mwangi", email="james.mwangi@nexus.africa", hashed_password=hash_password("password123"),
                 role=UserRole.MENTOR, title="Group CEO", company="Equity Bank Group",
                 bio="25 years leading digital transformation across Africa. Passionate about fintech and inclusive banking.", skills="Digital Transformation,Fintech,Leadership,Strategy"),
            User(name="Dr. Sarah Nabuuma", email="sarah.nabuuma@nexus.africa", hashed_password=hash_password("password123"),
                 role=UserRole.MENTOR, title="Chief Information Officer", company="MTN Uganda",
                 bio="CIO with 18 years in telecom and technology. Champion of women in STEM across East Africa.", skills="IT Strategy,Cloud,Telecoms,Women in Tech,Agile"),
            User(name="Prof. Kwame Asante", email="kwame.asante@nexus.africa", hashed_password=hash_password("password123"),
                 role=UserRole.MENTOR, title="Chief Digital Officer", company="Stanbic Bank Ghana",
                 bio="Former academic turned digital leader. Building Africa's next generation of tech executives.", skills="Data Analytics,AI/ML,Banking,Digital Innovation"),
            User(name="Amina Hassan", email="amina.hassan@nexus.africa", hashed_password=hash_password("password123"),
                 role=UserRole.MENTOR, title="VP Technology", company="Safaricom Kenya",
                 bio="Led M-PESA's international expansion. Expert in mobile money and platform engineering.", skills="Mobile Money,Platform Engineering,Product Strategy,M-Pesa"),
        ]
        for m in mentors:
            db.add(m)

        # Mentees
        mentees = [
            User(name="Brian Otieno", email="brian.otieno@nexus.africa", hashed_password=hash_password("password123"),
                 role=UserRole.MENTEE, title="IT Manager", company="Kenya Revenue Authority",
                 bio="Aspiring CIO. 8 years in government IT, looking to transition to digital leadership."),
            User(name="Grace Achieng", email="grace.achieng@nexus.africa", hashed_password=hash_password("password123"),
                 role=UserRole.MENTEE, title="Software Engineer", company="Andela",
                 bio="Full-stack developer aiming to move into product and technology leadership."),
            User(name="Moses Ssemakula", email="moses.ssemakula@nexus.africa", hashed_password=hash_password("password123"),
                 role=UserRole.MENTEE, title="Digital Innovation Lead", company="Stanbic Bank Uganda",
                 bio="Driving fintech innovation. Seeking mentorship to scale impact across the continent."),
        ]
        for m in mentees:
            db.add(m)

        # Admin
        admin = User(name="Nexus Admin", email="admin@nexus.africa", hashed_password=hash_password("admin1234"),
                     role=UserRole.ADMIN, title="Platform Administrator", company="Nexus CIO/CxO Africa")
        db.add(admin)

        await db.commit()

        # Refresh all to get IDs
        for u in mentors + mentees + [admin]:
            await db.refresh(u)

        # Boards
        board1 = Board(
            title="Happy Birthday, Dr. Sarah! 🎂",
            description="Wishing our incredible CIO a wonderful birthday from the entire community",
            board_type=BoardType.BIRTHDAY,
            creator_id=mentees[0].id,
            recipient_id=mentors[1].id,
            cover_color="#e91e8c",
        )
        board2 = Board(
            title="Welcome to the Community, Brian! 🎉",
            description="Welcoming our newest community member",
            board_type=BoardType.APPRECIATION,
            creator_id=admin.id,
            recipient_id=mentees[0].id,
            cover_color="#4A8C2A",
        )
        board3 = Board(
            title="Congratulations on Completing the Mentorship Program, Grace! 🏆",
            board_type=BoardType.SIGNOFF,
            creator_id=mentors[2].id,
            recipient_id=mentees[1].id,
            cover_color="#D1A24E",
        )
        for b in [board1, board2, board3]:
            db.add(b)
        await db.commit()
        for b in [board1, board2, board3]:
            await db.refresh(b)

        # Posts
        posts = [
            BoardPost(board_id=board1.id, author_name="Prof. Kwame Asante", author_email="kwame.asante@nexus.africa",
                      message="Happy birthday, Sarah! Your leadership at MTN has been an inspiration to us all. Wishing you an amazing year ahead! 🎉", bg_color="#fce7f3"),
            BoardPost(board_id=board1.id, author_name="Amina Hassan",
                      message="Sarah, thank you for being a role model for women in tech across Africa. Happy birthday! 🌟", bg_color="#dcfce7"),
            BoardPost(board_id=board1.id, author_name="Brian Otieno",
                      message="Dr. Nabuuma, your mentorship has changed my career trajectory. Wishing you the best birthday! 🙏", bg_color="#dbeafe"),
            BoardPost(board_id=board2.id, author_name="Dr. Sarah Nabuuma",
                      message="Welcome Brian! So happy to have you in the community. The journey ahead is exciting! 🚀", bg_color="#dcfce7"),
            BoardPost(board_id=board2.id, author_name="Dr. James Mwangi",
                      message="Welcome aboard! This community is the best place to grow as a leader. 🌍", bg_color="#fef9c3"),
            BoardPost(board_id=board3.id, author_name="Prof. Kwame Asante",
                      message="Grace, you've been one of the most dedicated mentees I've ever worked with. The future is bright for you! Congratulations! 🎓", bg_color="#fef9c3"),
        ]
        for p in posts:
            db.add(p)

        # Mentorships
        m1 = Mentorship(mentor_id=mentors[1].id, mentee_id=mentees[0].id, status=MentorshipStatus.ACTIVE,
                        message="I admire your work at MTN and would love guidance on transitioning to CIO level.",
                        goals="Develop IT strategy skills, build executive presence, network with other CIOs")
        m2 = Mentorship(mentor_id=mentors[2].id, mentee_id=mentees[1].id, status=MentorshipStatus.COMPLETED,
                        message="I want to learn data-driven decision making from your experience.",
                        goals="Master data analytics for leadership, build a personal brand in tech")
        m3 = Mentorship(mentor_id=mentors[0].id, mentee_id=mentees[2].id, status=MentorshipStatus.PENDING,
                        message="Your leadership journey from banking to digital innovation is inspiring. I'd love to learn from you.",
                        goals="Scale digital innovation across branches, learn enterprise architecture")
        for m in [m1, m2, m3]:
            db.add(m)

        await db.commit()
        print("✅ Seed complete!")
        print("\nDemo accounts (all password: password123):")
        print("  Mentors:")
        for m in mentors:
            print(f"    {m.email}")
        print("  Mentees:")
        for m in mentees:
            print(f"    {m.email}")
        print("  Admin: admin@nexus.africa / admin1234")


if __name__ == "__main__":
    asyncio.run(seed())

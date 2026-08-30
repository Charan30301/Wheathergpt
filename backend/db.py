import os

from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    Integer,
    String,
    Text
)

from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column
)

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker
)


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/weathergpt"
)


class Base(DeclarativeBase):
    pass


class WeatherQuery(Base):

    __tablename__ = "weather_queries"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    location_name: Mapped[str] = mapped_column(
        String(200)
    )

    lat: Mapped[float] = mapped_column(
        Float
    )

    lon: Mapped[float] = mapped_column(
        Float
    )

    language: Mapped[str] = mapped_column(
        String(20),
        default="en"
    )

    mode: Mapped[str] = mapped_column(
        String(30),
        default="weather"
    )

    query: Mapped[str] = mapped_column(
        Text
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )


engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False
)


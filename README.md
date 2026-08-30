# WeatherGPT

Next.js + TypeScript + Tailwind frontend and FastAPI backend.

Features:

- First-launch language selection persisted in localStorage
- ChatGPT-like weather home
- Interactive 3D globe with the active location's temperature directly on/near the globe
- Browser geolocation
- Live map opened from the search bar
- Current location shown before searching
- Map click/search changes the active weather location
- 7-day weather calendar at the bottom
- Weather / Farmer / Traveler modes
- Traveler GPS tracking
- Farmer crop suggestions
- Text chat + browser voice input/output
- Selected-language replies
- Weather visual effects for rain, storm, clouds and clear sky
- FastAPI weather/geocoding/crop/chat endpoints
- PostgreSQL-ready SQLAlchemy model
- Simple local RAG fallback

## Frontend

Requires Node 20+.

```bash
npm install
npm run dev

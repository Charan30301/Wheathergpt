"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  Crosshair,
  Search,
  LoaderCircle
} from "lucide-react";

type Location = {
  name: string;
  country?: string;
  lat: number;
  lon: number;
};

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function Recenter({
  location
}: {
  location: Location;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(
      [
        location.lat,
        location.lon
      ],
      Math.max(
        map.getZoom(),
        5
      ),
      {
        duration: 1.1
      }
    );
  }, [
    location,
    map
  ]);

  return null;
}

function ClickHandler({
  onSelect
}: {
  onSelect: (
    lat: number,
    lon: number
  ) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect(
        event.latlng.lat,
        event.latlng.lng
      );
    }
  });

  return null;
}

const markerIcon =
  new L.Icon({
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [
      12,
      41
    ],

    popupAnchor: [
      1,
      -34
    ],

    shadowSize: [
      41,
      41
    ]
  });

export default function LiveMap({
  current,
  query,
  onSelect,
  onLocate
}: {
  current: Location;
  query: string;

  onSelect: (
    location: Location
  ) => void;

  onLocate: () => void;
}) {
  const [results, setResults] =
    useState<Location[]>(
      []
    );

  const [searching, setSearching] =
    useState(false);

  const currentMarker =
    useMemo(
      () =>
        [
          current.lat,
          current.lon
        ] as [
          number,
          number
        ],
      [current]
    );

  async function search(
    value: string
  ) {
    if (!value.trim())
      return;

    setSearching(true);

    try {
      const r =
        await fetch(
          `${API}/api/geocode/search?q=${encodeURIComponent(
            value
          )}`
        );

      setResults(
        await r.json()
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="live-map">
      <div className="map-search-row">
        <Search size={17} />

        <input
          defaultValue={query}
          placeholder="Search city, village, landmark or coordinates"
          onKeyDown={(e) =>
            e.key ===
              "Enter" &&
            search(
              e.currentTarget
                .value
            )
          }
        />

        <button
          onClick={() => {
            const input =
              document.querySelector(
                ".map-search-row input"
              ) as HTMLInputElement | null;

            if (input) {
              search(
                input.value
              );
            }
          }}
        >
          {searching ? (
            <LoaderCircle
              className="spin"
              size={17}
            />
          ) : (
            "Search"
          )}
        </button>

        <button
          onClick={onLocate}
        >
          <Crosshair
            size={17}
          />

          Current
        </button>
      </div>

      {results.length > 0 && (
        <div className="map-results">
          {results
            .slice(0, 6)
            .map(
              (
                result,
                i
              ) => (
                <button
                  key={`${result.lat}-${result.lon}-${i}`}
                  onClick={() =>
                    onSelect(
                      result
                    )
                  }
                >
                  <strong>
                    {result.name}
                  </strong>

                  <span>
                    {
                      result.country
                    }
                  </span>
                </button>
              )
            )}
        </div>
      )}

      <MapContainer
        center={currentMarker}
        zoom={5}
        className="leaflet-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Recenter
          location={current}
        />

        <Marker
          position={
            currentMarker
          }
          icon={
            markerIcon
          }
        >
          <Popup>
            <strong>
              {current.name}
            </strong>
            <br />
            Active weather
            location
          </Popup>
        </Marker>

        <ClickHandler
          onSelect={async (
            lat,
            lon
          ) => {
            const r =
              await fetch(
                `${API}/api/geocode/reverse?lat=${lat}&lon=${lon}`
              );

            const data =
              await r.json();

            onSelect({
              name:
                data.name ||
                "Selected map point",
              country:
                data.country ||
                "",
              lat,
              lon
            });
          }}
        />
      </MapContainer>
    </div>
  );
}

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
  lat: number;
  lng: number;
  title: string;
  logoUrl?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ lat, lng, title, logoUrl }) => {
  const customIcon = logoUrl ? L.icon({
    iconUrl: logoUrl,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30],
    className: 'rounded-full border-2 border-brand-primary bg-white shadow-lg p-1'
  }) : DefaultIcon;

  return (
    <div className="w-full h-full min-h-[400px]">
      <MapContainer 
        center={[lat, lng]} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full rounded-3xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={customIcon}>
          <Popup>
            <div className="text-center p-2">
              <p className="font-black text-brand-text uppercase tracking-tight">{title}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap;

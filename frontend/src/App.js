import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import L, { marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';


const App = () => {

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const socket = useRef();
  let markers = {}
  // const [markers,setMarkers]=useState({});
  useEffect(() => {
    socket.current = io('ws://localhost:9000');
  }, [])
  useEffect(() => {
    // Initialize the map instance
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.current.emit('send-location', { latitude, longitude });

      },
        (err) => {
          console.log(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
    }
  }, [])

  useEffect(() => {
    if (mapRef.current) return; // If the map is already initialized, do nothing
    mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '©OpenStreetMap contributors'
    }).addTo(mapRef.current);

  }, [])

  useEffect(() => {

    socket.current.on('recieve-location', (data) => {
      const { id, longitude, latitude } = data;
      mapRef.current.setView([latitude, longitude])
      if (markers[id]) {
        markers[id].setLatLng([latitude, longitude])
      }
      else {
        markers[id] = L.marker([latitude, longitude]).addTo(mapRef.current)
      }
    })
  }, [])
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      socket.current.emit('diconnected');
    };

    window.addEventListener('unload', handleBeforeUnload);

    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    // };
  }, []);

  useEffect(() => {
    socket.current.on('user-disconnected', (id) => {
      if (markers[id]) {
        mapRef.current.removeLayer(markers[id])
        delete markers[id]
      }
    })
  }, [])

  return (
    <>
      <div ref={mapContainerRef} id="map" className='w-full h-screen'></div>
    </>
  )
}

export default App


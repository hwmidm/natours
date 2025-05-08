/* eslint-disable */
export const displayMap = locations => {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof maplibregl === 'undefined') {
      console.error('MapLibre GL JS بارگذاری نشده!');
      return;
    }

    const mapElement = document.getElementById('map');



    maplibregl.accessToken = 'NO_TOKEN_NEEDED';

    const map = new maplibregl.Map({
      container: 'map',
      style:
        'https://api.maptiler.com/maps/streets-v2/style.json?key=bxiJzSzJF8UeNiTIc9fp',
      center: [-118.113491, 34.111745],
      zoom: 1,
      interactive: true,
      scrollZoom: false
    });

    map.on('load', () => {
      map.resize();

      const bounds = new maplibregl.LngLatBounds();

      locations.forEach(location => {
        const { coordinates, description, day } = location;

        const el = document.createElement('div');
        el.className = 'marker';

        new maplibregl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat(coordinates)
          .setPopup(
            new maplibregl.Popup({ offset: 30 }).setHTML(
              `<p>Day ${day} : ${description}</p>`
            )
          )
          .addTo(map);

        bounds.extend(coordinates);
      });

      map.fitBounds(bounds, {
        padding: { top: 200, bottom: 150, left: 100, right: 100 }
      });
    });
  });
};

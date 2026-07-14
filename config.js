// MCEF 3D Viewer — data configuration
//
// This is the ONLY file you need to edit to add your real reconstruction data.
//  - lat / lng : pin location on the map (WGS84 decimal degrees)
//  - url       : must be a CORS-enabled URL pointing to a .ply point cloud
//                (see README.md → "CORS"). ASCII or binary PLY both work;
//                binary is much faster for large files (see README → "Performance").
//
// The coordinates below are public approximations used as placeholders —
// adjust them to the real collection sites.

export const SITES = [
  {
    id: 'potoi',
    name: 'Po Toi Island',
    lat: 22.172185,
    lng: 114.278082,
    description: 'Underwater 3D reconstructions collected off Po Toi Island, southern Hong Kong.',
    reconstructions: [
      { id: 'potoi-1', title: 'Po Toi — Scene 1', url: 'https://statics.hkustvgd.com/viser/potoi_19.ply' },
      { id: 'potoi-2', title: 'Po Toi — Scene 2', url: 'https://statics.hkustvgd.com/viser/potoi_36.ply' },
      { id: 'potoi-3', title: 'Po Toi — Scene 3', url: 'https://statics.hkustvgd.com/viser/potoi_37.ply' },
      { id: 'potoi-4', title: 'Po Toi — Scene 4', url: 'https://statics.hkustvgd.com/viser/potoi_41.ply' },
      { id: 'potoi-5', title: 'Po Toi — Scene 5', url: 'https://statics.hkustvgd.com/viser/potoi_42.ply' },
      { id: 'potoi-6', title: 'Po Toi — Scene 6', url: 'https://statics.hkustvgd.com/viser/potoi_43.ply' },
    ],
  },
  {
    id: 'portshelter',
    name: 'Port Shelter',
    lat: 22.332405,
    lng: 114.291133,
    description: 'Underwater 3D reconstructions collected off Port Shelter, southern Hong Kong.',
    reconstructions: [
      { id: 'portshelter-1', title: 'Port Shelter — Scene 1', url: 'https://statics.hkustvgd.com/viser/saikung_13.ply' },
      { id: 'portshelter-2', title: 'Port Shelter — Scene 2', url: 'https://statics.hkustvgd.com/viser/saikung_18.ply' },
    ],
  },
  {
    id: 'lamma',
    name: 'Lamma Island',
    lat: 22.184674,
    lng: 114.138458,
    description: 'Underwater 3D reconstructions collected around Lamma Island.',
    reconstructions: [
      { id: 'lamma-1', title: 'Lamma — Scene 1', url: 'https://statics.hkustvgd.com/viser/potoi_19.ply' },
      { id: 'lamma-2', title: 'Lamma — Scene 2', url: 'https://statics.hkustvgd.com/viser/potoi_41.ply' },
    ],
  },
  {
    id: 'soko',
    name: 'Soko Islands',
    lat: 22.178610,
    lng: 113.917433,
    description: 'Underwater 3D reconstructions collected around the Soko Islands.',
    reconstructions: [
      { id: 'soko-1', title: 'Soko — Scene 1', url: 'https://statics.hkustvgd.com/viser/potoi_37.ply' },
      { id: 'soko-2', title: 'Soko — Scene 2', url: 'https://statics.hkustvgd.com/viser/potoi_41.ply' },
    ],
  },
];
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
    lat: 22.1628,
    lng: 114.2553,
    description: 'Underwater 3D reconstructions collected off Po Toi Island, southern Hong Kong.',
    reconstructions: [
      { id: 'potoi-1', title: 'Po Toi — Scene 1', url: 'https://PLACEHOLDER.example/potoi_1.ply' },
      { id: 'potoi-2', title: 'Po Toi — Scene 2', url: 'https://PLACEHOLDER.example/potoi_2.ply' },
      { id: 'potoi-3', title: 'Po Toi — Scene 3', url: 'https://PLACEHOLDER.example/potoi_3.ply' },
    ],
  },
  {
    id: 'lamma',
    name: 'Lamma Island',
    lat: 22.2083,
    lng: 114.1083,
    description: 'Underwater 3D reconstructions collected around Lamma Island.',
    reconstructions: [
      { id: 'lamma-1', title: 'Lamma — Scene 1', url: 'https://PLACEHOLDER.example/lamma_1.ply' },
      { id: 'lamma-2', title: 'Lamma — Scene 2', url: 'https://PLACEHOLDER.example/lamma_2.ply' },
    ],
  },
  {
    id: 'soko',
    name: 'Soko Islands',
    lat: 22.2083,
    lng: 113.9167,
    description: 'Underwater 3D reconstructions collected around the Soko Islands.',
    reconstructions: [
      { id: 'soko-1', title: 'Soko — Scene 1', url: 'https://PLACEHOLDER.example/soko_1.ply' },
      { id: 'soko-2', title: 'Soko — Scene 2', url: 'https://PLACEHOLDER.example/soko_2.ply' },
    ],
  },
  {
    id: 'sharp',
    name: 'Sharp Island',
    lat: 22.3733,
    lng: 114.2967,
    description: 'Underwater 3D reconstructions collected around Sharp Island (Kiu Tsui).',
    reconstructions: [
      { id: 'sharp-1', title: 'Sharp Island — Scene 1', url: 'https://PLACEHOLDER.example/sharp_1.ply' },
      { id: 'sharp-2', title: 'Sharp Island — Scene 2', url: 'https://PLACEHOLDER.example/sharp_2.ply' },
    ],
  },
];

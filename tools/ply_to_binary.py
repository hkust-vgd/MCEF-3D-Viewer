#!/usr/bin/env python3
"""Convert an ASCII .ply point cloud to binary_little_endian for faster web loading.

Three.js PLYLoader auto-detects ASCII vs binary, so this is purely a size/speed
optimization: a ~118 MB ASCII file (3M points) becomes ~30 MB binary and parses
in well under a second instead of freezing the browser for tens of seconds.

Usage:
  pip install plyfile numpy
  python tools/ply_to_binary.py input.ply output.ply
  # convert a whole directory of .ply files:
  python tools/ply_to_binary.py --dir path/to/points --out path/to/points_bin
"""
import sys
from pathlib import Path

from plyfile import PlyData


def convert(in_path: Path, out_path: Path) -> None:
    print(f"Reading {in_path} ...")
    data = PlyData.read(str(in_path))
    data.text = False
    data.byte_order = "<"  # little-endian (what PLYLoader expects)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Writing binary -> {out_path} ...")
    data.write(str(out_path))
    print(
        f"done. {in_path.stat().st_size / 1e6:.1f} MB -> "
        f"{out_path.stat().st_size / 1e6:.1f} MB"
    )


def main() -> None:
    args = sys.argv[1:]
    if len(args) == 3 and args[0] == "--dir":
        in_dir, out_dir = Path(args[1]), Path(args[2])
        for p in sorted(in_dir.glob("*.ply")):
            convert(p, out_dir / p.name)
    elif len(args) == 2:
        convert(Path(args[0]), Path(args[1]))
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()

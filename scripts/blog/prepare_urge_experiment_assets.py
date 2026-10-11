#!/usr/bin/env python3
"""Prepare the two URGE experimental figures used by the diffusion blog.

Requires Python 3 and Pillow. All experimental pixels come from the original
paper, arXiv:2605.17850v1, distributed under CC BY 4.0. No data are inferred
from plotted bars and no images are generated. Figure 3 is converted directly
to lossless WebP; the six Table 5 examples are placed at their native 512 px
size, with only surrounding labels added, and also saved losslessly.

Example from the repository root:
    python3 scripts/blog/prepare_urge_experiment_assets.py \
        --cache /tmp/urge-original-assets \
        --font /path/to/FandolHei-Regular.otf

The cache stays outside the repository. Expected SHA256 hashes pin the exact
source files, so a later source change cannot silently alter a published plot.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile
import urllib.request

from PIL import Image, ImageDraw, ImageFont


SOURCE_PAGE = "https://arxiv.org/html/2605.17850v1"
SOURCE_ROOT = SOURCE_PAGE + "/"
SOURCES = {
    "urge_particle_scaling_source.png": (
        "fig/Results/Impact_of_num_particle/Impact_of_num_particle.png",
        "27fe3eebc37688f89aba2009bc45e535d879b0582d78b43190e84d5afc4eed65",
    ),
    "urge_base_toothbrush_snowboard.png": (
        "fig/Results/Baseline/2.png",
        "57767c3a63f3b8cd6dce2136fe4e7f8b8a77d7ea4945598baca0ae0d58b4ea74",
    ),
    "urge_fk_toothbrush_snowboard.png": (
        "fig/Results/FK_Steering/2.png",
        "1392ccb95220332a96a120f4b0994c216ef63fcf35aa429b6b8d76fba4a69311",
    ),
    "urge_toothbrush_snowboard.png": (
        "fig/Results/URGE/2.png",
        "2da87bfebd5bb85c94e288ec6c1ce4819d5a5b5925e1d4173a4afa625bf5f72c",
    ),
    "urge_base_horse_giraffe.png": (
        "fig/Results/Baseline/8.png",
        "88b496db42edf8085964c84f062638e037b9457169ea11d163e714ed8f21b76b",
    ),
    "urge_fk_horse_giraffe.png": (
        "fig/Results/FK_Steering/8.png",
        "f72661ac1099fed4211be75ed51bdbefdd672075dbf2846e98ded548992b2526",
    ),
    "urge_horse_giraffe.png": (
        "fig/Results/URGE/8.png",
        "fb215ece9b7ea23f58abef85b1e3288a28e1fcacdf6a5f4cbbc97de42c5171ed",
    ),
}

PAPER = "#fcfbf8"
INK = "#292a28"
MUTED = "#696b65"
LINE = "#dedcd5"
RED = "#842c36"
ROSE = "#f5ebeb"


def get_sources(cache):
    cache.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, (relative_url, expected_hash) in SOURCES.items():
        path = cache / name
        data = path.read_bytes() if path.exists() else urllib.request.urlopen(
            SOURCE_ROOT + relative_url, timeout=60
        ).read()
        actual_hash = hashlib.sha256(data).hexdigest()
        if actual_hash != expected_hash:
            raise ValueError(f"Source hash mismatch for {name}: {actual_hash}")
        if not path.exists():
            path.write_bytes(data)
        paths[name] = path
    return paths


def choose_font(explicit):
    candidates = [explicit, os.environ.get("URGE_FIGURE_FONT")]
    candidates.extend([
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/texlive/texmf-dist/fonts/opentype/public/fandol/FandolHei-Regular.otf",
    ])
    for item in candidates:
        if item and Path(item).is_file():
            return Path(item)
    raise FileNotFoundError("Pass --font with a Chinese font such as FandolHei-Regular.otf")


def make_examples(paths, font_path, destination):
    canvas = Image.new("RGB", (1680, 1610), PAPER)
    draw = ImageDraw.Draw(canvas)

    def text(x, y, label, size, color=INK, centered=False):
        font = ImageFont.truetype(str(font_path), size)
        box = draw.textbbox((0, 0), label, font=font)
        left = x - (box[2] - box[0]) / 2 if centered else x
        draw.text((left, y - box[1]), label, font=font, fill=color)

    text(48, 44, "URGE 原论文中的生成结果", 56)
    text(48, 118, "同一提示词 · 同一生成骨干 SD v1.5", 34, MUTED)
    draw.line((48, 170, 1632, 170), fill=LINE, width=2)

    lefts = [48, 584, 1120]
    labels = [("基础 SD v1.5", "原始生成"),
              ("FK Steering", "N = 4"),
              ("URGE", "N = 4")]
    for col, (main, sub) in enumerate(labels):
        x = lefts[col]
        if col == 2:
            draw.rectangle((x, 187, x + 511, 288), fill=ROSE)
            draw.rectangle((x, 187, x + 5, 288), fill=RED)
        text(x + 256, 199, main, 44, RED if col == 2 else INK, centered=True)
        text(x + 256, 254, sub, 31, MUTED, centered=True)

    rows = [
        ("提示词：一张牙刷与单板滑雪板的照片", 320, 378,
         ["urge_base_toothbrush_snowboard.png", "urge_fk_toothbrush_snowboard.png",
          "urge_toothbrush_snowboard.png"]),
        ("提示词：一张马与长颈鹿的照片", 934, 992,
         ["urge_base_horse_giraffe.png", "urge_fk_horse_giraffe.png",
          "urge_horse_giraffe.png"]),
    ]
    for label, label_y, image_y, files in rows:
        text(48, label_y, label, 42)
        for col, name in enumerate(files):
            original = Image.open(paths[name]).convert("RGB")
            if original.size != (512, 512):
                raise ValueError(f"Unexpected image size for {name}: {original.size}")
            x = lefts[col]
            draw.rectangle((x - 1, image_y - 1, x + 512, image_y + 512), outline=LINE)
            canvas.paste(original, (x, image_y))

    text(48, 1547, "来源：Wang 等，URGE 原论文 Table 5（节选） · CC BY 4.0", 29, MUTED)
    canvas.save(destination, "WEBP", lossless=True, method=6)

    # Confirm that composition and lossless encoding preserved all source pixels.
    decoded = Image.open(destination).convert("RGB")
    for _, _, image_y, files in rows:
        for x, name in zip(lefts, files):
            original = Image.open(paths[name]).convert("RGB")
            crop = decoded.crop((x, image_y, x + 512, image_y + 512))
            if crop.tobytes() != original.tobytes():
                raise AssertionError(f"Pixel preservation failed for {name}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path,
                        default=Path(tempfile.gettempdir()) / "urge-original-assets")
    parser.add_argument("--font", type=Path)
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parents[2] /
                        "images/blog/diffusion_urge_stein")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    sources = get_sources(args.cache)
    font_path = choose_font(args.font)

    chart = Image.open(sources["urge_particle_scaling_source.png"]).convert("RGB")
    chart_path = args.output / "urge_particle_scaling.webp"
    chart.save(chart_path, "WEBP", lossless=True, method=6)
    if Image.open(chart_path).convert("RGB").tobytes() != chart.tobytes():
        raise AssertionError("Figure 3 lossless conversion failed")

    examples_path = args.output / "urge_image_examples.webp"
    make_examples(sources, font_path, examples_path)

    result = {"source_page": SOURCE_PAGE,
              "license": "https://creativecommons.org/licenses/by/4.0/",
              "outputs": []}
    for path in (chart_path, examples_path):
        data = path.read_bytes()
        result["outputs"].append({"path": str(path), "size": Image.open(path).size,
                                  "bytes": len(data),
                                  "sha256": hashlib.sha256(data).hexdigest()})
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

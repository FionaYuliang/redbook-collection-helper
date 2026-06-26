from pathlib import Path
from math import cos, pi, sin

from PIL import Image, ImageDraw


ICON_DIR = Path("icons")
SOURCE_ICON = ICON_DIR / "icon-source.png"
STAR_FILL = "#fdbc60"
SVG_SCALE = 1.5
SVG_BASE_SIZE = 128
SVG_OUTPUT_SIZES = (16, 32, 48, 128)


def star_points(size: int, outer_ratio: float = 0.47, inner_ratio: float = 0.235) -> list[tuple[float, float]]:
    center = size / 2
    outer = size * outer_ratio
    inner = size * inner_ratio
    points = []
    for index in range(10):
        angle = -pi / 2 + index * pi / 5
        radius = outer if index % 2 == 0 else inner
        points.append((center + cos(angle) * radius, center + sin(angle) * radius))
    return points


def svg_points() -> str:
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in star_points(SVG_BASE_SIZE, 0.47, 0.235))


def create_source_icon() -> Image.Image:
    scale = 4
    size = 512
    hi_size = size * scale
    image = Image.new("RGBA", (hi_size, hi_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    points = star_points(hi_size, 0.47, 0.235)
    draw.polygon(points, fill=STAR_FILL)
    draw.line(points + [points[0]], fill=STAR_FILL, width=round(hi_size * 0.055), joint="curve")
    return image.resize((size, size), Image.Resampling.LANCZOS)


def write_png_icon(size: int, source: Image.Image) -> None:
    source.resize((size, size), Image.Resampling.LANCZOS).save(ICON_DIR / f"icon{size}.png")


def write_svg_icon(size: int) -> None:
    output_size = round(size * SVG_SCALE)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{output_size}" height="{output_size}" viewBox="0 0 128 128" shape-rendering="geometricPrecision">\n'
        f'  <polygon points="{svg_points()}" fill="{STAR_FILL}" stroke="{STAR_FILL}" stroke-width="7" stroke-linejoin="round"/>\n'
        "</svg>\n"
    )
    (ICON_DIR / f"icon{size}.svg").write_text(svg, encoding="utf-8")


if __name__ == "__main__":
    ICON_DIR.mkdir(exist_ok=True)
    source = create_source_icon()
    source.save(SOURCE_ICON)
    for icon_size in SVG_OUTPUT_SIZES:
        write_png_icon(icon_size, source)
        write_svg_icon(icon_size)

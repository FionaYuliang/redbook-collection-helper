from pathlib import Path

from PIL import Image, ImageDraw


def draw_icon(size: int) -> None:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    radius = max(4, size // 5)
    stroke = max(2, size // 11)
    x = size * 0.25
    y = size * 0.3
    gap = size * 0.2

    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=(216, 75, 58, 255))
    draw.line((x, y, size * 0.75, y), fill=(255, 250, 243, 255), width=stroke)
    draw.line((x, y + gap, size * 0.68, y + gap), fill=(255, 250, 243, 255), width=stroke)
    draw.line((x, y + gap * 2, size * 0.52, y + gap * 2), fill=(255, 250, 243, 255), width=stroke)
    image.save(Path("icons") / f"icon{size}.png")


if __name__ == "__main__":
    Path("icons").mkdir(exist_ok=True)
    for icon_size in (16, 32, 48, 128):
        draw_icon(icon_size)

import os
from PIL import Image

src_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src_icon.jpg")
dest_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.ico")

try:
    if not os.path.exists(src_path):
        if os.path.exists(dest_path):
            print(f"Icon already exists at {dest_path}. Skipping generation.")
            exit(0)
        print(f"Error: Source image not found at {src_path}")
        exit(1)

    img = Image.open(src_path)
    width, height = img.size
    max_dim = max(width, height)

    # Add 8% padding on each side for a beautiful padded desktop icon
    pad = int(max_dim * 0.08)
    canvas_dim = max_dim + 2 * pad
    square_img = Image.new("RGBA", (canvas_dim, canvas_dim), (0, 0, 0, 0))

    # Calculate offset to paste in the center with padding
    offset_x = pad + (max_dim - width) // 2
    offset_y = pad + (max_dim - height) // 2

    # Paste original image
    square_img.paste(img, (offset_x, offset_y))

    # Save as ICO with multiple sizes
    sizes = [(16, 16), (32, 32), (48, 48), (128, 128), (256, 256)]
    square_img.save(dest_path, format="ICO", sizes=sizes)
    print(f"Successfully generated ICO at {dest_path}")
except Exception as e:
    print(f"Error generating ICO: {e}")
    exit(1)

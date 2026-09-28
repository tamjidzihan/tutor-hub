import io
import os
import uuid
from PIL import Image, ImageOps
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework.exceptions import ValidationError

ALLOWED_IMAGE_FORMATS = {'JPEG', 'JPG', 'PNG', 'WEBP', 'GIF', 'BMP', 'TIFF'}
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

def optimize_profile_image(
    uploaded_file,
    max_dimension: int = 400,
    quality: int = 85,
    output_format: str = 'WEBP'
) -> InMemoryUploadedFile:
    """
    Process, crop to square, resize, and optimize avatar images for ultra-fast first-load performance.
    
    Features:
    - Validates image integrity and file size
    - Normalizes EXIF orientation
    - Performs center-square crop (1:1 aspect ratio) so avatars look properly framed
    - Downscales to max_dimension (default 400x400) using Lanczos resampling
    - Strips heavy EXIF/metadata for user privacy and ultra-light payload
    - Compresses to modern WebP format (typically 20KB-40KB)
    """
    if not uploaded_file:
        raise ValidationError({'error': 'No image file provided.'})

    if hasattr(uploaded_file, 'size') and uploaded_file.size > MAX_UPLOAD_SIZE:
        raise ValidationError({'error': 'Image file size exceeds the 10MB limit.'})

    try:
        # Open image
        img = Image.open(uploaded_file)
        img.verify()
        
        # Re-open for actual processing (verify closes/invalidates the stream)
        if hasattr(uploaded_file, 'seek'):
            uploaded_file.seek(0)
        img = Image.open(uploaded_file)
    except Exception:
        raise ValidationError({'error': 'The uploaded file is not a valid image.'})

    image_format = (img.format or '').upper()
    if image_format and image_format not in ALLOWED_IMAGE_FORMATS:
        raise ValidationError({'error': f'Unsupported image format: {image_format}. Please upload a JPEG, PNG, or WebP image.'})

    # Auto-rotate based on EXIF tag
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    # Normalize Color Modes
    target_format = output_format.upper()
    if target_format == 'WEBP':
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA')
    else:
        if img.mode in ('RGBA', 'LA', 'P'):
            bg = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            mask = img.split()[-1] if 'A' in img.mode else None
            bg.paste(img, mask=mask)
            img = bg
        elif img.mode != 'RGB':
            img = img.convert('RGB')

    # Smart Center Square Crop (1:1 aspect ratio)
    width, height = img.size
    min_dim = min(width, height)
    left = (width - min_dim) // 2
    top = (height - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    img = img.crop((left, top, right, bottom))

    # Resize to standard avatar bounds
    if min_dim > max_dimension:
        img = img.resize((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    # Encode to output buffer
    buffer = io.BytesIO()
    ext = target_format.lower()
    mime_type = f"image/{ext}"

    if ext == 'webp':
        img.save(buffer, format='WEBP', quality=quality, method=6)
    else:
        img.save(buffer, format='JPEG', quality=quality, optimize=True, progressive=True)

    buffer.seek(0)
    file_size = buffer.getbuffer().nbytes
    unique_filename = f"avatar_{uuid.uuid4().hex[:12]}.{ext}"

    return InMemoryUploadedFile(
        file=buffer,
        field_name='profile_image',
        name=unique_filename,
        content_type=mime_type,
        size=file_size,
        charset=None
    )

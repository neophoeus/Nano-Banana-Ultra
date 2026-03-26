export type ImageDimensions = {
    width: number;
    height: number;
};

export function extractPngDimensions(buffer: Buffer): ImageDimensions | null {
    if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') {
        return null;
    }

    return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
    };
}

export function extractGifDimensions(buffer: Buffer): ImageDimensions | null {
    const header = buffer.toString('ascii', 0, 6);
    if (buffer.length < 10 || (header !== 'GIF87a' && header !== 'GIF89a')) {
        return null;
    }

    return {
        width: buffer.readUInt16LE(6),
        height: buffer.readUInt16LE(8),
    };
}

export function extractJpegDimensions(buffer: Buffer): ImageDimensions | null {
    if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        return null;
    }

    let offset = 2;
    while (offset + 7 < buffer.length) {
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }

        const marker = buffer[offset + 1];
        offset += 2;

        if (marker === 0xd8 || marker === 0xd9) {
            continue;
        }
        if (offset + 1 >= buffer.length) {
            return null;
        }

        const segmentLength = buffer.readUInt16BE(offset);
        if (segmentLength < 2 || offset + segmentLength > buffer.length) {
            return null;
        }

        const isStartOfFrame =
            marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isStartOfFrame) {
            return {
                width: buffer.readUInt16BE(offset + 5),
                height: buffer.readUInt16BE(offset + 3),
            };
        }

        offset += segmentLength;
    }

    return null;
}

export function extractWebpDimensions(buffer: Buffer): ImageDimensions | null {
    if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
        return null;
    }

    const chunkType = buffer.toString('ascii', 12, 16);
    if (chunkType === 'VP8X' && buffer.length >= 30) {
        return {
            width: 1 + buffer.readUIntLE(24, 3),
            height: 1 + buffer.readUIntLE(27, 3),
        };
    }
    if (chunkType === 'VP8 ' && buffer.length >= 30) {
        return {
            width: buffer.readUInt16LE(26) & 0x3fff,
            height: buffer.readUInt16LE(28) & 0x3fff,
        };
    }
    if (chunkType === 'VP8L' && buffer.length >= 25) {
        const bits = buffer.readUInt32LE(21);
        return {
            width: (bits & 0x3fff) + 1,
            height: ((bits >> 14) & 0x3fff) + 1,
        };
    }

    return null;
}

export function extractImageDimensionsFromBase64(data: string, mimeType: string): ImageDimensions | null {
    try {
        const buffer = Buffer.from(data, 'base64');
        const normalizedMimeType = mimeType.toLowerCase();
        if (normalizedMimeType === 'image/png') {
            return extractPngDimensions(buffer);
        }
        if (normalizedMimeType === 'image/jpeg' || normalizedMimeType === 'image/jpg') {
            return extractJpegDimensions(buffer);
        }
        if (normalizedMimeType === 'image/webp') {
            return extractWebpDimensions(buffer);
        }
        if (normalizedMimeType === 'image/gif') {
            return extractGifDimensions(buffer);
        }
    } catch {
        return null;
    }

    return null;
}

export function extractImageDetailsFromDataUrl(
    dataUrl: string,
): { mimeType: string; dimensions: ImageDimensions | null } | null {
    const match = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/i);
    if (!match?.[2]) {
        return null;
    }

    const mimeType = match[1] || 'image/png';
    return {
        mimeType,
        dimensions: extractImageDimensionsFromBase64(match[2], mimeType),
    };
}

export function getImageArea(dimensions: ImageDimensions | null | undefined): number {
    if (!dimensions) {
        return -1;
    }

    return dimensions.width * dimensions.height;
}

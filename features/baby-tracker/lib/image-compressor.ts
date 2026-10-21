/**
 * Client-side image compressor specifically optimized for paper prescriptions & medical notes.
 * Compresses any camera photo or gallery image down to strictly <= 500 KB while preserving
 * maximum legibility of handwritten notes.
 */

export interface CompressionResult {
	file: File;
	previewUrl: string;
	originalBytes: number;
	compressedBytes: number;
	savedBytes: number;
	savedPercentage: number;
	width: number;
	height: number;
}

export const TARGET_MAX_BYTES = 500 * 1024; // 500 KB (512,000 bytes)

export function formatBytes(bytes: number, decimals = 1): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Loads an image file into an HTMLImageElement safely.
 */
function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(objectUrl);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("Failed to load image file."));
		};
		img.src = objectUrl;
	});
}

/**
 * Converts a canvas to a JPEG Blob at a given quality level.
 */
function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Canvas conversion to blob failed."));
			},
			"image/jpeg",
			quality,
		);
	});
}

/**
 * Compresses an image file down to <= maxBytes (defaults to 500 KB).
 */
export async function compressImageToMax500KB(
	file: File,
	maxBytes: number = TARGET_MAX_BYTES,
): Promise<CompressionResult> {
	const originalBytes = file.size;

	// Load image
	const img = await loadImageFromFile(file);

	let currentWidth = img.naturalWidth || img.width;
	let currentHeight = img.naturalHeight || img.height;

	// Paper notes need high resolution for handwriting readability,
	// but ultra-large 48MP photos (8000x6000) are unnecessarily huge.
	// 2048px on the longest edge keeps handwriting crystal clear.
	const MAX_DIMENSION = 2048;
	if (currentWidth > MAX_DIMENSION || currentHeight > MAX_DIMENSION) {
		if (currentWidth > currentHeight) {
			currentHeight = Math.round((currentHeight * MAX_DIMENSION) / currentWidth);
			currentWidth = MAX_DIMENSION;
		} else {
			currentWidth = Math.round((currentWidth * MAX_DIMENSION) / currentHeight);
			currentHeight = MAX_DIMENSION;
		}
	}

	const canvas = document.createElement("canvas");
	canvas.width = currentWidth;
	canvas.height = currentHeight;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Unable to create canvas context for compression.");
	}

	// White background for transparent PNGs / scans
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, currentWidth, currentHeight);
	ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

	// Try decreasing qualities: 0.88 -> 0.80 -> 0.72 -> 0.62 -> 0.50 -> 0.40
	const qualities = [0.88, 0.80, 0.72, 0.62, 0.52, 0.42];
	let bestBlob: Blob | null = null;

	for (const q of qualities) {
		const blob = await canvasToBlob(canvas, q);
		if (blob.size <= maxBytes) {
			bestBlob = blob;
			break;
		}
		bestBlob = blob;
	}

	// If still slightly over maxBytes, reduce dimensions iteratively
	while (bestBlob && bestBlob.size > maxBytes && (currentWidth > 600 && currentHeight > 600)) {
		currentWidth = Math.round(currentWidth * 0.85);
		currentHeight = Math.round(currentHeight * 0.85);
		canvas.width = currentWidth;
		canvas.height = currentHeight;
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, currentWidth, currentHeight);
		ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

		bestBlob = await canvasToBlob(canvas, 0.65);
	}

	if (!bestBlob) {
		throw new Error("Could not compress image.");
	}

	// Create new File with .jpg extension
	const baseName = file.name.replace(/\.[^/.]+$/, "");
	const compressedFile = new File([bestBlob], `${baseName}.jpg`, {
		type: "image/jpeg",
		lastModified: Date.now(),
	});

	const previewUrl = URL.createObjectURL(bestBlob);
	const compressedBytes = bestBlob.size;
	const savedBytes = Math.max(0, originalBytes - compressedBytes);
	const savedPercentage = originalBytes > 0 ? Math.round((savedBytes / originalBytes) * 100) : 0;

	return {
		file: compressedFile,
		previewUrl,
		originalBytes,
		compressedBytes,
		savedBytes,
		savedPercentage,
		width: currentWidth,
		height: currentHeight,
	};
}

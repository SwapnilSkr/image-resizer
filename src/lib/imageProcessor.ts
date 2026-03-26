export interface ResizeOptions {
	width: number;
	height: number;
	quality: number;
	format: "image/jpeg" | "image/png" | "image/webp";
	maintainAspectRatio: boolean;
}

export interface ProcessedImage {
	blob: Blob;
	dataUrl: string;
	originalSize: number;
	newSize: number;
	originalDimensions: { width: number; height: number };
	newDimensions: { width: number; height: number };
	compressionRatio: number;
}

export async function processImage(
	file: File,
	options: ResizeOptions,
): Promise<ProcessedImage> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const originalSize = file.size;

		img.onload = () => {
			try {
				const originalWidth = img.width;
				const originalHeight = img.height;
				const aspectRatio = originalWidth / originalHeight;

				let targetWidth = options.width;
				let targetHeight = options.height;

				if (options.maintainAspectRatio) {
					if (options.width > 0 && options.height === 0) {
						targetHeight = Math.round(options.width / aspectRatio);
					} else if (options.height > 0 && options.width === 0) {
						targetWidth = Math.round(options.height * aspectRatio);
					} else if (options.width > 0 && options.height > 0) {
						const resizeRatio = Math.min(
							options.width / originalWidth,
							options.height / originalHeight,
						);
						targetWidth = Math.round(originalWidth * resizeRatio);
						targetHeight = Math.round(originalHeight * resizeRatio);
					}
				}

				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");

				if (!ctx) {
					reject(new Error("Failed to get canvas context"));
					return;
				}

				canvas.width = targetWidth;
				canvas.height = targetHeight;

				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = "high";

				ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

				canvas.toBlob(
					(blob) => {
						if (!blob) {
							reject(new Error("Failed to create blob"));
							return;
						}

						const reader = new FileReader();
						reader.onload = () => {
							resolve({
								blob,
								dataUrl: reader.result as string,
								originalSize,
								newSize: blob.size,
								originalDimensions: {
									width: originalWidth,
									height: originalHeight,
								},
								newDimensions: {
									width: targetWidth,
									height: targetHeight,
								},
								compressionRatio: (1 - blob.size / originalSize) * 100,
							});
						};
						reader.onerror = () => reject(new Error("Failed to read blob"));
						reader.readAsDataURL(blob);
					},
					options.format,
					options.quality / 100,
				);
			} catch (error) {
				reject(error);
			}
		};

		img.onerror = () => reject(new Error("Failed to load image"));

		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.onload = () => {
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	});
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

export function getImageDimensions(
	file: File,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			resolve({ width: img.width, height: img.height });
		};
		img.onerror = () => reject(new Error("Failed to load image"));
		const reader = new FileReader();
		reader.onload = () => {
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	});
}

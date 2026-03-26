import {
	Download,
	Image as ImageIcon,
	Maximize2,
	RefreshCw,
	Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
	formatFileSize,
	getImageDimensions,
	type ProcessedImage,
	processImage,
	type ResizeOptions,
} from "#/lib/imageProcessor";

export default function ImageResizer() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [originalDimensions, setOriginalDimensions] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(
		null,
	);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [options, setOptions] = useState<ResizeOptions>({
		width: 0,
		height: 0,
		quality: 85,
		format: "image/jpeg",
		maintainAspectRatio: true,
	});

	const handleFileSelect = useCallback(async (file: File) => {
		if (!file.type.startsWith("image/")) {
			setError("Please select a valid image file");
			return;
		}

		setError(null);
		setSelectedFile(file);
		setProcessedImage(null);

		try {
			const dimensions = await getImageDimensions(file);
			setOriginalDimensions(dimensions);
			setOptions((prev) => ({
				...prev,
				width: dimensions.width,
				height: dimensions.height,
			}));
		} catch (_err) {
			setError("Failed to read image dimensions");
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			const file = e.dataTransfer.files[0];
			if (file) {
				handleFileSelect(file);
			}
		},
		[handleFileSelect],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				handleFileSelect(file);
			}
		},
		[handleFileSelect],
	);

	const handleWidthChange = useCallback(
		(value: number) => {
			setOptions((prev) => {
				const newOptions = { ...prev, width: value };
				if (prev.maintainAspectRatio && originalDimensions && value > 0) {
					newOptions.height = Math.round(
						value / (originalDimensions.width / originalDimensions.height),
					);
				}
				return newOptions;
			});
		},
		[originalDimensions],
	);

	const handleHeightChange = useCallback(
		(value: number) => {
			setOptions((prev) => {
				const newOptions = { ...prev, height: value };
				if (prev.maintainAspectRatio && originalDimensions && value > 0) {
					newOptions.width = Math.round(
						value * (originalDimensions.width / originalDimensions.height),
					);
				}
				return newOptions;
			});
		},
		[originalDimensions],
	);

	const handleProcess = useCallback(async () => {
		if (!selectedFile || !originalDimensions) return;

		setIsProcessing(true);
		setError(null);

		try {
			const result = await processImage(selectedFile, options);
			setProcessedImage(result);
		} catch (_err) {
			setError("Failed to process image. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	}, [selectedFile, options, originalDimensions]);

	const handleDownload = useCallback(() => {
		if (!processedImage) return;

		const link = document.createElement("a");
		link.href = processedImage.dataUrl;
		link.download = `resized_${Date.now()}.${processedImage.blob.type.split("/")[1]}`;
		link.click();
	}, [processedImage]);

	const handleReset = useCallback(() => {
		setSelectedFile(null);
		setProcessedImage(null);
		setOriginalDimensions(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const presetDimensions = [
		{ label: "1080p", width: 1920, height: 1080 },
		{ label: "720p", width: 1280, height: 720 },
		{ label: "Thumbnail", width: 400, height: 400 },
		{ label: "Twitter", width: 1200, height: 675 },
		{ label: "Instagram", width: 1080, height: 1080 },
	];

	return (
		<div className="flex flex-col gap-8">
			<section className="island-shell rounded-2xl p-8">
				<div className="mb-6">
					<h1 className="display-title text-4xl font-bold text-(--sea-ink)">
						Image Resizer
					</h1>
					<p className="mt-2 text-(--sea-ink-soft)">
						Resize and optimize your images with high quality output
					</p>
				</div>

				{!selectedFile ? (
					<section
						onDrop={handleDrop}
						onDragOver={(e) => e.preventDefault()}
						className="border-2 border-dashed border-(--line) rounded-xl p-12 text-center transition hover:border-(--lagoon) hover:bg-(--foam)"
					>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleInputChange}
							className="hidden"
						/>
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--lagoon)/10">
							<Upload className="h-8 w-8 text-(--lagoon)" />
						</div>
						<h3 className="mb-2 text-lg font-semibold text-(--sea-ink)">
							Drop your image here or click to upload
						</h3>
						<p className="text-sm text-(--sea-ink-soft)">
							Supports JPG, PNG, WebP and other image formats
						</p>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="mt-4 rounded-full border border-(--lagoon) bg-(--lagoon) px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-(--lagoon-deep)"
						>
							Select Image
						</button>
					</section>
				) : (
					<div className="flex flex-col gap-6">
						<div className="flex items-center justify-between rounded-lg bg-(--foam) p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--lagoon)/10">
									<ImageIcon className="h-5 w-5 text-(--lagoon)" />
								</div>
								<div>
									<p className="font-medium text-(--sea-ink)">
										{selectedFile.name}
									</p>
									<p className="text-sm text-(--sea-ink-soft)">
										{originalDimensions &&
											`${originalDimensions.width} × ${originalDimensions.height}px`}{" "}
										• {formatFileSize(selectedFile.size)}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={handleReset}
								className="rounded-full border border-(--line) p-2 transition hover:bg-(--line)"
							>
								<RefreshCw className="h-5 w-5 text-(--sea-ink-soft)" />
							</button>
						</div>

						<div className="grid gap-6 sm:grid-cols-2">
							<div>
								<label
									htmlFor="width-input"
									className="mb-2 block text-sm font-medium text-(--sea-ink)"
								>
									Width (px)
								</label>
								<div className="flex gap-2">
									<input
										id="width-input"
										type="number"
										value={options.width || ""}
										onChange={(e) => handleWidthChange(Number(e.target.value))}
										min="1"
										max="8192"
										className="flex-1 rounded-lg border border-(--line) bg-white px-4 py-2.5 text-(--sea-ink) dark:bg-(--foam) dark:text-(--sea-ink) placeholder:text-gray-400 focus:border-(--lagoon) focus:outline-none focus:ring-2 focus:ring-(--lagoon)/20"
									/>
									<button
										type="button"
										onClick={() =>
											originalDimensions &&
											handleWidthChange(originalDimensions.width)
										}
										className="rounded-lg border border-(--line) bg-white dark:bg-(--foam) px-3 transition hover:bg-(--foam)"
										title="Reset to original"
									>
										<RefreshCw className="h-5 w-5 text-(--sea-ink-soft)" />
									</button>
								</div>
							</div>

							<div>
								<label
									htmlFor="height-input"
									className="mb-2 block text-sm font-medium text-(--sea-ink)"
								>
									Height (px)
								</label>
								<div className="flex gap-2">
									<input
										id="height-input"
										type="number"
										value={options.height || ""}
										onChange={(e) => handleHeightChange(Number(e.target.value))}
										min="1"
										max="8192"
										className="flex-1 rounded-lg border border-(--line) bg-white px-4 py-2.5 text-(--sea-ink) dark:bg-(--foam) dark:text-(--sea-ink) placeholder:text-gray-400 focus:border-(--lagoon) focus:outline-none focus:ring-2 focus:ring-(--lagoon)/20"
									/>
									<button
										type="button"
										onClick={() =>
											originalDimensions &&
											handleHeightChange(originalDimensions.height)
										}
										className="rounded-lg border border-(--line) bg-white dark:bg-(--foam) px-3 transition hover:bg-(--foam)"
										title="Reset to original"
									>
										<RefreshCw className="h-5 w-5 text-(--sea-ink-soft)" />
									</button>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="aspect-ratio"
								checked={options.maintainAspectRatio}
								onChange={(e) =>
									setOptions((prev) => ({
										...prev,
										maintainAspectRatio: e.target.checked,
									}))
								}
								className="h-4 w-4 rounded border-(--line) text-(--lagoon) focus:ring-2 focus:ring-(--lagoon)/20"
							/>
							<label
								htmlFor="aspect-ratio"
								className="text-sm text-(--sea-ink)"
							>
								Maintain aspect ratio
							</label>
						</div>

						<div>
							<div className="mb-2 flex items-center justify-between">
								<label
									htmlFor="quality-slider"
									className="text-sm font-medium text-(--sea-ink)"
								>
									Quality
								</label>
								<span className="text-sm text-(--sea-ink-soft)">
									{options.quality}%
								</span>
							</div>
							<input
								id="quality-slider"
								type="range"
								min="1"
								max="100"
								value={options.quality}
								onChange={(e) =>
									setOptions((prev) => ({
										...prev,
										quality: Number(e.target.value),
									}))
								}
								className="w-full accent-(--lagoon)"
							/>
						</div>

						<div>
							<label
								htmlFor="format-select"
								className="mb-2 block text-sm font-medium text-(--sea-ink)"
							>
								Output Format
							</label>
							<select
								id="format-select"
								value={options.format}
								onChange={(e) =>
									setOptions((prev) => ({
										...prev,
										format: e.target.value as ResizeOptions["format"],
									}))
								}
								className="w-full rounded-lg border border-(--line) bg-white px-4 py-2.5 text-(--sea-ink) dark:bg-(--foam) dark:text-(--sea-ink) focus:border-(--lagoon) focus:outline-none focus:ring-2 focus:ring-(--lagoon)/20"
							>
								<option value="image/jpeg">JPEG</option>
								<option value="image/png">PNG</option>
								<option value="image/webp">WebP</option>
							</select>
						</div>

						<div>
							<h3 className="mb-3 text-sm font-medium text-(--sea-ink)">
								Quick Presets
							</h3>
							<div className="flex flex-wrap gap-2">
								{presetDimensions.map((preset) => (
									<button
										key={preset.label}
										type="button"
										onClick={() => {
											setOptions((prev) => ({
												...prev,
												width: preset.width,
												height: preset.height,
											}));
											if (options.maintainAspectRatio) {
												setOptions((prev) => ({
													...prev,
													maintainAspectRatio: false,
												}));
											}
										}}
										className="rounded-full border border-(--line) bg-white dark:bg-(--foam) px-4 py-2 text-sm transition hover:border-(--lagoon) hover:bg-(--foam)"
									>
										{preset.label}
									</button>
								))}
								<button
									type="button"
									onClick={() =>
										setOptions((prev) => ({
											...prev,
											maintainAspectRatio: !prev.maintainAspectRatio,
										}))
									}
									className="rounded-full border border-(--lagoon) bg-(--lagoon) px-4 py-2 text-sm font-medium text-white transition hover:bg-(--lagoon-deep)"
								>
									<Maximize2 className="inline h-4 w-4 align-middle" />{" "}
									{options.maintainAspectRatio ? "Unlock" : "Lock"} Ratio
								</button>
							</div>
						</div>

						{error && (
							<div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
								{error}
							</div>
						)}

						<button
							type="button"
							onClick={handleProcess}
							disabled={isProcessing}
							className="flex w-full items-center justify-center gap-2 rounded-full border border-(--lagoon) bg-(--lagoon) px-8 py-3 text-sm font-semibold text-white transition hover:bg-(--lagoon-deep) disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isProcessing ? (
								<>
									<RefreshCw className="h-5 w-5 animate-spin" />
									Processing...
								</>
							) : (
								"Resize Image"
							)}
						</button>
					</div>
				)}
			</section>

			{processedImage && (
				<section className="island-shell rounded-2xl p-8">
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-(--sea-ink)">Result</h2>
						<p className="text-sm text-(--sea-ink-soft)">
							Your resized file is ready for download
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						<div>
							<div className="mb-3 overflow-hidden rounded-lg border border-(--line)">
								<img
									src={processedImage.dataUrl}
									alt="Preview of resized file"
									className="w-full object-contain"
								/>
							</div>
							<div className="flex items-center justify-between rounded-lg bg-(--foam) p-3">
								<div>
									<p className="text-sm font-medium text-(--sea-ink)">
										{processedImage.newDimensions.width} ×{" "}
										{processedImage.newDimensions.height}px
									</p>
									<p className="text-xs text-(--sea-ink-soft)">
										{formatFileSize(processedImage.newSize)}
									</p>
								</div>
								{processedImage.compressionRatio > 0 && (
									<div className="text-right">
										<p className="text-sm font-medium text-green-600">
											-{processedImage.compressionRatio.toFixed(1)}%
										</p>
										<p className="text-xs text-(--sea-ink-soft)">
											Smaller
										</p>
									</div>
								)}
							</div>
						</div>

						<div className="flex flex-col justify-center gap-4">
							<div className="space-y-3 rounded-lg bg-(--foam) p-4">
								<div className="flex justify-between text-sm">
									<span className="text-(--sea-ink-soft)">
										Original Size
									</span>
									<span className="font-medium text-(--sea-ink)">
										{processedImage.originalDimensions.width} ×{" "}
										{processedImage.originalDimensions.height}px
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-(--sea-ink-soft)">New Size</span>
									<span className="font-medium text-(--sea-ink)">
										{processedImage.newDimensions.width} ×{" "}
										{processedImage.newDimensions.height}px
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-(--sea-ink-soft)">
										Original File
									</span>
									<span className="font-medium text-(--sea-ink)">
										{formatFileSize(processedImage.originalSize)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-(--sea-ink-soft)">New File</span>
									<span className="font-medium text-(--sea-ink)">
										{formatFileSize(processedImage.newSize)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-(--sea-ink-soft)">
										Compression
									</span>
									<span
										className={`font-medium ${processedImage.compressionRatio > 0 ? "text-green-600" : "text-red-600"}`}
									>
										{processedImage.compressionRatio > 0 ? "-" : "+"}
										{Math.abs(processedImage.compressionRatio).toFixed(1)}%
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-(--sea-ink-soft)">Format</span>
									<span className="font-medium text-(--sea-ink)">
										{processedImage.blob.type.split("/")[1].toUpperCase()}
									</span>
								</div>
							</div>

							<button
								type="button"
								onClick={handleDownload}
								className="flex items-center justify-center gap-2 rounded-full border border-(--lagoon) bg-(--lagoon) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--lagoon-deep)"
							>
								<Download className="h-5 w-5" />
								Download Image
							</button>

							<button
								type="button"
								onClick={handleReset}
								className="flex items-center justify-center gap-2 rounded-full border border-(--line) bg-white dark:bg-(--foam) px-6 py-3 text-sm font-semibold text-(--sea-ink) transition hover:bg-(--foam)"
							>
								<RefreshCw className="h-5 w-5" />
								Start Over
							</button>
						</div>
					</div>
				</section>
			)}
		</div>
	);
}

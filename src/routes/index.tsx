import { createFileRoute } from "@tanstack/react-router";
import ImageResizer from "#/components/ImageResizer";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			<ImageResizer />
		</main>
	);
}

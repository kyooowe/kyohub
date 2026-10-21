import { NextRequest, NextResponse, connection } from "next/server";
import { get } from "@vercel/blob";
import { verifySessionToken, SESSION_COOKIE } from "@/features/auth/lib/session";

export async function GET(request: NextRequest) {
	await connection();
	try {
		const token = request.cookies.get(SESSION_COOKIE)?.value;
		const user = verifySessionToken(token);
		if (!user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
		if (!blobToken) {
			return new NextResponse("BLOB_READ_WRITE_TOKEN not configured", { status: 500 });
		}

		const { searchParams } = new URL(request.url);
		const pathname = searchParams.get("pathname");
		const isDownload = searchParams.get("download") === "1";

		if (!pathname) {
			return new NextResponse("Missing pathname parameter", { status: 400 });
		}

		// Fetch the private blob securely from Vercel
		const result = await get(pathname, {
			access: "private",
			token: blobToken,
		});

		if (!result || !result.stream) {
			return new NextResponse("Image not found", { status: 404 });
		}

		const headers = new Headers();
		headers.set("Content-Type", result.blob.contentType || "image/jpeg");
		headers.set("Cache-Control", "private, max-age=86400, stale-while-revalidate=604800");

		if (isDownload) {
			const filename = pathname.split("/").pop() || "pediatric-note.jpg";
			headers.set("Content-Disposition", `attachment; filename="${filename}"`);
		}

		return new NextResponse(result.stream, {
			status: 200,
			headers,
		});
	} catch (error) {
		console.error("Error retrieving private blob:", error);
		return new NextResponse("Image not found or inaccessible", { status: 404 });
	}
}

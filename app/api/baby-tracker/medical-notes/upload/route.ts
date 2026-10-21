import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verifySessionToken, SESSION_COOKIE } from "@/features/auth/lib/session";
import { db } from "@/prisma/db";
import { revalidateTag, revalidatePath } from "next/cache";

const MAX_ALLOWED_BYTES = 500 * 1024; // 500 KB

export async function POST(request: NextRequest) {
	try {
		const token = request.cookies.get(SESSION_COOKIE)?.value;
		const user = verifySessionToken(token);
		if (!user) {
			return NextResponse.json({ error: "Unauthorized. Please unlock the app." }, { status: 401 });
		}

		const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
		if (!blobToken) {
			return NextResponse.json(
				{
					error:
						"BLOB_READ_WRITE_TOKEN is missing in environment variables (.env.local). Please set up your Vercel Blob token.",
				},
				{ status: 500 },
			);
		}

		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const noteDate = String(formData.get("noteDate") || "").trim();
		const title = String(formData.get("title") || "").trim();
		const doctorName = String(formData.get("doctorName") || "").trim();
		const notes = String(formData.get("notes") || "").trim();

		if (!file) {
			return NextResponse.json({ error: "Please select or take a photo of the note." }, { status: 400 });
		}

		if (!noteDate) {
			return NextResponse.json({ error: "Visit / Note date is required." }, { status: 400 });
		}

		if (file.size > MAX_ALLOWED_BYTES) {
			return NextResponse.json(
				{
					error: `File size exceeds the 500 KB limit (${Math.round(file.size / 1024)} KB). Compression must keep it under 500 KB.`,
				},
				{ status: 400 },
			);
		}

		// Upload to Vercel Private Blob
		const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
		const pathname = `pediatric-notes/${noteDate}-${Date.now()}-${safeOriginalName}`;

		const blob = await put(pathname, file, {
			access: "private",
			token: blobToken,
			addRandomSuffix: true,
		});

		// Save record in database
		const record = await db.orm.public.BabyMedicalNote.create({
			noteDate,
			title,
			imageUrl: blob.url,
			imagePathname: blob.pathname,
			imageSize: file.size,
			doctorName,
			notes,
			clinicName: "",
			category: "general",
			symptoms: "",
			doctorAdvice: "",
		});

		try {
			revalidateTag("baby-tracker", { expire: 0 });
			revalidatePath("/baby-tracker");
		} catch {
			// ignore if outside action context
		}

		return NextResponse.json({
			success: true,
			note: {
				id: record.id,
				noteDate: record.noteDate,
				title: record.title,
				imageUrl: record.imageUrl,
				imagePathname: record.imagePathname,
				imageSize: record.imageSize,
				doctorName: record.doctorName,
				notes: record.notes,
				createdAt: record.createdAt,
			},
		});
	} catch (error) {
		console.error("Upload error:", error);
		const message = error instanceof Error ? error.message : "Failed to upload pediatric note.";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

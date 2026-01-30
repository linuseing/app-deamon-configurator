import { type ActionFunctionArgs, data } from "react-router";
import { unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@react-router/node";
import AdmZip from "adm-zip";
import fs from "node:fs/promises";
import path from "node:path";
import { getAppSettings } from "~/lib/settings.server";

// Fallback blueprints directory
const FALLBACK_BLUEPRINTS_DIR = path.join(process.cwd(), "blueprints");

export async function action({ request }: ActionFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie") ?? "";
    const settings = await getAppSettings(cookieHeader);
    const appdaemonPath = settings?.appdaemonPath || FALLBACK_BLUEPRINTS_DIR;

    // Ensure directory exists
    try {
        await fs.mkdir(appdaemonPath, { recursive: true });
    } catch (err) {
        console.error("Failed to create appdaemon path:", err);
        return data({ error: "Failed to access AppDaemon apps directory" }, { status: 500 });
    }

    // Create an upload handler that stores the file in memory
    const uploadHandler = unstable_composeUploadHandlers(
        unstable_createMemoryUploadHandler({
            maxPartSize: 50 * 1024 * 1024, // 50MB
        })
    );

    let formData;
    try {
        formData = await unstable_parseMultipartFormData(request, uploadHandler);
    } catch (err) {
        console.error("Upload error:", err);
        return data({ error: "Failed to process upload" }, { status: 400 });
    }

    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
        return data({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".zip")) {
        return data({ error: "Only .zip files are allowed" }, { status: 400 });
    }

    try {
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        if (zipEntries.length === 0) {
            return data({ error: "Empty zip file" }, { status: 400 });
        }

        // Extract all to the appdaemon apps path
        // We overwrite existing files if they exist (standard behavior for updates)
        zip.extractAllTo(appdaemonPath, true);

        console.log(`Extracted blueprints to ${appdaemonPath}`);

        return data({ success: true, message: "Blueprints uploaded successfully" });
    } catch (error) {
        console.error("Extraction error:", error);
        return data({ error: "Failed to extract zip file: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
    }
}

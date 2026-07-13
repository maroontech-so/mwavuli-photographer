// One-off migration: sanitise every already-uploaded media file and update
// the database to point at the sanitised file + thumbnail. Idempotent: files
// that are already sanitised (webp image / mp4 video with a thumbnail) are
// skipped. Run with:  node server/scripts/sanitize-existing.js
//
// Requires MONGO_URI in server/.env (same as the running server).

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Photo = require("../models/Photo");
const Project = require("../models/Project");
const { sanitizeMedia, UPLOAD_DIR } = require("../utils/sanitize");

const alreadySanitised = (photo) => {
    const isWebpImage = photo.mediaType === "photo" && photo.file.endsWith(".webp");
    const isMp4Video = photo.mediaType === "video" && photo.file.endsWith(".mp4");
    const hasThumb = Boolean(photo.thumbnail);
    return (isWebpImage || isMp4Video) && hasThumb;
};

async function run() {
    await connectDB();

    const photos = await Photo.find({});
    console.log(`Found ${photos.length} media records`);

    const fileMap = {}; // old file name -> new file name (for cover fix-up)
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const photo of photos) {
        const srcPath = path.join(UPLOAD_DIR, photo.file);

        if (!fs.existsSync(srcPath)) {
            console.warn(`  ! missing file, skipping: ${photo.file}`);
            skipped++;
            continue;
        }

        if (alreadySanitised(photo)) {
            skipped++;
            continue;
        }

        try {
            const result = await sanitizeMedia(srcPath, photo.file);
            fileMap[photo.file] = result.file;

            photo.file = result.file;
            photo.thumbnail = result.thumbnail || "";
            photo.mediaType = result.mediaType;
            await photo.save();

            processed++;
            console.log(`  ✓ ${photo.file} -> ${result.file}`);
        } catch (err) {
            failed++;
            console.error(`  ✗ failed: ${photo.file} (${err.message})`);
        }
    }

    // Fix project covers that pointed at re-sanitised files.
    const projects = await Project.find({ cover: { $ne: "" } });
    let coversFixed = 0;
    for (const project of projects) {
        if (fileMap[project.cover]) {
            project.cover = fileMap[project.cover];
            await project.save();
            coversFixed++;
        }
    }

    console.log(`\nDone. processed=${processed} skipped=${skipped} failed=${failed} coversFixed=${coversFixed}`);
    await mongoose.disconnect();
}

run().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});

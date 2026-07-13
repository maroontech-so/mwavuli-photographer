const cloudinary = require("../config/cloudinary");

const FOLDER = process.env.CLOUDINARY_FOLDER || "mwavuli";

// Upload a local file to Cloudinary and return its secure (https) URL.
// f_auto,q_auto tells Cloudinary to serve the smallest supported format
// (webp/avif) at the best quality automatically -> much faster delivery.
async function uploadToCloudinary(localPath, { resourceType = "auto" } = {}) {
    const result = await cloudinary.uploader.upload(localPath, {
        folder: FOLDER,
        resource_type: resourceType,
        overwrite: false,
        transformation: "f_auto,q_auto"
    });
    return result.secure_url;
}

// Cloudinary secure URLs look like:
//   https://res.cloudinary.com/<cloud>/<resource>/v123/<folder>/<name>.<ext>
// Derive the public_id (folder + name, no extension, no version) so we can
// delete the asset later.
function publicIdFromUrl(url) {
    try {
        const u = new URL(url);
        let segs = u.pathname.split("/").filter(Boolean);
        if (segs[0] && /^v\d+$/.test(segs[0])) segs = segs.slice(1);
        const last = segs[segs.length - 1].replace(/\.[^.]+$/, "");
        segs[segs.length - 1] = last;
        return segs.join("/");
    } catch {
        return null;
    }
}

// Best-effort removal of a stored asset. Used when deleting photos and when
// rolling back a failed upload batch.
async function deleteFromCloudinary(url, { resourceType = "image" } = {}) {
    const publicId = publicIdFromUrl(url);
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch {
        // best-effort cleanup
    }
}

module.exports = { uploadToCloudinary, deleteFromCloudinary };

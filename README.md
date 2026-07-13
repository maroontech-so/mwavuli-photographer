# Mwavuli Photography Portfolio

A full-stack photography portfolio and admin platform for Mwavuli Photography. It includes a public-facing website with an auto-sliding project teaser, gallery, booking form, and an authenticated admin panel for managing media, projects, bookings, messages, and testimonials.

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Local Development](#local-development)
6. [API Reference](#api-reference)
7. [Admin Panel](#admin-panel)
8. [Frontend Behavior](#frontend-behavior)
9. [Deployment](#deployment)
10. [Security Notes](#security-notes)

## Features

### Public Site
- Hero section with call-to-action buttons
- About section
- Project carousel teaser with auto-slideshow, prev/next controls, and a See More button
- Services overview
- Testimonials
- Contact/booking form with service picker and date picker
- Gallery page with project collections and general gallery
- Project detail pages with mosaic gallery layout
- Lightbox with swipe, prev/next, and keyboard navigation
- Responsive top nav on desktop; collapsible left sidebar on mobile

### Admin Panel
- Dashboard
- Media upload with file list and progress bar
- Gallery manager with bulk select/delete via long-press
- Project manager with cover selection and per-project file management
- Message inbox
- Testimonial manager
- JWT-authenticated routes
- Confirm delete modals and toast notifications

## Tech Stack

### Frontend
- HTML5, CSS3, vanilla JavaScript
- Mobile-first responsive design
- Custom carousel, lightbox, service picker, date picker
- Bullet-actions module for bulk delete

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Multer for media uploads
- bcrypt for password hashing

## Project Structure

```
.
+-- index.html
+-- style.css
+-- script.js
+-- gallery.html
+-- gallery.js
+-- project.html
+-- project.js
+-- projects.html
+-- projects.js
+-- lightbox.js
+-- bulk-actions.js
+-- manifest.json
+-- sw.js
+-- admin/
+   +-- login.html
+   +-- login.js
+   +-- auth.js
+   +-- dashboard.html
+   +-- dashboard.js
+   +-- upload.html
+   +-- upload.js
+   +-- gallery.html
+   +-- gallery.js
+   +-- gallery.css
+   +-- projects.html
+   +-- projects.js
+   +-- projects.css
+   +-- messages.html
+   +-- messages.js
+   +-- messages.css
+   +-- testimonials.html
+   +-- testimonials.js
+   +-- testimonials.css
+   +-- bookings.html
+   +-- bookings.js
+   +-- bookings.css
+   +-- bulk-actions.js
+   +-- dashboard.css
+   +-- admin-ui.js
+-- server/
+   +-- server.js
+   +-- package.json
+   +-- middleware/
+   +   +-- auth.js
+   +   +-- upload.js
+   +-- models/
+   +   +-- Admin.js
+   +   +-- Photo.js
+   +   +-- Project.js
+   +   +-- Booking.js
+   +   +-- Message.js
+   +   +-- Testimonial.js
+   +-- controller/
+   +   +-- adminController.js
+   +   +-- photoController.js
+   +   +-- projectController.js
+   +   +-- bookingController.js
+   +   +-- messageController.js
+   +   +-- testimonialController.js
+   +-- routes/
+   +   +-- adminRoutes.js
+   +   +-- photoRoutes.js
+   +   +-- projectRoutes.js
+   +   +-- bookingRoutes.js
+   +   +-- messageRoutes.js
+   +   +-- testimonialRoutes.js
+   +-- config/
+   +   +-- db.js
+   +-- uploads/
+-- assets/
+   +-- images/
```

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
NODE_ENV=development
PORT=5000

# Cloudinary (media storage) — required in production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=mwavuli
```

### Variable Descriptions
| Variable | Description | Required |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret used to sign JWT tokens | Yes |
| `ADMIN_EMAIL` | Default admin email seeded on startup | Yes |
| `ADMIN_PASSWORD` | Default admin password seeded on startup | Yes |
| `NODE_ENV` | Environment: `development` or `production` | No |
| `PORT` | Server port, defaults to `5000` | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes (prod) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes (prod) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes (prod) |
| `CLOUDINARY_FOLDER` | Folder in your Cloudinary account for uploads | No |

## Local Development

### Prerequisites
- Node.js
- MongoDB instance or MongoDB Atlas connection string
- npm or yarn

### Install Dependencies

```bash
cd server
npm install

### Photos
| Method | Path | Description |
|---|---|---|
| GET | `/api/photos` | Get all photos |
| POST | `/api/photos/upload` | Upload photos/videos (requires auth) |
| PUT | `/api/photos/:id` | Update photo (requires auth) |
| DELETE | `/api/photos/:id` | Delete photo (requires auth) |

### Projects
| Method | Path | Description |
|---|---|---|
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get single project with photos |
| POST | `/api/projects` | Create project (requires auth) |
| PUT | `/api/projects/:id` | Update project (requires auth) |
| PUT | `/api/projects/:id/cover` | Set project cover photo (requires auth) |
| DELETE | `/api/projects/:id` | Delete project and its photos (requires auth) |

### Bookings
| Method | Path | Description |
|---|---|---|
| GET | `/api/bookings` | Get all bookings (requires auth) |
| POST | `/api/bookings` | Create booking |
| DELETE | `/api/bookings/:id` | Delete booking (requires auth) |

### Messages
| Method | Path | Description |
|---|---|---|
| GET | `/api/messages` | Get all messages (requires auth) |
| POST | `/api/messages` | Create message from contact form |
| DELETE | `/api/messages/:id` | Delete message (requires auth) |

### Testimonials
| Method | Path | Description |
|---|---|---|
| GET | `/api/testimonials` | Get all testimonials |
| POST | `/api/testimonials` | Create testimonial (requires auth) |
| DELETE | `/api/testimonials/:id` | Delete testimonial (requires auth) |

## Admin Panel

The admin panel is located at `/admin/` and uses JWT-based authentication.

### Pages
- `/admin/login.html` - Login
- `/admin/dashboard.html` - Dashboard
- `/admin/upload.html` - Media upload
- `/admin/gallery.html` - Gallery manager
- `/admin/projects.html` - Project manager
- `/admin/messages.html` - Contact messages
- `/admin/testimonials.html` - Testimonial manager

### Authentication Flow
1. Admin logs in at `/admin/login.html`
2. Backend validates credentials and returns a JWT
3. JWT is stored in `localStorage` as `adminToken`
4. All protected API requests include `Authorization: Bearer <token>`
5. On 401 responses, the admin is redirected to login

### Media Upload
- General upload: upload photos/videos without project association
- Project upload: upload media directly into a specific project
- Supported formats: JPEG, PNG, JPG, WebP, MP4, QuickTime, AVI, WebM
- Maximum file size: 100MB per file
- **Every upload is automatically sanitised** (see `server/utils/sanitize.js`):
  - The real file type is validated by its bytes (not the client-supplied MIME type), so spoofed/unsafe files are rejected and discarded.
  - Images are re-encoded to WebP, EXIF/GPS metadata is stripped, and they are right-sized to a 2000px display resolution with an 800px thumbnail.
  - Videos are validated and normalised to H.264/AAC MP4 (with a poster thumbnail); falls back to validated passthrough when `ffmpeg` is unavailable.
  - The original raw file is deleted and replaced by the sanitised output.
- To sanitise media that was uploaded **before** this feature, run:
  `node server/scripts/sanitize-existing.js` (requires `MONGO_URI` in `server/.env`).
- Files are stored in `/server/uploads/` and served via `/uploads/`.

### Bulk Actions
- Long-press or click a checkbox to enter selection mode
- Tap multiple items to select/deselect
- Floating bulk bar appears with selected count and delete button
- Professional confirm modal before deletion

## Frontend Behavior

### Homepage
- Hero section with background animation
- Project carousel: auto-advancing slideshow with smooth transitions
- Project covers link to the full gallery
- See More button opens the gallery page

### Gallery Page
- Project Collections: cards for each project with cover image and overlay text
- General Gallery: mosaic grid of images not tied to a specific project
- Clicking a project opens its dedicated detail page
- Lightbox supports swipe gestures, prev/next buttons, and keyboard navigation

### Project Detail Page
- Cover header with overlay text
- Mosaic image grid of photos uploaded to that project
- Back to Projects button

### Booking Form
- Service picker with icons
- Custom date picker calendar
- Form submits to `/api/messages`
- Green toast notification on success

### Mobile Responsiveness
- Desktop: horizontal top navigation with Book Now CTA
- Mobile (<=768px): hamburger menu opens a left sidebar
- Reduced side padding and margins on small screens
- Carousel shows fewer slides on smaller viewports

### Performance & Caching
- **Zero external requests.** Fonts (Cinzel + Poppins) and Font Awesome are self-hosted under `assets/fonts/` and `assets/vendor/fontawesome/` — no Google Fonts or cdnjs calls.
- **Service worker (`sw.js`)** precaches the app shell and serves all same-origin static assets stale-while-revalidate, giving instant repeat visits and offline support. `GET /api/*` is never cached.
- **Images** are served as right-sized WebP (see Media Upload); the hero is `<link rel="preload">`-ed for fast LCP.
- Static assets get `Cache-Control: public, max-age=31536000, immutable` via `vercel.json`.
- To refresh the self-hosted fonts after changing families/weights, run `node tools/fetch-fonts.js`.
- If you change cached files, bump `CACHE_VERSION` in `sw.js` so clients pick up the new versions.

## Deployment

### Render.com
1. Connect your GitHub repository
2. Set the root directory to `server`
3. Set the build command to `npm install`
4. Set the start command to `npm start`
5. Add environment variables in the Render dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_FOLDER` (optional, defaults to `mwavuli`)
6. Deploy

> **Why Cloudinary is required:** Render's free web service has an ephemeral
> filesystem. Any file written to `server/uploads/` (old behaviour) is deleted
> whenever the service spins down after inactivity, so uploaded photos would
> vanish after ~15–30 minutes. Media is now uploaded to Cloudinary and served
> from its CDN, which survives restarts. The frontend falls back to the local
> `/uploads/` route automatically for any legacy entries.

### Vercel
- A `vercel.json` file is included for Vercel deployment
- Serverless function entry point is `server/server.js`
- Uploads folder should be configured for persistent storage in production

## Security Notes

- Change `JWT_SECRET` to a strong random value in production
- The default seeded admin is created only if one does not already exist
- Protected API routes require a valid Bearer JWT
- File uploads are restricted to images and videos only
- All admin delete actions use a custom confirm modal instead of native browser dialogs

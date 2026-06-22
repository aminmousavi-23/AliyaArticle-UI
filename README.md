# AliyaArticle

A simple Medium-style article app — write, publish, and read articles, organized
by category and tags, with comments. Built in React + TypeScript against the
`WebAPI v1` backend described in `v1.json`.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies any `/api/*`
request to `http://localhost:5000` (see `vite.config.ts`), which is the
server URL declared in `v1.json`. Run your backend on port 5000 and
everything will just work with no CORS configuration needed.

If your backend runs somewhere else, copy `.env.example` to `.env` and set
`VITE_API_BASE_URL`.

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint        # eslint
```

## ⚠️ About the API response shapes — please read

`v1.json` is unusually thin: every endpoint declares `"200": { "description": "OK" }`
with **no response schema at all**. The request bodies (the `Command`/`Query`
types) are exact — they're taken straight from the spec. But anything this
app expects to get *back* from the server (article objects, paginated list
wrappers, login tokens, user objects, etc.) is an assumption based on common
ASP.NET / MediatR "Clean Architecture" conventions, because the spec doesn't
say.

**Everything assumed lives in one file: `src/types/api.ts`.** Each assumed
type is commented `// ASSUMPTION`. If your real backend returns different
field names or a different wrapper shape, that file — plus the small `api/*.ts`
modules that call each endpoint — is everything you need to touch. The UI
components don't know or care about JSON shape; they just consume the
TypeScript types.

Specifically, this app assumes:

- **Paginated search endpoints** (`/api/article/search`, `/api/category/search`,
  `/api/tag/search`, `/api/comment/search`, `/api/auth/search`) return
  `{ items, pageNumber, totalPages, totalCount, hasPreviousPage, hasNextPage }`
  — the standard `PaginatedList<T>` shape from Jason Taylor's Clean
  Architecture template.
- **`POST /api/article`** (create) returns the new article's id, either as a
  bare string or as `{ id }` / `{ articleId }` / `{ value }` — the client
  tries all of these (see `extractCreatedId` in `src/api/articles.ts`).
- **`POST /api/auth/login`** and **`POST /api/auth/refresh-token`** return
  `{ accessToken, refreshToken }`.
- **`GET /api/auth/{id}`** returns `{ id, username, fullName, email, phoneNumber }`.
- **`GET /api/article/{id}`** returns a full article including nested
  `author`, `category`, `tags[]`, and `blocks[]` (with each block's `id`,
  `type`, `text`, `attachmentId`, `order`), plus `isPublished`, `createdAt`,
  `publishedAt`.
- **`BlockType`** is `0 = Text`, `1 = Image` (the spec only says it's an
  integer).
- **`FilterOperation`** values follow the common ordering: Equals=0,
  NotEquals=1, GreaterThan=2, GreaterThanOrEqual=3, LessThan=4,
  LessThanOrEqual=5, Contains=6, StartsWith=7, EndsWith=8.
- Article filtering relies on the dynamic `FilterDto`/`FilterItemDto` system
  supporting filters on field names like `isPublished`, `title` (Contains),
  `categoryId` (Equals), `tagIds` (Contains — i.e. "array contains this id"),
  and `createdBy` (Equals, used by "My articles"). If your backend's dynamic
  filter only supports certain fields, adjust the `buildFilter(...)` calls in
  `src/pages/HomePage.tsx` and `src/pages/MyArticlesPage.tsx`.
- **`GET /api/attachment/{id}`** serves the raw image file directly (so an
  `<img src=".../api/attachment/{id}">` just works) rather than returning
  JSON metadata.
- Image uploads send the **full `data:image/...;base64,...` URL** as
  `base64File` (i.e. exactly what `FileReader.readAsDataURL` produces), not a
  bare base64 string. Strip the `data:...;base64,` prefix server-side if your
  backend expects raw base64.

If your backend matches different conventions, search for `ASSUMPTION` in
`src/types/api.ts` and adjust.

## Known limitations (from the API itself, not assumptions)

- **There is no "edit article" endpoint** in `v1.json` — only create, delete,
  and publish. So this app only lets you create a new article and publish or
  delete it; there's no edit-after-create flow. Add a `PUT /api/article/{id}`
  endpoint and a corresponding edit page if you need one.
- **No role/permission info is exposed** anywhere in the spec, so "can this
  person delete this comment / category / tag" isn't something the frontend
  can determine precisely. The UI takes the conservative position of letting
  any logged-in user moderate comments and manage categories/tags, and only
  lets an article's author delete their own article (compared by
  `article.author.id === currentUser.id`). Tighten this once your backend
  exposes real authorization.
- Comments can be posted by anyone, logged in or not — `CreateCommentCommand`
  takes `authorName`/`authorEmail` directly rather than using the
  authenticated user, so the spec implies guest commenting is intended.

## Project structure

```
src/
  api/            One file per resource — thin wrappers around apiClient calls
  components/     Reusable UI: cards, forms, the block editor, nav, etc.
  context/        AuthContext (current user + tokens) and ToastContext
  lib/            apiClient (axios + auth refresh), filter builder, formatting,
                  JWT decoding, the category "spine" color helper
  pages/          One component per route
  styles/         Plain CSS, split by concern (tokens, base, layout,
                  components, article, editor, auth) and imported from index.css
  types/api.ts    All request/response types — see the assumptions above
```

## Design notes

No CSS framework — a small custom design system driven by CSS variables in
`src/styles/tokens.css`. Headlines use Fraunces (serif), UI chrome uses Inter,
and bylines/timestamps/tags use IBM Plex Mono for an editorial, slightly
typewritten feel. The one recurring signature element is the colored "spine"
on each article card and the vertical tag rail in the margin of the reading
view — both nod to the idea of AliyaArticle and library shelving, and the
spine color is derived deterministically from the category id so the same
category always reads the same color without needing to store one.

## Auth

JWT access + refresh tokens are stored in `localStorage`. The axios instance
in `src/lib/apiClient.ts` attaches `Authorization: Bearer <token>` to every
request and, on a 401, automatically calls `/api/auth/refresh-token` once and
retries — concurrent requests queue behind a single in-flight refresh rather
than each firing their own. If refresh fails, tokens are cleared and the user
is treated as logged out everywhere in the app (`AuthContext` subscribes to
storage changes, so this propagates immediately, no reload needed).

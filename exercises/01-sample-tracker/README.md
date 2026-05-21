# Exercise 01: Build an SDK, Then Use It

This exercise has two parts. You'll do them in order, in a single ~60 minute pairing session with an interviewer.

## Part 1: Build the SDK

The OpenAPI / Swagger document for the target API is in this directory at [`openapi.json`](./openapi.json). It's an OpenAPI 3.1 spec exported from one of our internal FastAPI services.

The fastest path to a working SDK is to point an AI tool at the swagger doc and let it generate the whole thing. You're welcome — encouraged — to do that. We want to see how you use AI tooling, not whether you can write boilerplate by hand. But a naive codegen will produce an SDK that's a sloppy reflection of the swagger doc: endpoints become method names, request bodies become positional-argument dumps, every response is a `dict[str, Any]`, and the same auth header is plumbed through every method.

A good SDK has a deliberate, ergonomic surface. It groups related operations, hides transport details, types responses, makes the common path the easy one, and surfaces errors in a way calling code can actually act on.

Focus on the shape and feel of the SDK rather than end-to-end calls.

## Part 2: Wire the SDK into the vibe app

The React app in this directory is a vibe-coded sample tracker: it reads from a static `src/samples.json`, persists submissions to `localStorage`, and has the API base URL sitting in a `const` at the top of `App.tsx` going nowhere. Replace that fake data layer with real calls through the SDK you just built.

Treat this as a refactor, not a rewrite. The UI doesn't need to change — the goal is for the same screens to be backed by your SDK instead of the JSON file and `localStorage`. As you go, expect to find places where the vibe-coded shape of the app pushes back against a clean SDK surface (loose `any` types, ad-hoc field names, optimistic local state). Decide where to bend the app to fit the SDK and where to extend the SDK to fit a real caller — that tension is most of what we want to talk through.

Stub the transport however you like (mock fetch, hand-rolled fake, MSW, etc.) so the app renders against SDK-shaped data end to end.

## Running the vibe app

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

The app reads from `src/samples.json` in this directory. No external services or credentials required — it runs cold. Submitted samples persist in `localStorage`; clear it via DevTools to reset.

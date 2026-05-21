# Exercise 01: Build an SDK, Then Use It

This exercise has two parts. You'll do them in order, in a single ~60 minute pairing session with an interviewer.

## Part 1: Build the SDK

Your interviewer will give you an OpenAPI / Swagger document for one of our internal APIs and a target language to build the SDK in.

The fastest path to a working SDK is to point an AI tool at the swagger doc and let it generate the whole thing. You're welcome — encouraged — to do that. We want to see how you use AI tooling, not whether you can write boilerplate by hand. But a naive codegen will produce an SDK that's a sloppy reflection of the swagger doc: endpoints become method names, request bodies become positional-argument dumps, every response is a `dict[str, Any]`, and the same auth header is plumbed through every method.

A good SDK has a deliberate, ergonomic surface. It groups related operations, hides transport details, types responses, makes the common path the easy one, and surfaces errors in a way calling code can actually act on.

## Running the vibe app

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

The app reads from `src/samples.json` in this directory. No external services or credentials required — it runs cold. Submitted samples persist in `localStorage`; clear it via DevTools to reset.

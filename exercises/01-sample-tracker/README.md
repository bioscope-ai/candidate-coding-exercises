# Exercise 01: Build an SDK, Then Use It

This exercise has two parts. You'll do them in order, in a single ~60 minute pairing session with an interviewer.

## Part 1: Build the SDK

Your interviewer will give you an OpenAPI / Swagger document for one of our internal APIs and a target language to build the SDK in.

The fastest path to a working SDK is to point an AI tool at the swagger doc and let it generate the whole thing. You're welcome — encouraged — to do that. We want to see how you use AI tooling, not whether you can write boilerplate by hand. But a naive codegen will produce an SDK that's a sloppy reflection of the swagger doc: endpoints become method names, request bodies become positional-argument dumps, every response is a `dict[str, Any]`, and the same auth header is plumbed through every method.

A good SDK has a deliberate, ergonomic surface. It groups related operations, hides transport details, types responses, makes the common path the easy one, and surfaces errors in a way calling code can actually act on.

We'd like to see you spend most of your time on *that* design work — shaping what the SDK should feel like to use, then bending generated code into that shape. Be willing to delete and re-prompt rather than accept output that doesn't read well.

## Part 2: Use the SDK

This directory contains `sample_tracker.py`, a small CLI that talks to the same API the SDK targets. It's vibe-coded — it works, but it bypasses the SDK entirely and talks to the API with raw HTTP calls scattered throughout. There's no error handling worth speaking of, every response is a dict, URLs are concatenated by hand, the auth header is rebuilt on every call, and the same boilerplate is repeated in every command.

Your task: refactor it to use the SDK you just built. Replace the raw HTTP calls with SDK method calls. Replace dict-shaped data with whatever your SDK returns. Improve the rest of what stands out along the way, but the priority is integration — not a wholesale rewrite.

## What we're looking for

- **Part 1 — design taste.** Do you think about what calling code will look like *before* you generate? Do you push back on slop? Do you delete and re-prompt when output is the wrong shape?
- **Part 2 — pragmatism.** How do you read existing code? What do you change vs. leave alone? How cleanly do you bridge the messy app to your clean SDK?

## Running the vibe app

```bash
pip install -r requirements.txt

export BIOSCOPE_API_TOKEN=<token your interviewer gives you>

python3 sample_tracker.py list
python3 sample_tracker.py search SUBJ001
python3 sample_tracker.py summary
python3 sample_tracker.py report SUBJ001
python3 sample_tracker.py submit SUBJ001 BC0042 stool 16S-v4
python3 sample_tracker.py get smpl_abc123
```

The CLI talks to `BASE_URL` at the top of `sample_tracker.py`. Your interviewer will point you at a running mock server with sample data loaded.

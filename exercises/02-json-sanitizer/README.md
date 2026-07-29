# JSON Sanitization Challenge

## Overview

We'd like you to design and build a small library whose job is to sanitize JSON.


By way of example, imagine a data record containing a name, an email address, and some nested billing details as well as a caller that wants the email removed and the account number obscured, while everything else is left untouched. Producing that transformed record, driven by the caller's specification, is the kind of thing this library is for.

The exercise is deliberately open-ended. Part of what we're interested in is how you interpret an under-specified problem: the decisions you make, the trade-offs you weigh, and the questions you ask along the way. Treat the requirements below as the shape of the problem, not a complete specification — where something is unstated, that's an invitation to think it through and make a defensible choice.

This is meant to be collaborative. Please think out loud, explain your reasoning as you work, and ask questions whenever the requirements feel ambiguous. If you get stuck, say so — that's a normal part of the process.

## Inputs

The core of the library is a **sanitization function**. It receives:

1. **A JSON value.** Assume it is arbitrary: any structure, any depth, any mix of objects, arrays, and scalars. You will not know its shape in advance.
2. **A specification** describing how the value should be sanitized — that is, which parts of the JSON should be affected and what should happen to them.

The form the specification takes is up to you.

## Required outputs

**Behavior.** The function returns a JSON value: the input transformed according to the specification.

**Collateral.** This is intended to live in a shared, important library that other people will depend on, so we care about more than a function that runs. We'd expect the kind of supporting material you'd produce for any serious piece of work, including:

- A short **design document** explaining your approach, the specification you settled on, and the reasoning behind your key decisions.
- At least one **worked example** of your own — a representative input, its specification, and the resulting output — showing the library doing something meaningful.
- **Tests** that demonstrate the behavior and give you confidence it's correct.

Use your judgment about what else belongs alongside production-quality code.

## Example

Consider a JSON blob with the following fields:

```json
{
  emailAddress: string,
  accountNumber: string,
  billingDetails: {
    [
      invoiceNumber: string,
      invoiceDate: string,
      hasPaid: boolean
    ]
  }
}
```

and a caller that wants:

- The email address removed
- The account number obscured
- Everything else left untouched

This library would then be able to take those two inputs and return the desired output.

## Ground rules

- Use **any language** you're comfortable in.
- Use whatever **tools** you'd normally reach for — your editor, documentation, the web, and standard and third-party libraries. Your editor's ordinary deterministic autocomplete (symbol and identifier completion) is fine. **AI assistance — coding assistants, AI-powered autocomplete, chatbots, and the like — is not permitted for this exercise**; we want to see your own work and reasoning. Please disable it before you begin.
- **Talk us through it** as you go: your thinking, your trade-offs, and anything you'd do differently with more time.
- The exercise is designed to fit in roughly an hour of focused work. A clean, well-reasoned, well-tested core is worth more than a large unfinished one.

# hi-deer-on-call
A social alarm clock data analysis package.

Start by grabbing a mirror of the data publically available, or contact a developer for a snapshot.

> wget -mkEpnp https://wakie.com/catalog/en

Common usage patterns:

Extract a subset:
> deno run -A --unstable src/main.ts extract --take 50 --skip 0 --shuffle

Index a subset:
> deno run -A --unstable src/main.ts index --take 1000 --skip 0

Other options:

Arg       | Detail
--------- | ---------------------------
--take    | How many to process
--skip    | How many to skip at the front, for paging
--shuffle | Random selection
--debug   | More output
--json    | Machine parseable output



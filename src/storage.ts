import * as R from "https://deno.land/x/ramda@v0.27.2/mod.ts";

class TopicIndexStorage {
    public AuthorReplierCount = {};
    public ReplyCounts = {};
    public RepliesTotal = 0;
}

// deno-lint-ignore no-explicit-any
function map2object<T extends string,V>(m: Map<T,V>): any {
    // deno-lint-ignore no-explicit-any
    const o = {} as any;
    m.forEach((k,v) => {
        o[k] = v;
    });
    return o;
}


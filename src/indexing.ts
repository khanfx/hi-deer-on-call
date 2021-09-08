import * as C from './common.ts';

type IndexingProc = (index: C.TopicIndex, topic: C.Topic) => void;

export function updateReplierCounts(index: C.TopicIndex, topic: C.Topic) {
    for (const comment of topic.comments || []) {
        C.checkMultikeyMap(index.AuthorReplierCount, [topic.author, comment.author], x => x??0 + 1)
        C.checkMultikeyMap(index.ReplyCounts, [comment.author], x => x??0 + 1)
        index.RepliesTotal++;
    }
}

function save(index: C.TopicIndex, path: string) {
    Deno.writeTextFileSync(path, JSON.stringify({
        AuthorReplierCount: Array.from(index.AuthorReplierCount),
        ReplyCounts: Array.from(index.ReplyCounts),
        RepliesTotal: index.RepliesTotal
    }));
}

export function load(path: string): C.TopicIndex {
    var raw = JSON.parse(Deno.readTextFileSync(path));
    raw.AuthorReplierCount = new Map(raw.AuthorReplierCount);
    raw.ReplyCounts = new Map(raw.ReplyCounts);
    return raw as C.TopicIndex;
}

export async function runIndexingProcs(indexingProcs: IndexingProc[]) {
    var list = C.applyCommandFilter(await C.toArray(Deno.readDir(C.command.TopicDataPath)));
    let ii = 1;
    const interval = 50;
    var index = new C.TopicIndex();
    for (const dirEntry of list) {
        const path = C.command.TopicDataPath + '/' + dirEntry.name;
        const topic = JSON.parse(Deno.readTextFileSync(path)) as C.Topic;
        for (const f of indexingProcs)
            f(index, topic);
        if (ii % interval == 0)
            C.emit(`[${ii}/${list.length}] Indexed ${dirEntry.name}`, 
                { done: ii, outOf: list.length, file: dirEntry.name});
        ii++;
    }
    save(index, 'index.json');
    C.emitJSON(index);
}

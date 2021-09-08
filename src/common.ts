export class Command  {
    TopicMirrorPath: string;
    TopicDataPath: string;

    random: boolean | undefined;
    skip: number | undefined;
    take: number | undefined;
    force: boolean | undefined;
    json: boolean | undefined;

    debug: boolean | undefined;

    extract: boolean | undefined;
    index: boolean | undefined;

    constructor() {
        this.TopicMirrorPath = '.';
        this.TopicDataPath = '.';
    }
}

export type Topic = {
    id?: string;
    author?: string;
    date?: string;
    content?: string;
    likes?: string;
    comments?: Comment[];
    parserVersion?: number;
    fileModTime?: Date;
}

export type Comment = {
    author?: string;
    date?: string;
    content?: string;
}

export class TopicIndex {
    public AuthorReplierCount = new Map<string, number>();
    public ReplyCounts = new Map<string, number>();
    public RepliesTotal = 0;
}

export let command: Command;

export function setCommand(c: Command) {
    command = c;
}

// deno-lint-ignore no-explicit-any
export function emitDebug(message: string, json?: any) {
    if (command.debug) {
        console.log(message, json);
    }
}

// deno-lint-ignore no-explicit-any
export function emit(message: string, json?: any) {
    if (!command.json)
        if (json)
            console.log(message, json);
        else
            console.log(message);
}

// deno-lint-ignore no-explicit-any
export function emitJSON(json: any, label: string|null = null) {
    if (command.json)
        if (label)
            console.log({__label: label, ...json});
        else
            console.log(json);
}


function shuffle<T>(array: T[]): T[] {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

export async function toArray<T>(asyncIterator:AsyncIterable<T>){ 
    const arr=[]; 
    for await(const i of asyncIterator) arr.push(i); 
    return arr;
}

export function applyCommandFilter<T>(list: T[]) {
    if (command.random)
        list = shuffle(list);
    if (command.skip)
        list = list.slice(command.skip);
    if (command.take)
        list = list.slice(0, command.take);
    return list;
}

// deno-lint-ignore no-explicit-any
export function checkMultikeyMap<Tvalue>(map: Map<string,Tvalue>, keys: any[], update?: (count: Tvalue | undefined) => Tvalue) {
    const key = JSON.stringify(keys);
    let count = map.get(key || '');
    if (update) {
        count = update(count);
        map.set(key || '', count);
    }
    return count;
}

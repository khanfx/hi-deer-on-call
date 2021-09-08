import * as dom from "https://deno.land/x/deno_dom@v0.1.14-alpha/deno-dom-wasm.ts";
import * as path from "https://deno.land/std@0.106.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.106.0/fs/mod.ts";
import * as R from "https://deno.land/x/ramda@v0.27.2/mod.ts";
import * as C from "./common.ts";

function extractComment(li: dom.Element): C.Comment {
    return {
        author: li.querySelector('.post__author-name')?.textContent,
        date: li.querySelector('.post__date .published')?.attributes?.datetime,
        content: li.querySelector('p')?.textContent
    };
}

function extractTopic(doc: dom.Element): C.Topic {
    const getComments = () => doc.querySelectorAll('.comments-list li');
    const topic: C.Topic = {
        author: doc.querySelector("a.post__author-name")?.textContent,
        date: doc.querySelector('.author-date .published')?.attributes?.datetime,
        content: doc.querySelector('article p')?.textContent,
        likes: doc.querySelector('.post-additional-info .post-add-icon span')?.textContent,
        comments: R.map(extractComment, getComments()),
    };
    return topic;
}

async function parseFile(fullpath: string) {
    const intext = await Deno.readTextFile(fullpath);
    const doc = new dom.DOMParser().parseFromString(intext, "text/html");
    var topic = extractTopic(doc!.body);
    topic.id = path.parse(fullpath).name;
    return topic;
}

function getExistingModTime(path: string): Date | null {
    if (fs.existsSync(path)) {
        const topic = JSON.parse(Deno.readTextFileSync(path));
        return new Date(topic.fileModTime);
    }
    return null;
}

enum ActionType { NewlyParsed, Updated, NotRequired }

type ProcessResult = {
    ActionType: ActionType;
}

function shouldProcess(resultTime: Date | null, sourceTime: Date) {
    return C.command.force || 
        resultTime == null || 
        resultTime?.getTime() != sourceTime?.getTime();
}

async function processFile(folderpath: string, filename: string): Promise<ProcessResult> {
    const fullpath = folderpath + '/' + filename;
    // or use topic.id for more dependable?
    const topicIdGuess = path.parse(filename).name;
    const targetFileName = `${C.command.TopicDataPath}/${topicIdGuess}.json`;
    const sourceTime = Deno.statSync(fullpath).mtime as Date; // Should always be present
    var existingResultTime = getExistingModTime(targetFileName);
    if (shouldProcess(existingResultTime, sourceTime)) {
        const topic = await parseFile(fullpath);
        topic.parserVersion = 1;
        topic.fileModTime = sourceTime ?? undefined;
        const encoder = new TextEncoder();
        Deno.writeFileSync(targetFileName, encoder.encode(JSON.stringify(topic)));
        return { ActionType: (existingResultTime == null ? ActionType.NewlyParsed : ActionType.Updated) };
    }
    else
    {
        return { ActionType: ActionType.NotRequired };
    }
}

export async function runParseCommand() {
    var list = C.applyCommandFilter(await C.toArray(Deno.readDir(C.command.TopicMirrorPath)));
    let ii = 1;
    for (const dirEntry of list) {
        const result = await processFile(C.command.TopicMirrorPath, dirEntry.name);
        C.emit(`[${ii}/${list.length}] Parsed ${dirEntry.name}\t${ActionType[result.ActionType]}`);
        C.emitJSON({ action: "parsed", total: list.length, number: ii, result: result.ActionType });
        ii++;
    }
}

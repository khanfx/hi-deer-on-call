import Denomander from "https://deno.land/x/denomander@0.8.2/mod.ts";
import * as C from "./common.ts";
import * as P from "./parser.ts";
import * as I from "./indexing.ts";

const program = new Denomander({
    app_name: "hi-deer-on-call",
    app_description: "A social alarm clock data analysis package.",
    app_version: "1.0.0"
});

program
    .globalOption('--json', '')
    .globalOption('--random', '')
    .globalOption('--skip', '')
    .globalOption('--take', '')
    .globalOption('--force', '')
    .globalOption('--debug', '')
    .command('extract', '')
    .option('--input --TopicMirrorPath', '')
    .option('--output --TopicDataPath', '')
    .command('index', '')
    .option('--input --TopicDataPath', '')
    .parse(Deno.args)

// deno-lint-ignore no-explicit-any
function pullFrom(dst: any, src: any) {
    for (const p in dst) {
        if (p in src)
            dst[p] = src[p]
    }
    return dst;
}

const configFile = JSON.parse(Deno.readTextFileSync('config.json')) as C.Command
let globalCommand = new C.Command;
globalCommand = pullFrom(globalCommand, configFile)
globalCommand = pullFrom(globalCommand, program)
C.setCommand(globalCommand)

C.emitDebug("GlobalCommand", globalCommand)

if (program.extract) {
    P.runParseCommand()
}

if (program.index) {
    I.runIndexingProcs([I.updateReplierCounts])
}

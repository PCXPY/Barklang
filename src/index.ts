/**
 * @overview generated by ghoti-cli
 * @fileoverview Entry
 */

import generateAst from "./ast/ast";
import execute from "./execute/execute";
import { internalList, internals } from "./execute/list";

import TAst from "./types/ast";
import IBkcOptions, { TCallables } from "./types/callable";
import TExecute from "./types/execute";
import { checkOptionNameSpace, fixOption } from "./util/check";
import { determine, determineReturn } from "./util/determine";


export const bkc = (code: string, optionsE?: IBkcOptions): any => {
    const options: IBkcOptions = fixOption(optionsE);

    if (checkOptionNameSpace(options).length !== 0) {
        throw new Error('initial namespace is occupied exception');
    }

    const ast: TAst = generateAst(code, options);
    const executed: TExecute = execute(ast, options);

    for (let i of executed) {
        if (determineReturn(i.value)) {
            return i.arg;
        }
        const func: ((arg: any) => void) | null = determine(i.value, (options.externals as TCallables));

        if (!func) {
            throw new Error('command is not defined exception');
        }

        func(i.arg);
    }

    return void 0;
};

export default bkc;

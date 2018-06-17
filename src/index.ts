/**
 * @overview generated by ghoti-cli
 * @fileoverview Entry
 */

import generateAst from "./ast/ast";
import excute from "./excute/excute";
import { internalList, internals } from "./excute/list";
import TCallables from "./types/callable";

const findExternal = (val: string, externals: TCallables): number => {
    for (let i = 0; i < externals.length; i++) {
        if (externals[i].command === val) {
            return i;
        }
    }
    return -1;
};

const determinReturn = (command: string): boolean => {
    if (command === 'return') {
        return true;
    }
    return false;
};

const determin = (command: string, externals: TCallables): ((arg: any) => void) | null => {
    const internalIndex = internalList.indexOf(command);
    const externalIndex = findExternal(command, externals);
    if (internalIndex !== -1) {
        return internals[internalIndex].func;
    }

    if (externalIndex !== -1) {
        return externals[externalIndex].func;
    }

    return null;
};

const bkc = (code: string, externals: TCallables): any => {
    const ast = generateAst(code);
    const excuted = excute(ast);

    for (let i of excuted) {
        if (determinReturn(i.value)) {
            return i.arg;
        }
        const func = determin(i.value, externals);
        if (!func) {
            throw new Error('command is not defined exception');
        }

        func(i.arg);
    }

    return void 0;
};

export default bkc;

/**
 * @fileoverview parse code string to ast tree
 */

import TAst, {
    IArgs,
    IAs,
    TType,
} from '../types/ast';
import { IBkcOptions } from '../types/callable';
import { fixOption } from '../util/check';

const combineStartedToEnd = (list: string[]): IArgs => {
    return {
        type: 'str',
        va: list.join(' '),
    };
};

/**
 * This may cause performance problem, we will figure it out later
 *
 * @param {IArgs[]} args
 * @returns {IArgs[]}
 */
const combineString = (args: IArgs[]): IArgs[] => {
    let started: boolean = false;
    let temp: string[] = [];
    const re: IArgs[] = [];
    loop: for (let i of args) {
        if (i.type === 'comstart') {
            started = true;
            temp.push(i.va.substring(1, i.va.length));
            continue loop;
        }
        if (i.type === 'comend') {
            if (started) {
                started = false;
                temp.push(i.va.substring(0, i.va.length - 1));
                re.push(combineStartedToEnd(temp));
                temp = [];
            }
            continue loop;
        }
        if (started) {
            if (i.type === 'str' || i.type === 'var' || i.type === 'emp') {
                temp.push(i.va);
            } else {
                console.log(i);
                throw new Error('combine failed exception');
            }
        } else {
            re.push(i);
        }
    }
    return re;
};

const parseArg = (arg: string): IArgs => {
    const regExpString: RegExp = /^'([A-Z]|[a-z]|[0-9])*'$/;
    const regExpVariable: RegExp = /^([A-Z]|[a-z])([A-Z]|[a-z]|[0-9])*$/;
    const regExpNumber: RegExp = /^[0-9]+(.[0-9]+)?$/;
    const regExpExpression: RegExp = /^(=|\+|-|\*|\/|<|>|<=|>=|==|!=)$/;
    const regExpEmpty: RegExp = /^$/;

    const regExpCombineable: RegExp = /^'([A-Z]|[a-z]|[0-9])*$/;
    const regExpCombineend: RegExp = /^([A-Z]|[a-z]|[0-9])*'$/;

    if (regExpString.test(arg)) {
        return {
            type: 'str',
            va: arg.substring(1, arg.length - 1),
        };
    } else if (regExpVariable.test(arg)) {
        return {
            type: 'var',
            va: arg,
        };
    } else if (regExpNumber.test(arg)) {
        return {
            type: 'num',
            va: parseFloat(arg),
        };
    } else if (regExpExpression.test(arg)) {
        return {
            type: 'exp',
            va: arg,
        };
    } else if (regExpCombineable.test(arg)) {
        return {
            type: 'comstart',
            va: arg,
        };
    } else if (regExpCombineend.test(arg)) {
        return {
            type: 'comend',
            va: arg,
        };
    } else if (regExpEmpty.test(arg)) {
        return {
            type: 'emp',
            va: arg,
        };
    } else {
        return {
            type: 'err',
            va: arg,
        };
    }
};

const ast = (code: string, optionsE?: IBkcOptions): TAst => {
    const options = fixOption(optionsE);

    const regExpEnter: RegExp = /\r\n|\r|\n/;
    const splited: string[] = code.split(regExpEnter).filter((line: string) => Boolean(line.trim())).map((line: string) => line.trim());
    const vars: string[] = [];

    return splited.map((value: string): IAs => {
        let dots: string[] = value.split(' ').map((dot: string) => dot.trim());
        let command: string = dots.shift() || 'skip';
        let type: TType;

        if (command === 'var') {
            const testShift: string | undefined = dots.shift();

            if (testShift) {
                command = testShift;
                vars.push(command);
            } else {
                command = 'error';
            }

            type = 'assign';
        } else if (command === 'if') {
            type = 'if';
        } else if (command === 'for') {
            type = 'for';
        } else if (command === 'end') {
            type = 'end';
        } else if (vars.indexOf(command) !== -1) {
            type = 'assign';
        } else if (command === 'skip') {
            type = 'skip';
        } else {
            type = 'command';
        }

        const re: IAs = {
            type,
            val: command,
            args: combineString(dots.map(parseArg)),
        };

        return re;
    });
};

export default ast;

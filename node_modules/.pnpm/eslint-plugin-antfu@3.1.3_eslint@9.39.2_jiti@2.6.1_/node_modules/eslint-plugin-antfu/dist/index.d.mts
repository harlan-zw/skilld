import { Rule, Linter } from 'eslint';

type RuleModule<T extends readonly unknown[]> = Rule.RuleModule & {
    defaultOptions: T;
};

type Options$2 = [
    {
        indent?: number;
        tags?: string[];
    }
];

type Options$1 = [
    {
        ArrayExpression?: boolean;
        ArrayPattern?: boolean;
        ArrowFunctionExpression?: boolean;
        CallExpression?: boolean;
        ExportNamedDeclaration?: boolean;
        FunctionDeclaration?: boolean;
        FunctionExpression?: boolean;
        ImportDeclaration?: boolean;
        JSONArrayExpression?: boolean;
        JSONObjectExpression?: boolean;
        JSXOpeningElement?: boolean;
        NewExpression?: boolean;
        ObjectExpression?: boolean;
        ObjectPattern?: boolean;
        TSFunctionType?: boolean;
        TSInterfaceDeclaration?: boolean;
        TSTupleType?: boolean;
        TSTypeLiteral?: boolean;
        TSTypeParameterDeclaration?: boolean;
        TSTypeParameterInstantiation?: boolean;
    }
];

type Options = [
    {
        allowLeadingPropertyAccess?: boolean;
    }
];

declare const plugin: {
    meta: {
        name: string;
        version: string;
    };
    rules: {
        'consistent-chaining': RuleModule<Options>;
        'consistent-list-newline': RuleModule<Options$1>;
        curly: RuleModule<[]>;
        'if-newline': RuleModule<[]>;
        'import-dedupe': RuleModule<[]>;
        'indent-unindent': RuleModule<Options$2>;
        'no-import-dist': RuleModule<[]>;
        'no-import-node-modules-by-path': RuleModule<[]>;
        'no-top-level-await': RuleModule<[]>;
        'no-ts-export-equal': RuleModule<[]>;
        'top-level-function': RuleModule<[]>;
    };
};

type RuleDefinitions = typeof plugin['rules'];
type RuleOptions = {
    [K in keyof RuleDefinitions]: RuleDefinitions[K]['defaultOptions'];
};
type Rules = {
    [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>;
};

export { plugin as default };
export type { RuleOptions, Rules };

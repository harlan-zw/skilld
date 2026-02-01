import { isCommaToken } from '@typescript-eslint/utils/ast-utils';

const version = "3.1.3";

const hasDocs = [
  "consistent-chaining",
  "consistent-list-newline",
  "curly",
  "if-newline",
  "import-dedupe",
  "indent-unindent",
  "top-level-function"
];
const blobUrl = "https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/";
function RuleCreator(urlCreator) {
  return function createNamedRule({
    name,
    meta,
    ...rule
  }) {
    return createRule({
      meta: {
        ...meta,
        docs: {
          ...meta.docs,
          url: urlCreator(name)
        }
      },
      ...rule
    });
  };
}
function createRule({
  create,
  defaultOptions,
  meta
}) {
  return {
    create: ((context) => {
      const optionsWithDefault = context.options.map((options, index) => {
        return {
          ...defaultOptions[index] || {},
          ...options || {}
        };
      });
      return create(context, optionsWithDefault);
    }),
    defaultOptions,
    meta
  };
}
const createEslintRule = RuleCreator(
  (ruleName) => hasDocs.includes(ruleName) ? `${blobUrl}${ruleName}.md` : `${blobUrl}${ruleName}.test.ts`
);

const RULE_NAME$9 = "consistent-chaining";
const consistentChaining = createEslintRule({
  name: RULE_NAME$9,
  meta: {
    type: "layout",
    docs: {
      description: "Having line breaks styles to object, array and named imports"
    },
    fixable: "whitespace",
    schema: [
      {
        type: "object",
        properties: {
          allowLeadingPropertyAccess: {
            type: "boolean",
            description: "Allow leading property access to be on the same line",
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      shouldWrap: "Should have line breaks between items, in node {{name}}",
      shouldNotWrap: "Should not have line breaks between items, in node {{name}}"
    }
  },
  defaultOptions: [
    {
      allowLeadingPropertyAccess: true
    }
  ],
  create: (context) => {
    const knownRoot = /* @__PURE__ */ new WeakSet();
    const {
      allowLeadingPropertyAccess = true
    } = context.options[0] || {};
    return {
      MemberExpression(node) {
        let root = node;
        while (root.parent && (root.parent.type === "MemberExpression" || root.parent.type === "CallExpression"))
          root = root.parent;
        if (knownRoot.has(root))
          return;
        knownRoot.add(root);
        const members = [];
        let current = root;
        while (current) {
          switch (current.type) {
            case "MemberExpression": {
              if (!current.computed)
                members.unshift(current);
              current = current.object;
              break;
            }
            case "CallExpression": {
              current = current.callee;
              break;
            }
            case "TSNonNullExpression": {
              current = current.expression;
              break;
            }
            default: {
              current = void 0;
              break;
            }
          }
        }
        let leadingPropertyAcccess = allowLeadingPropertyAccess;
        let mode = null;
        members.forEach((m) => {
          const token = context.sourceCode.getTokenBefore(m.property);
          const tokenBefore = context.sourceCode.getTokenBefore(token);
          const currentMode = token.loc.start.line === tokenBefore.loc.end.line ? "single" : "multi";
          const object = m.object.type === "TSNonNullExpression" ? m.object.expression : m.object;
          if (leadingPropertyAcccess && (object.type === "ThisExpression" || object.type === "Identifier" || object.type === "MemberExpression" || object.type === "Literal") && currentMode === "single") {
            return;
          }
          leadingPropertyAcccess = false;
          if (mode == null) {
            mode = currentMode;
            return;
          }
          if (mode !== currentMode) {
            context.report({
              messageId: mode === "single" ? "shouldNotWrap" : "shouldWrap",
              loc: token.loc,
              data: {
                name: root.type
              },
              fix(fixer) {
                if (mode === "multi")
                  return fixer.insertTextAfter(tokenBefore, "\n");
                else
                  return fixer.removeRange([tokenBefore.range[1], token.range[0]]);
              }
            });
          }
        });
      }
    };
  }
});

const RULE_NAME$8 = "consistent-list-newline";
const consistentListNewline = createEslintRule({
  name: RULE_NAME$8,
  meta: {
    type: "layout",
    docs: {
      description: "Having line breaks styles to object, array and named imports"
    },
    fixable: "whitespace",
    schema: [{
      type: "object",
      properties: {
        ArrayExpression: { type: "boolean" },
        ArrayPattern: { type: "boolean" },
        ArrowFunctionExpression: { type: "boolean" },
        CallExpression: { type: "boolean" },
        ExportNamedDeclaration: { type: "boolean" },
        FunctionDeclaration: { type: "boolean" },
        FunctionExpression: { type: "boolean" },
        ImportDeclaration: { type: "boolean" },
        JSONArrayExpression: { type: "boolean" },
        JSONObjectExpression: { type: "boolean" },
        JSXOpeningElement: { type: "boolean" },
        NewExpression: { type: "boolean" },
        ObjectExpression: { type: "boolean" },
        ObjectPattern: { type: "boolean" },
        TSFunctionType: { type: "boolean" },
        TSInterfaceDeclaration: { type: "boolean" },
        TSTupleType: { type: "boolean" },
        TSTypeLiteral: { type: "boolean" },
        TSTypeParameterDeclaration: { type: "boolean" },
        TSTypeParameterInstantiation: { type: "boolean" }
      },
      additionalProperties: false
    }],
    messages: {
      shouldWrap: "Should have line breaks between items, in node {{name}}",
      shouldNotWrap: "Should not have line breaks between items, in node {{name}}"
    }
  },
  defaultOptions: [{}],
  create: (context, [options = {}] = [{}]) => {
    const multilineNodes = /* @__PURE__ */ new Set([
      "ArrayExpression",
      "FunctionDeclaration",
      "ObjectExpression",
      "ObjectPattern",
      "TSTypeLiteral",
      "TSTupleType",
      "TSInterfaceDeclaration"
    ]);
    function removeLines(fixer, start, end, delimiter) {
      const range = [start, end];
      const code = context.sourceCode.text.slice(...range);
      return fixer.replaceTextRange(range, code.replace(/(\r\n|\n)/g, delimiter ?? ""));
    }
    function getDelimiter(root, current) {
      if (root.type !== "TSInterfaceDeclaration" && root.type !== "TSTypeLiteral")
        return;
      const currentContent = context.sourceCode.text.slice(current.range[0], current.range[1]);
      return currentContent.match(/(?:,|;)$/) ? void 0 : ",";
    }
    function hasComments(current) {
      let program = current;
      while (program.type !== "Program")
        program = program.parent;
      const currentRange = current.range;
      return !!program.comments?.some((comment) => {
        const commentRange = comment.range;
        return commentRange[0] > currentRange[0] && commentRange[1] < currentRange[1];
      });
    }
    function check(node, children, nextNode) {
      const items = children.filter(Boolean);
      if (items.length === 0)
        return;
      let startToken = ["CallExpression", "NewExpression"].includes(node.type) ? void 0 : context.sourceCode.getFirstToken(node);
      if (node.type === "CallExpression") {
        startToken = context.sourceCode.getTokenAfter(
          node.typeArguments ? node.typeArguments : node.callee.type === "MemberExpression" ? node.callee.property : node.callee
        );
      }
      if (startToken?.type !== "Punctuator")
        startToken = context.sourceCode.getTokenBefore(items[0]);
      const endToken = context.sourceCode.getTokenAfter(items[items.length - 1]);
      const startLine = startToken.loc.start.line;
      if (startToken.loc.start.line === endToken.loc.end.line)
        return;
      let mode = null;
      let lastLine = startLine;
      items.forEach((item, idx) => {
        if (mode == null) {
          mode = item.loc.start.line === lastLine ? "inline" : "newline";
          lastLine = item.loc.end.line;
          return;
        }
        const currentStart = item.loc.start.line;
        if (mode === "newline" && currentStart === lastLine) {
          context.report({
            node: item,
            messageId: "shouldWrap",
            data: {
              name: node.type
            },
            *fix(fixer) {
              yield fixer.insertTextBefore(item, "\n");
            }
          });
        } else if (mode === "inline" && currentStart !== lastLine) {
          const lastItem2 = items[idx - 1];
          if (context.sourceCode.getCommentsBefore(item).length > 0)
            return;
          const content = context.sourceCode.text.slice(lastItem2.range[1], item.range[0]);
          if (content.includes("\n")) {
            context.report({
              node: item,
              messageId: "shouldNotWrap",
              data: {
                name: node.type
              },
              *fix(fixer) {
                yield removeLines(fixer, lastItem2.range[1], item.range[0], getDelimiter(node, lastItem2));
              }
            });
          }
        }
        lastLine = item.loc.end.line;
      });
      const endRange = nextNode ? Math.min(
        context.sourceCode.getTokenBefore(nextNode).range[0],
        node.range[1]
      ) : node.range[1];
      const endLoc = context.sourceCode.getLocFromIndex(endRange);
      const lastItem = items[items.length - 1];
      if (mode === "newline" && endLoc.line === lastLine) {
        context.report({
          node: lastItem,
          messageId: "shouldWrap",
          data: {
            name: node.type
          },
          *fix(fixer) {
            yield fixer.insertTextAfter(lastItem, "\n");
          }
        });
      } else if (mode === "inline" && endLoc.line !== lastLine) {
        if (items.length === 1 && !multilineNodes.has(node.type))
          return;
        const nextToken = context.sourceCode.getTokenAfter(lastItem);
        if (context.sourceCode.getCommentsAfter(nextToken && isCommaToken(nextToken) ? nextToken : lastItem).length > 0)
          return;
        const content = context.sourceCode.text.slice(lastItem.range[1], endRange);
        if (content.includes("\n")) {
          context.report({
            node: lastItem,
            messageId: "shouldNotWrap",
            data: {
              name: node.type
            },
            *fix(fixer) {
              const delimiter = items.length === 1 ? "" : getDelimiter(node, lastItem);
              yield removeLines(fixer, lastItem.range[1], endRange, delimiter);
            }
          });
        }
      }
    }
    const listenser = {
      ObjectExpression: (node) => {
        check(node, node.properties);
      },
      ArrayExpression: (node) => {
        check(node, node.elements);
      },
      ImportDeclaration: (node) => {
        check(
          node,
          node.specifiers[0]?.type === "ImportDefaultSpecifier" ? node.specifiers.slice(1) : node.specifiers
        );
      },
      ExportNamedDeclaration: (node) => {
        check(node, node.specifiers);
      },
      FunctionDeclaration: (node) => {
        check(
          node,
          node.params,
          node.returnType || node.body
        );
      },
      FunctionExpression: (node) => {
        check(
          node,
          node.params,
          node.returnType || node.body
        );
      },
      ArrowFunctionExpression: (node) => {
        if (node.params.length <= 1)
          return;
        check(
          node,
          node.params,
          node.returnType || node.body
        );
      },
      CallExpression: (node) => {
        check(node, node.arguments);
      },
      TSInterfaceDeclaration: (node) => {
        check(node, node.body.body);
      },
      TSTypeLiteral: (node) => {
        check(node, node.members);
      },
      TSTupleType: (node) => {
        check(node, node.elementTypes);
      },
      TSFunctionType: (node) => {
        check(node, node.params);
      },
      NewExpression: (node) => {
        check(node, node.arguments);
      },
      TSTypeParameterDeclaration(node) {
        check(node, node.params);
      },
      TSTypeParameterInstantiation(node) {
        check(node, node.params);
      },
      ObjectPattern(node) {
        check(node, node.properties, node.typeAnnotation);
      },
      ArrayPattern(node) {
        check(node, node.elements);
      },
      JSXOpeningElement(node) {
        if (node.attributes.some((attr) => attr.loc.start.line !== attr.loc.end.line))
          return;
        check(node, node.attributes);
      },
      JSONArrayExpression(node) {
        if (hasComments(node))
          return;
        check(node, node.elements);
      },
      JSONObjectExpression(node) {
        if (hasComments(node))
          return;
        check(node, node.properties);
      }
    };
    Object.keys(options).forEach((key) => {
      if (options[key] === false)
        delete listenser[key];
    });
    return listenser;
  }
});

const RULE_NAME$7 = "curly";
const curly = createEslintRule({
  name: RULE_NAME$7,
  meta: {
    type: "layout",
    docs: {
      description: "Enforce Anthony's style of curly bracket"
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      missingCurlyBrackets: "Expect curly brackets"
    }
  },
  defaultOptions: [],
  create: (context) => {
    function requireCurly(body) {
      if (!body)
        return false;
      if (body.type === "BlockStatement")
        return true;
      if (["IfStatement", "WhileStatement", "DoWhileStatement", "ForStatement", "ForInStatement", "ForOfStatement"].includes(body.type))
        return true;
      const statement = body.type === "ExpressionStatement" ? body.expression : body;
      if (statement.loc.start.line !== statement.loc.end.line)
        return true;
      return false;
    }
    function wrapCurlyIfNeeded(body) {
      if (body.type === "BlockStatement")
        return;
      context.report({
        node: body,
        messageId: "missingCurlyBrackets",
        *fix(fixer) {
          yield fixer.insertTextAfter(body, "\n}");
          const token = context.sourceCode.getTokenBefore(body);
          yield fixer.insertTextAfterRange(token.range, " {");
        }
      });
    }
    function check(bodies, additionalChecks = []) {
      const requires = [...bodies, ...additionalChecks].map((body) => requireCurly(body));
      if (requires.some((i) => i))
        bodies.map((body) => wrapCurlyIfNeeded(body));
    }
    return {
      IfStatement(node) {
        const parent = node.parent;
        if (parent.type === "IfStatement" && parent.alternate === node)
          return;
        const statements = [];
        const tests = [];
        function addIf(node2) {
          statements.push(node2.consequent);
          if (node2.test)
            tests.push(node2.test);
          if (node2.alternate) {
            if (node2.alternate.type === "IfStatement")
              addIf(node2.alternate);
            else
              statements.push(node2.alternate);
          }
        }
        addIf(node);
        check(statements, tests);
      },
      WhileStatement(node) {
        check([node.body], [node.test]);
      },
      DoWhileStatement(node) {
        check([node.body], [node.test]);
      },
      ForStatement(node) {
        check([node.body]);
      },
      ForInStatement(node) {
        check([node.body]);
      },
      ForOfStatement(node) {
        check([node.body]);
      }
    };
  }
});

const RULE_NAME$6 = "if-newline";
const ifNewline = createEslintRule({
  name: RULE_NAME$6,
  meta: {
    type: "layout",
    docs: {
      description: "Newline after if"
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      missingIfNewline: "Expect newline after if"
    }
  },
  defaultOptions: [],
  create: (context) => {
    return {
      IfStatement(node) {
        if (!node.consequent)
          return;
        if (node.consequent.type === "BlockStatement")
          return;
        if (node.test.loc.end.line === node.consequent.loc.start.line) {
          context.report({
            node,
            loc: {
              start: node.test.loc.end,
              end: node.consequent.loc.start
            },
            messageId: "missingIfNewline",
            fix(fixer) {
              return fixer.replaceTextRange([node.consequent.range[0], node.consequent.range[0]], "\n");
            }
          });
        }
      }
    };
  }
});

const RULE_NAME$5 = "import-dedupe";
const importDedupe = createEslintRule({
  name: RULE_NAME$5,
  meta: {
    type: "problem",
    docs: {
      description: "Fix duplication in imports"
    },
    fixable: "code",
    schema: [],
    messages: {
      importDedupe: "Expect no duplication in imports"
    }
  },
  defaultOptions: [],
  create: (context) => {
    return {
      ImportDeclaration(node) {
        if (node.specifiers.length <= 1)
          return;
        const names = /* @__PURE__ */ new Set();
        node.specifiers.forEach((n) => {
          const id = n.local.name;
          if (names.has(id)) {
            context.report({
              node,
              loc: {
                start: n.loc.end,
                end: n.loc.start
              },
              messageId: "importDedupe",
              fix(fixer) {
                const s = n.range[0];
                let e = n.range[1];
                if (context.getSourceCode().text[e] === ",")
                  e += 1;
                return fixer.removeRange([s, e]);
              }
            });
          }
          names.add(id);
        });
      }
    };
  }
});

const _reFullWs = /^\s*$/;
function unindent(str) {
  const lines = (typeof str === "string" ? str : str[0]).split("\n");
  const whitespaceLines = lines.map((line) => _reFullWs.test(line));
  const commonIndent = lines.reduce((min, line, idx) => {
    if (whitespaceLines[idx])
      return min;
    const indent = line.match(/^\s*/)?.[0].length;
    return indent === void 0 ? min : Math.min(min, indent);
  }, Number.POSITIVE_INFINITY);
  let emptyLinesHead = 0;
  while (emptyLinesHead < lines.length && whitespaceLines[emptyLinesHead])
    emptyLinesHead++;
  let emptyLinesTail = 0;
  while (emptyLinesTail < lines.length && whitespaceLines[lines.length - emptyLinesTail - 1])
    emptyLinesTail++;
  return lines.slice(emptyLinesHead, lines.length - emptyLinesTail).map((line) => line.slice(commonIndent)).join("\n");
}

const indentUnindent = createEslintRule({
  name: "indent-unindent",
  meta: {
    type: "layout",
    docs: {
      description: "Enforce consistent indentation in `unindent` template tag"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          indent: {
            type: "number",
            minimum: 0,
            default: 2
          },
          tags: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      "indent-unindent": "Consistent indentation in unindent tag"
    }
  },
  defaultOptions: [{}],
  create(context) {
    const {
      tags = ["$", "unindent", "unIndent"],
      indent = 2
    } = context.options?.[0] ?? {};
    return {
      TaggedTemplateExpression(node) {
        const id = node.tag;
        if (!id || id.type !== "Identifier")
          return;
        if (!tags.includes(id.name))
          return;
        if (node.quasi.quasis.length !== 1)
          return;
        const quasi = node.quasi.quasis[0];
        const value = quasi.value.raw;
        const lineStartIndex = context.sourceCode.getIndexFromLoc({
          line: node.loc.start.line,
          column: 0
        });
        const baseIndent = context.sourceCode.text.slice(lineStartIndex).match(/^\s*/)?.[0] ?? "";
        const targetIndent = baseIndent + " ".repeat(indent);
        const pure = unindent([value]);
        let final = pure.split("\n").map((line) => targetIndent + line).join("\n");
        final = `
${final}
${baseIndent}`;
        if (final !== value) {
          context.report({
            node: quasi,
            messageId: "indent-unindent",
            fix: (fixer) => fixer.replaceText(quasi, `\`${final}\``)
          });
        }
      }
    };
  }
});

const RULE_NAME$4 = "no-import-dist";
const noImportDist = createEslintRule({
  name: RULE_NAME$4,
  meta: {
    type: "problem",
    docs: {
      description: "Prevent importing modules in `dist` folder"
    },
    schema: [],
    messages: {
      noImportDist: "Do not import modules in `dist` folder, got {{path}}"
    }
  },
  defaultOptions: [],
  create: (context) => {
    function isDist(path) {
      return Boolean(path.startsWith(".") && path.match(/\/dist(\/|$)/)) || path === "dist";
    }
    return {
      ImportDeclaration: (node) => {
        if (isDist(node.source.value)) {
          context.report({
            node,
            messageId: "noImportDist",
            data: {
              path: node.source.value
            }
          });
        }
      }
    };
  }
});

const RULE_NAME$3 = "no-import-node-modules-by-path";
const noImportNodeModulesByPath = createEslintRule({
  name: RULE_NAME$3,
  meta: {
    type: "problem",
    docs: {
      description: "Prevent importing modules in `node_modules` folder by relative or absolute path"
    },
    schema: [],
    messages: {
      noImportNodeModulesByPath: "Do not import modules in `node_modules` folder by path"
    }
  },
  defaultOptions: [],
  create: (context) => {
    return {
      "ImportDeclaration": (node) => {
        if (node.source.value.includes("/node_modules/")) {
          context.report({
            node,
            messageId: "noImportNodeModulesByPath"
          });
        }
      },
      'CallExpression[callee.name="require"]': (node) => {
        const value = node.arguments[0]?.value;
        if (typeof value === "string" && value.includes("/node_modules/")) {
          context.report({
            node,
            messageId: "noImportNodeModulesByPath"
          });
        }
      }
    };
  }
});

const RULE_NAME$2 = "no-top-level-await";
const noTopLevelAwait = createEslintRule({
  name: RULE_NAME$2,
  meta: {
    type: "problem",
    docs: {
      description: "Prevent using top-level await"
    },
    schema: [],
    messages: {
      NoTopLevelAwait: "Do not use top-level await"
    }
  },
  defaultOptions: [],
  create: (context) => {
    return {
      AwaitExpression: (node) => {
        let parent = node.parent;
        while (parent) {
          if (parent.type === "FunctionDeclaration" || parent.type === "FunctionExpression" || parent.type === "ArrowFunctionExpression") {
            return;
          }
          parent = parent.parent;
        }
        context.report({
          node,
          messageId: "NoTopLevelAwait"
        });
      }
    };
  }
});

const RULE_NAME$1 = "no-ts-export-equal";
const noTsExportEqual = createEslintRule({
  name: RULE_NAME$1,
  meta: {
    type: "problem",
    docs: {
      description: "Do not use `exports =`"
    },
    schema: [],
    messages: {
      noTsExportEqual: "Use ESM `export default` instead"
    }
  },
  defaultOptions: [],
  create: (context) => {
    const extension = context.getFilename().split(".").pop();
    if (!extension)
      return {};
    if (!["ts", "tsx", "mts", "cts"].includes(extension))
      return {};
    return {
      TSExportAssignment(node) {
        context.report({
          node,
          messageId: "noTsExportEqual"
        });
      }
    };
  }
});

const RULE_NAME = "top-level-function";
const topLevelFunction = createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "problem",
    docs: {
      description: "Enforce top-level functions to be declared with function keyword"
    },
    fixable: "code",
    schema: [],
    messages: {
      topLevelFunctionDeclaration: "Top-level functions should be declared with function keyword"
    }
  },
  defaultOptions: [],
  create: (context) => {
    return {
      VariableDeclaration(node) {
        if (node.parent.type !== "Program" && node.parent.type !== "ExportNamedDeclaration")
          return;
        if (node.declarations.length !== 1)
          return;
        if (node.kind !== "const")
          return;
        if (node.declare)
          return;
        const declaration = node.declarations[0];
        if (declaration.init?.type !== "ArrowFunctionExpression" && declaration.init?.type !== "FunctionExpression") {
          return;
        }
        if (declaration.id?.type !== "Identifier")
          return;
        if (declaration.id.typeAnnotation)
          return;
        if (declaration.init.body.type !== "BlockStatement" && declaration.id?.loc.start.line === declaration.init?.body.loc.end.line) {
          return;
        }
        const fnExpression = declaration.init;
        const body = declaration.init.body;
        const id = declaration.id;
        context.report({
          node,
          loc: {
            start: id.loc.start,
            end: body.loc.start
          },
          messageId: "topLevelFunctionDeclaration",
          fix(fixer) {
            const code = context.getSourceCode().text;
            const textName = code.slice(id.range[0], id.range[1]);
            const textArgs = fnExpression.params.length ? code.slice(fnExpression.params[0].range[0], fnExpression.params[fnExpression.params.length - 1].range[1]) : "";
            const textBody = body.type === "BlockStatement" ? code.slice(body.range[0], body.range[1]) : `{
  return ${code.slice(body.range[0], body.range[1])}
}`;
            const textGeneric = fnExpression.typeParameters ? code.slice(fnExpression.typeParameters.range[0], fnExpression.typeParameters.range[1]) : "";
            const textTypeReturn = fnExpression.returnType ? code.slice(fnExpression.returnType.range[0], fnExpression.returnType.range[1]) : "";
            const textAsync = fnExpression.async ? "async " : "";
            const final = `${textAsync}function ${textName} ${textGeneric}(${textArgs})${textTypeReturn} ${textBody}`;
            return fixer.replaceTextRange([node.range[0], node.range[1]], final);
          }
        });
      }
    };
  }
});

const plugin = {
  meta: {
    name: "antfu",
    version
  },
  // @keep-sorted
  rules: {
    "consistent-chaining": consistentChaining,
    "consistent-list-newline": consistentListNewline,
    "curly": curly,
    "if-newline": ifNewline,
    "import-dedupe": importDedupe,
    "indent-unindent": indentUnindent,
    "no-import-dist": noImportDist,
    "no-import-node-modules-by-path": noImportNodeModulesByPath,
    "no-top-level-await": noTopLevelAwait,
    "no-ts-export-equal": noTsExportEqual,
    "top-level-function": topLevelFunction
  }
};

export { plugin as default };

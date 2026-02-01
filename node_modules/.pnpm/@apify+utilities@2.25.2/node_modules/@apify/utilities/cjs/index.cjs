"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CHECK_TYPES: () => CHECK_TYPES,
  CodeHashManager: () => CodeHashManager,
  CodeHashMetaKey: () => CodeHashMetaKey,
  HealthChecker: () => HealthChecker,
  InvalidJsonError: () => InvalidJsonError,
  InvalidVariableError: () => InvalidVariableError,
  JsonVariable: () => JsonVariable,
  ParseJsonlStream: () => ParseJsonlStream,
  RetryableError: () => RetryableError,
  WebhookPayloadTemplate: () => WebhookPayloadTemplate,
  betterClearInterval: () => betterClearInterval,
  betterSetInterval: () => betterSetInterval,
  buildOrVersionNumberIntToStr: () => buildOrVersionNumberIntToStr,
  checkParamPrototypeOrThrow: () => checkParamPrototypeOrThrow,
  concatStreamToBuffer: () => concatStreamToBuffer,
  configureLogger: () => configureLogger,
  createHmacSignature: () => createHmacSignature,
  createHmacSignatureAsync: () => createHmacSignatureAsync,
  createInjectableRegExp: () => createInjectableRegExp,
  createStorageContentSignature: () => createStorageContentSignature,
  createStorageContentSignatureAsync: () => createStorageContentSignatureAsync,
  cryptoRandomObjectId: () => cryptoRandomObjectId,
  dateToString: () => dateToString,
  delayPromise: () => delayPromise,
  deterministicUniqueId: () => deterministicUniqueId,
  escapeForBson: () => escapeForBson,
  escapePropertyName: () => escapePropertyName,
  escapeRegExp: () => escapeRegExp,
  expressErrorHandler: () => expressErrorHandler,
  getOrdinalSuffix: () => getOrdinalSuffix,
  getRandomInt: () => getRandomInt,
  http404Route: () => http404Route,
  isBadForMongo: () => isBadForMongo,
  isBuffer: () => isBuffer,
  isForbiddenUsername: () => isForbiddenUsername,
  isNullOrUndefined: () => isNullOrUndefined,
  isUrlRelative: () => isUrlRelative,
  jsonStringifyExtended: () => jsonStringifyExtended,
  leftpad: () => leftpad,
  markedDecreaseHeadsLevel: () => markedDecreaseHeadsLevel,
  markedSetNofollowLinks: () => markedSetNofollowLinks,
  normalizeUrl: () => normalizeUrl,
  parseBooleanOrNull: () => parseBooleanOrNull,
  parseDateFromJson: () => parseDateFromJson,
  parseUrl: () => parseUrl,
  privateDecrypt: () => privateDecrypt,
  promisifyServerListen: () => promisifyServerListen,
  publicEncrypt: () => publicEncrypt,
  readStreamToString: () => readStreamToString,
  removeFromArray: () => removeFromArray,
  retryWithExpBackoff: () => retryWithExpBackoff,
  separateImports: () => separateImports,
  sequentializePromises: () => sequentializePromises,
  splitFullName: () => splitFullName,
  timeoutPromise: () => timeoutPromise,
  traverseObject: () => traverseObject,
  truncate: () => truncate,
  unescapeFromBson: () => unescapeFromBson,
  unescapePropertyName: () => unescapePropertyName,
  weightedAverage: () => weightedAverage
});
module.exports = __toCommonJS(index_exports);

// src/utilities.ts
var import_node_crypto = __toESM(require("crypto"));
var import_consts = require("@apify/consts");
var import_log = __toESM(require("@apify/log"));
function cryptoRandomObjectId(length = 17) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCEDFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = import_node_crypto.default.randomBytes(length);
  let str = "";
  for (let i = bytes.length - 1; i >= 0; i--) {
    str += chars[(bytes[i] | 0) % chars.length];
  }
  return str;
}
__name(cryptoRandomObjectId, "cryptoRandomObjectId");
function deterministicUniqueId(key, length = 17) {
  return import_node_crypto.default.createHash("sha256").update(key).digest("base64").replace(/(\+|\/|=)/g, "x").substr(0, length);
}
__name(deterministicUniqueId, "deterministicUniqueId");
function getRandomInt(maxExcluded) {
  maxExcluded = Math.floor(maxExcluded);
  return Math.floor(Math.random() * maxExcluded);
}
__name(getRandomInt, "getRandomInt");
function parseDateFromJson(date) {
  if (typeof date === "string") {
    return new Date(Date.parse(date));
  }
  return date;
}
__name(parseDateFromJson, "parseDateFromJson");
async function delayPromise(millis) {
  return new Promise(((resolve) => {
    if (millis > 0) {
      setTimeout(() => resolve(), millis);
    } else {
      resolve();
    }
  }));
}
__name(delayPromise, "delayPromise");
function removeFromArray(array, element) {
  const index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }
  return false;
}
__name(removeFromArray, "removeFromArray");
function http404Route(req, res) {
  res.status(404);
  res.send("Page not found");
}
__name(http404Route, "http404Route");
function expressErrorHandler(err, req, res, next) {
  import_log.default.warning("Client HTTP request failed", { url: req.url, errMsg: err.message });
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(505);
  res.send("Internal server error");
}
__name(expressErrorHandler, "expressErrorHandler");
function betterSetInterval(func, delay) {
  let scheduleNextRun;
  let timeoutId;
  let isRunning = true;
  const funcWrapper = /* @__PURE__ */ __name(function() {
    void new Promise((resolve) => {
      resolve(func(() => void 0));
    }).finally(scheduleNextRun);
  }, "funcWrapper");
  scheduleNextRun = /* @__PURE__ */ __name(function() {
    if (isRunning) timeoutId = setTimeout(funcWrapper, delay);
  }, "scheduleNextRun");
  funcWrapper();
  return {
    _betterClearInterval() {
      isRunning = false;
      clearTimeout(timeoutId);
    }
  };
}
__name(betterSetInterval, "betterSetInterval");
function betterClearInterval(intervalID) {
  if (intervalID && intervalID._betterClearInterval) {
    try {
      intervalID._betterClearInterval();
    } catch (e) {
      import_log.default.exception(e, "_betterClearInterval() threw an exception!?");
    }
  }
}
__name(betterClearInterval, "betterClearInterval");
function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
__name(escapeRegExp, "escapeRegExp");
function leftpad(str, len, ch = " ") {
  str = String(str);
  let i = -1;
  if (!ch && ch !== 0) ch = " ";
  len -= str.length;
  while (++i < len) {
    str = ch + str;
  }
  return str;
}
__name(leftpad, "leftpad");
function weightedAverage(val1, weight1, val2, weight2) {
  return (val1 * weight1 + val2 * weight2) / (weight1 + weight2);
}
__name(weightedAverage, "weightedAverage");
var FORBIDDEN_USERNAMES_REGEXPS = [
  // App routes
  "page-not-found",
  "docs",
  "terms-of-use",
  "about",
  "pricing",
  "privacy-policy",
  "customers",
  "request-form",
  "request-solution",
  "release-notes",
  "jobs",
  "api-reference",
  "video-tutorials",
  "acts",
  "key-value-stores",
  "schedules",
  "account",
  "sign-up",
  "sign-in-discourse",
  "admin",
  "documentation",
  "change-password",
  "enroll-account",
  "forgot-password",
  "reset-password",
  "sign-in",
  "verify-email",
  "live-status",
  "browser-info",
  "webhooks",
  "health-check",
  "api",
  "change-log",
  "dashboard",
  "community",
  "crawlers",
  "ext",
  "schemas",
  // Various strings
  "admin",
  "administration",
  "crawler",
  "act",
  "library",
  "lib",
  "apifier",
  "team",
  "contact",
  "doc",
  "documentation",
  "for-business",
  "for-developers",
  "developers",
  "business",
  "integrations",
  "job",
  "setting",
  "settings",
  "privacy",
  "policy",
  "assets",
  "help",
  "config",
  "configuration",
  "terms",
  "hiring",
  "hire",
  "status",
  "status-page",
  "solutions",
  "support",
  "market",
  "marketplace",
  "download",
  "downloads",
  "username",
  "users",
  "user",
  "login",
  "logout",
  "signin",
  "sign",
  "signup",
  "sign-out",
  "signout",
  "plugins",
  "plug-ins",
  "reset",
  "password",
  "passwords",
  "square",
  "profile-photos",
  "profiles",
  "true",
  "false",
  "js",
  "css",
  "img",
  "images",
  "image",
  "partials",
  "fonts",
  "font",
  "dynamic_templates",
  "app",
  "schedules",
  "community",
  "storage",
  "storages",
  "account",
  "node_modules",
  "bower_components",
  "video",
  "knowledgebase",
  "forum",
  "customers",
  "blog",
  "health-check",
  "health",
  "anim",
  "forum_topics.json",
  "forum_categories.json",
  "me",
  "you",
  "him",
  "she",
  "it",
  "external",
  "actor",
  "crawler",
  "scheduler",
  "api",
  "sdk",
  "puppeteer",
  "webdriver",
  "selenium",
  "(selenium.*webdriver)",
  "undefined",
  "page-analyzer",
  "wp-login.php",
  "welcome.action",
  "echo",
  "proxy",
  "super-proxy",
  "gdpr",
  "case-studies",
  "use-cases",
  "how-to",
  "kb",
  "cookies",
  "cookie-policy",
  "cookies-policy",
  "powered-by",
  "run",
  "runs",
  "actor",
  "actors",
  "act",
  "acts",
  "success-stories",
  "roadmap",
  "join-marketplace",
  "presskit",
  "press-kit",
  "covid-19",
  "covid",
  "covid19",
  "matfyz",
  "ideas",
  "public-actors",
  "resources",
  "partners",
  "affiliate",
  "industries",
  "web-scraping",
  "custom-solutions",
  "solution-provider",
  "alternatives",
  "platform",
  "freelancers",
  "freelancer",
  "partner",
  "preview",
  "templates",
  "data-for-generative-ai",
  "discord",
  "praguecrawl",
  "prague-crawl",
  "bob",
  "ai-agents",
  "reel",
  "video-reel",
  "mcp",
  "model-context-protocol",
  "modelcontextprotocol",
  "apify.com",
  "design-kit",
  "press-kit",
  "scrapers",
  "professional-services",
  "challenge",
  "challange",
  "1m-challenge",
  "1m-usd-challenge",
  // Special files
  "index",
  "index\\.html",
  "(favicon\\.[a-z]+)",
  "BingSiteAuth.xml",
  "(google.+\\.html)",
  "robots\\.txt",
  "(sitemap\\.[a-z]+)",
  "(apple-touch-icon.*)",
  "security-whitepaper\\.pdf",
  "security\\.txt",
  // All hidden files
  "(\\..*)",
  // Username starting with xxx-
  "(xxx-.*)",
  // Username starting with install-cli. (see https://docs.apify.com/cli/docs/installation)
  "(install-cli\\..*)",
  // Strings not starting with letter or number
  "([^0-9a-z].*)",
  // Strings not ending with letter or number
  "(.*[^0-9a-z])",
  // Strings where there's more than one underscore, comma or dash in row
  "(.*[_.\\-]{2}.*)",
  // Reserved usernames from https://github.com/shouldbee/reserved-usernames/blob/master/reserved-usernames.json
  "0",
  "about",
  "access",
  "account",
  "accounts",
  "activate",
  "activities",
  "activity",
  "ad",
  "add",
  "address",
  "adm",
  "admin",
  "administration",
  "administrator",
  "ads",
  "adult",
  "advertising",
  "affiliate",
  "affiliates",
  "ajax",
  "all",
  "alpha",
  "analysis",
  "analytics",
  "android",
  "anon",
  "anonymous",
  "api",
  "app",
  "apps",
  "archive",
  "archives",
  "article",
  "asct",
  "asset",
  "atom",
  "auth",
  "authentication",
  "avatar",
  "backup",
  "balancer-manager",
  "banner",
  "banners",
  "beta",
  "billing",
  "bin",
  "blog",
  "blogs",
  "board",
  "book",
  "bookmark",
  "bot",
  "bots",
  "bug",
  "business",
  "cache",
  "cadastro",
  "calendar",
  "call",
  "campaign",
  "cancel",
  "captcha",
  "career",
  "careers",
  "cart",
  "categories",
  "category",
  "cgi",
  "cgi-bin",
  "changelog",
  "chat",
  "check",
  "checking",
  "checkout",
  "client",
  "cliente",
  "clients",
  "code",
  "codereview",
  "comercial",
  "comment",
  "comments",
  "communities",
  "community",
  "company",
  "compare",
  "compras",
  "config",
  "configuration",
  "connect",
  "contact",
  "contact-us",
  "contact_us",
  "contactus",
  "contest",
  "contribute",
  "corp",
  "create",
  "css",
  "dashboard",
  "data",
  "db",
  "default",
  "delete",
  "demo",
  "design",
  "designer",
  "destroy",
  "dev",
  "devel",
  "developer",
  "developers",
  "diagram",
  "diary",
  "dict",
  "dictionary",
  "die",
  "dir",
  "direct_messages",
  "directory",
  "dist",
  "doc",
  "docs",
  "documentation",
  "domain",
  "download",
  "downloads",
  "ecommerce",
  "edit",
  "editor",
  "edu",
  "education",
  "email",
  "employment",
  "empty",
  "end",
  "enterprise",
  "entries",
  "entry",
  "error",
  "errors",
  "eval",
  "event",
  "exit",
  "explore",
  "facebook",
  "faq",
  "favorite",
  "favorites",
  "feature",
  "features",
  "feed",
  "feedback",
  "feeds",
  "file",
  "files",
  "first",
  "flash",
  "fleet",
  "fleets",
  "flog",
  "follow",
  "followers",
  "following",
  "forgot",
  "form",
  "forum",
  "forums",
  "founder",
  "free",
  "friend",
  "friends",
  "ftp",
  "gadget",
  "gadgets",
  "game",
  "games",
  "get",
  "gift",
  "gifts",
  "gist",
  "github",
  "graph",
  "group",
  "groups",
  "guest",
  "guests",
  "help",
  "home",
  "homepage",
  "host",
  "hosting",
  "hostmaster",
  "hostname",
  "howto",
  "hpg",
  "html",
  "http",
  "httpd",
  "https",
  "i",
  "iamges",
  "icon",
  "icons",
  "id",
  "idea",
  "ideas",
  "image",
  "images",
  "imap",
  "img",
  "index",
  "indice",
  "info",
  "information",
  "inquiry",
  "instagram",
  "intranet",
  "invitations",
  "invite",
  "ipad",
  "iphone",
  "irc",
  "is",
  "issue",
  "issues",
  "it",
  "item",
  "items",
  "java",
  "javascript",
  "job",
  "jobs",
  "join",
  "js",
  "json",
  "jump",
  "knowledgebase",
  "language",
  "languages",
  "last",
  "ldap-status",
  "legal",
  "license",
  "link",
  "links",
  "linux",
  "list",
  "lists",
  "log",
  "log-in",
  "log-out",
  "log_in",
  "log_out",
  "login",
  "logout",
  "logs",
  "m",
  "mac",
  "mail",
  "mail1",
  "mail2",
  "mail3",
  "mail4",
  "mail5",
  "mailer",
  "mailing",
  "maintenance",
  "manager",
  "manual",
  "map",
  "maps",
  "marketing",
  "master",
  "me",
  "media",
  "member",
  "members",
  "message",
  "messages",
  "messenger",
  "microblog",
  "microblogs",
  "mine",
  "mis",
  "mob",
  "mobile",
  "movie",
  "movies",
  "mp3",
  "msg",
  "msn",
  "music",
  "musicas",
  "mx",
  "my",
  "mysql",
  "name",
  "named",
  "nan",
  "navi",
  "navigation",
  "net",
  "network",
  "new",
  "news",
  "newsletter",
  "nick",
  "nickname",
  "notes",
  "noticias",
  "notification",
  "notifications",
  "notify",
  "ns",
  "ns1",
  "ns10",
  "ns2",
  "ns3",
  "ns4",
  "ns5",
  "ns6",
  "ns7",
  "ns8",
  "ns9",
  "null",
  "oauth",
  "oauth_clients",
  "offer",
  "offers",
  "official",
  "old",
  "online",
  "openid",
  "operator",
  "order",
  "orders",
  "organization",
  "organizations",
  "overview",
  "owner",
  "owners",
  "page",
  "pager",
  "pages",
  "panel",
  "password",
  "payment",
  "perl",
  "phone",
  "photo",
  "photoalbum",
  "photos",
  "php",
  "phpmyadmin",
  "phppgadmin",
  "phpredisadmin",
  "pic",
  "pics",
  "ping",
  "plan",
  "plans",
  "plugin",
  "plugins",
  "policy",
  "pop",
  "pop3",
  "popular",
  "portal",
  "post",
  "postfix",
  "postmaster",
  "posts",
  "pr",
  "premium",
  "press",
  "price",
  "pricing",
  "privacy",
  "privacy-policy",
  "privacy_policy",
  "privacypolicy",
  "private",
  "product",
  "products",
  "profile",
  "project",
  "projects",
  "promo",
  "pub",
  "public",
  "purpose",
  "put",
  "python",
  "query",
  "random",
  "ranking",
  "read",
  "readme",
  "recent",
  "recruit",
  "recruitment",
  "register",
  "registration",
  "release",
  "remove",
  "replies",
  "report",
  "reports",
  "repositories",
  "repository",
  "req",
  "request",
  "requests",
  "reset",
  "roc",
  "root",
  "rss",
  "ruby",
  "rule",
  "sag",
  "sale",
  "sales",
  "sample",
  "samples",
  "save",
  "school",
  "script",
  "scripts",
  "search",
  "secure",
  "security",
  "self",
  "send",
  "server",
  "server-info",
  "server-status",
  "service",
  "services",
  "session",
  "sessions",
  "setting",
  "settings",
  "setup",
  "share",
  "shop",
  "show",
  "sign-in",
  "sign-up",
  "sign_in",
  "sign_up",
  "signin",
  "signout",
  "signup",
  "site",
  "sitemap",
  "sites",
  "smartphone",
  "smtp",
  "soporte",
  "source",
  "spec",
  "special",
  "sql",
  "src",
  "ssh",
  "ssl",
  "ssladmin",
  "ssladministrator",
  "sslwebmaster",
  "staff",
  "stage",
  "staging",
  "start",
  "stat",
  "state",
  "static",
  "stats",
  "status",
  "store",
  "stores",
  "stories",
  "style",
  "styleguide",
  "stylesheet",
  "stylesheets",
  "subdomain",
  "subscribe",
  "subscription",
  "subscriptions",
  "suporte",
  "support",
  "svn",
  "swf",
  "sys",
  "sysadmin",
  "sysadministrator",
  "system",
  "tablet",
  "tablets",
  "tag",
  "talk",
  "task",
  "tasks",
  "team",
  "teams",
  "tech",
  "telnet",
  "term",
  "terms",
  "terms-of-service",
  "terms_of_service",
  "termsofservice",
  "test",
  "test1",
  "test2",
  "test3",
  "teste",
  "testing",
  "tests",
  "theme",
  "themes",
  "thread",
  "threads",
  "tmp",
  "todo",
  "tool",
  "tools",
  "top",
  "topic",
  "topics",
  "tos",
  "tour",
  "translations",
  "trends",
  "tutorial",
  "tux",
  "tv",
  "twitter",
  "undef",
  "unfollow",
  "unsubscribe",
  "update",
  "upload",
  "uploads",
  "url",
  "usage",
  "user",
  "username",
  "users",
  "usuario",
  "vendas",
  "ver",
  "version",
  "video",
  "videos",
  "visitor",
  "watch",
  "weather",
  "web",
  "webhook",
  "webhooks",
  "webmail",
  "webmaster",
  "website",
  "websites",
  "welcome",
  "widget",
  "widgets",
  "wiki",
  "win",
  "windows",
  "word",
  "work",
  "works",
  "workshop",
  "ww",
  "wws",
  "www",
  "www1",
  "www2",
  "www3",
  "www4",
  "www5",
  "www6",
  "www7",
  "wwws",
  "wwww",
  "xfn",
  "xml",
  "xmpp",
  "xpg",
  "xxx",
  "yaml",
  "year",
  "yml",
  "you",
  "yourdomain",
  "yourname",
  "yoursite",
  "yourusername"
];
var FORBIDDEN_REGEXP = new RegExp(`^(${import_consts.ANONYMOUS_USERNAME}|${FORBIDDEN_USERNAMES_REGEXPS.join("|")})$`, "i");
function isForbiddenUsername(username) {
  return !!username.match(import_consts.APIFY_ID_REGEX) || !!username.match(FORBIDDEN_REGEXP);
}
__name(isForbiddenUsername, "isForbiddenUsername");
async function sequentializePromises(promises) {
  if (!promises.length) return [];
  const results = [];
  for (const promiseOrFunc of promises) {
    const promise = promiseOrFunc instanceof Function ? promiseOrFunc() : promiseOrFunc;
    results.push(await promise);
  }
  return results;
}
__name(sequentializePromises, "sequentializePromises");
function checkParamPrototypeOrThrow(paramVal, paramName, prototypes, prototypeName, isOptional = false) {
  if (isOptional && (paramVal === void 0 || paramVal === null)) return;
  const hasCorrectPrototype = prototypes instanceof Array ? prototypes.some((prototype) => paramVal instanceof prototype) : paramVal instanceof prototypes;
  if (!hasCorrectPrototype) throw new Error(`Parameter "${paramName}" must be an instance of ${prototypeName}`);
}
__name(checkParamPrototypeOrThrow, "checkParamPrototypeOrThrow");
function promisifyServerListen(server) {
  return async (port) => {
    return new Promise((resolve, reject) => {
      const onError = /* @__PURE__ */ __name((err) => {
        removeListeners();
        reject(err);
      }, "onError");
      const onListening = /* @__PURE__ */ __name(() => {
        removeListeners();
        resolve();
      }, "onListening");
      const removeListeners = /* @__PURE__ */ __name(() => {
        server.removeListener("error", onError);
        server.removeListener("listening", onListening);
      }, "removeListeners");
      server.on("error", onError);
      server.on("listening", onListening);
      server.listen(port);
    });
  };
}
__name(promisifyServerListen, "promisifyServerListen");
function configureLogger(givenLog, isProduction) {
  if (isProduction) {
    givenLog.setOptions({
      level: import_log.LogLevel.INFO,
      logger: new import_log.LoggerJson()
    });
  } else {
    givenLog.setOptions({ level: import_log.LogLevel.DEBUG });
  }
}
__name(configureLogger, "configureLogger");
async function timeoutPromise(promise, timeoutMillis, errorMessage = "Promise has timed-out") {
  return new Promise((resolve, reject) => {
    let timeout;
    let hasFulfilled = false;
    const callback = /* @__PURE__ */ __name((err, result) => {
      if (hasFulfilled) return;
      clearTimeout(timeout);
      hasFulfilled = true;
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    }, "callback");
    promise.then((result) => callback(null, result), callback);
    timeout = setTimeout(() => callback(new Error(errorMessage)), timeoutMillis);
  });
}
__name(timeoutPromise, "timeoutPromise");
function createInjectableRegExp(regex) {
  return new RegExp(regex.source.replace(/^\^|\$$/g, ""));
}
__name(createInjectableRegExp, "createInjectableRegExp");

// src/utilities.client.ts
var import_consts2 = require("@apify/consts");
function isNullOrUndefined(obj) {
  return obj == null;
}
__name(isNullOrUndefined, "isNullOrUndefined");
function isBuffer(obj) {
  return obj != null && obj.constructor != null && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
__name(isBuffer, "isBuffer");
function dateToString(date, middleT) {
  if (!(date instanceof Date)) {
    return "";
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const millis = date.getMilliseconds();
  const pad = /* @__PURE__ */ __name((num) => num < 10 ? `0${num}` : num, "pad");
  const datePart = `${year}-${pad(month)}-${pad(day)}`;
  const millisPart = millis < 10 ? `00${millis}` : millis < 100 ? `0${millis}` : millis;
  const timePart = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${millisPart}`;
  return `${datePart}${middleT ? "T" : " "}${timePart}`;
}
__name(dateToString, "dateToString");
function truncate(str, maxLength, suffix = "...[truncated]") {
  maxLength = Math.floor(maxLength);
  if (suffix.length > maxLength) {
    throw new Error("suffix string cannot be longer than maxLength");
  }
  if (typeof str === "string" && str.length > maxLength) {
    str = str.substr(0, maxLength - suffix.length) + suffix;
  }
  return str;
}
__name(truncate, "truncate");
function getOrdinalSuffix(num) {
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
__name(getOrdinalSuffix, "getOrdinalSuffix");
function parseUrl(str) {
  if (typeof str !== "string") return {};
  const o = {
    strictMode: false,
    key: [
      "source",
      "protocol",
      "authority",
      "userInfo",
      "user",
      "password",
      "host",
      "port",
      "relative",
      "path",
      "directory",
      "file",
      "query",
      "fragment"
    ],
    q: {
      name: "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      // eslint-disable-line max-len,no-useless-escape
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
      // eslint-disable-line max-len,no-useless-escape
    }
  };
  const m = o.parser[o.strictMode ? "strict" : "loose"].exec(str);
  const uri = {};
  let i = o.key.length;
  while (i--) uri[o.key[i]] = m[i] || "";
  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, ($0, $1, $2) => {
    if ($1) uri[o.q.name][$1] = $2;
  });
  uri.fragmentKey = {};
  if (uri.fragment) {
    uri.fragment.replace(o.q.parser, (($0, $1, $2) => {
      if ($1) uri.fragmentKey[$1] = $2;
    }));
  }
  return uri;
}
__name(parseUrl, "parseUrl");
function normalizeUrl(url, keepFragment) {
  if (typeof url !== "string" || !url.length) {
    return null;
  }
  let urlObj;
  try {
    urlObj = new URL(url.trim());
  } catch {
    return null;
  }
  const { searchParams } = urlObj;
  for (const key of [...searchParams.keys()]) {
    if (key.startsWith("utm_")) {
      searchParams.delete(key);
    }
  }
  searchParams.sort();
  const protocol = urlObj.protocol.toLowerCase();
  const host = urlObj.host.toLowerCase();
  const path = urlObj.pathname.replace(/\/$/, "");
  const search = searchParams.toString() ? `?${searchParams}` : "";
  const hash = keepFragment ? urlObj.hash : "";
  return `${protocol}//${host}${path}${search}${hash}`;
}
__name(normalizeUrl, "normalizeUrl");
function markedSetNofollowLinks(href, title, text, referrerHostname) {
  let urlParsed;
  try {
    urlParsed = new URL(href);
  } catch {
  }
  const isApifyLink = urlParsed && /(\.|^)apify\.com$/i.test(urlParsed.hostname);
  const isSameHostname = !referrerHostname || urlParsed && urlParsed.hostname === referrerHostname;
  if (isApifyLink && isSameHostname) {
    return `<a href="${href}">${title || text}</a>`;
  }
  if (isApifyLink) {
    return `<a rel="noopener noreferrer" target="_blank" href="${href}">${title || text}</a>`;
  }
  return `<a rel="noopener noreferrer nofollow" target="_blank" href="${href}">${title || text}</a>`;
}
__name(markedSetNofollowLinks, "markedSetNofollowLinks");
function markedDecreaseHeadsLevel(text, level) {
  level += 1;
  return `<h${level}>${text}</h${level}>`;
}
__name(markedDecreaseHeadsLevel, "markedDecreaseHeadsLevel");
function buildOrVersionNumberIntToStr(int) {
  if (typeof int !== "number" || !(int >= 0)) return null;
  const major = Math.floor(int / import_consts2.VERSION_INT_MAJOR_BASE);
  const remainder = int % import_consts2.VERSION_INT_MAJOR_BASE;
  const minor = Math.floor(remainder / import_consts2.VERSION_INT_MINOR_BASE);
  const build = remainder % import_consts2.VERSION_INT_MINOR_BASE;
  let str = `${major}.${minor}`;
  if (build > 0) str += `.${build}`;
  return str;
}
__name(buildOrVersionNumberIntToStr, "buildOrVersionNumberIntToStr");
var ESCAPE_DOT = "\uFF0E";
var ESCAPE_DOLLAR = "\uFF04";
var ESCAPE_TO_BSON = "\uFF54\uFF4F\uFF22\uFF33\uFF2F\uFF2E";
var ESCAPE_TO_STRING = "\uFF54\uFF4F\uFF33\uFF54\uFF52\uFF49\uFF4E\uFF47";
var ESCAPE_BSON_TYPE = "\uFF3F\uFF42\uFF53\uFF4F\uFF4E\uFF54\uFF59\uFF50\uFF45";
var ESCAPE_NULL = "";
var REGEXP_IS_ESCAPED = new RegExp(`(${ESCAPE_DOT}|^${ESCAPE_DOLLAR}|^${ESCAPE_TO_BSON}$|^${ESCAPE_BSON_TYPE}|^${ESCAPE_TO_STRING}$)`);
var REGEXP_DOT = new RegExp(ESCAPE_DOT, "g");
var REGEXP_DOLLAR = new RegExp(`^${ESCAPE_DOLLAR}`);
var REGEXP_TO_BSON = new RegExp(`^${ESCAPE_TO_BSON}$`);
var REGEXP_TO_STRING = new RegExp(`^${ESCAPE_TO_STRING}$`);
var REGEXP_BSON_TYPE = new RegExp(`^${ESCAPE_BSON_TYPE}$`);
function escapePropertyName(name) {
  if (/(\.|^\$|^toBSON$|^_bsontype$|^toString$|\0)/.test(name)) {
    name = name.replace(/\./g, ESCAPE_DOT);
    name = name.replace(/^\$/, ESCAPE_DOLLAR);
    name = name.replace(/^toBSON$/, ESCAPE_TO_BSON);
    name = name.replace(/^toString$/, ESCAPE_TO_STRING);
    name = name.replace(/^_bsontype$/, ESCAPE_BSON_TYPE);
    name = name.replace(/\0/g, ESCAPE_NULL);
  }
  return name;
}
__name(escapePropertyName, "escapePropertyName");
function unescapePropertyName(name) {
  if (REGEXP_IS_ESCAPED.test(name)) {
    name = name.replace(REGEXP_DOT, ".");
    name = name.replace(REGEXP_DOLLAR, "$");
    name = name.replace(REGEXP_TO_BSON, "toBSON");
    name = name.replace(REGEXP_TO_STRING, "toString");
    name = name.replace(REGEXP_BSON_TYPE, "_bsontype");
  }
  return name;
}
__name(unescapePropertyName, "unescapePropertyName");
function traverseObject(obj, clone, transformFunc) {
  if (obj === null || typeof obj !== "object" || Object.prototype.toString.call(obj) === "[object Date]" || isBuffer(obj)) return obj;
  let result;
  if (Array.isArray(obj)) {
    result = clone ? new Array(obj.length) : obj;
    for (let i = 0; i < obj.length; i++) {
      const val = traverseObject(obj[i], clone, transformFunc);
      if (clone) result[i] = val;
    }
    return result;
  }
  result = clone ? {} : obj;
  for (const key in obj) {
    const val = traverseObject(obj[key], clone, transformFunc);
    const [transformedKey, transformedVal] = transformFunc(key, val);
    if (key === transformedKey) {
      if (clone || val !== transformedVal) result[key] = transformedVal;
    } else {
      result[transformedKey] = transformedVal;
      if (!clone) delete obj[key];
    }
  }
  return result;
}
__name(traverseObject, "traverseObject");
function escapeForBson(obj, clone = false) {
  return traverseObject(obj, clone, (key, value) => [escapePropertyName(key), value]);
}
__name(escapeForBson, "escapeForBson");
function unescapeFromBson(obj, clone = false) {
  return traverseObject(obj, clone, (key, value) => [unescapePropertyName(key), value]);
}
__name(unescapeFromBson, "unescapeFromBson");
function isBadForMongo(obj) {
  let isBad = false;
  try {
    traverseObject(obj, false, (key, value) => {
      const escapedKey = escapePropertyName(key);
      if (key !== escapedKey) {
        isBad = true;
        throw new Error();
      }
      return [key, value];
    });
  } catch (e) {
    if (!isBad) throw e;
  }
  return isBad;
}
__name(isBadForMongo, "isBadForMongo");
var _JsonVariable = class _JsonVariable {
  constructor(name) {
    this.name = name;
  }
  getToken() {
    return `{{${this.name}}}`;
  }
};
__name(_JsonVariable, "JsonVariable");
var JsonVariable = _JsonVariable;
function jsonStringifyExtended(value, replacer, space = 0) {
  if (replacer && !(replacer instanceof Function)) throw new Error('Parameter "replacer" of jsonStringifyExtended() must be a function!');
  const replacements = {};
  const extendedReplacer = /* @__PURE__ */ __name((key, val) => {
    val = replacer ? replacer(key, val) : val;
    if (val instanceof Function) return val.toString();
    if (val instanceof JsonVariable) {
      const randomToken = `<<<REPLACEMENT_TOKEN::${Math.random()}>>>`;
      replacements[randomToken] = val.getToken();
      return randomToken;
    }
    return val;
  }, "extendedReplacer");
  let stringifiedValue = JSON.stringify(value, extendedReplacer, space);
  Object.entries(replacements).forEach(([replacementToken, replacementValue]) => {
    stringifiedValue = stringifiedValue.replace(`"${replacementToken}"`, replacementValue);
  });
  return stringifiedValue;
}
__name(jsonStringifyExtended, "jsonStringifyExtended");
function splitFullName(fullName) {
  if (typeof fullName !== "string") return [null, null];
  const names = (fullName || "").trim().split(" ");
  const nonEmptyNames = names.filter((val) => val);
  if (nonEmptyNames.length === 0) {
    return [null, null];
  }
  if (nonEmptyNames.length === 1) {
    return [null, nonEmptyNames[0]];
  }
  return [names[0], nonEmptyNames.slice(1).join(" ")];
}
__name(splitFullName, "splitFullName");
function isUrlRelative(url) {
  return import_consts2.RELATIVE_URL_REGEX.test(url);
}
__name(isUrlRelative, "isUrlRelative");

// src/exponential_backoff.ts
var import_log2 = __toESM(require("@apify/log"));
var _RetryableError = class _RetryableError extends Error {
  constructor(error, ...args) {
    super(...args);
    __publicField(this, "error");
    this.error = error;
  }
};
__name(_RetryableError, "RetryableError");
var RetryableError = _RetryableError;
async function retryWithExpBackoff(params = {}) {
  const { func, expBackoffMillis, expBackoffMaxRepeats } = params;
  if (typeof func !== "function") {
    throw new Error('Parameter "func" should be a function.');
  }
  if (typeof expBackoffMillis !== "number") {
    throw new Error('Parameter "expBackoffMillis" should be a number.');
  }
  if (typeof expBackoffMaxRepeats !== "number") {
    throw new Error('Parameter "expBackoffMaxRepeats" should be a number.');
  }
  for (let i = 0; ; i++) {
    let error;
    try {
      return await func();
    } catch (e) {
      error = e;
    }
    if (!(error instanceof RetryableError)) {
      throw error;
    }
    if (i >= expBackoffMaxRepeats - 1) {
      throw error.error;
    }
    const waitMillis = expBackoffMillis * 2 ** i;
    const rand = /* @__PURE__ */ __name((from, to) => from + Math.floor(Math.random() * (to - from + 1)), "rand");
    const randomizedWaitMillis = rand(waitMillis, waitMillis * 2);
    if (i === Math.round(expBackoffMaxRepeats / 2)) {
      import_log2.default.warning(`Retry failed ${i} times and will be repeated in ${randomizedWaitMillis}ms`, {
        originalError: error.error.message,
        errorDetails: Reflect.get(error.error, "details")
      });
    }
    await delayPromise(randomizedWaitMillis);
  }
}
__name(retryWithExpBackoff, "retryWithExpBackoff");

// src/health_checker.ts
var CHECK_TYPES = /* @__PURE__ */ ((CHECK_TYPES2) => {
  CHECK_TYPES2["MONGODB_PING"] = "MONGODB_PING";
  CHECK_TYPES2["MONGODB_READ"] = "MONGODB_READ";
  CHECK_TYPES2["MONGODB_WRITE"] = "MONGODB_WRITE";
  CHECK_TYPES2["REDIS"] = "REDIS";
  CHECK_TYPES2["REDIS_PING"] = "REDIS_PING";
  CHECK_TYPES2["REDIS_WRITE"] = "REDIS_WRITE";
  return CHECK_TYPES2;
})(CHECK_TYPES || {});
var _HealthChecker = class _HealthChecker {
  constructor(options) {
    this.options = options;
    __publicField(this, "checks");
    __publicField(this, "redisPrefix");
    __publicField(this, "redisTtlSecs");
    __publicField(this, "checkTimeoutMillis");
    __publicField(this, "mongoDbWriteTestCollection");
    __publicField(this, "mongoDbWriteTestRemoveOlderThanSecs");
    const {
      checks,
      redisPrefix = "health-check",
      redisTtlSecs = 15,
      checkTimeoutMillis = 15e3,
      mongoDbWriteTestCollection = "healthCheckPlayground",
      mongoDbWriteTestRemoveOlderThanSecs = 15
    } = options;
    if (!Array.isArray(checks)) throw new Error('Parameter "check" must be an array');
    checks.map((check) => this._validateCheck(check));
    this.checks = checks;
    this.redisPrefix = redisPrefix;
    this.redisTtlSecs = redisTtlSecs;
    this.checkTimeoutMillis = checkTimeoutMillis;
    this.mongoDbWriteTestCollection = mongoDbWriteTestCollection;
    this.mongoDbWriteTestRemoveOlderThanSecs = mongoDbWriteTestRemoveOlderThanSecs;
  }
  async ensureIsHealthy() {
    for (const check of this.checks) {
      try {
        const checkPromise = this._performCheck(check);
        await timeoutPromise(checkPromise, this.checkTimeoutMillis, "Check has timed-out");
      } catch (_err) {
        const err = _err;
        throw new Error(`Health check test "${check.type}" failed with an error: ${err.message}"`);
      }
    }
  }
  _validateCheck(check) {
    if (!(check.type in CHECK_TYPES)) throw new Error(`Check type "${check.type}" is invalid`);
    if (typeof check.client !== "object") throw new Error(`Check client must be an object got "${typeof check.client}" instead`);
  }
  async _performCheck(check) {
    switch (check.type) {
      case "MONGODB_PING" /* MONGODB_PING */:
        return this._testMongoDbPing(check);
      case "MONGODB_READ" /* MONGODB_READ */:
        return this._testMongoDbRead(check);
      case "MONGODB_WRITE" /* MONGODB_WRITE */:
        return this._testMongoDbWrite(check);
      case "REDIS_PING" /* REDIS_PING */:
        return this._testRedisPing(check);
      case "REDIS" /* REDIS */:
      case "REDIS_WRITE" /* REDIS_WRITE */:
        return this._testRedisWrite(check);
      default:
        throw new Error("Unknown check type");
    }
  }
  async _testMongoDbPing({ client }) {
    const response = await client.command({ ping: 1 });
    if (response.ok !== 1) throw new Error(`Got ${response.ok} instead of 1!`);
  }
  async _testMongoDbRead({ client }) {
    const response = await client.listCollections().toArray();
    if (!Array.isArray(response)) throw new Error(`Got ${typeof response} instead of an array!`);
  }
  async _testMongoDbWrite({ client }) {
    const id = cryptoRandomObjectId();
    const collection = client.collection(this.mongoDbWriteTestCollection);
    await collection.deleteMany({
      createdAt: {
        $lt: new Date(Date.now() - this.mongoDbWriteTestRemoveOlderThanSecs * 1e3)
      }
    });
    await collection.insertOne({
      _id: id,
      createdAt: /* @__PURE__ */ new Date()
    });
    const retrieved = await collection.findOne({ _id: id });
    if (!retrieved) throw new Error(`Item with ID "${id}" not found!`);
  }
  async _testRedisPing({ client }) {
    const response = await client.ping();
    if (response !== "PONG") throw new Error(`Got "${response}" instead of "PONG"!`);
  }
  async _testRedisWrite({ client }) {
    const key = `${this.redisPrefix}:${cryptoRandomObjectId()}`;
    const expected = "OK";
    await client.set(key, expected, "EX", this.redisTtlSecs);
    const given = await client.get(key);
    if (given !== expected) throw new Error(`Returned value "${given}" is not equal to "${expected}"!`);
  }
};
__name(_HealthChecker, "HealthChecker");
__publicField(_HealthChecker, "CHECK_TYPES", CHECK_TYPES);
var HealthChecker = _HealthChecker;

// src/parse_jsonl_stream.ts
var import_node_stream = require("stream");
var _ParseJsonlStream = class _ParseJsonlStream extends import_node_stream.Transform {
  constructor() {
    super(...arguments);
    __publicField(this, "pendingChunk", null);
  }
  parseLineAndEmitObject(line) {
    line = line.trim();
    if (!line) {
      return;
    }
    try {
      const obj = JSON.parse(line);
      this.emit("object", obj);
    } catch (e) {
      throw new Error(`Cannot parse JSON stream data ('${String(line)}'): ${String(e)}`);
    }
  }
  _transform(chunk, encoding, callback) {
    let allData;
    if (this.pendingChunk) {
      allData = this.pendingChunk + chunk;
      this.pendingChunk = null;
    } else {
      allData = chunk;
    }
    const lines = allData.toString().split("\n");
    if (lines[lines.length - 1] !== "") {
      this.pendingChunk = lines.pop();
    }
    try {
      for (let i = 0; i < lines.length; i++) {
        this.parseLineAndEmitObject(lines[i]);
      }
    } catch (err) {
      callback(err, null);
      return;
    }
    callback(null, chunk);
  }
  // This function is called right after stream.end() is called by the writer.
  // It just tries to process the pending chunk and returns an error if that fails.
  _flush(callback) {
    if (this.pendingChunk) {
      try {
        this.parseLineAndEmitObject(this.pendingChunk);
        this.pendingChunk = null;
      } catch (err) {
        callback(err, null);
        return;
      }
    }
    callback();
  }
};
__name(_ParseJsonlStream, "ParseJsonlStream");
var ParseJsonlStream = _ParseJsonlStream;

// src/streams_utilities.ts
async function concatStreamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => {
      chunks.push(chunk);
    }).on("error", (e) => reject(e)).on("end", () => {
      const buffer = Buffer.concat(chunks);
      return resolve(buffer);
    });
  });
}
__name(concatStreamToBuffer, "concatStreamToBuffer");
async function readStreamToString(stream, encoding) {
  const buffer = await concatStreamToBuffer(stream);
  return buffer.toString(encoding);
}
__name(readStreamToString, "readStreamToString");

// src/webhook_payload_template.ts
var _WebhookPayloadTemplateError = class _WebhookPayloadTemplateError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
__name(_WebhookPayloadTemplateError, "WebhookPayloadTemplateError");
var WebhookPayloadTemplateError = _WebhookPayloadTemplateError;
var _InvalidJsonError = class _InvalidJsonError extends WebhookPayloadTemplateError {
  constructor(originalError) {
    super(originalError.message);
  }
};
__name(_InvalidJsonError, "InvalidJsonError");
var InvalidJsonError = _InvalidJsonError;
var _InvalidVariableError = class _InvalidVariableError extends Error {
  constructor(variable) {
    super(`Invalid payload template variable: ${variable}`);
  }
};
__name(_InvalidVariableError, "InvalidVariableError");
var InvalidVariableError = _InvalidVariableError;
var _WebhookPayloadTemplate = class _WebhookPayloadTemplate {
  constructor(template, allowedVariables = null, context = {}) {
    this.template = template;
    this.allowedVariables = allowedVariables;
    this.context = context;
    __publicField(this, "payload");
    __publicField(this, "replacedVariables", []);
    this.payload = template;
  }
  /**
   * Parse existing webhook payload template string into an object, replacing
   * template variables using the provided context.
   *
   * Parse also validates the template structure, so it can be used
   * to check validity of the template JSON and usage of allowedVariables.
   */
  static parse(payloadTemplate, allowedVariables = null, context = {}, options = {}) {
    const type = typeof payloadTemplate;
    if (type !== "string") throw new Error(`Cannot parse a ${type} payload template.`);
    const template = new _WebhookPayloadTemplate(payloadTemplate, allowedVariables, context);
    const data = template._parse();
    if (options.interpolateStrings) {
      return template._interpolate(data);
    }
    return data;
  }
  /**
   * Stringify an object into a webhook payload template.
   * Values created using `getTemplateVariable('foo.bar')`
   * will be stringified to `{{foo.bar}}` template variable.
   */
  static stringify(objectTemplate, replacer, indent = 2) {
    const type = typeof objectTemplate;
    if (!objectTemplate || type !== "object") throw new Error(`Cannot stringify a ${type} payload template.`);
    return jsonStringifyExtended(objectTemplate, replacer, indent);
  }
  /**
   * Produces an instance of a template variable that can be used
   * in objects and will be stringified into `{{variableName}}` syntax.
   *
   * **Example:**
   * ```js
   * const resourceVariable = WebhookPayloadTemplate.getVariable('resource');
   * const objectTemplate = {
   *     foo: 'foo',
   *     bar: ['bar'],
   *     res: resourceVariable,
   * }
   *
   * const payloadTemplate = WebhookPayloadTemplate.stringify(objectTemplate);
   * ```
   *
   * **Produces:**
   * ```json
   * {
   *     "foo": "foo",
   *     "bar": ["bar"],
   *     "res": {{resource}},
   * }
   * ```
   */
  static getVariable(variableName) {
    return new JsonVariable(variableName);
  }
  _parse() {
    let currentIndex = 0;
    while (true) {
      try {
        return JSON.parse(this.payload);
      } catch (err) {
        const position = this._findPositionOfNextVariable(currentIndex);
        if (!position) {
          throw new InvalidJsonError(err);
        }
        if (!position.isInsideString) {
          this._replaceVariable(position);
        }
        currentIndex = position.openBraceIndex + 1;
      }
    }
  }
  _interpolate(value) {
    if (typeof value === "string") {
      return this._interpolateString(value);
    }
    if (Array.isArray(value)) {
      return this._interpolateArray(value);
    }
    if (typeof value === "object" && value !== null) {
      return this._interpolateObject(value);
    }
    return value;
  }
  _interpolateString(value) {
    if (value.match(/^\{\{([a-zA-Z0-9.]+)\}\}$/)) {
      const variableName = value.substring(2, value.length - 2);
      this._validateVariableName(variableName);
      return this._getVariableValue(variableName);
    }
    return value.replace(/\{\{([a-zA-Z0-9.]+)\}\}/g, (match, variableName) => {
      this._validateVariableName(variableName);
      const variableValue = this._getVariableValue(variableName);
      return `${variableValue}`;
    });
  }
  _interpolateObject(value) {
    const result = {};
    Object.entries(value).forEach(([key, v]) => {
      result[key] = this._interpolate(v);
    });
    return result;
  }
  _interpolateArray(value) {
    return value.map(this._interpolate.bind(this));
  }
  _findPositionOfNextVariable(startIndex = 0) {
    const openBraceIndex = this.payload.indexOf("{{", startIndex);
    const closeBraceIndex = this.payload.indexOf("}}", openBraceIndex) + 1;
    const someVariableMaybeExists = openBraceIndex > -1 && closeBraceIndex > -1;
    if (!someVariableMaybeExists) return null;
    const isInsideString = this._isVariableInsideString(openBraceIndex);
    return { isInsideString, openBraceIndex, closeBraceIndex };
  }
  _isVariableInsideString(openBraceIndex) {
    const unescapedQuoteCount = this._countUnescapedDoubleQuotesUpToIndex(openBraceIndex);
    return unescapedQuoteCount % 2 === 1;
  }
  _countUnescapedDoubleQuotesUpToIndex(index) {
    const payloadSection = this.payload.substring(0, index);
    let unescapedQuoteCount = 0;
    for (let i = 0; i < payloadSection.length; i++) {
      const char = payloadSection[i];
      const prevChar = payloadSection[i - 1];
      if (char === '"' && prevChar !== "\\") {
        unescapedQuoteCount++;
      }
    }
    return unescapedQuoteCount;
  }
  _replaceVariable({ openBraceIndex, closeBraceIndex }) {
    const variableName = this.payload.substring(openBraceIndex + 2, closeBraceIndex - 1);
    this._validateVariableName(variableName);
    const replacement = this._getVariableReplacement(variableName);
    this.replacedVariables.push({ variableName, replacement });
    this.payload = this.payload.substring(0, openBraceIndex) + replacement + this.payload.substring(closeBraceIndex + 1);
  }
  _validateVariableName(variableName) {
    if (this.allowedVariables === null) return;
    const [variable] = variableName.split(".");
    const isVariableValid = this.allowedVariables.has(variable);
    if (!isVariableValid) throw new InvalidVariableError(variableName);
  }
  _getVariableValue(variableName) {
    const [variable, ...properties] = variableName.split(".");
    const context = this.context[variable];
    const value = properties.reduce((ctx, prop) => {
      if (!ctx || typeof ctx !== "object") return null;
      return ctx[prop];
    }, context);
    return value;
  }
  _getVariableReplacement(variableName) {
    const value = this._getVariableValue(variableName);
    return value ? JSON.stringify(value) : null;
  }
};
__name(_WebhookPayloadTemplate, "WebhookPayloadTemplate");
var WebhookPayloadTemplate = _WebhookPayloadTemplate;

// src/crypto.ts
var import_node_crypto2 = __toESM(require("crypto"));
var ENCRYPTION_ALGORITHM = "aes-256-gcm";
var ENCRYPTION_KEY_LENGTH = 32;
var ENCRYPTION_IV_LENGTH = 16;
var ENCRYPTION_AUTH_TAG_LENGTH = 16;
function publicEncrypt({ publicKey, value }) {
  const key = cryptoRandomObjectId(ENCRYPTION_KEY_LENGTH);
  const initVector = cryptoRandomObjectId(ENCRYPTION_IV_LENGTH);
  const cipher = import_node_crypto2.default.createCipheriv(ENCRYPTION_ALGORITHM, key, initVector);
  const bufferFromValue = Buffer.from(value, "utf-8");
  const bufferFromKey = Buffer.from(key, "utf-8");
  const bufferFromInitVector = Buffer.from(initVector, "utf-8");
  const passwordBuffer = Buffer.concat([bufferFromKey, bufferFromInitVector]);
  const encryptedValue = Buffer.concat([cipher.update(bufferFromValue), cipher.final(), cipher.getAuthTag()]);
  const encryptedPassword = import_node_crypto2.default.publicEncrypt(publicKey, passwordBuffer);
  return {
    encryptedPassword: encryptedPassword.toString("base64"),
    encryptedValue: encryptedValue.toString("base64")
  };
}
__name(publicEncrypt, "publicEncrypt");
function privateDecrypt({
  privateKey,
  encryptedPassword,
  encryptedValue
}) {
  const encryptedValueBuffer = Buffer.from(encryptedValue, "base64");
  const encryptedPasswordBuffer = Buffer.from(encryptedPassword, "base64");
  const passwordBuffer = import_node_crypto2.default.privateDecrypt(privateKey, encryptedPasswordBuffer);
  if (passwordBuffer.length !== ENCRYPTION_KEY_LENGTH + ENCRYPTION_IV_LENGTH) {
    throw new Error("privateDecrypt: Decryption failed, invalid password length!");
  }
  const authTagBuffer = encryptedValueBuffer.slice(encryptedValueBuffer.length - ENCRYPTION_AUTH_TAG_LENGTH);
  const encryptedDataBuffer = encryptedValueBuffer.slice(0, encryptedValueBuffer.length - ENCRYPTION_AUTH_TAG_LENGTH);
  const encryptionKeyBuffer = passwordBuffer.slice(0, ENCRYPTION_KEY_LENGTH);
  const initVectorBuffer = passwordBuffer.slice(ENCRYPTION_KEY_LENGTH);
  const decipher = import_node_crypto2.default.createDecipheriv(ENCRYPTION_ALGORITHM, encryptionKeyBuffer, initVectorBuffer);
  decipher.setAuthTag(authTagBuffer);
  return Buffer.concat([decipher.update(encryptedDataBuffer), decipher.final()]).toString("utf-8");
}
__name(privateDecrypt, "privateDecrypt");

// src/url_params_utils.ts
function separateImports(code) {
  const lines = code.split("\n");
  return {
    code: lines.filter((line) => !line.trim().startsWith("import")).join("\n"),
    imports: lines.filter((line) => line.trim().startsWith("import")).join("\n")
  };
}
__name(separateImports, "separateImports");

// src/code_hash_manager.ts
var import_node_crypto3 = require("crypto");
var CodeHashMetaKey = /* @__PURE__ */ ((CodeHashMetaKey2) => {
  CodeHashMetaKey2["VERSION"] = "v";
  CodeHashMetaKey2["USER"] = "u";
  return CodeHashMetaKey2;
})(CodeHashMetaKey || {});
var _CodeHashManager = class _CodeHashManager {
  constructor(secret) {
    this.secret = secret;
  }
  /**
   * Encodes object (e.g. input for actor) to a string hash and uses the `secret` to sign the hash.
   */
  encode(data, userId) {
    const meta = {
      ["u" /* USER */]: userId,
      ["v" /* VERSION */]: _CodeHashManager.VERSION
    };
    const metaBase64 = this.toBase64(JSON.stringify(meta));
    const inputBase64 = this.toBase64(JSON.stringify(data));
    const dataToSign = [metaBase64, inputBase64].join(_CodeHashManager.SECTION_SEPARATOR);
    const signature = this.generateSignature(dataToSign);
    const signatureBase64 = this.toBase64(signature);
    const parts = [metaBase64, inputBase64, signatureBase64];
    return parts.join(_CodeHashManager.SECTION_SEPARATOR);
  }
  decode(urlHash) {
    const parts = urlHash.split(_CodeHashManager.SECTION_SEPARATOR);
    const dataToSign = parts.slice(0, 2).join(_CodeHashManager.SECTION_SEPARATOR);
    const meta = JSON.parse(this.fromBase64(parts[0]).toString());
    const data = JSON.parse(this.fromBase64(parts[1]).toString());
    const signature = this.fromBase64(parts[2]);
    const expectedSignature = this.generateSignature(dataToSign);
    const isSignatureValid = (0, import_node_crypto3.timingSafeEqual)(signature, expectedSignature);
    return {
      data,
      meta: {
        userId: meta["u" /* USER */],
        version: meta["v" /* VERSION */],
        isSignatureValid
      }
    };
  }
  toBase64(data) {
    return Buffer.from(data).toString("base64url");
  }
  fromBase64(encoded) {
    return Buffer.from(encoded, "base64url");
  }
  generateSignature(data) {
    return (0, import_node_crypto3.createHmac)("sha256", this.secret).update(data).digest();
  }
};
__name(_CodeHashManager, "CodeHashManager");
__publicField(_CodeHashManager, "SECTION_SEPARATOR", ".");
__publicField(_CodeHashManager, "VERSION", 1);
var CodeHashManager = _CodeHashManager;

// src/hmac.ts
var import_node_crypto4 = __toESM(require("crypto"));
var CHARSET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function encodeBase62(num) {
  if (num === 0n) {
    return CHARSET[0];
  }
  let res = "";
  while (num > 0n) {
    res = CHARSET[Number(num % 62n)] + res;
    num /= 62n;
  }
  return res;
}
__name(encodeBase62, "encodeBase62");
function createHmacSignature(secretKey, message) {
  const signature = import_node_crypto4.default.createHmac("sha256", secretKey).update(message).digest("hex").substring(0, 30);
  return encodeBase62(BigInt(`0x${signature}`));
}
__name(createHmacSignature, "createHmacSignature");
var subtleCrypto = globalThis.crypto?.subtle;
async function ensureSubtleCryptoExists() {
  if (!subtleCrypto) {
    try {
      subtleCrypto = require("crypto")?.webcrypto?.subtle;
      if (subtleCrypto) return;
    } catch {
    }
    try {
      subtleCrypto = (await import("crypto"))?.webcrypto?.subtle;
    } catch {
    }
    if (!subtleCrypto) {
      throw new Error(`SubtleCrypto is not available in this environment.
Please ensure you're running in an environment that supports Web Crypto API,
or submit an issue to https://github.com/apify/apify-shared-js so we can help you further.`);
    }
  }
}
__name(ensureSubtleCryptoExists, "ensureSubtleCryptoExists");
async function createHmacSignatureAsync(secretKey, message) {
  await ensureSubtleCryptoExists();
  const encoder = new TextEncoder();
  const key = await subtleCrypto.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await subtleCrypto.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  const signatureArray = new Uint8Array(signatureBuffer);
  const signatureHex = Array.from(signatureArray).map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 30);
  return encodeBase62(BigInt(`0x${signatureHex}`));
}
__name(createHmacSignatureAsync, "createHmacSignatureAsync");

// src/storages.ts
function createStorageContentSignature({
  resourceId,
  urlSigningSecretKey,
  expiresInMillis,
  version = 0
}) {
  const expiresAt = expiresInMillis ? (/* @__PURE__ */ new Date()).getTime() + expiresInMillis : 0;
  const hmac = createHmacSignature(urlSigningSecretKey, `${version}.${expiresAt}.${resourceId}`);
  return Buffer.from(`${version}.${expiresAt}.${hmac}`).toString("base64url");
}
__name(createStorageContentSignature, "createStorageContentSignature");
function typedArrayToBase64Url(typedArray) {
  let binary = "";
  for (let i = 0; i < typedArray.length; i++) {
    binary += String.fromCharCode(typedArray[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(typedArrayToBase64Url, "typedArrayToBase64Url");
async function createStorageContentSignatureAsync({
  resourceId,
  urlSigningSecretKey,
  expiresInMillis,
  version = 0
}) {
  const expiresAt = expiresInMillis ? (/* @__PURE__ */ new Date()).getTime() + expiresInMillis : 0;
  const hmac = await createHmacSignatureAsync(urlSigningSecretKey, `${version}.${expiresAt}.${resourceId}`);
  return typedArrayToBase64Url(new TextEncoder().encode(`${version}.${expiresAt}.${hmac}`));
}
__name(createStorageContentSignatureAsync, "createStorageContentSignatureAsync");

// src/parse_boolean.ts
var parseBooleanOrNull = /* @__PURE__ */ __name((value) => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (typeof value === "string") {
    const lowerValue = value.trim().toLowerCase();
    if (lowerValue === "true" || lowerValue === "1") return true;
    if (lowerValue === "false" || lowerValue === "0") return false;
  }
  return null;
}, "parseBooleanOrNull");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CHECK_TYPES,
  CodeHashManager,
  CodeHashMetaKey,
  HealthChecker,
  InvalidJsonError,
  InvalidVariableError,
  JsonVariable,
  ParseJsonlStream,
  RetryableError,
  WebhookPayloadTemplate,
  betterClearInterval,
  betterSetInterval,
  buildOrVersionNumberIntToStr,
  checkParamPrototypeOrThrow,
  concatStreamToBuffer,
  configureLogger,
  createHmacSignature,
  createHmacSignatureAsync,
  createInjectableRegExp,
  createStorageContentSignature,
  createStorageContentSignatureAsync,
  cryptoRandomObjectId,
  dateToString,
  delayPromise,
  deterministicUniqueId,
  escapeForBson,
  escapePropertyName,
  escapeRegExp,
  expressErrorHandler,
  getOrdinalSuffix,
  getRandomInt,
  http404Route,
  isBadForMongo,
  isBuffer,
  isForbiddenUsername,
  isNullOrUndefined,
  isUrlRelative,
  jsonStringifyExtended,
  leftpad,
  markedDecreaseHeadsLevel,
  markedSetNofollowLinks,
  normalizeUrl,
  parseBooleanOrNull,
  parseDateFromJson,
  parseUrl,
  privateDecrypt,
  promisifyServerListen,
  publicEncrypt,
  readStreamToString,
  removeFromArray,
  retryWithExpBackoff,
  separateImports,
  sequentializePromises,
  splitFullName,
  timeoutPromise,
  traverseObject,
  truncate,
  unescapeFromBson,
  unescapePropertyName,
  weightedAverage
});
/*!
 * This module contains various server utility and helper functions.
 * Note that it automatically exports functions from utilities.client.js
 *
 * Author: Jan Curn (jan@apify.com)
 * Copyright(c) 2015 Apify. All rights reserved.
 *
 */
/*!
 * This module contains various client-side utility and helper functions.
 *
 * Author: Jan Curn (jan@apify.com)
 * Copyright(c) 2016 Apify. All rights reserved.
 *
 */
//# sourceMappingURL=index.cjs.map
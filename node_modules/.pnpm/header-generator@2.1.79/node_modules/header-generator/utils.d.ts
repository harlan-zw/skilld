import { BrowserName, BrowserSpecification } from './header-generator';
export declare const getUserAgent: (headers: Record<string, string>) => string | undefined;
export declare const getBrowser: (userAgent?: string) => BrowserName | undefined;
export declare const getBrowsersFromQuery: (browserListQuery: string) => BrowserSpecification[];
export declare const shuffleArray: (array: any[]) => any[];
//# sourceMappingURL=utils.d.ts.map
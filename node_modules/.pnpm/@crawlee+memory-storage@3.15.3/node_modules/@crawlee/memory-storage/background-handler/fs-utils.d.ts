import type { BackgroundHandlerReceivedMessage } from '../utils';
export declare function handleMessage(message: BackgroundHandlerReceivedMessage): Promise<void>;
export declare function lockAndWrite(filePath: string, data: unknown, stringify?: boolean, retry?: number, timeout?: number): Promise<void>;
export declare function lockAndCallback<Callback extends () => Promise<any>>(filePath: string, callback: Callback, retry?: number, timeout?: number): Promise<Awaited<ReturnType<Callback>>>;
//# sourceMappingURL=fs-utils.d.ts.map
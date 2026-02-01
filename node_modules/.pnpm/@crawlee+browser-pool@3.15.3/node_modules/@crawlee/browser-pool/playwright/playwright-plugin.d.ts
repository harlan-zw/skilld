// @ts-ignore optional peer dependency or compatibility with es2022
import type { Browser as PlaywrightBrowser, BrowserType } from 'playwright';
import type { BrowserController } from '../abstract-classes/browser-controller';
import { BrowserPlugin } from '../abstract-classes/browser-plugin';
import { createProxyServerForContainers } from '../container-proxy-server';
import type { LaunchContext } from '../launch-context';
import type { SafeParameters } from '../utils';
export declare class PlaywrightPlugin extends BrowserPlugin<BrowserType, SafeParameters<BrowserType['launch']>[0], PlaywrightBrowser> {
    private _browserVersion?;
    _containerProxyServer?: Awaited<ReturnType<typeof createProxyServerForContainers>>;
    protected _launch(launchContext: LaunchContext<BrowserType>): Promise<PlaywrightBrowser>;
    private _throwOnFailedLaunch;
    protected _createController(): BrowserController<BrowserType, SafeParameters<BrowserType['launch']>[0], PlaywrightBrowser>;
    protected _addProxyToLaunchOptions(launchContext: LaunchContext<BrowserType>): Promise<void>;
    protected _isChromiumBasedBrowser(): boolean;
}
//# sourceMappingURL=playwright-plugin.d.ts.map
import { config } from '@/config';
import { getRebangMenu } from '@/rebang/utils';

export const getRebangMenuForUi = () => {
    const menu = structuredClone(getRebangMenu());

    const hasGithubToken = Boolean(config.github?.access_token);

    if (hasGithubToken) {
        for (const category of menu.categories) {
            for (const tab of category.tabs) {
                if (tab.key !== 'github') {
                    continue;
                }
                tab.disabled = false;
                tab.disabledReason = undefined;
                if (tab.subTabs?.length) {
                    for (const sub of tab.subTabs) {
                        sub.disabled = false;
                        sub.disabledReason = undefined;
                    }
                }
            }
        }
    }

    return menu;
};

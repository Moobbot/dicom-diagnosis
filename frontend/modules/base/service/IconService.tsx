import { Base } from '@/types';

let icons: Base.Icon[] = [];
let selectedIcon: Base.Icon | undefined;
export const IconService = {
    getIcons() {
        return fetch('/demo/data/icons.json', { headers: { 'Cache-Control': 'no-cache' } })
            .then((res) => res.json())
            .then((d) => d.icons as Base.Icon[]);
    },

    getIcon(id: number) {
        if (icons) {
            selectedIcon = icons.find((x: Base.Icon) => x.properties?.id === id);
            return selectedIcon;
        }
    }
};

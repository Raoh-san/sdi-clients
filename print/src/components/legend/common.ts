

import { Box, makeImage, makeText, LayoutDirection } from '../print/context';
import { Spec } from '../print/template';
import { resolution } from '../print';



export const atResolution =
    (n: number) => n * resolution / 25.4;




export const item =
    ({ rect, fontSize }: Spec, dataUrl: string, label: string): Box => {
        const width = rect.width;
        const height = rect.height;
        const textOffset = height * 1.5;
        return {
            x: 0, y: 0, width, height,
            children: [
                // symbol
                {
                    x: 0, y: 0, width: height, height,
                    children: [makeImage(dataUrl)],
                },
                // label
                {
                    x: textOffset, y: height / 2, width: width - textOffset, height,
                    children: [makeText(label, fontSize)],
                },
            ],
        };
    };


export const layout =
    (direction: LayoutDirection, items: Box[]): Box => {
        const height = items.reduce<number>((acc, b) => acc + b.height, 0);
        const width = items.reduce<number>((acc, b) => Math.max(acc, b.width), 0);
        if (items.length === 0) {
            return { x: 0, y: 0, height, width, children: [] };
        }
        return {
            x: 0, y: 0, height, width,
            children: [{
                name: 'polygon',
                direction,
                items,
            }],
        };
    };
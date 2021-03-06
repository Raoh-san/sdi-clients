/*
 *  Copyright (C) 2017 Atelier Cartographique <contact@atelier-cartographique.be>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as debug from 'debug';
import * as Color from 'color';
import { ReactNode } from 'react';

import { MessageKey } from 'sdi/locale/message-db';
import {
    BooleanConfig,
    ConfigWithLabel,
    ConfigWithLevel,
    ConfigWithStyle,
    ImageConfig,
    NumberConfig,
    PiechartConfig,
    PiechartPiece,
    PropType,
    RowConfig,
    StringConfig,
    StringOptionLevel,
    StringOptionStyle,
    TimeserieConfig,
    URLConfig,
} from 'sdi/source';
// import { isENTER } from 'sdi/components/keycodes';
import { getLang } from 'sdi/app';
import { DIV, SPAN } from 'sdi/components/elements';
import { inputText, inputNullableNumber } from 'sdi/components/input';
import tr from 'sdi/locale';
import { getLayerPropertiesKeys } from 'sdi/util';

import events from '../../events/feature-config';
import queries from '../../queries/feature-config';
import appQueries from '../../queries/app';
import { button, remove } from '../button';
import { renderInputAlphaColor } from '../legend-editor/tool-input';



const logger = debug('sdi:feature-config/config');


const moveUpButton = button('move-up');
const moveDownButton = button('move-down');

const propType: PropType[] = ['string', 'number', 'boolean', 'url', 'image', 'html'];
const propLevel: StringOptionLevel[] = ['normal', 'subtitle', 'title'];
const propStyle: StringOptionStyle[] = ['normal', 'bold', 'italic', 'bold-italic'];


const WIDGET_TIMESERIE = '__WIDGET_TIMESERIE__';
const WIDGET_PIECHART = '__WIDGET_PIECHART__';
const WIDGETS = [
    WIDGET_PIECHART,
    WIDGET_TIMESERIE,
];
const WIDGET_NAME: { [k: string]: PropType } = {
    [WIDGET_PIECHART]: 'piechart',
    [WIDGET_TIMESERIE]: 'timeserie',
};

const isWidget =
    (pn: string) => {
        return WIDGETS.reduce((acc, w) => {
            if (acc) {
                return acc;
            }
            return w === pn;
        }, false);
    };

const renderSelectItem =
    <T extends string>(set: (a: T) => void) => (v: T) => (
        DIV({ className: 'interactive', onClick: () => set(v) }, SPAN({}, v))
    );

export const renderSelect =
    <T extends string>(list: T[], selected: T | null, set: (a: T) => void) => {
        const mkItem = renderSelectItem(set);
        const below = list.filter(i => i !== selected).map(mkItem);

        return (
            DIV({ className: 'select' },
                DIV({ className: 'selected' }, SPAN({}, (!selected) ? 'none' : selected)),
                DIV({ className: 'below' }, ...below)));
    };


const inputWithLabel =
    (row: ConfigWithLabel) => (
        DIV({
            className: (row.options.withLabel) ? 'with-label active' : 'with-label',
            onClick: () => {
                events.setPropWithLabelForConfig(
                    row.propName, !row.options.withLabel);
            },
        }, tr('displayLabel'))
    );

const inputType =
    (row: RowConfig) => {
        return (
            renderSelect<PropType>(propType, row.type,
                v => events.setPropTypeForConfig(row.propName, v))
        );
    };

const inputLevel =
    (row: ConfigWithLevel) => {
        return (
            renderSelect<StringOptionLevel>(propLevel, row.options.level,
                v => events.setPropLevelForConfig(row.propName, v))
        );
    };

const inputStyle =
    (row: ConfigWithStyle) => {
        return (
            renderSelect<StringOptionStyle>(propStyle, row.options.style,
                v => events.setPropStyleForConfig(row.propName, v))
        );
    };


const renderSelectRow =
    (pn: string, type?: PropType) => (
        DIV({
            className: 'row',
            onClick: () => {
                events.addPropToConfig(pn);
                if (type) {
                    events.setPropTypeForConfig(pn, type);
                }
            },
        },
            DIV({ className: 'propName' }, type ? type : pn)));


const renderMoveUpButton =
    (propName: string) => moveUpButton(() => events.movePropUp(propName));


const renderMoveDownButton =
    (propName: string) => moveDownButton(() => events.movePropDown(propName));


const renderRemoveButton =
    (propName: string) => remove(`remove-feature-config-${propName}`)(
        () => events.removePropFromConfig(propName));


const renderSelectedRow =
    (row: RowConfig, key: number, rows: RowConfig[]) => {
        const currentPropName = queries.getCurrentPropName();
        const propName = row.propName;
        const displayName = isWidget(propName) ? WIDGET_NAME[propName] : propName;
        let tools = [];

        if (key === 0) {
            tools = [renderMoveDownButton(propName), renderRemoveButton(propName)];
        }
        else if (key + 1 === rows.length) {
            tools = [renderMoveUpButton(propName), renderRemoveButton(propName)];
        }
        else {
            tools = [renderMoveDownButton(propName), renderMoveUpButton(propName), renderRemoveButton(propName)];
        }

        return (
            DIV({
                key,
                className: (currentPropName === propName) ? 'row configured active' : 'row configured',
                onClick: () => events.setCurrentPropName(propName),
            },
                DIV({ className: 'propName' }, displayName),
                DIV({ className: 'tools' }, ...tools)));
    };


const label = (k: MessageKey, c = 'label') => DIV({ className: c }, tr(k));

const renderStringEditor =
    (config: StringConfig | NumberConfig | BooleanConfig | URLConfig) => {
        return ([
            DIV({ className: 'item' }, inputWithLabel(config)),
            DIV({ className: 'item' }, label('textFormat'), inputLevel(config)),
            DIV({ className: 'item' }, label('textStyle'), inputStyle(config)),
        ]);
    };


const renderImageEditor =
    (config: ImageConfig) => {
        return [DIV({ className: 'item' }, inputWithLabel(config))];
    };



const renderPiechartPiece =
    (pn: string) =>
        (piece: PiechartPiece, key: number) => {
            const removeButton = remove(
                `renderStyleGroupValue-${piece.propName}-${key}`);

            const inputColor = renderInputAlphaColor('style-tool color', '',
                () => Color(piece.color),
                c => events.setPiechartPieceColor(
                    pn, piece.propName, c.string()));

            const inputLabel = DIV({ className: `style-tool label` },
                SPAN({ className: 'label' }, tr('alias')),
                inputText(
                    () => (piece.label === undefined) ? piece.propName : piece.label,
                    newVal => events.setPiechartPieceLabel(pn, piece.propName, newVal)));

            return (
                DIV({ className: 'value-name' },
                    DIV({ className: 'piece-header' },
                        removeButton(
                            () => events.removePieChartPiece(pn, piece.propName)),
                        SPAN({}, piece.propName),
                        inputLabel),
                    DIV({ className: 'piece-body' },
                        inputColor)));
        };

const pieceAdd =
    (pn: string, value: string) => {
        if (value) {
            events.resetEditedValue();
            events.addPieChartPiece(pn, value);
        }
    };




const renderColumnNames =
    (pn: string, keys: string[]) =>
        keys.map((key) => {
            return DIV({
                key,
                className: 'column-name',
                onClick: () => {
                    pieceAdd(pn, key);
                },
            }, key);
        });

const columnPicker =
    (pn: string) => {
        const { metadata } = appQueries.getCurrentLayerInfo();
        const children: React.ReactNode[] = [];
        if (metadata) {
            const layerData = appQueries.getLayerData(metadata.uniqueResourceIdentifier);
            if (layerData) {
                const keys = getLayerPropertiesKeys(layerData);
                children.push(...renderColumnNames(pn, keys));
            }
        }

        return (
            DIV({ className: 'column-picker' },
                DIV({ className: 'title' }, tr('columnPicker')),
                ...children));
    };

const renderPiechartEditor =
    (config: PiechartConfig) => {
        const columns = config.options.columns;
        const pieces = columns.map(renderPiechartPiece(config.propName));
        const elements: ReactNode[] = [];

        elements.push(
            DIV({ className: 'selected-items' },
                ...pieces,
                columnPicker(config.propName)));


        const scaleSelect = renderSelect(
            ['normal', 'log'],
            config.options.scale,
            (v) => { events.setPiechartScale(config.propName, v); });

        const radiusSelect = renderSelect(
            ['normal', 'dynamic'],
            config.options.radius,
            (v) => { events.setPiechartRadius(config.propName, v); });

        return [
            DIV({ className: 'item' }, label('piechartScale'), scaleSelect),
            DIV({ className: 'item' }, label('piechartRadius'), radiusSelect),
            DIV({ className: 'item item-piechart' }, ...elements),
        ];
    };


const renderTimeserieEditor =
    (config: TimeserieConfig) => {
        return [
            DIV({ className: 'item' },
                label('timeserieTemplateURL', 'help'),
                inputText(
                    () => config.options.urlTemplate,
                    value => events.setTimeserieUrl(config.propName, value)),
                label('timeserieReference', 'help'),
                inputNullableNumber(
                    () => config.options.referencePoint,
                    value => events.setTimeserieReference(config.propName, value)))];
    };


const renderTypeSelector =
    (config: RowConfig) => {
        return DIV({ className: 'item' }, label('dataType'), inputType(config));
    };

const renderRowEditor =
    (row: RowConfig) => {
        const elements: ReactNode[] = [];
        switch (row.type) {
            case 'string': elements.push(
                renderTypeSelector(row), ...renderStringEditor(row));
                break;
            case 'number': elements.push(
                renderTypeSelector(row), ...renderStringEditor(row));
                break;
            case 'boolean': elements.push(
                renderTypeSelector(row), ...renderStringEditor(row));
                break;
            case 'url': elements.push(
                renderTypeSelector(row), ...renderStringEditor(row));
                break;
            case 'image': elements.push(
                renderTypeSelector(row), ...renderImageEditor(row));
                break;
            case 'piechart': elements.push(...renderPiechartEditor(row));
                break;
            case 'timeserie': elements.push(...renderTimeserieEditor(row));
                break;
        }
        return elements;
    };


const renderPanel =
    (className: string, label: MessageKey, ...children: ReactNode[]) =>
        DIV({ className: `app-col-wrapper ${className}` },
            DIV({ className: 'app-col-header' },
                DIV({ className: 'title' }, tr(label))),
            DIV({ className: 'app-col-main' }, ...children));


const render =
    () => {
        const lc = getLang();
        const propNames = queries.getKeys();
        const config = queries.getConfig();
        const currentPropName = queries.getCurrentPropName();
        const selected = config.rows.filter(r => r.lang === lc);
        const selectedPropnames = selected.map(r => r.propName);
        const remaining = propNames.filter(pn => selectedPropnames.indexOf(pn) === -1);
        const currentRow = selected.find(r => r.propName === currentPropName);
        let editor: ReactNode;
        if (currentRow) {
            editor = renderRowEditor(currentRow);
        }

        const columElements: ReactNode[] = remaining.filter(pn => !isWidget(pn)).map(pn => renderSelectRow(pn));

        const widgetElements: ReactNode[] = [];
        const selectedWidgets = selectedPropnames.filter(isWidget);
        WIDGETS.forEach((wn) => {
            if (selectedWidgets.findIndex(n => n === wn) < 0) {
                widgetElements.push(renderSelectRow(wn, WIDGET_NAME[wn]));
            }
        });


        const elements: ReactNode[] = [];
        if (widgetElements.length > 0) {
            elements.push(DIV({ className: 'group' },
                DIV({ className: 'group-label' }, tr('widgets')),
                ...widgetElements));
        }
        if (columElements.length > 0) {
            elements.push(DIV({ className: 'group' },
                DIV({ className: 'group-label' }, tr('columns')),
                ...columElements));
        }

        return (
            DIV({ className: 'app-split-main' },
                renderPanel('rows-remaining', 'infoChoice',
                    ...elements),
                renderPanel('rows-selected', 'infoReorder',
                    selected.map(renderSelectedRow)),
                renderPanel('row-editor', 'style', editor))
        );
    };

export default render;

logger('loaded');

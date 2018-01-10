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


import { t, a, u, TypeOf } from './io';
import * as io from 'io-ts';

export const ITimeserieRowIO = t([
    io.number, // Timestamp
    u([io.string, io.number, io.null]), // Value
    u([io.string, io.number, io.null]), // Quality
], 'ITimeserieRowIO');
export type ITimeserieRow = TypeOf<typeof ITimeserieRowIO>;

export const ITimeserieIO = a(ITimeserieRowIO);
export type ITimeserie = TypeOf<typeof ITimeserieIO>;



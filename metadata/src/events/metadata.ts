
import { fromNullable } from 'fp-ts/lib/Option';

import { getApiUrl } from 'sdi/app';
import { getMessageRecord, Inspire } from 'sdi/source';
import { scopeOption } from 'sdi/lib';
import { dispatchK, dispatch } from 'sdi/shape';

import { getDatasetMetadata, getMdForm, getMetadataId } from '../queries/metadata';
import { putMetadata } from '../remote';

const single = dispatchK('component/single');
const apiUrl = (s: string) => getApiUrl(s);

export const setMdTitle =
    (l: 'fr' | 'nl') =>
        (t: string) => single(
            s => ({ ...s, title: { ...s.title, [l]: t } }));

export const setMdDescription =
    (l: 'fr' | 'nl') =>
        (t: string) => single(
            s => ({ ...s, description: { ...s.description, [l]: t } }));


export const selectMetadata =
    (id: string) => {
        dispatch('app/current-metadata', () => id);
        getDatasetMetadata(id)
            .map(md => dispatch('component/single', s => ({
                ...s,
                keywords: md.keywords,
                topics: md.topicCategory,
                title: getMessageRecord(md.resourceTitle),
                description: getMessageRecord(md.resourceAbstract),
            })));
    };


const updatedMd =
    (md: Inspire): Inspire => {
        const { title, description, keywords, topics, published } = getMdForm();
        return {
            ...md,
            keywords,
            published,
            topicCategory: topics,
            resourceTitle: title,
            resourceAbstract: description,
        };
    };

const updateLocalSet =
    (collection: Inspire[], md: Inspire) =>
        collection.filter(i => i.id !== md.id).concat(md);

export const saveMdForm =
    () =>
        scopeOption()
            .let('id', fromNullable(getMetadataId()))
            .let('md', s => getDatasetMetadata(s.id))
            .map(({ id, md }) => {
                single(s => ({ ...s, saving: true }));
                putMetadata(
                    apiUrl(`metadatas/${id}`), updatedMd(md))
                    .then((newMd) => {
                        single(s => ({ ...s, saving: false }));
                        dispatch('data/datasetMetadata',
                            collection => updateLocalSet(collection, newMd));
                    })
                    .catch(() => single(s => ({ ...s, saving: false })));
            });


export const addKeyword =
    (id: string) => single(s => ({ ...s, keywords: s.keywords.concat([id]) }));

export const removeKeyword =
    (id: string) => single(s => ({ ...s, keywords: s.keywords.filter(k => k !== id) }));

export const addTopic =
    (id: string) => single(s => ({ ...s, topics: s.topics.concat([id]) }));

export const removeTopic =
    (id: string) => single(s => ({ ...s, topics: s.topics.filter(k => k !== id) }));

export const mdPublish =
    () => {
        single(s => ({ ...s, published: true }));
        saveMdForm();
    };
export const mdDraft =
    () => {
        single(s => ({ ...s, published: false }));
        saveMdForm();
    };

// observe('data/datasetMetadata',
//     () => dispatch('component/table',
//         ts => ({ ...ts, loaded: false })));

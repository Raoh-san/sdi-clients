import { DIV, H1, INPUT, TEXTAREA, SPAN } from '../elements';
import tr, { fromRecord } from '../../locale';
import {
    formIsSaving,
    getCurrentDatasetMetadata,
    getMdDescription,
    getMdTitle,
    getTemporalReference,
    getKeywordList,
    getKeywords,
    isSelectedKeyword,
    getTopics,
    getTopicList,
    isSelectedTopic,
} from '../../queries/metadata';
import {
    saveMdForm,
    setMdDescription,
    setMdTitle,
    removeKeyword,
    addKeyword,
    removeTopic,
    addTopic,
    mdPublish,
    mdDraft,
} from '../../events/metadata';
import { Inspire, MessageRecord, getMessageRecord } from 'sdi/source';
import button from '../button';
import appEvents from '../../events/app';
import { AppLayout } from '../../shape';
import { fromPredicate } from 'fp-ts/lib/Either';


export interface MdForm {
    title: MessageRecord;
    description: MessageRecord;
    topics: string[];
    keywords: string[];
    published: boolean;
    saving: boolean;
}

const toListButton = button('table', 'sheetList');
const saveButton = button('validate', 'save');
const removeButton = button('remove');
const publishButton = button('unpublish');
const unpublishButton = button('publish');

const defaultMessage = () => ({ fr: '', nl: '' });

export const defaultMdFormState =
    (): MdForm => ({
        title: defaultMessage(),
        description: defaultMessage(),
        topics: [],
        keywords: [],
        published: false,
        saving: false,
    });


type TextGetter = () => string;
type TextSetter = (a: string) => void;

const isNotSaving = fromPredicate<void, React.ReactNode>(() => !formIsSaving(), () => { });



const renderInputText =
    (label: string, get: TextGetter, set: TextSetter) => {
        const defaultValue = get();
        const update = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newVal = e.currentTarget.value;
            set(newVal);
        };
        return (
            INPUT({
                defaultValue,
                placeholder: label,
                type: 'text',
                onChange: update,
            })
        );
    };

const renderTextArea =
    (label: string, get: TextGetter, set: TextSetter) => {
        const defaultValue = get();
        const update = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newVal = e.currentTarget.value;
            set(newVal);
        };
        return (
            TEXTAREA({
                defaultValue,
                placeholder: label,
                onChange: update,
            })
        );
    };





const renderEdit =
    (m: Inspire) => (DIV({ className: 'meta-edit' },
        renderInfo(m),
        DIV({ className: 'app-col-wrapper meta-fr' },
            DIV({ className: 'app-col-header' }, 'FR'),
            DIV({ className: 'app-col-main' },
                DIV({ className: 'label' }, 'Titre'),
                renderInputText('Titre',
                    getMdTitle('fr'), setMdTitle('fr')),
                DIV({ className: 'label' }, 'Résumé'),
                renderTextArea('Résumé',
                    getMdDescription('fr'), setMdDescription('fr')))),
        DIV({ className: 'app-col-wrapper meta-nl' },
            DIV({ className: 'app-col-header' }, 'NL'),
            DIV({ className: 'app-col-main' },
                DIV({ className: 'label' }, 'Titel'),
                renderInputText('Titel',
                    getMdTitle('nl'), setMdTitle('nl')),
                DIV({ className: 'label' }, 'Overzicht'),
                renderTextArea('Overzicht',
                    getMdDescription('nl'), setMdDescription('nl')))),
        renderCommon(m)));


const renderPoc =
    (m: Inspire) => m.metadataPointOfContact.map(
        poc => (
            DIV({ className: 'point-of-contact' },
                SPAN({ className: 'contact-name' }, poc.contactName),
                SPAN({ className: 'contact-email' }, poc.email),
                SPAN({ className: 'contact-organisation' },
                    fromRecord(getMessageRecord(poc.organisationName))))));


const renderSelectKeyword =
    () => {
        const choice =
            getKeywordList()
                .filter(kw => !isSelectedKeyword(kw.id))
                .map(k => DIV({
                    key: k.id,
                    onClick: () => isSelectedKeyword(k.id) ? removeKeyword(k.id) : addKeyword(k.id),
                }, fromRecord(k.name)));

        return (
            DIV({ className: 'keywords-wrapper' },
                DIV({ className: 'label' }, tr('keywords')),
                DIV({
                    className: 'select-keyword',
                }, ...choice)));
    };

const renderSelectTopic =
    () => {
        const choice =
            getTopicList()
                .filter(topic => !isSelectedTopic(topic.id))
                .map(t => DIV({
                    key: t.id,
                    onClick: () => isSelectedTopic(t.id) ? removeTopic(t.id) : addTopic(t.id),
                }, fromRecord(t.name)));

        return (
            DIV({ className: 'topics-wrapper' },
                DIV({ className: 'label' }, tr('topics')),
                DIV({
                    className: 'select-topic',
                }, ...choice)));
    };



const renderCommon =
    (_m: Inspire) => (
        DIV({ className: 'app-col-wrapper meta-common' },
            // DIV({ className: 'app-col-header' }, 'FR & NL'),
            DIV({ className: 'app-col-main' },
                renderSelectTopic(),
                renderSelectKeyword())));


const renderAction =
    (_m: Inspire) => (
        DIV({ className: 'meta-action' },
            isNotSaving(saveButton(saveMdForm)).fold(
                () => DIV({}, tr('saving')),
                e => e),
            toListButton(() => appEvents.setLayout(AppLayout.List)),
        ));

const labeledString =
    (l: string, v: string) => (
        DIV({ className: 'metadata-label' },
            DIV({ className: 'label' }, l),
            DIV({ className: 'value' }, v)));

const labeledNode =
    (l: string, v: React.ReactNode) => (
        DIV({ className: 'metadata-label' },
            DIV({ className: 'label' }, l), v));

const renderPublishState =
    ({ published }: Inspire) => {
        if (published) {
            return DIV({ className: 'toggle' },
                DIV({ className: 'no-active' }, tr('draft')),
                unpublishButton(mdDraft),
                DIV({ className: 'active' }, tr('published')));
        }
        return DIV({ className: 'toggle' },
            DIV({ className: 'active' }, tr('draft')),
            publishButton(mdPublish),
            DIV({ className: 'no-active' }, tr('published')));
    };

const renderTopics =
    () => DIV({}, ...getTopics()
        .map(topic => (
            DIV({ className: 'topic' },
                removeButton(() => removeTopic(topic.id)),
                SPAN({ className: 'value' }, fromRecord(topic.name))))));

const renderKeywords =
    () => DIV({}, ...getKeywords()
        .map(kw => (
            DIV({ className: 'keyword' },
                removeButton(() => removeKeyword(kw.id)),
                SPAN({ className: 'value' }, fromRecord(kw.name))))));

const renderInfo =
    (m: Inspire) => (
        DIV({ className: 'app-col-wrapper metadata-info' },
            DIV({ className: 'app-col-header' }, tr('layerInfo')),
            DIV({ className: 'app-col-main' },
                labeledNode(tr('publicationStatus'), renderPublishState(m)),
                labeledString(tr('layerId'), m.uniqueResourceIdentifier),
                labeledNode(tr('topics'), renderTopics()),
                labeledNode(tr('keywords'), renderKeywords()),
                labeledString(tr('geometryType'), m.geometryType),
                labeledString(tr('temporalReference'), getTemporalReference(m.temporalReference)),
                labeledNode(tr('pointOfContact'), renderPoc(m)),
                labeledString(tr('identifier'), m.id))));



const renderEditor =
    (m: Inspire) => (
        DIV({ className: 'metadata-editor' },
            H1({}, tr('metadataEditor')),
            DIV({ className: 'meta-wrapper' },
                renderEdit(m)),
            DIV({ className: 'metadata-actions' },
                renderAction(m))));


const render =
    () => (
        getCurrentDatasetMetadata()
            .fold(
            () => H1({}, `Loading Current Metadata Failed`),
            renderEditor,
        ));


export default render;

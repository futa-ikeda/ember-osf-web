import OsfSerializer from './osf-serializer';

export default class ReviewAction extends OsfSerializer {
    // Because `trigger` is a private method on DS.Modelq
    attrs = {
        ...this.attrs, // from OsfSerializer
        actionTrigger: 'trigger',
    };
}

declare module 'ember-data' {
    interface SerializerRegistry {
        'review-action': ReviewAction;
    }
}

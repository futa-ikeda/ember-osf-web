import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

import RevisionModel, { RevisionReviewStates } from 'ember-osf-web/models/revision';

export interface MirageRevisionModel extends RevisionModel {
    registrationId: string;
}

export default Factory.extend<MirageRevisionModel>({
    dateCreated() {
        return faker.date.past(1, new Date(2015, 0, 0));
    },

    dateModified() {
        return faker.date.past(2, new Date(2018, 0, 0));
    },

    reviewState() {
        return RevisionReviewStates.RevisionInProgress;
    },

    afterCreate(revision) {
        if (revision.registration) {
            revision.registrationSchema = revision.registration.registrationSchema;
            revision.save();
        }
    },
});

declare module 'ember-cli-mirage/types/registries/model' {
    export default interface MirageModelRegistry {
        revision: MirageRevisionModel;
    } // eslint-disable-line semi
}

declare module 'ember-cli-mirage/types/registries/schema' {
    export default interface MirageSchemaRegistry {
        revisions: MirageRevisionModel;
    } // eslint-disable-line semi
}
import DS from 'ember-data';
import OsfModel from './osf-model';

export default class License extends OsfModel.extend({
    name: DS.attr('fixstring'),
    text: DS.attr('fixstring'),
    requiredFields: DS.attr('array'),
}) {
    // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
    interface ModelRegistry {
        'license': License;
    }
}

import Model from '@ember-data/model';
import { layout } from 'ember-osf-web/decorators/component';

import BaseValidatedComponent from '../base-component';
import template from './template';

@layout(template)
export default class ValidatedTextArea<M extends Model> extends BaseValidatedComponent<M> {
    valuePath!: AttributesFor<M>;
}

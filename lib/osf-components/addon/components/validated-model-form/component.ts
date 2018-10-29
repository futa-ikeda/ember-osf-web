import { layout } from '@ember-decorators/component';
import { or } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import Component from '@ember/component';
import { set } from '@ember/object';
import { task } from 'ember-concurrency';
import { Validations } from 'ember-cp-validations';
import DS, { ModelRegistry } from 'ember-data';
import Toast from 'ember-toastr/services/toast';

import { requiredAction } from 'ember-osf-web/decorators/component';
import Analytics from 'ember-osf-web/services/analytics';
import defaultTo from 'ember-osf-web/utils/default-to';

import template from './template';

type ValidatedModelName = {
    [K in keyof ModelRegistry]: ModelRegistry[K] extends (Validations & DS.Model) ? K : never
}[keyof ModelRegistry];

@layout(template)
export default class ValidatedModelForm<M extends ValidatedModelName> extends Component {
    // Required arguments
    @requiredAction onSave!: (model: ModelRegistry[M]) => void;

    // Optional arguments
    onError?: (model: ModelRegistry[M], e: object) => void;
    model?: ModelRegistry[M];
    modelName?: M; // If provided, new model instance created in constructor
    disabled: boolean = defaultTo(this.disabled, false);
    analyticsScope?: string;

    // Private properties
    @service store!: DS.Store;
    @service analytics!: Analytics;
    @service toast!: Toast;

    shouldShowMessages: boolean = false;
    saved: boolean = false;
    modelProperties: object = defaultTo(this.modelProperties, {});
    recreateModel: boolean = defaultTo(this.recreateModel, false);

    @or('disabled', 'saveModelTask.isRunning')
    inputsDisabled!: boolean;

    saveModelTask = task(function *(this: ValidatedModelForm<M>) {
        if (!this.model) {
            return;
        }
        if (this.analyticsScope) {
            this.analytics.click('button', `${this.analyticsScope} - Save`);
        }

        const { validations } = yield this.model.validate();
        this.set('shouldShowMessages', true);

        if (validations.get('isValid')) {
            try {
                yield this.model.save();
                this.set('saved', true);
                this.onSave(this.model);
                if (this.modelName && this.recreateModel) {
                    set(this, 'model', this.store.createRecord(this.modelName, this.modelProperties));
                }
                this.set('shouldShowMessages', false);
            } catch (e) {
                if (this.onError) {
                    this.onError(this.model, e);
                } else {
                    this.toast.error(e);
                }
                throw e;
            }
        }
    });

    constructor(...args: any[]) {
        super(...args);

        if (!this.model && this.modelName) {
            this.model = this.store.createRecord(this.modelName, this.modelProperties);
        }
    }

    willDestroy() {
        if (this.model && !this.saved) {
            this.model.unloadRecord();
        }
    }
}

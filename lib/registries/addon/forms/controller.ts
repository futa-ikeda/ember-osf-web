import { service } from '@ember-decorators/service';
import Controller from '@ember/controller';
import Analytics from 'ember-osf-web/services/analytics';

export default class Forms extends Controller {
    @service analytics!: Analytics;
}

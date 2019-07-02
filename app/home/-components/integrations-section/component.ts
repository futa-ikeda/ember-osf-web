import { tagName } from '@ember-decorators/component';
import { alias } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import Component from '@ember/component';
import { camelize } from '@ember/string';
import Features from 'ember-feature-flags/services/features';
import config from 'ember-get-config';

import Analytics from 'ember-osf-web/services/analytics';

const { featureFlagNames: { ABTesting } } = config;

@tagName('')
export default class IntegrationsSection extends Component {
    @service analytics!: Analytics;
    @service features!: Features;

    @alias(`features.${camelize(ABTesting.homePageVersionB)}`)
    shouldShowVersionB!: boolean;
}

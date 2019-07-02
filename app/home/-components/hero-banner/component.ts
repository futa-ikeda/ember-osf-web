import { tagName } from '@ember-decorators/component';
import { action, computed } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import Component from '@ember/component';
import { camelize } from '@ember/string';
import Features from 'ember-feature-flags/services/features';
import config from 'ember-get-config';

import { serviceLinks } from 'ember-osf-web/const/service-links';
import Analytics from 'ember-osf-web/services/analytics';

import { layout } from 'ember-osf-web/decorators/component';

import styles from './styles';
import template from './template';

const { featureFlagNames: { ABTesting } } = config;

@layout(template, styles)
@tagName('')
export default class NewHomeHeroBanner extends Component {
    @service analytics!: Analytics;
    @service features!: Features;

    @alias(`features.${camelize(ABTesting.homePageVersionB)}`)
    shouldShowVersionB!: boolean;

    @computed('shouldShowVersionB')
    get version(this: NewHomeHeroBanner): string {
        return this.shouldShowVersionB ? 'versionB' : 'versionA';
    }

    @action
    search(query: string) {
        const { search } = serviceLinks;
        this.analytics.track('search', 'enter', `Logged-out homepage ${this.version} - Search`);
        window.location.href = `${search}?q=${query}&page=1`;
    }
}

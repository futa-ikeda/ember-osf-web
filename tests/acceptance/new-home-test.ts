import { currentURL, settled, visit } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Features from 'ember-feature-flags';
import config from 'ember-get-config';
import { t } from 'ember-i18n/test-support';
import { percySnapshot } from 'ember-percy';
import { module, test } from 'qunit';

import { click, setupOSFApplicationTest } from 'ember-osf-web/tests/helpers';

const { featureFlagNames: { ABTesting } } = config;

module('Acceptance | new home page test', hooks => {
    setupOSFApplicationTest(hooks);
    setupMirage(hooks);

    test('visiting new-home', async assert => {
        await visit('/new-home');

        assert.equal(currentURL(), '/new-home', "Still at 'new-home'.");
        // Check navbar
        assert.dom('nav.navbar').exists();
        assert.dom('nav.navbar .sign-in').exists();

        // Check hero
        assert.dom('[data-test-hero-heading]')
            .containsText(t('osf-components.hero-banner.heading').toString());
        assert.dom('[data-test-hero-subheading]')
            .containsText(t('osf-components.hero-banner.subheading').toString());
        assert.notOk(document.querySelector('[data-test-hero-container]')!.className.includes('versionB'));

        // Check support
        assert.dom('[data-test-support-heading]').hasText('How OSF supports your research');
        assert.dom('[data-test-support-search]').exists();
        assert.dom('[data-test-support-design]').exists();
        assert.dom('[data-test-support-analyze]').exists();
        assert.dom('[data-test-support-publish]').exists();
        assert.dom('[data-test-arrow]').exists({ count: 3 });
        assert.dom('[data-test-learn-more-button]').exists();

        // Check integrations
        assert.dom('[data-test-integrations-heading]')
            .containsText(t('new-home.integrations-section.header').toString());
        assert.dom('[data-test-authentication-heading]')
            .containsText(t('new-home.integrations-section.authentication').toString());
        assert.dom('[data-test-discovery-heading]')
            .containsText(t('new-home.integrations-section.discovery').toString());
        assert.dom('[data-test-references-heading]')
            .containsText(t('new-home.integrations-section.references').toString());
        assert.dom('[data-test-storage-heading]')
            .containsText(t('new-home.integrations-section.storage').toString());
        assert.dom('[data-test-logo]').exists({ count: 8 });
        assert.dom('[data-test-get-started-button]').exists({ count: 1 });

        // Check footer.
        assert.dom('footer').exists();
        await a11yAudit();
        await percySnapshot(assert);
    });

    test('visiting new-home version B', async function(assert) {
        await visit('/new-home');
        const features = this.owner.lookup('service:features') as Features;

        features.enable(ABTesting.homePageVersionB);

        await settled();
        assert.dom('[data-test-add-research-heading]').exists();
        assert.dom('[data-test-add-research-subheading]').exists();
        assert.ok(document.querySelector('[data-test-hero-container]')!.className.includes('versionB'));
        assert.dom('[data-test-get-started-button]').exists({ count: 2 });

        await a11yAudit();
        await percySnapshot(assert);
    });

    test('Get Started button works', async assert => {
        await visit('/new-home');

        await click('[data-test-get-started-button]');
        assert.equal(currentURL(), '/register');
    });
});

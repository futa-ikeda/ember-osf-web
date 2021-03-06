import { getOwner } from '@ember/application';
import Component from '@ember/component';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import { layout } from 'ember-osf-web/decorators/component';
import styles from './styles';
import template from './template';

/**
 * Modal that provides examples and explanation of Lucene Search syntax
 *
 * ```handlebars
 * {{search-help-modal
 *      isOpen=isOpen
 * }}
 * ```
 */
@layout(template, styles)
export default class SearchHelpModal extends Component {
    @service router!: RouterService;

    isOpen = false;

    examples: Array<{ q: string, text: string }> = [
        {
            q: 'repro*',
            text: 'repro*',
        },
        {
            q: 'brian+AND+title%3Amany',
            text: 'brian AND title:many',
        },
        {
            q: 'tags%3A%28psychology%29',
            text: 'tags:(psychology)',
        },
    ];

    get currentPath(): string {
        return getOwner(this).lookup('controller:application').currentPath;
    }
}

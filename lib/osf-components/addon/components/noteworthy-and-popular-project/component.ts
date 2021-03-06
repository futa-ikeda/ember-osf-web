import Component from '@ember/component';
import { computed } from '@ember/object';

import { layout } from 'ember-osf-web/decorators/component';
import Node from 'ember-osf-web/models/node';

import styles from './styles';
import template from './template';

@layout(template, styles)
export default class NoteworthyAndPopularProject extends Component {
    project?: Node;

    @computed('project.description')
    get compactDescription(): string | undefined {
        if (!this.project) {
            return undefined;
        }
        const desc = this.project.description;
        return desc.length > 115 ? `${desc.slice(0, 111)}\u2026` : desc;
    }
}

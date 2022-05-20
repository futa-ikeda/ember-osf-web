import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import File from 'ember-osf-web/packages/files/file';
import StorageManager from 'osf-components/components/storage-provider-manager/storage-manager/component';

interface Args {
    item: File;
    onDelete: () => void;
    manager?: StorageManager; // No manager for file-detail page
}

export default class FileActionsMenu extends Component<Args> {
    @tracked isDeleteModalOpen = false;
    @tracked moveModalOpen = false;

    @action
    closeDeleteModal() {
        this.isDeleteModalOpen = false;
    }
}

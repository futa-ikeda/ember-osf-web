import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class CollectionsModerationModeratorsController extends Controller {
    @action
    afterSelfRemoval() {
        window.location.assign(`/collections/${this.model.id}/`);
    }
}

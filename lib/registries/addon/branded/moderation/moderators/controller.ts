import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class BrandedModerationModeratorsController extends Controller {
    @action
    afterSelfRemoval() {
        window.location.assign(`/registries/${this.model.id}/`);
    }
}

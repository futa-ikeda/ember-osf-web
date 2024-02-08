import { getOwner, setOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

import NodeModel from 'ember-osf-web/models/node';
import CurrentUserService from 'ember-osf-web/services/current-user';
import UserReferenceModel from 'ember-osf-web/models/user-reference';
import ResourceReferenceModel from 'ember-osf-web/models/resource-reference';
import ConfiguredStorageAddonModel from 'ember-osf-web/models/configured-storage-addon';
import AuthorizedStorageAccountModel from 'ember-osf-web/models/authorized-storage-account';
import ExternalStorageServiceModel from 'ember-osf-web/models/external-storage-service';

export default class Provider {
    @tracked node: NodeModel;
    @tracked serviceNode?: ResourceReferenceModel;

    currentUser: CurrentUserService;
    @tracked userReference!: UserReferenceModel;
    provider: ExternalStorageServiceModel;

    @tracked configuredStorageAddon?: ConfiguredStorageAddonModel;
    @tracked authorizedStorageAccount?: AuthorizedStorageAccountModel;
    @tracked authorizedStorageAccounts?: AuthorizedStorageAccountModel[];

    @service store!: Store;

    get isConfigured() {
        return Boolean(this.configuredStorageAddon);
    }

    constructor(provider: any, currentUser: CurrentUserService, node: NodeModel) {
        setOwner(this, getOwner(node));
        this.node = node;
        this.currentUser = currentUser;
        this.provider = provider;
        taskFor(this.initialize).perform();
    }

    @task
    @waitFor
    async initialize() {
        await taskFor(this.getUserReference).perform();
        await taskFor(this.getResourceReference).perform();
        await taskFor(this.getConfiguredStorageAddon).perform();
    }

    @task
    @waitFor
    async getUserReference() {
        const userReference = this.store.peekRecord('user-reference', this.currentUser.user?.id);
        if (userReference) {
            this.userReference = userReference;
        } else {
            this.userReference = await this.store.findRecord('user-reference', this.currentUser.user?.id);
        }
    }

    @task
    @waitFor
    async getResourceReference() {
        const serviceNode = this.store.peekRecord('resource-reference', this.node.id);
        if (serviceNode) {
            this.serviceNode = serviceNode;
        } else {
            this.serviceNode = await this.store.findRecord('resource-reference', this.node.id);
        }
    }

    @task
    @waitFor
    async getConfiguredStorageAddon() {
        if (this.serviceNode) {
            const configuredStorageAddons = await this.serviceNode.queryHasMany('configuredStorageAddons', {
                'filter[storageProvider]': this.provider.id,
            });
            if(configuredStorageAddons.length > 0){
                this.configuredStorageAddon = configuredStorageAddons[0];
            }
        }
    }

    @task
    @waitFor
    async getAuthorizedStorageAccounts() {
        if (this.userReference){
            this.authorizedStorageAccounts = await this.userReference.queryHasMany('authorizedStorageAccounts', {
                'filter[storageProvider]': this.provider.id,
            });
        }
    }

    async userAddonAccounts() {
        return await this.userReference.authorizedStorageAccounts;
    }

    @task
    @waitFor
    async createAccountForNodeAddon() {
        const account = this.store.createRecord('authorized-storage-account', {
            externalUserId: this.currentUser.user?.id,
            scopes: [],
            storageProvider: this.provider,
            configuringUser: this.userReference,
        });
        await account.save();
        return account;
    }

    @task
    @waitFor
    async createConfiguredStorageAddon() {
        if (!this.configuredStorageAddon) {
            const configuredStorageAddon = this.store.createRecord('configured-storage-addon', {
                rootFolder: '',
                storageProvider: this.provider,
                accountOwner: this.userReference,
                authorizedResource: this.serviceNode,
            });
            await configuredStorageAddon.save();
            this.configuredStorageAddon = configuredStorageAddon;
        }
    }

    @task
    @waitFor
    async setNodeAddonCredentials(account: AuthorizedStorageAccountModel) {
        if (this.configuredStorageAddon) {
            this.configuredStorageAddon.set('baseAccount', account);
        }
    }

    @task
    @waitFor
    async disableProjectAddon() {
        if (this.configuredStorageAddon) {
            await this.configuredStorageAddon.destroyRecord();
            this.configuredStorageAddon = undefined;
        }
    }

    listOfFolders() {
        // TODO
        return;
    }

    @task
    @waitFor
    async setRootFolder(newRootFolder: string) {
        if (this.configuredStorageAddon) {
            this.configuredStorageAddon.rootFolder = newRootFolder;
            await this.configuredStorageAddon.save();
        }
    }
}

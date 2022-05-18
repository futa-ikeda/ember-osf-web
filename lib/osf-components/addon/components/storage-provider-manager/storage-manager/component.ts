import { assert } from '@ember/debug';
import { action, notifyPropertyChange } from '@ember/object';
import { waitFor } from '@ember/test-waiters';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import FileProviderModel from 'ember-osf-web/models/file-provider';
import { FileSortKey } from 'ember-osf-web/packages/files/file';
import File from 'ember-osf-web/packages/files/file';
import ProviderFile from 'ember-osf-web/packages/files/provider-file';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import CurrentUserService from 'ember-osf-web/services/current-user';
import AbstractNodeModel from 'ember-osf-web/models/abstract-node';
import DraftNode from 'ember-osf-web/models/draft-node';

import BitbucketProviderFile from 'ember-osf-web/packages/files/bitbucket-provider-file';
import BoxProviderFile from 'ember-osf-web/packages/files/box-provider-file';
import DataverseProviderFile from 'ember-osf-web/packages/files/dataverse-provider-file';
import DropboxProviderFile from 'ember-osf-web/packages/files/dropbox-provider-file';
import FigshareProviderFile from 'ember-osf-web/packages/files/figshare-provider-file';
import GithubProviderFile from 'ember-osf-web/packages/files/github-provider-file';
import GitlabProviderFile from 'ember-osf-web/packages/files/gitlab-provider-file';
import GoogleDriveProviderFile from 'ember-osf-web/packages/files/google-drive-provider-file';
import OneDriveProviderFile from 'ember-osf-web/packages/files/one-drive-provider-file';
import OsfStorageProviderFile from 'ember-osf-web/packages/files/osf-storage-provider-file';
import OwnCloudProviderFile from 'ember-osf-web/packages/files/own-cloud-provider-file';
import S3ProviderFile from 'ember-osf-web/packages/files/s3-provider-file';


interface Args {
    provider: FileProviderModel;
}

export function getStorageProviderFile(currentUser: CurrentUserService, providerFileModel: FileProviderModel) {
    const providerName = providerFileModel.provider;
    let providerFile;
    switch (providerName) {
    case 'bitbucket':
        providerFile = new BitbucketProviderFile(currentUser, providerFileModel);
        break;
    case 'box':
        providerFile = new BoxProviderFile(currentUser, providerFileModel);
        break;
    case 'dataverse':
        providerFile = new DataverseProviderFile(currentUser, providerFileModel);
        break;
    case 'dropbox':
        providerFile = new DropboxProviderFile(currentUser, providerFileModel);
        break;
    case 'figshare':
        providerFile = new FigshareProviderFile(currentUser, providerFileModel);
        break;
    case 'github':
        providerFile = new GithubProviderFile(currentUser, providerFileModel);
        break;
    case 'gitlab':
        providerFile = new GitlabProviderFile(currentUser, providerFileModel);
        break;
    case 'googledrive':
        providerFile = new GoogleDriveProviderFile(currentUser, providerFileModel);
        break;
    case 'onedrive':
        providerFile = new OneDriveProviderFile(currentUser, providerFileModel);
        break;
    case 'osfstorage':
        providerFile = new OsfStorageProviderFile(currentUser, providerFileModel);
        break;
    case 'owncloud':
        providerFile = new OwnCloudProviderFile(currentUser, providerFileModel);
        break;
    case 's3':
        providerFile = new S3ProviderFile(currentUser, providerFileModel);
        break;
    default:
        // This should only be hit in development when we haven't set up a provider properly.
    }
    return providerFile as ProviderFile;
}

export default class StorageManager extends Component<Args> {
    @service currentUser!: CurrentUserService;
    @service router!: RouterService;

    @tracked targetNode?: AbstractNodeModel | DraftNode;
    @tracked storageProvider?: FileProviderModel;
    @tracked folderLineage: Array<File | ProviderFile> = [];
    @tracked displayItems: File[] = [];
    @tracked filter = '';
    @tracked sort = FileSortKey.AscName;
    @tracked currentPage = 1;

    @tracked baseSelectedFile?: File;
    @tracked selectedFiles: File[] = [];

    constructor(owner: unknown, args: Args) {
        super(owner, args);
        assert('@provider must be provided', this.args.provider);
        this.targetNode = this.args.provider.target.content;
        taskFor(this.getRootFolderItems).perform();
    }

    get rootFolder() {
        return this.folderLineage[0];
    }

    get currentFolder() {
        return this.folderLineage[this.folderLineage.length - 1];
    }

    get parentFolder() {
        return this.folderLineage[this.folderLineage.length - 2];
    }

    get hasMore() {
        if (this.currentFolder && this.currentFolder.totalFileCount) {
            return this.currentFolder.totalFileCount > this.displayItems.length;
        }
        return undefined;
    }

    @restartableTask
    @waitFor
    async getRootFolderItems() {
        await taskFor(this.getRootFolder).perform();
        await taskFor(this.getCurrentFolderItems).perform();
    }

    @restartableTask
    @waitFor
    async getRootFolder() {
        if (this.args.provider) {
            this.storageProvider = this.args.provider;
            const providerFile = getStorageProviderFile(this.currentUser, this.storageProvider);
            if (!providerFile) {
                // This should only be hit in development when we haven't set up a provider properly.
                this.router.transitionTo('not-found');
            }
            this.folderLineage.push(providerFile);
            notifyPropertyChange(this, 'folderLineage');
        }
    }

    @restartableTask
    @waitFor
    async getCurrentFolderItems() {
        if (this.currentFolder) {
            if(this.currentPage === 1){
                this.displayItems = [];
            }
            const items = await this.currentFolder.getFolderItems(this.currentPage, this.sort, this.filter);
            this.displayItems.push(...items);
            notifyPropertyChange(this, 'displayItems');
        }
    }

    @restartableTask
    @waitFor
    async changeFilter(filter: string) {
        await timeout(500);
        this.filter = filter;
        this.currentPage = 1;
        taskFor(this.getCurrentFolderItems).perform();
    }

    @action
    goToFolder(folder: File) {
        this.filter = '';
        const index = this.folderLineage.indexOf(folder);
        if (index >= 0) {
            this.folderLineage.splice(index + 1);
        } else {
            this.folderLineage.push(folder);
        }
        notifyPropertyChange(this, 'folderLineage');
        this.deselectFiles();
        this.displayItems = [];
        this.currentPage = 1;
        taskFor(this.getCurrentFolderItems).perform();
    }

    @task
    @waitFor
    async createNewFolder(newFolderName: string) {
        await this.currentFolder.createFolder(newFolderName);
        this.reload();
    }

    @action
    reload() {
        this.deselectFiles();
        this.displayItems = [];
        this.currentPage = 1;
        taskFor(this.getCurrentFolderItems).perform();
    }

    @action
    changeSort(sort: FileSortKey) {
        this.sort = sort;
        this.currentPage = 1;
        taskFor(this.getCurrentFolderItems).perform();
    }

    @action
    loadMore() {
        this.currentPage += 1;
        taskFor(this.getCurrentFolderItems).perform();
    }

    @action
    selectFile(file: File, event: PointerEvent) {
        if (document.getSelection()) {
            document.getSelection()!.removeAllRanges();
        }
        if (event.shiftKey && this.baseSelectedFile) {
            const fileIndex = this.displayItems.indexOf(file);
            const baseIndex = this.displayItems.indexOf(this.baseSelectedFile);
            const from = Math.min(fileIndex, baseIndex);
            const to = Math.max(fileIndex, baseIndex) + 1;
            this.selectedFiles = this.displayItems.slice(from, to);
        } else {
            this.baseSelectedFile = file;
            if (this.selectedFiles.includes(file)) {
                this.selectedFiles.removeObject(file);
            } else {
                this.selectedFiles.pushObject(file);
            }
        }
    }

    @action
    deselectFiles() {
        this.selectedFiles = [];
        this.baseSelectedFile = undefined;
    }
}

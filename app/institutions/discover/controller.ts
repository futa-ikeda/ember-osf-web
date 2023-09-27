import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import CurrentUser from 'ember-osf-web/services/current-user';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { Filter, OnSearchParams, ResourceTypeFilterValue } from 'osf-components/components/search-page/component';

export default class InstitutionDiscoverController extends Controller {
    @service currentUser!: CurrentUser;

    @tracked q?: string = '';
    @tracked sort?: string =  '-relevance';
    @tracked resourceType?: ResourceTypeFilterValue | null = null;
    @tracked activeFilters?: Filter[] = [];

    queryParams = ['q', 'sort', 'resourceType', 'activeFilters'];

    get defaultQueryOptions() {
        const identifiers = [this.model.rorIri, this.model.iri, this.model.links.iri].filter(Boolean).join(',');
        return {
            'affiliation,creator.affiliation,isContainedby.affiliation': identifiers,
        };
    }

    @action
    onSearch(queryOptions: OnSearchParams) {
        this.q = queryOptions.cardSearchText;
        this.sort = queryOptions.sort;
        this.resourceType = queryOptions.resourceType;
        this.activeFilters = queryOptions.activeFilters;
    }
}

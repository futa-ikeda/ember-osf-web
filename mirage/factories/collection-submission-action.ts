import { association, Factory, ModelInstance, Server } from 'ember-cli-mirage';

import { CollectionSubmissionReviewStates } from 'ember-osf-web/models/collection-submission';
import CollectionSubmissionAction,
{
    CollectionSubmissionActionTrigger,
} from 'ember-osf-web/models/collection-submission-action';


/**
 * MirageCollectionSubmissionAction
 *
 * @description Used to extend the CollectionSubmissionAction model to provide
 * additional functionality for automatically building the collection
 * submission action
 */
export interface MirageCollectionSubmissionAction extends CollectionSubmissionAction {
    /**
     * The reviewsState of the collection submission review state of the
     * target
     */
    reviewsState: CollectionSubmissionReviewStates;
    /**
     * The isAutogenerated determines if the collection submission action is
     * generated by the collection submission parent or by an explicit call.
     */
    isAutogenerated: boolean;
    /**
     * The isAdminRemove determines if the collection submission resubmit
     * actionTrigger's fromState is from the removal of admin project or
     * collection moderator.
     */
    isAdminRemove: boolean;
}

export default Factory.extend<MirageCollectionSubmissionAction>({
    auto: false,
    visible: true,
    creator: association() as CollectionSubmissionAction['creator'],
    target: association() as CollectionSubmissionAction['target'],
    afterCreate(collectionSubmissionAction: ModelInstance<MirageCollectionSubmissionAction>, server: Server) {
        if (!collectionSubmissionAction.dateCreated) {
            collectionSubmissionAction.update({dateCreated: getMinusDate(5)});
        }

        if (!collectionSubmissionAction.dateModified) {
            collectionSubmissionAction.update({
                dateModified: getAddedDate(
                    3, new Date(collectionSubmissionAction.dateCreated),
                ),
            });
        }

        if (collectionSubmissionAction.isAutogenerated) {
            /**
             * Accepted
             */
            if(collectionSubmissionAction.actionTrigger === CollectionSubmissionActionTrigger.Accept) {
                if (!collectionSubmissionAction.comment) {
                    collectionSubmissionAction.update({comment: 'I really love this project.'});
                }
                collectionSubmissionAction.update({fromState: CollectionSubmissionReviewStates.Pending});

                collectionSubmissionAction.update({toState: CollectionSubmissionReviewStates.Accepted});

                addPendingAction(
                    server,
                    collectionSubmissionAction,
                    getMinusDate(
                        10, new Date(collectionSubmissionAction.dateCreated),
                    ),
                );
            /**
             * Rejected
             */
            } else if(collectionSubmissionAction.actionTrigger === CollectionSubmissionActionTrigger.Reject) {
                collectionSubmissionAction.update({fromState: CollectionSubmissionReviewStates.Pending});

                collectionSubmissionAction.update({toState: CollectionSubmissionReviewStates.Rejected});

                addPendingAction(
                    server,
                    collectionSubmissionAction,
                    getMinusDate(
                        10, new Date(collectionSubmissionAction.dateCreated),
                    ),
                );
            /**
             * Admin Removed
             */
            } else if(collectionSubmissionAction.actionTrigger === CollectionSubmissionActionTrigger.AdminRemove) {
                collectionSubmissionAction.update({comment: 'I am making my project private'});

                collectionSubmissionAction.update({fromState: CollectionSubmissionReviewStates.Accepted});

                collectionSubmissionAction.update({toState: CollectionSubmissionReviewStates.Removed});

                addPendingAction(
                    server,
                    collectionSubmissionAction,
                    getMinusDate(
                        20, new Date(collectionSubmissionAction.dateCreated),
                    ),
                );

                server.create('collection-submission-action', {
                    actionTrigger: CollectionSubmissionActionTrigger.Accept,
                    target: collectionSubmissionAction.target,
                    creator: collectionSubmissionAction.creator,
                    comment: collectionSubmissionAction.comment,
                    dateCreated: getMinusDate(10, new Date(collectionSubmissionAction.dateCreated)),
                    isAutogenerated: true,
                });
            /**
             * Collection Moderator Removed
             */
            } else if(collectionSubmissionAction.actionTrigger === CollectionSubmissionActionTrigger.ModeratorRemove) {
                collectionSubmissionAction.update({comment: 'This project is no longer relevant'});

                collectionSubmissionAction.update({fromState: CollectionSubmissionReviewStates.Accepted});

                collectionSubmissionAction.update({toState: CollectionSubmissionReviewStates.Removed});

                addPendingAction(
                    server,
                    collectionSubmissionAction,
                    getMinusDate(
                        20, new Date(collectionSubmissionAction.dateCreated),
                    ),
                );

                server.create('collection-submission-action', {
                    actionTrigger: CollectionSubmissionActionTrigger.Accept,
                    target: collectionSubmissionAction.target,
                    creator: collectionSubmissionAction.creator,
                    comment: collectionSubmissionAction.comment,
                    dateCreated: getMinusDate(10, new Date(collectionSubmissionAction.dateCreated)),
                    isAutogenerated: true,
                });
            /**
             * Project re-submit
             */
            } else if(collectionSubmissionAction.actionTrigger === CollectionSubmissionActionTrigger.Resubmit) {
                let fromState: CollectionSubmissionReviewStates;
                let preSubmitActionTrigger: CollectionSubmissionActionTrigger;

                if (collectionSubmissionAction.reviewsState === CollectionSubmissionReviewStates.Removed) {
                    preSubmitActionTrigger = CollectionSubmissionActionTrigger.Accept;
                    fromState = CollectionSubmissionReviewStates.Removed;
                    const actionTrigger = collectionSubmissionAction.isAdminRemove ?
                        CollectionSubmissionActionTrigger.AdminRemove :
                        CollectionSubmissionActionTrigger.ModeratorRemove;
                    collectionSubmissionAction.update({actionTrigger});
                } else {
                    preSubmitActionTrigger = CollectionSubmissionActionTrigger.Reject;
                    fromState = CollectionSubmissionReviewStates.Rejected;
                    collectionSubmissionAction.update({actionTrigger: CollectionSubmissionActionTrigger.Reject});

                }

                collectionSubmissionAction.update({comment: collectionSubmissionAction.comment});

                collectionSubmissionAction.update({fromState});

                collectionSubmissionAction.update({toState: CollectionSubmissionReviewStates.Pending });

                addPendingAction(
                    server,
                    collectionSubmissionAction,
                    getMinusDate(
                        20, new Date(collectionSubmissionAction.dateCreated),
                    ),
                );

                server.create('collection-submission-action', {
                    actionTrigger: preSubmitActionTrigger,
                    target: collectionSubmissionAction.target,
                    creator: collectionSubmissionAction.creator,
                    comment: collectionSubmissionAction.comment,
                    dateCreated: getMinusDate(10, new Date(collectionSubmissionAction.dateCreated)),
                    isAutogenerated: true,
                });
            /**
             * Project submit
             */
            } else if(collectionSubmissionAction.actionTrigger === CollectionSubmissionActionTrigger.Submit) {
                collectionSubmissionAction.update({fromState: CollectionSubmissionReviewStates.InProgress});

                collectionSubmissionAction.update({toState: CollectionSubmissionReviewStates.Pending});

            }
        } else {
            /**
             * This is for non-autogenerated (manual) collection submission action
             */
            collectionSubmissionAction.update({comment: collectionSubmissionAction.comment});

            collectionSubmissionAction.update({actionTrigger: collectionSubmissionAction.actionTrigger });

            collectionSubmissionAction.update({fromState: collectionSubmissionAction.fromState});

            collectionSubmissionAction.update({toState: collectionSubmissionAction.toState});

        }
    },
});

declare module 'ember-cli-mirage/types/registries/model' {
    export default interface MirageModelRegistry {
        'collection-submission-action': MirageCollectionSubmissionAction;
    } // eslint-disable-line semi
}

declare module 'ember-cli-mirage/types/registries/schema' {
    export default interface MirageSchemaRegistry {
        'collection-submission-action': MirageCollectionSubmissionAction;
    } // eslint-disable-line semi
}

/**
 * getMinusDate
 *
 * @description: A function to subtract a number of days from either now() or the passed in date
 * @param days The days to subtracted
 * @param currentDate The optional date to subtract from. Default is now()
 *
 * @returns a new date based on the days minused
 */
function getMinusDate(days: number, currentDate?: Date): Date {
    if (!currentDate) {
        currentDate = new Date(Date.now());
    }
    return new Date(Date.now() - 60 * 60 * 24 * days * 1000);
}

/**
 * getAddedDate
 *
 * @description: A function to add a number of days from either now() or the passed in date
 * @param days The days to add
 * @param currentDate The optional date to add to. Default is now()
 *
 * @returns a new date based on the days added
 */
function getAddedDate(days: number, currentDate?: Date): Date {
    if (!currentDate) {
        currentDate = new Date(Date.now());
    }
    return new Date(
        currentDate.getTime() + 60 * 60 * 24 * days * 1000,
    );
}

/**
 * addPendingAction
 *
 * @description: An abstracted function to add a pending collection submission action
 * @param server The mirage server
 * @param collectionSubmissionAction The original collection submission action
 * @param dateCreated The date to create the action
 *
 * @returns a new date based on the days added
 */
function addPendingAction(
    server: Server,
    collectionSubmissionAction: ModelInstance<MirageCollectionSubmissionAction>,
    dateCreated: Date,
): void {
    server.create('collection-submission-action', {
        actionTrigger: CollectionSubmissionActionTrigger.Submit,
        target: collectionSubmissionAction.target,
        creator: collectionSubmissionAction.creator,
        dateCreated,
        isAutogenerated: true,
    });
}

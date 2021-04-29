import { t } from "ttag";

export function nonPersonalCollection(collection) {
  // @TODO - should this be an API thing?
  return !collection.personal_owner_id && !collection.archived;
}

// Replace the name for the current user's collection
// @Question - should we just update the API to do this?
function preparePersonalCollection(c) {
  return {
    ...c,
    name: t`Your personal collection`,
  };
}

// get the top level collection that matches the current user ID
export function currentUserPersonalCollections(collectionList, userID) {
  return collectionList
    .filter(l => l.personal_owner_id === userID)
    .map(preparePersonalCollection);
}

export function getParentPersonalCollection(collectionId, collectionById) {
  const targetCollection = collectionById[collectionId];
  if (targetCollection.personal_owner_id) {
    return [targetCollection];
  }
  const parent = targetCollection.effective_ancestors.find(ancestor => {
    const collection = collectionById[ancestor.id];
    return collection && collection.personal_owner_id;
  });
  return [collectionById[parent.id]];
}

export function isAnotherUsersPersonalCollection(
  collectionId,
  collectionById,
  userId,
) {
  const targetCollection = collectionById[collectionId];
  if (!targetCollection) {
    return false;
  }
  if (targetCollection.personal_owner_id) {
    return targetCollection.personal_owner_id !== userId;
  }
  if (!Array.isArray(targetCollection.effective_ancestors)) {
    return false;
  }
  return targetCollection.effective_ancestors.some(ancestor => {
    if (ancestor.id === "root") {
      return false;
    }
    const collection = collectionById[ancestor.id];
    return (
      collection.personal_owner_id && collection.personal_owner_id !== userId
    );
  });
}

export function getParentPath(collections, targetId) {
  if (collections.length === 0) {
    return null; // not found!
  }

  for (const collection of collections) {
    if (collection.id === targetId) {
      return [collection.id]; // we found it!
    }
    if (collection.children) {
      const path = getParentPath(collection.children, targetId);
      if (path !== null) {
        // we found it under this collection
        return [collection.id, ...path];
      }
    }
  }
  return null; // didn't find it under any collection
}

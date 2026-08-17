export type DeleteResult = {
  databaseDeleted: boolean;
  storageCleanupSucceeded: boolean;
  cleanupErrors: string[];
};

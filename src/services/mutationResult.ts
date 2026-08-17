export type MutationResult<T> = {
  data: T;
  databaseSucceeded: true;
  storageCleanupSucceeded: boolean;
  cleanupErrors: string[];
};

export type BatchCreateResult<T> =
  | {
      status: 'confirmed';
      data: T[];
      confirmedUrls: string[];
    }
  | {
      status: 'uncertain';
      data: T[];
      confirmedUrls: string[];
      unconfirmedUrls: string[];
      message: string;
    };

export type CleanupResult = {
  cleanedUrls: string[];
  failedUrls: string[];
  errors: string[];
};

export interface AddPrerequisiteResult {
  success: boolean;
  error?: 'cycle' | 'not_found';
}

export interface PublishOutcomeResult {
  success: boolean;
  error?: 'not_found' | 'unpublished_prerequisite';
  /** error === 'unpublished_prerequisite' olduğunda, yayınlanmamış önkoşulların id listesi. */
  unpublishedPrerequisiteIds?: string[];
}

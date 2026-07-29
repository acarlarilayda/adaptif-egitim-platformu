export interface PublishQuestionResult {
  success: boolean;
  error?: 'not_found' | 'already_published';
}